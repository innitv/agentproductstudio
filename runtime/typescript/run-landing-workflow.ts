import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { LandingWorkflowInput } from "./schemas";
import { getCoreBundleArtifactsForProfile, getRoutePlanForProfile, type RouteProfile } from "./route.config";
import { agentInstructionFiles } from "./agents.registry";
import { createAgentsSdkLayer } from "./agents.sdk";
import { pathToFileURL } from "node:url";
import {
  artifactFiles,
  defaultWorkflowScale,
  getRequiredArtifactsForStage,
  getStagesSkippedByScale,
  getWorkflowStagesForProfile,
  intakeSurveyUnrecordedMarker,
  workflowStages,
  type WorkflowScale,
} from "./workflow-stages";

// Local no-API-key runner for Claude Code agent pack mode.
// It validates the workflow structure and creates an output scaffold without
// calling OpenAI APIs. A future standalone Agents SDK mode can reuse the same
// route config and artifact conventions.

const requiredProjectFiles = [
  "AGENTS.md",
  "agent-pack/templates/agent-output-contract.schema.md",
  "agent-pack/templates/file-format-conventions.md",
  "agent-pack/workflows/landing-agent-orchestration.workflow.md",
  "agent-pack/guardrails/guardrails.policy.md",
  "agent-pack/quality/quality-gates.md",
] as const;

export async function runLandingWorkflow(input: LandingWorkflowInput): Promise<string> {
  if (!input.goal.trim()) {
    throw new Error("Landing workflow requires a non-empty goal.");
  }

  const profile = input.profile ?? detectRouteProfile(input);
  // Оси запуска приходят с intake. Дефолты те же, что у движка: масштаб консервативен
  // (`full`), маршрут — умолчание студии (`code`).
  const axes: RunAxes = {
    profile,
    scale: input.scale ?? defaultWorkflowScale,
    recorded: {
      profile: Boolean(input.axes_recorded?.profile ?? input.profile),
      scale: Boolean(input.axes_recorded?.scale ?? input.scale),
    },
  };
  const routePlan = getRoutePlanForProfile(profile, axes.scale);

  if (!routePlan.length) {
    throw new Error("Landing workflow requires a non-empty route plan.");
  }

  const missingFiles = [
    ...requiredProjectFiles,
    ...Object.values(agentInstructionFiles),
  ].filter((file) => !existsSync(join(process.cwd(), file)));

  if (missingFiles.length) {
    throw new Error(`Landing workflow structure is incomplete. Missing: ${missingFiles.join(", ")}`);
  }

  const slug = createSlug(input.goal);
  const date = new Date().toISOString().slice(0, 10);
  const outputDir = join(process.cwd(), "outputs", slug, date);
  await mkdir(outputDir, { recursive: true });
  const agentsSdkLayer = await createAgentsSdkLayer(profile);

  const scaffold = [
    "# Landing Workflow Scaffold",
    "",
    `Goal: ${input.goal}`,
    `Date: ${date}`,
    `Profile: ${profile}`,
    "",
    "Mode: no-api-key Claude Code agent pack scaffold.",
    "",
    "Route plan:",
    ...routePlan.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Agents SDK layer:",
    `- Orchestrator: ${agentsSdkLayer.orchestrator.name}`,
    `- Specialists: ${Object.keys(agentsSdkLayer.specialists).length}`,
    `- Route tools: ${agentsSdkLayer.routeToolNames.join(", ")}`,
    "",
    `Scale: ${axes.scale}`,
    "",
    "Required artifacts:",
    ...getCoreBundleArtifactsForProfile(profile, axes.scale).map((artifact) => `- ${artifact}`),
    "",
    "Stage gates:",
    ...getWorkflowStagesForProfile(profile, axes.scale).flatMap((stage) => [
      `- ${stage.id}: ${stage.title}`,
      `  owner: ${stage.owner}`,
      `  artifacts: ${getRequiredArtifactsForStage(stage, profile).map((artifact) => artifactFiles[artifact]).join(", ")}`,
    ]),
    "",
    "Validation:",
    `- yarn workflow:validate outputs/${slug}/${date} --through 00-intake`,
    `- yarn workflow:validate outputs/${slug}/${date}`,
    "",
    "Next step: run the workflow through Claude Code using CLAUDE.md and the specialist instructions.",
    "",
  ].join("\n");

  await writeFile(join(outputDir, "workflow-scaffold.md"), scaffold, "utf8");
  await writeFile(join(outputDir, "run-plan.md"), createRunPlan(input.goal, date, axes), "utf8");
  await writeFile(join(outputDir, "handoff-bundle.md"), createHandoffBundle(input.goal, axes), "utf8");
  await writeFile(join(outputDir, "stage-gate-ledger.md"), createStageGateLedger(slug, date, input.goal, axes), "utf8");
  await writeFile(join(outputDir, "recursive-brief.md"), createRecursiveBriefScaffold(input.goal), "utf8");

  console.log(`Workflow scaffold created: outputs/${slug}/${date}/workflow-scaffold.md`);
  console.log(`Run setup artifacts created: outputs/${slug}/${date}/run-plan.md`);

  return outputDir;
}

