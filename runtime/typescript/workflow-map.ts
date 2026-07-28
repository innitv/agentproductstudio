/**
 * Карта студии: стадии, агенты, навыки, хуки и плагины — одним выводом.
 *
 * Зачем. Знание о том, как связаны сущности, размазано по четырём машинным источникам:
 * граф стадий живёт в `workflow.manifest.ts`, соответствие «агент -> контракт» в
 * `agents.registry.ts`, привязка навыков — во frontmatter контрактов и самих навыков,
 * а хуки — в `.claude/settings.json`. Собрать картину можно было только руками, каждый раз
 * заново (`docs/architecture/studio-scope-audit-2026-07-28.md` — разведка заняла заметную
 * часть аудита).
 *
 * Почему команда, а не документ. Рукописная карта — второй источник правды: она разъезжается
 * с манифестом молча, и именно такие копии студия сегодня удаляла. Здесь нет ни одного
 * собственного факта: всё читается из существующих файлов на каждый запуск. Ломается карта
 * только вместе с источником, а не отдельно от него.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { agentInstructionFiles, agentNames } from "./agents.registry";
import { loadAgentMetadata } from "./agent-metadata";
import { loadSkillMetadataRecords } from "./skill-metadata";
import {
  artifactFiles,
  getRequiredArtifactsForStage,
  getWorkflowStagesForProfile,
  workflowProfiles,
  workflowScales,
  type WorkflowProfile,
} from "./workflow-stages";

type AgentRegistryKey = keyof typeof agentInstructionFiles;

export interface StageMapRow {
  id: string;
  title: string;
  owner: string;
  artifacts: readonly string[];
  scales: readonly string[];
  profileOnly?: WorkflowProfile;
}

export interface AgentMapRow {
  name: string;
  contract: string;
  wrapper: string;
  wrapperExists: boolean;
  stages: readonly string[];
  skills: readonly string[];
}

export interface HookMapRow {
  event: string;
  matcher: string;
  script: string;
}

export interface PluginMapRow {
  name: string;
  skills: readonly string[];
}

export interface WorkflowMap {
  stages: StageMapRow[];
  referenceOnlyStages: StageMapRow[];
  agents: AgentMapRow[];
  orphanSkills: string[];
  hooks: HookMapRow[];
  plugins: PluginMapRow[];
}

export function buildWorkflowMap(root = process.cwd()): WorkflowMap {
  const standard = getWorkflowStagesForProfile("standard");
  const standardIds = new Set(standard.map((stage) => stage.id));
  const reference = getWorkflowStagesForProfile("reference").filter((stage) => !standardIds.has(stage.id));

  const toRow = (stage: (typeof standard)[number], profile: WorkflowProfile): StageMapRow => ({
    id: stage.id,
    title: stage.title,
    owner: stage.owner,
    artifacts: getRequiredArtifactsForStage(stage, profile).map((artifact) => artifactFiles[artifact] ?? artifact),
    scales: stage.scales ?? workflowScales,
    profileOnly: stage.profile,
  });

  const agents: AgentMapRow[] = [];
  const usedSkills = new Set<string>();

  for (const [key, contract] of Object.entries(agentInstructionFiles) as Array<[AgentRegistryKey, string]>) {
    const metadata = loadAgentMetadata(join(root, contract));
    const name = agentNames[key];
    const wrapper = `.claude/agents/${name}.md`;
    for (const skill of metadata?.skills ?? []) {
      usedSkills.add(skill);
    }

    agents.push({
      name,
      contract,
      wrapper,
      wrapperExists: existsSync(join(root, wrapper)),
      stages: metadata?.owner_stage_ids ?? [],
      skills: metadata?.skills ?? [],
    });
  }

  const allSkills = loadSkillMetadataRecords(root).map((record) => record.metadata.id);

  return {
    stages: standard.map((stage) => toRow(stage, "standard")),
    referenceOnlyStages: reference.map((stage) => toRow(stage, "reference")),
    agents,
    // Навык без агента — не дефект: кросс-стадийные навыки (approval-gate, selective-commit,
    // outputs-cleanup) вызываются оркестратором напрямую. Список нужен, чтобы отличать их от
    // забытых привязок, а не чтобы падать.
    orphanSkills: allSkills.filter((id) => !usedSkills.has(id)).sort(),
    hooks: readHooks(root),
    plugins: readPlugins(root),
  };
}

function readHooks(root: string): HookMapRow[] {
  const settingsPath = join(root, ".claude", "settings.json");
  if (!existsSync(settingsPath)) {
    return [];
  }

  const parsed = JSON.parse(readFileSync(settingsPath, "utf8")) as {
    hooks?: Record<string, Array<{ matcher?: string; hooks?: Array<{ command?: string }> }>>;
  };

  const rows: HookMapRow[] = [];
  for (const [event, entries] of Object.entries(parsed.hooks ?? {})) {
    for (const entry of entries) {
      for (const hook of entry.hooks ?? []) {
        rows.push({
          event,
          // `|` в matcher (`Write|Edit|MultiEdit`) рвёт markdown-таблицу вывода, поэтому
          // разделитель заменяется на точку. Значение остаётся читаемым, а таблица — целой.
          matcher: entry.matcher?.trim() ? entry.matcher.replaceAll("|", " · ") : "(любой)",
          script: (hook.command ?? "").replace(/^node\s+/, ""),
        });
      }
    }
  }

  return rows;
}

function readPlugins(root: string): PluginMapRow[] {
  const pluginsDir = join(root, "plugins");
  if (!existsSync(pluginsDir)) {
    return [];
  }

  return readdirSync(pluginsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => {
      const skillsDir = join(pluginsDir, item.name, "skills");
      const skills = existsSync(skillsDir)
        ? readdirSync(skillsDir, { withFileTypes: true })
          .filter((skill) => skill.isDirectory())
          .map((skill) => `/${item.name}:${skill.name}`)
        : [];
      return { name: item.name, skills };
    });
}

export function formatWorkflowMap(map: WorkflowMap): string {
  const lines: string[] = [];

  lines.push("# Карта студии");
  lines.push("");
  lines.push("Собрана из workflow.manifest.ts, agents.registry.ts, контрактов агентов, навыков и .claude/settings.json.");
  lines.push("");

  lines.push(`## Стадии (профиль standard, ${map.stages.length})`);
  lines.push("");
  lines.push("| Стадия | Владелец | Артефакты | Масштабы |");
  lines.push("|---|---|---|---|");
  for (const stage of map.stages) {
    lines.push(`| ${stage.id} ${stage.title} | ${stage.owner} | ${stage.artifacts.join(", ")} | ${stage.scales.join(", ")} |`);
  }

  if (map.referenceOnlyStages.length) {
    lines.push("");
    lines.push("Только профиль reference:");
    lines.push("");
    for (const stage of map.referenceOnlyStages) {
      lines.push(`- ${stage.id} ${stage.title} -> ${stage.owner} -> ${stage.artifacts.join(", ")}`);
    }
  }

  lines.push("");
  lines.push(`## Агенты (${map.agents.length})`);
  lines.push("");
  lines.push("| Агент | Стадии | Навыки | Обёртка |");
  lines.push("|---|---|---|---|");
  for (const agent of map.agents) {
    const stages = agent.stages.length ? agent.stages.join(", ") : "вне графа";
    const skills = agent.skills.length ? agent.skills.join(", ") : "—";
    lines.push(`| ${agent.name} | ${stages} | ${skills} | ${agent.wrapperExists ? "есть" : "НЕТ"} |`);
  }

  lines.push("");
  lines.push("## Навыки без агента (вызываются оркестратором напрямую)");
  lines.push("");
  lines.push(map.orphanSkills.length ? map.orphanSkills.join(", ") : "—");

  lines.push("");
  lines.push(`## Хуки (${map.hooks.length})`);
  lines.push("");
  lines.push("| Событие | Триггер | Скрипт |");
  lines.push("|---|---|---|");
  for (const hook of map.hooks) {
    lines.push(`| ${hook.event} | ${hook.matcher} | ${hook.script} |`);
  }

  if (map.plugins.length) {
    lines.push("");
    lines.push(`## Плагины (${map.plugins.length})`);
    lines.push("");
    for (const plugin of map.plugins) {
      lines.push(`- ${plugin.name}: ${plugin.skills.length ? plugin.skills.join(", ") : "без навыков"}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}
