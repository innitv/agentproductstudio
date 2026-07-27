import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * Скриншот-регрессия историй Storybook.
 *
 * Список историй берётся программно из `dist/storybook/index.json` собранного
 * Storybook — это единственный источник правды по story-id, руками он не
 * дублируется. Каждая история открывается изолированно по
 * `iframe.html?id=<storyId>`, без менеджера и сайдбара.
 *
 * Пороги различий заданы декларативно в `playwright.vr.config.ts`
 * (`maxDiffPixels`/`maxDiffPixelRatio`), в спеке их нет намеренно: иначе
 * невозможно централизованно ужесточить гейт.
 */

type StorybookIndexEntry = {
  id: string;
  name: string;
  tags?: string[];
  title: string;
  type: string;
};

type StorybookIndex = {
  entries: Record<string, StorybookIndexEntry>;
  v: number;
};

const repoRoot = process.cwd();
const indexPath = path.join(repoRoot, "dist/storybook/index.json");

/**
 * Истории, исключённые из скриншот-покрытия.
 *
 * Каждая запись — story-id и причина. Пустой список означает полное покрытие:
 * молчаливое усечение охвата запрещено, «покрыто не всё» должно быть видно
 * в коде и в отчёте, а не выводиться из разницы чисел.
 */
const excludedStories: Record<string, string> = {};

/**
 * Тег истории-страницы (composition story).
 *
 * Компонентная история помещается в 1280×800 целиком, поэтому кадра вьюпорта ей
 * достаточно. Страница приложения выше вьюпорта, и кадр по умолчанию покрыл бы
 * только первый экран, молча оставив остальное без регрессии.
 *
 * Одного `fullPage` мало и он даёт ЛОЖНЫЙ кадр: элементы `position: fixed`
 * (панель действий, тост) Playwright рисует на позиции текущего скролла, и на
 * длинном снимке фиксированная панель ложится поперёк середины страницы,
 * закрывая контент. Поэтому история-страница снимается в ВЫСОКОМ вьюпорте, где
 * она помещается целиком: тогда фиксированный слой стоит там же, где его видит
 * человек. `fullPage` оставлен как страховка на случай, если страница
 * перерастёт вьюпорт — обрезать снимок молча нельзя.
 *
 * Признак берётся из тега истории, а не из глобальной настройки: смена режима
 * для всех обесценила бы 145 эталонов компонентов, снятых кадром 1280×800.
 */
const PAGE_STORY_TAG = "vr-page";

/** Высота вьюпорта для историй-страниц. Ширина остаётся общей — 1280. */
const PAGE_VIEWPORT = { height: 2000, width: 1280 } as const;

function readStorybookIndex(): StorybookIndex {
  try {
    return JSON.parse(readFileSync(indexPath, "utf8")) as StorybookIndex;
  } catch (error) {
    throw new Error(
      [
        `Не найден индекс собранного Storybook: ${indexPath}`,
        "Сначала нужна статическая сборка (`yarn build-storybook`).",
        `Причина: ${error instanceof Error ? error.message : String(error)}`,
      ].join("\n"),
    );
  }
}

const index = readStorybookIndex();

// Фильтр по регулярному выражению: нужен для отладки одной истории
// (`VR_STORY_FILTER=actions-button`), в обычном прогоне не задан.
const storyFilter = process.env.VR_STORY_FILTER ? new RegExp(process.env.VR_STORY_FILTER) : undefined;

const stories = Object.values(index.entries)
  .filter((entry) => entry.type === "story")
  .filter((entry) => !(entry.id in excludedStories))
  .filter((entry) => (storyFilter ? storyFilter.test(entry.id) : true))
  .sort((left, right) => left.id.localeCompare(right.id));

if (stories.length === 0) {
  throw new Error(`В ${indexPath} не найдено ни одной истории под текущим фильтром.`);
}

const isPageStory = (story: StorybookIndexEntry) => story.tags?.includes(PAGE_STORY_TAG) ?? false;

/**
 * Съёмка одной истории. Имя снапшота задаётся story-id, а не именем теста,
 * поэтому разнесение историй по describe-блокам не переименовывает эталоны.
 */
async function captureStory(page: Page, story: StorybookIndexEntry): Promise<void> {
  await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);

  // `sb-show-main` Storybook ставит в начале рендера, до коммита React,
  // поэтому один этот класс — не признак готовности истории.
  await page.waitForSelector("body.sb-show-main", { timeout: 20_000 });

  // Ждём непустой корень, а не проверяем его разово: пустой `#storybook-root`
  // означает либо ещё не завершённый коммит React, либо упавшую историю.
  // Без этого ожидания baseline может зафиксировать белый экран, и настоящая
  // поломка компонента выглядела бы «зелёной».
  await page
    .waitForFunction(
      () => (document.querySelector("#storybook-root")?.childNodes.length ?? 0) > 0,
      undefined,
      { timeout: 20_000 },
    )
    .catch(() => {
      throw new Error(`История ${story.id} не отрисовала содержимое в #storybook-root`);
    });

  const errorVisible = await page.locator("#error-message").isVisible().catch(() => false);
  expect(errorVisible, `История ${story.id} отрендерила ошибку Storybook`).toBe(false);

  // Шрифты подгружаются асинхронно; без ожидания первый кадр может быть
  // снят на fallback-шрифте и дать ложный diff.
  await page.evaluate(() => document.fonts.ready);

  // toHaveScreenshot сам повторяет съёмку, пока два подряд кадра не совпадут:
  // это гасит анимации и догоняет play-функции без ручных таймаутов.
  await expect(page).toHaveScreenshot(`${story.id}.png`, {
    animations: "disabled",
    caret: "hide",
    fullPage: isPageStory(story),
  });
}

test.describe("Storybook visual regression", () => {
  for (const story of stories.filter((entry) => !isPageStory(entry))) {
    test(`${story.title} / ${story.name} [${story.id}]`, async ({ page }) => {
      await captureStory(page, story);
    });
  }
});

test.describe("Storybook visual regression: страницы", () => {
  test.use({ viewport: PAGE_VIEWPORT });

  for (const story of stories.filter(isPageStory)) {
    test(`${story.title} / ${story.name} [${story.id}]`, async ({ page }) => {
      await captureStory(page, story);
    });
  }
});
