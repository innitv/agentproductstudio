---
description: >-
  Textbook-канон дизайн-систем: что именно правильно, со ссылками на первоисточники
  (M3, DTCG, Style Dictionary, EightShapes, Carbon, Polaris, Figma, WCAG 2.2).
  Три тиера токенов, role-based naming, modes на semantic, покрытие ≥ цвета, DTCG-формат;
  выбор component property (variant/boolean/text/instance-swap/slot) и матрица состояний;
  точные пороги accessibility; порядок секций документации, versioning и статусы;
  визуальная подача DS-файла. Используй при проектировании или ревью дизайн-системы,
  при вопросах «как правильно по канону», «сколько тиеров токенов», «variant или slot»,
  «какой контраст нужен», «как назвать токен», «как версионировать DS», а также перед
  тем как объявить DS готовой. Механика реализации в Figma — соседний skill /figma-ds:build.
  Триггер: канон дизайн-системы, design tokens стандарт, DTCG, три тиера, naming токенов,
  modes vs themes, slots vs variants, WCAG контраст, target size, focus, versioning DS,
  документация дизайн-системы, textbook DS.
---

# Textbook DS standard (нормативный канон)

Цель: система собирается «по учебнику». Ниже — канон, сверенный с первичными источниками. **Как реализовать это в Figma Plugin API — соседний skill `/figma-ds:build`.** Отклонения фиксировать как `deviation` с reason, а не замалчивать.

## 1. Токены — три тиера

