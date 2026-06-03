import type { WorkflowStage } from "./workflow-stages";

export const agenticModelProvider = "openai_agents_sdk";

export function formatModelProviderApprovalTarget(stage: Pick<WorkflowStage, "id" | "owner">): string {
  return `${agenticModelProvider}:${stage.owner}:${stage.id}`;
}
