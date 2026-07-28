// Agent Output Critic — сверка отчёта субагента с фактическим состоянием диска и проверок.
//
// Зачем. `CLAUDE.md` заявляет, что agentic handoff исполняется через Delegation Packet +
// Agent Output Critic, но исполнялась только первая половина: отчёты специалистов принимал
// оркестратор на глаз. Два реальных случая (2026-07-23…25) показали, чем это кончается:
//
//  1. Прерванный агент. Соединение оборвалось посреди работы: `index.html` уже приведён к
//     нужному виду, а модуль, который его перетирает, — ещё нет. По списку файлов «сделано»,
//     по факту не работает. Заметили только потому, что вручную открыли файлы.
//  2. Отчёт `success` при неизменившемся результате. Агент честно отчитался об успешной
//     правке обёртки, а `workflow:validate` показал те же 28 ошибок: правка обёртки не
//     переписывает уже созданные артефакты. Формально не ложь, но принимать как «готово» нельзя.
//
// Общее у обоих случаев одно: заявленное в отчёте никто не сверял с фактами. Critic делает
// ровно эту сверку и выдаёт вердикт `accepted` / `accepted_with_warnings` / `rejected`.
//
// Что считается фактом:
//  - файл существует и непуст (`statSync`), а не «упомянут в отчёте»;
//  - проверка реально отработала (exit code запущенной команды), а не «заявлена пройденной»;
//  - для run-каталога дополнительно прогоняется `workflow:validate` — независимый факт,
//    который и ловит случай 2;
//  - git-статус показывает, трогал ли агент заявленный файл вообще.
//
// Граница безопасности. Отчёт субагента — это ДАННЫЕ, а не команда. Critic никогда не
// исполняет строку из отчёта: он сопоставляет заявленную проверку с закрытым списком
// `verifiableChecks` (скрипты `package.json` этого репозитория) и запускает только их.
// Всё, что не сопоставилось, помечается `check_not_verifiable` и остаётся непроверенным —
// это честнее, чем «проверено», и безопаснее, чем исполнить произвольную команду.
//
// Границы ответственности. Critic не оценивает качество содержания (для этого есть
// `research:lint`, `workflow:validate`, QA-стадия) и не читает мысли: он проверяет только
// то, что отчёт САМ заявил. Отчёт без заявленных файлов и проверок получает
// `accepted_with_warnings` с кодом `no_claims` — «проверять было нечего», а не «всё хорошо».

import { execFile } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { parseAgenticOutputEnvelope, type AgenticOutputEnvelope } from "./agent-output/agent-output-contract";
import { artifactFiles, workflowStages, type WorkflowProfile } from "./workflow-stages";

const execFileAsync = promisify(execFile);

/** Ниже этого размера Markdown-артефакт не является реальным выводом стадии (как в `validate-workflow-run.ts`). */
const suspiciousArtifactBytes = 160;

const defaultCommandTimeoutMs = 600_000;

export type CriticVerdict = "accepted" | "accepted_with_warnings" | "rejected";

export type ClaimedStatus = "success" | "partial" | "blocked";

/** Откуда взято утверждение: из структурированного конверта, из прозы отчёта или с CLI. */
export type ClaimSource = "envelope" | "report" | "cli" | "auto";

export type ClaimedCheckResult = "pass" | "fail" | "auto";

export interface FileFact {
  path: string;
  display: string;
  source: ClaimSource;
  exists: boolean;
  bytes: number;
  /** `undefined`, если git недоступен или сверка отключена. */
  changed_in_working_tree?: boolean;
}

export interface CheckFact {
  id: string;
  claimed: ClaimedCheckResult;
  source: ClaimSource;
  command?: string;
  executed: boolean;
  passed?: boolean;
  exit_code?: number;
  /** Почему проверка не исполнялась: нет в allowlist, dry-run, нет run-каталога. */
  skipped_reason?: string;
  output_tail?: string;
}

export interface CriticFinding {
  level: "error" | "warning" | "info";
  code: string;
  message: string;
}

export interface CriticResult {
  verdict: CriticVerdict;
  claimed_status?: ClaimedStatus;
  agent_name?: string;
  stage_id?: string;
  run_dir?: string;
  /** Профиль из `run-state.json`/`run-meta.json`; `undefined` = в состоянии run его нет. */
  run_profile?: WorkflowProfile;
  envelope_present: boolean;
  files: FileFact[];
  checks: CheckFact[];
  findings: CriticFinding[];
  executed_commands: number;
}

export interface VerifiableCheck {
  /** Канонический id = имя скрипта в `package.json`. */
  id: string;
  args: readonly string[];
  /** Команде нужен путь run-каталога последним аргументом. */
  needsRunDir?: boolean;
  /** Как эту проверку называют в свободном тексте отчёта. Только однозначные синонимы. */
  aliases: readonly string[];
}

