import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * Измерительная спека эксперимента «геометрия против шрифта».
 *
 * ─── ЗАЧЕМ ОНА ЕСТЬ ─────────────────────────────────────────────────────────
 * Скриншот показывает РЕЗУЛЬТАТ, но не говорит, чем он вызван. Две вещи, на
 * которых этот эксперимент разваливается молча:
 *
 *   1. Шрифт «подключён», но не загрузился. Ровно это уже случилось однажды:
 *      тема `branded` объявляла `"Inter Tight"`, файлов в проекте не было,
 *      браузер молча ушёл в системный fallback — и типографика брендовой темы
 *      в контейнере совпадала с дефолтной, хотя в токене стояло другое имя.
 *      Объявление в CSS доказательством загрузки не является; поэтому здесь
 *      проверяется и `document.fonts.check`, и фактические метрики отрисовки.
 *
 *   2. Темы разъехались не по тому фактору. Разделение токенов проверяет
 *      сборщик (`tooling/shadcn-tokens/build-shadcn-tokens.mjs`), но токен
 *      может не доехать до пикселя: ручной слой `*-overrides.css`, произвольное
 *      значение в строке классов shadcn или каскад. Здесь измеряется то, что
 *      реально применилось к элементам.
 *
 * Спека живёт в каталоге визуальной регрессии намеренно: только там гарантирован
 * пиннутый Linux-образ, в котором снят baseline. Снимков она не делает и на 196
 * существующих эталонов не влияет.
 *
 * Побочный результат — `reports/theme-experiment/metrics.json`: числа, на
 * которые опирается ответ «что дало больше визуального прироста».
 */

/** Пилотный экран в одном и том же состоянии, четыре темы. */
const THEME_STORIES = {
  branded: "pages-cardrequestshadcn--branded-filled-draft",
  calm: "pages-cardrequestshadcn--calm-filled-draft",
  "calm-typed": "pages-cardrequestshadcn--calm-typed-filled-draft",
  default: "pages-cardrequestshadcn--default-theme-filled-draft",
} as const;

type ThemeName = keyof typeof THEME_STORIES;

/** Семейства, которые обязаны реально загрузиться в теме `calm-typed`. */
const LOADED_FAMILIES = ["Inter Tight Variable", "JetBrains Mono Variable"] as const;

/**
 * Пробная строка. Кириллица обязательна: subset грузится по unicode-range, и
 * латинская проверка прошла бы даже при неподгруженном кириллическом файле —
 * то есть на русском экране шрифт был бы «загружен» и не виден.
 */
const CYRILLIC_PROBE = "Заявка на выпуск карты 1 234 567";

const reportDir = path.join(process.cwd(), "reports/theme-experiment");

