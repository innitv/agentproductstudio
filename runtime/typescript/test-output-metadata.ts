import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { approvalStateFileName } from "./approval-gate";
import {
  artifactManifestFileName,
  formatWorkflowOutputsGuide,
  formatWorkflowRunInspection,
  inspectWorkflowRun,
  listWorkflowRuns,
  runIndexFileName,
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
  await writeFile(join(outputDir, artifactFiles.notion_prd_export), "# Notion PRD Export\n\nPrepared for publication.\n", "utf8");
  await writeFile(join(outputDir, approvalStateFileName), `${JSON.stringify({ approvals: [] }, null, 2)}\n`, "utf8");

  const state = createState(outputDir);
  await writeRunState(state);

  assert(existsSync(join(outputDir, runMetaFileName)), "run-meta.json should be written with run-state.");
  assert(existsSync(join(outputDir, artifactManifestFileName)), "artifact-manifest.json should be written with run-state.");
  assert(existsSync(join(outputDir, runIndexFileName)), "run-index.md should be written with run-state.");

  const meta = JSON.parse(await readFile(join(outputDir, runMetaFileName), "utf8")) as RunMeta;
  assert(meta.project_slug === "sample-product", "run meta should include project slug.");
  assert(meta.run_date === "2026-06-03", "run meta should include run date.");
  assert(meta.workflow_profile === "standard", "run meta should include workflow profile.");
  assert(meta.source_request === state.goal, "run meta should include source request.");

  const manifest = JSON.parse(await readFile(join(outputDir, artifactManifestFileName), "utf8")) as ArtifactManifest;
  const runPlan = manifest.artifacts.find((artifact) => artifact.file === artifactFiles.run_plan);
  const prd = manifest.artifacts.find((artifact) => artifact.file === artifactFiles.prd);
  const notionPrdExport = manifest.artifacts.find((artifact) => artifact.file === artifactFiles.notion_prd_export);
  const approvalState = manifest.artifacts.find((artifact) => artifact.file === approvalStateFileName);
  if (!runPlan || !prd) {
    throw new Error("artifact manifest should include run-plan and prd entries.");
  }
  if (!notionPrdExport || !approvalState) {
    throw new Error("artifact manifest should include discovered optional/export and external record files.");
  }
  assert(runPlan.exists === true, "artifact manifest should mark existing artifacts.");
  assert(runPlan.status === "partial", "artifact manifest should normalize markdown status.");
  assert(runPlan.artifact_type === "product_artifact", "artifact manifest should classify product artifacts.");
  assert(runPlan.producer_stage === "00-intake", "artifact manifest should include producer stage.");
  assert(runPlan.producer_agent === "orchestrator", "artifact manifest should include producer agent.");
  assert(Boolean(runPlan.checksum_sha256), "artifact manifest should include checksum for existing artifacts.");
  assert(prd.exists === false, "artifact manifest should mark missing downstream artifacts.");
  assert(prd.status === "missing", "artifact manifest should use missing status for missing files.");
  assert(notionPrdExport.artifact_type === "export", "artifact manifest should classify discovered export artifacts.");
  assert(notionPrdExport.safe_to_publish === true, "artifact manifest should mark publishable exports.");
  assert(approvalState.artifact_type === "external_record", "artifact manifest should classify approval state as external record.");
  assert(approvalState.safe_to_publish === false, "artifact manifest should not mark approval records publishable.");

  const runs = await listWorkflowRuns(tempRoot);
  assert(runs.length === 1, "workflow list should find the temp run.");
  assert(runs[0].relative_output_dir.includes("sample-product"), "workflow list should include relative run path.");
  assert(runs[0].goal === state.goal, "workflow list should include run goal.");

  const inspection = await inspectWorkflowRun(outputDir);
  const report = formatWorkflowRunInspection(inspection);
  const outputsGuide = formatWorkflowOutputsGuide(inspection);
  assert(inspection.missing_metadata.length === 0, "workflow inspect should find all generated metadata.");
  assert(inspection.missing_artifacts.some((artifact) => artifact.file === artifactFiles.prd), "workflow inspect should report missing downstream artifacts.");
  assert(report.includes("# Workflow Run Inspect"), "workflow inspect report should include heading.");
  assert(report.includes("## Missing Artifacts"), "workflow inspect report should include missing artifacts section.");
  assert(outputsGuide.includes("# Workflow Outputs Guide"), "workflow outputs guide should include heading.");
  assert(outputsGuide.includes("## What To Read First"), "workflow outputs guide should include reading guidance.");
  assert(outputsGuide.includes("### state"), "workflow outputs guide should group run state files.");
  assert(outputsGuide.includes("run-state.json"), "workflow outputs guide should include run-state.json.");
  assert(outputsGuide.includes("### manifest"), "workflow outputs guide should group manifest files.");
  assert(outputsGuide.includes("run-index.md"), "workflow outputs guide should include run-index.md.");
  assert(outputsGuide.includes("### product artifact"), "workflow outputs guide should group product artifacts.");
  assert(outputsGuide.includes("### export"), "workflow outputs guide should group export artifacts.");
  assert(outputsGuide.includes("notion-prd-export.md"), "workflow outputs guide should include discovered exports.");
  assert(outputsGuide.includes("### external record"), "workflow outputs guide should group external records.");
  assert(outputsGuide.includes(approvalStateFileName), "workflow outputs guide should include approval records.");
  assert(outputsGuide.includes("run-plan.md"), "workflow outputs guide should include readable product artifacts.");
  assert(
    outputsGuide.indexOf("run-index.md") < outputsGuide.indexOf("run-plan.md"),
    "workflow outputs guide should recommend run-index.md before stage artifacts.",
  );

  const oldManifestDir = join(tempRoot, "old-manifest-product", "2026-06-04");
  await mkdir(oldManifestDir, { recursive: true });
  await writeFile(join(oldManifestDir, artifactFiles.run_plan), "# Run Plan\n\n## Статус\n\n`completed`\n", "utf8");
  const oldState = createState(oldManifestDir);
  await writeFile(join(oldManifestDir, "run-state.json"), `${JSON.stringify(oldState, null, 2)}\n`, "utf8");
  await writeFile(join(oldManifestDir, runMetaFileName), `${JSON.stringify({
    project_slug: "old-manifest-product",
    run_date: "2026-06-04",
    run_id: oldState.run_id,
    created_at: oldState.created_at,
    updated_at: oldState.updated_at,
    workflow_profile: oldState.profile,
    execution_mode: oldState.execution_mode,
    status: oldState.status,
    source_request: oldState.goal,
    output_dir: oldManifestDir,
    has_reference: false,
    notion_publication: "unknown",
  }, null, 2)}\n`, "utf8");
  await writeFile(join(oldManifestDir, artifactManifestFileName), `${JSON.stringify({
    generated_at: oldState.updated_at,
    run_id: oldState.run_id,
    workflow_profile: oldState.profile,
    artifacts: [
      {
        artifact_name: "run_plan",
        file: artifactFiles.run_plan,
        stage_id: "00-intake",
        stage_title: "Intake and Recursive Brief",
        status: "completed",
        exists: true,
      },
    ],
  }, null, 2)}\n`, "utf8");

  const oldGuide = formatWorkflowOutputsGuide(await inspectWorkflowRun(oldManifestDir));
  assert(oldGuide.includes("run-plan.md"), "workflow outputs guide should read old manifests.");
  assert(oldGuide.includes("00-intake orchestrator"), "workflow outputs guide should enrich old manifests with producer metadata.");
  assert(oldGuide.includes("### state"), "workflow outputs guide should add ledger groups for old manifests.");

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
