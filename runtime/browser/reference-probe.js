/*
 * Зонд страницы: измеримые признаки вместо оценки на глаз.
 *
 * ЭТОТ ФАЙЛ ОДНОВРЕМЕННО ИНСТРУМЕНТ И СНИППЕТ. Его инжектит
 * `runtime/typescript/reference-metrics.ts` (`yarn reference:metrics`), и его
 * же вставляют целиком в консоль браузера человека, когда образец не
 * отдаётся гостю: корзина, личный кабинет, оформленный заказ. Второе нужно
 * чаще, чем кажется, — примерно у половины реальных образцов.
 *
 * Обычный JavaScript, а не TypeScript, по технической причине: `tsx`
 * компилирует именованные функции с хелпером `__name`, которого в браузере
 * нет, и `page.evaluate(fn)` падает с `ReferenceError`. Файл на чистом JS
 * инжектится как есть и работает в обеих средах.
 *
 * ── Что снимает и почему именно это ───────────────────────────────────
 *
 *   1. Обход ВКЛЮЧАЕТ `shadowRoot`: контент микрофронтенда иначе не виден
 *      вовсе, и живая страница выглядит пустой.
 *   2. Меряются КОНТЕЙНЕРЫ, а не только текстовые узлы: вид держат рамки,
 *      карточки и разделители, обход по тексту их не видит.
 *   3. Фактическая гарнитура определяется ОТДЕЛЬНО для кириллицы и латиницы:
 *      «шрифт подключён» об этом не говорит, кириллица приходит из
 *      следующего шрифта стека молча.
 *   4. Профиль страницы печатается накопленной координатой низа: совпадение
 *      всех зазоров ничего не доказывает, расхождение копится сверху вниз.
 *
 * ── Как пользоваться в консоли ────────────────────────────────────────
 *
 *   referenceProbe()                      // сводка признаков
 *   referenceProbe({ width: 390 })        // ширина для отбора крупных блоков
 *   copy(JSON.stringify(referenceProbe()))  // забрать дамп для --reference=
 */
