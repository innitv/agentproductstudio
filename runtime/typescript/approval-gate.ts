import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nowIso } from "./workflow-state";

export const approvalActions = [
  "notion_research_publish",
  "notion_agile_export",
  "notion_prd_export",
  "figma_write",
  "external_research_provider_call",
  "model_provider_call",
  "git_write",
  "deploy",
  "delete_data",
  "change_secrets",
  "send_external_message",
  "external_write",
] as const;

export type ApprovalAction = (typeof approvalActions)[number];

export interface ApprovalRecord {
  action: ApprovalAction;
  approved: boolean;
  approved_at?: string;
  approved_by?: string;
  target?: string;
  notes?: string;
}

export interface ApprovalState {
  approvals: ApprovalRecord[];
}

export interface ApprovalRequest {
  outputDir: string;
  action: ApprovalAction;
  stageId: string;
  target?: string;
  reason: string;
}

export interface ApprovalDecision {
  approved: boolean;
  record?: ApprovalRecord;
  message: string;
}

export const approvalStateFileName = "approval-state.json";

export async function requireApproval(request: ApprovalRequest): Promise<ApprovalDecision> {
  const state = await readApprovalState(request.outputDir);
  const record = findLatestApprovalRecord(state.approvals, request.action, request.target);

  if (record?.approved) {
    return {
      approved: true,
      record,
      message: `Подтверждение найдено для ${request.action}${request.target ? ` -> ${request.target}` : ""}.`,
    };
  }

  const denialNote = record && !record.approved
    ? `Последняя matching-запись является отказом${record.notes ? `: ${record.notes}` : ""}.`
    : undefined;

  return {
    approved: false,
    message: [
      `Требуется подтверждение для ${request.action} на стадии ${request.stageId}.`,
      request.target ? `Target: ${request.target}.` : undefined,
      denialNote,
      `Причина: ${request.reason}.`,
      `Перед выполнением внешнего действия используй интерактивный yarn workflow:approval-request; если TTY недоступен, после явного ответа пользователя запиши yarn workflow:approve или yarn workflow:deny. Runtime сохранит запись в ${approvalStateFileName}.`,
    ].filter(Boolean).join(" "),
  };
}

export async function recordApproval(outputDir: string, record: ApprovalRecord): Promise<void> {
  await recordApprovalDecision(outputDir, { ...record, approved: true });
}

export async function recordApprovalDenial(outputDir: string, record: Omit<ApprovalRecord, "approved">): Promise<void> {
  await recordApprovalDecision(outputDir, { ...record, approved: false });
}

export async function listApprovals(outputDir: string): Promise<ApprovalRecord[]> {
  const state = await readApprovalState(outputDir);
  return state.approvals;
}

export function findLatestApprovalRecord(
  approvals: readonly ApprovalRecord[],
  action: ApprovalAction,
  target?: string,
): ApprovalRecord | undefined {
  return approvals
    .filter((item) =>
      item.action === action &&
      (target ? item.target === target : !item.target)
    )
    .at(-1);
}

async function recordApprovalDecision(outputDir: string, record: ApprovalRecord): Promise<void> {
  const state = await readApprovalState(outputDir);
  state.approvals.push({
    ...record,
    approved_at: record.approved_at ?? nowIso(),
  });
  await writeApprovalState(outputDir, state);
}

async function readApprovalState(outputDir: string): Promise<ApprovalState> {
  const path = join(outputDir, approvalStateFileName);
  if (!existsSync(path)) {
    return { approvals: [] };
  }

  const parsed = JSON.parse(await readFile(path, "utf8")) as ApprovalState;
  if (!Array.isArray(parsed.approvals)) {
    return { approvals: [] };
  }

  return parsed;
}

async function writeApprovalState(outputDir: string, state: ApprovalState): Promise<void> {
  await writeFile(join(outputDir, approvalStateFileName), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
