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
import { lintInstructionReferences, lintRouteDetectionByFile, validateInstructionTexts } from "./instruction-lint";

function withFixture(files: Record<string, string>, assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "instruction-lint-"));
  try {
    // Реестр дизайн-систем и каталог навыков нужны как источники известных сущностей.
    write(root, "design/figma/registry.json", JSON.stringify({ systems: [{ slug: "a3-finance-visitka" }] }));
    write(root, "agent-pack/skills/run-ledger/SKILL.md", "---\nid: run-ledger\n---\n");
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
    "agent-pack/skills/figma-token-extractor/SKILL.md":
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
    "agent-pack/skills/figma-token-extractor/SKILL.md":
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
// 3. Детекция маршрута по наличию файла — системный дефект: так делали два независимых
//    потребителя (QA и ds-to-storybook). Тексты дословные из `git show 31079c7`.
// ---------------------------------------------------------------------------

const historicRouteDetection: Record<string, string> = {
  ".claude/agents/qa-review.md":
    "- **Figma-аудит применяется только к задачам, реально прошедшим Figma-ветку** " +
    "(есть `figma-layout-ir.json`/`figma-handoff-bundle.md`); иначе Figma-гейты помечай `not_applicable` с причиной.\n",
  "agent-pack/skills/ds-to-storybook/SKILL.md":
    "- Figma-driven component handoff — отдельное ветвление, применяется только при наличии `figma-handoff-bundle.md`.\n",
  "agent-pack/skills/figma-roundtrip/SKILL.md":
    "Применяется, только когда для задачи существует `figma-handoff-bundle.md` или пользователь явно передаёт макет как источник.\n",
};

for (const [file, content] of Object.entries(historicRouteDetection)) {
  withFixture({ [file]: content }, (root) => {
    const findings = lintRouteDetectionByFile(root);
    assert.equal(findings.length, 1, `Дефект в ${file} не пойман: ${JSON.stringify(findings)}`);
    assertFinding(findings, "route-detection-by-file", /маршрут определяется по наличию Figma-артефакта/);
  });
}

// Правильные формулировки (текущее состояние репозитория) ложных срабатываний не дают.
withFixture(
  {
    ".claude/agents/qa-review.md":
      "- **Маршрут производства макета читай из `run-state.json`** (поле `track`, `CLAUDE.md` §0.3), а не из наличия файлов: " +
      "определять маршрут по наличию `figma-layout-ir.json`/`figma-handoff-bundle.md` **запрещено** — запуск на `track=figma`, " +
      "не создавший IR, выглядел бы как честный `code`.\n",
    "agent-pack/skills/ds-to-storybook/SKILL.md":
      "- Figma-driven component handoff — отдельное ветвление, применяется только на маршруте `track: figma` из `run-state.json`. " +
      "Определять маршрут по наличию `figma-handoff-bundle.md` запрещено.\n",
    // Законное использование артефакта: «есть файл — сверь его» маршрута не определяет.
    "agent-pack/skills/design-engineering/SKILL.md":
      "- Есть `figma-handoff-bundle.md` и нужно убедиться, что motion/state rules и component variants не потерялись при переносе в код.\n",
    "agent-pack/skills/figma-handoff/SKILL.md":
      "- Если surface `figma_board|product_ui|prototype`, убедись, что `figma-screen-compiler` создал `figma-layout-ir.json`; без IR write запрещен.\n",
  },
  (root) => assert.deepEqual(lintRouteDetectionByFile(root), []),
);

// ---------------------------------------------------------------------------
// 4. Реальное состояние репозитория
// ---------------------------------------------------------------------------

assert.deepEqual(validateInstructionTexts(), []);

console.log("instruction lint regression tests passed");
