import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

/**
 * Конфигурация визуальной регрессии Storybook.
 *
 * Отдельный конфиг, а не проект внутри `playwright.config.ts`: у обычных
 * e2e-спек другой webServer (vite preview студии) и другие требования к среде.
 * Здесь среда жёстко ограничена Docker-образом.
 *
 * 🔴 Главное правило подсистемы: скриншоты — и baseline, и прогон — создаются
 * ТОЛЬКО внутри пиннутого Linux-образа `mcr.microsoft.com/playwright:v<ver>-noble`.
 * Дока Playwright требует запускать тесты в той же среде, где сгенерирован
 * baseline; имя снапшота содержит платформу, поэтому Windows-baseline на Linux
 * даст не diff, а новый файл — регрессия просто не будет замечена. В
 * microsoft/playwright#20097 рендеринг расходился даже между двумя машинами с
 * одинаковой ОС, то есть «та же ОС» недостаточно, нужен идентичный образ.
 *
 * Запуск — только через `yarn vr:test` / `yarn vr:update`
 * (`tooling/scripts/run-visual-regression.mjs`).
 */

// Корень репозитория. Обёртка всегда запускает контейнер с `-w /work`, где
// смонтирован репозиторий, поэтому cwd — это корень.
const repoRoot = process.cwd();

// createRequire от cwd, а не от import.meta.url: Playwright транспилирует
// TypeScript сам и может отдать модуль как CJS, где import.meta недоступен.
const requireFromRepo = createRequire(path.join(repoRoot, "/"));

// ---------------------------------------------------------------------------
// Гейт среды: единственная точка, которая не даёт создать снапшот на хосте
// ---------------------------------------------------------------------------

const isLinux = process.platform === "linux";
const isContainer = existsSync("/.dockerenv");

if (!isLinux || !isContainer) {
  throw new Error(
    [
      "Визуальная регрессия запускается только внутри Docker-образа Playwright.",
      `Обнаружено: platform=${process.platform}, /.dockerenv=${isContainer}.`,
      "Скриншоты, снятые на Windows-хосте, непригодны как baseline: имя снапшота",
      "содержит платформу, поэтому на Linux Playwright создаст новый файл вместо",
      "сравнения, и регрессия останется незамеченной.",
      "Используй `yarn vr:test` или `yarn vr:update` — они поднимают контейнер сами.",
    ].join("\n"),
  );
}

// ---------------------------------------------------------------------------
// Гейт версии: образ и репозиторий обязаны сойтись по версии Playwright
// ---------------------------------------------------------------------------

const declaredVersion = (
  requireFromRepo("./package.json") as { devDependencies: Record<string, string> }
).devDependencies["@playwright/test"];
const runtimeVersion = (requireFromRepo("@playwright/test/package.json") as { version: string }).version;

if (declaredVersion !== runtimeVersion) {
  throw new Error(
    [
      "Версия Playwright в образе не совпадает с версией в package.json.",
      `package.json: ${declaredVersion}, среда контейнера: ${runtimeVersion}.`,
      "Браузеры в образе привязаны к своей версии раннера; при расхождении",
      "Playwright их не найдёт, а снапшоты станут несопоставимыми.",
      "Пересобери образ: `yarn vr:test` делает docker build автоматически.",
    ].join("\n"),
  );
}

const previewPort = Number(process.env.VR_PORT ?? 4183);
const previewUrl = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      // Пороги заданы декларативно. Playwright при обоих заданных берёт min()
      // (см. compareBuffers в playwright-core), поэтому ratio реально ужесточает
      // только мелкие истории, а абсолютный порог работает на крупных.
      // Парсить процент из текста ошибки нельзя: там ratio округлён до 2 знаков.
      maxDiffPixelRatio: 0.005,
      maxDiffPixels: 30,
      // Порог различия ОДНОГО пикселя (YIQ-расстояние), не количества пикселей.
      //
      // Измерено на этой витрине: при дефолтном 0.2 сдвиг горизонтального
      // padding чипа на 6px даёт РОВНО НОЛЬ различающихся пикселей на историях,
      // где чип светло-серый на белом холсте (`forms-chip--default`,
      // `--with-icon`, `--focused`, `--disabled-does-not-fire`), — цветовая
      // дельта сдвинутых краёв ниже «едва заметной». Та же поломка при 0.02
      // даёт 364-479 пикселей. Дефолт молча пропускает низкоконтрастные сдвиги
      // геометрии, поэтому порог ужесточён.
      //
      // Ноль не ставится: контейнер пиннут, но полная побитовая идентичность
      // растеризации между запусками не гарантирована, а ретраи здесь выключены.
      threshold: 0.02,
    },
  },
  forbidOnly: true,
  fullyParallel: true,
  outputDir: path.join(repoRoot, "reports/visual-regression/test-results"),
  // Имя проекта попадает в имя файла снапшота: расхождение среды должно быть
  // видно в имени, а не всплывать молча при сравнении.
  projects: [
    {
      name: "storybook-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { height: 800, width: 1280 } },
    },
  ],
  reporter: [
    ["list"],
    // Машинно-читаемый вердикт для агента-приёмщика: статус каждой истории и
    // пути к -expected/-actual/-diff лежат в attachments каждого теста.
    ["json", { outputFile: path.join(repoRoot, "reports/visual-regression/verdict.json") }],
  ],
  // Ретраи намеренно выключены: цель подсистемы — ловить регрессию, а ретрай
  // маскирует нестабильную историю под зелёную.
  retries: 0,
  // `{testDir}` — абсолютный путь, `{testFileDir}` был бы путём ОТНОСИТЕЛЬНО
  // testDir и для спеки в его корне разворачивается в пустую строку: снапшоты
  // ушли бы в `/__screenshots__` внутри контейнера и пропали вместе с ним.
  // `{projectName}` и `{platform}` в имени оставлены намеренно: снапшот,
  // снятый в другой среде, обязан быть отличим по имени.
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{projectName}-{platform}{ext}",
  testDir: path.join(repoRoot, "tests/visual-regression"),
  timeout: 30_000,
  use: {
    baseURL: previewUrl,
    // Трассы нужны только на падении: на 145 историй они весят заметно.
    trace: "retain-on-failure",
  },
  webServer: {
    command: `node tooling/scripts/serve-static.mjs dist/storybook ${previewPort}`,
    cwd: repoRoot,
    reuseExistingServer: false,
    timeout: 60_000,
    url: `${previewUrl}/index.json`,
  },
  workers: Number(process.env.VR_WORKERS ?? 4),
});
