import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { approvalStateFileName } from "./approval-gate";
import { artifactNames, routeTools } from "./route.config";
import { artifactFiles, artifactSchemas, getRequiredArtifactsForStage, getWorkflowStagesForProfile } from "./workflow-stages";
import { artifactStatusToStageStatus, readMarkdownStatus } from "./status-resolver";
import { runStateFileName, type WorkflowRunState, type WorkflowStageStatus } from "./workflow-state";

export const runMetaFileName = "run-meta.json";
export const artifactManifestFileName = "artifact-manifest.json";
export const runIndexFileName = "run-index.md";

export type ArtifactType = "state" | "manifest" | "product_artifact" | "evidence" | "external_record" | "export";
export type ArtifactLifecycle = "active" | "draft" | "blocked" | "partial" | "archived" | "temporary";

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
  artifact_type: ArtifactType;
  stage_id: string;
  stage_title: string;
  producer_stage: string;
  producer_agent: string;
  consumers: string[];
  status: WorkflowStageStatus | "missing";
  exists: boolean;
  human_readable: boolean;
  safe_to_publish: boolean;
  lifecycle: ArtifactLifecycle;
  schema?: string;
  size_bytes?: number;
  updated_at?: string;
  checksum_sha256?: string;
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
  const manifest = await createArtifactManifest(state);
  await writeFile(join(state.output_dir, artifactManifestFileName), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(join(state.output_dir, runIndexFileName), renderRunIndex(state, manifest), "utf8");
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
  const seenFiles = new Set<string>();

  for (const stage of getWorkflowStagesForProfile(state.profile)) {
    for (const artifactName of getRequiredArtifactsForStage(stage, state.profile)) {
      const file = artifactFiles[artifactName];
      const path = join(state.output_dir, file);
      const fileStat = existsSync(path) ? await stat(path) : undefined;
      const content = fileStat ? await readFile(path, "utf8").catch(() => "") : "";

      entries.push({
        artifact_name: artifactName,
        file,
        artifact_type: classifyArtifact(artifactName),
        stage_id: stage.id,
        stage_title: stage.title,
        producer_stage: stage.id,
        producer_agent: stage.owner,
        consumers: findArtifactConsumers(artifactName),
        status: fileStat ? artifactStatusToStageStatus(readMarkdownStatus(content) ?? "", state.stages[stage.id]?.status ?? "completed") : "missing",
        exists: Boolean(fileStat),
        human_readable: isHumanReadableArtifact(artifactName, file),
        safe_to_publish: isSafeToPublishArtifact(artifactName),
        lifecycle: inferArtifactLifecycle(fileStat ? artifactStatusToStageStatus(readMarkdownStatus(content) ?? "", state.stages[stage.id]?.status ?? "completed") : "missing"),
        schema: artifactSchemas[artifactName],
        size_bytes: fileStat?.size,
        updated_at: fileStat?.mtime.toISOString(),
        checksum_sha256: fileStat ? sha256(content) : undefined,
      });
      seenFiles.add(file);
    }
  }

  entries.push(...await createDiscoveredArtifactEntries(state, seenFiles));

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

  const manifestArtifacts = manifest
    ? await normalizeManifestArtifacts(outputDir, manifest.artifacts, state, meta)
    : (state || meta ? await createArtifactManifestFromInspectionState(outputDir, state, meta) : []);
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
    manifest: manifest
      ? { ...manifest, artifacts: manifestArtifacts }
      : (state || meta ? createSyntheticManifest(state, meta, manifestArtifacts) : undefined),
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

export function formatWorkflowOutputsGuide(inspection: WorkflowRunInspection): string {
  const manifestArtifacts = [
    ...createLedgerMetadataArtifacts(inspection),
    ...(inspection.manifest?.artifacts ?? []),
  ];
  const groups = groupArtifactsByType(manifestArtifacts);

  return [
    "# Workflow Outputs Guide",
    "",
    `- Run: ${inspection.relative_output_dir}`,
    `- Status: ${inspection.meta?.status ?? inspection.state?.status ?? "unknown"}`,
    `- Current stage: ${inspection.meta?.current_stage ?? inspection.state?.current_stage ?? "none"}`,
    "",
    "## What To Read First",
    "",
    firstReadableFiles(manifestArtifacts).length
      ? firstReadableFiles(manifestArtifacts).map((artifact) => `- \`${artifact.file}\` (${artifact.artifact_name}, ${artifact.status})`).join("\n")
      : "- No readable artifacts are available yet.",
    "",
    "## Blocking Work",
    "",
    inspection.blocking_stages.length
      ? inspection.blocking_stages.map((stage) => `- ${stage.stage_id} ${stage.title}: ${stage.status}${stage.error ? ` - ${stage.error}` : ""}`).join("\n")
      : "- No blocked, failed or partial stages.",
    "",
    "## Artifact Groups",
    "",
    ...(["product_artifact", "evidence", "export", "external_record", "manifest", "state"] as ArtifactType[])
      .flatMap((type) => renderArtifactGroup(type, groups.get(type) ?? [])),
    "",
    "## Next Action",
    "",
    inferNextAction(inspection),
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
      artifact_type: classifyArtifact(artifactName),
      stage_id: stage.id,
      stage_title: stage.title,
      producer_stage: stage.id,
      producer_agent: stage.owner,
      consumers: findArtifactConsumers(artifactName),
      status: "missing" as const,
      exists: false,
      human_readable: isHumanReadableArtifact(artifactName, artifactFiles[artifactName]),
      safe_to_publish: isSafeToPublishArtifact(artifactName),
      lifecycle: "draft" as const,
      schema: artifactSchemas[artifactName],
    })),
  );
}

