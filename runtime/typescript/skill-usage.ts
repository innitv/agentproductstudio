import { join } from "node:path";
import { agentInstructionFiles, agentNames } from "./agents.registry";
import { loadAgentMetadata, type AgentMetadata } from "./agent-metadata";
import { loadSkillMetadataRecords, type SkillMetadata } from "./skill-metadata";
import { workflowStages } from "./workflow-stages";

export interface AgentSkillUsageRow {
  stageId: string;
  stageTitle: string;
  agentName: string;
  skills: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

type AgentRegistryKey = keyof typeof agentInstructionFiles;

export function inspectSkillUsage(root = process.cwd()): AgentSkillUsageRow[] {
  const skillsById = new Map<string, SkillMetadata>(
    loadSkillMetadataRecords(root).map((record) => [record.metadata.id, record.metadata]),
  );
  const agentMetadataByName = new Map<string, AgentMetadata>();

  for (const [key, file] of Object.entries(agentInstructionFiles) as Array<[AgentRegistryKey, string]>) {
    const metadata = loadAgentMetadata(join(root, file));
    if (metadata) {
      agentMetadataByName.set(agentNames[key], metadata);
    }
  }

  return workflowStages.map((stage) => {
    const agentMetadata = agentMetadataByName.get(stage.owner);
    const stageSkills = (agentMetadata?.skills ?? [])
      .map((skillId) => skillsById.get(skillId))
      .filter((skill): skill is SkillMetadata => Boolean(skill))
      .filter((skill) => skill.owner_stage_ids.includes(stage.id));

    return {
      stageId: stage.id,
      stageTitle: stage.title,
      agentName: stage.owner,
      skills: stageSkills.map((skill) => ({
        id: skill.id,
        title: skill.title,
        description: skill.description,
      })),
    };
  });
}

export function formatSkillUsageInspection(rows: AgentSkillUsageRow[]): string {
  const tableRows = rows.map((row) => [
    row.stageId,
    row.agentName,
    row.skills.length ? row.skills.map((skill) => `\`${skill.id}\``).join(", ") : "-",
    row.skills.length ? row.skills.map((skill) => skill.title).join("; ") : "-",
  ]);

  return [
    "# Agent Skill Usage",
    "",
    "| Stage | Agent | Skills | Skill Titles |",
    "|---|---|---|---|",
    ...tableRows.map((cells) => `| ${cells.map(formatTableCell).join(" | ")} |`),
  ].join("\n");
}

function formatTableCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}
