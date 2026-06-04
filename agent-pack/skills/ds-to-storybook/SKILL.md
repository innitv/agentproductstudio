---
id: ds-to-storybook
name: ds-to-storybook
title: "Design System To Storybook"
description: "Использовать, когда пользователь просит component library или Storybook export из frontend/design system artifacts. Создает storybook-result.md с инвентарем компонентов и validation evidence."
platforms:
  - codex
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
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Design System To Storybook

## Назначение

Готовит optional Storybook/component-library evidence, когда пользователь явно просит UI kit, компонентную библиотеку или handoff.

## Процедура

1. Собери inventory компонентов из frontend source, `design-brief.md`, `screens.md`, `STYLE_GUIDE.md` и `figma-handoff-bundle.md` при наличии.
2. Если есть `figma-handoff-bundle.md`, сопоставь Figma component/component set -> frontend component -> Storybook story. Зафиксируй gaps.
3. Опиши stories по категориям: forms, async buttons, tabs/toggles, overlays, search/pagination, data visualization.
4. Проверь states: default, hover, focus, disabled, loading, error, empty, selected, active.
5. Проверь, что tokens/variables из handoff имеют frontend equivalents или deviations.
6. Применяй motion/a11y checklist из `design-engineering`.
7. Запиши `storybook-result.md` по `agent-pack/artifacts/frontend/storybook-result.template.md`.
