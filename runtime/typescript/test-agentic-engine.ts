import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { formatModelProviderApprovalTarget } from "./agentic-approval-targets";
import { recordApproval } from "./approval-gate";
import { formatAgenticPreflight } from "./run-workflow-engine";
import { resumeWorkflowEngine } from "./workflow-engine";
import { getWorkflowStagesForProfile, workflowStages } from "./workflow-stages";
import { nowIso, writeRunState, type WorkflowRunState, type WorkflowStageStatus } from "./workflow-state";

interface TestCase {
  name: string;
  run: () => Promise<void>;
}

let tempDir = "";
const originalOpenAiKey = process.env.OPENAI_API_KEY;
const originalNodeEnv = process.env.NODE_ENV;
const originalMockOutputDir = process.env.AGENTIC_TEST_SPECIALIST_OUTPUT_DIR;

const testCases: TestCase[] = [
  {
    name: "resume processes approved default rollout and blocks next disabled stage",
    run: async () => {
      process.env.NODE_ENV = "test";
      process.env.OPENAI_API_KEY = "test-key";
      const mockOutputDir = join(tempDir, "mock-agent-outputs");
      process.env.AGENTIC_TEST_SPECIALIST_OUTPUT_DIR = mockOutputDir;
      await mkdir(mockOutputDir, { recursive: true });
      await writeFile(join(mockOutputDir, "02-prd.md"), renderMockPrdAgentOutput(), "utf8");
      await writeFile(join(mockOutputDir, "03-ia.md"), renderMockIaAgentOutput(), "utf8");

      await writeBaseArtifacts(tempDir);
      await writeAgenticRunState(tempDir);

      for (const stageId of ["02-prd", "03-ia"]) {
        const stage = getStage(stageId);
        await recordApproval(tempDir, {
          action: "model_provider_call",
          approved: true,
          approved_by: "test",
          target: formatModelProviderApprovalTarget(stage),
          notes: `Тестовое подтверждение для ${stageId}.`,
        });
      }

      const state = await resumeWorkflowEngine(tempDir);

      assert(state.status === "blocked", "run should stop as blocked on disabled rollout stage");
      assert(state.stages["02-prd"]?.status === "completed", "02-prd should complete");
      assert(state.stages["03-ia"]?.status === "completed", "03-ia should complete");
      assert(state.stages["04-design"]?.status === "blocked", "04-design should be blocked by rollout");
      assert(state.stages["05-copy"]?.status === "pending", "05-copy should remain pending after first blocked stage");
      assert(existsSync(join(tempDir, "prd.md")), "prd.md should exist");
      assert(existsSync(join(tempDir, "ia-brief.md")), "ia-brief.md should exist");
      assert(existsSync(join(tempDir, "design-brief.md")), "design-brief.md blocked artifact should exist");
      assert(!existsSync(join(tempDir, "copy-deck.md")), "copy-deck.md should not be created after blocked 04-design");

      const prd = await readFile(join(tempDir, "prd.md"), "utf8");
      const ia = await readFile(join(tempDir, "ia-brief.md"), "utf8");
      const design = await readFile(join(tempDir, "design-brief.md"), "utf8");
      assert(prd.includes("## MoSCoW"), "prd.md should include structured PRD output");
      assert(ia.includes("## Primary User Flow"), "ia-brief.md should include structured IA output");
      assert(design.includes("not enabled in the current staged rollout"), "design should explain rollout block");

      const preflight = await formatAgenticPreflight(tempDir, "outputs/test-agentic-engine", "test");
      assert(preflight.includes("Ready: yes"), "preflight should be ready after default rollout stages completed");
      assert(preflight.includes("not required (completed)"), "preflight should mark completed rollout approvals as not required");
      assert(preflight.includes("workflow:resume outputs/test-agentic-engine"), "ready preflight should suggest resume");
    },
  },
  {
    name: "reference profile resumes to visual reference gate and blocks without visual evidence",
    run: async () => {
      delete process.env.OPENAI_API_KEY;
      await writeBaseArtifacts(tempDir, "reference");
      await writeReferenceRunStateAtVisualGate(tempDir);

      const state = await resumeWorkflowEngine(tempDir);

      assert(state.profile === "reference", "run should keep reference profile");
      assert(state.status === "blocked", "reference run should block at visual gate instead of failing");
      assert(state.stages["09-visual-reference"]?.status === "blocked", "09-visual-reference should be blocked");
      assert(state.stages["10-test-bench"]?.status === "pending", "test bench should not run after blocked visual gate");
      assert(existsSync(join(tempDir, "visual-reference-review.md")), "visual-reference-review.md should be created");

      const review = await readFile(join(tempDir, "visual-reference-review.md"), "utf8");
      assert(review.includes("## Gate Result"), "visual review should include gate result section");
      assert(review.includes("visual-diff-result.json"), "visual review should explain missing visual diff evidence");
    },
  },
];

