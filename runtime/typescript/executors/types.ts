import type { WorkflowProfile, WorkflowStage } from "../workflow-stages";
import type { WorkflowExecutionMode } from "../workflow-state";

export interface WorkflowStageExecutorContext {
  outputDir: string;
  goal: string;
  stage: WorkflowStage;
  profile: WorkflowProfile;
  executionMode: WorkflowExecutionMode;
}
