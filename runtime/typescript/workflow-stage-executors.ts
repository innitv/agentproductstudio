import { existsSync } from "node:fs";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { Agent, run } from "@openai/agents";
import YAML from "js-yaml";
import { agentInstructionFiles, agentNames } from "./agents.registry";
import { createSpecialistAgents, loadAgentInstructions, type AgentRegistryKey } from "./agents.sdk";
import { formatModelProviderApprovalTarget } from "./agentic-approval-targets";
import { formatEnabledAgenticStages, isAgenticStageEnabled } from "./agentic-rollout";
import { requireApproval } from "./approval-gate";
import { routeTools } from "./route.config";
import { buildLocalDownstreamArtifacts, writeLocalStageArtifact } from "./run-local-workflow";
import { runResearchStage } from "./research-stage-runner";
import {
  artifactFiles,
  getRequiredArtifactsForStage,
  type WorkflowProfile,
  type WorkflowStage,
} from "./workflow-stages";
import {
  nowIso,
  type WorkflowExecutionMode,
  type WorkflowStageResult,
  type WorkflowStageStatus,
} from "./workflow-state";
import { agentOutputStatusToStageStatus, detectStageStatusFromMarkdown } from "./status-resolver";

export interface WorkflowStageExecutorContext {
  outputDir: string;
  goal: string;
  stage: WorkflowStage;
  profile: WorkflowProfile;
  executionMode: WorkflowExecutionMode;
}

interface NormalizedAgenticArtifact {
  content: string;
  warnings: string[];
}

interface AgenticOutputEnvelope {
  agent_name: string;
  status: "success" | "partial" | "blocked";
  summary: string;
  inputs_used: string[];
  outputs: Record<string, unknown>;
  assumptions: string[];
  risks: string[];
  open_questions: string[];
  recommended_next_step: string;
}

interface ParsedAgenticOutput {
  envelope?: AgenticOutputEnvelope;
  warnings: string[];
}

export async function executeWorkflowStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  if (context.stage.id === "01-research") {
    return executeResearchStage(context);
  }

  if (context.executionMode === "agentic") {
    return executeAgenticStage(context);
  }

  return executeLocalStage(context);
}

async function executeResearchStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  await runResearchStage({ outputDir: context.outputDir });
  const research = await readArtifact(context.outputDir, artifactFiles.research_summary);
  const status = detectStageStatusFromMarkdown(research, "completed");

  return stageResult(
    context.stage.id,
    context.stage.title,
    status,
    researchArtifacts(),
    ["recursive-brief.md"],
    status === "partial"
      ? ["Research provider coverage is partial; downstream claims must remain marked needs validation."]
      : [],
  );
}

async function executeLocalStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  const downstreamArtifacts = await buildLocalDownstreamArtifacts(context.outputDir, context.goal);
  const artifact = downstreamArtifacts.find((item) => item.stage === context.stage.id);
  if (!artifact) {
    return stageResult(context.stage.id, context.stage.title, "skipped", [], [], [`No local executor is registered for ${context.stage.id}.`]);
  }

  await writeLocalStageArtifact(context.outputDir, artifact);

  const warnings: string[] = [];
  let status = detectStageStatusFromMarkdown(artifact.content, "completed");

  if (context.stage.id === "12-release") {
    const notionResult = await maybeRunNotionAgileExport(context.outputDir, context.stage.id);
    warnings.push(...notionResult.warnings);
    if (notionResult.approvalMissing) {
      status = "partial";
    }
  }

  return stageResult(context.stage.id, artifact.title, status, [artifact.file], inferInputsUsed(artifact.content), warnings);
}

