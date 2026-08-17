import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { formatModelProviderApprovalTarget } from "./agentic-approval-targets";
import { formatAgenticRolloutStatus, getAgenticRolloutConfig } from "./agentic-rollout";
import {
  approvalActions,
  findLatestApprovalRecord,
  listApprovals,
  recordApproval,
  recordApprovalDenial,
  type ApprovalAction,
} from "./approval-gate";
import { loadLocalEnv } from "./env";
import {
  assertHumanReviewGate,
  humanReviewGateTitles,
  humanReviewGates,
  recordHumanReview,
} from "./human-review-gate";
import { parseUserIntent, type ParsedIntent } from "./intent-parser";
import { archiveWorkflowRun, cleanupTempOutputs, formatArchiveWorkflowRunResult, formatCleanupTempResult } from "./output-lifecycle";
import { formatWorkflowOutputsGuide, formatWorkflowRunInspection, formatWorkflowRunList, inspectWorkflowRun, listWorkflowRuns } from "./output-metadata";
import { formatOutputsRegistrySync, syncOutputsRegistry } from "./outputs-registry";
import { formatSkillUsageInspection, inspectSkillUsage } from "./skill-usage";
import { buildWorkflowMap, formatWorkflowMap } from "./workflow-map";
import { getWorkflowEngineStatus, rerunWorkflowStage, resumeWorkflowEngine, startWorkflowEngine } from "./workflow-engine";
import { workflowScales, workflowStages, type WorkflowScale } from "./workflow-stages";
import type { WorkflowExecutionMode } from "./workflow-state";

const explicitWorkflowCommands = new Set([
  "start",
  "resume",
  "status",
  "intent",
  "list",
  "inspect",
  "outputs",
  "skills",
  "map",
  "cleanup-temp",
  "archive",
  "registry-sync",
  "run-stage",
  "approve",
  "deny",
  "human-review",
  "approval-request",
  "approvals",
  "agentic-stages",
  "agentic-readiness",
  "agentic-approval-commands",
  "agentic-preflight",
]);

/**
 * Аргументы каждой команды одной строкой. Это те же `Usage:`, что печатаются при неполном
 * вызове, собранные в один перечень — иначе справки для человека не существует вовсе:
 * `--help` не обрабатывался, и строки жили только внутри отдельных `throw`.
 *
 * Связность с `explicitWorkflowCommands` проверяется машинно
 * (`runtime/typescript/test-workflow-start-guards.ts`): новая команда без строки справки —
 * это команда, о которой человек не узнает.
 */
export const commandUsage: Record<string, string> = {
  start: 'yarn workflow:start "<landing workflow goal>" [--slug <project-slug>] [--mode local|agentic] [--profile standard|reference] [--scale full|increment|patch]',
  resume: "yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>",
  status: "yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>",
  intent: 'yarn workflow:intent "<фраза-триггер>" [--run-dir outputs/<project-slug>/<YYYY-MM-DD>]',
  list: "yarn workflow:list [--base outputs]",
  inspect: "yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>",
  outputs: "yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>",
  skills: "yarn workflow:skills",
  map: "yarn workflow:map",
  "cleanup-temp": "yarn workflow:cleanup-temp [--base outputs/temp] [--force]",
  archive: "yarn workflow:archive outputs/<project-slug>/<YYYY-MM-DD> [--force] [--quarantine] [--target-root outputs/archive]",
  "registry-sync": "yarn workflow:registry-sync [--base outputs] [--force|--fix]",
  "run-stage": "yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> <stage-id> --force",
  approve: "yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> <approval-action> [--target value] [--by name] [--notes text]",
  deny: "yarn workflow:deny outputs/<project-slug>/<YYYY-MM-DD> <approval-action> [--target value] [--by name] [--notes text]",
  "human-review": 'yarn workflow:human-review outputs/<project-slug>/<YYYY-MM-DD> <gate> --notes "что сказал человек" [--shown "ссылка/узел/роут"] [--by name]',
  "approval-request": "yarn workflow:approval-request outputs/<project-slug>/<YYYY-MM-DD> <approval-action> --target <value> [--by name] [--notes text] [--reason text]",
  approvals: "yarn workflow:approvals outputs/<project-slug>/<YYYY-MM-DD>",
  "agentic-stages": "yarn workflow:agentic-stages",
  "agentic-readiness": "yarn workflow:agentic-readiness [outputs/<project-slug>/<YYYY-MM-DD>] [--strict]",
  "agentic-approval-commands": "yarn workflow:agentic-approval-commands outputs/<project-slug>/<YYYY-MM-DD> [--by name] [--missing-only]",
  "agentic-preflight": "yarn workflow:agentic-preflight outputs/<project-slug>/<YYYY-MM-DD> [--by name] [--strict]",
};

/** Флаги справки. Распознаются в любой позиции, до разбора команды. */
const helpFlags = new Set(["--help", "-h"]);

