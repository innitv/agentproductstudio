import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  archiveWorkflowRun,
  cleanupTempOutputs,
  formatArchiveWorkflowRunResult,
  formatCleanupTempResult,
} from "./output-lifecycle";

const root = await mkdtemp(join(tmpdir(), "product-agent-studio-output-lifecycle-"));

try {
  const tempDir = join(root, "outputs", "temp");
  const runDir = join(tempDir, "run-a");
  await mkdir(runDir, { recursive: true });
  await writeFile(join(runDir, "run-state.json"), JSON.stringify({ status: "partial" }), "utf8");

  const dryRun = await cleanupTempOutputs({ baseDir: tempDir });
  assert(dryRun.candidates.length === 1, "cleanup dry-run should find temp candidates.");
  assert(dryRun.removed.length === 0, "cleanup dry-run should not remove candidates.");
  assert(existsSync(runDir), "cleanup dry-run should keep temp directory.");
  assert(formatCleanupTempResult(dryRun).includes("would remove"), "cleanup dry-run report should describe planned action.");

  const forced = await cleanupTempOutputs({ baseDir: tempDir, force: true });
  assert(forced.candidates.length === 1, "cleanup force should report candidates.");
  assert(forced.removed.length === 1, "cleanup force should report removed candidates.");
  assert(!existsSync(runDir), "cleanup force should remove temp directory.");

  const nonTempDir = join(root, "outputs", "real-run");
  await mkdir(nonTempDir, { recursive: true });
  let refused = false;
  try {
    await cleanupTempOutputs({ baseDir: nonTempDir, force: true });
  } catch (error) {
    refused = error instanceof Error && error.message.includes("Refusing to cleanup non-temp output directory");
  }
  assert(refused, "cleanup should refuse non-temp output directories.");

  const archiveSource = join(root, "outputs", "project-a", "2026-06-03");
  await mkdir(archiveSource, { recursive: true });
  await writeFile(join(archiveSource, "run-state.json"), JSON.stringify({
    status: "partial",
    profile: "standard",
    goal: "Archive fixture",
  }), "utf8");

  const archiveDryRun = await archiveWorkflowRun({ outputDir: archiveSource, targetRoot: join(root, "outputs", "archive") });
  assert(archiveDryRun.moved === false, "archive dry-run should not move run.");
  assert(existsSync(archiveSource), "archive dry-run should keep source run.");
  assert(formatArchiveWorkflowRunResult(archiveDryRun).includes("Dry-run only"), "archive dry-run report should explain force.");

  const archiveForced = await archiveWorkflowRun({ outputDir: archiveSource, targetRoot: join(root, "outputs", "archive"), force: true });
  assert(archiveForced.moved === true, "archive force should move run.");
  assert(!existsSync(archiveSource), "archive force should remove source run.");
  assert(existsSync(archiveForced.target_dir), "archive force should create target run.");

  const runningSource = join(root, "outputs", "project-b", "2026-06-03");
  await mkdir(runningSource, { recursive: true });
  await writeFile(join(runningSource, "run-state.json"), JSON.stringify({ status: "running" }), "utf8");
  let refusedRunning = false;
  try {
    await archiveWorkflowRun({ outputDir: runningSource, targetRoot: join(root, "outputs", "archive") });
  } catch (error) {
    refusedRunning = error instanceof Error && error.message.includes("Refusing to archive running workflow");
  }
  assert(refusedRunning, "archive should refuse running workflow without force.");

  console.log("output lifecycle regression tests passed");
} finally {
  await rm(root, { recursive: true, force: true });
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