async function main(): Promise<void> {
  const goal = process.argv.slice(2).join(" ").trim();

  if (!goal) {
    throw new Error('Usage: yarn landing:run "<landing workflow goal>"');
  }

  await runLandingWorkflow({ goal });
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "landing-workflow";
}

// Оси запуска и то, какие из них названы на старте явно.
interface RunAxes {
  profile: RouteProfile;
  scale: WorkflowScale;
  recorded: { profile: boolean; scale: boolean };
}

// Как ось попала в run: явным флагом на старте — или умолчанием, то есть никак.
//
// Ключевое решение по гейту опроса. Скаффолд НЕ пишет раздел заглушкой: заглушка закрывала
// бы гейт сама за себя, и проверка «опрос записан» стала бы тавтологией. Он пишет ровно то,
// что знает: ось, переданная флагом, — это и есть записанный ответ (оркестратор задал
// вопрос до создания каталога и закодировал ответ во флаге); ось, взятая умолчанием,
// помечается `intakeSurveyUnrecordedMarker`, и валидатор считает раздел незаписанным.
// Итог: запуск, сделанный по процессу (`yarn workflow:start "<цель>" --profile ... --scale ...`), валиден сразу; запуск молча, без ответов, называет ошибкой ровно то,
// чего не хватает, — вместо прежнего «нет раздела», которое падало у любого нового run.
function axisProvenance(recorded: boolean, flag: string, value: string): string {
  return recorded ? `передано на старте: \`${flag} ${value}\`` : intakeSurveyUnrecordedMarker;
}

function createRunPlan(goal: string, date: string, axes: RunAxes): string {
  const stagesInScale = getWorkflowStagesForProfile(axes.profile, axes.scale);
  const stagesOutOfScale = getStagesSkippedByScale(axes.profile, axes.scale);

  return [
    "# Run Plan",
    "",
    "## Статус",
    "",
    "`partial`",
    "",
    "## Запрос",
    "",
    goal,
    "",
    "## Дата",
    "",
    date,
    "",
    "## Workflow Profile",
    "",
    axes.profile,
    "",
    "## Ответы на вопросы intake",
    "",
    "| Вопрос | Ответ | Как получен | Ось |",
    "|---|---|---|---|",
    `| Есть конкретный образец, с которым сверять результат? | ${axes.profile === "reference" ? "Да" : "Нет"} | ${axisProvenance(axes.recorded.profile, "--profile", axes.profile)} | \`profile\` = \`${axes.profile}\` |`,
    "",
    // Пометку нельзя называть в пояснении дословно: валидатор ищет её по всему файлу, и
    // упоминание в тексте само стало бы незакрытым ответом.
    "Скаффолд заполняет только те оси, значение которых передано на старте. Ось, помеченная как незаписанная, гейт не закрывает: оркестратор обязан дописать ответ и то, как он получен, либо причину, по которой вопрос законно не задавался (ответ уже дан в запросе, запуск не продуктовый, режим `quick draft`).",
    "",
    "## Масштаб",
    "",
    `- \`scale\`: \`${axes.scale}\``,
    `- Источник: ${axisProvenance(axes.recorded.scale, "--scale", axes.scale)}`,
    axes.scale === "full"
      ? "- Стадий вне масштаба нет: `full` включает весь pipeline."
      : "- Стадии вне масштаба записаны в `stage-gate-ledger.md` как `skipped_by_scale`.",
    "",
    "## План этапов",
    "",
    ...stagesInScale.map((stage) => `- ${stage.id}: ${stage.title} -> ${getRequiredArtifactsForStage(stage, axes.profile).map((artifact) => artifactFiles[artifact]).join(", ")}`),
    ...(stagesOutOfScale.length
      ? ["", `Вне масштаба \`${axes.scale}\` (записаны в ledger как \`skipped_by_scale\`): ${stagesOutOfScale.map((stage) => stage.id).join(", ")}.`]
      : []),
    "",
    "## Ограничения",
    "",
    "- Это стартовый scaffold без выполненного research/PRD/frontend.",
    "- Следующий этап обязан завершить `recursive-brief.md`, затем deep research artifacts.",
    "",
  ].join("\n");
}

