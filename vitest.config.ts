import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const storybookConfigDir = path.resolve(rootDir, "apps/frontend/.storybook");

// storybookTest() асинхронный, а defineConfig в vitest 4 не принимает
// async-фабрику конфига — плагины резолвятся top-level await.
const storybookPlugins = await storybookTest({ configDir: storybookConfigDir });

/**
 * Прогон Storybook-историй как тестов (play-функции + smoke-рендер).
 * Браузерный режим — Chromium через уже установленный в проекте Playwright
 * 1.60.0, отдельный движок не добавляется.
 *
 * `root` возвращается к корню репозитория: vite.config.ts приложения задаёт
 * `root: apps/frontend`, и без переопределения glob историй из конфига
 * Storybook резолвился бы от него второй раз.
 *
 * Отдельный setup-файл с `setProjectAnnotations` не нужен: начиная с
 * Storybook 10.3 аннотации preview подключает сам аддон.
 */
export default defineConfig({
  test: {
    projects: [
      {
        extends: path.resolve(rootDir, "apps/frontend/vite.config.ts"),
        plugins: storybookPlugins,
        root: rootDir,
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          dir: rootDir,
          name: "storybook",
        },
      },
    ],
  },
});