/**
 * Справка по командам движка.
 *
 * Прецедент 2026-08-17: флаг `--help` не обрабатывался, поэтому `yarn workflow:start --help`
 * принимал `--help` за ЦЕЛЬ прогона: заводил каталог `outputs/help/<дата>`, вносил слаг
 * `help` в `outputs/registry.json` и прогонял по нему стадии. На диске нашли два таких
 * прогона — с полностью сгенерированными research-артефактами.
 */
export function formatWorkflowCliHelp(): string {
  const width = Math.max(...Object.keys(commandUsage).map((command) => command.length));
  return [
    "Движок workflow: команды и их аргументы.",
    "",
    ...Object.entries(commandUsage).map(([command, usage]) => `  ${command.padEnd(width)}  ${usage}`),
    "",
    'Вместо команды можно дать триггер-фразу: yarn workflow:intent "<фраза>" [--run-dir outputs/<project-slug>/<YYYY-MM-DD>]',
    "Флаг --help (-h) в любой позиции печатает эту справку и НЕ создаёт ни каталога прогона, ни записи в реестре.",
  ].join("\n");
}

/**
 * Операции движка, которые CLI вызывает как побочный эффект. Вынесены в отдельный слой,
 * чтобы регрессионный тест маршрутизации мог проверить, ЧТО именно вызвала команда, не
 * запуская реальный прогон и не трогая `outputs/`.
 */
export interface WorkflowCliEngine {
  startWorkflowEngine: typeof startWorkflowEngine;
  resumeWorkflowEngine: typeof resumeWorkflowEngine;
  rerunWorkflowStage: typeof rerunWorkflowStage;
  getWorkflowEngineStatus: typeof getWorkflowEngineStatus;
}

const defaultWorkflowCliEngine: WorkflowCliEngine = {
  startWorkflowEngine,
  resumeWorkflowEngine,
  rerunWorkflowStage,
  getWorkflowEngineStatus,
};

