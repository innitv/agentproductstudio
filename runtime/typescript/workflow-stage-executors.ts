import { executeAgenticStage } from "./executors/agentic-executor";
import { executeLocalStage } from "./executors/local-executor";
import { executeResearchStage } from "./executors/research-executor";
import type { WorkflowStageExecutorContext } from "./executors/types";
import type { WorkflowStageResult } from "./workflow-state";

export type { WorkflowStageExecutorContext } from "./executors/types";

export async function executeWorkflowStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  if (context.stage.id === "01-research") {
    return executeResearchStage(context);
  }

  if (context.executionMode === "agentic") {
    return executeAgenticStage(context);
  }

  return executeLocalStage(context);
}
