import { existsSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { execSync } from "node:child_process";
import { runLandingWorkflow } from "./run-landing-workflow";
import { buildLocalDownstreamArtifacts, writeLocalStageArtifact } from "./run-local-workflow";
import { runResearchStage } from "./research-stage-runner";
import { validateWorkflowRun } from "./validate-workflow-run";
import { artifactFiles, getWorkflowStagesForProfile, type WorkflowProfile } from "./workflow-stages";
import {
  hasRunState,
  nowIso,
  readRunState,
  writeRunState,
  writeStageResult,
  type WorkflowRunState,
  type WorkflowStageResult,
  type WorkflowStageStatus,
} from "./workflow-state";

export interface StartWorkflowOptions {
  goal: string;
  profile?: WorkflowProfile;
}

export interface RerunWorkflowStageOptions {
  force?: boolean;
}

export async function startWorkflowEngine(options: StartWorkflowOptions): Promise<WorkflowRunState> {
  const profile = options.profile ?? "standard";
  if (profile !== "standard") {
    throw new Error("Workflow engine first increment supports only the standard profile.");
  }

  const outputDir = await runLandingWorkflow({ goal: options.goal });
  const now = nowIso();
  const state = createInitialState(outputDir, options.goal, profile, now);
  const intakeArtifacts = [
    artifactFiles.run_plan,
    artifactFiles.handoff_bundle,
    artifactFiles.stage_gate_ledger,
    artifactFiles.recursive_brief,
  ];

  state.stages["00-intake"] = {
    ...state.stages["00-intake"],
    status: "completed",
    attempts: 1,
    artifacts: intakeArtifacts,
    updated_at: now,
  };
  state.current_stage = "00-intake";
  state.status = "running";
  state.updated_at = now;
  await writeRunState(state);
  await writeStageResult(outputDir, {
    stage_id: "00-intake",
    title: "Intake and Recursive Brief",
    status: "completed",
    artifacts_created: intakeArtifacts,
    inputs_used: ["User request"],
    warnings: ["Recursive brief is initialized as scaffold and may need human consolidation."],
    errors: [],
    next_stage: "01-research",
    completed_at: now,
  });

  return resumeWorkflowEngine(outputDir);
}

export async function resumeWorkflowEngine(outputDir: string): Promise<WorkflowRunState> {
  if (!hasRunState(outputDir)) {
    throw new Error(`Missing run-state.json in ${outputDir}. Start a workflow before resume.`);
  }

  let state = await readRunState(outputDir);
  if (state.profile !== "standard") {
    throw new Error("Workflow engine first increment supports only the standard profile.");
  }

  const stages = getWorkflowStagesForProfile(state.profile);
  for (const stage of stages) {
    const stageState = state.stages[stage.id];
    if (stageState?.status === "completed" || stageState?.status === "partial" || stageState?.status === "skipped") {
      continue;
    }

    if (stage.id === "00-intake") {
      continue;
    }

    const startedAt = nowIso();
    state.current_stage = stage.id;
    state.status = "running";
    state.stages[stage.id] = {
      ...stageState,
      id: stage.id,
      title: stage.title,
      status: "running",
      attempts: (stageState?.attempts ?? 0) + 1,
      artifacts: stageState?.artifacts ?? [],
      updated_at: startedAt,
    };
    state.updated_at = startedAt;
    await writeRunState(state);

    try {
      const result = await runStage(outputDir, state.goal, stage.id);
      await validateThroughStage(outputDir, stage.id, state.profile);
      state = await readRunState(outputDir);
      state.stages[stage.id] = {
        ...state.stages[stage.id],
        status: result.status,
        artifacts: result.artifacts_created,
        updated_at: result.completed_at,
        error: result.errors[0],
        notes: result.warnings,
      };
      state.status = result.status === "blocked" ? "blocked" : "running";
      state.updated_at = result.completed_at;
      await writeRunState(state);
      await writeStageResult(outputDir, result);
    } catch (error) {
      const failedAt = nowIso();
      const message = error instanceof Error ? error.message : String(error);
      state = await readRunState(outputDir);
      state.status = "failed";
      state.stages[stage.id] = {
        ...state.stages[stage.id],
        status: "failed",
        updated_at: failedAt,
        error: message,
      };
      state.updated_at = failedAt;
      await writeRunState(state);
      await writeStageResult(outputDir, {
        stage_id: stage.id,
        title: stage.title,
        status: "failed",
        artifacts_created: [],
        inputs_used: [],
        warnings: [],
        errors: [message],
        next_stage: undefined,
        completed_at: failedAt,
      });
      throw error;
    }
  }

  state = await readRunState(outputDir);
  const finalStatus = summarizeRunStatus(state);
  state.status = finalStatus;
  state.current_stage = undefined;
  state.updated_at = nowIso();
  await writeRunState(state);

  console.log(`Workflow engine finished: ${finalStatus} (${relative(process.cwd(), outputDir)})`);
  return state;
}

export async function getWorkflowEngineStatus(outputDir: string): Promise<string> {
  const state = await readRunState(outputDir);
  const stages = getWorkflowStagesForProfile(state.profile);
  const lines = [
    `Run: ${state.run_id}`,
    `Goal: ${state.goal}`,
    `Profile: ${state.profile}`,
    `Status: ${state.status}`,
    "",
    "| Stage | Status | Attempts | Artifacts |",
    "|---|---|---:|---|",
    ...stages.map((stage) => {
      const item = state.stages[stage.id];
      return `| ${stage.id} ${stage.title} | ${item?.status ?? "pending"} | ${item?.attempts ?? 0} | ${(item?.artifacts ?? []).join(", ")} |`;
    }),
  ];

  return lines.join("\n");
}

export async function rerunWorkflowStage(
  outputDir: string,
  stageId: string,
  options: RerunWorkflowStageOptions = {},
): Promise<WorkflowRunState> {
  if (!hasRunState(outputDir)) {
    throw new Error(`Missing run-state.json in ${outputDir}. Start a workflow before rerun.`);
  }

  if (!options.force) {
    throw new Error("Stage rerun requires --force so accidental regeneration is explicit.");
  }

  if (stageId === "00-intake") {
    throw new Error("Rerunning 00-intake is protected in this increment. Start a new workflow instead.");
  }

  const state = await readRunState(outputDir);
  if (state.profile !== "standard") {
    throw new Error("Workflow engine rerun first increment supports only the standard profile.");
  }

  const stages = getWorkflowStagesForProfile(state.profile);
  const targetIndex = stages.findIndex((stage) => stage.id === stageId);
  if (targetIndex < 0) {
    throw new Error(`Unknown stage id: ${stageId}`);
  }

  const now = nowIso();
  for (const stage of stages.slice(targetIndex)) {
    const existing = state.stages[stage.id];
    state.stages[stage.id] = {
      id: stage.id,
      title: stage.title,
      status: "pending",
      attempts: existing?.attempts ?? 0,
      artifacts: existing?.artifacts ?? [],
      updated_at: now,
      notes: [
        ...(existing?.notes ?? []),
        `Reset by force rerun of ${stageId} at ${now}.`,
      ],
    };
  }

  state.status = "running";
  state.current_stage = stageId;
  state.updated_at = now;
  await writeRunState(state);
  await appendFile(
    join(outputDir, artifactFiles.stage_gate_ledger),
    [
      "",
      `| ${now} | workflow-engine rerun ${stageId} | reset | Forced rerun reset ${stages.slice(targetIndex).map((stage) => stage.id).join(", ")} |`,
    ].join("\n"),
    "utf8",
  );

  return resumeWorkflowEngine(outputDir);
}

function createInitialState(outputDir: string, goal: string, profile: WorkflowProfile, now: string): WorkflowRunState {
  const stages = Object.fromEntries(
    getWorkflowStagesForProfile(profile).map((stage) => [
      stage.id,
      {
        id: stage.id,
        title: stage.title,
        status: "pending" as const,
        attempts: 0,
        artifacts: [],
        updated_at: now,
      },
    ]),
  );

  return {
    run_id: `${basename(outputDir)}-${Date.now()}`,
    goal,
    profile,
    status: "pending",
    output_dir: outputDir,
    created_at: now,
    updated_at: now,
    stages,
  };
}

async function detectNotionConfig(outputDir: string): Promise<{ token?: string; pageId?: string }> {
  let token = process.env.NOTION_TOKEN;
  let pageId = process.env.NOTION_PAGE_ID || process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_TARGET;

  // 1. Попробуем прочитать из .env
  const envPath = join(process.cwd(), ".env");
  if (existsSync(envPath)) {
    try {
      const envContent = await readFile(envPath, "utf8");
      if (!token) {
        const tokenMatch = envContent.match(/^NOTION_TOKEN=(.+)$/m);
        if (tokenMatch?.[1]?.trim()) {
          token = tokenMatch[1].trim();
        }
      }
      if (!pageId) {
        const pageIdMatch = envContent.match(/^(?:NOTION_PAGE_ID|NOTION_PARENT_PAGE_ID|NOTION_TARGET)=(.+)$/m);
        if (pageIdMatch?.[1]?.trim()) {
          pageId = pageIdMatch[1].trim();
        }
      }
    } catch (e) {
      // Игнорируем ошибки чтения .env
    }
  }

  // 2. Попробуем найти в workflow-scaffold.md
  if (!pageId) {
    const scaffoldPath = join(outputDir, "workflow-scaffold.md");
    if (existsSync(scaffoldPath)) {
      try {
        const scaffoldContent = await readFile(scaffoldPath, "utf8");
        const match = scaffoldContent.match(/(?:notion_target|Notion Target|Page ID):\s*(.+)$/im);
        if (match?.[1]?.trim()) {
          pageId = match[1].trim();
        }
      } catch (e) {
        // Игнорируем ошибки чтения scaffold
      }
    }
  }

  // 3. Попробуем найти в run-state.json
  if (!pageId) {
    const runStatePath = join(outputDir, "run-state.json");
    if (existsSync(runStatePath)) {
      try {
        const runStateContent = await readFile(runStatePath, "utf8");
        const parsed = JSON.parse(runStateContent);
        if (parsed.notion_target) {
          pageId = parsed.notion_target;
        }
      } catch (e) {
        // Игнорируем ошибки чтения JSON
      }
    }
  }

  return { token, pageId };
}

async function runStage(
  outputDir: string,
  goal: string,
  stageId: string,
): Promise<WorkflowStageResult> {
  if (stageId === "01-research") {
    await runResearchStage({ outputDir });
    const research = await readArtifact(outputDir, artifactFiles.research_summary);
    const status = detectArtifactStatus(research, "completed");
    return stageResult(stageId, "Deep Research", status, researchArtifacts(), ["recursive-brief.md"], status === "partial"
      ? ["Research provider coverage is partial; downstream claims must remain marked needs validation."]
      : []);
  }

  const downstreamArtifacts = await buildLocalDownstreamArtifacts(outputDir, goal);
  const artifact = downstreamArtifacts.find((item) => item.stage === stageId);
  if (!artifact) {
    return stageResult(stageId, stageId, "skipped", [], [], [`No local executor is registered for ${stageId}.`]);
  }

  await writeLocalStageArtifact(outputDir, artifact);

  const warnings: string[] = [];
  if (stageId === "12-release") {
    try {
      const config = await detectNotionConfig(outputDir);
      if (config.token && config.pageId) {
        console.log(`[Notion Auto-Publish] Обнаружены NOTION_TOKEN и родительский Page ID (${config.pageId}).`);
        console.log(`[Notion Auto-Publish] Запускаем автоматический экспорт Agile Board...`);
        const scriptPath = join(process.cwd(), "tooling", "scripts", "publish-notion-stories.mjs");
        execSync(`node "${scriptPath}" "${config.pageId}" "${outputDir}"`, { stdio: "inherit" });
        console.log(`[Notion Auto-Publish] Экспорт завершен успешно!`);
      } else {
        warnings.push("Automatic Notion Agile Board export skipped: NOTION_TOKEN or parent page ID is not configured in .env or environment.");
      }
    } catch (publishError) {
      const msg = publishError instanceof Error ? publishError.message : String(publishError);
      warnings.push(`Automatic Notion Agile Board export failed: ${msg}`);
      console.error(`[Notion Auto-Publish] Ошибка при автоматическом экспорте:`, publishError);
    }
  }

  const status = detectArtifactStatus(artifact.content, "completed");
  return stageResult(stageId, artifact.title, status, [artifact.file], inferInputsUsed(artifact.content), warnings);
}

async function validateThroughStage(outputDir: string, stageId: string, profile: WorkflowProfile): Promise<void> {
  const findings = validateWorkflowRun(outputDir, stageId, profile);
  const errors = findings.filter((finding) => finding.level === "error");
  await appendFile(
    join(outputDir, artifactFiles.stage_gate_ledger),
    [
      "",
      `| ${nowIso()} | workflow-engine validate ${stageId} | ${errors.length ? "failed" : "pass"} | ${errors.length} errors; ${findings.length - errors.length} warnings |`,
    ].join("\n"),
    "utf8",
  );

  if (errors.length) {
    throw new Error(`Validation failed after ${stageId}: ${errors.map((finding) => finding.message).join("; ")}`);
  }
}

function stageResult(
  stageId: string,
  title: string,
  status: WorkflowStageStatus,
  artifacts: string[],
  inputs: string[],
  warnings: string[],
): WorkflowStageResult {
  return {
    stage_id: stageId,
    title,
    status,
    artifacts_created: artifacts,
    inputs_used: inputs,
    warnings,
    errors: [],
    next_stage: undefined,
    completed_at: nowIso(),
  };
}

function detectArtifactStatus(content: string, fallback: WorkflowStageStatus): WorkflowStageStatus {
  if (/Status \| blocked \||## Status\s+blocked|status:\s*blocked/i.test(content)) {
    return "blocked";
  }

  if (/Status \| partial \||## Status\s+partial|status:\s*partial/i.test(content)) {
    return "partial";
  }

  return fallback;
}

function inferInputsUsed(content: string): string[] {
  const match = content.match(/## Inputs Used\s+([\s\S]*?)(?:\n## |\n# |$)/);
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/`([^`]+)`|-\s+([^\n]+)/g)]
    .map((item) => item[1] ?? item[2])
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readArtifact(outputDir: string, fileName: string): Promise<string> {
  const path = join(outputDir, fileName);
  return existsSync(path) ? readFile(path, "utf8") : "";
}

function researchArtifacts(): string[] {
  return [
    artifactFiles.research_summary,
    artifactFiles.competitive_analysis,
    artifactFiles.proto_personas,
    artifactFiles.synthetic_interviews,
    artifactFiles.swot,
  ];
}

function summarizeRunStatus(state: WorkflowRunState): WorkflowStageStatus {
  const statuses = Object.values(state.stages).map((stage) => stage.status);
  if (statuses.includes("failed")) {
    return "failed";
  }

  if (statuses.includes("blocked")) {
    return "blocked";
  }

  if (statuses.includes("partial")) {
    return "partial";
  }

  return "completed";
}
