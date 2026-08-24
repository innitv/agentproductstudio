import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium, type Browser } from "@playwright/test";

/**
 * Измеримые признаки страницы и сверка двух страниц по ним.
 *
 * ── Зачем ─────────────────────────────────────────────────────────────
 *
 * `reference:scan` снимает markdown и скриншоты, `reference:diff` сравнивает
 * КАДРЫ. Оба отвечают на вопрос «похоже ли», и оба слепы к тому классу
 * расхождений, который человек находит глазами за минуту: страница набрана
 * другой гарнитурой в кириллице, экран накопил лишние сто пикселей к низу,
 * плотность полей вдвое шире образца.
 *
 * Пиксельный diff здесь не работает вовсе, когда реализация — не копия, а
 * ПЕРЕНОС образца на свой контент: тексты другой длины, состав блоков свой,
 * кадры расходятся полностью, и число «85% различий» не значит ничего.
 *
 * Сравнимы ПРИЗНАКИ, по которым узнаётся чужая страница:
 *   1. Профиль высот с накопленным низом. Совпадение всех зазоров ничего не
 *      доказывает: межстрочный интервал образца плотнее дефолтного, лишние
 *      6-8 px на строке дают под сотню к низу экрана. У совпадающих страниц
 *      накопленная координата сходится, у разошедшихся расхождение растёт
 *      сверху вниз.
 *   2. Фактическая гарнитура ОТДЕЛЬНО для кириллицы и латиницы: «шрифт
 *      подключён» об этом не говорит — кириллица приходит из следующего
 *      шрифта стека молча.
 *   3. Веса, которые страница ПРОСИТ, против загруженных начертаний:
 *      недостающий полужирный браузер синтезирует растягиванием контуров.
 *   4. Кегли, палитра, медианы радиуса и внутренних полей — плотность.
 *
 * Все четыре класса стоили переделок на run `contractor-payment-demo`
 * (диагнозы 10, 11, 12 и 16 в его `FIXES.md`).
 *
 * ── Образец за логином ────────────────────────────────────────────────
 *
 * Половина реальных образцов не отдаётся гостю: корзина, личный кабинет,
 * оформленный заказ. Тогда зонд выполняется в браузере человека, его вывод
 * сохраняется файлом и подаётся сюда как `--reference=<файл.json>`.
 * Процедура сверки от этого не меняется.
 *
 * ── Что инструмент НЕ делает ──────────────────────────────────────────
 *
 * Не выносит вердикта. Часть расхождений — намеренные решения продукта
 * (пороги доступности выше образца, свои тексты, свой состав блоков), и
 * отличить их от дефекта может только тот, кто знает задачу. Код возврата
 * всегда 0.
 *
 * Запуск:
 *   yarn reference:metrics --reference=https://example.com --local=http://127.0.0.1:5173/
 *   yarn reference:metrics --reference=probe-dump.json --local=... --width=390
 */

export interface OutlineRow {
  y: number;
  h: number;
  bottom: number;
  tag: string;
  text?: string;
}

export interface PageMetrics {
  source: string;
  viewport: string;
  pageHeight: number;
  nodes: number;
  shadowHosts: number;
  fontSizes: string[];
  fontWeights: string[];
  familiesCyrillic: string[];
  familiesLatin: string[];
  loadedFaces: string[];
  textColors: string[];
  backgrounds: string[];
  medianRadius: number | null;
  medianPaddingLeft: number | null;
  outline: OutlineRow[];
}

declare global {
  interface Window {
    referenceProbe: (options?: { width?: number; selector?: string }) => PageMetrics;
  }
}

export interface MetricsComparison {
  reference: PageMetrics;
  local: PageMetrics;
  differences: string[];
  outlineDrift: Array<{ index: number; referenceBottom: number; localBottom: number; drift: number }>;
}

/**
 * Исходник зонда. Он живёт отдельным JS-файлом, а не функцией в этом модуле:
 * `tsx` компилирует именованные функции с хелпером `__name`, которого в
 * браузере нет, и `page.evaluate(fn)` падает с `ReferenceError`. Отдельный
 * файл заодно вставляется в консоль браузера человека, когда образец не
 * отдаётся гостю.
 */
const probeSource = await readFile(fileURLToPath(new URL("../browser/reference-probe.js", import.meta.url)), "utf8");

async function measure(browser: Browser, url: string, width: number, height: number): Promise<PageMetrics> {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

  // Ленивые блоки: без прокрутки высоты соврут, а профиль окажется обрезанным.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
  // Гарнитура определяется по загруженным начертаниям: до готовности шрифтов
  // зонд отчитается о фолбэке и соврёт ровно в том, ради чего он написан.
  await page.evaluate(() => document.fonts.ready);

  await page.addScriptTag({ content: probeSource });
  const metrics = (await page.evaluate((w) => window.referenceProbe({ width: w }), width)) as PageMetrics;
  await context.close();
  return metrics;
}

