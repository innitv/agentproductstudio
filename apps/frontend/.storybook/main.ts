import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

const configDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Конфигурация Storybook как витрины дизайн-системы проекта (shadcn/ui).
 *
 * Vite-конфиг приложения (`apps/frontend/vite.config.ts`) подключается явным
 * `viteConfigPath`: @storybook/react-vite сам НЕ добавляет @vitejs/plugin-react
 * и @tailwindcss/vite, поэтому без него не соберутся ни JSX, ни Tailwind-слой,
 * через который приходят токены `styles/shadcn/tokens.generated.css`.
 *
 * `builder-vite` берёт projectRoot как `dirname(configDir)`, то есть
 * `apps/frontend` — он совпадает с `root` в vite.config.ts, поэтому конфликта
 * корней нет. Секция `build` пользовательского конфига билдером отбрасывается,
 * так что `outDir: ../../dist/frontend` на сборку Storybook не влияет.
 */
const config: StorybookConfig = {
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: {
    // Данные не должны покидать локальную песочницу без approval.
    disableTelemetry: true,
  },
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: path.resolve(configDir, "../vite.config.ts"),
      },
    },
  },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
