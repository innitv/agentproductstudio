# SOP: Figma canvas и roundtrip Figma ↔ frontend

## Назначение

Этот документ — нормативный источник для Figma read/write, создания новой продуктовой дизайн-системы и передачи между Figma и frontend. Старый pseudo-REST формат `action/create_node/payload`, hardcoded Slate/Inter и обязательное наследование A3 запрещены.

**Границы разделов (чтобы не наслаивать):** §1–§9 — workflow, gates, verification, статусы. **§10** — как реализовать в Plugin API `use_figma` (механика + `[verified]`-эмпирика). **§11** — визуальная подача/раскладка файла. **§12** — textbook-канон (что именно правильно: тиеры токенов, naming, modes, component API/slots/states, a11y-пороги, docs/versioning). Правило: §10/§11 не переопределяют §12, а ссылаются на него; при расхождении приоритет у §12.

## 1. Design System Strategy Gate

До генерации зафиксируй один режим:

| Mode | Когда выбирать | Правило |
|---|---|---|
| `reuse` | Существующая система соответствует продукту и бренду | Не дублировать primitives/components |
| `extend` | Foundation подходит, но есть доказанные product gaps | Новые entities имеют gap/reason и совместимый contract |
| `product_specific` | Нужна самостоятельная продуктовая система | Создать новую foundation после visual calibration |
| `bespoke` | Повторяемость мала, уникальная композиция критична | Сначала screens; components только после подтвержденного повтора |

Доступная библиотека не означает автоматический `reuse`. Запиши решение, rejected alternatives и влияние на frontend maintenance в `design-brief.md`, `screens.md` и `figma-handoff-bundle.md`.

## 2. Read path: Figma → context

### 2.1 Local DS index first

Если задача использует существующую дизайн-систему (`reuse|extend`), сначала проверь `design/figma/registry.json`.

- Если `selected_design_system_slug` есть и статус `indexed`, читай локальный индекс:
  - `design/figma/<slug>/ds.config.json`;
  - `foundation.md|token-map.md`;
  - `components.md|component-map.md`;
  - только нужные `components/<category>.md`.
- Не читай весь Figma-файл повторно, если локальный индекс отвечает на вопрос.
- В Figma обращайся только для missing nodes, refresh, screenshot/object verification или approved write.
- Если нужной DS нет в registry или индекс `partial|blocked`, сначала выполни read-only `figma-ds-ingest`.

### 2.2 Exact node context

Для точной реализации используй минимальный exact node scope:

1. Получи structured design context для exact frame/component node.
2. Если контекст слишком большой, сначала получи metadata/object map, затем перечитай только нужные nodes.
3. Получи screenshot того же node/state.
4. Собери inventory: variables/styles, component sets, properties, instances, Auto Layout/resizing, assets, prototype reactions.
5. Не считай screenshot заменой structure/state evidence, а metadata — заменой визуальной проверке.

## 3. Two-pass build

### Pass A — visual calibration

- Собери 2-3 ключевых экрана или состояния.
- Используй same-domain, adjacent и interaction/state references.
- Проверь Primary App Flow Gate: entry point, primary action, next state, success evidence, error/recovery path и walkthrough основного сценария.
- Проверь сценарную иерархию, composition, density, rhythm, copy fit, long text и mobile direction.
- Не создавай большую variant matrix до visual review.
- Зафиксируй screenshots и verdict: `passed|passed_with_notes|blocked`.

### Pass B — systemization

После `passed|passed_with_notes`:

- создай токены-переменные по трём тиерам §12.1 (primitive → semantic → component при необходимости);
- создай text/paint/effect styles там, где это оправдано;
- создай component sets и properties из реально повторяющихся patterns;
- собирай screens из instances, а не копий frames;
- при `reuse|extend` instances должны приходить из выбранной DS (`selected_design_system_slug`) везде, где DS имеет подходящий компонент; локальный component допустим только как product gap или wrapper вокруг DS instances, а не как замена существующего DS компонента;
- настрой Auto Layout, HUG/FILL/FIXED, min/max и wrapping;
- добавь required states и prototype links;
- сравни screenshot до/после, чтобы systemization не ухудшила composition.

