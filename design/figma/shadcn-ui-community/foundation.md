# Foundation: shadcn-ui-community

Снято 2026-07-28. Тиеринг фактический: **примитивы** (`tw/*` 1088 переменных, `rdx/colors` 396) → **семантика** (`mode`, 47) → компонентного тира нет.

## Семантический слой — коллекция `mode`

`VariableCollectionId:372:453`, режимы: **`light mode`**, **`dark mode`**. Это единственная коллекция, нужная для сборки: имена совпадают с CSS-переменными shadcn/ui, значения — алиасы на примитивы.

### Цвет

| Переменная | light mode | dark mode |
|---|---|---|
| `background` | → white | → neutral/950 |
| `foreground` | → neutral/950 | → neutral/50 |
| `card` | → white | → neutral/900 |
| `card-foreground` | → neutral/950 | → neutral/50 |
| `popover` | → white | → neutral/800 |
| `popover-foreground` | → neutral/950 | → neutral/50 |
| `primary` | → neutral/900 | → neutral/200 |
| `primary-foreground` | → neutral/50 | → neutral/900 |
| `secondary` | → neutral/100 | → neutral/800 |
| `secondary-foreground` | → neutral/950 | → neutral/50 |
| `muted` | → neutral/100 | → neutral/800 |
| `muted-foreground` | → neutral/500 | → neutral/400 |
| `accent` | → neutral/100 | → neutral/700 |
| `accent-foreground` | → neutral/900 | → neutral/50 |
| `destructive` | → red/600 | → red/400 |
| `border` | → neutral/200 | → neutral/700 |
| `input` | → neutral/200 | → neutral/900 |
| `ring` | → neutral/500 | → neutral/500 |
| `chart-1` … `chart-5` | → blue/8 … blue/12 | те же |
| `sidebar` | → neutral/50 | → neutral/900 |
| `sidebar-foreground` | → neutral/950 | → neutral/50 |
| `sidebar-primary` | → neutral/900 | → blue/10 |
| `sidebar-primary-foreground` | → neutral/50 | → neutral/50 |
| `sidebar-accent` | → neutral/100 | → neutral/800 |
| `sidebar-accent-foreground` | → neutral/900 | → neutral/50 |
| `sidebar-border` | → neutral/200 | → neutral/700 |
| `sidebar-ring` | → neutral/500 | → neutral/500 |

### Радиусы, обводки

| Переменная | Значение (оба режима) |
|---|---|
| `radius-none` | 0 |
| `radius-xs` | 2 |
| `radius-sm` | 6 |
| `radius-md` | 8 |
| `radius-lg` | 10 |
| `radius-xl` | 14 |
| `radius-2xl` | 18 |
| `radius-3xl` | 22 |
| `radius-4xl` | 26 |
| `radius-full` | 9999 |
| `border-width` | 1 |
| `stroke-width` | 2 |

## Сверка с нашим кодом (`design/tokens/shadcn/default.json`)

**Имена семантических токенов совпадают полностью** — 31 цветовой токен shadcn присутствует с точностью до символа (`background`, `foreground`, `card*`, `popover*`, `primary*`, `secondary*`, `muted*`, `accent*`, `destructive`, `border`, `input`, `ring`, `chart-1…5`, `sidebar*`). Это означает, что Figma-макет и наш код говорят на одном языке токенов: при сборке экрана привязка `fills` к переменной `primary` соответствует классу `bg-primary` в коде.

**Радиусы совпадают численно.** У нас `--radius: 0.625rem` (10px) и производные считаются `calc()`: sm 6 / md 8 / lg 10 / xl 14 / 2xl 18 / 3xl 22 / 4xl 26. В библиотеке те же значения заданы напрямую. Расхождений нет.

**Расхождения в значениях цвета — есть, и они существенные:**

| Что | Наш `default` | Библиотека |
|---|---|---|
| Нейтральная база | **slate** (`@shadcn/theme-slate`, снимок в `design/tokens/shadcn/_registry/theme-slate.css`) | **neutral** |
| `chart-1…5` | пять разных оттенков (оранжевый, бирюзовый, тёмно-синий, жёлтый, оранжевый) | монохромная синяя шкала `blue/8…12` |
| `sidebar-primary` (dark) | slate-900 | `blue/10` |

