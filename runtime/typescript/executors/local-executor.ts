import { buildLocalDownstreamArtifacts, writeLocalStageArtifact } from "../run-local-workflow";
import { detectStageStatusFromMarkdown } from "../status-resolver";
import type { WorkflowStageResult } from "../workflow-state";
import { inferInputsUsed, stageResult } from "./executor-common";
import { maybeRunNotionAgileExport } from "./notion-agile-export";
import type { WorkflowStageExecutorContext } from "./types";

export async function executeLocalStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  const downstreamArtifacts = await buildLocalDownstreamArtifacts(context.outputDir, context.goal);
  const artifacts = downstreamArtifacts.filter((item) => item.stage === context.stage.id);
  if (!artifacts.length) {
    return stageResult(context.stage.id, context.stage.title, "skipped", [], [], [`No local executor is registered for ${context.stage.id}.`]);
  }

  for (const artifact of artifacts) {
    await writeLocalStageArtifact(context.outputDir, artifact);
  }

  const warnings: string[] = [];
  let status = summarizeArtifactStatuses(
    artifacts.map((artifact) => detectStageStatusFromMarkdown(artifact.content, "completed")),
  );

  if (context.stage.id === "12-release") {
    const notionResult = await maybeRunNotionAgileExport(context.outputDir, context.stage.id);
    warnings.push(...notionResult.warnings);
    if (notionResult.approvalMissing) {
      status = "partial";
    }
  }

  const inputs = [...new Set(artifacts.flatMap((artifact) => inferInputsUsed(artifact.content)))];

  return stageResult(
    context.stage.id,
    artifacts.length === 1 ? artifacts[0].title : context.stage.title,
    status,
    artifacts.map((artifact) => artifact.file),
    inputs,
    warnings,
  );
}

function summarizeArtifactStatuses(statuses: string[]): "completed" | "partial" | "blocked" {
  if (statuses.includes("blocked")) {
    return "blocked";
  }

  if (statuses.includes("partial")) {
    return "partial";
  }

  return "completed";
}
