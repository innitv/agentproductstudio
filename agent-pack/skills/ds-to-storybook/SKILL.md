---
id: ds-to-storybook
name: ds-to-storybook
title: "Design System To Storybook"
description: "Использовать для component library, Storybook/state catalog или Figma-driven frontend handoff. Создает storybook-result.md с variant/state coverage, Component Contract Matrix mapping и validation evidence."
platforms:
  - claude
mcp_servers:
  - playwright
strictness_profile: standard
owner_stage_ids:
  - 08-frontend
required_inputs:
  - frontend_result
  - design_brief
  - screens
required_outputs:
  - storybook_result
approval_actions: []
validation_commands:
  - yarn typecheck
  - yarn build
  - yarn test-storybook
  - yarn vr:test
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Design System To Storybook

## Назначение

Storybook — **основная витрина** product UI студии, а не опциональный слой поверх frontend (решение владельца продукта от 2026-07-27, `CLAUDE.md` §6.1, обоснование — `docs/architecture/storybook-figma-research-2026-07-27.md`). Конфигурация витрины — `apps/frontend/.storybook/`; она подключает `apps/frontend/vite.config.ts` и `apps/frontend/src/styles.css`, поэтому истории рендерятся на тех же токенах, что приложение.

Из этого следуют три правила, отличающие текущий порядок от прежнего Figma-driven:

1. **Экран = composition story = роут приложения — один и тот же код.** Страничная история (`Pages/*`) помечается тегом `vr-page` и снимается целиком в вьюпорте 1280×2000; отдельной «версии для витрины» не бывает. Расхождение витрины и роута — дефект, а не особенность.
2. **Компоненты по умолчанию берутся из shadcn/ui** (`apps/frontend/src/components/shadcn/`, ставятся `yarn shadcn add <component>`). Сторя пишется на тот компонент, который реально стоит в роуте. Собственный компонент в витрине допустим, когда он закрывает подтверждённый пробел реестра (`Chip`, `SegmentedControl`, `InputCard` со сбросом, уровень `warning` у `Alert`) или когда `design_system_mode = product_specific|bespoke` обоснован по Design System Strategy Gate.
3. **Приёмка машинная, а не «посмотрел и похоже».** `yarn test-storybook` гоняет play-функции и a11y; `yarn vr:test` даёт пиксельный вердикт по всем историям в пиннутом Docker-образе. Вердикт читается из `reports/visual-regression/summary.json` (story-id, статус, число различающихся пикселей, пути к `-expected`/`-actual`/`-diff`), а не из текста ошибки.

**Маршрут.** Skill обязателен для `product_ui|frontend` surface на **обоих** маршрутах — витрина и машинная приёмка от маршрута не зависят. Маршрут читается из `run-state.json` (`track`, CLAUDE.md §0.3). На `track: code` Figma не участвует: маршрут-условные Figma-**артефакты** не создаются и записи в ledger **не требуют вовсе**, а маршрут-условные **секции** `frontend-result.md` (`## Design System Implementation`, `## Component Contract Implementation`, `## Frame / State Implementation Map`, `## Figma Visual QA Gate Summary`, `## Figma Roundtrip Deviations`) закрываются строкой `skipped_by_track` в таблице «Секции вне маршрута» `stage-gate-ledger.md`. Писать `skipped_with_reason: Figma не участвует` запрещено. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

## Процедура

1. Собери inventory компонентов из frontend source (`apps/frontend/src/components/`, `apps/frontend/src/views/`), `design-brief.md` и `screens.md`. Для каждого компонента запиши источник: реестр shadcn, собственный слой проекта или пробел без реализации.
2. Проверь, что каждый экран из `screens.md` имеет composition story с тегом `vr-page` и что story рендерит тот же компонент, что и роут. Экран без истории — пробел покрытия, он записывается в `storybook-result.md`, а не замалчивается.
3. Опиши stories по категориям: forms, async buttons, tabs/toggles, overlays, search/pagination, data visualization.
4. Проверь states: default, hover, focus, disabled, loading, error, empty, selected, active. Для интерактивных состояний, которые нельзя снять статикой, пиши play-функцию — она же становится тестом в `yarn test-storybook`.
5. Сверь токены: значения приходят из `design/tokens/` через `yarn tokens:build` (для shadcn-тем — `design/tokens/shadcn/` и `yarn tokens:build`). Сырые hex/px в сторях запрещены — они делают витрину вторым источником правды.
6. Прогони `yarn test-storybook`, затем `yarn vr:test`. Новый эталон снимается только `yarn vr:update` и только внутри Docker: имя снапшота содержит платформу, эталон с Windows-хоста на Linux не сравнивается, а создаёт новый файл — регрессия молча не замечается.
7. Применяй motion/a11y checklist из `design-engineering`; для мобильной поверхности — Mobile Device Acceptance Gate оттуда же (`yarn qa:mobile`).
8. Запиши `storybook-result.md` по `agent-pack/artifacts/frontend/storybook-result.template.md`: покрытие компонентов и экранов, вердикт `yarn test-storybook`, вердикт из `reports/visual-regression/summary.json`, пробелы и accepted deviations.

## Ветвление: Figma-driven handoff

Применяется, только когда `run-state.json` объявляет `track: figma`. **Определять маршрут по наличию `figma-handoff-bundle.md` или `figma-layout-ir.json` запрещено** — Figma-run, не создавший файл, выглядел бы как честный код-маршрут и обошёл бы гейт. Постоянной синхронизации кода и Figma в студии нет — Figma-кит не ведётся.

- Сопоставь Figma component/property/value → frontend component/prop → Storybook story/state → test locator. Зафиксируй gaps и accepted deviations.
- Канон типов property (variant/boolean/text/instance-swap/slot) и матрицы состояний — skill `/figma-ds:standard` (`plugins/figma-ds/skills/standard/SKILL.md`); сверяйся с ним, а не выводи ожидаемый набор из фактической структуры Figma-файла.
- Проверь, что решения из макета доехали до `design/tokens/` как значения токенов, а не остались висеть в коде компонента. Извлечение — разовое, обратной синхронизации не предусмотрено.
- Расхождение с макетом после переноса в код не блокирует витрину: источник правды — код. Расхождение записывается как deviation с причиной.

## Failure modes

- `partial` — витрина собрана, но часть экранов из `screens.md` не имеет composition story, либо `yarn vr:test` не запускался (нет Docker) и это записано явной строкой.
- `blocked` — `yarn test-storybook` или `yarn vr:test` красные и причина не разобрана; либо эталоны обновлены вне Docker (такой baseline недействителен и подлежит перегенерации).
