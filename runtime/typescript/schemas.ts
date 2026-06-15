// Placeholder for Zod schemas that mirror files in ../../schemas.
// Keep schema names aligned with artifact names and agent output contracts.

export type AgentStatus = "success" | "partial" | "blocked";
export type QaVerdict = "pass" | "pass_with_notes" | "fail";

export interface AgentOutput<TArtifactName extends string, TArtifact> {
  agent_name: string;
  status: AgentStatus;
  summary: string;
  inputs_used: string[];
  outputs: Record<TArtifactName, TArtifact>;
  assumptions: string[];
  risks: string[];
  open_questions: string[];
  recommended_next_step: string;
}

export interface LandingWorkflowInput {
  goal: string;
  context?: string;
  constraints?: string[];
  sources?: string[];
  required_artifacts?: string[];
  research_mode?: string;
  source_policy?: unknown;
  notion_target?: string;
  profile?: "standard" | "reference";
}

export interface HandoffBundle {
  goal: string;
  constraints: string[];
  visual_reference_required?: boolean;
  assumptions: string[];
  recursive_brief?: unknown;
  research_summary?: unknown;
  scenario_user_flows?: unknown;
  prd?: unknown;
  notion_prd_export?: unknown;
  ia_brief?: unknown;
  design_brief?: unknown;
  screens?: unknown;
  copy_deck?: unknown;
  prototype_report?: unknown;
  frontend_result?: unknown;
  visual_reference_review?: unknown;
  test_bench_result?: unknown;
  qa_report?: unknown;
  release_notes?: unknown;
  risks: string[];
  open_questions: string[];
}
