import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "js-yaml";
import { approvalActions } from "./approval-gate";
import { agentInstructionFiles, agentNames } from "./agents.registry";
import { artifactNames, routeTools } from "./route.config";
import { loadSkillMetadataRecords } from "./skill-metadata";
import { getRequiredArtifactsForStage, workflowStages } from "./workflow-stages";

type AgentRegistryKey = keyof typeof agentInstructionFiles;

export interface AgentInstructionDocument {
  metadata?: AgentMetadata;
  body: string;
}

export interface AgentMetadata {
  agent_name: string;
  owner_stage_ids: string[];
  required_inputs: string[];
  required_outputs: string[];
  approval_actions: string[];
  skills: string[];
  contract_schema: string;
}

export function parseAgentInstructionDocument(content: string): AgentInstructionDocument {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { body: content };
  }

  const parsed = YAML.load(match[1]) as unknown;
  return {
    metadata: isAgentMetadata(parsed) ? parsed : undefined,
    body: content.slice(match[0].length),
  };
}

export function loadAgentMetadata(filePath: string): AgentMetadata | undefined {
  return parseAgentInstructionDocument(readFileSync(filePath, "utf8")).metadata;
}

export function validateAgentMetadata(root = process.cwd()): string[] {
  const errors: string[] = [];
  const knownArtifacts = new Set<string>(Object.values(artifactNames));
  const knownStages = new Set(workflowStages.map((stage) => stage.id));
  const knownApprovals = new Set<string>(approvalActions);
  const skillRecords = loadSkillMetadataRecords(root);
  const skillsById = new Map(skillRecords.map((record) => [record.metadata.id, record.metadata]));

  for (const [key, file] of Object.entries(agentInstructionFiles) as Array<[AgentRegistryKey, string]>) {
    const metadata = loadAgentMetadata(join(root, file));
    if (!metadata) {
      errors.push(`${file}: missing YAML frontmatter agent metadata.`);
      continue;
    }

    const expectedAgentName = agentNames[key];
    if (metadata.agent_name !== expectedAgentName) {
      errors.push(`${file}: agent_name '${metadata.agent_name}' must match registry '${expectedAgentName}'.`);
    }

    if (metadata.contract_schema !== "agent-pack/schemas/agent-output.schema.json") {
      errors.push(`${file}: contract_schema must be agent-pack/schemas/agent-output.schema.json.`);
    }

    for (const stageId of metadata.owner_stage_ids) {
      if (!knownStages.has(stageId)) {
        errors.push(`${file}: owner_stage_ids contains unknown stage '${stageId}'.`);
      }
    }

    for (const action of metadata.approval_actions) {
      if (!knownApprovals.has(action)) {
        errors.push(`${file}: approval_actions contains unknown action '${action}'.`);
      }
    }

    for (const skillId of metadata.skills) {
      const skill = skillsById.get(skillId);
      if (!skill) {
        errors.push(`${file}: skills contains unknown skill '${skillId}'.`);
        continue;
      }

      if (metadata.owner_stage_ids.length > 0) {
        const hasStageOverlap = metadata.owner_stage_ids.some((stageId) => skill.owner_stage_ids.includes(stageId));
        if (!hasStageOverlap) {
          errors.push(`${file}: skill '${skillId}' has no owner_stage_ids overlap with agent stages '${metadata.owner_stage_ids.join(", ")}'.`);
        }
      }
    }

    for (const artifact of metadata.required_outputs) {
      if (!knownArtifacts.has(artifact) && !["notion_research_export_ru", "notion_publication_record"].includes(artifact)) {
        errors.push(`${file}: required_outputs contains unknown artifact '${artifact}'.`);
      }
    }

    const expectedStageOutputs = workflowStages
      .filter((stage) => stage.owner === expectedAgentName)
      .flatMap((stage) => getRequiredArtifactsForStage(stage, stage.profile ?? "standard"));
    for (const artifact of expectedStageOutputs) {
      if (!metadata.required_outputs.includes(artifact)) {
        errors.push(`${file}: metadata required_outputs is missing stage artifact '${artifact}'.`);
      }
    }

    const routeOutputs = Object.values(routeTools)
      .filter((route) => route.agent === expectedAgentName)
      .flatMap((route) => route.outputs);
    for (const artifact of routeOutputs) {
      if (!metadata.required_outputs.includes(artifact)) {
        errors.push(`${file}: metadata required_outputs is missing route output '${artifact}'.`);
      }
    }

    const routeArtifactInputs = Object.values(routeTools)
      .filter((route) => route.agent === expectedAgentName)
      .flatMap((route) => [
        ...route.inputs,
        ...("dependsOn" in route ? route.dependsOn : []),
      ])
      .filter((input) => knownArtifacts.has(input));
    const routeReachableArtifacts = new Set<string>([
      ...routeArtifactInputs,
      ...Object.values(routeTools)
        .filter((route) => route.agent === expectedAgentName)
        .flatMap((route) => [
          ...("referenceInputs" in route ? route.referenceInputs : []),
          ...("referenceDependsOn" in route ? route.referenceDependsOn : []),
        ])
        .filter((input) => knownArtifacts.has(input)),
    ]);
    for (const artifact of unique(routeArtifactInputs)) {
      if (!metadata.required_inputs.includes(artifact)) {
        errors.push(`${file}: metadata required_inputs is missing route input '${artifact}'.`);
      }
    }

    for (const artifact of metadata.required_inputs.filter((input) => knownArtifacts.has(input))) {
      if (!routeReachableArtifacts.has(artifact)) {
        errors.push(`${file}: routeTools never provide metadata required_input '${artifact}'.`);
      }
    }

    errors.push(...validateWrapperSkills(root, key, expectedAgentName, metadata));
  }

  return errors;
}

