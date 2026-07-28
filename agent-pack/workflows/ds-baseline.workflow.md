# Workflow: новая продуктовая дизайн-система

## Назначение

Использовать, когда `design_system_mode=product_specific` или подтвержденный `extend` требует нового foundation. Этот workflow не наследует чужую библиотеку, отраслевые палитры, Inter/Slate, стандартные радиусы или семь «обязательных» компонентов автоматически.

## Входной гейт: почему этот workflow вообще запущен

Умолчание студии — `reuse` shadcn/ui в коде (CLAUDE.md §6.1). Этот workflow **не является дефолтным маршрутом** и запускается только после явного отказа от умолчания.

До первого шага в `design-brief.md` должно быть записано:

- **Что именно не закрывает shadcn/ui.** Не «не подошла по стилю» — цвет, гарнитура и кольцо фокуса в shadcn меняются токенами темы, это не повод собирать систему с нуля. Обоснованием считается сильный визуальный характер продукта или нестандартный интерфейс (редактор, канвас, плотная таблица), где библиотечные примитивы структурно не подходят.
- **Что дешевле сделать через `extend`.** Если не хватает одного-двух компонентов (`Chip`, `SegmentedControl`, `InputCard` со сбросом, уровень `warning` у `Alert`), их дописывают в своём слое рядом с библиотечными, а не заменяют библиотеку.
- **Кто будет поддерживать систему.** Своя DS — это постоянные расходы на состояния, a11y и регрессию, которые у библиотеки уже оплачены.

Если запись отсутствует, запуск фиксируется как `process_deviation`.

## Где живёт результат

Собранная система живёт **в коде**, а не в Figma:

- токены — DTCG в `design/tokens/`, сборка `yarn tokens:build`;
- компоненты — React в `apps/frontend/src/components/`;
- витрина и матрица состояний — истории Storybook;
- приёмка — `yarn vr:test` (только в Docker), `yarn test-storybook`, `yarn qa:mobile`.

Участвует ли Figma, решает **ось `track` в `run-state.json`** (CLAUDE.md §0.3), а не наличие файлов: везде ниже «Figma-маршрут» = `track: figma`, «дефолтный маршрут» = `track: code`. На Figma-маршруте она играет роль дивергентного черновика на `04-design` и разового показа человеку; поддерживать её синхронной с кодом не нужно. Нормативный SOP: `integrations/mcp/figma-canvas-write-guide.md`.

На `track: code` Figma-**артефакты** (`figma-layout-ir.json`, `figma-handoff-bundle.md`, `figma-visual-qa.json`) не создаются и **записи в ledger не требуют вовсе**; `skipped_with_reason: Figma не участвует` писать запрещено. Маршрут-условные **секции** `screens.md`/`frontend-result.md` закрываются строкой `skipped_by_track`. Approval `figma_write` и `yarn figma:audit` на этом маршруте не запрашиваются: approval на запись, которой не будет, — `process_deviation`. Их место занимает Machine Acceptance Gate (`yarn tokens:check`, `yarn test-storybook`, `yarn vr:test`, `yarn qa:mobile`), обязательный на обоих маршрутах. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

## Входы

- product brief, PRD, IA, copy constraints;
- visual evidence plan и reference cards;
- platform, locale, accessibility and brand constraints;
- existing libraries audit;
- маршрут (`track`) из `run-state.json`; на `track: figma` — exact Figma target и approval только перед write.

## Процесс

1. **Strategy**: подтвердить `product_specific`/`extend`, rationale, rejected systems (включая явный отказ от умолчания shadcn/ui с причиной) и boundaries.
2. **Visual calibration**: собрать 2-3 ключевых screens/states без большой component matrix. Проверить composition, density, hierarchy, rhythm, copy fit, long text и responsive direction. Калибровка допускается и в коде (composition story), и в Figma — выбор фиксируется, но Figma не обязательна.
3. **Visual verdict**: `passed|passed_with_notes|blocked`. При `blocked` не строить foundation/components.
4. **Foundation extraction**: извлечь из утвержденных экранов primitive/semantic tokens, typography roles, spacing/radius/effect decisions. Не генерировать их из отраслевого preset.
5. **Pattern inventory**: отметить реальные повторы и оставить уникальные блоки bespoke.
6. **Systemization**: зафиксировать токены как DTCG в `design/tokens/` (`yarn tokens:build`) и собрать компоненты с их состояниями. На Figma-маршруте дополнительно — variables/styles, component sets/properties, nested instances, Auto Layout/resizing и prototype links.
7. **Component Contract Matrix**: связать источник компонента и его свойства с semantic variables, React props, states, stories/tests и deviations. На дефолтном маршруте роль «источника» играет React-компонент и его история, на Figma-маршруте — Figma property.
8. **Regression check**: сравнить calibration и systemized состояние машинно — `yarn vr:test` против эталонов витрины. Systemization не должна ухудшать композицию; «на глаз похоже» проверкой не считается.
9. **Roundtrip handoff**: записать state/variant coverage историй и вердикты приёмки; на Figma-маршруте дополнительно Code Connect/fallback status и frame/state → route/story/component mapping.

## Quality gates

- Нет hardcoded отраслевой палитры или шрифта без evidence/rationale.
- Записан явный отказ от умолчания `reuse` shadcn/ui с конкретным дефицитом, а не общей формулировкой.
- Не создается «универсальный набор компонентов», если он не нужен экранам.
- Каждый компонент новой системы имеет историю Storybook с покрытием применимых состояний; экран — composition story с тегом `vr-page`.
- Токены заведены в `design/tokens/` и собраны `yarn tokens:build`; в компонентах нет сырых значений там, где есть токен.
- Приёмка пройдена машинно: `yarn vr:test` (только внутри Docker-образа Playwright), `yarn test-storybook`, `yarn qa:mobile`; недоступная ось — `skipped_with_reason` и статус не выше `partial`.
- Required states, long copy и min/max поведение проверены.
- На Figma-маршруте: все repeated primitives — instances, detached copies имеют deviation, semantic bindings используются там, где token существует, Figma write выполняется небольшими idempotent patches после exact approval.

## Outputs

- `design-brief.md` с Design System Strategy и обоснованием отказа от умолчания;
- `screens.md` с Component Contract Matrix;
- токены в `design/tokens/` и собранные CSS-переменные;
- истории Storybook на компоненты и экраны + вердикты приёмки (в `frontend-result.md` или `storybook-result.md`);
- `design-loop-report.md` с visual calibration и regression check;
- только для Figma-маршрута — `figma-handoff-bundle.md` с foundation, mappings и verification evidence.
