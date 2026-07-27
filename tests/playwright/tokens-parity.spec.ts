import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Проверяет, что после перевода токенов в DTCG браузер вычисляет те же значения
 * CSS-переменных, что и baseline-снимок блока `:root` из styles.css.
 *
 * Текстовой сверки в `yarn tokens:build` недостаточно: она не видит проблем
 * каскада и порядка `@import`. Здесь значения читаются из реального документа.
 */

type Baseline = { declarations: Array<{ name: string; value: string }> };

const baseline = JSON.parse(
  readFileSync(path.resolve("design/tokens/baseline/styles-root.baseline.json"), "utf8"),
) as Baseline;

const baseMap = new Map(baseline.declarations.map((d) => [d.name, d.value]));

function resolve(value: string, depth = 0): string {
  if (depth > 20) return value;
  const m = value.match(/^var\((--[a-z0-9-]+)(?:,\s*(.+))?\)$/i);
  if (!m) return value;
  const target = baseMap.get(m[1]);
  if (target === undefined) return m[2] ? m[2].trim() : value;
  return resolve(target, depth + 1);
}

/**
 * Приводит цвета и кавычки к общей форме: сравниваем значение, а не запись.
 *
 * Alpha квантуется до 1/255: Lightning CSS в production-сборке сворачивает
 * `rgba(124, 138, 158, 0.15)` в `#7c8a9e26`, где alpha = 38/255 ≈ 0.149.
 * Это поведение минификатора — проверено на сборке из git HEAD до миграции,
 * там ровно те же значения, — а не расхождение токенов.
 */
function canonical(input: string): string {
  const q = (a: number) => Math.round(a * 255);
  let s = input.replace(/\s+/g, " ").trim().toLowerCase();
  // Порядок важен: сначала функциональная запись, затем hex — иначе результат
  // hex-замены был бы повторно обработан правилом для rgba().
  s = s.replace(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/g,
    (_, r: string, g: string, b: string, a?: string) =>
      `rgba(${+r}, ${+g}, ${+b}, ${a === undefined ? 255 : q(parseFloat(a))})`,
  );
  s = s.replace(/#([0-9a-f]{3,8})\b/g, (full, hex: string) => {
    let h = hex;
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return full;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  });
  return s.replace(/["']/g, "");
}

test("вычисленные значения токенов совпадают с baseline", async ({ page }) => {
  await page.goto("/components");
  await page.waitForLoadState("networkidle");

  const names = [...baseMap.keys()];
  const computed = await page.evaluate((vars: string[]) => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(vars.map((v) => [v, style.getPropertyValue(v).trim()]));
  }, names);

  const missing: string[] = [];
  const mismatched: Array<{ name: string; expected: string; actual: string }> = [];

  for (const name of names) {
    const actual = computed[name];
    if (!actual) {
      missing.push(name);
      continue;
    }
    const expected = resolve(baseMap.get(name) as string);
    if (canonical(expected) !== canonical(actual)) {
      mismatched.push({ name, expected, actual });
    }
  }

  expect(missing, `Переменные не определены в документе: ${missing.join(", ")}`).toEqual([]);
  expect(
    mismatched,
    `Значения разошлись с baseline:\n${mismatched
      .map((m) => `  ${m.name}: ожидалось ${m.expected}, получено ${m.actual}`)
      .join("\n")}`,
  ).toEqual([]);
});