export async function runWorkflowCli(
  rawArgs = process.argv.slice(2),
  engine: WorkflowCliEngine = defaultWorkflowCliEngine,
): Promise<void> {
  loadLocalEnv();

  const command = rawArgs[0];
  const rest = rawArgs.slice(1);

  // Справка проверяется ДО разбора команды и до эвристики намерений: `--help` в любой
  // позиции — это запрос справки, а не цель прогона и не фраза-триггер.
  if (rawArgs.some((arg) => helpFlags.has(arg))) {
    console.log(formatWorkflowCliHelp());
    return;
  }

  if (await tryRunIntentCommand(rawArgs, engine)) {
    return;
  }

  if (command === "start") {
    const { mode, profile, scale, slug, args } = parseStartOptions(rest);
    const goal = args.join(" ").trim();
    if (!goal) {
      throw new Error(`Usage: ${commandUsage.start}`);
    }

    const state = await engine.startWorkflowEngine({ goal, slug, executionMode: mode, profile, scale });
    console.log(await engine.getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "resume") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>");
    }

    const state = await engine.resumeWorkflowEngine(resolve(process.cwd(), outputDir));
    console.log(await engine.getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "status") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>");
    }

    console.log(await engine.getWorkflowEngineStatus(resolve(process.cwd(), outputDir)));
    return;
  }

  if (command === "list") {
    const baseDir = readFlagValue(rest, "--base") ?? "outputs";
    console.log(formatWorkflowRunList(await listWorkflowRuns(resolve(process.cwd(), baseDir))));
    return;
  }

  if (command === "inspect") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:inspect outputs/<project-slug>/<YYYY-MM-DD>");
    }

    console.log(formatWorkflowRunInspection(await inspectWorkflowRun(resolve(process.cwd(), outputDir))));
    return;
  }

  if (command === "outputs") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:outputs outputs/<project-slug>/<YYYY-MM-DD>");
    }

    console.log(formatWorkflowOutputsGuide(await inspectWorkflowRun(resolve(process.cwd(), outputDir))));
    return;
  }

  if (command === "skills") {
    console.log(formatSkillUsageInspection(inspectSkillUsage(resolve(process.cwd()))));
    return;
  }

  if (command === "map") {
    console.log(formatWorkflowMap(buildWorkflowMap(resolve(process.cwd()))));
    return;
  }

  if (command === "cleanup-temp") {
    const baseDir = readFlagValue(rest, "--base") ?? "outputs/temp";
    console.log(formatCleanupTempResult(await cleanupTempOutputs({ baseDir, force: rest.includes("--force") })));
    return;
  }

  if (command === "archive") {
    const outputDir = rest.find((item) => !item.startsWith("--"));
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:archive outputs/<project-slug>/<YYYY-MM-DD> [--force] [--quarantine] [--target-root outputs/archive]");
    }

    console.log(formatArchiveWorkflowRunResult(await archiveWorkflowRun({
      outputDir,
      force: rest.includes("--force"),
      quarantine: rest.includes("--quarantine"),
      targetRoot: readFlagValue(rest, "--target-root"),
    })));
    return;
  }

  if (command === "registry-sync") {
    // Сверка `outputs/registry.json` с фактическими каталогами. Без флага только
    // сообщает расхождение и выходит с ненулевым кодом, чтобы рассинхрон был заметен.
    const outputsRoot = readFlagValue(rest, "--base");
    const fix = rest.includes("--force") || rest.includes("--fix");
    const result = await syncOutputsRegistry({ outputsRoot, fix });
    console.log(formatOutputsRegistrySync(result));
    if (!result.in_sync) {
      throw new Error("Outputs registry is out of sync. Re-run with --force to fix.");
    }
    return;
  }

  if (command === "run-stage") {
    const outputDir = rest[0];
    const stageId = rest[1];
    const force = rest.includes("--force");
    if (!outputDir || !stageId) {
      throw new Error("Usage: yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> <stage-id> --force");
    }

    const state = await engine.rerunWorkflowStage(resolve(process.cwd(), outputDir), stageId, { force });
    console.log(await engine.getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "approve") {
    const outputDir = rest[0];
    const action = rest[1] as ApprovalAction | undefined;
    if (!outputDir || !action) {
      throw new Error("Usage: yarn workflow:approve outputs/<project-slug>/<YYYY-MM-DD> <approval-action> [--target value] [--by name] [--notes text]");
    }

    assertApprovalAction(action);
    const parsed = parseApprovalArgs(rest.slice(2));
    await recordApproval(resolve(process.cwd(), outputDir), {
      action,
      approved: true,
      approved_by: parsed.by,
      target: parsed.target,
      notes: parsed.notes,
    });
    console.log(`Approval recorded: ${action}${parsed.target ? ` -> ${parsed.target}` : ""}`);
    return;
  }

  /*
   * ─── ЗАПИСЬ ПОКАЗА ЧЕЛОВЕКУ ───────────────────────────────────────────────
   * Заведено 2026-08-17 по аудиту студии: строки `human_review` не оказалось ни в
   * одном из десяти активных прогонов, хотя валидатор её требует. Проверка была,
   * механизма записи — нет; теперь запись делается командой, а не памятью.
   */
  if (command === "human-review") {
    const outputDir = rest[0];
    const gate = rest[1];
    if (!outputDir || !gate) {
      throw new Error(
        `Usage: yarn workflow:human-review outputs/<project-slug>/<YYYY-MM-DD> <${humanReviewGates.join("|")}> --notes "что сказал человек" [--shown "ссылка/узел/роут"] [--by name]\n` +
          humanReviewGates.map((point) => `  ${point} — ${humanReviewGateTitles[point]}`).join("\n"),
      );
    }

    assertHumanReviewGate(gate);
    const parsed = parseApprovalArgs(rest.slice(2));
    const shownIndex = rest.indexOf("--shown");
    const line = recordHumanReview(resolve(process.cwd(), outputDir), {
      by: parsed.by,
      gate,
      notes: parsed.notes ?? "",
      shown: shownIndex >= 0 ? rest[shownIndex + 1] : undefined,
    });
    console.log(`Показ записан в ledger:\n${line}`);
    return;
  }

  if (command === "deny") {
    const outputDir = rest[0];
    const action = rest[1] as ApprovalAction | undefined;
    if (!outputDir || !action) {
      throw new Error("Usage: yarn workflow:deny outputs/<project-slug>/<YYYY-MM-DD> <approval-action> [--target value] [--by name] [--notes text]");
    }

    assertApprovalAction(action);
    const parsed = parseApprovalArgs(rest.slice(2));
    await recordApprovalDenial(resolve(process.cwd(), outputDir), {
      action,
      approved_by: parsed.by,
      target: parsed.target,
      notes: parsed.notes,
    });
    console.log(`Approval denied: ${action}${parsed.target ? ` -> ${parsed.target}` : ""}`);
    return;
  }

  if (command === "approval-request") {
    const outputDir = rest[0];
    const action = rest[1] as ApprovalAction | undefined;
    if (!outputDir || !action) {
      throw new Error("Usage: yarn workflow:approval-request outputs/<project-slug>/<YYYY-MM-DD> <approval-action> --target <value> [--by name] [--notes text] [--reason text]");
    }

    assertApprovalAction(action);
    const parsed = parseApprovalArgs(rest.slice(2));
    const reason = readFlagValue(rest.slice(2), "--reason");
    const resolvedOutputDir = resolve(process.cwd(), outputDir);
    const decision = await promptApprovalDecision({
      outputDir,
      action,
      target: parsed.target,
      by: parsed.by ?? "human",
      notes: parsed.notes,
      reason,
    });

    if (decision === "cancel") {
      console.log("Approval request cancelled: record was not changed.");
      return;
    }

    if (decision === "approve") {
      await recordApproval(resolvedOutputDir, {
        action,
        approved: true,
        approved_by: parsed.by ?? "human",
        target: parsed.target,
        notes: parsed.notes ?? reason,
      });
      console.log(`Approval recorded: ${action}${parsed.target ? ` -> ${parsed.target}` : ""}`);
      return;
    }

    await recordApprovalDenial(resolvedOutputDir, {
      action,
      approved_by: parsed.by ?? "human",
      target: parsed.target,
      notes: parsed.notes ?? reason,
    });
    console.log(`Approval denied: ${action}${parsed.target ? ` -> ${parsed.target}` : ""}`);
    return;
  }

  if (command === "approvals") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:approvals outputs/<project-slug>/<YYYY-MM-DD>");
    }

    const approvals = await listApprovals(resolve(process.cwd(), outputDir));
    console.log(formatApprovals(approvals));
    return;
  }

  if (command === "agentic-stages") {
    console.log(formatAgenticRolloutStatus());
    return;
  }

  if (command === "agentic-readiness") {
    const strict = rest.includes("--strict");
    const outputDirArg = rest.find((item) => item !== "--strict");
    const outputDir = outputDirArg ? resolve(process.cwd(), outputDirArg) : undefined;
    const readiness = await formatAgenticReadiness(outputDir);
    console.log(readiness.report);
    if (strict && !readiness.strictReady) {
      throw new Error("Agentic readiness strict check failed.");
    }
    return;
  }

  if (command === "agentic-approval-commands") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:agentic-approval-commands outputs/<project-slug>/<YYYY-MM-DD> [--by name] [--missing-only]");
    }

    const by = readFlagValue(rest.slice(1), "--by") ?? "human";
    const missingOnly = rest.includes("--missing-only");
    const resolvedOutputDir = resolve(process.cwd(), outputDir);
    const approvals = missingOnly && existsSync(resolvedOutputDir)
      ? await listApprovals(resolvedOutputDir)
      : undefined;
    const runState = missingOnly && existsSync(join(resolvedOutputDir, "run-state.json"))
      ? readRunStateSummary(resolvedOutputDir)
      : undefined;
    console.log(formatAgenticApprovalCommands(outputDir, by, approvals, runState?.stageStatuses));
    return;
  }

  if (command === "agentic-preflight") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:agentic-preflight outputs/<project-slug>/<YYYY-MM-DD> [--by name] [--strict]");
    }

    const resolvedOutputDir = resolve(process.cwd(), outputDir);
    const by = readFlagValue(rest.slice(1), "--by") ?? "human";
    const strict = rest.includes("--strict");
    const readiness = await formatAgenticReadiness(resolvedOutputDir);
    console.log(await formatAgenticPreflight(resolvedOutputDir, outputDir, by, readiness));
    if (strict && !readiness.strictReady) {
      throw new Error("Agentic preflight strict check failed.");
    }
    return;
  }

  // Перечень команд берётся из `commandUsage`, а не из второй рукописной копии: список в этом
  // сообщении уже отставал от маршрутизации (в нём не было `human-review`).
  throw new Error(
    `Usage: workflow engine command must be one of: ${Object.keys(commandUsage).join(", ")}\n` +
      'Or use a natural trigger phrase via: yarn workflow:intent "<фраза>"\n' +
      "Справка по аргументам каждой команды: yarn workflow:start --help",
  );
}

