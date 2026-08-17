/**
 * Контракт вызова двух команд, которые не входили ни в один агрегатор и потому могли быть
 * сломаны сколько угодно долго незаметно (аудит студии 2026-08-17, §4.4):
 *
 * - `yarn research:lint` без пути линтовал КОРЕНЬ репозитория как research pack и давал 4
 *   fail, включая `generic_claim_detector` на строках самого `CLAUDE.md`. С путём run-каталога
 *   та же команда проходит — значит дефект был в проверке аргумента, а не в правилах линта.
 * - `yarn figma:audit` падал сообщением «Укажите --registry»: в `design/figma/registry.json`
 *   две системы и не было поля `default_system`, то есть скрипт не знал, что аудировать.
 *
 * Тест гоняет РЕАЛЬНЫЕ команды подпроцессом, а не их внутренности: поломка скрипта, потеря
 * поля в реестре или переименование флага ловятся здесь и, через агрегатор
 * `workflow:test-agentic`, — сводной проверкой студии.
 *
 * Сеть и токен не нужны: у `figma:audit` для этого есть `--dry-run`, который разрешает реестр
 * и контракты и останавливается до обращения к Figma API.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = process.cwd();
const researchLint = join(repoRoot, "tooling/scripts/lint-research-content.mjs");
const figmaAudit = join(repoRoot, "tooling/scripts/audit-figma-component-contracts.mjs");

function run(script: string, args: string[], cwd = repoRoot): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  return { status: result.status ?? -1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function withTempDir(assertion: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), "cli-arg-contracts-"));
  try {
    assertion(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ====== research:lint ==================================================================

// 1. Без аргумента — ошибка ВЫЗОВА: код 2, usage, и ни одной строки отчёта линта.
{
  const result = run(researchLint, []);
  assert.equal(result.status, 2, `ожидался exit 2 (ошибка вызова), получен ${result.status}: ${result.stdout}${result.stderr}`);
  assert.match(result.stderr, /Usage: yarn research:lint <путь>/, "usage обязан объяснить, что передать");
  assert.doesNotMatch(result.stdout, /Research content lint/, "без пути линт не должен ничего линтовать");
}

// 2. Негативный контроль: корень репозитория как research pack действительно даёт провал —
// именно это и происходило молча при вызове без аргумента. Код 1 (провал линта), не 2.
{
  const result = run(researchLint, ["."]);
  assert.equal(result.status, 1, "корень репозитория обязан не проходить research-линт: иначе проверка ниже бессмысленна");
  assert.match(result.stdout, /Research content lint: fail/);
}

// 3. Годный research-текст проходит: предохранитель не сломал сам линт.
withTempDir((dir) => {
  const file = join(dir, "cjm-fragment.md");
  writeFileSync(
    file,
    [
      "# Оплата счёта",
      "",
      "Клиент платит по счёту через СБП: подтверждение статуса приходит в момент оплаты, проверяем событием аналитики.",
      "",
    ].join("\n"),
    "utf8",
  );

  const result = run(researchLint, [file]);
  assert.equal(result.status, 0, `годный файл обязан проходить, получено: ${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /Research content lint: pass/);
});

// 4. Правила линта работают: обтекаемый claim без механизма — провал с кодом 1.
withTempDir((dir) => {
  const file = join(dir, "claims.md");
  writeFileSync(file, "# Раздел\n\nНовый раздел повысит доверие клиентов.\n", "utf8");

  const result = run(researchLint, [file]);
  assert.equal(result.status, 1, "claim без механизма обязан валить линт");
  assert.match(result.stdout, /generic_claim_detector \| fail/);
});

// 5. Несуществующий путь — тоже ошибка вызова, но со своим текстом (код 1, как было).
withTempDir((dir) => {
  const result = run(researchLint, [join(dir, "нет-такого.md")]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Research lint target not found/);
});

// ====== figma:audit ====================================================================

// 6. Реальный реестр: `--dry-run` разрешает систему и контракты без сети и токена.
{
  const result = run(figmaAudit, ["--dry-run"]);
  assert.equal(result.status, 0, `figma:audit --dry-run обязан проходить на реальном реестре, получено: ${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /Figma audit dry-run: registry=/);

  const registry = JSON.parse(readFileSync(join(repoRoot, "design/figma/registry.json"), "utf8")) as {
    default_system?: string;
    systems: Array<{ slug: string; paths: { component_contracts?: string } }>;
  };
  const selected = registry.systems.find((system) => system.slug === registry.default_system);
  assert.ok(
    selected,
    `design/figma/registry.json: default_system='${registry.default_system}' не совпадает ни с одним слагом систем ` +
      `(${registry.systems.map((system) => system.slug).join(", ")}). Без этого поля figma:audit не знает, что аудировать.`,
  );
  assert.ok(selected.paths.component_contracts, `система '${selected.slug}' объявлена default_system, но не объявляет component_contracts`);
  assert.ok(existsSync(join(repoRoot, selected.paths.component_contracts)), "объявленный файл контрактов должен существовать на диске");
  assert.ok(
    result.stdout.includes(resolve(repoRoot, selected.paths.component_contracts)),
    `dry-run обязан назвать разрешённый путь контрактов, напечатано: ${result.stdout}`,
  );
}

// 7. Негативный контроль правки: две системы и НЕТ default_system — ровно то состояние, на
// котором команда падала. Падение обязано остаться, но с внятным сообщением.
withTempDir((dir) => {
  mkdirSync(join(dir, "design/figma"), { recursive: true });
  writeFileSync(
    join(dir, "design/figma/registry.json"),
    JSON.stringify({
      version: 1,
      systems: [
        { slug: "system-one", paths: { component_contracts: "design/figma/one/component-contracts.json" } },
        { slug: "system-two", paths: { component_contracts: "design/figma/two/component-contracts.json" } },
      ],
    }, null, 2),
    "utf8",
  );

  const result = run(figmaAudit, ["--dry-run"], dir);
  assert.notEqual(result.status, 0, "без default_system и с двумя системами аудит обязан отказываться, а не выбирать сам");
  assert.match(result.stderr, /Укажите --registry/);
  assert.match(result.stderr, /Системы в реестре: system-one, system-two/, "сообщение обязано перечислить пригодные слаги");
});

// 8. Тот же фиктивный реестр с `default_system` — команда находит контракты сама.
withTempDir((dir) => {
  mkdirSync(join(dir, "design/figma/system-two"), { recursive: true });
  writeFileSync(
    join(dir, "design/figma/registry.json"),
    JSON.stringify({
      version: 1,
      default_system: "system-two",
      systems: [
        { slug: "system-one", paths: { component_contracts: "design/figma/one/component-contracts.json" } },
        { slug: "system-two", paths: { component_contracts: "design/figma/system-two/component-contracts.json" } },
      ],
    }, null, 2),
    "utf8",
  );
  writeFileSync(
    join(dir, "design/figma/system-two/component-contracts.json"),
    JSON.stringify({ fileKey: "FAKEKEY", components: [{ name: "Button", nodeId: "1:2" }] }, null, 2),
    "utf8",
  );

  const result = run(figmaAudit, ["--dry-run"], dir);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /components=1/);
  assert.match(result.stdout, /fileKey=FAKEKEY/);
});

// 9. Пустые контракты — отказ, а не «аудит прошёл, проверять было нечего».
withTempDir((dir) => {
  mkdirSync(join(dir, "design/figma"), { recursive: true });
  writeFileSync(join(dir, "design/figma/registry.json"), JSON.stringify({ version: 1, systems: [] }), "utf8");
  writeFileSync(join(dir, "empty-contracts.json"), JSON.stringify({ components: [] }), "utf8");

  const result = run(figmaAudit, ["--dry-run", "--registry", "empty-contracts.json"], dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /нет непустого массива components/);
});

console.log("test-cli-arg-contracts: все проверки пройдены");