/**
 * Закрытый список проверок, которые Critic имеет право исполнить.
 * Расширять можно только скриптами `package.json`: команда из отчёта в этот список не попадает.
 */
export const verifiableChecks: readonly VerifiableCheck[] = [
  { id: "typecheck", args: ["typecheck"], aliases: ["typecheck", "tsc --noemit", "type check"] },
  { id: "build", args: ["build"], aliases: ["build"] },
  { id: "validate:config", args: ["validate:config"], aliases: ["validate:config"] },
  { id: "docs:audit", args: ["docs:audit"], aliases: ["docs:audit"] },
  { id: "qa:quick", args: ["qa:quick"], aliases: ["qa:quick"] },
  { id: "research:lint", args: ["research:lint"], aliases: ["research:lint"] },
  { id: "workflow:doctor", args: ["workflow:doctor"], aliases: ["workflow:doctor", "doctor"] },
  {
    id: "workflow:test-agentic",
    args: ["workflow:test-agentic"],
    aliases: ["workflow:test-agentic", "runtime-тесты", "runtime tests"],
  },
  {
    id: "workflow:validate",
    args: ["workflow:validate"],
    needsRunDir: true,
    aliases: ["workflow:validate", "workflow validate", "валидатор run"],
  },
];

export interface CommandRunResult {
  exit_code: number;
  output: string;
}

/** Инъекция исполнителя команд: тесты подменяют её и не запускают реальный `yarn`. */
export type CommandRunner = (command: { id: string; bin: string; args: string[] }) => Promise<CommandRunResult>;

export interface VerifyAgentOutputOptions {
  /** Текст отчёта субагента. */
  report: string;
  /** Корень репозитория для запуска команд и резолва путей. */
  cwd?: string;
  /** Run-каталог; если не задан — Critic пробует вывести его из отчёта. */
  runDir?: string;
  /** Дополнительные файлы, которые оркестратор считает заявленными. */
  files?: readonly string[];
  /** Дополнительные проверки (id из `verifiableChecks`), которые нужно прогнать. */
  checks?: readonly string[];
  /** Не исполнять команды: только структурная сверка файлов. */
  dryRun?: boolean;
  /** Не запускать `workflow:validate` автоматически по run-каталогу. */
  skipAutoValidate?: boolean;
  /** Не сверяться с `git status`. */
  skipGit?: boolean;
  timeoutMs?: number;
  runCommand?: CommandRunner;
}

interface FileClaim {
  raw: string;
  source: ClaimSource;
}

interface CheckClaim {
  id: string;
  claimed: ClaimedCheckResult;
  source: ClaimSource;
}

interface ReportClaims {
  envelope?: AgenticOutputEnvelope;
  envelope_warnings: string[];
  status?: ClaimedStatus;
  agent_name?: string;
  stage_id?: string;
  run_dir?: string;
  files: FileClaim[];
  checks: CheckClaim[];
  /** Проверки, заявленные в отчёте, но не сопоставленные с allowlist. */
  unverifiable_checks: string[];
}

// ---------------------------------------------------------------------------
// Публичный API
// ---------------------------------------------------------------------------

