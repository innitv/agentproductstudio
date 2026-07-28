/**
 * Обёртка визуальной регрессии Storybook: единственный поддерживаемый способ
 * запустить скриншот-тесты и сгенерировать baseline.
 *
 * 🔴 Правило подсистемы: скриншоты создаются только внутри пиннутого образа
 * `mcr.microsoft.com/playwright:v<ver>-noble`. Скрипт никогда не зовёт
 * Playwright на хосте — он поднимает контейнер. Дублирующий гейт стоит в
 * `tests/visual-regression/playwright.vr.config.ts`: конфиг падает, если
 * platform !== linux или нет `/.dockerenv`. Двух совпадающих ошибок хватает,
 * чтобы случайный `yarn playwright test --config ...` на Windows не создал
 * непригодный baseline.
 *
 * Что делается на хосте, а что в контейнере:
 *   - хост: статическая сборка Storybook (`dist/storybook`) — node_modules
 *     репозитория собраны под Windows, в Linux-контейнере они нерабочие;
 *     сборка даёт обычные JS/CSS/HTML, платформа рендеринга в них не зашита;
 *   - контейнер: запуск браузера, съёмка и сравнение скриншотов — то есть
 *     всё, что зависит от платформы.
 *
 * Использование:
 *   node tooling/scripts/run-visual-regression.mjs            # прогон против baseline
 *   node tooling/scripts/run-visual-regression.mjs --update   # перегенерация baseline
 *   ... --no-build      # не пересобирать Storybook (dist/storybook уже актуален)
 *   ... --grep=<regex>  # прогнать подмножество историй
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const args = process.argv.slice(2);
const shouldUpdate = args.includes("--update");
const skipBuild = args.includes("--no-build");
const grepArg = args.find((arg) => arg.startsWith("--grep="))?.slice("--grep=".length);

const configPath = "tests/visual-regression/playwright.vr.config.ts";
const reportDir = path.join(repoRoot, "reports/visual-regression");

function fail(message) {
  console.error(`\n[vr] ${message}\n`);
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    shell: false,
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });

  if (result.error) {
    fail(`Не удалось запустить ${command}: ${result.error.message}`);
  }

  return result.status ?? 1;
}

function capture(command, commandArgs) {
  return spawnSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
}

// ---------------------------------------------------------------------------
// 1. Версия Playwright — источник правды для тега образа
// ---------------------------------------------------------------------------

const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const playwrightVersion = packageJson.devDependencies?.["@playwright/test"];

if (!playwrightVersion || !/^\d+\.\d+\.\d+$/.test(playwrightVersion)) {
  fail(
    `devDependencies["@playwright/test"] должен быть точной версией, получено: ${playwrightVersion}. ` +
      "Диапазон версий несовместим с пиннутым образом: браузеры в образе привязаны к своей версии раннера.",
  );
}

const baseImage = `mcr.microsoft.com/playwright:v${playwrightVersion}-noble`;
const localImage = `agent-product-studio-vr:${playwrightVersion}`;

// ---------------------------------------------------------------------------
// 2. Docker обязателен
// ---------------------------------------------------------------------------

const dockerCheck = capture("docker", ["info", "--format", "{{.OSType}}"]);

if (dockerCheck.status !== 0) {
  fail(
    [
      "Docker недоступен, а визуальная регрессия работает только в контейнере.",
      "Запусти Docker Desktop и повтори команду.",
      (dockerCheck.stderr || dockerCheck.stdout || "").trim(),
    ].join("\n"),
  );
}

if (dockerCheck.stdout.trim() !== "linux") {
  fail(
    `Docker работает в режиме "${dockerCheck.stdout.trim()}" контейнеров. ` +
      "Нужен Linux-режим: baseline привязан к Linux-рендерингу образа Playwright.",
  );
}

// ---------------------------------------------------------------------------
// 3. Сборка Storybook на хосте
// ---------------------------------------------------------------------------

if (!skipBuild) {
  console.log("[vr] Собираю статический Storybook (dist/storybook)...");
  const storybookBin = path.join(repoRoot, "node_modules/storybook/dist/bin/dispatcher.js");

  if (!existsSync(storybookBin)) {
    fail(`Не найден бинарь Storybook: ${storybookBin}. Выполни yarn install.`);
  }

  const buildStatus = run(process.execPath, [
    storybookBin,
    "build",
    "-c",
    "apps/frontend/.storybook",
    "-o",
    "dist/storybook",
  ]);

  if (buildStatus !== 0) {
    fail("Сборка Storybook упала, скриншот-прогон невозможен.");
  }
}

if (!existsSync(path.join(repoRoot, "dist/storybook/index.json"))) {
  fail("Нет dist/storybook/index.json. Убери --no-build или выполни yarn build-storybook.");
}

mkdirSync(reportDir, { recursive: true });

// ---------------------------------------------------------------------------
// 4. Тонкий образ поверх пиннутого базового
// ---------------------------------------------------------------------------

console.log(`[vr] Базовый образ: ${baseImage}`);
console.log(`[vr] Собираю ${localImage} (слой: @playwright/test@${playwrightVersion})...`);

// Архитектура пиннута явно. В имени снапшота Playwright пишет только платформу
// ("linux"), архитектуры там нет: на arm64-хосте Docker подтянул бы arm64-вариант
// того же тега, рендеринг мог бы разойтись, а имена файлов совпали бы — и
// расхождение прошло бы как обычный diff непонятного происхождения.
const targetPlatform = "linux/amd64";

const buildImageStatus = run("docker", [
  "build",
  "--platform",
  targetPlatform,
  "--build-arg",
  `PLAYWRIGHT_VERSION=${playwrightVersion}`,
  "--tag",
  localImage,
  "--file",
  "tooling/visual-regression/Dockerfile",
  "tooling/visual-regression",
]);

if (buildImageStatus !== 0) {
  fail("docker build упал.");
}

// ---------------------------------------------------------------------------
// 5. Прогон в контейнере
// ---------------------------------------------------------------------------

// Windows-путь с обратными слэшами Docker разбирает неоднозначно из-за
// двоеточия после буквы диска; прямые слэши он принимает всегда.
const mountSource = repoRoot.split(path.sep).join("/");

const playwrightArgs = ["npx", "playwright", "test", "--config", configPath];

if (shouldUpdate) {
  // all, а не changed: baseline пересоздаётся целиком и осознанно.
  playwrightArgs.push("--update-snapshots=all");
}

if (grepArg) {
  playwrightArgs.push("--grep", grepArg);
}

const dockerRunArgs = [
  "run",
  "--rm",
  "--platform",
  targetPlatform,
  "--ipc=host",
  "--volume",
  `${mountSource}:/work`,
  // Анонимный том поверх точки монтирования: наполняется из образа и
  // перекрывает Windows-сборку node_modules хоста (нативные бинарники win32).
  "--volume",
  "/work/node_modules",
  "--workdir",
  "/work",
  localImage,
  ...playwrightArgs,
];

console.log(`[vr] docker run ${dockerRunArgs.slice(0, 8).join(" ")} ... ${playwrightArgs.join(" ")}`);
const startedAt = Date.now();
const testStatus = run("docker", dockerRunArgs);
const durationMs = Date.now() - startedAt;

console.log(`[vr] Прогон в контейнере занял ${(durationMs / 1000).toFixed(1)} с.`);

// Проверка, что baseline реально долетел до хоста. Ошибка в
// `snapshotPathTemplate` уводит снапшоты внутрь контейнера, где они исчезают
// вместе с `--rm`, а прогон при этом остаётся зелёным: тест «создал снапшот»
// и не с чем сравнивать. Молча такое не проходит.
const snapshotDir = path.join(repoRoot, "tests/visual-regression/__screenshots__");

if (shouldUpdate && testStatus === 0) {
  const snapshotCount = existsSync(snapshotDir)
    ? readdirSync(snapshotDir).filter((name) => name.endsWith(".png")).length
    : 0;

  if (snapshotCount === 0) {
    fail(
      `Прогон завершился успешно, но в ${snapshotDir} нет ни одного .png. ` +
        "Снапшоты остались внутри контейнера — проверь snapshotPathTemplate в конфиге.",
    );
  }

  console.log(`[vr] Baseline на хосте: ${snapshotCount} .png в tests/visual-regression/__screenshots__.`);
}

// ---------------------------------------------------------------------------
// 6. Сжатый машинно-читаемый вердикт
// ---------------------------------------------------------------------------

run(process.execPath, [
  "tooling/scripts/summarize-visual-regression.mjs",
  "--image",
  localImage,
  "--base-image",
  baseImage,
  "--duration-ms",
  String(durationMs),
  "--mode",
  shouldUpdate ? "update" : "test",
]);

process.exit(testStatus);
