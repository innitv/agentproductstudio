/**
 * Сборка токенов shadcn/ui в две темы + сверка `default` со снимком реестра.
 *
 * Единственный сборщик токенов проекта: источник — `design/tokens/shadcn/`,
 * запуск — `yarn tokens:build`, проверка актуальности — `yarn tokens:check`.
 *
 * ─── ЧТО ГЕНЕРИРУЕТСЯ ───────────────────────────────────────────────────────
 * Один файл `apps/frontend/src/styles/shadcn/tokens.generated.css`:
 *
 *   1. `@theme inline { --color-*: var(--*) }` — регистрация цветовых имён в
 *      Tailwind 4. Без неё утилит `bg-primary`, `border-border`, `ring-ring`
 *      физически не существует: Tailwind генерирует утилиту, только если имя
 *      объявлено в теме. `inline` обязателен — он подставляет в утилиту саму
 *      ссылку `var(--primary)`, а не фиксированное значение, поэтому цвет
 *      разрешается на элементе и подчиняется каскаду темы.
 *
 *   2. `[data-shadcn-theme="default"]` и `[data-shadcn-theme="branded"]` —
 *      значения переменных. Тема переключается атрибутом на контейнере, копий
 *      компонентов не существует.
 *
 * ─── ПОЧЕМУ РАДИУСЫ, ПЛОТНОСТЬ И ТИПОГРАФИКА НЕ В `@theme` ──────────────────
 * Штатный блок реестра кладёт `--radius-sm|md|lg|xl|2xl|3xl|4xl` в
 * `@theme inline`. Это переопределяет ВСТРОЕННУЮ шкалу Tailwind глобально:
 * `rounded-lg` во всём приложении начинает считаться от `--radius`, то есть
 * подмена доехала бы и до экранов, которые темы не просили.
 *
 * Проверено на собранном CSS: Tailwind 4 компилирует такие утилиты через
 * ссылку на переменную — `.rounded-lg{border-radius:var(--radius-lg)}`,
 * `.px-4{padding-inline:calc(var(--spacing) * 4)}`,
 * `.text-sm{font-size:var(--text-sm)}`. Значит переопределение этих же
 * переменных ВНУТРИ селектора темы работает как обычный каскад, а глобальные
 * дефолты Tailwind остаются на месте. Поэтому группы `shape`, `density`,
 * `typography` пишутся только в блоки тем.
 *
 * ─── ГЕЙТ ПАРИТЕТА ──────────────────────────────────────────────────────────
 * `design/tokens/shadcn/_registry/theme-slate.css` — дословный вывод
 * `shadcn add @shadcn/theme-slate`. Тема `default` обязана совпадать с ним по
 * составу и значениям: иначе «штатный shadcn» в сравнении с `branded`
 * перестал бы быть штатным, и весь замер «сколько правок отделяет дефолт от
 * бренда» потерял бы смысл. Расхождение — ошибка сборки, флага «принять» нет.
 *
 * Запуск: node tooling/shadcn-tokens/build-shadcn-tokens.mjs [--check]
 *   --check — не писать файл, только проверить, что он актуален.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TOKENS_DIR = path.join(ROOT, "design/tokens/shadcn");
const REGISTRY_SNAPSHOT = path.join(TOKENS_DIR, "_registry/theme-slate.css");
const OUTPUT = path.join(ROOT, "apps/frontend/src/styles/shadcn/tokens.generated.css");

/**
 * Порядок тем в выходном файле; первая считается опорной (штатной).
 *
 * `calm` и `calm-typed` — контрольные точки эксперимента «что делает интерфейс
 * визуально качественным: геометрия или шрифт». Они разделяют факторы, которые
 * в `branded` смешаны: `calm` = цвета `branded` + геометрия и плотность
 * `default`; `calm-typed` = `calm` + реально подгруженные гарнитуры. Поэтому
 * пара `branded` ↔ `calm` измеряет вклад геометрии, а пара `calm` ↔ `calm-typed`
 * — вклад гарнитуры. Ни `default`, ни `branded` при этом не меняются: они точки
 * отсчёта, и их правка обесценила бы оба замера.
 */
const THEMES = ["default", "branded", "calm", "calm-typed"];