async function runTests(): Promise<void> {
  console.log("=== Запуск тестов agentic workflow engine ===");
  let passed = 0;
  let failed = 0;

  tempDir = await mkdtemp(join(tmpdir(), "product-agent-studio-agentic-engine-"));

  try {
    for (const testCase of testCases) {
      try {
        await testCase.run();
        console.log(`PASS: ${testCase.name}`);
        passed++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`FAIL: ${testCase.name}: ${message}`);
        failed++;
      }
    }
  } finally {
    restoreEnv();
    await rm(tempDir, { recursive: true, force: true });
  }

  console.log("\n=== Итоги тестирования ===");
  console.log(`Всего проверок: ${passed + failed}`);
  console.log(`Успешно: ${passed}`);
  console.log(`Ошибок: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function writeAgenticRunState(outputDir: string): Promise<void> {
  const now = nowIso();
  const stages = Object.fromEntries(workflowStages
    .filter((stage) => !stage.profile)
    .map((stage) => [stage.id, {
      id: stage.id,
      title: stage.title,
      status: (stage.id === "00-intake" || stage.id === "01-research" ? "completed" : "pending") as WorkflowStageStatus,
      attempts: stage.id === "00-intake" || stage.id === "01-research" ? 1 : 0,
      artifacts: [],
      updated_at: now,
    }])) as WorkflowRunState["stages"];

  const state: WorkflowRunState = {
    run_id: `test-agentic-${Date.now()}`,
    goal: "Тестовый agentic engine run",
    profile: "standard",
    execution_mode: "agentic",
    status: "running",
    output_dir: outputDir,
    created_at: now,
    updated_at: now,
    current_stage: "02-prd",
    stages,
  };

  await writeRunState(state);
}

async function writeReferenceRunStateAtVisualGate(outputDir: string): Promise<void> {
  const now = nowIso();
  const completedStages = new Set(["00-intake", "01-research", "02-prd", "03-ia", "04-design", "05-copy", "06-screens", "07-prototype", "08-frontend"]);
  const stages = Object.fromEntries(getWorkflowStagesForProfile("reference")
    .map((stage) => [stage.id, {
      id: stage.id,
      title: stage.title,
      status: (completedStages.has(stage.id) ? "completed" : "pending") as WorkflowStageStatus,
      attempts: completedStages.has(stage.id) ? 1 : 0,
      artifacts: [],
      updated_at: now,
    }])) as WorkflowRunState["stages"];

  const state: WorkflowRunState = {
    run_id: `test-reference-${Date.now()}`,
    goal: "Тестовый reference profile run https://example.com",
    profile: "reference",
    execution_mode: "local",
    status: "running",
    output_dir: outputDir,
    created_at: now,
    updated_at: now,
    current_stage: "09-visual-reference",
    stages,
  };

  await writeRunState(state);
}

async function writeBaseArtifacts(outputDir: string, profile: "standard" | "reference" = "standard"): Promise<void> {
  const artifacts: Record<string, string> = {
    "run-plan.md": [
      "# Run Plan",
      "",
      "## Запрос",
      "",
      "Тестовый agentic engine run для проверки persisted resume flow.",
      "",
      "## План этапов",
      "",
      "- Intake",
      "- Research",
      "- PRD",
      "- IA",
      "",
      "## Workflow Profile",
      "",
      profile,
      "",
      "## Ограничения",
      "",
      "- Внешние model providers не вызываются в тесте.",
      "",
    ].join("\n"),
    "handoff-bundle.md": [
      "# Handoff Bundle",
      "",
      "## Goal",
      "",
      "Тестовый agentic engine run.",
      "",
      "## Completed Artifacts",
      "",
      "- `recursive-brief.md`",
      "- `research-summary.md`",
      "- `competitive-analysis.md`",
      "- `proto-personas.md`",
      "- `synthetic-interviews.md`",
      "- `swot.md`",
      "",
      "## Next Required Artifact",
      "",
      "`prd.md`",
      "",
    ].join("\n"),
    "stage-gate-ledger.md": [
      "# Stage Gate Ledger",
      "",
      "## Run",
      "",
      "- Test run",
      "",
      "## Rule",
      "",
      "- Agentic approvals required before model provider calls.",
      "",
      "## Stage Status",
      "",
      "| Stage | Status | Notes |",
      "|---|---|---|",
      "| 00-intake | completed | scaffold |",
      "| 01-research | completed | local test artifacts |",
      "",
      "## Validation Runs",
      "",
      "| Time | Command | Result | Notes |",
      "|---|---|---|---|",
      "",
    ].join("\n"),
    "recursive-brief.md": [
      "# Recursive Brief",
      "",
      "## Expansion",
      "",
      "Тестовый запрос расширен до проверки agentic workflow engine resume flow.",
      "",
      "## Deepening",
      "",
      "Нужно проверить PRD и IA stages без внешнего model provider.",
      "",
      "## Consolidation",
      "",
      "Workflow должен пройти default rollout и заблокироваться на следующей отключённой стадии.",
      "",
      "## Assumptions",
      "",
      "- Mock specialist output имитирует structured contract.",
      "",
      "## Open Questions",
      "",
      "- Нет открытых вопросов для smoke-теста.",
      "",
    ].join("\n"),
    "research-summary.md": renderMinimalResearchSummary(),
    "competitive-analysis.md": renderResearchSibling("Competitive Analysis", ["## Competitor Set", "## Comparison Matrix", "## Takeaways"]),
    "proto-personas.md": renderResearchSibling("Proto Personas", ["## Proto Personas", "## Decision Context", "## Validation Plan"]),
    "synthetic-interviews.md": renderResearchSibling("Synthetic Interviews", ["## Guardrail", "## Simulated Interviews", "## Patterns To Validate"]),
    "swot.md": renderResearchSibling("SWOT", ["## SWOT", "## Strategic Notes"]),
  };

  for (const [file, content] of Object.entries(artifacts)) {
    await writeFile(join(outputDir, file), content, "utf8");
  }
}

function renderMinimalResearchSummary(): string {
  return [
    "# Research Summary",
    "",
    "## Inputs Used",
    "",
    "- `recursive-brief.md`",
    "",
    "## Research Questions",
    "",
    "- Как проверить agentic engine resume flow?",
    "",
    "## Audience",
    "",
    "Инженеры, проверяющие agentic orchestration runtime.",
    "",
    "## Jobs To Be Done",
    "",
    "- Убедиться, что approved stages проходят без внешнего API.",
    "",
    "## Proto Personas",
    "",
    "- Runtime maintainer.",
    "",
    "## Synthetic Interviews",
    "",
    "- Тестовая синтетическая запись для валидации секции.",
    "",
    "## Research Validation Plan",
    "",
    "- Проверить через local smoke tests.",
    "",
    "## Findings",
    "",
    "- Default rollout требует PRD и IA.",
    "",
    "## Sources",
    "",
    "- Local runtime test artifacts.",
    "",
  ].join("\n");
}

function renderResearchSibling(title: string, sections: string[]): string {
  return [
    `# ${title}`,
    "",
    "## Inputs Used",
    "",
    "- `research-summary.md`",
    "",
    ...sections.flatMap((section) => [
      section,
      "",
      "Тестовое содержимое достаточно длинное для workflow validation и содержит обязательную секцию.",
      "Дополнительная строка фиксирует, что это smoke artifact без внешних источников.",
      "",
    ]),
  ].join("\n");
}