export async function compareReference(options: {
  reference: string;
  local: string;
  width?: number;
  height?: number;
}): Promise<MetricsComparison> {
  const width = options.width ?? 390;
  const height = options.height ?? 844;
  const browser = await chromium.launch();

  try {
    const reference = options.reference.endsWith(".json")
      ? (JSON.parse(await readFile(options.reference, "utf8")) as PageMetrics)
      : await measure(browser, options.reference, width, height);
    const local = await measure(browser, options.local, width, height);

    const differences: string[] = [];
    const compare = (label: string, a: unknown, b: unknown): void => {
      if (JSON.stringify(a) !== JSON.stringify(b)) differences.push(label);
    };
    compare("кегли", reference.fontSizes, local.fontSizes);
    compare("веса", reference.fontWeights, local.fontWeights);
    compare("гарнитура (кириллица)", reference.familiesCyrillic, local.familiesCyrillic);
    compare("гарнитура (латиница)", reference.familiesLatin, local.familiesLatin);
    compare("цвета текста", reference.textColors, local.textColors);
    compare("фоны", reference.backgrounds, local.backgrounds);
    compare("медиана радиуса", reference.medianRadius, local.medianRadius);
    compare("медиана поля слева", reference.medianPaddingLeft, local.medianPaddingLeft);

    const outlineDrift = reference.outline.slice(0, 14).map((row, index) => ({
      index,
      referenceBottom: row.bottom,
      localBottom: local.outline[index]?.bottom ?? -1,
      drift: (local.outline[index]?.bottom ?? 0) - row.bottom,
    }));

    return { reference, local, differences, outlineDrift };
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  const arg = (name: string): string | undefined => {
    const hit = process.argv.find((value) => value.startsWith("--" + name + "="));
    return hit ? hit.slice(name.length + 3) : undefined;
  };

  const reference = arg("reference");
  const local = arg("local");
  if (!reference || !local) {
    console.error(
      "Использование: yarn reference:metrics --reference=<url|dump.json> --local=<url> [--width=390] [--out=<файл.json>]",
    );
    process.exitCode = 2;
    return;
  }

  const result = await compareReference({
    reference,
    local,
    width: Number(arg("width") ?? 390),
    height: Number(arg("height") ?? 844),
  });

  const out = arg("out") ?? join(process.cwd(), "reports", "visual-review", "reference-metrics.json");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(result, null, 2), "utf8");

  const line = (label: string, a: unknown, b: unknown): void => {
    const same = JSON.stringify(a) === JSON.stringify(b);
    const fmt = (value: unknown): string => (Array.isArray(value) ? value.join(", ") : String(value));
    console.log((same ? "  =" : "  ≠") + " " + label);
    console.log("      образец: " + fmt(a));
    console.log("      наш:     " + fmt(b));
  };

  console.log("\nОбразец: " + result.reference.source);
  console.log("Наш:     " + result.local.source + "\n");
  line("высота страницы", result.reference.pageHeight, result.local.pageHeight);
  line("кегли", result.reference.fontSizes, result.local.fontSizes);
  line("веса", result.reference.fontWeights, result.local.fontWeights);
  line("гарнитура (кириллица)", result.reference.familiesCyrillic, result.local.familiesCyrillic);
  line("гарнитура (латиница)", result.reference.familiesLatin, result.local.familiesLatin);
  line("загруженные начертания", result.reference.loadedFaces, result.local.loadedFaces);
  line("цвета текста", result.reference.textColors, result.local.textColors);
  line("фоны", result.reference.backgrounds, result.local.backgrounds);
  line("медиана радиуса", result.reference.medianRadius, result.local.medianRadius);
  line("медиана поля слева", result.reference.medianPaddingLeft, result.local.medianPaddingLeft);

  console.log("\nПрофиль высот. Блоки сопоставлены ПО ПОРЯДКУ следования, а не по смыслу:");
  console.log("Колонка дельты осмысленна, только когда образец — ТА САМАЯ страница, что легла в основу.");
  for (const row of result.outlineDrift) {
    const ref = result.reference.outline[row.index];
    const loc = result.local.outline[row.index];
    const cell = (node?: OutlineRow): string =>
      (node ? String(node.bottom).padStart(5) + " h" + String(node.h).padStart(4) + " " + node.tag : "—").padEnd(22);
    console.log("  " + cell(ref) + " | " + cell(loc) + " | дельта низа " + (row.drift > 0 ? "+" : "") + row.drift);
  }

  const diffs = result.differences;
  console.log("\nРасхождений по признакам: " + diffs.length + (diffs.length ? " (" + diffs.join(", ") + ")" : ""));
  console.log("Отчёт: " + relative(process.cwd(), out));
  console.log("Инструмент измеряет и НЕ выносит вердикта: часть расхождений — намеренные решения продукта.");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
