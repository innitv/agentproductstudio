/**
 * Отчёт о фактическом применении навыков.
 *
 * 🔴 Повод (аудит 2026-09-04). Существующие проверки отвечают на вопрос
 * «объявлен ли навык у стадии»: `test-skill-usage` сверяет привязку в конфиге,
 * `test-skill-metadata` — формат, `findOrphanSkills` — что адрес подключения
 * есть хотя бы один. Ни одна не отвечает на вопрос «его хоть раз открывали».
 * Из-за этого навык, который никому не нужен, живёт годами и стоит контекста
 * на каждом вызове стадии: тела навыков из `skills:` инжектируются субагенту
 * целиком (замер 2026-07-29).
 *
 * Это ОТЧЁТ, а не гейт, и намеренно. Требовать применения нельзя: навык может
 * быть неприменим к конкретной задаче — `figma-handoff` не нужен, когда работы
 * в Figma нет. Гейт в такой позиции заставлял бы отчитываться о применении
 * ради зелёного статуса, то есть врать. Отчёт даёт факт, решение принимает
 * человек.
 *
 * Как считается: стадия называет применённые навыки строкой `skills_used` в
 * `handoff-bundle.md` (норма — skill `run-ledger`). Отчёт читает эти записи.
 *
 * 🔴 Прогон БЕЗ такой записи в знаменатель не идёт. Иначе получился бы ложный
 * ноль: первая версия этого отчёта показала «0 упоминаний» у `run-ledger` и
 * `rule-placement`, которые применяются постоянно, — просто потому, что
 * применение тогда нигде не записывалось. Отчёт, не отличающий «не применялся»
 * от «нечем измерить», хуже отсутствия отчёта: он выглядит как факт.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

import { parseSkillInstructionDocument } from "./skill-metadata";

/** Вендорские навыки идут с поставщиком и к стадиям не привязаны. */
const VENDOR_SKILLS = new Set(["migrate-radix-to-base", "shadcn"]);

/** Файлы прогона, куда стадия пишет о своей работе. */
const TRACE_FILES = [
  "stage-gate-ledger.md",
  "handoff-bundle.md",
  "handoff-bundle-full.md",
  "run-plan.md",
  "release-notes.md",
];

/** Маркер записи: стадия перечислила применённые навыки. */
const USAGE_MARKER = /skills_used/i;

/** Перевод строки для собираемого отчёта. */
const NL = String.fromCharCode(10);

export interface SkillUsage {
  id: string;
  stages: string[];
  runs: string[];
  lastSeen: string | null;
}

export interface UsageReport {
  usage: SkillUsage[];
  /** Прогоны, где стадия записала применённые навыки, — только они и считаются. */
  measurable: number;
  /** Всего прогонов на диске, включая те, где записи нет. */
  total: number;
}

function listRunDirectories(root: string): string[] {
  const runs: string[] = [];
  for (const base of [join(root, "outputs"), join(root, "research", "projects")]) {
    if (!existsSync(base)) continue;
    for (const slug of readdirSync(base, { withFileTypes: true })) {
      if (!slug.isDirectory() || slug.name === "temp" || slug.name === "archive") continue;
      const slugDir = join(base, slug.name);
      for (const date of readdirSync(slugDir, { withFileTypes: true })) {
        if (date.isDirectory()) runs.push(join(slugDir, date.name));
      }
    }
  }
  return runs;
}

function readTrace(runDir: string): string {
  const parts: string[] = [];
  for (const name of TRACE_FILES) {
    const file = join(runDir, name);
    if (existsSync(file) && statSync(file).isFile()) parts.push(readFileSync(file, "utf8"));
  }
  // Отчёты стадий называются по-разному в разных профилях — берём все подходящие
  for (const entry of existsSync(runDir) ? readdirSync(runDir) : []) {
    if (entry.endsWith("-result.md") || entry.endsWith("-report.md")) {
      parts.push(readFileSync(join(runDir, entry), "utf8"));
    }
  }
  return parts.join("|");
}

function listSkills(root: string): { id: string; stages: string[] }[] {
  const dir = join(root, ".claude", "skills");
  if (!existsSync(dir)) return [];
  const skills: { id: string; stages: string[] }[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || VENDOR_SKILLS.has(entry.name)) continue;
    const file = join(dir, entry.name, "SKILL.md");
    if (!existsSync(file)) continue;
    const doc = parseSkillInstructionDocument(readFileSync(file, "utf8"));
    skills.push({ id: entry.name, stages: doc.metadata?.owner_stage_ids ?? [] });
  }
  return skills;
}

export function collectSkillUsage(root = process.cwd()): UsageReport {
  const skills = listSkills(root);
  const all = listRunDirectories(root).map((dir) => ({ dir, text: readTrace(dir) }));
  const traces = all.filter((item) => USAGE_MARKER.test(item.text));

  const usage = skills.map((skill) => {
    const seen = traces.filter((item) => item.text.includes(skill.id));
    const dates = seen.map((item) => item.dir.split(/[\\/]/).pop() ?? "").sort();
    return {
      id: skill.id,
      stages: skill.stages,
      runs: seen.map((item) => item.dir.replace(/\\/g, "/")),
      lastSeen: dates.length ? dates[dates.length - 1] : null,
    };
  });

  return { usage, measurable: traces.length, total: all.length };
}

export function formatSkillUsage(report: UsageReport): string {
  const { usage, measurable, total } = report;
  const lines: string[] = ["# Применение навыков", ""];

  if (measurable === 0) {
    lines.push(`Измерять нечем: из ${total} прогонов ни один не записал применённые навыки.`);
    lines.push("");
    lines.push(
      "Стадия называет их строкой `skills_used` в `handoff-bundle.md` — норма в skill `run-ledger`. Пока записи нет, отсутствие упоминаний ничего не значит, и список «неиспользуемых» здесь не печатается намеренно.",
    );
    return lines.join(NL);
  }

  lines.push(`Прогонов с записью: ${measurable} из ${total}. Навыков: ${usage.length}.`);
  lines.push("");
  lines.push("| Навык | Стадии | Прогонов с упоминанием | Последний |");
  lines.push("|---|---|---:|---|");
  const sorted = [...usage].sort((a, b) => a.runs.length - b.runs.length || a.id.localeCompare(b.id));
  for (const item of sorted) {
    lines.push(`| \`${item.id}\` | ${item.stages.join(", ") || "—"} | ${item.runs.length} | ${item.lastSeen ?? "—"} |`);
  }

  const unused = usage.filter((item) => item.runs.length === 0);
  lines.push("");
  if (unused.length === 0) {
    lines.push("Навыков без единого упоминания нет.");
  } else {
    lines.push(`## Ни разу не упомянуты (${unused.length})`);
    lines.push("");
    lines.push(
      "Это не приговор: навык мог быть неприменим ко всем просмотренным прогонам, а сами прогоны — не попасть в каталог, `outputs/` не под git. Повод посмотреть глазами, а не удалять автоматически.",
    );
    lines.push("");
    for (const item of unused) {
      lines.push(`- \`${item.id}\` — стадии: ${item.stages.join(", ") || "не привязан"}`);
    }
  }
  return lines.join(NL);
}

// Точное имя, а не суффикс: иначе запуск теста с похожим именем печатал бы отчёт
if (process.argv[1] && basename(process.argv[1]) === "skill-usage-report.ts") {
  process.stdout.write(formatSkillUsage(collectSkillUsage(process.cwd())) + NL);
}