## 4. Component Contract Matrix

Для каждого повторяемого/интерактивного компонента запиши:

| Field | Required content |
|---|---|
| Stable component id | Независимый от display name идентификатор |
| Figma source | File/node/component key |
| Figma properties | Property names, allowed values, defaults |
| Variables | Semantic bindings; raw value только с reason |
| Required states | По применимости: default, hover, pressed, focus, disabled, loading, error, success, empty, selected |
| Resize contract | HUG/FILL/FIXED, min/max, long text, icon behavior |
| Frontend target | Import path/component |
| Prop mapping | Figma property → React prop/value |
| Evidence | Story/route, test locator, paired screenshots |
| Deviation | Accepted mismatch, owner, follow-up |

Если Code Connect доступен, опубликуй mapping и запиши URL/status. Если недоступен, matrix остается обязательным fallback.

### 4.1 DS Instance Enforcement

Для `design_system_mode=reuse|extend` Figma surface не считается готовой, если:

- в `figma-layout-ir.json` нет `component_sources[].source_type=design_system_component` для выбранной DS;
- screen-level `components[]` не ссылаются на selected-DS sources;
- object inventory не показывает visible `INSTANCE` nodes с `component_source` или `main_component_id`, совпадающими с выбранной DS;
- локальные wrapper components численно или функционально заменяют selected-DS components без отдельного перехода в `product_specific|bespoke`.

`local_components_with_deviation` — это не waiver. Это только отметка gap/wrapper, которая требует human review и не снимает обязанность использовать реальные selected-DS instances.

## 5. Write path: спецификация/код → Figma

Используй официальный plugin-context `use_figma` или эквивалентный доступный write tool. Перед каждым вызовом загрузи обязательный skill инструмента текущей среды.

Порядок:

1. Проверить auth, editor type, target file/page/node и edit rights.
2. Получить exact approval на target и scope; `write_allowed=true`.
3. Выполнить non-destructive probe/inspection.
4. Искать existing variables/components/libraries.
5. Выполнять небольшие idempotent patches: foundation → components → instances/screens → prototype.
6. После каждого логического блока получать object inventory; после визуально значимого блока — screenshot.
6a. После записи экранов выполнить app-flow walkthrough по созданным frames/prototype links: P0 entry → primary action → next state → success/error path. Без этого Figma surface остается `partial`.
7. Не удалять/перестраивать чужие frames; устаревшие версии помечать `superseded` или скрывать по согласованному scope.

Один огромный генеративный write запрещен для большой component matrix или multi-screen surface.

### 5.1 Multi-agent write safety (single-writer invariant)

Проект — оркестр субагентов, поэтому запись на канвас имеет жёсткие инварианты против гонок (Figma plugin API исполняет команды в одном sandbox; параллельные write от разных агентов ломают состояние):

- **Один writer за раз.** В конкретный Figma file/page пишет ровно один агент/сессия. Оркестратор не запускает два write-субагента на один target параллельно; write-фаза строго последовательна.
- **Explicit `parentId` / target node.** Каждая операция создания/структурного изменения указывает целевой parent явно; нельзя полагаться на «текущую страницу» или неявный контекст выбора — при чередовании агентов он небезопасен.
- **Каждый approval привязан к exact target** (file/page/node + scope). Approval на один target не распространяется на соседний frame или другую страницу.
- **После каждого логического блока — inventory/screenshot** (см. п.6 выше) до следующего write, чтобы следующий шаг опирался на подтверждённое состояние, а не на предположение.