function createHandoffBundle(goal: string, axes: RunAxes): string {
  return [
    "# Handoff Bundle",
    "",
    "## Goal",
    "",
    goal,
    "",
    "## Workflow Profile",
    "",
    axes.profile,
    "",
    "## Workflow Scale",
    "",
    axes.scale,
    "",
    "## Visual Reference Required",
    "",
    axes.profile === "reference" ? "true" : "false",
    "",
    "## Inputs Used",
    "",
    "- User request",
    "",
    "## Completed Artifacts",
    "",
    "- `run-plan.md`",
    "- `handoff-bundle.md`",
    "- `stage-gate-ledger.md`",
    "- `recursive-brief.md` scaffold",
    "",
    "## Current Decisions",
    "",
    "- Workflow is initialized; product decisions are not validated yet.",
    "",
    "## Assumptions",
    "",
    "- Deep research has not started.",
    "",
    "## Risks",
    "",
    "- Any downstream work before research and PRD is a process violation.",
    "",
    "## Open Questions",
    "",
    "- Need recursive brief consolidation.",
    "- Need source policy and research scope.",
    "",
    "## Next Required Artifact",
    "",
    "`recursive-brief.md` completion, then `research-summary.md` bundle.",
    "",
    "## Blocked Items",
    "",
    "- Frontend is blocked until upstream gates pass.",
    "",
  ].join("\n");
}

function createStageGateLedger(slug: string, date: string, goal: string, axes: RunAxes): string {
  const outOfScale = new Set(getStagesSkippedByScale(axes.profile, axes.scale).map((stage) => stage.id));

  return [
    "# Stage Gate Ledger",
    "",
    "## Run",
    "",
    `- Project slug: ${slug}`,
    `- Date: ${date}`,
    `- Goal: ${goal}`,
    `- Workflow profile: ${axes.profile}`,
    `- Workflow scale: ${axes.scale}`,
    "",
    "## Rule",
    "",
    "Каждый stage считается завершенным только когда обязательные артефакты записаны, `handoff-bundle.md` обновлен, risks/open questions перенесены дальше и validation не возвращает errors для complete bundle.",
    "",
    "Оси зафиксированы на `00-intake` и не меняются задним числом: валидатор отклонит run, где стадия вне масштаба уже отработала или где маршрут-зависимая стадия отработала под другим маршрутом.",
    "",
    "## Stage Status",
    "",
    "| Stage | Title | Owner | Required artifacts | Status | Gate notes |",
    "|---|---|---|---|---|---|",
    ...workflowStages
      .filter((stage) => !stage.profile || stage.profile === axes.profile)
      .map((stage, index) => {
        const artifacts = getRequiredArtifactsForStage(stage, axes.profile).map((artifact) => `\`${artifactFiles[artifact]}\``).join(", ");
        if (outOfScale.has(stage.id)) {
          return `| ${stage.id} | ${stage.title} | ${stage.owner} | ${artifacts} | \`skipped_by_scale\` | Вне масштаба \`${axes.scale}\`, зафиксировано на 00-intake |`;
        }

        const status = index === 0 ? "partial" : "pending";
        return `| ${stage.id} | ${stage.title} | ${stage.owner} | ${artifacts} | ${status} | Scaffold initialized |`;
      }),
    "",
    "## Validation Runs",
    "",
    "| Time | Command | Result | Notes |",
    "|---|---|---|---|",
    "",
  ].join("\n");
}

function detectRouteProfile(input: LandingWorkflowInput): RouteProfile {
  const haystack = [
    input.goal,
    input.context,
    ...(input.constraints ?? []),
    ...(input.sources ?? []),
  ].filter(Boolean).join("\n");

  return /https?:\/\/|visual reference|reference url|как этот сайт|референс/i.test(haystack)
    ? "reference"
    : "standard";
}

function createRecursiveBriefScaffold(goal: string): string {
  return [
    "# Recursive Brief",
    "",
    "## Inputs Used",
    "",
    "- User request",
    "",
    "## Expansion",
    "",
    `Нужно развернуть исходную цель: ${goal}`,
    "",
    "## Deepening",
    "",
    "Требуется уточнить аудиторию, контекст покупки, ограничения, критерии успеха и fail criteria.",
    "",
    "## Consolidation",
    "",
    "`partial`: consolidation еще не завершена.",
    "",
    "## Assumptions",
    "",
    "- Входной запрос еще не прошел полноценное уточнение.",
    "",
    "## Open Questions",
    "",
    "- Кто целевая аудитория?",
    "- Какие ограничения по рынку, географии, срокам и источникам?",
    "",
  ].join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
