import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
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

  errors.push(...findOrphanSkills(root));

  return errors;
}

/**
 * Навык-сирота: лежит на диске, но не подключён ни к одному агенту и не назван в индексе.
 *
 * 🔴 Повод: навык `presentation-craft` (2026-08-11) был создан и прошёл все проверки, будучи
 * подключённым **ни к кому** — ни один тест этого не заметил. Такой навык существует только
 * для того, кто его написал: субагент получает тела навыков из своего списка `skills:`, и
 * если навыка там нет, исполнитель о нём не узнает. Класс ошибки тот же, что ловит skill
 * `rule-placement`: правило записано в один файл и потому не действует.
 *
 * Два законных адреса подключения, и хотя бы один обязан быть:
 *  - `skills:` в обёртке `.claude/agents/<agent>.md` — стадийный навык;
 *  - упоминание в `CLAUDE.md` — кросс-стадийный, который вызывает оркестратор.
 */
export function findOrphanSkills(root = process.cwd()): string[] {
  const agentsDir = join(root, ".claude", "agents");
  const indexFile = join(root, "CLAUDE.md");
  if (!existsSync(agentsDir)) return [];

  const wrappers = readdirSync(agentsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => readFileSync(join(agentsDir, entry.name), "utf8"))
    .join("\n");
  const index = existsSync(indexFile) ? readFileSync(indexFile, "utf8") : "";

  const orphans: string[] = [];
  for (const file of listSkillFiles(root)) {
    const id = file.split(/[\\/]/).at(-2);
    if (!id) continue;
    const inWrapper = new RegExp(`(^|[\\s,\\[\`])${id}([\\s,\\]\`]|$)`, "m").test(wrappers);
    const inIndex = index.includes(`\`${id}\``);
    if (!inWrapper && !inIndex) {
      orphans.push(
        `.claude/skills/${id}/SKILL.md: навык не подключён ни к одному агенту (skills: в обёртке) ` +
          `и не назван в CLAUDE.md — исполнитель о нём не узнает.`,
      );
    }
  }
  return orphans;
}

/**
 * Извлекает `description` из frontmatter построчно, а не полным YAML-парсером: обёртки
 * намеренно держат незакавыченные значения с `: ` внутри, на которых строгий парсер падает.
 * Снимает окружающие кавычки и схлопывает переносы, чтобы сравнивать текст, а не раскладку.
 */
export function extractFrontmatterDescription(frontmatter: string): string | undefined {
  // Без флага `m`: `$` обязан означать конец текста, иначе значение обрезается по первой
  // строке и многострочное описание молча теряет хвост.
  const raw = frontmatter.match(/(?:^|\n)description:\s*([\s\S]*?)(?=\n[A-Za-z_][A-Za-z0-9_]*:|\n---|$)/)?.[1];
  if (raw === undefined) return undefined;

  const collapsed = raw.trim().replace(/\s+/g, " ");
  if (collapsed.length >= 2 && collapsed.startsWith('"') && collapsed.endsWith('"')) {
    try {
      return String(JSON.parse(collapsed)).trim();
    } catch {
      return collapsed.slice(1, -1).trim();
    }
  }

  if (collapsed.length >= 2 && collapsed.startsWith("'") && collapsed.endsWith("'")) {
    return collapsed.slice(1, -1).replaceAll("''", "'").trim();
  }

  return collapsed;
}

/**
 * Зеркало навыков упразднено 2026-07-28: каталог `agent-pack/skills` удалён, единственный
 * источник — `.claude/skills/<id>/SKILL.md` (полная процедура плюс метаданные в
 * frontmatter). Проверять «обёртка совпадает с источником» больше не нужно — совпадать
 * нечему. Обоснование: `docs/architecture/studio-scope-audit-2026-07-28.md` §2, P0-4.
 */
export function validateSkillWrappers(): string[] {
  return [];
}

export interface GlobalSkillConflict {
  id: string;
  globalPath: string;
}

/**
 * Предупреждение о конфликте имён с глобальными навыками `~/.claude/skills/<id>`.
 *
 * Глобальная копия выигрывает коллизию имён: в листинге сессии стоит ЕЁ описание, и
 * проектная версия не доезжает никогда. Именно так проектный `landing-builder` («по
 * умолчанию из компонентов shadcn/ui») оказался перекрыт глобальным («bespoke-вёрстка с
 * нуля») — `docs/architecture/studio-audit-2026-07-28.md` P0-7.
 *
 * Строго предупреждение, никогда не ошибка, и никогда не обязательное условие прогона:
 * домашний каталог принадлежит конкретному человеку, у другого разработчика и в CI его
 * нет. Симлинк (как `figma-ds`, `subsystem-audit`) конфликтом НЕ считается — он указывает
 * на этот же репозиторий, то есть копии не существует.
 */
export function detectGlobalSkillConflicts(root = process.cwd(), homeDir = homedir()): GlobalSkillConflict[] {
  const globalSkillsDir = join(homeDir, ".claude", "skills");
  if (!existsSync(globalSkillsDir)) return [];

  const projectSkillIds = new Set(
    listSkillFiles(root)
      .map((file) => file.split(/[\\/]/).at(-2))
      .filter((id): id is string => Boolean(id)),
  );

  const conflicts: GlobalSkillConflict[] = [];
  for (const entry of readdirSync(globalSkillsDir, { withFileTypes: true })) {
    if (!projectSkillIds.has(entry.name)) continue;
    if (entry.isSymbolicLink() || !entry.isDirectory()) continue;
    conflicts.push({ id: entry.name, globalPath: join(globalSkillsDir, entry.name) });
  }

  return conflicts;
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

/**
 * Навыки, поставленные вендором, а не написанные в студии.
 *
 * Их `SKILL.md` приходит в чужом формате — без нашего frontmatter (`id`,
 * `owner_stage_ids`, `validation_commands` и прочего), потому что у автора
 * пакета своя схема. Требовать от них наши поля бессмысленно вдвойне: файл
 * перезапишется при следующем обновлении пакета, а дописанные поля исчезнут.
 *
 * Правило владения: вендорские навыки обновляются командой установки и НЕ
 * правятся руками; проектные правила про ту же библиотеку живут в своём навыке
 * (для shadcn/ui это `shadcn-library`). Поэтому здесь именно список изъятий, а
 * не «пропускать всё без frontmatter»: навык студии без метаданных обязан
 * оставаться ошибкой.
 *
 * Заведено 2026-08-03, когда `skills add shadcn/ui` принёс два таких пакета.
 */
const vendorSkillDirectories = new Set(["migrate-radix-to-base", "shadcn"]);

function listSkillFiles(root: string): string[] {
  const skillsDir = join(root, ".claude", "skills");
  if (!existsSync(skillsDir)) {
    return [];
  }

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .filter((item) => !vendorSkillDirectories.has(item.name))
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
