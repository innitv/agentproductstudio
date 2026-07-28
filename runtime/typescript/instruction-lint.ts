/**
 * Линтер инструкционных текстов: агентов, контрактов, навыков, команд и workflow.
 *
 * Зачем отдельно от `tooling/scripts/audit-docs.mjs`. Тот проверяет ФОРМУ ссылки: путь в
 * backticks существует, markdown-ссылка резолвится, `yarn`-команда есть в package.json.
 * Он по построению слеп к СУЩНОСТЯМ: слаг дизайн-системы, id стадии, id навыка живут в
 * реестрах, а не в файловой системе, и упоминание удалённой сущности выглядит для него
 * обычным текстом. Так `selected_design_system_slug=a3-design-system` пережил удаление
 * слага из реестра и фиксировался в аудите дважды
 * (`docs/architecture/studio-audit-2026-07-28.md` §2, P0-…, находка по `figma-token-extractor`).
 *
 * Образец — `tools/validate-file-refs.js` у BMAD-METHOD: линтер ссылок в CI, который
 * падает на битой ссылке и на утечке абсолютного пути.
 *
 *
 * Область: только нормативные инструкции. `docs/**` намеренно НЕ сканируется — датированные
 * снимки (аудиты, ресёрчи) обязаны цитировать формулировки, которых уже нет.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  artifactFiles,
  getRequiredArtifactsForStage,
  getWorkflowStagesForProfile,
  workflowStages,
} from "./workflow-stages";

export interface LintFinding {
  file: string;
  line: number;
  rule: string;
  message: string;
}

/** Инструкционные поверхности: то, что читает агент как норму прямо сейчас. */
const instructionRoots = [
  ".claude/agents",
  ".claude/commands",
  ".claude/skills",
  "agent-pack/agent-contracts",
  ".claude/skills",
  "agent-pack/templates",
  "agent-pack/workflows",
  "agent-pack/guardrails",
  "agent-pack/quality",
];

const instructionFiles = ["CLAUDE.md", "AGENTS.md"];

/**
 * Строка или файл с маркером пропускается. Тот же механизм, что у `audit-docs.mjs`:
 * прозе вида «раньше здесь было X» нужен легальный способ упомянуть исчезнувшее.
 */
const ignoreMarker = "instruction-lint-ignore";