async function executeAgenticStage(context: WorkflowStageExecutorContext): Promise<WorkflowStageResult> {
  const requiredArtifacts = getRequiredArtifactsForStage(context.stage, context.profile);
  const files = requiredArtifacts.map((artifact) => artifactFiles[artifact]).filter(Boolean);
  const inputs = inferAgenticInputs(context.stage.owner);
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  if (!isAgenticStageEnabled(context.stage.id)) {
    const warning = [
      `Agentic execution for ${context.stage.id} is not enabled in the current staged rollout.`,
      `Enabled stages: ${formatEnabledAgenticStages()}.`,
    ].join(" ");
    await writeBlockedAgenticArtifacts(context, requiredArtifacts, inputs, warning);
    return finalizeAgenticStage(context, "blocked", files, inputs, [warning]);
  }

  if (!hasApiKey) {
    const warning = "Agentic executor requires OPENAI_API_KEY for real specialist execution.";
    await writeBlockedAgenticArtifacts(context, requiredArtifacts, inputs, warning);
    return finalizeAgenticStage(context, "blocked", files, inputs, [warning]);
  }

  const modelApprovalTarget = formatModelProviderApprovalTarget(context.stage);
  const modelApproval = await requireApproval({
    outputDir: context.outputDir,
    action: "model_provider_call",
    stageId: context.stage.id,
    target: modelApprovalTarget,
    reason: "Agentic specialist execution sends stage inputs to the configured model provider",
  });
  if (!modelApproval.approved) {
    await writeBlockedAgenticArtifacts(context, requiredArtifacts, inputs, modelApproval.message);
    return finalizeAgenticStage(context, "blocked", files, inputs, [modelApproval.message]);
  }

  const specialistKey = findSpecialistKey(context.stage.owner);
  if (!specialistKey) {
    const warning = `No specialist agent is registered for stage owner '${context.stage.owner}'.`;
    await writeBlockedAgenticArtifacts(context, requiredArtifacts, inputs, warning);
    return finalizeAgenticStage(context, "blocked", files, inputs, [warning]);
  }

  const instructions = await loadAgentInstructions();
  const specialists = createSpecialistAgents(instructions);
  const specialist = specialists[specialistKey];
  if (!specialist) {
    const warning = `Specialist '${specialistKey}' could not be created.`;
    await writeBlockedAgenticArtifacts(context, requiredArtifacts, inputs, warning);
    return finalizeAgenticStage(context, "blocked", files, inputs, [warning]);
  }

  const prompt = await buildSpecialistPrompt(context, requiredArtifacts, inputs);
  const finalOutput = await runSpecialistAndExtractOutput(specialist, prompt, context.stage.id);

  if (!finalOutput?.trim()) {
    const warning = `Specialist '${specialistKey}' returned an empty output.`;
    await writeBlockedAgenticArtifacts(context, requiredArtifacts, inputs, warning);
    return finalizeAgenticStage(context, "blocked", files, inputs, [warning]);
  }

  const parsedOutput = parseAgenticOutputEnvelope(finalOutput);
  const warnings: string[] = [...parsedOutput.warnings];
  const contractStatus = parsedOutput.envelope
    ? agentOutputStatusToStageStatus(parsedOutput.envelope.status)
    : "partial";

  for (const artifactName of requiredArtifacts) {
    const file = artifactFiles[artifactName];
    const sections = context.stage.requiredSectionsByArtifact[artifactName] ?? [];
    if (parsedOutput.envelope && !hasArtifactOutput(parsedOutput.envelope, artifactName, file)) {
      warnings.push(`${file}: agent output contract did not include outputs.${artifactName} or outputs.${file}`);
    }
    const modelOutput = resolveArtifactContent(finalOutput, parsedOutput.envelope, artifactName, file);
    const normalized = ensureAgenticArtifactSections({
      title: context.stage.title,
      inputs: parsedOutput.envelope?.inputs_used?.length ? parsedOutput.envelope.inputs_used : inputs,
      sections,
      modelOutput,
    });
    warnings.push(...normalized.warnings.map((warning) => `${file}: ${warning}`));
    await writeFile(join(context.outputDir, file), normalized.content, "utf8");
  }

  const status: WorkflowStageStatus = contractStatus === "completed" && warnings.length ? "partial" : contractStatus;

  return finalizeAgenticStage(
    context,
    status,
    files,
    parsedOutput.envelope?.inputs_used?.length ? parsedOutput.envelope.inputs_used : inputs,
    warnings,
  );
}