Обоснование паттерна — практика multi-agent Figma-write (command queue, блокировка implicit page context, обязательный `parentId`) из [arinspunk/claude-talk-to-figma-mcp](https://github.com/arinspunk/claude-talk-to-figma-mcp). Мы достигаем той же безопасности через последовательный approval-gated write, а не через серверную очередь.

## 6. Frontend → Figma

Классифицируй изменение:

- `token_change`: обновить versioned token source, затем Figma Variables и CSS variables.
- `component_api_change`: обновить Component Contract Matrix, Code Connect/fallback mapping, Figma properties и frontend stories.
- `screen_composition_change`: приложить browser screenshot/DOM evidence и patch существующих instances; DOM/screenshot import допустим только как draft.

Не синхронизируй каждый DOM node с каждым Figma layer. Source of truth — contracts, states, tokens и accepted composition, а не идентичное дерево.

## 7. Figma → frontend

Перед кодом подготовь implementation packet:

- selected design-system slug и пути локального индекса;
- exact frame/node URLs и screenshots на целевых viewports;
- component/instance inventory;
- variables/styles/assets;
- state matrix и prototype transitions;
- frame/state → route/story/component mapping;
- Component Contract Matrix;
- intentional deviations.

Frontend сначала ищет production component по Code Connect/registry. Новый primitive допустим только с `gap_reason`; локальный bespoke component не должен дублировать уже доступный contract.

## 8. Verification

### Structural evidence

- page/frame/node inventory;
- components/component sets/instances count;
- selected-DS instance count vs local wrapper count;
- no detached instances для repeated primitives;
- variable/style bindings и raw-value deviations;
- Auto Layout/resizing audit;
- Russian Publication Gate.

### Visual evidence

- calibration screenshots;
- before/after systemization comparison;
- paired Figma/browser screenshots для must-cover frames/states;
- desktop/mobile и long-copy checks.

Visual regression после systemization блокирует `ready`, даже если object inventory стал формально полнее.

### Behavioral evidence

- prototype transition или interaction spec;
- Primary App Flow Gate walkthrough для app/prototype/frontend/Figma surface;
- story/state catalog;
- keyboard/focus/disabled/loading/error/success checks;
- Playwright/manual flow evidence.

## 9. Status rules

- `ready/success` запрещен, если выбранный `design_system_mode` не записан.
- `ready/success` запрещен без visual calibration evidence для новой/расширяемой системы.
- Наличие components/variables не компенсирует visual regression.
- Figma write без inventory + screenshot имеет статус не выше `partial`.
- Figma/app surface без Primary App Flow Gate walkthrough имеет статус не выше `partial`.
- Figma-driven frontend без Component Contract Matrix, frame/state mapping и paired screenshots имеет статус не выше `partial`.
- Любой accepted mismatch имеет deviation, owner и follow-up.

## 10. `use_figma` Plugin API — практические правила и подводные камни

Раздел описывает, **как реализовать канон §12 в Plugin API** `use_figma`. «Что» (тиеры/naming/modes/покрытие/состояния/a11y) — нормативно в §12; здесь только механика и `[verified]`-эмпирика против Figma MCP. При расхождении приоритет у §12.

### 10.1 Токены (реализация канона §12.1)
- **Цвета — Variables, не Paint Styles.** Заливки/обводки биндить к переменной: `paint = figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r,g,b}}, "color", variable)`. Paint-style для цвета читается как «покрашено стилями», а не токенами.
- **Три тиера (§12.1), реализация:** коллекции `palette` (primitive) → `color` (semantic) → при необходимости `component` (scoped). Semantic aliasʼит primitive, component aliasʼит semantic: `sem.setValueForMode(mode, figma.variables.createVariableAlias(primitiveVar))`. Ноды биндить к **нижнему применимому** semantic/component-слою, не к primitive. Alpha-варианты — отдельный primitive (alias не меняет alpha).
- **Modes** заводить на semantic-коллекции (не на primitive) для light/dark; для не-цветовых типов — так же на semantic-слое (§12.1).
- **Spacing/radius/border/motion — FLOAT-переменные,** биндить layout-поля: `node.setBoundVariable("itemSpacing"|"paddingLeft"|"strokeRightWeight"|..., floatVar)`. Не хардкодить числа. Покрытие типов и naming — §12.1.
- Типографика — Text Styles (цвет текста — отдельно, variable-bound fill).
- Экспорт в DTCG JSON (§12.1) — как tool-agnostic источник вне Figma.

### 10.2 Компоненты и слоты (реализация канона §12.2)
- **Выбор типа property (VARIANT/BOOLEAN/TEXT/INSTANCE_SWAP/SLOT) — по §12.2.** Ниже — только API-механика их создания. Для гибкого контейнера нужен настоящий **Slot** (§12.2), а не подделка вариантами; `text`+`icon` через свойства — частный случай для лейбла, а не универсальная замена слоту.
- **Не плодить компоненты под контент.** Структурно одинаковые элементы — ОДИН component set + properties (пример лейбла): `type` (VARIANT) + `text` (TEXT) + `showIcon` (BOOLEAN) + `icon` (INSTANCE_SWAP).
- **Иконки — отдельные vector-компоненты** (`createNodeFromSvg` → `createComponentFromNode`); в UI только инстансы. `createNodeFromSvg` отдаёт фрейм с сырой фоновой заливкой — чистить `fills = []`, иначе инстансы потянут сырой цвет.
- **Цвет иконки — НЕ общий текстовый токен.** Stroke иконки в слоте компонента биндить к **component-токену иконки этого варианта** (`button/primary/accent/icon/color/default` = on-accent), а тот — к семантике семейства `icon/*`, НЕ к `text/*`. Бинд к общему `color/ink` / `text/ink` даёт реальный баг: иконка на цветном фоне остаётся тёмной. Цепочка из трёх звеньев и требование завести полный набор `icon/{default|muted|accent|on-accent|danger|success}` — skill `/figma-ds:build`.
- **Слот иконки:** инстанс-плейсхолдер + `showIcon` BOOLEAN → `iconInstance.componentPropertyReferences={visible:boolId}`; `icon` INSTANCE_SWAP → `...={mainComponent:swapId}`; набор через `set.editComponentProperty(iconKey,{preferredValues:[{type:"COMPONENT",key:c.key},...]})`.
- **Проперти:** `id=set.addComponentProperty("text","TEXT","...")`, затем `node.componentPropertyReferences={characters:id}`. Для override инстанса ключ читать с **самого инстанса** (`inst.componentProperties`), не со set-а.
- **Override вложенных инстансов — по прямым детям** (`frame.children.filter(n=>n.type==="INSTANCE")`), НЕ `findAll(INSTANCE)`: вложенные иконки сдвигают индексы. `[verified]`

### 10.3 Организация файла
- Страницы: `Cover` · `Foundations` · `Components` · `Screens`.
- Группировать **titled auto-layout панелями, НЕ Sections:** у `SECTION` сдвиг `.y`/`.x` не двигает содержимое (дети вылезают за рамку). `[verified]`

### 10.4 Подводные камни движка `[verified]`
- **`use_figma` откатывает ВЕСЬ скрипт при любой ошибке** — незавершённый teardown оставляет дубли компонентов. Каждый write делать заведомо безошибочным; после падения проверять, что удаление применилось.
- Не поддерживаются: `figma.loadAllPagesAsync()`; присваивание `figma.currentPage = page` (только `await figma.setCurrentPageAsync(page)`).
- Правильные имена: коллекции — `figma.variables.getLocalVariableCollectionsAsync()`; переменные — `figma.variables.getLocalVariablesAsync("COLOR"|"FLOAT")`.
- Шрифты резолвить `figma.listAvailableFontsAsync()` + `loadFontAsync` до set characters/style. **Georgia в рендере Figma отсутствует** → fallback PT Serif; фиксировать как deviation.

## 11. Presentation / визуальная подача дизайн-системы

§11 отвечает за **визуальную раскладку** DS-файла (как показать). **Содержание и порядок секций документации — в §12.4** (что показать); не переопределять их здесь. DS-файл должен читаться как система, а не как свалка компонентов:

- **Cover-страница файла:** название, версия/статус (`v1 · Draft`), краткое описание, мета (источник/автор/команда/дата/шрифты), оглавление со ссылками на страницы. Титул в бренд-языке продукта.
- **Page-интро** на каждой странице: заголовок + one-line описание назначения.
- **Раскладка документации компонента:** секции из §12.4 разложить панелями с коротким императивным текстом (default-состояние + `needs_validation` для несобранных).
- **Доковая типо-иерархия и воздух:** page-title > section-label (mono caps) > body-описание > caption. Переиспользовать продуктовые стили; page-heading допустим one-off, чтобы не засорять type-scale.
- **Панели-карточки** (titled auto-layout + тонкий border + радиус) в общем board с крупным gap.

Status: Figma DS-deliverable без cover-страницы и документации ключевых компонентов имеет presentation-статус не выше `passed_with_notes`; финальный `ready` требует и presentation-слоя, и visual/structural evidence.

Источники подачи: [Figma Learn — Document your system](https://help.figma.com/hc/en-us/articles/14552804059927-Lesson-4-Document-and-manage-your-system) · [Figma Blog — Design Systems 103: Documentation](https://www.figma.com/blog/design-systems-103-documentation-that-drives-adoption/) · [Simple Design System (Figma Community)](https://www.figma.com/community/file/1380235722331273046/simple-design-system) · [12 Design System Examples — Figma](https://www.figma.com/resource-library/design-system-examples/).

## 12. Textbook DS standard (нормативный канон)

Цель: система собирается «по учебнику». Ниже — канон, сверенный с первичными источниками; §10 описывает, как реализовать это в Plugin API. Отклонения фиксируются как `deviation` с reason.

### 12.1 Токены — три тиера
- **Три уровня, не два:** `primitive/reference` (сырые context-free значения — полная палитра, ramp) → `semantic/system` (роль/намерение, ссылается на primitive) → `component` (scoped под компонент, ссылается на semantic). Два уровня заставляют либо хардкодить в компонентах, либо перегружать semantic. [M3 design tokens](https://m3.material.io/foundations/design-tokens) · [Style Dictionary](https://styledictionary.com/info/tokens/) · [EightShapes — Design System Tiers](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1)
- **Ссылки только вниз** (component → semantic → primitive); циклы запрещены (DTCG требует ошибку). [DTCG format](https://www.designtokens.org/tr/drafts/format/)
- **Modes — на semantic-слое, не на primitives.** Light/Dark = разные значения semantic-переменных, primitives неизменны. В Figma — collections + modes, semantic aliasʼит primitive. `theme` (бренд) и `domain` — отдельные оси/коллекции, не мешать с mode. *(Терминология: «Figma modes» здесь — light/dark значения переменных; не путать с `design_system_mode` из §1 — reuse/extend/product_specific/bespoke — это стратегия выбора DS.)* [Figma — Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) · [Carbon themes](https://carbondesignsystem.com/elements/themes/overview/)
- **Naming:** `namespace → category → concept → property → variant → state (+scale/mode)`. Role-based, НИКОГДА value-based (`color-text-primary`, не `blue-500`/`16px`). Консистентный casing и namespace против коллизий. [EightShapes — Naming tokens](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676) · [Polaris color tokens](https://polaris-react.shopify.com/design/colors/color-tokens)
- **Покрытие ≥ цвета:** spacing (Carbon разделяет component vs layout), typography (токенить оси family/size/weight/line-height/letter-spacing → композитные type-роли), radius, border, elevation/shadow, motion (duration + easing/cubic-bezier), z-index. [DTCG composite types](https://www.designtokens.org/tr/drafts/format/) · [M3 motion tokens](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
- **DTCG-формат** как tool-agnostic источник: `$value`(req)/`$type`/`$description`/`$deprecated`, alias `{group.token}`, композиты (typography/shadow/border/transition). Один JSON → Style Dictionary → CSS/iOS/Android. [DTCG](https://www.designtokens.org/tr/drafts/format/) · [Style Dictionary DTCG](https://styledictionary.com/info/dtcg/)

### 12.2 Компоненты — API, слоты, состояния, анатомия
- **Выбор property (офиц. Figma):** сначала ревью DS, потом решай. VARIANT — только для реально различного вида/структуры (`style × size × state`); BOOLEAN — видимость слоя; TEXT — редактируемый контент; INSTANCE_SWAP — сменный вложенный instance (+ preferred instances/default); **SLOT** — гибкий контейнер (add/edit/rearrange). Подделывать слоты вариантами — анти-паттерн. [Figma — component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties) · [Figma — slots vs swaps vs variants](https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants)
- **Слоты:** `Convert to slot` / `Wrap in new slot`; default content или «display empty»; «only preferred instances». Ограничения: нельзя применять properties к слоям ВНУТРИ слота; нельзя slot на top-level слой; два слота в варианте не делят один slot property. [Figma — use slots](https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma)
- **Матрица состояний:** `default/hover/focus/pressed/disabled` + `loading/error/selected` где применимо. `default`+`disabled` — почти всегда; `hover/focus/pressed` — для любого интерактивного (focus обязателен по a11y); `loading` — async-действия; `error` — поля ввода; `selected` — toggles/tabs/nav. Собранные состояния каждого компонента фиксировать в Component Contract Matrix (§4, поле Required states). [M3 interaction states](https://m3.material.io/foundations/interaction-states)
- **Анатомия и имена:** слои названы по anatomy (`Title`, не `Text`); slash-иерархия имён; base/private компоненты с `.`-префиксом; консистентные casing/boolean-phrasing/values свойств. [EightShapes — Component specs](https://medium.com/eightshapes-llc/component-specifications-1492ca4c94c) · [Figma — component management tips](https://help.figma.com/hc/en-us/articles/39747637290263-Components-collection-Tips-for-component-management)

### 12.3 Accessibility (WCAG 2.2 — точные пороги)
- **Контраст текста:** AA ≥ **4.5:1** (крупный ≥18pt/≥14pt-bold — ≥ **3:1**); AAA ≥ **7:1** (крупный ≥ 4.5:1). Не округлять. Исключения: disabled, чистая декорация, логотип/бренд. Каждый цветовой токен документировать с валидными фонами. [SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- **Non-text контраст:** ≥ **3:1** для границ/состояний UI-компонентов, focus/selected-индикаторов и смысловой графики. [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **Focus:** AA — 2.4.7 видимый индикатор + 2.4.11 не перекрыт; AAA target-quality — 2.4.13 (площадь ≥ 2px-периметра, контраст ≥3:1). [SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) · [SC 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- **Target size:** AA ≥ **24×24px** (SC 2.5.8); mobile-практика 44–48 (Apple 44pt / Material 48dp). [SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### 12.4 Документация и governance
- **System-уровень:** overview → getting started → principles («почему») → foundations (цвет с usage+контраст, типографика, spacing, tokens+naming) → accessibility → contribution → changelog/versioning → roadmap.
- **Component-уровень (единый порядок секций):** purpose → examples → anatomy → props/API → states → usage (Use-when + Do/Don't) → accessibility → code. Одинаковый порядок и названия во всех компонентах. [EightShapes — Documenting components](https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015)
- **Versioning:** SemVer `Major.Minor.Patch` + changelog с migration; **статусы компонентов** `draft/experimental/stable/deprecated` + status-matrix (design/code/a11y/docs). [Carbon lifecycle](https://carbondesignsystem.com/contributing/product-development-lifecycle/)
- **Adoption:** living docs рядом с работой, contribution как required-шаг, сегментация по аудитории (дизайн/код/PM). [Figma DS 103](https://www.figma.com/blog/design-systems-103-documentation-that-drives-adoption/)

### 12.5 Definition of «textbook» (что упускает наивная система)
Только 2 тиера · value-based имена · нет осей `state`/`mode` · смешаны theme и mode · покрытие только цвет · modes на primitives · нет namespace · tool-locked JSON вместо DTCG · нет a11y-слоя (контраст/focus/target) · нет versioning/статусов. Наличие любого пункта → система не «по учебнику»; фиксировать как gap.
