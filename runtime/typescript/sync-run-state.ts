import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "js-yaml";
import { artifactFiles, getRequiredArtifactsForStage, getWorkflowStagesForProfile, type WorkflowProfile } from "./workflow-stages";
import { artifactStatusToStageStatus, readMarkdownStatus, summarizeRunStatus } from "./status-resolver";
import {
  runStateFileName,
  stageResultsDirName,
  type WorkflowExecutionMode,
  type WorkflowRunState,
  type WorkflowStageResult,
  type WorkflowStageState,
  type WorkflowStageStatus,
} from "./workflow-state";

interface SyncOptions {
  outputDir: string;
  profile?: WorkflowProfile;
  executionMode?: WorkflowExecutionMode;
  preview: boolean;
}

interface ArtifactInspection {
  file: string;
  exists: boolean;
  status?: WorkflowStageStatus;
  inputsUsed: string[];
}

interface SyncResult {
  previousState?: WorkflowRunState;
  nextState: WorkflowRunState;
  stageResults: WorkflowStageResult[];
}

type JsonObject = Record<string, unknown>;

export async function syncWorkflowRunState(options: SyncOptions): Promise<SyncResult> {
  const outputDir = resolve(options.outputDir);
  if (!existsSync(outputDir)) {
    throw new Error(`Output directory does not exist: ${outputDir}`);
  }

  const previousState = await readExistingRunState(outputDir);
  const runPlan = await readIfExists(join(outputDir, artifactFiles.run_plan));
  const profile = options.profile ?? previousState?.profile ?? detectProfile(runPlan);
  const executionMode = options.executionMode ?? previousState?.execution_mode ?? "local";
  const goal = previousState?.goal ?? detectGoal(runPlan) ?? "Workflow run";
  const now = new Date().toISOString();
  const stages = getWorkflowStagesForProfile(profile);
  const stageStates: Record<string, WorkflowStageState> = {};
  const stageResults: WorkflowStageResult[] = [];

  for (const stage of stages) {
    const requiredArtifacts = getRequiredArtifactsForStage(stage, profile);
    const inspected = await Promise.all(
      requiredArtifacts.map(async (artifact) => inspectArtifact(outputDir, artifactFiles[artifact])),
    );
    const createdArtifacts = inspected.filter((artifact) => artifact.exists).map((artifact) => artifact.file);
    const previousStage = previousState?.stages[stage.id];
    const status = summarizeStageStatus(inspected);
    const updatedAt = previousStage?.updated_at && status === previousStage.status ? previousStage.updated_at : now;

    stageStates[stage.id] = {
      id: stage.id,
      title: stage.title,
      status,
      attempts: createdArtifacts.length > 0 ? Math.max(previousStage?.attempts ?? 0, 1) : previousStage?.attempts ?? 0,
      artifacts: createdArtifacts,
      updated_at: updatedAt,
      error: previousStage?.error,
      notes: previousStage?.notes,
    };

    if (createdArtifacts.length > 0) {
      stageResults.push({
        stage_id: stage.id,
        title: stage.title,
        status,
        artifacts_created: createdArtifacts,
        inputs_used: dedupe(inspected.flatMap((artifact) => artifact.inputsUsed)),
        warnings: stageWarnings(inspected),
        errors: status === "failed" ? [`${stage.id} artifacts indicate failed status.`] : [],
        completed_at: updatedAt,
      });
    }
  }

  const nextState: WorkflowRunState = {
    run_id: previousState?.run_id ?? `${basename(outputDir)}-${Date.now()}`,
    goal,
    profile,
    execution_mode: executionMode,
    status: summarizeRunStatus(Object.values(stageStates).map((stage) => stage.status)),
    output_dir: outputDir,
    created_at: previousState?.created_at ?? now,
    updated_at: now,
    current_stage: undefined,
    stages: stageStates,
  };

  if (!options.preview) {
    await writeSyncedState(outputDir, nextState, stageResults);
  }

  return { previousState, nextState, stageResults };
}

function summarizeStageStatus(artifacts: ArtifactInspection[]): WorkflowStageStatus {
  const existing = artifacts.filter((artifact) => artifact.exists);
  if (!existing.length) {
    return "pending";
  }

  const statuses = existing.map((artifact) => artifact.status ?? "completed");
  if (statuses.includes("failed")) {
    return "failed";
  }

  if (statuses.includes("blocked")) {
    return "blocked";
  }

  if (statuses.includes("partial") || statuses.includes("pending") || existing.length < artifacts.length) {
    return "partial";
  }

  return "completed";
}

async function inspectArtifact(outputDir: string, file: string): Promise<ArtifactInspection> {
  const artifactPath = join(outputDir, file);
  if (!existsSync(artifactPath)) {
    return { file, exists: false, inputsUsed: [] };
  }

  const content = await readFile(artifactPath, "utf8");
  const statusText = readStructuredStatus(content) ?? readMarkdownStatus(content);
  return {
    file,
    exists: true,
    status: statusText ? artifactStatusToStageStatus(statusText, "completed") : "completed",
    inputsUsed: inferInputs(content),
  };
}