async function runSpecialistAndExtractOutput(specialist: Agent, prompt: string, stageId: string): Promise<string> {
  const testOutputDir = process.env.AGENTIC_TEST_SPECIALIST_OUTPUT_DIR;
  if (process.env.NODE_ENV === "test" && testOutputDir) {
    return readFile(join(testOutputDir, `${stageId}.md`), "utf8");
  }

  const testOutputPath = process.env.AGENTIC_TEST_SPECIALIST_OUTPUT_PATH;
  if (process.env.NODE_ENV === "test" && testOutputPath) {
    return readFile(testOutputPath, "utf8");
  }

  const result = await run(specialist, prompt);
  return typeof result.finalOutput === "string"
    ? result.finalOutput
    : JSON.stringify(result.finalOutput, null, 2);
}

async function finalizeAgenticStage(
  context: WorkflowStageExecutorContext,
  status: WorkflowStageStatus,
  files: string[],
  inputs: string[],
  warnings: string[],
): Promise<WorkflowStageResult> {
  await appendAgenticStageProgress(context, status, files, inputs, warnings);

  return stageResult(
    context.stage.id,
    context.stage.title,
    status,
    files,
    inputs,
    warnings,
  );
}

async function writeBlockedAgenticArtifacts(
  context: WorkflowStageExecutorContext,
  requiredArtifacts: readonly string[],
  inputs: string[],
  warning: string,
): Promise<void> {
  for (const artifactName of requiredArtifacts) {
    const file = artifactFiles[artifactName];
    if (!file) {
      continue;
    }

    const sections = context.stage.requiredSectionsByArtifact[artifactName] ?? [];
    const content = renderBlockedAgenticArtifact({
      title: context.stage.title,
      stageId: context.stage.id,
      owner: context.stage.owner,
      file,
      inputs,
      warning,
      sections,
    });
    await writeFile(join(context.outputDir, file), content, "utf8");
  }
}

async function maybeRunNotionAgileExport(outputDir: string, stageId: string): Promise<{ warnings: string[]; approvalMissing: boolean }> {
  const warnings: string[] = [];
  const config = await detectNotionConfig(outputDir);

  if (!config.token || !config.pageId) {
    warnings.push("Automatic Notion Agile Board export skipped: NOTION_TOKEN or parent page ID is not configured in .env or environment.");
    return { warnings, approvalMissing: false };
  }

  const approval = await requireApproval({
    outputDir,
    action: "notion_agile_export",
    stageId,
    target: config.pageId,
    reason: "Release stage wants to create or update Notion Agile Board and User Stories outside the local workspace",
  });

  if (!approval.approved) {
    warnings.push(approval.message);
    await appendFile(
      join(outputDir, artifactFiles.release_notes),
      [
        "",
        "## Approval Gate",
        "",
        `- Status: partial`,
        `- External action blocked: notion_agile_export`,
        `- Target: ${config.pageId}`,
        `- Reason: ${approval.message}`,
        "",
      ].join("\n"),
      "utf8",
    );
    return { warnings, approvalMissing: true };
  }

  try {
    const scriptPath = join(process.cwd(), "tooling", "scripts", "publish-notion-stories.mjs");
    execFileSync("node", [scriptPath, config.pageId, outputDir], { stdio: "inherit" });
    warnings.push(`Notion Agile Board export completed with approval for ${config.pageId}.`);
  } catch (publishError) {
    const msg = publishError instanceof Error ? publishError.message : String(publishError);
    warnings.push(`Automatic Notion Agile Board export failed: ${msg}`);
  }

  return { warnings, approvalMissing: false };
}

async function detectNotionConfig(outputDir: string): Promise<{ token?: string; pageId?: string }> {
  let token = process.env.NOTION_TOKEN;
  let pageId = process.env.NOTION_PAGE_ID || process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_TARGET;

  const envPath = join(process.cwd(), ".env");
  if (existsSync(envPath)) {
    try {
      const envContent = await readFile(envPath, "utf8");
      if (!token) {
        const tokenMatch = envContent.match(/^NOTION_TOKEN=(.+)$/m);
        if (tokenMatch?.[1]?.trim()) {
          token = tokenMatch[1].trim();
        }
      }
      if (!pageId) {
        const pageIdMatch = envContent.match(/^(?:NOTION_PAGE_ID|NOTION_PARENT_PAGE_ID|NOTION_TARGET)=(.+)$/m);
        if (pageIdMatch?.[1]?.trim()) {
          pageId = pageIdMatch[1].trim();
        }
      }
    } catch {
      // Ignore local config read failures; the caller records a skipped export.
    }
  }

  if (!pageId) {
    const scaffoldPath = join(outputDir, "workflow-scaffold.md");
    if (existsSync(scaffoldPath)) {
      try {
        const scaffoldContent = await readFile(scaffoldPath, "utf8");
        const match = scaffoldContent.match(/(?:notion_target|Notion Target|Page ID):\s*(.+)$/im);
        if (match?.[1]?.trim()) {
          pageId = match[1].trim();
        }
      } catch {
        // Ignore scaffold read failures.
      }
    }
  }

  if (!pageId) {
    const runStatePath = join(outputDir, "run-state.json");
    if (existsSync(runStatePath)) {
      try {
        const runStateContent = await readFile(runStatePath, "utf8");
        const parsed = JSON.parse(runStateContent) as { notion_target?: string };
        if (parsed.notion_target) {
          pageId = parsed.notion_target;
        }
      } catch {
        // Ignore run state parse failures.
      }
    }
  }

  return { token, pageId };
}