export async function verifyAgentOutput(options: VerifyAgentOutputOptions): Promise<CriticResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const claims = extractClaims(options.report, { cwd, runDirOverride: options.runDir });

  const runDir = options.runDir ? resolve(cwd, options.runDir) : claims.run_dir;
  const findings: CriticFinding[] = [];

  if (!claims.envelope) {
    findings.push({
      level: "warning",
      code: "no_envelope",
      message:
        "Отчёт не содержит структурированный agent output contract — заявленное восстановлено из прозы и может быть неполным.",
    });
  }

  // --- файлы ---------------------------------------------------------------
  const fileClaims = dedupeFileClaims([
    ...claims.files,
    ...(options.files ?? []).map((path) => ({ raw: path, source: "cli" as ClaimSource })),
  ]);

  const changedPaths = options.skipGit ? undefined : await readGitChangedPaths(cwd);
  const files: FileFact[] = fileClaims.map((claim) => {
    const path = resolveClaimedPath(claim.raw, cwd, runDir);
    const exists = existsSync(path) && statSync(path).isFile();
    const bytes = exists ? statSync(path).size : 0;
    const rel = toRepoRelative(path, cwd);
    return {
      path,
      display: rel,
      source: claim.source,
      exists,
      bytes,
      changed_in_working_tree: changedPaths ? changedPaths.has(rel) : undefined,
    };
  });

  for (const file of files) {
    if (!file.exists) {
      findings.push({
        level: "error",
        code: "missing_file",
        message: `Отчёт заявляет файл \`${file.display}\`, но на диске его нет.`,
      });
      continue;
    }

    if (file.bytes === 0) {
      findings.push({
        level: "error",
        code: "empty_file",
        message: `Файл \`${file.display}\` существует, но пуст (0 байт) — это не результат работы.`,
      });
      continue;
    }

    if (file.bytes < suspiciousArtifactBytes && file.display.toLowerCase().endsWith(".md")) {
      findings.push({
        level: "warning",
        code: "tiny_file",
        message: `Файл \`${file.display}\` меньше ${suspiciousArtifactBytes} байт — для артефакта стадии это подозрительно мало.`,
      });
    }

    if (file.changed_in_working_tree === false) {
      findings.push({
        level: "warning",
        code: "not_in_working_tree",
        message:
          `git не видит изменений в \`${file.display}\` — либо агент его не трогал, либо правка уже закоммичена. Проверь, что заявленная правка реально произошла.`,
      });
    }
  }

  const missingCount = files.filter((file) => !file.exists || file.bytes === 0).length;
  if (missingCount > 0 && missingCount < files.length) {
    findings.push({
      level: "error",
      code: "truncated_work",
      message:
        `Часть заявленных файлов на месте (${files.length - missingCount}), часть отсутствует или пуста (${missingCount}). Это картина оборванной на середине работы: принимать отчёт нельзя, нужно доделать перечисленное.`,
    });
  }

  // --- проверки ------------------------------------------------------------
  const checkClaims = dedupeCheckClaims([
    ...claims.checks,
    ...(options.checks ?? []).map((id) => ({ id, claimed: "pass" as ClaimedCheckResult, source: "cli" as ClaimSource })),
  ]);

  if (runDir && !options.skipAutoValidate && !checkClaims.some((claim) => claim.id === "workflow:validate")) {
    // Независимый факт про run: именно он ловит «отчёт success при неизменившемся результате».
    checkClaims.push({ id: "workflow:validate", claimed: "auto", source: "auto" });
  }

  // Профиль run читается из его собственного состояния — тем же чтением, что делает сам
  // валидатор. Здесь он нужен не для флага, а для отчёта и для предупреждения ниже.
  const runProfile = runDir ? readRunProfile(runDir) : undefined;
  if (runDir && !runProfile && !options.dryRun && checkClaims.some((claim) => claim.id === "workflow:validate")) {
    findings.push({
      level: "warning",
      code: "run_profile_unknown",
      message:
        "В `run-state.json`/`run-meta.json` нет поля профиля — валидатору нечего прочитать, и он определяет профиль эвристикой по тексту. Для reference-run это может дать неверный набор обязательных артефактов: запусти `yarn workflow:sync <run-dir>` или сверься с прямым прогоном валидатора с явным `--profile`.",
    });
  }

  for (const raw of claims.unverifiable_checks) {
    findings.push({
      level: "warning",
      code: "check_not_verifiable",
      message: `Отчёт заявляет проверку «${raw}», но она не сопоставлена с командами репозитория — Critic её НЕ проверял.`,
    });
  }

  const runner = options.runCommand ?? defaultCommandRunner(cwd, options.timeoutMs ?? defaultCommandTimeoutMs);
  const checks: CheckFact[] = [];
  let executedCommands = 0;

  for (const claim of checkClaims) {
    const definition = verifiableChecks.find((check) => check.id === claim.id);
    if (!definition) {
      checks.push({
        id: claim.id,
        claimed: claim.claimed,
        source: claim.source,
        executed: false,
        skipped_reason: "нет в allowlist verifiableChecks",
      });
      findings.push({
        level: "warning",
        code: "check_not_verifiable",
        message: `Проверка «${claim.id}» не входит в allowlist — Critic её не исполнял.`,
      });
      continue;
    }

    if (claim.claimed === "fail") {
      // Отчёт сам признал провал: перезапускать нечего, но и молча забыть нельзя.
      checks.push({
        id: claim.id,
        claimed: "fail",
        source: claim.source,
        executed: false,
        skipped_reason: "отчёт сам заявил провал",
      });
      findings.push({
        level: "warning",
        code: "check_claimed_failed",
        message: `Отчёт заявляет, что \`${claim.id}\` не проходит. Статус \`success\` при этом недопустим.`,
      });
      continue;
    }

    if (options.dryRun) {
      checks.push({ id: claim.id, claimed: claim.claimed, source: claim.source, executed: false, skipped_reason: "dry-run" });
      continue;
    }

    const args = [...definition.args];
    if (definition.needsRunDir) {
      if (!runDir) {
        checks.push({
          id: claim.id,
          claimed: claim.claimed,
          source: claim.source,
          executed: false,
          skipped_reason: "не известен run-каталог",
        });
        findings.push({
          level: "warning",
          code: "check_needs_run_dir",
          message: `Проверка \`${claim.id}\` требует run-каталог: передай \`--run-dir\`, иначе она остаётся непроверенной.`,
        });
        continue;
      }

      const runDirArg = toRepoRelative(runDir, cwd);
      if (!isSafePathArgument(runDirArg)) {
        checks.push({
          id: claim.id,
          claimed: claim.claimed,
          source: claim.source,
          executed: false,
          skipped_reason: "путь run-каталога содержит недопустимые символы",
        });
        continue;
      }

      args.push(runDirArg);
      if (claims.stage_id) {
        // Отчёт одной стадии не должен падать из-за ещё не сделанных следующих стадий.
        args.push("--through", claims.stage_id);
      }

      // Ни одна ось не передаётся флагом: валидатор читает `profile` и `scale`
      // из `run-state.json` сам. Раньше здесь стоял костыль `--profile`, потому что
      // валидатор угадывал профиль по тексту и на `contractor-payment-demo` отвечал
      // `standard` (19 ошибок) при `profile: reference` в состоянии (26 ошибок). Корень
      // починен в самом валидаторе, поэтому костыль снят: критик обязан запускать ту же
      // команду, которую по `CLAUDE.md` §10 запускает человек, иначе их цифры расходятся.
    }

    const result = await runner({ id: definition.id, bin: yarnBinary(), args });
    executedCommands += 1;
    const passed = result.exit_code === 0;
    checks.push({
      id: definition.id,
      claimed: claim.claimed,
      source: claim.source,
      command: `yarn ${args.join(" ")}`,
      executed: true,
      passed,
      exit_code: result.exit_code,
      output_tail: tail(result.output),
    });

    if (passed) {
      continue;
    }

    if (claim.claimed === "pass") {
      findings.push({
        level: "error",
        code: "check_failed",
        message: `Отчёт заявляет \`${definition.id}\` пройденной, но команда \`yarn ${args.join(" ")}\` завершилась с кодом ${result.exit_code}.`,
      });
      continue;
    }

    // Автопроверка run: для заявленного `success` расхождение — ошибка, иначе предупреждение.
    const level = claims.status === "success" ? "error" : "warning";
    findings.push({
      level,
      code: "run_validate_failed",
      message:
        `\`yarn ${args.join(" ")}\` завершилась с кодом ${result.exit_code}: фактическое состояние run не соответствует заявленному${claims.status ? ` статусу \`${claims.status}\`` : ""}.`,
    });
  }

  // --- согласованность статуса ---------------------------------------------
  const claimedChecks = checks.filter((check) => check.claimed === "pass");
  if (claims.status === "success" && claimedChecks.length === 0 && files.length > 0) {
    findings.push({
      level: "warning",
      code: "no_verification_claimed",
      message:
        "Статус `success` заявлен без единой проверки результата. Контракт требует реальной verification (build/test/validate/screenshot) — попроси её или понизь статус.",
    });
  }

  if (files.length === 0 && checks.length === 0) {
    findings.push({
      level: "warning",
      code: "no_claims",
      message:
        "В отчёте не нашлось ни заявленных файлов, ни проверок: сверять было нечего. Это не подтверждение работы — запроси перечень файлов и проверок.",
    });
  }

  const errorCount = findings.filter((finding) => finding.level === "error").length;
  if (claims.status === "success" && errorCount > 0) {
    findings.push({
      level: "error",
      code: "status_contradiction",
      message: `Заявлен статус \`success\`, но фактических противоречий: ${errorCount}. Корректный статус — \`partial\`/\`blocked\`, отчёт не принимается.`,
    });
  }

  const finalErrors = findings.filter((finding) => finding.level === "error").length;
  const warnings = findings.filter((finding) => finding.level === "warning").length;
  const verdict: CriticVerdict = finalErrors > 0 ? "rejected" : warnings > 0 ? "accepted_with_warnings" : "accepted";

  return {
    verdict,
    claimed_status: claims.status,
    agent_name: claims.agent_name,
    stage_id: claims.stage_id,
    run_dir: runDir ? toRepoRelative(runDir, cwd) : undefined,
    run_profile: runProfile,
    envelope_present: Boolean(claims.envelope),
    files,
    checks,
    findings,
    executed_commands: executedCommands,
  };
}

