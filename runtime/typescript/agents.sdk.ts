import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { Agent, run } from "@openai/agents";
import { agentInstructionFiles, agentNames } from "./agents.registry";
import { routePlan, routeTools } from "./route.config";

export type AgentRegistryKey = keyof typeof agentInstructionFiles;

export interface AgentsSdkLayer {
  orchestrator: Agent;
  specialists: Partial<Record<AgentRegistryKey, Agent>>;
  routeToolNames: string[];
}

export interface StandaloneRunResult {
  finalOutput: unknown;
}

const specialistDescriptions: Partial<Record<AgentRegistryKey, string>> = {
  research: "Prepare source-backed research findings, unknowns and claims to validate.",
  prd: "Create a PRD with goals, scope, requirements, MoSCoW and acceptance criteria.",
  notionPublisher: "Prepare or publish a Notion-ready PRD export when approval is present.",
  ia: "Create information architecture, sitemap and primary user flow.",
  design: "Create UX/UI design brief, sections, components, responsive and accessibility notes.",
  designGenerator: "Generate screen specifications from IA, design direction and copy.",
  prototype: "Create prototype transition map and manual clickable prototype instructions.",
  copywriting: "Create landing copy deck, CTA text, FAQ, SEO and claims to validate.",
  frontend: "Implement or specify frontend delivery from PRD, IA, screens, copy and prototype.",
  testBench: "Create funnel analytics checks and test bench result.",
  qaReview: "Review PRD fit, UX, accessibility, responsive behavior, secrets and checks.",
  release: "Create release notes with changed files, validation, deployment and rollback notes.",
};

export async function loadAgentInstructions(): Promise<Record<AgentRegistryKey, string>> {
  const entries = await Promise.all(
    Object.entries(agentInstructionFiles).map(async ([key, file]) => {
      const content = await readFile(file, "utf8");
      return [key, content] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<AgentRegistryKey, string>;
}

export async function createAgentsSdkLayer(): Promise<AgentsSdkLayer> {
  const instructions = await loadAgentInstructions();
  const specialists = createSpecialistAgents(instructions);
  const orchestrator = createOrchestratorAgent(instructions.orchestrator, specialists);

  return {
    orchestrator,
    specialists,
    routeToolNames: orchestrator.tools.map((tool) => tool.name),
  };
}

export function createSpecialistAgents(
  instructions: Record<AgentRegistryKey, string>,
): Partial<Record<AgentRegistryKey, Agent>> {
  const specialists: Partial<Record<AgentRegistryKey, Agent>> = {};

  for (const [key, instruction] of Object.entries(instructions) as [AgentRegistryKey, string][]) {
    if (key === "orchestrator") {
      continue;
    }

    specialists[key] = new Agent({
      name: agentNames[key],
      instructions: instruction,
      handoffDescription: specialistDescriptions[key] ?? `${agentNames[key]} specialist.`,
    });
  }

  return specialists;
}

export function createOrchestratorAgent(
  instructions: string,
  specialists: Partial<Record<AgentRegistryKey, Agent>>,
): Agent {
  const routeToolsAsAgentTools = routePlan.flatMap((step) => {
    const route = routeTools[step];

    if (route.agent === agentNames.orchestrator) {
      return [];
    }

    const specialistKey = findAgentRegistryKey(route.agent);
    const specialist = specialists[specialistKey];

    if (!specialist) {
      throw new Error(`Missing specialist agent for route step '${step}'.`);
    }

    return [specialist.asTool({
      toolName: route.tool,
      toolDescription: `${specialistDescriptions[specialistKey] ?? route.agent} Inputs: ${route.inputs.join(", ")}. Outputs: ${route.outputs.join(", ")}.`,
    })];
  });

  return new Agent({
    name: agentNames.orchestrator,
    instructions,
    handoffDescription: "Owns final synthesis and controls the product landing workflow.",
    tools: routeToolsAsAgentTools,
  });
}

export async function runStandaloneAgentsSdkWorkflow(goal: string): Promise<StandaloneRunResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Standalone Agents SDK mode requires OPENAI_API_KEY. Use Codex agent pack mode when no API key is available.");
  }

  const { orchestrator } = await createAgentsSdkLayer();
  const result = await run(orchestrator, goal);

  return { finalOutput: result.finalOutput };
}

function findAgentRegistryKey(agentName: string): AgentRegistryKey {
  const found = Object.entries(agentNames).find(([, value]) => value === agentName)?.[0];

  if (!found || !(found in agentInstructionFiles)) {
    throw new Error(`No agent instruction file registered for '${agentName}'.`);
  }

  return found as AgentRegistryKey;
}

async function inspectLayer(): Promise<void> {
  const missingInstructionFiles = Object.values(agentInstructionFiles).filter((file) => !existsSync(file));
  if (missingInstructionFiles.length) {
    throw new Error(`Missing agent instruction files: ${missingInstructionFiles.join(", ")}`);
  }

  const layer = await createAgentsSdkLayer();
  console.log(`Orchestrator: ${layer.orchestrator.name}`);
  console.log(`Specialists: ${Object.keys(layer.specialists).length}`);
  console.log(`Route tools: ${layer.routeToolNames.join(", ")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  inspectLayer().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