Практически: slate имеет холодный синеватый подтон, neutral — чисто серый. На макете это заметно в фонах и бордерах. **Макет, собранный по этой библиотеке как есть, не будет попиксельно равен нашей теме `default`.** Варианты — раздел «Как это использовать» ниже.

**Чего в библиотеке нет от нашего кода:** тира типографики и density в семантическом слое. У нас `font-sans`/`font-mono`, шкала `text-xs…`, `--spacing: 0.25rem` объявлены явно в `default.json`; в библиотеке шрифтовые примитивы лежат в `tw/font` (47 переменных) без семантических алиасов, а отступы — только примитивами `tw/padding`, `tw/margin`, `tw/gap`, `tw/space`.

**Чего нет в нашем коде от библиотеки** (самодеятельность автора файла, не часть shadcn — не переносить):

- `semantic-background` (#696867 / #272625), `semantic-border` (#898887 / #535151), `semantic-foreground` (→ white) — захардкоженные значения без алиасов;
- `background-color` → black/5.

## Как это использовать

Три режима, выбирать явно на `04-design`:

1. **Reference-only (по умолчанию).** Библиотека — источник анатомии компонентов и композиции; цвета на макете берутся из нашей темы. Расхождение slate/neutral не важно, потому что макет всё равно не является спецификацией цвета — ею является `default.json`.
2. **Собирать макеты прямо в этом файле.** Тогда цвет = neutral, и это надо принять сознательно: код на slate даст другой оттенок. Годится для черновика и обсуждения структуры.
3. **Перекрасить копию под нашу тему.** Переписать 31 значение коллекции `mode` из `default.json` (oklch → RGB) скриптом `use_figma`. Требует `figma_write` approval и отдельной задачи; после — файл перестаёт быть community-копией и становится нашим форком со своей стоимостью поддержки.

## Как вставлять компоненты

**Файл не опубликован как Figma-библиотека** (проверено: `search_design_system` не видит его компонентов, отдаёт чужие подключённые библиотеки). Отсюда два следствия:

- **Внутри этого файла** компонент адресуется **Node ID** — `figma.getNodeByIdAsync("665:2024")` → `.createInstance()`. Все ID в `components.md`. Это работает.
- **Из другого файла импорт по ключу НЕ работает** — проверено экспериментом 2026-07-28, результат ниже.

### Эксперимент: импорт по ключу (2026-07-28)

Проверено в отдельном временном файле (`qLlSX9tKOnOo83gKr5OaI7`, личное пространство) с approval пользователя.

| Источник | Метод | Результат |
|---|---|---|
| Andromeda UI Kit → `Button` (SET, **опубликованная** библиотека) | `importComponentSetByKeyAsync` | **успех**, 24 варианта |
| Andromeda UI Kit → `button_appstore` (**опубликованная**) | `importComponentByKeyAsync` | **успех** |
| shadcn-копия → `Card` | `importComponentByKeyAsync` | `Component with key "…" not found` |
| shadcn-копия → `Badge` (SET) | `importComponentSetByKeyAsync` | `Component set with key "…" not found` |
| shadcn-копия → `Badge` (SET), вторым методом | `importComponentByKeyAsync` | `not found` |

**Негативный контроль пройден:** на опубликованной библиотеке тот же механизм в том же файле работает. Значит дело не в методе, не в правах seat (тест шёл на View/starter) и не в опечатке ключа — **Figma не находит ключи неопубликованного файла снаружи него**. Ключи в `components.md` остаются верными идентификаторами внутри файла и станут рабочими для импорта, если файл опубликуют.

### Что из этого следует для сборки макетов

Два пути, третьего нет:

1. **Собирать внутри файла библиотеки** — работает сейчас, без действий с твоей стороны. Компоненты берутся по Node ID. Цена: макеты живут в справочнике; при обновлении community-оригинала свежую копию нельзя взять, не потеряв макеты; цвет остаётся `neutral`.
2. **Опубликовать копию как библиотеку** — файл лежит в личном пространстве, откуда публиковать нельзя; нужно перенести в команду с платным планом (у пользователя это **A-3**, Full seat, pro) и нажать Publish в интерфейсе Figma. После этого импорт по ключу заработает так же, как в контрольном прогоне с Andromeda, и макеты можно будет собирать в отдельных проектных файлах. Перенос и публикацию делает человек — это действие в интерфейсе, не через MCP.
