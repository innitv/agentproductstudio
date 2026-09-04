/**
 * Проверка отчёта о применении навыков.
 *
 * Главное, что здесь проверяется, — отчёт различает «навык не применялся» и
 * «применение вообще не записывается». Первая версия отчёта этого не умела и
 * показывала ноль у навыков, которые применяются постоянно; такой отчёт
 * выглядит как факт и потому опаснее отсутствия отчёта.
 *
 * Негативный контроль обязателен: тест сам создаёт прогон без записи и
 * убеждается, что он в знаменатель не попал.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { collectSkillUsage, formatSkillUsage } from "./skill-usage-report";

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "skill-usage-"));
  mkdirSync(join(root, ".claude", "skills", "alpha-skill"), { recursive: true });
  writeFileSync(
    join(root, ".claude", "skills", "alpha-skill", "SKILL.md"),
    ["---", "id: alpha-skill", "name: alpha-skill", "owner_stage_ids:", "  - 02-prd", "---", "", "тело"].join("\n"),
    "utf8",
  );
  mkdirSync(join(root, ".claude", "skills", "beta-skill"), { recursive: true });
  writeFileSync(
    join(root, ".claude", "skills", "beta-skill", "SKILL.md"),
    ["---", "id: beta-skill", "name: beta-skill", "owner_stage_ids:", "  - 03-ia", "---", "", "тело"].join("\n"),
    "utf8",
  );
  return root;
}

function addRun(root: string, slug: string, date: string, handoff: string): void {
  const dir = join(root, "outputs", slug, date);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "handoff-bundle.md"), handoff, "utf8");
}

// 1. Прогон без записи применения: измерять нечем, список не печатается
{
  const root = makeRoot();
  addRun(root, "run-one", "2026-09-01", "# Handoff\n\nСтадия закрыта.");
  const report = collectSkillUsage(root);
  assert.equal(report.total, 1, "прогон должен быть найден");
  assert.equal(report.measurable, 0, "прогон без skills_used не идёт в знаменатель");

  const text = formatSkillUsage(report);
  assert.ok(text.includes("Измерять нечем"), "отчёт обязан сказать, что измерять нечем");
  assert.ok(
    !text.includes("Ни разу не упомянуты"),
    "без записей список неиспользуемых печатать нельзя — это был бы ложный ноль",
  );
  rmSync(root, { recursive: true, force: true });
}

// 2. Есть запись: считаются только прогоны с ней, упоминание находится
{
  const root = makeRoot();
  addRun(root, "with-record", "2026-09-02", "# Handoff\n\nskills_used: alpha-skill\n");
  addRun(root, "without-record", "2026-09-03", "# Handoff\n\nСтадия закрыта без записи.");
  const report = collectSkillUsage(root);
  assert.equal(report.total, 2, "оба прогона на диске");
  assert.equal(report.measurable, 1, "в знаменатель идёт только прогон с записью");

  const alpha = report.usage.find((item) => item.id === "alpha-skill");
  const beta = report.usage.find((item) => item.id === "beta-skill");
  assert.ok(alpha && alpha.runs.length === 1, "навык, названный в записи, должен быть найден");
  assert.equal(alpha?.lastSeen, "2026-09-02", "дата последнего упоминания — каталог прогона");
  assert.ok(beta && beta.runs.length === 0, "не названный навык остаётся с нулём");

  const text = formatSkillUsage(report);
  assert.ok(text.includes("Прогонов с записью: 1 из 2"), "отчёт показывает оба числа");
  assert.ok(text.includes("Ни разу не упомянуты (1)"), "при наличии записей список печатается");
  assert.ok(text.includes("beta-skill"), "в списке — именно неупомянутый навык");
  rmSync(root, { recursive: true, force: true });
}

// 3. Мутация самой проверки: если убрать фильтр по маркеру, тест обязан это заметить
{
  const root = makeRoot();
  addRun(root, "no-record", "2026-09-04", "# Handoff\n\nalpha-skill упомянут, но записи skills нет");
  const report = collectSkillUsage(root);
  assert.equal(
    report.measurable,
    0,
    "упоминание id в свободном тексте без skills_used записью не считается",
  );
  const alpha = report.usage.find((item) => item.id === "alpha-skill");
  assert.equal(alpha?.runs.length, 0, "иначе отчёт считал бы за применение любое совпадение подстроки");
  rmSync(root, { recursive: true, force: true });
}

process.stdout.write("skill usage report tests passed" + String.fromCharCode(10));
