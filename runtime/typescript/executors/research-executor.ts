import { runResearchStage } from "../research-stage-runner";
import { detectStageStatusFromMarkdown } from "../status-resolver";
import { artifactFiles } from "../workflow-stages";
import type { WorkflowStageResult } from "../workflow-state";
import { readArtifact, stageResult } from "./executor-common";
import type { WorkflowStageExecutorContext } from "./types";

export async function executeResearchStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  await runResearchStage({ outputDir: context.outputDir });
  const research = await readArtifact(context.outputDir, artifactFiles.research_summary);
  const status = detectStageStatusFromMarkdown(research, "completed");

  return stageResult(
    context.stage.id,
    context.stage.title,
    status,
    researchArtifacts(),
    ["recursive-brief.md"],
    status === "partial"
      ? ["Research provider coverage is partial; downstream claims must remain marked needs validation."]
      : [],
  );
}

function researchArtifacts(): string[] {
  return [
    artifactFiles.research_summary,
    artifactFiles.scenario_user_flows,
    artifactFiles.competitive_analysis,
    artifactFiles.proto_personas,
    artifactFiles.synthetic_interviews,
    artifactFiles.swot,
  ];
}