/**
 * Решение о маршруте CLI: явная команда или распознанное намерение.
 *
 * Правило: **явная команда имеет безусловный приоритет над эвристикой.** Написал `start` —
 * исполняется start, а текст после команды — это ЦЕЛЬ нового прогона, а не фраза для
 * распознавания. Триггер-фразы живут в отдельной команде `intent` (и в вызове без команды).
 *
 * Прецедент 2026-07-30, из-за которого правило появилось: `yarn workflow:start "Редизайн
 * мобильных экранов A3Pay в стиле Ozon Банка" --scale increment` содержал слово «дизайн»,
 * эвристика превратила его в `run-stage 04-design`, и стадия отработала в самом свежем
 * ЧУЖОМ run-каталоге, перезаписав там `design-brief.md` и весь run ledger. Каталог
 * `outputs/` в `.gitignore` — восстановить было нечем.
 */
export type CliRoutePlan =
  | { kind: "explicit"; command: string }
  | { kind: "intent"; intent: ParsedIntent; phrase: string; runDir?: string; fromIntentCommand: boolean }
  | { kind: "unrecognized"; phrase: string; fromIntentCommand: boolean };

export function planCliRoute(rawArgs: string[]): CliRoutePlan {
  const command = rawArgs[0];
  const fromIntentCommand = command === "intent";

  if (command && explicitWorkflowCommands.has(command) && !fromIntentCommand) {
    return { kind: "explicit", command };
  }

  const source = fromIntentCommand ? rawArgs.slice(1) : rawArgs;
  const runDir = readFlagValue(source, "--run-dir");
  const phrase = withoutFlagValue(source, "--run-dir").join(" ").trim();
  if (!phrase) {
    return { kind: "unrecognized", phrase, fromIntentCommand };
  }

  const intent = parseUserIntent(phrase);
  if (!intent || intent.confidence === "low") {
    return { kind: "unrecognized", phrase, fromIntentCommand };
  }

  return { kind: "intent", intent, phrase, runDir, fromIntentCommand };
}

