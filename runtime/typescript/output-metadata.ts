import { existsSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { artifactFiles, artifactSchemas, getRequiredArtifactsForStage, getWorkflowStagesForProfile } from "./workflow-stages";
import { artifactStatusToStageStatus, readMarkdownStatus } from "./status-resolver";
import type { WorkflowRunState, WorkflowStageStatus } from "./workflow-state";

export const runMetaFileName = "run-meta.json";
export const artifactManifestFileName = "artifact-manifest.json";

export interface RunMeta {
  project_slug: string;
  run_date: string;
  run_id: string;
  created_at: string;
  updated_at: string;
  workflow_profile: "standard" | "reference";
  execution_mode: "local" | "agentic";
  status: WorkflowStageStatus;
  current_stage?: string;
  source_request: string;
  output_dir: string;
  has_reference: boolean;
  notion_publication: "unknown" | "not_required" | "approved" | "blocked" | "partial";
  last_validated_at?: string;
}

export interface ArtifactManifestEntry {
  artifact_name: string;
  file: string;
  stage_id: string;
  stage_title: string;
  status: WorkflowStageStatus | "missing";
  exists: boolean;
  schema?: string;
  size_bytes?: number;
  updated_at?: string;
}

export interface ArtifactManifest {
  generated_at: string;
  run_id: string;
  workflow_profile: "standard" | "reference";
  artifacts: ArtifactManifestEntry[];
}

export interface WorkflowRunListItem {
  output_dir: string;
  relative_output_dir: string;
  project_slug: string;
  run_date: string;
  run_id: string;
  status: WorkflowStageStatus;
  profile: "standard" | "reference";
  execution_mode: "local" | "agentic";
  updated_at: string;
  current_stage?: string;
  goal: string;
}

export interface WorkflowRunInspection {
  output_dir: string;
  relative_output_dir: string;
  meta?: RunMeta;
  state?: WorkflowRunState;
  manifest?: ArtifactManifest;
  missing_metadata: string[];
  missing_artifacts: ArtifactManifestEntry[];
  blocking_stages: Array<{ stage_id: string; title: string; status: WorkflowStageStatus; error?: string }>;
}

export async function syncOutputMetadata(state: WorkflowRunState): Promise<void> {
  await writeFile(join(state.output_dir, runMetaFileName), `${JSON.stringify(createRunMeta(state), null, 2)}\n`, "utf8");
  await writeFile(join(state.output_dir, artifactManifestFileName), `${JSON.stringify(await createArtifactManifest(state), null, 2)}\n`, "utf8");
}

export function createRunMeta(state: WorkflowRunState): RunMeta {
  const normalizedOutputDir = resolve(state.output_dir);
  return {
    project_slug: basename(dirname(normalizedOutputDir)),
    run_date: basename(normalizedOutputDir),
    run_id: state.run_id,
    created_at: state.created_at,
    updated_at: state.updated_at,
    workflow_profile: state.profile,
    execution_mode: state.execution_mode ?? "local",
    status: state.status,
    current_stage: state.current_stage,
    source_request: state.goal,
    output_dir: normalizedOutputDir,
    has_reference: state.profile === "reference",
    notion_publication: inferNotionPublication(state),
    last_validated_at: inferLastValidatedAt(state),
  };
}

export async function createArtifactManifest(state: WorkflowRunState): Promise<ArtifactManifest> {
  const entries: ArtifactManifestEntry[] = [];

  for (const stage of getWorkflowStagesForProfile(state.profile)) {
    for (const artifactName of getRequiredArtifactsForStage(stage, state.profile)) {
      const file = artifactFiles[artifactName];
      const path = join(state.output_dir, file);
      const fileStat = existsSync(path) ? await stat(path) : undefined;
      const content = fileStat ? await readFile(path, "utf8").catch(() => "") : "";

      entries.push({
        artifact_name: artifactName,
        file,
        stage_id: stage.id,
        stage_title: stage.title,
        status: fileStat ? artifactStatusToStageStatus(readMarkdownStatus(content) ?? "", state.stages[stage.id]?.status ?? "completed") : "missing",
        exists: Boolean(fileStat),
        schema: artifactSchemas[artifactName],
        size_bytes: fileStat?.size,
        updated_at: fileStat?.mtime.toISOString(),
      });
    }
  }

  return {
    generated_at: new Date().toISOString(),
    run_id: state.run_id,
    workflow_profile: state.profile,
    artifacts: entries,
  };
}

export async function listWorkflowRuns(baseDir = resolve(process.cwd(), "outputs")): Promise<WorkflowRunListItem[]> {
  if (!existsSync(baseDir)) {
    return [];
  }

  const runDirs = await findRunDirectories(baseDir);
  const items = await Promise.all(runDirs.map(readRunListItem));
  return items
    .filter((item): item is WorkflowRunListItem => Boolean(item))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function formatWorkflowRunList(items: WorkflowRunListItem[]): string {
  if (!items.length) {
    return "Workflow runs: none";
  }

  return [
    "| Updated | Status | Profile | Mode | Run | Current stage | Goal |",
    "|---|---|---|---|---|---|---|",
    ...items.map((item) => [
      item.updated_at,
      item.status,
      item.profile,
      item.execution_mode,
      item.relative_output_dir,
      item.current_stage ?? "",
      item.goal,
    ].map(formatTableCell).join(" | ")).map((row) => `| ${row} |`),
  ].join("\n");
}

export async function inspectWorkflowRun(outputDirInput: string): Promise<WorkflowRunInspection> {
  const outputDir = resolve(process.cwd(), outputDirInput);
  if (!existsSync(outputDir)) {
    throw new Error(`Output directory does not exist: ${outputDir}`);
  }

  const state = await readJson<WorkflowRunState>(join(outputDir, "run-state.json"));
  const meta = await readJson<RunMeta>(join(outputDir, runMetaFileName));
  const manifest = await readJson<ArtifactManifest>(join(outputDir, artifactManifestFileName));
  const missingMetadata = [
    ["run-state.json", state],
    [runMetaFileName, meta],
    [artifactManifestFileName, manifest],
  ]
    .filter(([, value]) => !value)
    .map(([file]) => String(file));

  const manifestArtifacts = manifest?.artifacts
    ?? (state || meta ? await createArtifactManifestFromInspectionState(outputDir, state, meta) : []);
  const blockingStages = state
    ? Object.values(state.stages)
      .filter((stage) => stage.status === "blocked" || stage.status === "failed" || stage.status === "partial")
      .map((stage) => ({
        stage_id: stage.id,
        title: stage.title,
        status: stage.status,
        error: stage.error,
      }))
    : [];

  return {
    output_dir: outputDir,
    relative_output_dir: relative(process.cwd(), outputDir),
    meta,
    state,
    manifest,
    missing_metadata: missingMetadata,
    missing_artifacts: manifestArtifacts.filter((artifact) => !artifact.exists),
    blocking_stages: blockingStages,
  };
}

export function formatWorkflowRunInspection(inspection: WorkflowRunInspection): string {
  const meta = inspection.meta;
  const state = inspection.state;
  const manifest = inspection.manifest;
  const status = meta?.status ?? state?.status ?? "unknown";
  const profile = meta?.workflow_profile ?? state?.profile ?? "unknown";
  const mode = meta?.execution_mode ?? state?.execution_mode ?? "unknown";
  const goal = meta?.source_request ?? state?.goal ?? "unknown";
  const currentStage = meta?.current_stage ?? state?.current_stage ?? "";

  return [
    "# Workflow Run Inspect",
    "",
    `- Run: ${inspection.relative_output_dir}`,
    `- Status: ${status}`,
    `- Profile: ${profile}`,
    `- Execution mode: ${mode}`,
    `- Current stage: ${currentStage || "none"}`,
    `- Updated: ${meta?.updated_at ?? state?.updated_at ?? "unknown"}`,
    `- Goal: ${goal}`,
    "",
    "## Metadata",
    "",
    inspection.missing_metadata.length
      ? `Missing: ${inspection.missing_metadata.map((file) => `\`${file}\``).join(", ")}`
      : "All metadata files are present.",
    "",
    "## Blocking Stages",
    "",
    inspection.blocking_stages.length
      ? [
        "| Stage | Status | Error |",
        "|---|---|---|",
        ...inspection.blocking_stages.map((stage) => `| ${formatTableCell(`${stage.stage_id} ${stage.title}`)} | ${stage.status} | ${formatTableCell(stage.error ?? "")} |`),
      ].join("\n")
      : "No blocked, failed or partial stages.",
    "",
    "## Missing Artifacts",
    "",
    inspection.missing_artifacts.length
      ? [
        "| Stage | Artifact | File |",
        "|---|---|---|",
        ...inspection.missing_artifacts.map((artifact) => `| ${formatTableCell(`${artifact.stage_id} ${artifact.stage_title}`)} | ${artifact.artifact_name} | ${artifact.file} |`),
      ].join("\n")
      : "No missing required artifacts in manifest.",
    "",
    "## Artifact Summary",
    "",
    manifest
      ? [
        "| Stage | File | Status | Size |",
        "|---|---|---|---:|",
        ...manifest.artifacts.map((artifact) => `| ${formatTableCell(`${artifact.stage_id} ${artifact.stage_title}`)} | ${artifact.file} | ${artifact.status} | ${artifact.size_bytes ?? 0} |`),
      ].join("\n")
      : "Artifact manifest is missing. Run `yarn workflow:sync <run>` to regenerate metadata.",
  ].join("\n");
}

async function findRunDirectories(dir: string): Promise<string[]> {
  if (existsSync(join(dir, "run-state.json")) || existsSync(join(dir, runMetaFileName))) {
    return [dir];
  }

  const items = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    items
      .filter((item) => item.isDirectory() && ![".git", "node_modules", "products"].includes(item.name))
      .map((item) => findRunDirectories(join(dir, item.name))),
  );

  return nested.flat();
}

async function readRunListItem(outputDir: string): Promise<WorkflowRunListItem | undefined> {
  const state = await readJson<WorkflowRunState>(join(outputDir, "run-state.json"));
  const meta = await readJson<RunMeta>(join(outputDir, runMetaFileName));
  if (!state && !meta) {
    return undefined;
  }

  const normalizedOutputDir = resolve(outputDir);
  return {
    output_dir: normalizedOutputDir,
    relative_output_dir: relative(process.cwd(), normalizedOutputDir),
    project_slug: meta?.project_slug ?? basename(dirname(normalizedOutputDir)),
    run_date: meta?.run_date ?? basename(normalizedOutputDir),
    run_id: meta?.run_id ?? state?.run_id ?? basename(normalizedOutputDir),
    status: meta?.status ?? state?.status ?? "pending",
    profile: meta?.workflow_profile ?? state?.profile ?? "standard",
    execution_mode: meta?.execution_mode ?? state?.execution_mode ?? "local",
    updated_at: meta?.updated_at ?? state?.updated_at ?? "",
    current_stage: meta?.current_stage ?? state?.current_stage,
    goal: meta?.source_request ?? state?.goal ?? "Workflow run",
  };
}

async function createArtifactManifestFromInspectionState(
  outputDir: string,
  state?: WorkflowRunState,
  meta?: RunMeta,
): Promise<ArtifactManifestEntry[]> {
  if (state) {
    return (await createArtifactManifest({ ...state, output_dir: outputDir })).artifacts;
  }

  const profile = meta?.workflow_profile ?? "standard";
  return getWorkflowStagesForProfile(profile).flatMap((stage) =>
    getRequiredArtifactsForStage(stage, profile).map((artifactName) => ({
      artifact_name: artifactName,
      file: artifactFiles[artifactName],
      stage_id: stage.id,
      stage_title: stage.title,
      status: "missing" as const,
      exists: false,
      schema: artifactSchemas[artifactName],
    })),
  );
}

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function inferNotionPublication(state: WorkflowRunState): RunMeta["notion_publication"] {
  const release = state.stages["12-release"];
  if (release?.status === "blocked") {
    return "blocked";
  }

  if (release?.status === "partial") {
    return "partial";
  }

  return "unknown";
}

function inferLastValidatedAt(state: WorkflowRunState): string | undefined {
  return Object.values(state.stages)
    .filter((stage) => stage.status === "completed" || stage.status === "partial" || stage.status === "blocked")
    .map((stage) => stage.updated_at)
    .sort()
    .at(-1);
}

function formatTableCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}
