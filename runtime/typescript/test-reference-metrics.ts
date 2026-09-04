import assert from "node:assert/strict";
import { compareMetrics, type PageMetrics, type TopValue } from "./reference-metrics";

/**
 * Правило сверки с образцом: признак расходится по МНОЖЕСТВУ значений, а не по
 * частотам. Тест заведён вместе с починкой дефекта, из-за которого инструмент
 * шумел ровно в своём основном сценарии — реализация переносит образец на свой
 * контент, число узлов не совпадает, и идентичная типографика помечалась
 * расхождением (замерено на двух страницах с побайтово одинаковым CSS:
 * 4 ложных расхождения из 8, включая кириллическую гарнитуру).
 *
 * Обе половины обязательны: ошибка умеет ИСЧЕЗАТЬ (случай 1) и ошибка умеет
 * ПОЯВЛЯТЬСЯ (случаи 2 и 4) — иначе тест ловит либо всё подряд, либо ничего.
 */

const top = (...pairs: Array<[string, number]>): TopValue[] =>
  pairs.map(([value, count]) => ({ value, count }));

function page(overrides: Partial<PageMetrics> = {}): PageMetrics {
  return {
    source: "test",
    viewport: "390×844",
    pageHeight: 1000,
    nodes: 10,
    shadowHosts: 0,
    fontSizes: top(["16", 4], ["28", 2]),
    fontWeights: top(["400", 4], ["700", 2]),
    familiesCyrillic: top(["Inter", 6]),
    familiesLatin: top(["Inter", 3]),
    loadedFaces: ["Inter 400"],
    textColors: top(["rgb(17, 17, 17)", 6]),
    backgrounds: top(["rgb(255, 255, 255)", 2]),
    medianRadius: 12,
    medianPaddingLeft: 16,
    outline: [
      { y: 0, h: 140, bottom: 140, tag: "div" },
      { y: 152, h: 200, bottom: 352, tag: "div" },
    ],
    ...overrides,
  };
}

// 1. Тот же стиль на другом контенте — основной сценарий инструмента.
// Значения совпадают, частоты и их порядок различаются: расхождений быть не должно.
const sameStyleMoreText = compareMetrics(
  page(),
  page({
    fontSizes: top(["16", 11], ["28", 2]),
    fontWeights: top(["400", 11], ["700", 2]),
    familiesCyrillic: top(["Inter", 13]),
    textColors: top(["rgb(17, 17, 17)", 13]),
  }),
);
assert.deepEqual(
  sameStyleMoreText.differences,
  [],
  "идентичный стиль на другом объёме текста не должен давать расхождений",
);

// 2. Негативный контроль: гарнитура и вправду подменилась — расхождение обязано появиться.
const swappedFamily = compareMetrics(page(), page({ familiesCyrillic: top(["Arial", 6]) }));
assert.deepEqual(swappedFamily.differences, ["гарнитура (кириллица)"]);

// 3. Добавился кегль, которого в образце нет: множество значений шире — это расхождение.
const extraSize = compareMetrics(page(), page({ fontSizes: top(["16", 4], ["28", 2], ["13", 1]) }));
assert.deepEqual(extraSize.differences, ["кегли"]);

// 4. Медианы: 1 px — округление, 4 px — решение.
assert.deepEqual(compareMetrics(page(), page({ medianPaddingLeft: 17 })).differences, []);
assert.deepEqual(compareMetrics(page(), page({ medianPaddingLeft: 20 })).differences, ["медиана поля слева"]);

// 5. Медиана радиуса, снятая только по скруглённым узлам, сравнима с отсутствием скруглений.
assert.deepEqual(compareMetrics(page(), page({ medianRadius: null })).differences, ["медиана радиуса"]);

// 6. Блока нет — дельты нет. Иначе отсутствие блока читалось как «наш выше на 352 px».
const shorterLocal = compareMetrics(page(), page({ outline: [{ y: 0, h: 140, bottom: 140, tag: "div" }] }));
assert.equal(shorterLocal.outlineDrift[1]?.localBottom, null);
assert.equal(shorterLocal.outlineDrift[1]?.drift, null);
assert.equal(shorterLocal.outlineDrift[0]?.drift, 0);

console.log("reference metrics comparison tests passed");
