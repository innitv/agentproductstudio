/**
 * Регрессия проверки «шаблон артефакта заполним до валидного файла».
 *
 * Дефект, ради которого проверка заведена (2026-07-28): `stage-gate-ledger.template.md`
 * писал заголовки по-русски (`## Запуск (Run)`), а манифест требует `## Run`. Подстроки нет,
 * значит любой ledger, собранный руками по шаблону, валидатор отклонял. Скаффолд писал
 * английские заголовки, поэтому на обычных запусках дефект не всплывал.
 *
 * Тест доказывает пару «внеси дефект — поймано / убери — чисто» и отдельно то, что сканер
 * вообще что-то находит: молчаливое «ошибок нет» из-за ненайденных шаблонов — тот же дефект,
 * только незаметный.
 */

import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateArtifactTemplates } from "./validate-config-semantics";

function withRepoCopy(assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "artifact-templates-"));
  try {
    mkdirSync(join(root, "agent-pack"), { recursive: true });
    cpSync("agent-pack/templates", join(root, "agent-pack/templates"), { recursive: true });
    cpSync("agent-pack/artifacts", join(root, "agent-pack/artifacts"), { recursive: true });
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// 1. Текущее состояние репозитория чистое.
const live: string[] = [];
validateArtifactTemplates(process.cwd(), live);
assert.deepEqual(live, [], `шаблоны разошлись с манифестом:\n${live.join("\n")}`);

// 2. Исторический дефект: заголовок переведён на русский, подстроки `## Run` больше нет.
withRepoCopy((root) => {
  const template = join(root, "agent-pack/templates/stage-gate-ledger.template.md");
  writeFileSync(template, readFileSync(template, "utf8").replace("## Run (Запуск)", "## Запуск (Run)"), "utf8");

  const errors: string[] = [];
  validateArtifactTemplates(root, errors);
  assert.ok(
    errors.some((error) => /stage-gate-ledger\.template\.md.*## Run/s.test(error)),
    `ожидалась находка про '## Run', получено:\n${errors.join("\n") || "(пусто)"}`,
  );
});

// 3. Тот же файл без правки ложных срабатываний не даёт.
withRepoCopy((root) => {
  const errors: string[] = [];
  validateArtifactTemplates(root, errors);
  assert.deepEqual(errors, []);
});

// 4. Защита от «сканер ничего не нашёл и потому зелёный»: удаляем каталог шаблонов целиком
//    и убеждаемся, что проверка молчит — то есть отсутствие шаблона не считается ошибкой, но
//    и не маскирует дефект в существующем.
withRepoCopy((root) => {
  rmSync(join(root, "agent-pack/templates"), { recursive: true, force: true });
  const errors: string[] = [];
  validateArtifactTemplates(root, errors);
  assert.deepEqual(errors, [], "отсутствие шаблона не должно быть ошибкой");
});

// 5. Сканер обязан реально читать шаблоны: подкладываем заведомо ломаный и ждём находку.
withRepoCopy((root) => {
  writeFileSync(join(root, "agent-pack/templates/run-plan.template.md"), "# Run Plan\n\nбез секций\n", "utf8");
  const errors: string[] = [];
  validateArtifactTemplates(root, errors);
  assert.ok(
    errors.some((error) => error.includes("run-plan.template.md")),
    "ломаный run-plan.template.md обязан быть пойман — иначе сканер не читает шаблоны",
  );
});

console.log("artifact template tests passed");
