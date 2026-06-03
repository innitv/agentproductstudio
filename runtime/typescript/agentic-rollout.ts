import { workflowStages } from "./workflow-stages";

const defaultEnabledAgenticStageIds = ["02-prd", "03-ia"] as const;

export interface AgenticRolloutConfig {
  enabledStageIds: string[];
  invalidStageIds: string[];
  source: "default" | "env";
}

export function getEnabledAgenticStageIds(): Set<string> {
  return new Set(getAgenticRolloutConfig().enabledStageIds);
}

export function getAgenticRolloutConfig(): AgenticRolloutConfig {
  const knownStageIds = new Set(workflowStages.map((stage) => stage.id));
  const configured = process.env.AGENTIC_ENABLED_STAGES?.trim();

  if (!configured) {
    return {
      enabledStageIds: [...defaultEnabledAgenticStageIds],
      invalidStageIds: [],
      source: "default",
    };
  }

  const requested = configured
    .split(",")
    .map((stage) => stage.trim())
    .filter(Boolean);

  const valid = requested.filter((stage) => knownStageIds.has(stage));
  const invalid = requested.filter((stage) => !knownStageIds.has(stage));

  return {
    enabledStageIds: valid.length ? [...new Set(valid)] : [...defaultEnabledAgenticStageIds],
    invalidStageIds: [...new Set(invalid)],
    source: "env",
  };
}

export function isAgenticStageEnabled(stageId: string): boolean {
  return getEnabledAgenticStageIds().has(stageId);
}

export function formatEnabledAgenticStages(): string {
  return getAgenticRolloutConfig().enabledStageIds.join(", ");
}

export function formatAgenticRolloutStatus(): string {
  const config = getAgenticRolloutConfig();
  return [
    `Enabled agentic stages: ${config.enabledStageIds.join(", ")}`,
    `Source: ${config.source === "env" ? "AGENTIC_ENABLED_STAGES" : "default"}`,
    config.invalidStageIds.length
      ? `Ignored invalid stage ids: ${config.invalidStageIds.join(", ")}`
      : "Ignored invalid stage ids: none",
  ].join("\n");
}
