import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const runDirArg = process.argv[2] || "research/projects/a3-home-services-bank-apps-deep-research/2026-06-26";
const runDir = resolve(process.cwd(), runDirArg);
const outputPath = resolve(process.cwd(), "outputs/temp/notion-export-regression.md");
const parentPageId = "3696473174e58006af5fd367ef89d978";

if (!existsSync(runDir)) {
  console.log(`Skipping Notion export regression: run directory not found: ${runDir}`);
  process.exit(0);
}

mkdirSync(dirname(outputPath), { recursive: true });

execFileSync(process.execPath, [
  "tooling/scripts/generate-notion-research-export.mjs",
  runDir,
  outputPath,
], { cwd: process.cwd(), stdio: "inherit" });

const markdown = readFileSync(outputPath, "utf8");
assertIncludes(markdown, "## CJM и сценарии", "generated export must promote CJM to a top-level Notion section");
assertIncludes(markdown, "<!-- notion-section: cjm -->", "generated export must include a raw CJM marker");
assertIncludes(markdown, "## ICE/RICE бэклог", "generated export must promote ICE/RICE backlog to a top-level Notion section");
assertIncludes(markdown, "<!-- notion-section: scoring -->", "generated export must include a raw scoring marker");
assertNotIncludes(markdown, "<!-- notion-section: <!--", "generated export must not double-wrap notion-section markers");
assertIncludes(markdown, "| Персона |", "generated export must localize persona table headers");
assertIncludes(markdown, "| Приоритет | Инициатива | Сценарий |", "generated export must localize opportunity table headers");
assertIncludes(markdown, "| Вопрос | Зачем спрашивать | Какое решение проверяет |", "generated export must localize interview-guide table headers");

const dryRunOutput = execFileSync(process.execPath, [
  "tooling/scripts/publish-notion-research-hub.mjs",
  parentPageId,
  outputPath,
  "Notion export regression",
  "--dry-run",
], { cwd: process.cwd(), encoding: "utf8" });

const dryRun = JSON.parse(dryRunOutput);
assertEqual(dryRun.publication_allowed, true, "publisher dry-run must allow generated export");
assertEqual(dryRun.publication_shape_gate?.pass, true, "generated export must pass publication shape gate");
assertEqual(dryRun.publication_completeness_gate?.pass, true, "generated export must pass publication completeness gate");
assertEqual(dryRun.publication_editor_gate?.pass, true, "generated export must pass publication editor gate");
assertEqual(dryRun.notion_data_shape_plan?.status, "pass", "generated export must produce a clean Notion data shape plan");

if (dryRun.child_page_count < 6 || dryRun.child_page_count > 12) {
  throw new Error(`expected 6-12 child pages, got ${dryRun.child_page_count}`);
}

console.log(JSON.stringify({
  status: "pass",
  output: outputPath,
  child_page_count: dryRun.child_page_count,
  estimated_total_blocks: dryRun.estimated_total_blocks,
}, null, 2));

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(`${message}: missing ${needle}`);
  }
}

function assertNotIncludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(`${message}: found ${needle}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}
