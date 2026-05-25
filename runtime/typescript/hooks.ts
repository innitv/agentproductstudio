import { containsSecretLikeValue, requiresHumanApproval } from "./guardrails";
import type { AgentOutput, HandoffBundle } from "./schemas";

export const hookNames = {
  beforeRun: "before_run",
  beforeAgentCall: "before_agent_call",
  afterAgentCall: "after_agent_call",
  beforeToolCall: "before_tool_call",
  afterToolCall: "after_tool_call",
  beforeQa: "before_qa",
  afterQa: "after_qa",
  beforeFinal: "before_final",
} as const;

export type HookName = (typeof hookNames)[keyof typeof hookNames];

export interface HookResult {
  status: "pass" | "warn" | "block";
  message: string;
  risks?: string[];
}

export interface ToolCallCheckInput {
  toolName: string;
  action?: string;
  payloadPreview?: string;
}

export function beforeToolCall(input: ToolCallCheckInput): HookResult {
  if (input.payloadPreview && containsSecretLikeValue(input.payloadPreview)) {
    return {
      status: "block",
      message: "Tool payload contains a secret-like value.",
      risks: ["secret_like_tool_payload"],
    };
  }

  if (input.action && requiresHumanApproval(input.action)) {
    return {
      status: "block",
      message: `Action '${input.action}' requires human approval before tool execution.`,
      risks: ["approval_required"],
    };
  }

  return { status: "pass", message: `Tool '${input.toolName}' passed pre-call checks.` };
}

export function afterAgentCall<TArtifactName extends string, TArtifact>(
  output: AgentOutput<TArtifactName, TArtifact>,
): HookResult {
  if (output.status === "blocked") {
    return {
      status: "block",
      message: `Agent '${output.agent_name}' returned blocked status.`,
      risks: output.risks,
    };
  }

  if (output.status === "partial") {
    return {
      status: "warn",
      message: `Agent '${output.agent_name}' returned partial status.`,
      risks: output.risks,
    };
  }

  return { status: "pass", message: `Agent '${output.agent_name}' completed.` };
}

export function beforeQa(bundle: HandoffBundle): HookResult {
  const requiredArtifacts = [
    "recursive_brief",
    "research_summary",
    "prd",
    "ia_brief",
    "design_brief",
    "screens",
    "copy_deck",
    "prototype_report",
    "frontend_result",
    "test_bench_result",
  ] as const;

  const missing = [
    ...requiredArtifacts.filter((artifact) => !bundle[artifact]),
    ...(bundle.visual_reference_required && !bundle.visual_reference_review ? ["visual_reference_review" as const] : []),
  ];

  if (missing.length) {
    return {
      status: "block",
      message: `QA requires a complete bundle. Missing: ${missing.join(", ")}.`,
      risks: ["incomplete_handoff_bundle"],
    };
  }

  return { status: "pass", message: "Bundle is ready for QA." };
}

export function beforeFinal(bundle: HandoffBundle): HookResult {
  if (!bundle.qa_report) {
    return {
      status: "block",
      message: "Final response requires qa_report.",
      risks: ["missing_qa_report"],
    };
  }

  if (!bundle.release_notes) {
    return {
      status: "block",
      message: "Final response requires release_notes.",
      risks: ["missing_release_notes"],
    };
  }

  return { status: "pass", message: "Bundle is ready for final synthesis." };
}