/**
 * Группы, попадающие в `@theme inline`. Сейчас только `color`: остальные
 * группы переопределяют встроенные переменные Tailwind и обязаны остаться
 * внутри селектора темы (см. шапку файла).
 */
const THEME_INLINE_GROUPS = new Set(["color"]);

const fail = (message) => {
  console.error(`\n[shadcn-tokens] ${message}\n`);
  process.exit(1);
};

/**
 * Разворачивает DTCG-документ в плоский список токенов.
 * Имя CSS-переменной — это ИМЯ ЛИСТА, а не путь: группы (`color`, `shape`,
 * `density`, `typography`) существуют только для чтения человеком, менять из-за
 * них имена переменных нельзя — они заданы контрактом shadcn.
 */
function flatten(document, file) {
  const tokens = [];
  const seen = new Map();

  for (const [group, entries] of Object.entries(document)) {
    if (group.startsWith("$")) continue;
    if (typeof entries !== "object" || entries === null) {
      fail(`${file}: группа "${group}" не является объектом`);
    }

    for (const [name, token] of Object.entries(entries)) {
      if (name.startsWith("$")) continue;
      if (typeof token !== "object" || token === null || !("$value" in token)) {
        fail(`${file}: токен "${group}.${name}" без $value`);
      }
      if (seen.has(name)) {
        fail(`${file}: имя "${name}" встречается дважды — в "${seen.get(name)}" и "${group}"`);
      }

      seen.set(name, group);
      tokens.push({ group, name, value: String(token.$value) });
    }
  }

  return tokens;
}

/** Парсит объявления `--x: value;` из блока, начинающегося с `selector {`. */
function parseBlock(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return null;

  const end = css.indexOf("\n}", start);
  const declarations = new Map();

  for (const line of css.slice(start + selector.length + 2, end).split("\n")) {
    const match = line.trim().match(/^(--[a-z0-9-]+)\s*:\s*(.+);$/i);
    if (match) declarations.set(match[1], match[2].trim());
  }

  return declarations;
}

const normalize = (value) => value.replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------------------
// 1. Чтение тем
// ---------------------------------------------------------------------------

const themes = new Map();

for (const theme of THEMES) {
  const file = path.join(TOKENS_DIR, `${theme}.json`);
  if (!fs.existsSync(file)) fail(`Нет файла темы: ${file}`);
  themes.set(theme, flatten(JSON.parse(fs.readFileSync(file, "utf8")), `${theme}.json`));
}

// Состав переменных обязан совпадать у всех тем. Тема с недостающим токеном
// молча унаследовала бы значение соседней темы через каскад — это выглядело бы
// как «так задумано», хотя это дырка в наборе.
const referenceTheme = THEMES[0];
const referenceNames = themes.get(referenceTheme).map((token) => token.name);

