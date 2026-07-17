import { appendFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { runLandingWorkflow } from "./run-landing-workflow";
import { validateWorkflowRun } from "./validate-workflow-run";
import { truncateContextForSpecialist } from "./context-truncator";
import { executeWorkflowStage } from "./workflow-stage-executors";
import {
  artifactFiles,
  defaultWorkflowScale,
  getWorkflowStagesForProfile,
  type WorkflowProfile,
  type WorkflowScale,
} from "./workflow-stages";
import {
  hasRunState,
  nowIso,
  readRunState,
  writeRunState,
  writeStageResult,
  type WorkflowExecutionMode,
  type WorkflowRunState,
  type WorkflowStageStatus,
} from "./workflow-state";
import { summarizeRunStatus as resolveRunStatus } from "./status-resolver";

export interface StartWorkflowOptions {
  goal: string;
  profile?: WorkflowProfile;
  scale?: WorkflowScale;
  executionMode?: WorkflowExecutionMode;
}

export interface RerunWorkflowStageOptions {
  force?: boolean;
}

export async function startWorkflowEngine(options: StartWorkflowOptions): Promise<WorkflowRunState> {
  const profile = options.profile ?? detectWorkflowProfileFromGoal(options.goal);
  // Масштаб задаётся явно на старте. Дефолт `full` намеренно консервативен: не уверен в
  // масштабе — получаешь полный pipeline, а не урезанный по догадке.
  const scale = options.scale ?? defaultWorkflowScale;
  const executionMode = options.executionMode ?? "local";

  const outputDir = await runLandingWorkflow({ goal: options.goal, profile });
  const now = nowIso();
  const state = createInitialState(outputDir, options.goal, profile, scale, executionMode, now);
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

  const stages = getWorkflowStagesForProfile(state.profile, state.scale ?? defaultWorkflowScale);
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
      await truncateContextForSpecialist(outputDir, stage.id);
      const result = await executeWorkflowStage({
        outputDir,
        goal: state.goal,
        stage,
        profile: state.profile,
        executionMode: state.execution_mode ?? "local",
      });
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
      if (result.status === "blocked") {
        break;
      }

      await validateThroughStage(outputDir, stage.id, state.profile, state.scale ?? defaultWorkflowScale);
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
  const stages = getWorkflowStagesForProfile(state.profile, state.scale ?? defaultWorkflowScale);
  const lines = [
    `Run: ${state.run_id}`,
    `Goal: ${state.goal}`,
    `Profile: ${state.profile}`,
    `Scale: ${state.scale ?? defaultWorkflowScale}`,
    `Execution mode: ${state.execution_mode ?? "local"}`,
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

  const stages = getWorkflowStagesForProfile(state.profile, state.scale ?? defaultWorkflowScale);
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

function createInitialState(
  outputDir: string,
  goal: string,
  profile: WorkflowProfile,
  scale: WorkflowScale,
  executionMode: WorkflowExecutionMode,
  now: string,
): WorkflowRunState {
  const stages = Object.fromEntries(
    getWorkflowStagesForProfile(profile, scale).map((stage) => [
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
    scale,
    execution_mode: executionMode,
    status: "pending",
    output_dir: outputDir,
    created_at: now,
    updated_at: now,
    stages,
  };
}

async function validateThroughStage(
  outputDir: string,
  stageId: string,
  profile: WorkflowProfile,
  scale: WorkflowScale,
): Promise<void> {
  const findings = validateWorkflowRun(outputDir, stageId, profile, scale);
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

function summarizeRunStatus(state: WorkflowRunState): WorkflowStageStatus {
  return resolveRunStatus(Object.values(state.stages).map((stage) => stage.status));
}

function detectWorkflowProfileFromGoal(goal: string): WorkflowProfile {
  return /https?:\/\/|visual reference|reference url|как этот сайт|референс/i.test(goal)
    ? "reference"
    : "standard";
}