async function tryRunIntentCommand(rawArgs: string[], engine: WorkflowCliEngine): Promise<boolean> {
  const plan = planCliRoute(rawArgs);
  if (plan.kind === "explicit") {
    return false;
  }

  if (plan.kind === "unrecognized") {
    if (!plan.fromIntentCommand) {
      return false;
    }

    throw new Error(
      plan.phrase
        ? `Не удалось распознать намерение в фразе: "${plan.phrase}". Используй явную команду: yarn workflow:start "<цель>", yarn workflow:resume <run-dir>, yarn workflow:run-stage <run-dir> <stage-id> --force.`
        : 'Usage: yarn workflow:intent "<фраза-триггер>" [--run-dir outputs/<project-slug>/<YYYY-MM-DD>]',
    );
  }

  const { intent, phrase } = plan;

  if (intent.command === "start") {
    // Цель прогона из фразы не выводится, а придумывать её за человека нельзя: слаг
    // каталога и `run-plan.md` строятся именно из цели.
    throw new Error(
      `Фраза "${phrase}" распознана как старт нового прогона, но цель прогона в ней не названа. Запусти явно: yarn workflow:start "<цель прогона>" [--scale full|increment|patch].`,
    );
  }

  // Каталог либо назван человеком (--run-dir), либо выведен эвристикой «самый свежий
  // run-state.json». Второй случай обязан быть видимым и подтверждённым: молча писать в
  // каталог, которого человек не называл, — это и есть механизм инцидента 2026-07-30.
  const explicitRunDir = plan.runDir ? resolve(process.cwd(), plan.runDir) : undefined;
  const runDir = explicitRunDir ?? findMostRecentRunDir();
  if (!runDir) {
    throw new Error('Не найден ни один прогон в outputs/. Начни новый: yarn workflow:start "<цель прогона>".');
  }

  const runDirLabel = formatRunDirLabel(runDir);
  const heuristicRunDir = !explicitRunDir;

  if (intent.command === "status") {
    // Чтение статуса ничего не перезаписывает, поэтому подтверждение не требуется —
    // но каталог всё равно печатается, чтобы человек видел, о каком прогоне речь.
    console.log(`[Intent Parser] Распознано намерение: Показать статус прогона (${runDirLabel})${heuristicRunDir ? " — каталог выведен эвристикой" : ""}`);
    console.log(await engine.getWorkflowEngineStatus(runDir));
    return true;
  }

  if (intent.command === "resume") {
    console.log(`[Intent Parser] Распознано намерение: Продолжить прогон (${runDirLabel})`);
    if (heuristicRunDir && !(await confirmHeuristicRunDir(runDirLabel, "resume: продолжить прогон"))) {
      console.log("Отменено: прогон не запускался, каталог не изменён.");
      return true;
    }

    const state = await engine.resumeWorkflowEngine(runDir);
    console.log(await engine.getWorkflowEngineStatus(state.output_dir));
    return true;
  }

  if (intent.command === "run-stage" && intent.stageId) {
    console.log(`[Intent Parser] Распознано намерение: Запустить этап "${intent.stageId}" (${runDirLabel})`);
    if (heuristicRunDir && !(await confirmHeuristicRunDir(runDirLabel, `run-stage ${intent.stageId}`))) {
      console.log("Отменено: этап не запускался, каталог не изменён.");
      return true;
    }

    const state = await engine.rerunWorkflowStage(runDir, intent.stageId, { force: true });
    console.log(await engine.getWorkflowEngineStatus(state.output_dir));
    return true;
  }

  return false;
}

function formatRunDirLabel(runDir: string): string {
  const relativePath = relative(process.cwd(), runDir);
  return relativePath && !relativePath.startsWith("..") ? relativePath : runDir;
}

/**
 * Подтверждение записи в каталог, который вывела эвристика. Без TTY подтверждение получить
 * негде, поэтому действие не выполняется вовсе: пусть человек назовёт каталог явно, чем
 * стадия перезапишет артефакты постороннего прогона.
 */
async function confirmHeuristicRunDir(runDirLabel: string, action: string): Promise<boolean> {
  const explicitHint = [
    `Каталог прогона не назван человеком — он выведен эвристикой (самый свежий run-state.json в outputs/): ${runDirLabel}.`,
    `Действие '${action}' перезаписывает артефакты этого каталога.`,
    'Укажи каталог явно: yarn workflow:intent "<фраза>" --run-dir outputs/<project-slug>/<YYYY-MM-DD>',
    "или используй yarn workflow:run-stage / yarn workflow:resume с явным путём.",
  ].join(" ");

  if (!input.isTTY) {
    throw new Error(`Подтверждение целевого каталога невозможно: нет TTY. ${explicitHint}`);
  }

  console.log("");
  console.log("=== Подтверждение целевого каталога ===");
  console.log(`Действие: ${action}`);
  console.log(`Каталог: ${runDirLabel}`);
  console.log("Каталог выведен эвристикой (самый свежий run-state.json в outputs/), а не назван тобой.");
  console.log("Стадия перезапишет артефакты именно в нём.");
  console.log("");

  const rl = createInterface({ input, output });
  try {
    while (true) {
      const answer = (await rl.question("Выполнить в этом каталоге? [y/n]: ")).trim().toLowerCase();
      if (["y", "yes", "да", "д"].includes(answer)) {
        return true;
      }
      if (["n", "no", "нет", "н"].includes(answer)) {
        return false;
      }
      console.log("Введите y или n.");
    }
  } finally {
    rl.close();
  }
}

