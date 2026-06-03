import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
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
import { parseUserIntent } from "./intent-parser";
import { archiveWorkflowRun, cleanupTempOutputs, formatArchiveWorkflowRunResult, formatCleanupTempResult } from "./output-lifecycle";
import { formatWorkflowRunInspection, formatWorkflowRunList, inspectWorkflowRun, listWorkflowRuns } from "./output-metadata";
import { formatSkillUsageInspection, inspectSkillUsage } from "./skill-usage";
import { getWorkflowEngineStatus, rerunWorkflowStage, resumeWorkflowEngine, startWorkflowEngine } from "./workflow-engine";
import { workflowStages } from "./workflow-stages";
import type { WorkflowExecutionMode } from "./workflow-state";

export async function runWorkflowCli(rawArgs = process.argv.slice(2)): Promise<void> {
  loadLocalEnv();

  const command = rawArgs[0];
  const rest = rawArgs.slice(1);

  if (await tryRunIntentCommand(command, rest, rawArgs)) {
    return;
  }

  if (command === "start") {
    const { mode, profile, args } = parseStartOptions(rest);
    const goal = args.join(" ").trim();
    if (!goal) {
      throw new Error('Usage: yarn workflow:start "<landing workflow goal>" [--mode local|agentic] [--profile standard|reference]');
    }

    const state = await startWorkflowEngine({ goal, executionMode: mode, profile });
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "resume") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:resume outputs/<project-slug>/<YYYY-MM-DD>");
    }

    const state = await resumeWorkflowEngine(resolve(process.cwd(), outputDir));
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return;
  }

  if (command === "status") {
    const outputDir = rest[0];
    if (!outputDir) {
      throw new Error("Usage: yarn workflow:status outputs/<project-slug>/<YYYY-MM-DD>");
    }

    console.log(await getWorkflowEngineStatus(resolve(process.cwd(), outputDir)));
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

  if (command === "skills") {
    console.log(formatSkillUsageInspection(inspectSkillUsage(resolve(process.cwd()))));
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

  if (command === "run-stage") {
    const outputDir = rest[0];
    const stageId = rest[1];
    const force = rest.includes("--force");
    if (!outputDir || !stageId) {
      throw new Error("Usage: yarn workflow:run-stage outputs/<project-slug>/<YYYY-MM-DD> <stage-id> --force");
    }

    const state = await rerunWorkflowStage(resolve(process.cwd(), outputDir), stageId, { force });
    console.log(await getWorkflowEngineStatus(state.output_dir));
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

  throw new Error("Usage: workflow engine command must be one of: start, resume, status, list, inspect, skills, cleanup-temp, archive, run-stage, approve, deny, approvals, agentic-stages, agentic-readiness, agentic-approval-commands, agentic-preflight\nOr use a natural trigger phrase!");
}

async function tryRunIntentCommand(command: string | undefined, rest: string[], rawArgs: string[]): Promise<boolean> {
  const fullInput = rawArgs.join(" ").trim();
  let intent = null;
  if (command && ["start", "resume", "status", "run-stage"].includes(command)) {
    const restText = rest.join(" ").trim();
    if (restText) {
      intent = parseUserIntent(restText);
    }
  } else if (fullInput) {
    intent = parseUserIntent(fullInput);
  }

  if (!intent || intent.confidence === "low") {
    return false;
  }

  const recentDir = findMostRecentRunDir();
  if (intent.command === "resume" && recentDir) {
    console.log(`[Intent Parser] Распознано намерение: Продолжить последний проект (${recentDir})`);
    const state = await resumeWorkflowEngine(recentDir);
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return true;
  }

  if (intent.command === "status" && recentDir) {
    console.log(`[Intent Parser] Распознано намерение: Показать статус последнего проекта (${recentDir})`);
    console.log(await getWorkflowEngineStatus(recentDir));
    return true;
  }

  if (intent.command === "run-stage" && intent.stageId && recentDir) {
    console.log(`[Intent Parser] Распознано намерение: Запустить этап "${intent.stageId}" для проекта (${recentDir})`);
    const state = await rerunWorkflowStage(recentDir, intent.stageId, { force: true });
    console.log(await getWorkflowEngineStatus(state.output_dir));
    return true;
  }

  return false;
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

function parseStartOptions(args: string[]): { mode: WorkflowExecutionMode; profile?: "standard" | "reference"; args: string[] } {
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

  return { mode, profile, args: parsedArgs };
}

function parseApprovalArgs(args: string[]): { target?: string; by?: string; notes?: string } {
  return {
    target: readFlagValue(args, "--target"),
    by: readFlagValue(args, "--by"),
    notes: readFlagValue(args, "--notes"),
  };
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
