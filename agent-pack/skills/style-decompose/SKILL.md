---
id: style-decompose
name: style-decompose
title: "Декомпозиция Стиля Референса"
description: "Использовать на 04-design для reference-driven или visually risky задач, чтобы превратить визуальный референс в STYLE_GUIDE.md со слоем подачи/рендера, UI-структурой, явными токенами, композиционными метриками и анти-паттернами."
platforms:
  - codex
  - claude
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 04-design
required_inputs:
  - reference_analysis
  - prd
  - ia_brief
required_outputs:
  - style_guide
approval_actions: []
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Декомпозиция Стиля Референса

## Назначение

Применяй skill после `reference-analysis.md`, когда нужно не "вдохновиться" референсом, а разобрать стиль в систему правил для `design-brief.md`, `screens.md`, frontend и QA.

## Процедура

1. Прочитай `reference-analysis.md`, скриншоты/scan evidence и продуктовые артефакты. Если scan evidence отсутствует для reference-driven задачи, верни blocker: нельзя восстанавливать стиль по памяти или старым screenshots.
2. Отдели product intent от visual borrowing: что нужно продукту, что разрешено как паттерн, что запрещено как trade dress.
3. Раздели стиль на два слоя:
   - Layer A: presentation/render: свет, глубина, материал, фон, грейд, hero/media treatment.
   - Layer B: UI structure: сетка, иерархия, компоненты, типографика, цвет, формы, data visualization.
4. Зафиксируй явные composition metrics: типо-шкала, веса, радиусы, отступы, пропорции, edge treatment, shadow/light rules, density, breakpoint logic.
5. Опиши reusable design decisions как tokens/rules, а не как просьбу "сделай красиво".
6. Опиши разрешенные паттерны, запрещенные паттерны и anti-patterns, включая generic/default landing style.
7. Запиши `STYLE_GUIDE.md` по `agent-pack/artifacts/design/style-guide.template.md`.
8. Добавь downstream notes: что обязан прочитать `design-generator`, что обязан проверить frontend, что должен подтвердить QA.

## Gate

`STYLE_GUIDE.md` не заменяет `reference-analysis.md`; он уточняет стиль для downstream stages. Если skill применим, но пропущен, зафиксируй `skipped_with_reason` в `handoff-bundle.md`.

Frontend, Figma write и Storybook export не должны использовать `STYLE_GUIDE.md` как разрешение на копирование референса. Он задает правила адаптации, а не право на pixel-copy.
