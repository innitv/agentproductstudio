import type { WorkflowProfile, WorkflowStage, WorkflowTrack } from "../workflow-stages";
import type { WorkflowExecutionMode } from "../workflow-state";

export interface WorkflowStageExecutorContext {
  outputDir: string;
  goal: string;
  stage: WorkflowStage;
  profile: WorkflowProfile;
  // Маршрут запуска. Отсутствие читается строго (`legacyWorkflowTrack`): неизвестное по
  // умолчанию включается, а не выключается.
  track?: WorkflowTrack;
  executionMode: WorkflowExecutionMode;
}
