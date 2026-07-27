/**
 * Сжимает JSON-отчёт Playwright в вердикт, пригодный для агента-приёмщика.
 *
 * Вход:  reports/visual-regression/verdict.json   (json reporter Playwright)
 * Выход: reports/visual-regression/summary.json   (плоский список историй)
 *
 * Зачем отдельный файл: сырой отчёт Playwright на 145 историй — это дерево
 * suites/specs/tests/results с вложенностью, читать его как «статус по каждой
 * story» дорого. Здесь он разворачивается в плоский массив story-id со
 * статусом и путями к `-expected` / `-actual` / `-diff`.
 *
 * Про числа: `diffPixels` берётся как абсолютное целое из сообщения об ошибке
 * (`"<N> pixels (ratio X of all image pixels) are different."`) — это точное
 * значение счётчика pixelmatch. Ratio из того же сообщения намеренно
 * игнорируется: Playwright округляет его до двух знаков, для порогов он
 * бесполезен. Сами пороги заданы декларативно в playwright.vr.config.ts.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, "reports/visual-regression");
const inputPath = path.join(reportDir, "verdict.json");
const outputPath = path.join(reportDir, "summary.json");

function readArg(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

if (!existsSync(inputPath)) {
  console.error(`[vr] Нет ${inputPath}: Playwright не дошёл до записи отчёта.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(inputPath, "utf8"));

/** `[<story-id>]` в заголовке теста — единственный стабильный ключ истории. */
function extractStoryId(title) {
  return /\[([^\]]+)\]\s*$/.exec(title)?.[1] ?? title;
}

/** Пути внутри контейнера начинаются с /work — приводим их к путям репозитория. */
function toRepoRelative(absolutePath) {
  if (!absolutePath) {
    return null;
  }

  const normalized = absolutePath.split("\\").join("/");
  return normalized.startsWith("/work/") ? normalized.slice("/work/".length) : normalized;
}

function extractDiffPixels(result) {
  const messages = [
    ...(result.errors ?? []).map((entry) => entry.message ?? ""),
    result.error?.message ?? "",
  ].join("\n");

  const match = /(\d+) pixels \(ratio/.exec(messages);
  return match ? Number(match[1]) : null;
}

const stories = [];

function walkSuite(suite) {
  for (const spec of suite.specs ?? []) {
    for (const testCase of spec.tests ?? []) {
      const result = testCase.results?.[testCase.results.length - 1] ?? {};
      const attachments = result.attachments ?? [];

      const findAttachment = (suffix) =>
        toRepoRelative(attachments.find((item) => item.name?.endsWith(suffix))?.path ?? null);

      stories.push({
        diffPixels: extractDiffPixels(result),
        durationMs: result.duration ?? null,
        project: testCase.projectName ?? null,
        snapshots: {
          actual: findAttachment("-actual.png"),
          diff: findAttachment("-diff.png"),
          expected: findAttachment("-expected.png"),
        },
        status: testCase.status ?? result.status ?? "unknown",
        storyId: extractStoryId(spec.title),
        title: spec.title,
      });
    }
  }

  for (const child of suite.suites ?? []) {
    walkSuite(child);
  }
}

for (const suite of report.suites ?? []) {
  walkSuite(suite);
}

stories.sort((left, right) => left.storyId.localeCompare(right.storyId));

const totals = stories.reduce(
  (accumulator, story) => {
    accumulator[story.status] = (accumulator[story.status] ?? 0) + 1;
    return accumulator;
  },
  { total: stories.length },
);

const failed = stories.filter((story) => story.status !== "expected" && story.status !== "skipped");

const summary = {
  baseImage: readArg("base-image"),
  durationMs: Number(readArg("duration-ms", "0")),
  failedStoryIds: failed.map((story) => story.storyId),
  generatedAt: new Date().toISOString(),
  image: readArg("image"),
  mode: readArg("mode", "test"),
  playwrightJsonReport: path.relative(repoRoot, inputPath).split(path.sep).join("/"),
  stories,
  totals,
  verdict: failed.length === 0 ? "pass" : "fail",
};

mkdirSync(reportDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(
  `[vr] Вердикт: ${summary.verdict}; истории: ${totals.total}, ` +
    `упало: ${failed.length}. Сводка: reports/visual-regression/summary.json`,
);

for (const story of failed) {
  console.log(`[vr]   FAIL ${story.storyId} — diffPixels=${story.diffPixels ?? "n/a"}`);
}
