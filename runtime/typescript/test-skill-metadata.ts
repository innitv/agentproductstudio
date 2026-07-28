import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  detectGlobalSkillConflicts,
  extractFrontmatterDescription,
  parseSkillInstructionDocument,
  validateSkillMetadata,
  validateSkillWrappers,
} from "./skill-metadata";

function withSkillFixture(assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "skill-metadata-"));
  try {
    mkdirSync(join(root, "agent-pack"), { recursive: true });
    cpSync("agent-pack/skills", join(root, "agent-pack/skills"), { recursive: true });
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function overwriteSkill(root: string, skillId: string, transform: (content: string) => string): void {
  const path = join(root, "agent-pack/skills", skillId, "SKILL.md");
  writeFileSync(path, transform(readFileSync(path, "utf8")), "utf8");
}

function assertMetadataError(errors: string[], pattern: RegExp): void {
  assert.ok(
    errors.some((error) => pattern.test(error)),
    `Expected skill metadata error matching ${pattern}, got:\n${errors.join("\n")}`,
  );
}

const parsed = parseSkillInstructionDocument([
  "---",
  "id: fixture-skill",
  "name: fixture-skill",
  "title: Fixture",
  "description: Fixture skill",
  "platforms:",
  "  - claude",
  "mcp_servers: []",
  "strictness_profile: strict",
  "owner_stage_ids: []",
  "required_inputs: []",
  "required_outputs: []",
  "approval_actions: []",
  "validation_commands: []",
  "contract_schema: agent-pack/templates/skill.template.md",
  "---",
  "",
  "# Fixture Skill",
].join("\n"));
assert.equal(parsed.metadata?.id, "fixture-skill");
assert.equal(parsed.body.trim(), "# Fixture Skill");

assert.deepEqual(validateSkillMetadata(), []);

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ""));
  assertMetadataError(validateSkillMetadata(root), /landing-builder\/SKILL\.md: missing YAML frontmatter skill metadata/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace("  - 08-frontend", "  - 99-unknown"));
  assertMetadataError(validateSkillMetadata(root), /owner_stage_ids contains unknown stage '99-unknown'/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "notion-sync", (content) => content.replace(
    "approval_actions:\n  - notion_research_publish\n  - notion_prd_export\n  - notion_agile_export",
    "approval_actions:\n  - notion_research_publish\n  - unknown_external_write\n  - notion_agile_export",
  ));
  assertMetadataError(validateSkillMetadata(root), /approval_actions contains unknown action 'unknown_external_write'/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace("  - frontend_result", "  - unknown_artifact"));
  assertMetadataError(validateSkillMetadata(root), /required_outputs contains unknown artifact\/output 'unknown_artifact'/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace("name: landing-builder", "name: wrong-name"));
  assertMetadataError(validateSkillMetadata(root), /name 'wrong-name' must match id 'landing-builder'/);
});

// Обёртки `.claude/skills/*` реального репозитория должны быть согласованы.
assert.deepEqual(validateSkillWrappers(), []);

