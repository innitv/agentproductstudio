---
name: ds-to-storybook
description: Использовать для component library, Storybook/state catalog или Figma-driven frontend handoff. Создает storybook-result.md с variant/state coverage, Component Contract Matrix mapping и validation evidence.
---

# Design System To Storybook

Storybook — **основная витрина** product UI студии, а не опциональный слой поверх frontend (`CLAUDE.md` §6.1). Экран = composition story = роут приложения, один и тот же код. Приёмка машинная.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/ds-to-storybook/SKILL.md`](../../../agent-pack/skills/ds-to-storybook/SKILL.md). Следуй ей.**

## Когда использовать
- Реализован или изменён product UI: витрина обязательна, а не опциональна.
- Нужен каталог состояний компонентов и экранов.
- Figma-driven component handoff — отдельное ветвление, применяется только на маршруте `track: figma` из `run-state.json` (CLAUDE.md §0.3). Определять маршрут по наличию `figma-handoff-bundle.md` запрещено.
- Сам skill обязателен для `product_ui|frontend` на **обоих** маршрутах. На `track: code` Figma-артефакты не создаются и записи в ledger не требуют; маршрут-условные секции `frontend-result.md` закрываются строкой `skipped_by_track` в `stage-gate-ledger.md`, а `skipped_with_reason: Figma не участвует` писать запрещено.

## Ключевые шаги
- Собери inventory из frontend source (`apps/frontend/src/components/`, `apps/frontend/src/views/`), `design-brief.md`, `screens.md`; источник каждого компонента — реестр shadcn, свой слой или пробел.
- Каждый экран из `screens.md` получает composition story с тегом `vr-page`, рендерящую тот же компонент, что и роут.
- Компоненты по умолчанию — shadcn/ui (`apps/frontend/src/components/shadcn/`, `yarn shadcn add <component>`); свой компонент — только на подтверждённый пробел реестра или обоснованный `product_specific|bespoke`.
- Проверь states: default, hover, focus, disabled, loading, error, empty, selected, active; интерактивные — play-функцией.
- Значения только из токенов (`design/tokens/`, `yarn tokens:build`); сырые hex/px в сторях запрещены.
- Прогони `yarn test-storybook` и `yarn vr:test`; вердикт читай из `reports/visual-regression/summary.json`. Эталоны обновляются только `yarn vr:update` внутри Docker.
- Примени motion/a11y checklist из `design-engineering`; запиши `storybook-result.md`.

## Обязательные проверки
- `yarn typecheck`
- `yarn build`
- `yarn test-storybook`
- `yarn vr:test`