function renderBlockedAgenticArtifact(options: {
  title: string;
  stageId: string;
  owner: string;
  file: string;
  inputs: string[];
  warning: string;
  sections: readonly string[];
}): string {
  const requiredSections = options.sections.length ? options.sections : ["## Inputs Used", "## Status"];
  return [
    `# ${options.title}`,
    "",
    "## Status",
    "",
    "blocked",
    "",
    "## Inputs Used",
    "",
    ...options.inputs.map((input) => `- \`${input}\``),
    "",
    "## Agentic Execution",
    "",
    `- Stage: ${options.stageId}`,
    `- Owner: ${options.owner}`,
    `- Output artifact: ${options.file}`,
    `- Blocker: ${options.warning}`,
    "",
    ...requiredSections
      .filter((section) => !["## Status", "## Inputs Used"].includes(section))
      .flatMap((section) => [section, "", "Заблокировано до включения specialist LLM execution для этой стадии.", ""]),
    "## Recommended Next Step",
    "",
    "Запусти workflow в режиме `local` или настрой agentic specialist executor с подтверждённым model provider.",
    "",
  ].join("\n");
}

function ensureAgenticArtifactSections(options: {
  title: string;
  inputs: string[];
  sections: readonly string[];
  modelOutput: string;
}): NormalizedAgenticArtifact {
  const warnings: string[] = [];
  const missingSections = options.sections.filter((section) => !options.modelOutput.includes(section));
  if (!missingSections.length && options.modelOutput.includes("## Inputs Used")) {
    return { content: options.modelOutput.trimEnd() + "\n", warnings };
  }

  if (!options.modelOutput.includes("## Inputs Used")) {
    warnings.push("specialist output did not include ## Inputs Used");
  }

  if (missingSections.length) {
    warnings.push(`specialist output missed required sections: ${missingSections.join(", ")}`);
  }

  const content = [
    options.modelOutput.trim(),
    "",
    options.modelOutput.includes("## Inputs Used")
      ? undefined
      : ["## Inputs Used", "", ...options.inputs.map((input) => `- \`${input}\``), ""].join("\n"),
    ...missingSections.flatMap((section) => [section, "", "Agentic specialist output не включил эту обязательную секцию явно; runtime добавил её для прозрачности валидации.", ""]),
  ].filter(Boolean).join("\n");

  return { content, warnings };
}