// Контракт — источник правды по составу skills, но исполняет агента обёртка
// `.claude/agents/<name>.md`: именно её `skills:` Claude Code преднагружает. Пока эти два
// списка никто не сверял, они разъезжались молча — обёртки отставали от контрактов на
// целые skills (аудит 2026-07-17). Здесь связь становится проверкой, а не договорённостью.
function validateWrapperSkills(
  root: string,
  key: AgentRegistryKey,
  agentName: string,
  metadata: AgentMetadata,
): string[] {
  // Оркестратор — это главная сессия, а не вызываемый субагент: его обёртка служит
  // чек-листом и `skills:` не объявляет (главная сессия видит все skills сама).
  if (key === "orchestrator") return [];

  const wrapperFile = `.claude/agents/${agentName}.md`;
  let content: string;
  try {
    content = readFileSync(join(root, wrapperFile), "utf8");
  } catch {
    return [`${wrapperFile}: missing native agent wrapper for contract agent '${agentName}'.`];
  }

  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatter) {
    return [`${wrapperFile}: missing YAML frontmatter.`];
  }

  const parsed = YAML.load(frontmatter[1]) as Record<string, unknown> | undefined;
  const rawSkills = parsed?.skills;
  const wrapperSkills = Array.isArray(rawSkills)
    ? rawSkills.map(String)
    : typeof rawSkills === "string" && rawSkills.trim()
      ? [rawSkills.trim()]
      : [];

  const contractSkills = metadata.skills;
  const missing = contractSkills.filter((skill) => !wrapperSkills.includes(skill));
  const extra = wrapperSkills.filter((skill) => !contractSkills.includes(skill));
  const errors: string[] = [];

  if (missing.length) {
    errors.push(
      `${wrapperFile}: skills is missing '${missing.join("', '")}' declared in ${agentInstructionFiles[key]}. ` +
      "The contract is the source of truth; the wrapper is what actually runs, so it must list the same skills.",
    );
  }
  if (extra.length) {
    errors.push(
      `${wrapperFile}: skills contains '${extra.join("', '")}' which the contract ${agentInstructionFiles[key]} does not declare. ` +
      "Add it to the contract or drop it from the wrapper — the two must agree.",
    );
  }
  return errors;
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

function isAgentMetadata(value: unknown): value is AgentMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.agent_name === "string"
    && Array.isArray(record.owner_stage_ids)
    && record.owner_stage_ids.every((item) => typeof item === "string")
    && Array.isArray(record.required_inputs)
    && record.required_inputs.every((item) => typeof item === "string")
    && Array.isArray(record.required_outputs)
    && record.required_outputs.every((item) => typeof item === "string")
    && Array.isArray(record.approval_actions)
    && record.approval_actions.every((item) => typeof item === "string")
    && Array.isArray(record.skills)
    && record.skills.every((item) => typeof item === "string")
    && typeof record.contract_schema === "string";
}
