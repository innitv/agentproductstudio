/**
 * Регрессия «скаффолд не сочиняет за стадию».
 *
 * Дефект, ради которого проверка заведена (run `a3-shadcn`, 2026-07-29): `workflow:start`
 * создавал `design-brief.md` со `status: "ready"`, готовым `visual_direction` и
 * `inputs_used`, перечисляющим `prd.md`, `ia-brief.md`, `research-summary.md` — артефакты
 * стадий, ВЫЧЕРКНУТЫХ масштабом `increment`. Следом `workflow:sync` видел файл на диске и
 * переводил `04-design` в `completed`. Run стартовал с фиктивно закрытой стадией: не
 * заметь этого оркестратор, дизайн-агент не запустился бы вовсе, а следующие стадии
 * работали бы поверх текста, ссылающегося на несуществующие входы.
 *
 * Корень был двойной и оба конца механические:
 *   1. `const status = isResearchPartial ? "partial" : "ready"` — статус выводился из
 *      наличия research-артефакта. Research вычеркнут масштабом → файла нет → условие
 *      ложно → `ready`. Чем меньше масштаб, тем увереннее скаффолд объявлял готовность.
 *   2. Скаффолд не знал про масштаб вообще (`scale` в модуле не упоминался), поэтому
 *      `inputs_used` был захардкожен полным списком стадий `full`.
 *
 * Тест проверяет оба инварианта на реальном прогоне скаффолда, а не на фикстуре:
 *   - свежесозданный артефакт не объявляет себя `ready` — стадия ещё не выполнялась;
 *   - `inputs_used` не ссылается на артефакты стадий вне масштаба run.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { runLandingWorkflow } from "./run-landing-workflow";
import { buildLocalDownstreamArtifacts } from "./run-local-workflow";
import { artifactFiles, getWorkflowStagesForProfile } from "./workflow-stages";

/** Артефакты стадий, которых в этом масштабе не существует. */
function artifactsOutOfScale(scale: "full" | "increment" | "patch"): string[] {
  const inScale = new Set(getWorkflowStagesForProfile("standard", scale).map((stage) => stage.id));
  const all = getWorkflowStagesForProfile("standard", "full");
  const names: string[] = [];
  for (const stage of all) {
    if (inScale.has(stage.id)) continue;
    for (const key of stage.requiredArtifacts ?? []) {
      const file = (artifactFiles as Record<string, string>)[key];
      if (file) names.push(file);
    }
  }
  return names;
}

async function withScaffold(
  scale: "full" | "increment" | "patch",
  assertion: (runDir: string) => Promise<void> | void,
): Promise<void> {
  // Скаффолд проверяет целостность структуры репозитория и всегда пишет в
  // `outputs/<slug>/<date>`, поэтому прогон идёт в самом репозитории с заведомо
  // уникальной целью; каталог удаляется в `finally`, включая случай падения.
  const goal = `scaffold fiction probe ${scale} ${process.pid}`;
  let runDir = "";
  try {
    runDir = await runLandingWorkflow({ goal, scale, axes_recorded: { profile: false, scale: true } });
    await assertion(runDir);
  } finally {
    if (runDir) {
      const slugDir = dirname(runDir);
      rmSync(runDir, { force: true, recursive: true });
      if (existsSync(slugDir) && readdirSync(slugDir).length === 0) rmSync(slugDir, { force: true, recursive: true });
    }
  }
}

/** Полезная нагрузка из frontmatter `schema_payload`. */
function readPayload(file: string): Record<string, unknown> {
  const text = readFileSync(file, "utf8");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  assert.ok(start >= 0 && end > start, `в ${file} не найден schema_payload`);
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

const failures: string[] = [];

await withScaffold("increment", async (runDir) => {
  // Фикцию пишет НЕ скаффолд, а генератор downstream-артефактов при выполнении
  // стадии: `runLandingWorkflow` создаёт только ledger. Первая версия теста
  // проверяла каталог сразу после скаффолда, файла там не было и тест проходил
  // вхолостую — тот самый молчаливый зелёный, ради которого негативный контроль
  // и делается. Поэтому артефакты собираются явно.
  const artifacts = await buildLocalDownstreamArtifacts(runDir);
  const brief = artifacts.find((a) => a.file === "design-brief.md");
  assert.ok(brief, "генератор не выдал design-brief.md — проверять нечего, тест недостоверен");

  const start = brief.content.indexOf("{");
  const end = brief.content.lastIndexOf("}");
  assert.ok(start >= 0 && end > start, "в design-brief.md не найден schema_payload");
  const payload = JSON.parse(brief.content.slice(start, end + 1)) as Record<string, unknown>;

  // 1. Артефакт, сгенерированный до работы стадии, не может быть `ready`.
  if (payload.status === "ready") {
    failures.push(
      "design-brief.md: payload status 'ready' в сгенерированном артефакте " +
        "(стадия ещё не выполнялась — допустим только 'pending'/'partial')",
    );
  }

  // 2. `inputs_used` не ссылается на то, чего в масштабе нет.
  const inputs = Array.isArray(payload.inputs_used) ? (payload.inputs_used as string[]) : [];
  const ghosts = artifactsOutOfScale("increment").filter((name) => inputs.includes(name));
  if (ghosts.length > 0) {
    failures.push(
      `design-brief.md: inputs_used ссылается на ${ghosts.map((g) => `'${g}'`).join(", ")} — ` +
        "артефакты стадий вне масштаба 'increment'",
    );
  }
});

if (failures.length > 0) {
  console.error("FAIL scaffold-no-fiction");
  for (const line of failures) console.error("  " + line);
  process.exitCode = 1;
} else {
  console.log("scaffold no-fiction tests passed");
}
