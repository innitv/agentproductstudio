#!/usr/bin/env node
// SessionStart: краткий статус проекта и последние run-каталоги (без запуска тяжёлых команд).
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function latestRuns(base) {
  const out = [];
  const dir = path.join(root, base);
  if (!existsSync(dir)) return out;
  let slugs = [];
  try { slugs = readdirSync(dir, { withFileTypes: true }).filter((x) => x.isDirectory()); } catch { return out; }
  for (const slug of slugs) {
    if (slug.name === "temp" || slug.name === "archive" || slug.name === "products") continue;
    const sd = path.join(dir, slug.name);
    let dates = [];
    try { dates = readdirSync(sd, { withFileTypes: true }).filter((x) => x.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(x.name)).map((x) => x.name).sort(); } catch {}
    if (dates.length) out.push(`${base}${slug.name}/${dates[dates.length - 1]}`);
  }
  return out;
}

const runs = [...latestRuns("outputs/"), ...latestRuns("research/projects/")].slice(-8);

let msg =
  "[Product Agent Studio] Режим Claude Code. Правила: CLAUDE.md " +
  "(детальные gates — agent-pack/workflows/claude-operating-rules.md). " +
  "Специалисты — .claude/agents/ (через Task tool). Перед workflow: `yarn workflow:doctor`.";
if (runs.length) msg += "\nПоследние run-каталоги:\n- " + runs.join("\n- ");

process.stdout.write(msg);
process.exit(0);