// Фикстура с обеими директориями: ловим рассинхрон name в обёртке.
function withWrapperFixture(assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "skill-wrapper-"));
  try {
    mkdirSync(join(root, "agent-pack"), { recursive: true });
    mkdirSync(join(root, ".claude"), { recursive: true });
    cpSync("agent-pack/skills", join(root, "agent-pack/skills"), { recursive: true });
    cpSync(".claude/skills", join(root, ".claude/skills"), { recursive: true });
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

withWrapperFixture((root) => {
  const wrapper = join(root, ".claude/skills/landing-builder/SKILL.md");
  writeFileSync(wrapper, readFileSync(wrapper, "utf8").replace("name: landing-builder", "name: wrong-name"), "utf8");
  assertMetadataError(validateSkillWrappers(root), /landing-builder\/SKILL\.md: name 'wrong-name' must match skill id 'landing-builder'/);
});

// ---------------------------------------------------------------------------
// Дословное равенство описаний зеркала и источника.
//
// Воспроизводится РЕАЛЬНЫЙ дефект: описание `landing-builder` в глобальной копии говорило
// «bespoke-вёрстка с нуля», проектное — «по умолчанию из компонентов shadcn/ui»
// (`docs/architecture/studio-audit-2026-07-28.md` P0-7). Роутер выбирает навык по этой
// строке, поэтому расхождение меняет поведение молча.
// ---------------------------------------------------------------------------

const historicGlobalDescription =
  "Использовать при bespoke-реализации UI лендинга, сайта или экрана — вёрстка с нуля на чистом " +
  "кастомном CSS / Tailwind и независимых React/TypeScript компонентах.";

withWrapperFixture((root) => {
  const wrapper = join(root, ".claude/skills/landing-builder/SKILL.md");
  writeFileSync(
    wrapper,
    readFileSync(wrapper, "utf8").replace(/^description:.*$/m, `description: ${historicGlobalDescription}`),
    "utf8",
  );
  assertMetadataError(
    validateSkillWrappers(root),
    /landing-builder\/SKILL\.md: description must match agent-pack\/skills\/landing-builder\/SKILL\.md verbatim/,
  );
  assertMetadataError(validateSkillWrappers(root), /bespoke-реализации UI лендинга/);
});

// Мелкий дрейф (ё/е, знак препинания) ловится тем же правилом: именно так расхождение и
// начинается, а «смысловое» сравнение двух строк машине недоступно.
withWrapperFixture((root) => {
  const wrapper = join(root, ".claude/skills/notion-sync/SKILL.md");
  writeFileSync(wrapper, readFileSync(wrapper, "utf8").replace("разрешённый", "разрешенный"), "utf8");
  assertMetadataError(validateSkillWrappers(root), /notion-sync\/SKILL\.md: description must match/);
});

// Кавычки и переносы строк расхождением НЕ считаются: сверяется текст, а не раскладка YAML.
assert.equal(
  extractFrontmatterDescription('description: "Текст с двоеточием: и продолжением"'),
  "Текст с двоеточием: и продолжением",
);
assert.equal(
  extractFrontmatterDescription("description: Первая строка\n  и перенос\nname: x"),
  "Первая строка и перенос",
);

// ---------------------------------------------------------------------------
// Конфликт с глобальными навыками `~/.claude/skills/<id>`: только предупреждение,
// и только при наличии домашнего каталога (у другого разработчика его нет).
// ---------------------------------------------------------------------------

function withFakeHome(assertion: (root: string, home: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "skill-conflict-"));
  const home = mkdtempSync(join(tmpdir(), "skill-home-"));
  try {
    mkdirSync(join(root, "agent-pack"), { recursive: true });
    cpSync("agent-pack/skills", join(root, "agent-pack/skills"), { recursive: true });
    mkdirSync(join(home, ".claude/skills"), { recursive: true });
    assertion(root, home);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
}

// Домашнего каталога нет вовсе — молчание, а не ошибка.
assert.deepEqual(detectGlobalSkillConflicts(process.cwd(), join(tmpdir(), "no-such-home-dir-xyz")), []);

withFakeHome((root, home) => {
  assert.deepEqual(detectGlobalSkillConflicts(root, home), []);

  // Реальный каталог перебивает проектный навык — это и случилось с landing-builder.
  mkdirSync(join(home, ".claude/skills/landing-builder"), { recursive: true });
  writeFileSync(join(home, ".claude/skills/landing-builder/SKILL.md"), "---\nname: landing-builder\n---\n", "utf8");
  const conflicts = detectGlobalSkillConflicts(root, home);
  assert.deepEqual(conflicts.map((conflict) => conflict.id), ["landing-builder"]);

  // Имя, которого в проекте нет, конфликтом не является.
  mkdirSync(join(home, ".claude/skills/some-personal-skill"), { recursive: true });
  assert.deepEqual(detectGlobalSkillConflicts(root, home).map((conflict) => conflict.id), ["landing-builder"]);

  // Симлинк на этот же репозиторий — не копия, а тот же файл: конфликта нет.
  rmSync(join(home, ".claude/skills/landing-builder"), { recursive: true, force: true });
  symlinkSync(join(root, "agent-pack/skills/landing-builder"), join(home, ".claude/skills/landing-builder"), "junction");
  assert.deepEqual(detectGlobalSkillConflicts(root, home), []);
});

console.log("skill metadata regression tests passed");
