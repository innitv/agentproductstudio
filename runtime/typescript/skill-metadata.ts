import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import YAML from "js-yaml";
import { approvalActions } from "./approval-gate";
import { artifactNames } from "./route.config";
import { workflowStages } from "./workflow-stages";

export interface SkillInstructionDocument {
  metadata?: SkillMetadata;
  body: string;
}

export interface SkillMetadata {
  id: string;
  name: string;
  title: string;
  description: string;
  platforms: string[];
  mcp_servers: string[];
  strictness_profile: "standard" | "strict";
  owner_stage_ids: string[];
  required_inputs: string[];
  required_outputs: string[];
  approval_actions: string[];
  validation_commands: string[];
  contract_schema: string;
}

export interface SkillMetadataRecord {
  file: string;
  metadata: SkillMetadata;
}

export function parseSkillInstructionDocument(content: string): SkillInstructionDocument {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { body: content };
  }

  const parsed = YAML.load(match[1]) as unknown;
  return {
    metadata: isSkillMetadata(parsed) ? parsed : undefined,
    body: content.slice(match[0].length),
  };
}

export function validateSkillMetadata(root = process.cwd()): string[] {
  const errors: string[] = [];
  const knownArtifacts = new Set<string>(Object.values(artifactNames));
  const knownStages = new Set(workflowStages.map((stage) => stage.id));
  const knownApprovals = new Set<string>(approvalActions);
  const allowedNonArtifactInputs = new Set([
    "approval_record",
    "notion_target",
    "run_plan",
    "recursive_brief",
  ]);
  const allowedNonArtifactOutputs = new Set([
    "notion_research_export_ru",
    "notion_publication_record",
  ]);

  for (const file of listSkillFiles(root)) {
    const relativeFile = relative(root, file).replaceAll("\\", "/");
    const content = readFileSync(file, "utf8");
    const metadata = parseSkillInstructionDocument(content).metadata;
    if (!metadata) {
      errors.push(`${relativeFile}: missing YAML frontmatter skill metadata.`);
      continue;
    }

    const expectedId = file.split(/[\\/]/).at(-2);
    if (metadata.id !== expectedId) {
      errors.push(`${relativeFile}: id '${metadata.id}' must match skill directory '${expectedId}'.`);
    }

    if (metadata.name !== metadata.id) {
      errors.push(`${relativeFile}: name '${metadata.name}' must match id '${metadata.id}'.`);
    }

    if (metadata.contract_schema !== "agent-pack/templates/skill.template.md") {
      errors.push(`${relativeFile}: contract_schema must be agent-pack/templates/skill.template.md.`);
    }

    for (const stageId of metadata.owner_stage_ids) {
      if (!knownStages.has(stageId)) {
        errors.push(`${relativeFile}: owner_stage_ids contains unknown stage '${stageId}'.`);
      }
    }

    for (const action of metadata.approval_actions) {
      if (!knownApprovals.has(action)) {
        errors.push(`${relativeFile}: approval_actions contains unknown action '${action}'.`);
      }
    }

    for (const input of metadata.required_inputs) {
      if (!knownArtifacts.has(input) && !allowedNonArtifactInputs.has(input)) {
        errors.push(`${relativeFile}: required_inputs contains unknown artifact/input '${input}'.`);
      }
    }

    for (const output of metadata.required_outputs) {
      if (!knownArtifacts.has(output) && !allowedNonArtifactOutputs.has(output)) {
        errors.push(`${relativeFile}: required_outputs contains unknown artifact/output '${output}'.`);
      }
    }

    for (const command of metadata.validation_commands) {
      if (!command.startsWith("yarn ")) {
        errors.push(`${relativeFile}: validation command must start with 'yarn ': ${command}`);
      }
    }
  }

  return errors;
}

export function loadSkillMetadataRecords(root = process.cwd()): SkillMetadataRecord[] {
  return listSkillFiles(root).flatMap((file) => {
    const content = readFileSync(file, "utf8");
    const metadata = parseSkillInstructionDocument(content).metadata;
    if (!metadata) {
      return [];
    }

    return [{
      file: relative(root, file).replaceAll("\\", "/"),
      metadata,
    }];
  });
}

function listSkillFiles(root: string): string[] {
  const skillsDir = join(root, "agent-pack", "skills");
  if (!existsSync(skillsDir)) {
    return [];
  }

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => join(skillsDir, item.name, "SKILL.md"))
    .filter((file) => existsSync(file))
    .map((file) => file.replaceAll("\\", "/"));
}

function isSkillMetadata(value: unknown): value is SkillMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.id === "string"
    && typeof record.name === "string"
    && typeof record.title === "string"
    && typeof record.description === "string"
    && Array.isArray(record.platforms)
    && record.platforms.every((item) => typeof item === "string")
    && Array.isArray(record.mcp_servers)
    && record.mcp_servers.every((item) => typeof item === "string")
    && (record.strictness_profile === "standard" || record.strictness_profile === "strict")
    && Array.isArray(record.owner_stage_ids)
    && record.owner_stage_ids.every((item) => typeof item === "string")
    && Array.isArray(record.required_inputs)
    && record.required_inputs.every((item) => typeof item === "string")
    && Array.isArray(record.required_outputs)
    && record.required_outputs.every((item) => typeof item === "string")
    && Array.isArray(record.approval_actions)
    && record.approval_actions.every((item) => typeof item === "string")
    && Array.isArray(record.validation_commands)
    && record.validation_commands.every((item) => typeof item === "string")
    && typeof record.contract_schema === "string";
}