async function normalizeManifestArtifacts(
  outputDir: string,
  artifacts: ArtifactManifestEntry[],
  state?: WorkflowRunState,
  meta?: RunMeta,
): Promise<ArtifactManifestEntry[]> {
  const profile = state?.profile ?? meta?.workflow_profile ?? "standard";
  const stageById = new Map(getWorkflowStagesForProfile(profile).map((stage) => [stage.id, stage]));

  return Promise.all(artifacts.map(async (artifact) => {
    const file = artifact.file;
    const artifactName = artifact.artifact_name;
    const stage = stageById.get(artifact.stage_id);
    const path = join(outputDir, file);
    const fileStat = existsSync(path) ? await stat(path) : undefined;
    const content = fileStat ? await readFile(path, "utf8").catch(() => "") : "";
    const fallbackStatus = artifact.status === "missing" ? "completed" : artifact.status;
    const status = fileStat
      ? artifactStatusToStageStatus(readMarkdownStatus(content) ?? "", state?.stages[artifact.stage_id]?.status ?? fallbackStatus)
      : "missing";

    return {
      ...artifact,
      artifact_type: artifact.artifact_type ?? classifyArtifact(artifactName),
      producer_stage: artifact.producer_stage ?? artifact.stage_id,
      producer_agent: artifact.producer_agent ?? stage?.owner ?? "unknown",
      consumers: artifact.consumers ?? findArtifactConsumers(artifactName),
      status,
      exists: Boolean(fileStat),
      human_readable: artifact.human_readable ?? isHumanReadableArtifact(artifactName, file),
      safe_to_publish: artifact.safe_to_publish ?? isSafeToPublishArtifact(artifactName),
      lifecycle: artifact.lifecycle ?? inferArtifactLifecycle(status),
      schema: artifact.schema ?? artifactSchemas[artifactName],
      size_bytes: fileStat?.size ?? artifact.size_bytes,
      updated_at: fileStat?.mtime.toISOString() ?? artifact.updated_at,
      checksum_sha256: fileStat ? sha256(content) : artifact.checksum_sha256,
    };
  }));
}

function createSyntheticManifest(
  state: WorkflowRunState | undefined,
  meta: RunMeta | undefined,
  artifacts: ArtifactManifestEntry[],
): ArtifactManifest {
  return {
    generated_at: new Date().toISOString(),
    run_id: state?.run_id ?? meta?.run_id ?? "unknown",
    workflow_profile: state?.profile ?? meta?.workflow_profile ?? "standard",
    artifacts,
  };
}

function createLedgerMetadataArtifacts(inspection: WorkflowRunInspection): ArtifactManifestEntry[] {
  return [
    createLedgerMetadataArtifact(inspection, runStateFileName, "state", "run_state", Boolean(inspection.state), false),
    createLedgerMetadataArtifact(inspection, runMetaFileName, "state", "run_meta", Boolean(inspection.meta), false),
    createLedgerMetadataArtifact(inspection, artifactManifestFileName, "manifest", "artifact_manifest", Boolean(inspection.manifest), false),
    createLedgerMetadataArtifact(inspection, runIndexFileName, "manifest", "run_index", existsSync(join(inspection.output_dir, runIndexFileName)), true),
  ];
}