function findMostRecentRunDir(baseDir: string = resolve(process.cwd(), "outputs")): string | null {
  if (!existsSync(baseDir)) {
    return null;
  }

  let mostRecentDir: string | null = null;
  let mostRecentMtime = 0;

  function traverse(dir: string) {
    if (existsSync(join(dir, "run-state.json"))) {
      try {
        const mtime = statSync(join(dir, "run-state.json")).mtimeMs;
        if (mtime > mostRecentMtime) {
          mostRecentMtime = mtime;
          mostRecentDir = dir;
        }
      } catch {
        // Ignore unreadable run metadata.
      }
      return;
    }

    try {
      const items = readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && item.name !== "node_modules" && item.name !== ".git") {
          traverse(join(dir, item.name));
        }
      }
    } catch {
      // Ignore unreadable directories.
    }
  }

  traverse(baseDir);
  return mostRecentDir;
}

function parseStartOptions(args: string[]): {
  mode: WorkflowExecutionMode;
  profile?: "standard" | "reference";
  scale?: WorkflowScale;
  slug?: string;
  args: string[];
} {
  let parsedArgs = args;
  const modeIndex = args.indexOf("--mode");
  let mode: WorkflowExecutionMode = "local";
  if (modeIndex >= 0) {
    const rawMode = args[modeIndex + 1];
    if (rawMode !== "local" && rawMode !== "agentic") {
      throw new Error("Execution mode must be one of: local, agentic.");
    }
    mode = rawMode;
    parsedArgs = parsedArgs.filter((_, index) => index !== modeIndex && index !== modeIndex + 1);
  }

  const profileIndex = parsedArgs.indexOf("--profile");
  let profile: "standard" | "reference" | undefined;
  if (profileIndex >= 0) {
    const rawProfile = parsedArgs[profileIndex + 1];
    if (rawProfile !== "standard" && rawProfile !== "reference") {
      throw new Error("Workflow profile must be one of: standard, reference.");
    }
    profile = rawProfile;
    parsedArgs = parsedArgs.filter((_, index) => index !== profileIndex && index !== profileIndex + 1);
  }

  const scaleIndex = parsedArgs.indexOf("--scale");
  let scale: WorkflowScale | undefined;
  if (scaleIndex >= 0) {
    const rawScale = parsedArgs[scaleIndex + 1];
    if (!workflowScales.includes(rawScale as WorkflowScale)) {
      throw new Error(`Workflow scale must be one of: ${workflowScales.join(", ")}.`);
    }
    scale = rawScale as WorkflowScale;
    parsedArgs = parsedArgs.filter((_, index) => index !== scaleIndex && index !== scaleIndex + 1);
  }

  // Явный слаг каталога прогона. Нужен там, где из цели его вывести нельзя: транслитерации
  // нет, и на русской цели от строки остаются одни цифры (прогон 2026-08-17 получил слаг `3`
  // из «Веб-флоу кабинета А3: создание счёта…»). Формат проверяет `resolveRunSlug` — один
  // предохранитель на оба входа, CLI и `landing:run`.
  const slugIndex = parsedArgs.indexOf("--slug");
  let slug: string | undefined;
  if (slugIndex >= 0) {
    const rawSlug = parsedArgs[slugIndex + 1];
    if (!rawSlug || rawSlug.startsWith("--")) {
      throw new Error(`Флаг --slug требует значение. Usage: ${commandUsage.start}`);
    }
    slug = rawSlug;
    parsedArgs = parsedArgs.filter((_, index) => index !== slugIndex && index !== slugIndex + 1);
  }

  return { mode, profile, scale, slug, args: parsedArgs };
}

function parseApprovalArgs(args: string[]): { target?: string; by?: string; notes?: string } {
  return {
    target: readFlagValue(args, "--target"),
    by: readFlagValue(args, "--by"),
    notes: readFlagValue(args, "--notes"),
  };
}

async function promptApprovalDecision(request: {
  outputDir: string;
  action: ApprovalAction;
  target?: string;
  by: string;
  notes?: string;
  reason?: string;
}): Promise<"approve" | "deny" | "cancel"> {
  if (!input.isTTY) {
    throw new Error("Interactive approval request requires a TTY. Use workflow:approve or workflow:deny only after explicit human approval.");
  }

  const lines = [
    "",
    "=== Approval Request ===",
    `Run: ${request.outputDir}`,
    `Action: ${request.action}`,
    `Target: ${request.target ?? "not set"}`,
    `Approved by: ${request.by}`,
    request.reason ? `Reason: ${request.reason}` : undefined,
    request.notes ? `Notes: ${request.notes}` : undefined,
    "",
    "Выберите действие:",
    "1 - Разрешить и записать approval",
    "2 - Запретить и записать denial",
    "3 - Отмена, ничего не записывать",
    "",
  ].filter(Boolean);

  console.log(lines.join("\n"));

  const rl = createInterface({ input, output });
  try {
    while (true) {
      const answer = (await rl.question("Ваш выбор [1/2/3]: ")).trim().toLowerCase();
      if (["1", "y", "yes", "да", "approve", "разрешить"].includes(answer)) {
        return "approve";
      }
      if (["2", "n", "no", "нет", "deny", "запретить"].includes(answer)) {
        return "deny";
      }
      if (["3", "c", "cancel", "отмена"].includes(answer)) {
        return "cancel";
      }
      console.log("Введите 1, 2 или 3.");
    }
  } finally {
    rl.close();
  }
}