/** Открывает историю и дожидается отрисовки — та же последовательность, что в скриншот-спеке. */
async function openStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`);
  await page.waitForSelector("body.sb-show-main", { timeout: 20_000 });
  await page.waitForFunction(
    () => (document.querySelector("#storybook-root")?.childNodes.length ?? 0) > 0,
    undefined,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Снимает метрики темы прямо из отрисованного DOM.
 *
 * Читаются ВЫЧИСЛЕННЫЕ значения, а не токены: между токеном и пикселем стоят
 * ручной слой overrides, произвольные значения в классах shadcn и каскад, и
 * именно они несколько раз оказывались настоящей причиной вида.
 */
async function collectMetrics(page: Page) {
  return page.evaluate(
    ({ probe, families }) => {
      const scope = document.querySelector<HTMLElement>(".shadcn-scope");
      if (!scope) throw new Error("Контейнер темы .shadcn-scope не найден");

      const read = (selector: string) => {
        const node = scope.querySelector<HTMLElement>(selector);
        if (!node) return null;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return {
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          height: Number(box.height.toFixed(2)),
          lineHeight: style.lineHeight,
          padding: style.padding,
        };
      };

      /**
       * Ширина одной и той же строки в конкретном стеке. Это единственный
       * способ отличить «шрифт применился» от «имя написано в CSS»: у
       * fallback-гарнитуры другие метрики, и ширина расходится. `check()`
       * говорит лишь о том, что файл доступен, а не о том, что он в отрисовке.
       */
      const measure = (fontFamily: string) => {
        const probeNode = document.createElement("span");
        probeNode.textContent = probe;
        probeNode.style.cssText =
          `position:absolute;left:-9999px;top:-9999px;white-space:pre;` +
          `font-size:16px;font-weight:400;font-family:${fontFamily}`;
        document.body.append(probeNode);
        const width = probeNode.getBoundingClientRect().width;
        probeNode.remove();
        return Number(width.toFixed(2));
      };

      const scopeStyle = getComputedStyle(scope);
      const loadedFaces = [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replaceAll('"', ""));

      return {
        controls: {
          badge: read('[data-slot="badge"]'),
          card: read('[data-slot="card"]'),
          heading: read('[data-testid="card-request-shadcn-title"]'),
          input: read('[data-slot="input"]'),
          label: read('[data-slot="label"]'),
          primaryButton: read('[data-testid="card-request-shadcn-submit"]'),
          switch: read('[data-slot="switch"]'),
        },
        // Нижняя граница содержимого при одинаковом тексте — прямой измеритель
        // плотности: сжатая тема укладывает те же карточки выше по экрану.
        //
        // Ни высота документа, ни высота контейнера здесь не годятся: страница
        // помещается в вьюпорт, у контейнера `min-h-screen`, и обе величины
        // равны высоте вьюпорта при ЛЮБОЙ теме — то есть выглядят как
        // «плотность одинаковая». Меряется реальный низ последней карточки.
        contentBottom: (() => {
          const cards = [...scope.querySelectorAll<HTMLElement>('[data-slot="card"]')];
          if (cards.length === 0) return null;
          const top = scope.getBoundingClientRect().top;
          const bottom = Math.max(...cards.map((card) => card.getBoundingClientRect().bottom));
          return Number((bottom - top).toFixed(2));
        })(),
        fonts: {
          // check() с кириллицей: subset грузится по unicode-range, и латинская
          // проверка прошла бы даже при неподгруженном кириллическом файле.
          checkCyrillic: Object.fromEntries(
            families.map((family) => [family, document.fonts.check(`16px "${family}"`, probe)]),
          ),
          loadedFaces: [...new Set(loadedFaces)].sort(),
          // Ширина пробной строки в стеке темы против заведомого системного
          // стека. Равенство означает, что тема рисуется системным шрифтом.
          probeWidthSystem: measure("ui-sans-serif, system-ui, sans-serif"),
          probeWidthThemeMono: measure(scopeStyle.getPropertyValue("--font-mono")),
          probeWidthThemeSans: measure(scopeStyle.getPropertyValue("--font-sans")),
        },
        tokens: {
          fontMono: scopeStyle.getPropertyValue("--font-mono").trim(),
          fontSans: scopeStyle.getPropertyValue("--font-sans").trim(),
          radius: scopeStyle.getPropertyValue("--radius").trim(),
          spacing: scopeStyle.getPropertyValue("--spacing").trim(),
          textSm: scopeStyle.getPropertyValue("--text-sm").trim(),
        },
      };
    },
    { families: [...LOADED_FAMILIES], probe: CYRILLIC_PROBE },
  );
}

test.describe("Эксперимент «геометрия против шрифта»", () => {
  // Экран выше стандартного вьюпорта; та же высота, что у скриншот-историй,
  // иначе измеренная высота документа была бы несопоставима со снимками.
  test.use({ viewport: { height: 2000, width: 1280 } });

  for (const [theme, storyId] of Object.entries(THEME_STORIES) as [ThemeName, string][]) {
    test(`метрики темы ${theme}`, async ({ page }) => {
      await openStory(page, storyId);
      const metrics = await collectMetrics(page);

      // Файл на тему, а не общий: воркеры Playwright — разные процессы, общий
      // объект в памяти собрал бы только часть тем и выглядел бы полным.
      mkdirSync(reportDir, { recursive: true });
      writeFileSync(
        path.join(reportDir, `metrics-${theme}.json`),
        `${JSON.stringify(metrics, null, 2)}\n`,
        "utf8",
      );

      // Тема действительно применилась: без этого все остальные числа были бы
      // измерены на чужой теме и выглядели бы правдоподобно.
      expect(metrics.tokens.radius, `тема ${theme} не применила --radius`).not.toBe("");
    });
  }

  test("шрифты темы calm-typed реально загружены, а не только объявлены", async ({ page }) => {
    await openStory(page, THEME_STORIES["calm-typed"]);
    const metrics = await collectMetrics(page);

    // 1. Файлы доступны браузеру — включая кириллический subset.
    for (const family of LOADED_FAMILIES) {
      expect(
        metrics.fonts.checkCyrillic[family],
        `document.fonts.check вернул false для "${family}" на кириллице: файл не загрузился`,
      ).toBe(true);
      expect(
        metrics.fonts.loadedFaces,
        `среди загруженных FontFace нет "${family}"`,
      ).toContain(family);
    }

    // 2. Файл не просто доступен, а участвует в отрисовке: метрики расходятся
    //    с системным стеком. Именно этой проверки не хватало теме `branded` —
    //    она объявляла "Inter Tight" и молча рисовалась системным шрифтом.
    expect(
      metrics.fonts.probeWidthThemeSans,
      "ширина строки в стеке темы совпала с системной: шрифт не применился",
    ).not.toBe(metrics.fonts.probeWidthSystem);
  });

  test("темы branded и calm рисуются системным шрифтом — их стек без файлов", async ({ page }) => {
    // Контрольная проверка обратного знака: если бы подгруженный шрифт протёк
    // в эти темы, разница `calm` ↔ `calm-typed` перестала бы быть замером
    // гарнитуры, а разница `branded` ↔ `calm` — замером геометрии.
    for (const theme of ["branded", "calm"] as const) {
      await openStory(page, THEME_STORIES[theme]);
      const metrics = await collectMetrics(page);

      expect(
        metrics.fonts.probeWidthThemeSans,
        `тема ${theme} внезапно рисуется не системным шрифтом: стек ${metrics.tokens.fontSans}`,
      ).toBe(metrics.fonts.probeWidthSystem);
    }
  });
});