- **Три уровня, не два:** `primitive/reference` (сырые context-free значения — полная палитра, ramp) → `semantic/system` (роль/намерение, ссылается на primitive) → `component` (scoped под компонент, ссылается на semantic). Два уровня заставляют либо хардкодить в компонентах, либо перегружать semantic. [M3 design tokens](https://m3.material.io/foundations/design-tokens) · [Style Dictionary](https://styledictionary.com/info/tokens/) · [EightShapes — Design System Tiers](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1)
- **Ссылки только вниз** (component → semantic → primitive); циклы запрещены (DTCG требует ошибку). [DTCG format](https://www.designtokens.org/tr/drafts/format/)
- **Modes — на semantic-слое, не на primitives.** Light/Dark = разные значения semantic-переменных, primitives неизменны. В Figma — collections + modes, semantic aliasʼит primitive. `theme` (бренд) и `domain` — отдельные оси/коллекции, не мешать с mode. *(Терминология: «Figma modes» — light/dark значения переменных; не путать с `design_system_mode` — reuse/extend/product_specific/bespoke — это стратегия выбора DS.)* [Figma — Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) · [Carbon themes](https://carbondesignsystem.com/elements/themes/overview/)
- **Naming:** `namespace → category → concept → property → variant → state (+scale/mode)`. Role-based, НИКОГДА value-based (`color-text-primary`, не `blue-500`/`16px`). Консистентный casing и namespace против коллизий. [EightShapes — Naming tokens](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676) · [Polaris color tokens](https://polaris-react.shopify.com/design/colors/color-tokens)
- **Покрытие ≥ цвета:** spacing (Carbon разделяет component vs layout), typography (токенить оси family/size/weight/line-height/letter-spacing → композитные type-роли), radius, border, elevation/shadow, motion (duration + easing/cubic-bezier), z-index. [DTCG composite types](https://www.designtokens.org/tr/drafts/format/) · [M3 motion tokens](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
- **DTCG-формат** как tool-agnostic источник: `$value`(req)/`$type`/`$description`/`$deprecated`, alias `{group.token}`, композиты (typography/shadow/border/transition). Один JSON → Style Dictionary → CSS/iOS/Android. [DTCG](https://www.designtokens.org/tr/drafts/format/) · [Style Dictionary DTCG](https://styledictionary.com/info/dtcg/)

## 2. Компоненты — API, слоты, состояния, анатомия

- **Выбор property (офиц. Figma):** сначала ревью DS, потом решай. VARIANT — только для реально различного вида/структуры (`style × size × state`); BOOLEAN — видимость слоя; TEXT — редактируемый контент; INSTANCE_SWAP — сменный вложенный instance (+ preferred instances/default); **SLOT** — гибкий контейнер (add/edit/rearrange). Подделывать слоты вариантами — анти-паттерн. [Figma — component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties) · [Figma — slots vs swaps vs variants](https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants)
- **Слоты:** `Convert to slot` / `Wrap in new slot`; default content или «display empty»; «only preferred instances». Ограничения: нельзя применять properties к слоям ВНУТРИ слота; нельзя slot на top-level слой; два слота в варианте не делят один slot property. [Figma — use slots](https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma)
- **Матрица состояний:** `default/hover/focus/pressed/disabled` + `loading/error/selected` где применимо. `default`+`disabled` — почти всегда; `hover/focus/pressed` — для любого интерактивного (focus обязателен по a11y); `loading` — async-действия; `error` — поля ввода; `selected` — toggles/tabs/nav. [M3 interaction states](https://m3.material.io/foundations/interaction-states)
- **Анатомия и имена:** слои названы по anatomy (`Title`, не `Text`); slash-иерархия имён; base/private компоненты с `.`-префиксом; консистентные casing/boolean-phrasing/values свойств. [EightShapes — Component specs](https://medium.com/eightshapes-llc/component-specifications-1492ca4c94c) · [Figma — component management tips](https://help.figma.com/hc/en-us/articles/39747637290263-Components-collection-Tips-for-component-management)

> **Граница осей и оверрайдов (эмпирика, см. `/figma-ds:build`):** ось нужна там, где отличие обязано пережить смену другого варианта — оверрайд инстанса при смене варианта слетает молча. И наоборот: состояние ≠ контент ≠ контекст ≠ геометрия, иначе variant explosion.

## 3. Accessibility (WCAG 2.2 — точные пороги)

- **Контраст текста:** AA ≥ **4.5:1** (крупный ≥18pt/≥14pt-bold — ≥ **3:1**); AAA ≥ **7:1** (крупный ≥ 4.5:1). Не округлять. Исключения: disabled, чистая декорация, логотип/бренд. Каждый цветовой токен документировать с валидными фонами. [SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- **Non-text контраст:** ≥ **3:1** для границ/состояний UI-компонентов, focus/selected-индикаторов и смысловой графики. [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **Focus:** AA — 2.4.7 видимый индикатор + 2.4.11 не перекрыт; AAA target-quality — 2.4.13 (площадь ≥ 2px-периметра, контраст ≥3:1). [SC 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) · [SC 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- **Target size:** AA ≥ **24×24px** (SC 2.5.8); mobile-практика 44–48 (Apple 44pt / Material 48dp). [SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **On-dark / on-brand — ОТДЕЛЬНЫЕ токены, не переиспользовать светлофоновые.** Focus/border на насыщенном брендовом фоне НЕ может быть тем же насыщенным брендовым цветом (сливается, ~1:1) — брать светлый оттенок рампы. Error/status текст и границы на тёмном/брендовом фоне нельзя биндить на `status/*`-токены для светлого фона — они проваливают контраст; нужны on-dark-варианты. Глубокий насыщенный красный на средне-тёмном брендовом фоне часто невозможен (даже 3:1 не проходит) — максимум с проходом текста AA — более светлый красный, либо не полагаться на цвет-на-тёмном (светлый чип/подложка под текстом). Disabled-текст на тёмном тоже легко проваливается — проверять по факту, а не «это же disabled».

## 4. Документация и governance

- **System-уровень:** overview → getting started → principles («почему») → foundations (цвет с usage+контраст, типографика, spacing, tokens+naming) → accessibility → contribution → changelog/versioning → roadmap.
- **Component-уровень (единый порядок секций):** purpose → examples → anatomy → props/API → states → usage (Use-when + Do/Don't) → accessibility → code. Одинаковый порядок и названия во всех компонентах. [EightShapes — Documenting components](https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015)
- **Versioning:** SemVer `Major.Minor.Patch` + changelog с migration; **статусы компонентов** `draft/experimental/stable/deprecated` + status-matrix (design/code/a11y/docs). [Carbon lifecycle](https://carbondesignsystem.com/contributing/product-development-lifecycle/)
- **Adoption:** living docs рядом с работой, contribution как required-шаг, сегментация по аудитории (дизайн/код/PM). [Figma DS 103](https://www.figma.com/blog/design-systems-103-documentation-that-drives-adoption/)

## 5. Definition of «textbook» (что упускает наивная система)

Только 2 тиера · value-based имена · нет осей `state`/`mode` · смешаны theme и mode · покрытие только цвет · modes на primitives · нет namespace · tool-locked JSON вместо DTCG · нет a11y-слоя (контраст/focus/target) · нет versioning/статусов.

Наличие любого пункта → система **не** «по учебнику»; фиксировать как gap, а не игнорировать.

## 6. Presentation — визуальная подача DS-файла

Отвечает за **раскладку** (как показать). Содержание и порядок секций документации — раздел 4 выше (что показать); не переопределять их здесь. DS-файл должен читаться как система, а не как свалка компонентов:

- **Cover-страница файла:** название, версия/статус (`v1 · Draft`), краткое описание, мета (источник/автор/команда/дата/шрифты), оглавление со ссылками на страницы. Титул в бренд-языке продукта.
- **Page-интро** на каждой странице: заголовок + one-line описание назначения.
- **Раскладка документации компонента:** секции из раздела 4 разложить панелями с коротким императивным текстом (default-состояние + `needs_validation` для несобранных).
- **Доковая типо-иерархия и воздух:** page-title > section-label (mono caps) > body-описание > caption. Переиспользовать продуктовые стили; page-heading допустим one-off, чтобы не засорять type-scale.
- **Панели-карточки** (titled auto-layout + тонкий border + радиус) в общем board с крупным gap.

**Status-правило:** Figma DS-deliverable без cover-страницы и документации ключевых компонентов имеет presentation-статус не выше `passed_with_notes`; финальный `ready` требует и presentation-слоя, и visual/structural evidence.

Источники подачи: [Figma Learn — Document your system](https://help.figma.com/hc/en-us/articles/14552804059927-Lesson-4-Document-and-manage-your-system) · [Figma Blog — Design Systems 103: Documentation](https://www.figma.com/blog/design-systems-103-documentation-that-drives-adoption/) · [Simple Design System (Figma Community)](https://www.figma.com/community/file/1380235722331273046/simple-design-system) · [12 Design System Examples — Figma](https://www.figma.com/resource-library/design-system-examples/).
