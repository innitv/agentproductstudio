---
name: ds-to-storybook
description: Использовать для component library, Storybook/state catalog или Figma-driven frontend handoff. Skill создает storybook-result.md с variant/state coverage, Component Contract Matrix mapping и validation evidence.
---

# Design System To Storybook

Skill готовит Storybook или эквивалентный component state catalog. Для обычного frontend он опциональный; для Figma-driven component handoff обязателен Storybook или отдельный state route/catalog. Сопоставляет Figma component/property/value с frontend component/prop и Storybook story/state.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/ds-to-storybook/SKILL.md`](../../../agent-pack/skills/ds-to-storybook/SKILL.md). Следуй ей.**

## Когда использовать
- Нужен component library или Storybook/state catalog.
- Figma-driven component handoff (тогда Storybook или отдельный state route обязателен).
- Нужно зафиксировать Component Contract Matrix mapping с gaps и accepted deviations.
- Этап 08-frontend с variant/state coverage требованиями.

## Ключевые шаги
- Собери inventory компонентов из frontend source, `design-brief.md`, `screens.md`, `STYLE_GUIDE.md`, `figma-handoff-bundle.md` при наличии.
- Сопоставь Figma component/property/value -> frontend component/prop -> Storybook story/state -> test locator; зафиксируй gaps.
- Опиши stories по категориям: forms, async buttons, tabs/toggles, overlays, search/pagination, data visualization.
- Проверь states: default, hover, focus, disabled, loading, error, empty, selected, active.
- Примени motion/a11y checklist из `design-engineering`; запиши `storybook-result.md`.

## Обязательные проверки
- `yarn typecheck`
- `yarn build`