function assertApprovalAction(action: string): asserts action is ApprovalAction {
  if (!approvalActions.includes(action as ApprovalAction)) {
    throw new Error(`Unknown approval action '${action}'. Allowed actions: ${approvalActions.join(", ")}`);
  }
}

function formatApprovals(approvals: Awaited<ReturnType<typeof listApprovals>>): string {
  if (!approvals.length) {
    return "Approval records: none";
  }

  return [
    "| Action | Approved | Target | By | Time | Notes |",
    "|---|---|---|---|---|---|",
    ...approvals.map((item) => [
      item.action,
      item.approved ? "yes" : "no",
      item.target ?? "",
      item.approved_by ?? "",
      item.approved_at ?? "",
      item.notes ?? "",
    ].map(formatTableCell).join(" | ")).map((row) => `| ${row} |`),
  ].join("\n");
}

function formatTableCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}

export async function formatAgenticReadiness(outputDir?: string): Promise<{ report: string; ready: boolean; strictReady: boolean; blockers: string[] }> {
  const rollout = getAgenticRolloutConfig();
  const outputDirExists = Boolean(outputDir && existsSync(outputDir));
  const runStateExists = Boolean(outputDir && existsSync(join(outputDir, "run-state.json")));
  const runState = outputDir && runStateExists ? readRunStateSummary(outputDir) : undefined;
  const runStateMode = runState?.executionMode;
  const blockingStages = Object.entries(runState?.stageStatuses ?? {})
    .filter(([, status]) => status === "blocked" || status === "failed")
    .map(([stageId, status]) => `${stageId}:${status}`);
  const isAgenticRun = runStateMode === "agentic";
  const approvals = outputDirExists && outputDir ? await listApprovals(outputDir) : [];
  const hasModelKey = Boolean(process.env.OPENAI_API_KEY);
  const approvalScope = outputDir
    ? outputDirExists
      ? outputDir
      : `не найдено: ${outputDir}`
    : "не проверялось, outputDir не передан";

  const stageRows = rollout.enabledStageIds.map((stageId) => {
    const stage = workflowStages.find((item) => item.id === stageId);
    if (!stage) {
      return [stageId, "unknown", "unknown", "invalid", "invalid stage id"];
    }

    const target = formatModelProviderApprovalTarget(stage);
    const stageStatus = runState?.stageStatuses[stage.id] ?? "unknown";
    const approval = findLatestApprovalRecord(approvals, "model_provider_call", target);
    const approvalState = outputDir
      ? stageStatus === "completed"
        ? "not required (completed)"
        : approval
        ? approval.approved
          ? "approved"
          : "denied"
        : "missing"
      : "not checked";

    return [stage.id, stage.owner, stageStatus, target, approvalState];
  });

  const approvalsReady = Boolean(outputDirExists) && stageRows.every((row) => row[4] === "approved" || row[4] === "not required (completed)");
  const ready = hasModelKey && outputDirExists && runStateExists && isAgenticRun && approvalsReady && rollout.enabledStageIds.length > 0;
  const strictReady = ready && blockingStages.length === 0;
  const report = [
    "# Agentic Readiness",
    "",
    `- Ready: ${ready ? "yes" : "no"}`,
    `- Strict gate: ${strictReady ? "pass" : "fail"}`,
    `- OPENAI_API_KEY: ${hasModelKey ? "configured" : "missing"}`,
    `- Workflow run-state: ${outputDir ? runStateExists ? "found" : "missing" : "not checked"}`,
    `- Workflow execution mode: ${outputDir ? runStateMode ?? "unknown" : "not checked"}`,
    `- Blocking stages: ${blockingStages.join(", ") || "none"}`,
    `- Rollout source: ${rollout.source === "env" ? "AGENTIC_ENABLED_STAGES" : "default"}`,
    `- Enabled stages: ${rollout.enabledStageIds.join(", ") || "none"}`,
    `- Ignored invalid stage ids: ${rollout.invalidStageIds.join(", ") || "none"}`,
    `- Approval scope: ${approvalScope}`,
    "",
    "| Stage | Owner | Stage status | Required approval target | Approval |",
    "|---|---|---|---|---|",
    ...stageRows.map((row) => `| ${row.map(formatTableCell).join(" | ")} |`),
  ].join("\n");

  return { report, ready, strictReady, blockers: blockingStages };
}