function parseAgenticOutputEnvelope(raw: string): ParsedAgenticOutput {
  const source = extractStructuredAgenticBlock(raw);
  if (!source) {
    return {
      warnings: ["agentic output did not include structured agent output contract; Markdown fallback was used"],
    };
  }

  let parsed: unknown;
  try {
    parsed = source.format === "json" ? JSON.parse(source.content) : YAML.load(source.content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { warnings: [`agent output contract parse failed: ${message}`] };
  }

  const errors = validateAgenticOutputEnvelope(parsed);
  if (errors.length) {
    return { warnings: errors.map((error) => `agent output contract invalid: ${error}`) };
  }

  return { envelope: parsed as AgenticOutputEnvelope, warnings: [] };
}

function extractStructuredAgenticBlock(raw: string): { format: "json" | "yaml"; content: string } | undefined {
  const jsonBlock = raw.match(/```(?:agent-output-json|artifact-json|json)\r?\n([\s\S]*?)\r?\n```/);
  if (jsonBlock?.[1]?.trim()) {
    return { format: "json", content: jsonBlock[1].trim() };
  }

  const yamlBlock = raw.match(/```(?:agent-output-yaml|yaml|yml)\r?\n([\s\S]*?)\r?\n```/);
  if (yamlBlock?.[1]?.trim()) {
    return { format: "yaml", content: yamlBlock[1].trim() };
  }

  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (frontmatter?.[1]?.trim()) {
    return { format: "yaml", content: frontmatter[1].trim() };
  }

  return undefined;
}

function validateAgenticOutputEnvelope(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return ["root must be object"];
  }

  const requiredStringFields = ["agent_name", "status", "summary", "recommended_next_step"];
  for (const field of requiredStringFields) {
    if (typeof value[field] !== "string" || !value[field]) {
      errors.push(`${field} must be non-empty string`);
    }
  }

  if (!["success", "partial", "blocked"].includes(String(value.status))) {
    errors.push("status must be success, partial or blocked");
  }

  for (const field of ["inputs_used", "assumptions", "risks", "open_questions"]) {
    if (!Array.isArray(value[field]) || !(value[field] as unknown[]).every((item) => typeof item === "string")) {
      errors.push(`${field} must be array of strings`);
    }
  }

  if (!isRecord(value.outputs)) {
    errors.push("outputs must be object");
  }

  if (value.status === "partial") {
    const risks = Array.isArray(value.risks) ? value.risks : [];
    const questions = Array.isArray(value.open_questions) ? value.open_questions : [];
    if (!risks.length && !questions.length) {
      errors.push("partial status requires risks or open_questions");
    }
  }

  if (value.status === "blocked") {
    const risks = Array.isArray(value.risks) ? value.risks : [];
    if (!risks.length || !String(value.recommended_next_step ?? "").trim()) {
      errors.push("blocked status requires risks and recommended_next_step");
    }
  }

  return errors;
}

function resolveArtifactContent(
  raw: string,
  envelope: AgenticOutputEnvelope | undefined,
  artifactName: string,
  fileName: string,
): string {
  if (!envelope) {
    return raw;
  }

  const direct = envelope.outputs[artifactName] ?? envelope.outputs[fileName];
  if (typeof direct === "string") {
    return direct;
  }

  if (direct) {
    return [
      `# ${fileName}`,
      "",
      "## Inputs Used",
      "",
      ...envelope.inputs_used.map((input) => `- \`${input}\``),
      "",
      "## Agent Output",
      "",
      "```json",
      JSON.stringify(direct, null, 2),
      "```",
      "",
    ].join("\n");
  }

  return [
    `# ${fileName}`,
    "",
    "## Inputs Used",
    "",
    ...envelope.inputs_used.map((input) => `- \`${input}\``),
    "",
    "## Summary",
    "",
    envelope.summary,
    "",
    "## Risks",
    "",
    ...envelope.risks.map((risk) => `- ${risk}`),
    "",
    "## Open Questions",
    "",
    ...envelope.open_questions.map((question) => `- ${question}`),
    "",
  ].join("\n");
}

