import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, stat } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

interface RunStateSummary {
  status?: string;
  profile?: string;
  goal?: string;
}

export interface CleanupTempOptions {
  baseDir?: string;
  force?: boolean;
}

export interface CleanupTempCandidate {
  path: string;
  relative_path: string;
  size_bytes: number;
}

export interface CleanupTempResult {
  base_dir: string;
  force: boolean;
  candidates: CleanupTempCandidate[];
  removed: string[];
}

export interface ArchiveWorkflowRunOptions {
  outputDir: string;
  targetRoot?: string;
  quarantine?: boolean;
  force?: boolean;
}

export interface ArchiveWorkflowRunResult {
  source_dir: string;
  target_dir: string;
  force: boolean;
  moved: boolean;
  status?: string;
  profile?: string;
  goal?: string;
}

export async function cleanupTempOutputs(options: CleanupTempOptions = {}): Promise<CleanupTempResult> {
  const baseDir = resolve(process.cwd(), options.baseDir ?? "outputs/temp");
  assertTempOutputDir(baseDir);

  if (!existsSync(baseDir)) {
    return {
      base_dir: baseDir,
      force: Boolean(options.force),
      candidates: [],
      removed: [],
    };
  }

  const candidates = await listCleanupCandidates(baseDir);
  const removed: string[] = [];
  if (options.force) {
    for (const candidate of candidates) {
      await rm(candidate.path, { recursive: true, force: true });
      removed.push(candidate.relative_path);
    }
  }

  return {
    base_dir: baseDir,
    force: Boolean(options.force),
    candidates,
    removed,
  };
}

export function formatCleanupTempResult(result: CleanupTempResult): string {
  const mode = result.force ? "force" : "dry-run";
  return [
    "# Workflow Temp Cleanup",
    "",
    `- Mode: ${mode}`,
    `- Base: ${relative(process.cwd(), result.base_dir) || result.base_dir}`,
    `- Candidates: ${result.candidates.length}`,
    `- Removed: ${result.removed.length}`,
    "",
    result.candidates.length
      ? [
        "| Path | Size bytes | Action |",
        "|---|---:|---|",
        ...result.candidates.map((candidate) => `| ${candidate.relative_path} | ${candidate.size_bytes} | ${result.force ? "removed" : "would remove"} |`),
      ].join("\n")
      : "No temp output candidates found.",
  ].join("\n");
}

export async function archiveWorkflowRun(options: ArchiveWorkflowRunOptions): Promise<ArchiveWorkflowRunResult> {
  const sourceDir = resolve(process.cwd(), options.outputDir);
  if (!existsSync(sourceDir)) {
    throw new Error(`Output directory does not exist: ${sourceDir}`);
  }

  assertArchivableRunDir(sourceDir);

  const state = await readRunStateSummary(sourceDir);
  if (state?.status === "running" && !options.force) {
    throw new Error("Refusing to archive running workflow without --force.");
  }

  const projectSlug = basename(dirname(sourceDir));
  const runDate = basename(sourceDir);
  const targetRoot = resolve(process.cwd(), options.targetRoot ?? (options.quarantine ? "outputs/quarantine" : "outputs/archive"));
  const targetDir = join(targetRoot, projectSlug, runDate);

  if (existsSync(targetDir)) {
    throw new Error(`Archive target already exists: ${targetDir}`);
  }

  if (options.force) {
    await mkdir(dirname(targetDir), { recursive: true });
    await rename(sourceDir, targetDir);
  }

  return {
    source_dir: sourceDir,
    target_dir: targetDir,
    force: Boolean(options.force),
    moved: Boolean(options.force),
    status: state?.status,
    profile: state?.profile,
    goal: state?.goal,
  };
}

export function formatArchiveWorkflowRunResult(result: ArchiveWorkflowRunResult): string {
  return [
    "# Workflow Archive",
    "",
    `- Mode: ${result.force ? "force" : "dry-run"}`,
    `- Source: ${relative(process.cwd(), result.source_dir) || result.source_dir}`,
    `- Target: ${relative(process.cwd(), result.target_dir) || result.target_dir}`,
    `- Moved: ${result.moved ? "yes" : "no"}`,
    `- Status: ${result.status ?? "unknown"}`,
    `- Profile: ${result.profile ?? "unknown"}`,
    `- Goal: ${result.goal ?? "unknown"}`,
    "",
    result.force
      ? "Run was moved to the archive target."
      : "Dry-run only. Re-run with `--force` to move this run.",
  ].join("\n");
}

async function listCleanupCandidates(baseDir: string): Promise<CleanupTempCandidate[]> {
  const items = await readdir(baseDir, { withFileTypes: true }).catch(() => []);
  const candidates = await Promise.all(
    items
      .filter((item) => item.isDirectory() && !item.name.startsWith("."))
      .map(async (item) => {
        const path = join(baseDir, item.name);
        return {
          path,
          relative_path: relative(process.cwd(), path),
          size_bytes: await directorySize(path),
        };
      }),
  );

  return candidates.sort((a, b) => a.relative_path.localeCompare(b.relative_path));
}

async function directorySize(path: string): Promise<number> {
  const stats = await stat(path).catch(() => undefined);
  if (!stats) {
    return 0;
  }

  if (stats.isFile()) {
    return stats.size;
  }

  if (!stats.isDirectory()) {
    return 0;
  }

  const items = await readdir(path, { withFileTypes: true }).catch(() => []);
  const sizes = await Promise.all(items.map((item) => directorySize(join(path, item.name))));
  return sizes.reduce((sum, size) => sum + size, 0);
}

function assertTempOutputDir(baseDir: string): void {
  const normalized = baseDir.replaceAll("\\", "/").toLowerCase();
  if (!normalized.endsWith("/outputs/temp") && !normalized.includes("/outputs/temp/")) {
    throw new Error(`Refusing to cleanup non-temp output directory: ${baseDir}`);
  }

  if (basename(baseDir).toLowerCase() === "outputs") {
    throw new Error(`Refusing to cleanup outputs root: ${baseDir}`);
  }
}

function assertArchivableRunDir(sourceDir: string): void {
  const normalized = sourceDir.replaceAll("\\", "/").toLowerCase();
  if (!normalized.includes("/outputs/")) {
    throw new Error(`Refusing to archive directory outside outputs: ${sourceDir}`);
  }

  if (normalized.includes("/outputs/archive/") || normalized.includes("/outputs/quarantine/")) {
    throw new Error(`Refusing to archive an already archived/quarantined run: ${sourceDir}`);
  }

  if (basename(sourceDir).toLowerCase() === "outputs") {
    throw new Error(`Refusing to archive outputs root: ${sourceDir}`);
  }

  if (!existsSync(join(sourceDir, "run-state.json")) && !existsSync(join(sourceDir, "run-meta.json"))) {
    throw new Error(`Refusing to archive directory without run-state.json or run-meta.json: ${sourceDir}`);
  }
}

async function readRunStateSummary(outputDir: string): Promise<RunStateSummary | undefined> {
  try {
    return JSON.parse(await readFile(join(outputDir, "run-state.json"), "utf8")) as RunStateSummary;
  } catch {
    try {
      const meta = JSON.parse(await readFile(join(outputDir, "run-meta.json"), "utf8")) as {
        status?: string;
        workflow_profile?: string;
        source_request?: string;
      };
      return {
        status: meta.status,
        profile: meta.workflow_profile,
        goal: meta.source_request,
      };
    } catch {
      return undefined;
    }
  }
}