export function formatAgenticApprovalCommands(
  outputDir: string,
  approvedBy = "human",
  existingApprovals?: Awaited<ReturnType<typeof listApprovals>>,
  stageStatuses: Record<string, string> = {},
): string {
  const rollout = getAgenticRolloutConfig();
  const lines = [
    "# Agentic Approval Commands",
    "",
    "Эти команды только подготавливают ручное подтверждение для model provider calls.",
    "Выполняй их только после осознанного human approval.",
    "",
  ];

  if (!rollout.enabledStageIds.length) {
    return [...lines, "В текущем rollout нет включённых agentic stages."].join("\n");
  }

  let commandCount = 0;

  for (const stageId of rollout.enabledStageIds) {
    const stage = workflowStages.find((item) => item.id === stageId);
    if (!stage) {
      lines.push(`- Skipped invalid stage id: \`${stageId}\``);
      continue;
    }

    const target = formatModelProviderApprovalTarget(stage);
    if (stageStatuses[stage.id] === "completed") {
      continue;
    }

    const existing = existingApprovals
      ? findLatestApprovalRecord(existingApprovals, "model_provider_call", target)
      : undefined;
    if (existing?.approved) {
      continue;
    }

    const notes = `Одобрено для agentic ${stage.id} ${stage.owner} stage`;
    lines.push(
      "```bash",
      [
        "yarn workflow:approve",
        quoteCliArg(outputDir),
        "model_provider_call",
        "--target",
        quoteCliArg(target),
        "--by",
        quoteCliArg(approvedBy),
        "--notes",
        quoteCliArg(notes),
      ].join(" "),
      "```",
      "",
    );
    commandCount++;
  }

  if (commandCount === 0) {
    lines.push("Все включённые agentic stages уже имеют active approvals.", "");
  }

  lines.push("После записи approvals проверь готовность:", "", "```bash", `yarn workflow:agentic-readiness ${quoteCliArg(outputDir)} --strict`, "```");
  return lines.join("\n");
}

export async function formatAgenticPreflight(
  outputDir: string,
  displayOutputDir = outputDir,
  approvedBy = "human",
  readinessResult?: Awaited<ReturnType<typeof formatAgenticReadiness>>,
): Promise<string> {
  const readiness = readinessResult ?? await formatAgenticReadiness(outputDir);
  const sections = [readiness.report, "", "## Next Actions", ""];

  if (readiness.ready) {
    sections.push(
      "Agentic model-provider preflight готов для включённых rollout stages. Если run уже blocked на стадии вне rollout, resume сохранит blocker до расширения rollout.",
      "",
      "```bash",
      `yarn workflow:resume ${quoteCliArg(displayOutputDir)}`,
      "```",
    );
    if (readiness.blockers.length) {
      sections.push("", "- Для strict gate нужно снять blockers или расширить rollout/config так, чтобы заблокированная стадия могла выполниться.");
    }
    return sections.join("\n");
  }

  if (!process.env.OPENAI_API_KEY) {
    sections.push("- Настрой `OPENAI_API_KEY` в локальном `.env` или environment.");
  }

  if (!existsSync(outputDir)) {
    sections.push(`- Проверь outputDir: \`${displayOutputDir}\` не найден.`);
  } else if (!existsSync(join(outputDir, "run-state.json"))) {
    sections.push(`- Проверь workflow state: в \`${displayOutputDir}\` нет \`run-state.json\`.`);
  } else if (readRunStateSummary(outputDir)?.executionMode !== "agentic") {
    sections.push(`- Проверь execution mode: workflow в \`${displayOutputDir}\` должен быть создан с \`--mode agentic\`.`);
  }

  sections.push(
    "- Если human approval получен, запиши недостающие approvals командами ниже.",
    "",
    formatAgenticApprovalCommands(
      displayOutputDir,
      approvedBy,
      await listApprovals(outputDir).catch(() => []),
      readRunStateSummary(outputDir)?.stageStatuses,
    ),
  );

  return sections.join("\n");
}

function readRunStateSummary(outputDir: string): { executionMode?: string; stageStatuses: Record<string, string> } | undefined {
  try {
    const raw = readFileSync(join(outputDir, "run-state.json"), "utf8");
    const parsed = JSON.parse(raw) as { execution_mode?: unknown; stages?: unknown };
    const stageStatuses: Record<string, string> = {};
    if (parsed.stages && typeof parsed.stages === "object" && !Array.isArray(parsed.stages)) {
      for (const [stageId, stageValue] of Object.entries(parsed.stages)) {
        if (stageValue && typeof stageValue === "object" && "status" in stageValue) {
          const status = (stageValue as { status?: unknown }).status;
          if (typeof status === "string") {
            stageStatuses[stageId] = status;
          }
        }
      }
    }

    return {
      executionMode: typeof parsed.execution_mode === "string" ? parsed.execution_mode : undefined,
      stageStatuses,
    };
  } catch {
    return undefined;
  }
}

function quoteCliArg(value: string): string {
  if (/^[A-Za-z0-9_./:\\-]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

/** Убирает флаг и его значение из списка аргументов: остаток — это текст фразы. */
function withoutFlagValue(args: string[], flag: string): string[] {
  const index = args.indexOf(flag);
  if (index < 0) {
    return args;
  }

  const hasValue = Boolean(args[index + 1] && !args[index + 1].startsWith("--"));
  return args.filter((_, position) => position !== index && !(hasValue && position === index + 1));
}