(function () {
  const CYRILLIC = /[А-Яа-яЁё]/;
  const LATIN = /[A-Za-z]/;

  function collect(root) {
    const all = [];
    const walk = (node) => {
      all.push(node);
      if (node.shadowRoot) {
        for (const child of Array.from(node.shadowRoot.children)) walk(child);
      }
      for (const child of Array.from(node.children)) walk(child);
    };
    for (const child of Array.from(root.children)) walk(child);
    return all;
  }

  /** Какое семейство ФАКТИЧЕСКИ рисует эту строку: первое из стека, покрывающее её. */
  function actualFamily(stack, size, weight, sample) {
    for (const raw of String(stack).split(",")) {
      const family = raw.trim().replace(/^['"]|['"]$/g, "");
      try {
        if (document.fonts.check(weight + " " + size + 'px "' + family + '"', sample)) return family;
      } catch (error) {
        // Семейство с недопустимым для check именем: пропускаем, а не падаем.
      }
    }
    return null;
  }

  function px(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }

  /**
   * Частые значения признака как `{ value, count }`, по убыванию частоты.
   *
   * Значение и частота лежат РАЗДЕЛЬНО, а не склеены в строку «Arial×4», по
   * причине, которая стоила инструменту его основного сценария. Когда
   * реализация переносит образец на свой контент, число узлов не совпадает
   * никогда: тексты другой длины, абзацев больше. Склеенная строка делает из
   * этого расхождение признака — `Arial×4` против `Arial×7` читается как
   * «другая гарнитура», хотя гарнитура одна. Замерено на двух страницах с
   * побайтово одинаковым CSS: 4 ложных расхождения из 8, включая кириллическую
   * гарнитуру — ровно ту ось, ради которой зонд написан.
   *
   * Сравнивается множество значений (см. `reference-metrics.ts`), частота
   * остаётся справочной: она показывает, что на странице доминирует.
   */
  function top(values, limit) {
    const counts = new Map();
    for (const value of values) {
      const key = String(value);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .slice(0, limit)
      .map((entry) => ({ value: entry[0], count: entry[1] }));
  }

  /** Медиана устойчивее среднего: один огромный блок её не сдвигает. */
  function median(values) {
    if (values.length === 0) return null;
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  window.referenceProbe = function referenceProbe(options) {
    const opts = options || {};
    const width = opts.width || window.innerWidth;
    const root = opts.selector ? document.querySelector(opts.selector) : document.body;
    if (!root) return "узел " + opts.selector + " не найден";

    const all = collect(root);
    const rows = [];

    for (const node of all) {
      const box = node.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) continue;
      const cs = getComputedStyle(node);
      if (cs.visibility === "hidden" || cs.display === "none") continue;

      const ownText = Array.from(node.childNodes)
        .filter((child) => child.nodeType === 3)
        .map((child) => (child.textContent || "").trim())
        .join(" ")
        .slice(0, 60);

      const size = Number.parseFloat(cs.fontSize) || 16;
      let cyrillic = null;
      let latin = null;
      if (ownText) {
        const cyr = ownText.match(/[А-Яа-яЁё][\s\S]{0,10}/);
        const lat = ownText.match(/[A-Za-z][\s\S]{0,10}/);
        if (cyr && CYRILLIC.test(ownText)) cyrillic = actualFamily(cs.fontFamily, size, cs.fontWeight, cyr[0]);
        if (lat && LATIN.test(ownText)) latin = actualFamily(cs.fontFamily, size, cs.fontWeight, lat[0]);
      }

      rows.push({
        tag: node.tagName.toLowerCase(),
        y: Math.round(box.y + window.scrollY),
        h: Math.round(box.height),
        w: Math.round(box.width),
        bottom: Math.round(box.bottom + window.scrollY),
        text: ownText || undefined,
        fontSize: px(cs.fontSize),
        fontWeight: cs.fontWeight,
        color: cs.color,
        background: cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : null,
        radius: px(cs.borderRadius),
        paddingLeft: px(cs.paddingLeft),
        cyrillic: cyrillic,
        latin: latin,
      });
    }

    const withText = rows.filter((row) => row.text);

    const loaded = [];
    document.fonts.forEach((face) => {
      if (face.status === "loaded") loaded.push(face.family + " " + String(face.weight).trim());
    });

    const outline = [];
    for (const row of rows) {
      if (row.w < width * 0.5 || row.h < 40) continue;
      // Обёртки, повторяющие геометрию уже взятого блока, выбрасываются:
      // цепочка body > div > div > section одной высоты забивает профиль.
      const duplicate = outline.some(
        (kept) => Math.abs(kept.y - row.y) <= 2 && Math.abs(kept.h - row.h) <= 2,
      );
      if (duplicate) continue;
      outline.push({
        y: row.y,
        h: row.h,
        bottom: row.bottom,
        tag: row.tag,
        text: row.text ? row.text.slice(0, 24) : undefined,
      });
      if (outline.length >= 24) break;
    }

    return {
      source: location.href.split("?")[0],
      viewport: width + "×" + window.innerHeight,
      pageHeight: Math.round(document.documentElement.scrollHeight),
      nodes: rows.length,
      shadowHosts: all.filter((node) => node.shadowRoot).length,
      fontSizes: top(withText.map((row) => row.fontSize).filter((v) => v !== null), 6),
      fontWeights: top(withText.map((row) => row.fontWeight).filter(Boolean), 5),
      familiesCyrillic: top(withText.map((row) => row.cyrillic).filter(Boolean), 3),
      familiesLatin: top(withText.map((row) => row.latin).filter(Boolean), 3),
      loadedFaces: Array.from(new Set(loaded)).sort(),
      textColors: top(withText.map((row) => row.color).filter(Boolean), 4),
      backgrounds: top(rows.map((row) => row.background).filter(Boolean), 4),
      // Только скруглённые узлы: на любой странице большинство блоков имеет
      // радиус 0, и медиана по всем узлам вырождается в 0 у обеих сторон —
      // ось есть в отчёте, а измеряет пустоту (проверено на странице, где обе
      // карточки скруглены на 12px, а медиана показала 0 = 0).
      medianRadius: median(rows.map((row) => row.radius).filter((v) => v !== null && v > 0 && v < 100)),
      medianPaddingLeft: median(rows.map((row) => row.paddingLeft).filter((v) => v !== null && v > 0)),
      outline: outline,
    };
  };

  return "referenceProbe() готов";
})();