export function formatCriticResult(result: CriticResult): string {
  const lines = [
    "# Agent Output Critic",
    "",
    `- Verdict: **${result.verdict}**`,
    `- Заявленный статус: ${result.claimed_status ?? "не найден в отчёте"}`,
    `- Агент: ${result.agent_name ?? "не указан"}`,
    `- Стадия: ${result.stage_id ?? "не определена"}`,
    `- Run: ${result.run_dir ?? "не определён"}`,
    `- Профиль run: ${result.run_profile ? `${result.run_profile} (из состояния run)` : "не определён в состоянии run"}`,
    `- Структурированный конверт: ${result.envelope_present ? "есть" : "нет"}`,
    `- Заявленных файлов: ${result.files.length} (подтверждено ${result.files.filter((file) => file.exists && file.bytes > 0).length})`,
    `- Проверок исполнено: ${result.executed_commands}`,
    "",
  ];

  const byLevel = (level: CriticFinding["level"]) => result.findings.filter((finding) => finding.level === level);

  const errors = byLevel("error");
  if (errors.length) {
    lines.push("## Противоречия (ошибки)", "", ...errors.map((finding) => `- [${finding.code}] ${finding.message}`), "");
  }

  const warnings = byLevel("warning");
  if (warnings.length) {
    lines.push("## Предупреждения", "", ...warnings.map((finding) => `- [${finding.code}] ${finding.message}`), "");
  }

  if (result.files.length) {
    lines.push(
      "## Файлы",
      "",
      "| Файл | Источник | Есть | Байт | git-изменение |",
      "| --- | --- | --- | --- | --- |",
      ...result.files.map(
        (file) =>
          `| \`${file.display}\` | ${file.source} | ${file.exists ? "да" : "**нет**"} | ${file.bytes} | ${
            file.changed_in_working_tree === undefined ? "—" : file.changed_in_working_tree ? "да" : "нет"
          } |`,
      ),
      "",
    );
  }

  if (result.checks.length) {
    lines.push(
      "## Проверки",
      "",
      "| Проверка | Заявлено | Команда | Факт |",
      "| --- | --- | --- | --- |",
      ...result.checks.map((check) => {
        const fact = check.executed
          ? check.passed
            ? "pass"
            : `**fail (exit ${check.exit_code})**`
          : `не исполнялась: ${check.skipped_reason ?? "—"}`;
        return `| \`${check.id}\` | ${check.claimed} | ${check.command ? `\`${check.command}\`` : "—"} | ${fact} |`;
      }),
      "",
    );
  }

  const failedTails = result.checks.filter((check) => check.executed && !check.passed && check.output_tail);
  if (failedTails.length) {
    lines.push("## Вывод упавших проверок", "");
    for (const check of failedTails) {
      lines.push(`### ${check.id}`, "", "```", check.output_tail ?? "", "```", "");
    }
  }

  lines.push(
    result.verdict === "rejected"
      ? "Отчёт не принимается: верни агенту список противоречий выше и потребуй фактического исправления, а не переформулировки."
      : result.verdict === "accepted_with_warnings"
        ? "Отчёт принимается с оговорками: предупреждения выше остаются непроверенными местами — закрой их или зафиксируй как риск."
        : "Отчёт согласуется с фактическим состоянием диска и проверок.",
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Извлечение заявленного из отчёта
// ---------------------------------------------------------------------------

export function extractClaims(report: string, context: { cwd: string; runDirOverride?: string }): ReportClaims {
  const parsed = parseAgenticOutputEnvelope(report);
  const envelope = parsed.envelope;

  const files: FileClaim[] = [];
  const checks: CheckClaim[] = [];
  const unverifiable: string[] = [];

  if (envelope) {
    for (const key of Object.keys(envelope.outputs ?? {})) {
      const fileName = artifactFiles[key] ?? (looksLikePath(key) ? key : undefined);
      if (fileName) {
        files.push({ raw: fileName, source: "envelope" });
      }
    }

    for (const entry of readEnvelopeVerification(envelope)) {
      const matched = matchCheckId(entry.check);
      if (!matched) {
        unverifiable.push(entry.check);
        continue;
      }

      if (entry.result === "pass") {
        checks.push({ id: matched, claimed: "pass", source: "envelope" });
      } else if (entry.result === "fail") {
        checks.push({ id: matched, claimed: "fail", source: "envelope" });
      }
    }
  }

  const prose = scanReportProse(report);
  files.push(...prose.files);
  checks.push(...prose.checks);

  const status = envelope?.status ?? prose.status;
  const agentName = envelope?.agent_name ?? prose.agent_name;
  // Владелец стадии из конверта авторитетнее упоминания id в тексте: отчёт легко
  // упоминает соседние стадии («передать на 03-ia»), и первое совпадение в прозе
  // сузило бы валидацию не туда.
  const stageId = (agentName ? stageIdForOwner(agentName) : undefined) ?? prose.stage_id;
  const runDir = context.runDirOverride
    ? resolve(context.cwd, context.runDirOverride)
    : detectRunDir(report, context.cwd, envelope);

  return {
    envelope,
    envelope_warnings: parsed.warnings,
    status,
    agent_name: agentName,
    stage_id: stageId,
    run_dir: runDir,
    files,
    checks,
    unverifiable_checks: unverifiable,
  };
}

interface ProseScan {
  files: FileClaim[];
  checks: CheckClaim[];
  status?: ClaimedStatus;
  agent_name?: string;
  stage_id?: string;
}

/**
 * Разбор свободной части отчёта. Реальные отчёты субагентов чаще проза, чем конверт,
 * поэтому Critic обязан работать и без структуры — но берёт файлы ТОЛЬКО из секций,
 * которые сами заявлены как «изменённые/созданные файлы»: иначе любой упомянутый вход
 * превратился бы в «заявленный результат».
 */
function scanReportProse(report: string): ProseScan {
  const files: FileClaim[] = [];
  const checks: CheckClaim[] = [];
  let status: ClaimedStatus | undefined;
  let agentName: string | undefined;
  let stageId: string | undefined;

  let inFence = false;
  let fileSection = false;

  for (const rawLine of report.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const heading = readHeading(line);
    if (heading !== undefined) {
      fileSection = /файл|артефакт|artifact|output|changed|созда|изменен|изменён|deliverab/i.test(heading);
      continue;
    }

    if (!status) {
      const statusMatch = line.match(/(?:^|\b)(?:status|статус)\s*[:=—-]\s*\*{0,2}(success|partial|blocked)\*{0,2}/i);
      if (statusMatch) {
        status = statusMatch[1].toLowerCase() as ClaimedStatus;
      }
    }

    if (!agentName) {
      const agentMatch = line.match(/(?:^|\b)(?:agent_name|agent|агент)\s*[:=—-]\s*`?([a-z][a-z0-9-]{2,})`?/i);
      if (agentMatch) {
        agentName = agentMatch[1].toLowerCase();
      }
    }

    if (!stageId) {
      const stage = workflowStages.find((candidate) => line.includes(candidate.id));
      if (stage) {
        stageId = stage.id;
      }
    }

    if (fileSection) {
      for (const candidate of extractPathTokens(line)) {
        files.push({ raw: candidate, source: "report" });
      }
    }

    // Проверки берём по явному упоминанию `yarn <script>`: это однозначно и не требует
    // угадывать, что именно агент называл «тестами».
    for (const mention of line.matchAll(/yarn\s+([a-z0-9:_-]+)/gi)) {
      const id = matchCheckId(mention[1]);
      if (!id) {
        continue;
      }

      if (hasFailMarker(line)) {
        checks.push({ id, claimed: "fail", source: "report" });
        continue;
      }

      if (hasPassMarker(line)) {
        checks.push({ id, claimed: "pass", source: "report" });
      }
    }
  }

  return { files, checks, status, agent_name: agentName, stage_id: stageId };
}

function readHeading(line: string): string | undefined {
  const md = line.match(/^#{1,6}\s+(.*)$/);
  if (md) {
    return md[1];
  }

  const bold = line.match(/^\*\*(.+?)\*\*:?$/);
  if (bold) {
    return bold[1];
  }

  const labelled = line.match(/^([^`|:]{3,60}):$/);
  if (labelled) {
    return labelled[1];
  }

  return undefined;
}

function extractPathTokens(line: string): string[] {
  const tokens = new Set<string>();

  for (const match of line.matchAll(/`([^`\s]+\.[A-Za-z0-9]{1,6})`/g)) {
    tokens.add(match[1]);
  }

  if (tokens.size === 0) {
    for (const match of line.matchAll(/(?:^|[\s(])([A-Za-z0-9._/\\-]+\.[A-Za-z0-9]{1,6})(?=$|[\s,;)])/g)) {
      tokens.add(match[1]);
    }
  }

  return [...tokens].filter((token) => !token.startsWith("http") && !/^\d+\.\d+$/.test(token));
}

const passMarkers = [/\bpass(ed|es)?\b/i, /✅/, /зелён|зелен/i, /\bok\b/i, /успешн/i, /прошл/i, /\bgreen\b/i, /0\s*(errors|ошибок)/i];
const failMarkers = [/\bfail(ed|s|ing)?\b/i, /❌/, /падает|упал|провал/i, /не\s+проход/i, /\bred\b/i, /blocked/i];

function hasPassMarker(line: string): boolean {
  return passMarkers.some((marker) => marker.test(line));
}

function hasFailMarker(line: string): boolean {
  return failMarkers.some((marker) => marker.test(line));
}

function matchCheckId(raw: string): string | undefined {
  const normalized = raw.trim().toLowerCase();
  const direct = verifiableChecks.find((check) => check.id === normalized);
  if (direct) {
    return direct.id;
  }

  return verifiableChecks.find((check) => check.aliases.some((alias) => normalized === alias))?.id;
}

function readEnvelopeVerification(envelope: AgenticOutputEnvelope): { check: string; result: string }[] {
  const surface = (envelope as unknown as Record<string, unknown>).surface_output;
  if (!surface || typeof surface !== "object") {
    return [];
  }

  const verification = (surface as Record<string, unknown>).verification;
  if (!Array.isArray(verification)) {
    return [];
  }

  return verification
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
    .map((entry) => ({ check: String(entry.check ?? ""), result: String(entry.result ?? "").toLowerCase() }))
    .filter((entry) => entry.check.length > 0);
}

function stageIdForOwner(owner: string): string | undefined {
  const matches = workflowStages.filter((stage) => stage.owner === owner);
  // `qa-review` владеет двумя стадиями — угадывать нельзя, лучше не сузить scope валидатора.
  return matches.length === 1 ? matches[0].id : undefined;
}

function detectRunDir(report: string, cwd: string, envelope?: AgenticOutputEnvelope): string | undefined {
  const candidates = new Set<string>();
  const pattern = /((?:outputs|research\/projects)\/[A-Za-z0-9._-]+\/\d{4}-\d{2}-\d{2})/g;

  for (const match of report.matchAll(pattern)) {
    candidates.add(match[1]);
  }

  for (const input of envelope?.inputs_used ?? []) {
    for (const match of input.replace(/\\/g, "/").matchAll(pattern)) {
      candidates.add(match[1]);
    }
  }

  for (const candidate of candidates) {
    const absolute = resolve(cwd, candidate);
    if (existsSync(absolute)) {
      return absolute;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Факты: диск, git, команды
// ---------------------------------------------------------------------------

function resolveClaimedPath(raw: string, cwd: string, runDir?: string): string {
  const normalized = raw.replace(/\\/g, "/").replace(/^\.\//, "");

  if (isAbsolute(normalized)) {
    return resolve(normalized);
  }

  const fromCwd = resolve(cwd, normalized);
  if (existsSync(fromCwd)) {
    return fromCwd;
  }

  if (runDir) {
    const fromRun = resolve(runDir, normalized);
    if (existsSync(fromRun) || !normalized.includes("/")) {
      return fromRun;
    }
  }

  return fromCwd;
}

/**
 * Профиль run из его собственного состояния: сначала `run-state.json` (его же читает
 * `workflow:validate`), затем `run-meta.json` (`workflow_profile`).
 * Молча подставлять `standard` нельзя — это и есть источник ложного вердикта.
 */
export function readRunProfile(runDir: string): WorkflowProfile | undefined {
  const sources: { file: string; field: string }[] = [
    { file: "run-state.json", field: "profile" },
    { file: "run-meta.json", field: "workflow_profile" },
  ];

  for (const source of sources) {
    const path = resolve(runDir, source.file);
    if (!existsSync(path)) {
      continue;
    }

    try {
      const parsed = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
      const value = parsed[source.field];
      if (value === "standard" || value === "reference") {
        return value;
      }
    } catch {
      // Битый JSON состояния — не повод угадывать профиль: пусть будет `run_profile_unknown`.
    }
  }

  return undefined;
}

function toRepoRelative(path: string, cwd: string): string {
  const rel = relative(cwd, path).replace(/\\/g, "/");
  return rel && !rel.startsWith("..") ? rel : path.replace(/\\/g, "/");
}

/** Множество путей, которые git видит изменёнными в рабочем дереве. */
async function readGitChangedPaths(cwd: string): Promise<Set<string> | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["status", "--porcelain"], { cwd, maxBuffer: 8 * 1024 * 1024 });
    const paths = new Set<string>();
    for (const line of stdout.split(/\r?\n/)) {
      if (!line.trim()) {
        continue;
      }

      const payload = line.slice(3).trim();
      const renamed = payload.split(" -> ");
      paths.add(stripQuotes(renamed[renamed.length - 1]));
    }

    return paths;
  } catch {
    return undefined;
  }
}

function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, "").replace(/\\/g, "/");
}

function yarnBinary(): string {
  return process.platform === "win32" ? "yarn.cmd" : "yarn";
}

/** На Windows `.cmd` требует shell, поэтому путь-аргумент проверяется на метасимволы. */
function isSafePathArgument(value: string): boolean {
  return !/["'`$&|;<>^%\r\n]/.test(value);
}

function defaultCommandRunner(cwd: string, timeoutMs: number): CommandRunner {
  return async ({ bin, args }) => {
    // На Windows `yarn.cmd` запускается только через shell, и Node ругается на передачу
    // массива аргументов вместе с `shell: true`. Поэтому там собираем строку команды из
    // уже проверенных значений (allowlist + `isSafePathArgument`), а на POSIX остаётся
    // execFile без shell — то есть самый безопасный вариант из доступных на платформе.
    const useShell = process.platform === "win32";
    const command = useShell ? [bin, ...args.map(quoteArgument)].join(" ") : bin;
    const commandArgs = useShell ? undefined : args;

    try {
      const { stdout, stderr } = await execFileAsync(command, commandArgs, {
        cwd,
        timeout: timeoutMs,
        maxBuffer: 32 * 1024 * 1024,
        shell: useShell,
        windowsHide: true,
      });
      return { exit_code: 0, output: `${stdout}${stderr}` };
    } catch (error) {
      const failure = error as { code?: number | string; stdout?: string; stderr?: string; message?: string };
      const exitCode = typeof failure.code === "number" ? failure.code : 1;
      return { exit_code: exitCode, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}${failure.message ?? ""}` };
    }
  };
}

function quoteArgument(value: string): string {
  return /[\s]/.test(value) ? `"${value}"` : value;
}

function tail(output: string, lines = 20): string {
  return output.split(/\r?\n/).filter((line) => line.trim()).slice(-lines).join("\n");
}

function dedupeFileClaims(claims: FileClaim[]): FileClaim[] {
  const seen = new Map<string, FileClaim>();
  for (const claim of claims) {
    const key = claim.raw.replace(/\\/g, "/").toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, claim);
    }
  }

  return [...seen.values()];
}

function dedupeCheckClaims(claims: CheckClaim[]): CheckClaim[] {
  const seen = new Map<string, CheckClaim>();
  for (const claim of claims) {
    const existing = seen.get(claim.id);
    // `fail` важнее `pass`: если отчёт где-то признал провал, это нельзя потерять.
    if (!existing || (existing.claimed !== "fail" && claim.claimed === "fail")) {
      seen.set(claim.id, claim);
    }
  }

  return [...seen.values()];
}

function looksLikePath(value: string): boolean {
  return /\.[A-Za-z0-9]{1,6}$/.test(value) || value.includes("/");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const usage = [
  "Usage: yarn agent:verify-output <report-file> [options]",
  "       yarn agent:verify-output --stdin [options]",
  "",
  "Options:",
  "  --run-dir <dir>     run-каталог (по умолчанию определяется из отчёта)",
  "  --file <path>       дополнительный заявленный файл (можно повторять)",
  "  --check <id>        дополнительная проверка из allowlist (можно повторять)",
  "  --dry-run           не исполнять команды, только сверка файлов",
  "  --no-validate       не запускать workflow:validate автоматически",
  "  --no-git            не сверяться с git status",
  "  --timeout <ms>      таймаут одной команды (по умолчанию 600000)",
  "  --json              вывести результат как JSON",
  "",
  `Проверки из allowlist: ${verifiableChecks.map((check) => check.id).join(", ")}`,
].join("\n");

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(usage);
    return;
  }

  const useStdin = args.includes("--stdin");
  const reportPath = args.find((arg) => !arg.startsWith("--"));

  if (!useStdin && !reportPath) {
    throw new Error(usage);
  }

  const report = useStdin ? await readStdin() : await readFile(resolve(process.cwd(), reportPath as string), "utf8");
  if (!report.trim()) {
    throw new Error("Отчёт пуст: сверять нечего.");
  }

  const result = await verifyAgentOutput({
    report,
    cwd: process.cwd(),
    runDir: readOption(args, "--run-dir"),
    files: readOptionAll(args, "--file"),
    checks: readOptionAll(args, "--check"),
    dryRun: args.includes("--dry-run"),
    skipAutoValidate: args.includes("--no-validate"),
    skipGit: args.includes("--no-git"),
    timeoutMs: readOption(args, "--timeout") ? Number(readOption(args, "--timeout")) : undefined,
  });

  console.log(args.includes("--json") ? JSON.stringify(result, null, 2) : formatCriticResult(result));

  if (result.verdict === "rejected") {
    process.exitCode = 1;
  }
}

function readOption(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} требует значение`);
  }

  return value;
}

function readOptionAll(args: string[], flag: string): string[] {
  const values: string[] = [];
  args.forEach((arg, index) => {
    if (arg !== flag) {
      return;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${flag} требует значение`);
    }

    values.push(value);
  });

  return values;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