for (const theme of THEMES.slice(1)) {
  const names = themes.get(theme).map((token) => token.name);
  const missing = referenceNames.filter((name) => !names.includes(name));
  const extra = names.filter((name) => !referenceNames.includes(name));

  if (missing.length || extra.length) {
    fail(
      [
        `Состав токенов темы "${theme}" не совпадает с "${referenceTheme}".`,
        missing.length ? `  нет в "${theme}": ${missing.join(", ")}` : "",
        extra.length ? `  лишние в "${theme}": ${extra.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Гейт паритета: default против снимка реестра
// ---------------------------------------------------------------------------

if (!fs.existsSync(REGISTRY_SNAPSHOT)) {
  fail(`Нет снимка реестра: ${REGISTRY_SNAPSHOT}. Без него нечем подтвердить, что "default" штатный.`);
}

const registryRoot = parseBlock(fs.readFileSync(REGISTRY_SNAPSHOT, "utf8"), ":root");
if (!registryRoot) fail(`В ${REGISTRY_SNAPSHOT} нет блока :root`);

const defaultByName = new Map(themes.get("default").map((token) => [`--${token.name}`, token.value]));

const parityMissing = [];
const parityChanged = [];

for (const [name, registryValue] of registryRoot) {
  if (!defaultByName.has(name)) {
    parityMissing.push(name);
    continue;
  }
  if (normalize(defaultByName.get(name)) !== normalize(registryValue)) {
    parityChanged.push({ name, now: defaultByName.get(name), was: registryValue });
  }
}

// Добавленные переменные допустимы: реестр не выдаёт density/typography, их
// объявляет проект. А вот пропажа или подмена значения — недопустимы.
const parityAdded = [...defaultByName.keys()].filter((name) => !registryRoot.has(name));

console.log("— Паритет темы default со снимком реестра —");
console.log(`  переменных в снимке:  ${registryRoot.size}`);
console.log(`  переменных в теме:    ${defaultByName.size}`);
console.log(`  отсутствуют:          ${parityMissing.length}`);
console.log(`  добавлены проектом:   ${parityAdded.length}`);
console.log(`  изменили значение:    ${parityChanged.length}`);

if (parityMissing.length) console.log(`\n  ОТСУТСТВУЮТ:\n    ${parityMissing.join("\n    ")}`);
if (parityChanged.length) {
  console.log("\n  ИЗМЕНЁННЫЕ ЗНАЧЕНИЯ:");
  for (const item of parityChanged) console.log(`    ${item.name}\n      реестр: ${item.was}\n      тема:   ${item.now}`);
}

if (parityMissing.length || parityChanged.length) {
  fail('Тема "default" разошлась со снимком реестра. Штатные значения shadcn правятся только осознанно.');
}

// ---------------------------------------------------------------------------
// 3. Замер дистанций между темами
// ---------------------------------------------------------------------------

/** Список имён токенов, по которым тема `left` расходится с темой `right`. */
function distance(left, right) {
  const rightByName = new Map(themes.get(right).map((token) => [token.name, token]));
  const overridden = [];

  for (const token of themes.get(left)) {
    const counterpart = rightByName.get(token.name);
    if (normalize(counterpart.value) !== normalize(token.value)) {
      overridden.push({ group: token.group, name: token.name });
    }
  }

  return overridden;
}

function reportDistance(title, left, right) {
  const overridden = distance(left, right);
  const byGroup = new Map();
  for (const item of overridden) byGroup.set(item.group, (byGroup.get(item.group) ?? 0) + 1);

  console.log(`\n— ${title} —`);
  console.log(`  всего токенов в теме:   ${referenceNames.length}`);
  console.log(`  расходятся:             ${overridden.length}`);
  for (const [group, count] of [...byGroup].sort()) console.log(`    ${group}: ${count}`);

  return overridden;
}

reportDistance("Дистанция branded от default", "branded", "default");

// Замеры эксперимента. Они не просто печатаются: следующий блок проверяет, что
// разделение факторов не сломано случайной правкой темы.
const geometryDelta = reportDistance("Вклад геометрии: branded ↔ calm", "branded", "calm");
const typographyDelta = reportDistance("Вклад гарнитуры: calm ↔ calm-typed", "calm", "calm-typed");

// ---------------------------------------------------------------------------
// 3a. Гейт чистоты эксперимента
// ---------------------------------------------------------------------------
//
// Весь смысл пары `calm`/`calm-typed` в том, что каждая пара тем отличается
// РОВНО одним фактором. Если в `calm` заедет чужой цвет или в `calm-typed`
// чужой радиус, скриншоты продолжат отличаться, вывод «геометрия против
// шрифта» станет неверным, и заметить это глазами будет невозможно. Поэтому
// разделение проверяется машинно.

const geometryGroups = new Set(["shape", "density", "typography"]);
const colorLeak = geometryDelta.filter((item) => !geometryGroups.has(item.group));

if (colorLeak.length) {
  fail(
    [
      "Темы branded и calm разошлись НЕ ТОЛЬКО по геометрии.",
      `  лишние расхождения: ${colorLeak.map((item) => `${item.group}.${item.name}`).join(", ")}`,
      "calm обязана повторять цвета branded дословно: иначе разница их скриншотов",
      "перестаёт быть замером вклада геометрии.",
    ].join("\n"),
  );
}

// Внутри группы typography геометрию задаёт масштаб (`text-*`, `tracking-*`),
// а гарнитуру — только `font-sans`/`font-mono`. Первая пара обязана расходиться
// по масштабу и совпадать по гарнитуре, вторая — наоборот.
const isFontFamily = (item) => item.name === "font-sans" || item.name === "font-mono";
const familyLeak = geometryDelta.filter(isFontFamily);

if (familyLeak.length) {
  fail(
    [
      "Темы branded и calm разошлись по шрифтовым стекам:",
      `  ${familyLeak.map((item) => item.name).join(", ")}`,
      "calm обязана держать те же стеки, что branded, — иначе замер геометрии",
      "поймает заодно смену гарнитуры.",
    ].join("\n"),
  );
}

const typographyLeak = typographyDelta.filter((item) => !isFontFamily(item));

if (typographyLeak.length) {
  fail(
    [
      "Темы calm и calm-typed разошлись НЕ ТОЛЬКО по гарнитуре.",
      `  лишние расхождения: ${typographyLeak.map((item) => `${item.group}.${item.name}`).join(", ")}`,
      "calm-typed обязана отличаться от calm ровно двумя токенами: font-sans и font-mono.",
    ].join("\n"),
  );
}

if (typographyDelta.length !== 2) {
  fail(
    `calm-typed отличается от calm по ${typographyDelta.length} токенам вместо двух ` +
      "(font-sans, font-mono). Замер вклада гарнитуры перестал быть однофакторным.",
  );
}

console.log("\nOK: разделение факторов сохранено (branded↔calm — только геометрия, calm↔calm-typed — только гарнитура).");

// ---------------------------------------------------------------------------
// 4. Генерация CSS
// ---------------------------------------------------------------------------

const inlineTokens = themes.get(referenceTheme).filter((token) => THEME_INLINE_GROUPS.has(token.group));

const lines = [
  "/*",
  " * СГЕНЕРИРОВАНО tooling/shadcn-tokens/build-shadcn-tokens.mjs — руками не править.",
  ` * Источник: design/tokens/shadcn/{${THEMES.join(",")}}.json`,
  " *",
  " * Тема переключается атрибутом data-shadcn-theme на контейнере; копий",
  " * компонентов под тему не существует.",
  " */",
  "",
  "@theme inline {",
  ...inlineTokens.map((token) => `  --color-${token.name}: var(--${token.name});`),
  "}",
  "",
  "/*",
  " * Канва документа. Атрибут data-shadcn-theme дублируется на <html>, пока",
  " * контейнер темы смонтирован, и это решает сразу две задачи:",
  " *   1) оверлеи Radix и sonner уходят порталом на body — вне контейнера они",
  " *      остались бы без переменных темы, и раскрытый список был бы некрашеным;",
  " *   2) за боксом страницы (overscroll, системные зоны мобильного браузера)",
  " *      виден фон именно html; без этой строки там проступает фон по",
  " *      умолчанию, а не поверхность темы.",
  " * Никакие другие свойства на html не ставятся: тема не должна протекать",
  " * на то, что рендерится вне её контейнера.",
  " */",
  "html[data-shadcn-theme] {",
  "  background-color: var(--background);",
  "}",
  "",
  "/* Текст и шрифт задаёт только КОНТЕЙНЕР темы. */",
  ".shadcn-scope[data-shadcn-theme] {",
  "  background-color: var(--background);",
  "  color: var(--foreground);",
  "  font-family: var(--font-sans);",
  "}",
  "",
];

for (const theme of THEMES) {
  lines.push(`[data-shadcn-theme="${theme}"] {`);

  let currentGroup = null;
  for (const token of themes.get(theme)) {
    if (token.group !== currentGroup) {
      if (currentGroup !== null) lines.push("");
      lines.push(`  /* ${token.group} */`);
      currentGroup = token.group;
    }
    lines.push(`  --${token.name}: ${token.value};`);
  }

  lines.push("}", "");
}

const css = lines.join("\n");

if (process.argv.includes("--check")) {
  const actual = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
  if (actual !== css) {
    fail(`${path.relative(ROOT, OUTPUT)} устарел. Выполни: yarn tokens:build`);
  }
  console.log(`\nOK: ${path.relative(ROOT, OUTPUT)} актуален.`);
} else {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, css, "utf8");
  console.log(`\nOK: записан ${path.relative(ROOT, OUTPUT)} (${css.split("\n").length} строк).`);
}