function hasArtifactOutput(envelope: AgenticOutputEnvelope, artifactName: string, fileName: string): boolean {
  return Boolean(envelope.outputs[artifactName] ?? envelope.outputs[fileName]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function buildSpecialistPrompt(
  context: WorkflowStageExecutorContext,
  requiredArtifacts: readonly string[],
  inputs: string[],
): Promise<string> {
  const inputBlocks = await Promise.all(inputs.map(async (input) => {
    const path = join(context.outputDir, input);
    if (!existsSync(path)) {
      return `## ${input}\n\nMissing in output directory.`;
    }

    const content = await readFile(path, "utf8");
    return `## ${input}\n\n${content}`;
  }));

  const requiredFiles = requiredArtifacts.map((artifact) => artifactFiles[artifact]).join(", ");
  const requiredSections = requiredArtifacts.flatMap((artifact) => context.stage.requiredSectionsByArtifact[artifact] ?? []);

  return [
    `Ты исполняешь workflow stage ${context.stage.id}: ${context.stage.title}.`,
    `Owner: ${context.stage.owner}.`,
    `Execution mode: ${context.executionMode}.`,
    "",
    "Верни результат по agent output contract. Предпочтительный формат: fenced block `agent-output-yaml` или `agent-output-json`.",
    "Внутри `outputs` положи Markdown текущего артефакта по artifact name или file name.",
    `Required output file(s): ${requiredFiles}.`,
    "Обязательные секции:",
    ...requiredSections.map((section) => `- ${section}`),
    "",
    "Пиши поясняющий текст артефакта на русском языке, если file conventions не требуют английских идентификаторов.",
    "Сохрани assumptions, risks, open questions и inputs used.",
    "",
    "# Inputs",
    "",
    ...inputBlocks,
  ].join("\n");
}

async function appendStageLedgerNote(
  outputDir: string,
  stageId: string,
  result: WorkflowStageStatus,
  note: string,
): Promise<void> {
  const ledgerPath = join(outputDir, artifactFiles.stage_gate_ledger);
  if (!existsSync(ledgerPath)) {
    return;
  }

  await appendFile(
    ledgerPath,
    [
      "",
      `| ${nowIso()} | agentic executor ${stageId} | ${result} | ${formatLedgerCell(note)} |`,
    ].join("\n"),
    "utf8",
  );
}

async function appendAgenticStageProgress(
  context: WorkflowStageExecutorContext,
  status: WorkflowStageStatus,
  files: string[],
  inputs: string[],
  warnings: string[],
): Promise<void> {
  const handoffPath = join(context.outputDir, artifactFiles.handoff_bundle);
  if (existsSync(handoffPath)) {
    await appendFile(
      handoffPath,
      [
        "",
        `## ${context.stage.id} ${context.stage.title}`,
        "",
        "- Execution mode: `agentic`",
        `- Stage status: \`${status}\``,
        `- Completed artifacts: ${files.length ? files.map((file) => `\`${file}\``).join(", ") : "none"}`,
        `- Inputs used: ${inputs.length ? inputs.map((input) => `\`${input}\``).join(", ") : "none"}`,
        warnings.length
          ? `- Warnings/blockers: ${warnings.map(formatLedgerCell).join("; ")}`
          : "- Warnings/blockers: none",
        "- Next Required Artifact: see stage-gate-ledger.md",
      ].join("\n"),
      "utf8",
    );
  }

  await appendStageLedgerNote(
    context.outputDir,
    context.stage.id,
    status,
    [
      `Agentic execution wrote ${files.length ? files.map((file) => `\`${file}\``).join(", ") : "no artifacts"}`,
      warnings.length ? `Warnings/blockers: ${warnings.join("; ")}` : "No warnings",
    ].join(". "),
  );
}

function formatLedgerCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}

function findSpecialistKey(owner: string): AgentRegistryKey | undefined {
  const found = Object.entries(agentNames).find(([, value]) => value === owner)?.[0];
  if (!found || found === "orchestrator" || !(found in agentInstructionFiles)) {
    return undefined;
  }

  return found as AgentRegistryKey;
}

function inferAgenticInputs(owner: string): string[] {
  const route = Object.values(routeTools).find((item) => item.agent === owner || item.agent === agentNames[owner as keyof typeof agentNames]);
  if (!route) {
    return [artifactFiles.handoff_bundle];
  }

  return route.inputs
    .map((input) => artifactFiles[input as keyof typeof artifactFiles] ?? input)
    .filter((input) => !["goal", "context", "constraints", "sources", "source_policy"].includes(input));
}

function stageResult(
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

function inferInputsUsed(content: string): string[] {
  const match = content.match(/## Inputs Used\s+([\s\S]*?)(?:\n## |\n# |$)/);
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/`([^`]+)`|-\s+([^\n]+)/g)]
    .map((item) => item[1] ?? item[2])
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readArtifact(outputDir: string, fileName: string): Promise<string> {
  const path = join(outputDir, fileName);
  return existsSync(path) ? readFile(path, "utf8") : "";
}

function researchArtifacts(): string[] {
  return [
    artifactFiles.research_summary,
    artifactFiles.competitive_analysis,
    artifactFiles.proto_personas,
    artifactFiles.synthetic_interviews,
    artifactFiles.swot,
  ];
}