function renderMockPrdAgentOutput(): string {
  const prdContent = [
    "# Product Requirements",
    "",
    "## Inputs Used",
    "",
    "- `recursive-brief.md`",
    "- `research-summary.md`",
    "",
    "## Problem",
    "",
    "Команде нужен проверяемый PRD для agentic engine smoke.",
    "",
    "## Goals",
    "",
    "- Проверить persisted resume flow.",
    "",
    "## Non-Goals",
    "",
    "- Не вызывать внешний model provider.",
    "",
    "## Requirements",
    "",
    "- Runtime должен создать `prd.md` из structured output.",
    "",
    "## MoSCoW",
    "",
    "- Must: PRD проходит validation.",
    "",
    "## Acceptance Criteria",
    "",
    "- Stage получает `completed`.",
    "",
    "## Analytics",
    "",
    "- Проверить stage result.",
    "",
  ].join("\n");

  return renderAgentOutput("prd", "prd", prdContent, ["recursive-brief.md", "research-summary.md"], "Передать PRD на IA stage.");
}

function renderMockIaAgentOutput(): string {
  const iaContent = [
    "# Information Architecture",
    "",
    "## Inputs Used",
    "",
    "- `prd.md`",
    "- `research-summary.md`",
    "",
    "## Primary Screen",
    "",
    "Главный экран содержит ценность, CTA и доказательства.",
    "",
    "## Primary Action",
    "",
    "Пользователь выбирает основной CTA.",
    "",
    "## Sitemap",
    "",
    "- Главная",
    "- Заявка",
    "",
    "## Primary User Flow",
    "",
    "1. Пользователь читает value proposition.",
    "2. Пользователь нажимает CTA.",
    "3. Пользователь отправляет заявку.",
    "",
  ].join("\n");

  return renderAgentOutput("ia", "ia_brief", iaContent, ["prd.md", "research-summary.md"], "Передать IA на design stage.");
}