/** Абсолютные пути в инструкции: у другого человека такой машины нет (правило BMAD). */
const absolutePathPatterns: readonly { pattern: RegExp; what: string }[] = [
  { pattern: /(?:^|[\s`("'])[A-Za-z]:[\\/](?:Users|Project|Program Files|home)[\\/]/, what: "Windows-путь" },
  { pattern: /(?:^|[\s`("'])\/(?:Users|home)\/[A-Za-z0-9._-]+\//, what: "POSIX-путь пользователя" },
];

export function lintInstructionReferences(root = process.cwd()): LintFinding[] {
  const findings: LintFinding[] = [];
  const knownStageIds = new Set(workflowStages.map((stage) => stage.id));
  const knownArtifactFiles = new Set(Object.values(artifactFiles));
  const knownDesignSystemSlugs = loadDesignSystemSlugs(root);
  const knownSkillIds = loadSkillIds(root);
  const knownProducedNames = loadProducedFileNames(root);

  for (const file of collectInstructionFiles(root)) {
    const content = readFileSync(join(root, file), "utf8");
    if (content.includes(`${ignoreMarker}-file`)) continue;

    content.split(/\r?\n/).forEach((line, index) => {
      if (line.includes(ignoreMarker)) return;
      const lineNumber = index + 1;
      const report = (rule: string, message: string) => findings.push({ file, line: lineNumber, rule, message });

      // 1. Слаг дизайн-системы: реестр `design/figma/registry.json` — единственный источник.
      for (const match of line.matchAll(/design[_\s]system[_\s]slug\s*[=:]\s*`?([a-z0-9][a-z0-9-]{2,})`?/gi)) {
        const slug = match[1];
        if (slug.startsWith("<") || slug === "slug") continue;
        if (!knownDesignSystemSlugs.has(slug)) {
          report(
            "design-system-slug",
            `дизайн-система '${slug}' отсутствует в design/figma/registry.json. ` +
              "Инструкция посылает агента к системе, которой в реестре нет.",
          );
        }
      }

      for (const match of line.matchAll(/`design\/figma\/([a-z0-9][a-z0-9-]{2,})\//g)) {
        const slug = match[1];
        if (!knownDesignSystemSlugs.has(slug)) {
          report(
            "design-system-slug",
            `путь design/figma/${slug}/ ведёт к дизайн-системе вне реестра design/figma/registry.json.`,
          );
        }
      }

      // 2. Идентификатор стадии: `NN-name` обязан существовать в манифесте.
      for (const match of line.matchAll(/`(\d{2}-[a-z][a-z-]+)`/g)) {
        const stageId = match[1];
        if (!knownStageIds.has(stageId)) {
          report(
            "stage-id",
            `стадии '${stageId}' нет в workflow.manifest.ts. Ссылка на несуществующую стадию ` +
              "переживает переименование маршрута молча.",
          );
        }
      }

      // 3. Артефакт запуска: имя, которое не производит ни манифест, ни код, ни шаблон.
      // Проверка идёт по ПРОИЗВОДИТЕЛЮ, а не по суффиксу: в студии есть законные файлы
      // доказательств (`visual-diff-result.json` и т.п.), которых нет в `artifactFiles`,
      // но которые пишет runtime. Ссылкой в никуда является только имя, о котором не знает
      // ни один производитель.
      // Разбор прошлого — не инструкция: «прецедент — X», «X заархивирован», «раньше был X»
      // законно называют то, чего уже нет, и именно так фиксируется урок.
      const isRetrospective = /прецедент|заархивирован|удал[её]н|раньше|ранее|протух|устарел|историческ/i.test(line);

      // Внутри одной пары backticks может стоять несколько имён через `|` — запись вида
      // `foundation.md|token-map.md` («или так, или так»). Разбираем содержимое по разделителю:
      // иначе мёртвое имя во второй половине прячется от проверки целиком, что и случилось
      // с `token-map.md` — он пережил собственное удаление в шести местах правил.
      const artifactName = /^[a-z][a-z0-9-]*(?:-result|-report|-bundle|-brief|-deck|-ir|-qa|-map|-plan)\.(?:md|json)$/;

      for (const inline of line.matchAll(/`([^`]+)`/g)) {
        if (isRetrospective) continue;
        for (const part of inline[1].split("|")) {
          const fileName = part.trim();
          if (!artifactName.test(fileName)) continue;
          if (!knownArtifactFiles.has(fileName) && !knownProducedNames.has(fileName)) {
            report(
              "artifact-file",
              `'${fileName}' выглядит как артефакт запуска, но его не производит ни манифест ` +
                "(artifactFiles), ни runtime, ни шаблоны. Либо артефакт удалён, либо имя разъехалось.",
            );
          }
        }
      }

      // 4. Навык, названный по имени: должен существовать в `.claude/skills` или плагине.
      for (const match of line.matchAll(/\bskill[а-яё]*\s+`([a-z][a-z0-9-]+)`/gi)) {
        const skillId = match[1];
        if (!knownSkillIds.has(skillId)) {
          report(
            "skill-id",
            `навыка '${skillId}' нет ни в .claude/skills, ни в plugins/*/skills. ` +
              "Инструкция вызывает навык, которого не существует.",
          );
        }
      }

      // 5. Утечка абсолютного пути (правило BMAD `validate-file-refs`).
      for (const { pattern, what } of absolutePathPatterns) {
        if (pattern.test(line)) {
          report(
            "absolute-path",
            `${what} в инструкции: у другого разработчика такого пути нет. Используй путь от корня репозитория.`,
          );
        }
      }
    });
  }

  return findings;
}

/**
 * Матрица этапов в `stage-handoff-contract.md` пересказывает граф прозой: стадия, владелец,
 * входы, выходы. Проза рядом с машинным источником живёт ровно до первой правки манифеста —
 * 2026-07-28 из неё вручную вынимали строки удалённых стадий, и заметить это можно было
 * только глазами.
 *
 * Сверяется то, что имеет однозначный машинный эквивалент: набор стадий, владелец каждой и
 * присутствие каждого обязательного артефакта в колонке «Создает». Колонка «Получает» не
 * сверяется: там законно живут не-артефактные входы (`goal`, `constraints`) и обобщения
 * вроде «полный research pack».
 */
export function lintStageHandoffTable(root = process.cwd()): LintFinding[] {
  const findings: LintFinding[] = [];
  const file = "agent-pack/workflows/stage-handoff-contract.md";
  const absolute = join(root, file);
  if (!existsSync(absolute)) {
    return findings;
  }

  const content = readFileSync(absolute, "utf8");
  if (content.includes(`${ignoreMarker}-file`)) {
    return findings;
  }

  // Максимальный набор стадий — reference: он включает standard плюс визуальную сверку.
  const stages = getWorkflowStagesForProfile("reference");
  const documented = new Map<string, { line: number; owner: string; creates: string }>();
  const stageIdPattern = /^\d{2}-[a-z-]+$/;

  content.split(NEWLINE).forEach((rawLine, index) => {
    // | Этап | Владелец | Получает | Создает | Кто получает дальше |
    const cells = rawLine.split("|").map((cell) => cell.trim());
    if (cells.length < 6) return;
    const stageId = (cells[1] ?? "").replaceAll("`", "");
    if (!stageIdPattern.test(stageId)) return;
    documented.set(stageId, {
      line: index + 1,
      owner: (cells[2] ?? "").replaceAll("`", ""),
      creates: cells[4] ?? "",
    });
  });

  if (documented.size === 0) {
    findings.push({
      file,
      line: 1,
      rule: "stage-handoff-table",
      message:
        "матрица этапов не распозналась: ни одной строки со стадией. Проверь формат таблицы — " +
        "без него сверка с манифестом молча превращается в ничто.",
    });
    return findings;
  }

  for (const stage of stages) {
    const row = documented.get(stage.id);
    if (!row) {
      findings.push({
        file,
        line: 1,
        rule: "stage-handoff-table",
        message: `стадии '${stage.id}' нет в матрице этапов, хотя она есть в манифесте.`,
      });
      continue;
    }

    if (row.owner !== stage.owner) {
      findings.push({
        file,
        line: row.line,
        rule: "stage-handoff-table",
        message: `владелец '${stage.id}': в матрице '${row.owner}', в манифесте '${stage.owner}'.`,
      });
    }

    const profile = stage.profile === "reference" ? "reference" : "standard";
    for (const artifact of getRequiredArtifactsForStage(stage, profile)) {
      const fileName = artifactFiles[artifact];
      // Ledger стадия обновляет, а не создаёт: требовать его в колонке «Создает» у каждой
      // строки значило бы заставить дублировать шум.
      if (!fileName || ledgerArtifacts.has(artifact)) continue;
      if (!row.creates.includes(fileName)) {
        findings.push({
          file,
          line: row.line,
          rule: "stage-handoff-table",
          message: `'${stage.id}' обязан создать '${fileName}' (манифест), но матрица его не называет.`,
        });
      }
    }
  }

  const knownStageIds = new Set(stages.map((stage) => stage.id));
  for (const [stageId, row] of documented) {
    if (!knownStageIds.has(stageId)) {
      findings.push({
        file,
        line: row.line,
        rule: "stage-handoff-table",
        message: `матрица описывает стадию '${stageId}', которой нет в манифесте — строка протухла.`,
      });
    }
  }

  return findings;
}

const ledgerArtifacts = new Set(["run_plan", "handoff_bundle", "stage_gate_ledger"]);

const NEWLINE = /\r?\n/;

/** Проверка текстов инструкций — для `validate:config`. */
export function validateInstructionTexts(root = process.cwd()): string[] {
  return [...lintInstructionReferences(root), ...lintStageHandoffTable(root)].map(
    (finding) => `${finding.file}:${finding.line}: [${finding.rule}] ${finding.message}`,
  );
}

function splitSentences(line: string): string[] {
  return line
    .split(/(?<=[.!?;:])\s+(?=[«"`*_A-ZА-ЯЁ])|(?<=\.)\s+/)
    .filter((part) => part.trim().length > 0);
}

export function collectInstructionFiles(root: string): string[] {
  const files: string[] = [];

  for (const directory of instructionRoots) {
    const absolute = join(root, directory);
    if (existsSync(absolute)) walk(absolute, root, files);
  }

  for (const file of instructionFiles) {
    if (existsSync(join(root, file))) files.push(file);
  }

  return files;
}

function walk(directory: string, root: string, files: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, root, files);
      continue;
    }

    if (entry.name.endsWith(".md")) {
      files.push(relative(root, absolute).replaceAll("\\", "/"));
    }
  }
}

function loadDesignSystemSlugs(root: string): Set<string> {
  const slugs = new Set<string>();
  const registryPath = join(root, "design/figma/registry.json");
  if (existsSync(registryPath)) {
    const registry = JSON.parse(readFileSync(registryPath, "utf8")) as { systems?: Array<{ slug?: string }> };
    for (const system of registry.systems ?? []) {
      if (system.slug) slugs.add(system.slug);
    }
  }

  // Каталог без записи в реестре тоже считается известным: реестр ведёт ingest, а линтер
  // не должен требовать регистрации раньше, чем это делает сам процесс.
  const figmaDir = join(root, "design/figma");
  if (existsSync(figmaDir)) {
    for (const entry of readdirSync(figmaDir, { withFileTypes: true })) {
      if (entry.isDirectory()) slugs.add(entry.name);
    }
  }

  return slugs;
}

/**
 * Имена файлов, которые кто-то реально производит: строковые литералы в runtime и tooling
 * плюс имена шаблонов на диске. Это ответ на вопрос «есть ли у имени производитель» —
 * тот же вопрос, что задаёт проверка графа, только на уровне текста инструкции.
 */
function loadProducedFileNames(root: string): Set<string> {
  const names = new Set<string>();
  const sources = [
    { dir: join(root, "runtime/typescript"), extension: ".ts" },
    { dir: join(root, "tooling/scripts"), extension: ".mjs" },
  ];

  for (const { dir, extension } of sources) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
      // Тесты не производят артефакты, они их ИМИТИРУЮТ. Их фикстуры содержат имена
      // удалённых файлов намеренно — учитывать эти литералы значило бы, что тест на дефект
      // сам же и отключает проверку этого дефекта.
      if (entry.name.startsWith("test-")) continue;
      const content = readFileSync(join(dir, entry.name), "utf8");
      for (const match of content.matchAll(/["'`]([a-z][a-z0-9-]*\.(?:md|json))["'`]/g)) {
        names.add(match[1]);
      }
    }
  }

  const templatesDir = join(root, "agent-pack/templates");
  if (existsSync(templatesDir)) {
    for (const entry of readdirSync(templatesDir, { withFileTypes: true })) {
      if (entry.isFile()) names.add(entry.name);
    }
  }

  return names;
}

function loadSkillIds(root: string): Set<string> {
  const ids = new Set<string>();
  const skillsDir = join(root, ".claude/skills");
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) ids.add(entry.name);
    }
  }

  const pluginsDir = join(root, "plugins");
  if (existsSync(pluginsDir)) {
    for (const plugin of readdirSync(pluginsDir, { withFileTypes: true })) {
      if (!plugin.isDirectory()) continue;
      const pluginSkills = join(pluginsDir, plugin.name, "skills");
      if (!existsSync(pluginSkills) || !statSync(pluginSkills).isDirectory()) continue;
      for (const entry of readdirSync(pluginSkills, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          ids.add(entry.name);
          ids.add(`${plugin.name}:${entry.name}`);
        }
      }
    }
  }

  return ids;
}
