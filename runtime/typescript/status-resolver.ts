import type { WorkflowStageStatus } from "./workflow-state";

export type ArtifactReadiness = "completed" | "partial" | "blocked" | "failed" | "draft" | "unknown";
export type AgentOutputStatus = "success" | "partial" | "blocked";

const completedArtifactStatuses = new Set([
  "success",
  "ready",
  "pass",
  "passed",
  "passed_with_notes",
  "pass_with_known_limitations",
  "published",
  "released",
]);

const partialArtifactStatuses = new Set(["partial", "ready_for_approval", "needs_validation"]);
const blockedArtifactStatuses = new Set(["blocked", "skipped_with_reason"]);
const failedArtifactStatuses = new Set(["fail", "failed"]);
const draftArtifactStatuses = new Set(["draft"]);

export function normalizeArtifactStatus(status: string): ArtifactReadiness {
  const value = status.trim().toLowerCase();
  if (completedArtifactStatuses.has(value)) {
    return "completed";
  }

  if (partialArtifactStatuses.has(value)) {
    return "partial";
  }

  if (blockedArtifactStatuses.has(value)) {
    return "blocked";
  }

  if (failedArtifactStatuses.has(value)) {
    return "failed";
  }

  if (draftArtifactStatuses.has(value)) {
    return "draft";
  }

  return "unknown";
}

export function artifactStatusToStageStatus(status: string, fallback: WorkflowStageStatus = "completed"): WorkflowStageStatus {
  const normalized = normalizeArtifactStatus(status);
  switch (normalized) {
    case "completed":
      return "completed";
    case "partial":
    case "draft":
      return "partial";
    case "blocked":
      return "blocked";
    case "failed":
      return "failed";
    case "unknown":
      return fallback;
  }
}

export function agentOutputStatusToStageStatus(status: AgentOutputStatus): WorkflowStageStatus {
  return status === "success" ? "completed" : status;
}

export function detectStageStatusFromMarkdown(content: string, fallback: WorkflowStageStatus): WorkflowStageStatus {
  const explicitStatus = readMarkdownStatus(content);
  return explicitStatus ? artifactStatusToStageStatus(explicitStatus, fallback) : fallback;
}

export function readMarkdownStatus(content: string): string | undefined {
  const patterns = [
    /^status:\s*([A-Za-z0-9_-]+)/im,
    /^## Status\s+([A-Za-z0-9_-]+)/im,
    /^\|\s*Status\s*\|\s*([A-Za-z0-9_-]+)\s*\|/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return undefined;
}

export function isIncompleteArtifactStatus(status: string): boolean {
  return ["blocked", "partial", "failed", "draft"].includes(normalizeArtifactStatus(status));
}

export function isStageBlocking(status: WorkflowStageStatus): boolean {
  return status === "blocked" || status === "failed";
}

export function isStageIncomplete(status: WorkflowStageStatus): boolean {
  return status === "pending" || status === "running" || status === "partial" || isStageBlocking(status);
}

export function summarizeRunStatus(statuses: readonly WorkflowStageStatus[]): WorkflowStageStatus {
  if (statuses.includes("failed")) {
    return "failed";
  }

  if (statuses.includes("blocked")) {
    return "blocked";
  }

  if (statuses.includes("partial")) {
    return "partial";
  }

  if (statuses.includes("running")) {
    return "running";
  }

  if (statuses.includes("pending")) {
    return "pending";
  }

  return "completed";
}

export function canReleaseFromQaStatus(status?: string): boolean {
  return status === "pass" || status === "pass_with_known_limitations";
}