function renderAgentOutput(agentName: string, artifactName: string, artifactContent: string, inputs: string[], nextStep: string): string {
  return [
    "```agent-output-yaml",
    `agent_name: ${agentName}`,
    "status: success",
    `summary: Тестовый ${artifactName} сформирован по контракту.`,
    "inputs_used:",
    ...inputs.map((input) => `  - ${input}`),
    "outputs:",
    `  ${artifactName}: |`,
    ...artifactContent.split("\n").map((line) => `    ${line}`),
    "assumptions: []",
    "risks: []",
    "open_questions: []",
    `recommended_next_step: ${nextStep}`,
    "```",
    "",
  ].join("\n");
}

function getStage(stageId: string) {
  const stage = workflowStages.find((item) => item.id === stageId);
  if (!stage) {
    throw new Error(`Unknown stage ${stageId}`);
  }

  return stage;
}

function restoreEnv(): void {
  if (typeof originalOpenAiKey === "undefined") {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
  }

  if (typeof originalNodeEnv === "undefined") {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }

  if (typeof originalMockOutputDir === "undefined") {
    delete process.env.AGENTIC_TEST_SPECIALIST_OUTPUT_DIR;
  } else {
    process.env.AGENTIC_TEST_SPECIALIST_OUTPUT_DIR = originalMockOutputDir;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

runTests().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
