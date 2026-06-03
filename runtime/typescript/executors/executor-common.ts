import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { nowIso, type WorkflowStageResult, type WorkflowStageStatus } from "../workflow-state";

export function stageResult(
  stageId: string,
  title: string,
  status: WorkflowStageStatus,
  artifacts: string[],
  inputs: string[],
  warnings: string[],
): WorkflowStageResult {
  return {
    stage_id: stageId,
    title,
    status,
    artifacts_created: artifacts,
    inputs_used: inputs,
    warnings,
    errors: [],
    next_stage: undefined,
    completed_at: nowIso(),
  };
}

export function inferInputsUsed(content: string): string[] {
  const match = content.match(/## Inputs Used\s+([\s\S]*?)(?:\n## |\n# |$)/);
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/`([^`]+)`|-\s+([^\n]+)/g)]
    .map((item) => item[1] ?? item[2])
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function readArtifact(outputDir: string, fileName: string): Promise<string> {
  const path = join(outputDir, fileName);
  return existsSync(path) ? readFile(path, "utf8") : "";
}

export function formatLedgerCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}
