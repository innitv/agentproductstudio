import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  artifactManifestFileName,
  formatWorkflowRunInspection,
  inspectWorkflowRun,
  listWorkflowRuns,
  runMetaFileName,
  type ArtifactManifest,
  type RunMeta,
} from "./output-metadata";
import { artifactFiles, getWorkflowStagesForProfile } from "./workflow-stages";
import { nowIso, writeRunState, type WorkflowRunState, type WorkflowStageStatus } from "./workflow-state";

const tempRoot = await mkdtemp(join(tmpdir(), "product-agent-studio-output-metadata-"));

try {
  const outputDir = join(tempRoot, "sample-product", "2026-06-03");
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, artifactFiles.run_plan), "# Run Plan\n\n## Статус\n\n`partial`\n", "utf8");

  const state = createState(outputDir);
  await writeRunState(state);

  assert(existsSync(join(outputDir, runMetaFileName)), "run-meta.json should be written with run-state.");
  assert(existsSync(join(outputDir, artifactManifestFileName)), "artifact-manifest.json should be written with run-state.");

  const meta = JSON.parse(await readFile(join(outputDir, runMetaFileName), "utf8")) as RunMeta;
  assert(meta.project_slug === "sample-product", "run meta should include project slug.");
  assert(meta.run_date === "2026-06-03", "run meta should include run date.");
  assert(meta.workflow_profile === "standard", "run meta should include workflow profile.");
  assert(meta.source_request === state.goal, "run meta should include source request.");

  const manifest = JSON.parse(await readFile(join(outputDir, artifactManifestFileName), "utf8")) as ArtifactManifest;
  const runPlan = manifest.artifacts.find((artifact) => artifact.file === artifactFiles.run_plan);
  const prd = manifest.artifacts.find((artifact) => artifact.file === artifactFiles.prd);
  if (!runPlan || !prd) {
    throw new Error("artifact manifest should include run-plan and prd entries.");
  }
  assert(runPlan.exists === true, "artifact manifest should mark existing artifacts.");
  assert(runPlan.status === "partial", "artifact manifest should normalize markdown status.");
  assert(prd.exists === false, "artifact manifest should mark missing downstream artifacts.");
  assert(prd.status === "missing", "artifact manifest should use missing status for missing files.");

  const runs = await listWorkflowRuns(tempRoot);
  assert(runs.length === 1, "workflow list should find the temp run.");
  assert(runs[0].relative_output_dir.includes("sample-product"), "workflow list should include relative run path.");
  assert(runs[0].goal === state.goal, "workflow list should include run goal.");

  const inspection = await inspectWorkflowRun(outputDir);
  const report = formatWorkflowRunInspection(inspection);
  assert(inspection.missing_metadata.length === 0, "workflow inspect should find all generated metadata.");
  assert(inspection.missing_artifacts.some((artifact) => artifact.file === artifactFiles.prd), "workflow inspect should report missing downstream artifacts.");
  assert(report.includes("# Workflow Run Inspect"), "workflow inspect report should include heading.");
  assert(report.includes("## Missing Artifacts"), "workflow inspect report should include missing artifacts section.");

  console.log("output metadata regression tests passed");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

function createState(outputDir: string): WorkflowRunState {
  const now = nowIso();
  const stages = Object.fromEntries(getWorkflowStagesForProfile("standard").map((stage) => [
    stage.id,
    {
      id: stage.id,
      title: stage.title,
      status: (stage.id === "00-intake" ? "partial" : "pending") as WorkflowStageStatus,
      attempts: stage.id === "00-intake" ? 1 : 0,
      artifacts: stage.id === "00-intake" ? [artifactFiles.run_plan] : [],
      updated_at: now,
    },
  ])) as WorkflowRunState["stages"];

  return {
    run_id: "test-output-metadata",
    goal: "Проверить outputs metadata",
    profile: "standard",
    execution_mode: "local",
    status: "partial",
    output_dir: outputDir,
    created_at: now,
    updated_at: now,
    current_stage: "00-intake",
    stages,
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