function createLedgerMetadataArtifact(
  inspection: WorkflowRunInspection,
  file: string,
  artifactType: ArtifactType,
  artifactName: string,
  exists: boolean,
  humanReadable: boolean,
): ArtifactManifestEntry {
  return {
    artifact_name: artifactName,
    file,
    artifact_type: artifactType,
    stage_id: "run-ledger",
    stage_title: "Run Ledger",
    producer_stage: "runtime",
    producer_agent: "workflow-runtime",
    consumers: ["orchestrator", "workflow:inspect", "workflow:outputs", "workflow:validate"],
    status: exists ? "completed" : "missing",
    exists,
    human_readable: humanReadable,
    safe_to_publish: false,
    lifecycle: exists ? "active" : "draft",
  };
}

async function createDiscoveredArtifactEntries(
  state: WorkflowRunState,
  seenFiles: Set<string>,
): Promise<ArtifactManifestEntry[]> {
  const discovered = [
    {
      artifactName: artifactNames.notionPrdExport,
      file: artifactFiles[artifactNames.notionPrdExport],
      artifactType: "export" as const,
      producerStage: "optional-notion-prd-export",
      producerAgent: routeTools.notionPrdExport.agent,
      stageTitle: "Notion PRD Export",
      humanReadable: true,
      safeToPublish: true,
    },
    {
      artifactName: "notion_research_export_ru",
      file: "notion-research-export-ru.md",
      artifactType: "export" as const,
      producerStage: "01-research",
      producerAgent: "notion-publisher",
      stageTitle: "Notion Research Export",
      humanReadable: true,
      safeToPublish: true,
    },
    {
      artifactName: artifactNames.styleGuide,
      file: artifactFiles[artifactNames.styleGuide],
      artifactType: "product_artifact" as const,
      producerStage: "04-design",
      producerAgent: routeTools.design.agent,
      stageTitle: "Style Decomposition",
      humanReadable: true,
      safeToPublish: false,
    },
    {
      artifactName: artifactNames.designGeneratorPrompt,
      file: artifactFiles[artifactNames.designGeneratorPrompt],
      artifactType: "product_artifact" as const,
      producerStage: "06-screens",
      producerAgent: routeTools.screens.agent,
      stageTitle: "Design Generator Prompt",
      humanReadable: true,
      safeToPublish: false,
    },
    {
      artifactName: artifactNames.designLoopReport,
      file: artifactFiles[artifactNames.designLoopReport],
      artifactType: "evidence" as const,
      producerStage: "06-screens",
      producerAgent: routeTools.screens.agent,
      stageTitle: "Design Loop Evidence",
      humanReadable: true,
      safeToPublish: false,
    },
    {
      artifactName: artifactNames.figmaHandoffBundle,
      file: artifactFiles[artifactNames.figmaHandoffBundle],
      artifactType: "export" as const,
      producerStage: "optional-figma-handoff",
      producerAgent: routeTools.design.agent,
      stageTitle: "Figma Handoff Bundle",
      humanReadable: true,
      safeToPublish: false,
    },
    {
      artifactName: artifactNames.storybookResult,
      file: artifactFiles[artifactNames.storybookResult],
      artifactType: "evidence" as const,
      producerStage: "optional-storybook-export",
      producerAgent: routeTools.frontend.agent,
      stageTitle: "Storybook Export Evidence",
      humanReadable: true,
      safeToPublish: false,
    },
    {
      artifactName: "approval_state",
      file: approvalStateFileName,
      artifactType: "external_record" as const,
      producerStage: "runtime",
      producerAgent: "approval-gate",
      stageTitle: "Approval Records",
      humanReadable: false,
      safeToPublish: false,
    },
    {
      artifactName: "notion_publication_result",
      file: "notion-publication-result.md",
      artifactType: "external_record" as const,
      producerStage: "12-release",
      producerAgent: "notion-publisher",
      stageTitle: "Notion Publication Result",
      humanReadable: true,
      safeToPublish: false,
    },
    {
      artifactName: "visual_diff_result",
      file: "visual-diff-result.json",
      artifactType: "evidence" as const,
      producerStage: "09-visual-reference",
      producerAgent: "visual-diff-verifier",
      stageTitle: "Visual Diff Evidence",
      humanReadable: false,
      safeToPublish: false,
    },
    {
      artifactName: "visual_section_diff_result",
      file: "visual-section-diff-result.json",
      artifactType: "evidence" as const,
      producerStage: "09-visual-reference",
      producerAgent: "visual-diff-verifier",
      stageTitle: "Visual Section Diff Evidence",
      humanReadable: false,
      safeToPublish: false,
    },
    {
      artifactName: "visual_section_diff_summary",
      file: "visual-section-diff-summary.md",
      artifactType: "evidence" as const,
      producerStage: "09-visual-reference",
      producerAgent: "visual-diff-verifier",
      stageTitle: "Visual Section Diff Evidence",
      humanReadable: true,
      safeToPublish: false,
    },
  ];

  const entries: ArtifactManifestEntry[] = [];
  for (const item of discovered) {
    if (seenFiles.has(item.file)) {
      continue;
    }

    const path = join(state.output_dir, item.file);
    if (!existsSync(path)) {
      continue;
    }

    const fileStat = await stat(path);
    const content = await readFile(path, "utf8").catch(() => "");
    entries.push({
      artifact_name: item.artifactName,
      file: item.file,
      artifact_type: item.artifactType,
      stage_id: item.producerStage,
      stage_title: item.stageTitle,
      producer_stage: item.producerStage,
      producer_agent: item.producerAgent,
      consumers: findArtifactConsumers(item.artifactName),
      status: artifactStatusToStageStatus(readMarkdownStatus(content) ?? "", "completed"),
      exists: true,
      human_readable: item.humanReadable,
      safe_to_publish: item.safeToPublish,
      lifecycle: "active",
      schema: artifactSchemas[item.artifactName],
      size_bytes: fileStat.size,
      updated_at: fileStat.mtime.toISOString(),
      checksum_sha256: sha256(content),
    });
    seenFiles.add(item.file);
  }

  return entries;
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

function renderRunIndex(state: WorkflowRunState, manifest: ArtifactManifest): string {
  const completed = manifest.artifacts.filter((artifact) => artifact.exists && artifact.status === "completed");
  const blocked = Object.values(state.stages).filter((stage) => ["blocked", "failed", "partial"].includes(stage.status));
  const readable = firstReadableFiles(manifest.artifacts);

  return [
    "# Run Index",
    "",
    `- Run ID: ${state.run_id}`,
    `- Goal: ${state.goal}`,
    `- Status: ${state.status}`,
    `- Profile: ${state.profile}`,
    `- Execution mode: ${state.execution_mode ?? "local"}`,
    `- Current stage: ${state.current_stage ?? "none"}`,
    `- Updated: ${state.updated_at}`,
    "",
    "## What To Read First",
    "",
    readable.length
      ? readable.map((artifact) => `- \`${artifact.file}\` (${artifact.artifact_name}, ${artifact.status})`).join("\n")
      : "- No readable artifacts are available yet.",
    "",
    "## Progress",
    "",
    `- Completed artifacts: ${completed.length}/${manifest.artifacts.length}`,
    `- Blocking stages: ${blocked.length}`,
    "",
    "## Blocking Stages",
    "",
    blocked.length
      ? blocked.map((stage) => `- ${stage.id} ${stage.title}: ${stage.status}${stage.error ? ` - ${stage.error}` : ""}`).join("\n")
      : "- No blocked, failed or partial stages.",
    "",
    "## Artifact Groups",
    "",
    ...(["product_artifact", "evidence", "export", "external_record"] as ArtifactType[])
      .flatMap((type) => renderArtifactGroup(type, groupArtifactsByType(manifest.artifacts).get(type) ?? [])),
    "",
    "## Next Action",
    "",
    inferNextActionFromState(state, manifest),
  ].join("\n") + "\n";
}

function classifyArtifact(artifactName: string): ArtifactType {
  if (artifactName === "notion_research_export_ru" || artifactName === artifactNames.notionPrdExport) {
    return "export";
  }

  if (artifactName === artifactNames.figmaHandoffBundle) {
    return "export";
  }

  if (
    artifactName === artifactNames.visualReferenceReview ||
    artifactName === artifactNames.testBenchResult ||
    artifactName === artifactNames.qaReport ||
    artifactName === artifactNames.designLoopReport ||
    artifactName === artifactNames.storybookResult
  ) {
    return "evidence";
  }

  if (artifactName === artifactNames.releaseNotes) {
    return "external_record";
  }

  return "product_artifact";
}

function findArtifactConsumers(artifactName: string): string[] {
  return [...new Set(
    Object.values(routeTools)
      .filter((route) => [
        ...route.inputs,
        ...readOptionalStringArray(route, "referenceInputs"),
        ...route.dependsOn,
        ...readOptionalStringArray(route, "referenceDependsOn"),
      ].includes(artifactName))
      .map((route) => route.stageId ?? route.agent)
      .filter(Boolean),
  )];
}

function isHumanReadableArtifact(artifactName: string, file: string): boolean {
  return file.endsWith(".md") && !["run_state", "artifact_manifest"].includes(artifactName);
}

function isSafeToPublishArtifact(artifactName: string): boolean {
  const safeArtifacts: readonly string[] = [
    artifactNames.researchSummary,
    artifactNames.competitiveAnalysis,
    artifactNames.protoPersonas,
    artifactNames.syntheticInterviews,
    artifactNames.swot,
    artifactNames.prd,
    artifactNames.iaBrief,
    artifactNames.styleGuide,
    artifactNames.designBrief,
    artifactNames.screens,
    artifactNames.copyDeck,
    artifactNames.prototypeReport,
    artifactNames.notionPrdExport,
  ];
  return safeArtifacts.includes(artifactName);
}

function inferArtifactLifecycle(status: WorkflowStageStatus | "missing"): ArtifactLifecycle {
  if (status === "completed") {
    return "active";
  }

  if (status === "blocked" || status === "failed") {
    return "blocked";
  }

  if (status === "partial") {
    return "partial";
  }

  return "draft";
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function groupArtifactsByType(artifacts: ArtifactManifestEntry[]): Map<ArtifactType, ArtifactManifestEntry[]> {
  const groups = new Map<ArtifactType, ArtifactManifestEntry[]>();
  for (const artifact of artifacts) {
    groups.set(artifact.artifact_type, [...(groups.get(artifact.artifact_type) ?? []), artifact]);
  }

  return groups;
}

function firstReadableFiles(artifacts: ArtifactManifestEntry[]): ArtifactManifestEntry[] {
  const preferred = [
    "run_index",
    artifactNames.recursiveBrief,
    artifactNames.researchSummary,
    artifactNames.prd,
    artifactNames.iaBrief,
    artifactNames.styleGuide,
    artifactNames.designBrief,
    artifactNames.designLoopReport,
    artifactNames.screens,
    artifactNames.copyDeck,
    artifactNames.prototypeReport,
    artifactNames.frontendResult,
    artifactNames.storybookResult,
    artifactNames.qaReport,
    artifactNames.releaseNotes,
  ];

  const preferredOrder = new Map<string, number>(preferred.map((artifactName, index) => [artifactName, index]));

  return artifacts
    .filter((artifact) => artifact.exists && artifact.human_readable)
    .sort((a, b) => (preferredOrder.get(a.artifact_name) ?? 999) - (preferredOrder.get(b.artifact_name) ?? 999))
    .slice(0, 8);
}

function readOptionalStringArray(value: unknown, key: string): readonly string[] {
  if (!value || typeof value !== "object" || !(key in value)) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const maybeArray = record[key];
  return Array.isArray(maybeArray) && maybeArray.every((item) => typeof item === "string")
    ? maybeArray
    : [];
}

function renderArtifactGroup(type: ArtifactType, artifacts: ArtifactManifestEntry[]): string[] {
  const title = type.replaceAll("_", " ");
  if (!artifacts.length) {
    return [`### ${title}`, "", "- none", ""];
  }

  return [
    `### ${title}`,
    "",
    "| File | Status | Producer | Safe to publish |",
    "|---|---|---|---|",
    ...artifacts.map((artifact) => `| ${artifact.file} | ${artifact.status} | ${artifact.producer_stage} ${artifact.producer_agent} | ${artifact.safe_to_publish ? "yes" : "no"} |`),
    "",
  ];
}

function inferNextAction(inspection: WorkflowRunInspection): string {
  if (inspection.missing_metadata.length) {
    return `Run \`yarn workflow:sync ${inspection.relative_output_dir}\` to regenerate missing metadata.`;
  }

  if (inspection.blocking_stages.length) {
    const first = inspection.blocking_stages[0];
    return `Resolve ${first.stage_id} ${first.title} (${first.status}) before continuing.`;
  }

  if (inspection.missing_artifacts.length) {
    const first = inspection.missing_artifacts[0];
    return `Create or rerun required artifact \`${first.file}\` for ${first.stage_id}.`;
  }

  return "Run validation or continue with the next workflow stage.";
}

function inferNextActionFromState(state: WorkflowRunState, manifest: ArtifactManifest): string {
  const blocking = Object.values(state.stages).find((stage) => ["blocked", "failed", "partial"].includes(stage.status));
  if (blocking) {
    return `Resolve ${blocking.id} ${blocking.title} (${blocking.status}) before continuing.`;
  }

  const missing = manifest.artifacts.find((artifact) => !artifact.exists);
  if (missing) {
    return `Create or rerun required artifact \`${missing.file}\` for ${missing.stage_id}.`;
  }

  return "Run final validation or prepare release handoff.";
}

function formatTableCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}
