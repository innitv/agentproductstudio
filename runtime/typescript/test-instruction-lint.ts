/**
 * Регрессия линтера инструкций.
 *
 * Каждая проверка доказывается парой «внеси дефект — поймано / убери — чисто»: механизм,
 * зелёный при любом входе, хуже отсутствующего, потому что создаёт чувство защищённости.
 * Тексты дефектов взяты ДОСЛОВНО из истории репозитория (`git show 31079c7`) и из аудита
 * `docs/architecture/studio-audit-2026-07-28.md`.
 */

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { lintInstructionReferences, lintStageHandoffTable, validateInstructionTexts } from "./instruction-lint";

function withFixture(files: Record<string, string>, assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "instruction-lint-"));
  try {
    // Реестр дизайн-систем и каталог навыков нужны как источники известных сущностей.
    write(root, "design/figma/registry.json", JSON.stringify({ systems: [{ slug: "a3-finance-visitka" }] }));
    write(root, ".claude/skills/run-ledger/SKILL.md", "---\nid: run-ledger\n---\n");
    for (const [file, content] of Object.entries(files)) {
      write(root, file, content);
    }

    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function write(root: string, file: string, content: string): void {
  const absolute = join(root, file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function assertFinding(findings: Array<{ rule: string; message: string }>, rule: string, pattern: RegExp): void {
  assert.ok(
    findings.some((finding) => finding.rule === rule && pattern.test(finding.message)),
    `Ожидалась находка '${rule}' по ${pattern}, получено:\n${
      findings.map((finding) => `${finding.rule}: ${finding.message}`).join("\n") || "(пусто)"
    }`,
  );
}

// ---------------------------------------------------------------------------
// 1. Слаг дизайн-системы вне реестра — исторический дефект figma-token-extractor:57,
//    зафиксированный аудитом дважды и не закрывавшийся.
// ---------------------------------------------------------------------------

withFixture(
  {
    ".claude/skills/figma-token-extractor/SKILL.md":
      "---\nid: figma-token-extractor\n---\n" +
      "4. Сверь с выбранной системой из `design/figma/registry.json`: " +
      "`design/figma/<selected_design_system_slug>/foundation.md` или legacy `token-map.md`, если файл существует. " +
      "A3 использовать только при явно выбранном `selected_design_system_slug=a3-design-system`.\n",
  },
  (root) => {
    const findings = lintInstructionReferences(root);
    assertFinding(findings, "design-system-slug", /'a3-design-system' отсутствует в design\/figma\/registry\.json/);
    assertFinding(findings, "artifact-file", /'token-map\.md'/);
  },
);

// Тот же файл после починки: слаг из реестра, ссылки на удалённый артефакт нет.
withFixture(
  {
    ".claude/skills/figma-token-extractor/SKILL.md":
      "---\nid: figma-token-extractor\n---\n" +
      "4. Сверь с выбранной системой из `design/figma/registry.json`: " +
      "`design/figma/<selected_design_system_slug>/foundation.md`. Пример индекса — `design/figma/a3-finance-visitka/`.\n",
  },
  (root) => assert.deepEqual(lintInstructionReferences(root), []),
);

// Разбор прошлого называть исчезнувшее вправе: «прецедент — `token-map.md`».
withFixture(
  {
    "agent-pack/workflows/rules.md":
      "- Индексы состава компонентов не заводить: второй источник правды разъедется " +
      "(прецедент — `token-map.md`, описывавший 28% реальности).\n",
  },
  (root) => assert.deepEqual(lintInstructionReferences(root), []),
);

// ---------------------------------------------------------------------------
// 2. Стадия, навык, абсолютный путь
// ---------------------------------------------------------------------------

withFixture(
  {
    ".claude/agents/qa-review.md": "На стадии `13-postmortem` вызвать skill `no-such-skill`.\n",
    "agent-pack/workflows/local.md": "Каталог запуска: `C:\\Users\\mrfra\\runs\\demo`.\n",
  },
  (root) => {
    const findings = lintInstructionReferences(root);
    assertFinding(findings, "stage-id", /стадии '13-postmortem' нет в workflow\.manifest\.ts/);
    assertFinding(findings, "skill-id", /навыка 'no-such-skill' нет/);
    assertFinding(findings, "absolute-path", /Windows-путь/);
  },
);

withFixture(
  {
    ".claude/agents/qa-review.md": "На стадии `11-qa` вызвать skill `run-ledger`.\n",
  },
  (root) => assert.deepEqual(lintInstructionReferences(root), []),
);

// ---------------------------------------------------------------------------
// 3. Матрица этапов в stage-handoff-contract.md пересказывает граф прозой.
//    Реальный дефект 2026-07-28: удалили стадии `07-prototype` и `10-test-bench`, строки в
//    матрице остались, и убирать их пришлось руками. Ниже — три способа разъехаться.
// ---------------------------------------------------------------------------

const handoffHeader = "| Этап | Владелец | Получает | Создает | Кто получает дальше |\n|---|---|---|---|---|\n";

function handoffRow(stageId: string, owner: string, creates: string): string {
  return `| \`${stageId}\` | \`${owner}\` | \`goal\` | ${creates} | дальше |\n`;
}

// Полная матрица текущего графа: без неё каждая проверка утонет в «стадии нет в матрице».
function fullMatrix(overrides: Record<string, string> = {}, extraRows = ""): string {
  const rows: Array<[string, string, string]> = [
    ["00-intake", "orchestrator", "`run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md`"],
    ["01-research", "research", "`research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`"],
    ["02-prd", "prd", "`prd.md`"],
    ["03-ia", "ia", "`ia-brief.md`"],
    ["04-design", "design", "`design-brief.md`, `reference-analysis.md`"],
    ["05-copy", "copywriting", "`copy-deck.md`"],
    ["06-screens", "design-generator", "`screens.md`"],
    ["08-frontend", "frontend", "`frontend-result.md`"],
    ["09-visual-reference", "qa-review", "`visual-reference-review.md`"],
    ["11-qa", "qa-review", "`qa-report.md`"],
    ["12-release", "release", "`release-notes.md`"],
  ];

  return handoffHeader + rows
    .map(([id, owner, creates]) => handoffRow(id, overrides[`${id}:owner`] ?? owner, overrides[`${id}:creates`] ?? creates))
    .join("") + extraRows;
}

// 3.1. Протухшая строка: стадия удалена из манифеста, из матрицы — нет.
withFixture(
  {
    "agent-pack/workflows/stage-handoff-contract.md":
      fullMatrix({}, handoffRow("07-prototype", "prototype", "`prototype-report.md`")),
  },
  (root) => {
    assertFinding(lintStageHandoffTable(root), "stage-handoff-table", /'07-prototype', которой нет в манифесте/);
  },
);

// 3.2. Разъехавшийся владелец.
withFixture(
  { "agent-pack/workflows/stage-handoff-contract.md": fullMatrix({ "06-screens:owner": "design" }) },
  (root) => {
    assertFinding(lintStageHandoffTable(root), "stage-handoff-table", /владелец '06-screens'.*'design'.*'design-generator'/s);
  },
);

// 3.3. Забытый обязательный артефакт в колонке «Создает».
withFixture(
  { "agent-pack/workflows/stage-handoff-contract.md": fullMatrix({ "02-prd:creates": "нечего" }) },
  (root) => {
    assertFinding(lintStageHandoffTable(root), "stage-handoff-table", /'02-prd' обязан создать 'prd\.md'/);
  },
);

// 3.4. Сломанный формат таблицы обязан жаловаться, а не молча возвращать «всё чисто».
withFixture(
  { "agent-pack/workflows/stage-handoff-contract.md": "## Матрица этапов\n\nСтадии перечислены прозой.\n" },
  (root) => {
    assertFinding(lintStageHandoffTable(root), "stage-handoff-table", /матрица этапов не распозналась/);
  },
);

// 3.5. Корректная матрица ложных срабатываний не даёт.
withFixture(
  { "agent-pack/workflows/stage-handoff-contract.md": fullMatrix() },
  (root) => assert.deepEqual(lintStageHandoffTable(root), []),
);

// ---------------------------------------------------------------------------
// 4. Реальное состояние репозитория
// ---------------------------------------------------------------------------

assert.deepEqual(validateInstructionTexts(), []);

console.log("instruction lint regression tests passed");
