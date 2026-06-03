import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { LandingWorkflowInput } from "./schemas";
import { getCoreBundleArtifactsForProfile, getRoutePlanForProfile, type RouteProfile } from "./route.config";
import { agentInstructionFiles } from "./agents.registry";
import { createAgentsSdkLayer } from "./agents.sdk";
import { pathToFileURL } from "node:url";
import { artifactFiles, getRequiredArtifactsForStage, workflowStages } from "./workflow-stages";

// Local no-API-key runner for Codex agent pack mode.
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
  const routePlan = getRoutePlanForProfile(profile);

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
    "Mode: no-api-key Codex agent pack scaffold.",
    "",
    "Route plan:",
    ...routePlan.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Agents SDK layer:",
    `- Orchestrator: ${agentsSdkLayer.orchestrator.name}`,
    `- Specialists: ${Object.keys(agentsSdkLayer.specialists).length}`,
    `- Route tools: ${agentsSdkLayer.routeToolNames.join(", ")}`,
    "",
    "Required artifacts:",
    ...getCoreBundleArtifactsForProfile(profile).map((artifact) => `- ${artifact}`),
    "",
    "Stage gates:",
    ...workflowStages.flatMap((stage) => [
      `- ${stage.id}: ${stage.title}`,
      `  owner: ${stage.owner}`,
      `  artifacts: ${getRequiredArtifactsForStage(stage, profile).map((artifact) => artifactFiles[artifact]).join(", ")}`,
    ]),
    "",
    "Validation:",
    `- yarn workflow:validate outputs/${slug}/${date} --through 00-intake`,
    `- yarn workflow:validate outputs/${slug}/${date}`,
    "",
    "Next step: run the workflow through Codex using AGENTS.md and the specialist instructions.",
    "",
  ].join("\n");

  await writeFile(join(outputDir, "workflow-scaffold.md"), scaffold, "utf8");
  await writeFile(join(outputDir, "run-plan.md"), createRunPlan(input.goal, date, profile), "utf8");
  await writeFile(join(outputDir, "handoff-bundle.md"), createHandoffBundle(input.goal, profile), "utf8");
  await writeFile(join(outputDir, "stage-gate-ledger.md"), createStageGateLedger(slug, date, input.goal, profile), "utf8");
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

function createRunPlan(goal: string, date: string, profile: RouteProfile): string {
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
    profile,
    "",
    "## План этапов",
    "",
    ...workflowStages.map((stage) => `- ${stage.id}: ${stage.title} -> ${getRequiredArtifactsForStage(stage, profile).map((artifact) => artifactFiles[artifact]).join(", ")}`),
    "",
    "## Ограничения",
    "",
    "- Это стартовый scaffold без выполненного research/PRD/frontend.",
    "- Следующий этап обязан завершить `recursive-brief.md`, затем deep research artifacts.",
    "",
  ].join("\n");
}

function createHandoffBundle(goal: string, profile: RouteProfile): string {
  return [
    "# Handoff Bundle",
    "",
    "## Goal",
    "",
    goal,
    "",
    "## Workflow Profile",
    "",
    profile,
    "",
    "## Visual Reference Required",
    "",
    profile === "reference" ? "true" : "false",
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

function createStageGateLedger(slug: string, date: string, goal: string, profile: RouteProfile): string {
  return [
    "# Stage Gate Ledger",
    "",
    "## Run",
    "",
    `- Project slug: ${slug}`,
    `- Date: ${date}`,
    `- Goal: ${goal}`,
    `- Workflow profile: ${profile}`,
    "",
    "## Rule",
    "",
    "Каждый stage считается завершенным только когда обязательные артефакты записаны, `handoff-bundle.md` обновлен, risks/open questions перенесены дальше и validation не возвращает errors для complete bundle.",
    "",
    "## Stage Status",
    "",
    "| Stage | Owner | Required artifacts | Status | Gate notes |",
    "|---|---|---|---|---|",
    ...workflowStages.map((stage, index) => {
      const status = index === 0 ? "partial" : "pending";
      return `| ${stage.id} ${stage.title} | ${stage.owner} | ${getRequiredArtifactsForStage(stage, profile).map((artifact) => `\`${artifactFiles[artifact]}\``).join(", ")} | ${status} | Scaffold initialized |`;
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
