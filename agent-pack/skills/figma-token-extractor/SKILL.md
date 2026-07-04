---
id: figma-token-extractor
name: figma-token-extractor
title: "Figma Design Token Extractor"
description: "Use when design/frontend work must extract source-backed visual tokens from a Figma file or node into design_brief. Separates read-only token extraction from approval-gated Figma canvas writes, records token evidence, and maps values to CSS variables only when implementation stage allows it."
platforms:
  - open-code
  - claude
mcp_servers:
  - figma
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 08-frontend
required_inputs:
  - recursive_brief
  - run_plan
  - design_brief
required_outputs:
  - design_brief
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Design Token Extractor

## 1. Назначение

Применяй skill, когда workflow содержит Figma URL/file/node id и нужно извлечь visual tokens как evidence для `design-brief.md` или frontend implementation. Canvas write/update является отдельным действием и требует `figma_write` approval.

## 2. Обязательные inputs

- Figma URL, file id или node id из `recursive-brief.md`, `run-plan.md` или `design-brief.md`.
- Цель извлечения: design documentation или frontend implementation.
- Проверка прав и того, какие данные покидают локальный проект.

## 3. Процедура read-only extraction

1. Проверь наличие Figma credentials/MCP и зафиксируй источник токенов.
2. Считай styles, variables или выбранные nodes.
3. Извлеки tokens с исходными evidence fields:
   - token name;
   - value;
   - type: color, typography, spacing, radius, shadow, effect, asset;
   - Figma style/node id;
   - usage context.
4. Сверь с выбранной системой из `design/figma/registry.json`: `design/figma/<selected_design_system_slug>/foundation.md` или legacy `token-map.md`, если файл существует. A3 использовать только при явно выбранном `selected_design_system_slug=a3-design-system`.
5. Запиши результат в `design-brief.md` в секцию `## Visual Direction` или `## Design Tokens`.

## 4. Frontend mapping

На `08-frontend` можно маппить токены в CSS variables, если frontend stage уже разрешен. Не меняй `apps/frontend/src/styles.css` на design stage только ради extraction.

Пример формата в `design-brief.md`:

| Token | Value | Type | Source | Usage |
| --- | --- | --- | --- | --- |
| `--color-primary` | `#005FFC` | color | Figma style/node id | Primary CTA |

## 5. Canvas write gate

Если задача требует создать или обновить Figma canvas, остановись до human approval и `write_allowed=true`. После approval следуй `integrations/mcp/figma-canvas-write-guide.md`.

## 6. Evidence и failure modes

Ставь `partial`, если Figma недоступна, но дизайн можно продолжить с явно помеченными assumptions. Ставь `blocked`, если пользователь требует точного Figma-based implementation, а credentials/node access отсутствуют.

## 7. Validation gates

- [ ] Все ключевые tokens имеют source id или помечены как assumption.
- [ ] `design-brief.md` обновлен таблицей tokens.
- [ ] Figma write не выполнялся без approval.
- [ ] `yarn validate:config` проходит.