function readStructuredStatus(markdown: string): string | undefined {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (frontmatterMatch) {
    const parsed = YAML.load(frontmatterMatch[1]) as unknown;
    if (isObject(parsed)) {
      const direct = readStatusFromObject(parsed);
      if (direct) {
        return direct;
      }

      for (const key of ["schema_payload", "artifact"]) {
        const nested = parsed[key];
        if (isObject(nested)) {
          const nestedStatus = readStatusFromObject(nested);
          if (nestedStatus) {
            return nestedStatus;
          }
        }
      }
    }
  }

  const jsonBlockMatch = markdown.match(/```(?:artifact-json|json)\r?\n([\s\S]*?)\r?\n```/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1]) as unknown;
      if (isObject(parsed)) {
        return readStatusFromObject(parsed);
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function readStatusFromObject(value: JsonObject): string | undefined {
  return typeof value.status === "string" ? value.status : undefined;
}

function inferInputs(content: string): string[] {
  const match = content.match(/## Inputs Used\s+([\s\S]*?)(?:\n## |\n# |$)/);
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/`([^`]+)`|-\s+([^\n]+)/g)]
    .map((item) => item[1] ?? item[2])
    .map((item) => item.trim())
    .filter(Boolean);
}

function stageWarnings(artifacts: ArtifactInspection[]): string[] {
  return artifacts
    .filter((artifact) => !artifact.exists)
    .map((artifact) => `Missing required artifact: ${artifact.file}`);
}

async function writeSyncedState(outputDir: string, state: WorkflowRunState, stageResults: WorkflowStageResult[]): Promise<void> {
  await writeFile(join(outputDir, runStateFileName), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  const resultsDir = join(outputDir, stageResultsDirName);
  await mkdir(resultsDir, { recursive: true });
  await Promise.all(
    stageResults.map((result) => writeFile(join(resultsDir, `${result.stage_id}.json`), `${JSON.stringify(result, null, 2)}\n`, "utf8")),
  );
}

async function readExistingRunState(outputDir: string): Promise<WorkflowRunState | undefined> {
  try {
    return JSON.parse(await readFile(join(outputDir, runStateFileName), "utf8")) as WorkflowRunState;
  } catch {
    return undefined;
  }
}

async function readIfExists(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

function detectGoal(runPlan: string): string | undefined {
  const match = runPlan.match(/## Запрос\s+([\s\S]*?)(?:\n## |\n# |$)/);
  return match?.[1]?.trim() || undefined;
}

function detectProfile(runPlan: string): WorkflowProfile {
  const match = runPlan.match(/## Workflow Profile\s+([\s\S]*?)(?:\n## |\n# |$)/);
  const value = match?.[1]?.trim().toLowerCase();
  return value === "reference" ? "reference" : "standard";
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderSummary(result: SyncResult, outputDir: string, preview: boolean): string {
  const rows = Object.values(result.nextState.stages).map((stage) => {
    const previous = result.previousState?.stages[stage.id]?.status ?? "none";
    const marker = previous === stage.status ? "" : ` (${previous} -> ${stage.status})`;
    return `| ${stage.id} ${stage.title} | ${stage.status}${marker} | ${stage.artifacts.join(", ") || "none"} |`;
  });

  return [
    `Workflow sync ${preview ? "preview" : "written"}: ${relative(process.cwd(), outputDir)}`,
    `Run status: ${result.previousState?.status ?? "none"} -> ${result.nextState.status}`,
    `Run ID: ${result.nextState.run_id}`,
    `Created at: ${result.nextState.created_at}`,
    `Execution mode: ${result.nextState.execution_mode ?? "local"}`,
    "",
    "| Stage | Status | Artifacts |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

function parseArgs(args: string[]): SyncOptions {
  const outputDir = args.find((arg) => !arg.startsWith("--"));
  if (!outputDir) {
    throw new Error("Usage: yarn workflow:sync <outputs/project-slug/YYYY-MM-DD> [--preview] [--profile standard|reference] [--mode local|agentic]");
  }

  const profile = readFlag(args, "--profile");
  if (profile && profile !== "standard" && profile !== "reference") {
    throw new Error("--profile must be standard or reference.");
  }

  const executionMode = readFlag(args, "--mode");
  if (executionMode && executionMode !== "local" && executionMode !== "agentic") {
    throw new Error("--mode must be local or agentic.");
  }

  return {
    outputDir,
    profile: profile as WorkflowProfile | undefined,
    executionMode: executionMode as WorkflowExecutionMode | undefined,
    preview: args.includes("--preview"),
  };
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const result = await syncWorkflowRunState(options);
  console.log(renderSummary(result, resolve(options.outputDir), options.preview));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
