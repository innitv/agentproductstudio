import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type WorkflowStageStatus =
  | "pending"
  | "running"
  | "completed"
  | "partial"
  | "blocked"
  | "failed"
  | "skipped";

export interface WorkflowStageState {
  id: string;
  title: string;
  status: WorkflowStageStatus;
  attempts: number;
  artifacts: string[];
  updated_at: string;
  error?: string;
  notes?: string[];
}

export interface WorkflowRunState {
  run_id: string;
  goal: string;
  profile: "standard" | "reference";
  status: WorkflowStageStatus;
  output_dir: string;
  created_at: string;
  updated_at: string;
  current_stage?: string;
  stages: Record<string, WorkflowStageState>;
}

export interface WorkflowStageResult {
  stage_id: string;
  title: string;
  status: WorkflowStageStatus;
  artifacts_created: string[];
  inputs_used: string[];
  warnings: string[];
  errors: string[];
  next_stage?: string;
  completed_at: string;
}

export const runStateFileName = "run-state.json";
export const stageResultsDirName = "stage-results";

export async function readRunState(outputDir: string): Promise<WorkflowRunState> {
  const statePath = join(outputDir, runStateFileName);
  return JSON.parse(await readFile(statePath, "utf8")) as WorkflowRunState;
}

export async function writeRunState(state: WorkflowRunState): Promise<void> {
  await writeFile(join(state.output_dir, runStateFileName), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function hasRunState(outputDir: string): boolean {
  return existsSync(join(outputDir, runStateFileName));
}

export async function writeStageResult(outputDir: string, result: WorkflowStageResult): Promise<void> {
  const resultsDir = join(outputDir, stageResultsDirName);
  await mkdir(resultsDir, { recursive: true });
  await writeFile(join(resultsDir, `${result.stage_id}.json`), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

export function nowIso(): string {
  return new Date().toISOString();
}

