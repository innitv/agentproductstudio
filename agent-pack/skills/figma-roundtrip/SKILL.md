---
id: figma-roundtrip
name: figma-roundtrip
title: "Figma Roundtrip Quality"
description: "Использовать для выбора reuse/extend/product-specific/bespoke стратегии, создания или обновления Figma design system, Figma canvas write, Figma-to-frontend и frontend-to-Figma передачи. Обеспечивает visual calibration до systemization, Component Contract Matrix, Code Connect/fallback mapping и paired verification."
platforms:
  - codex
mcp_servers:
  - figma
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 06-screens
  - 08-frontend
  - 11-qa
required_inputs:
  - design_brief
  - screens
required_outputs:
  - figma_handoff_bundle
  - frontend_result
  - qa_report
approval_actions:
  - figma_write
validation_commands:
  - yarn validate:config
  - yarn typecheck
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Figma Roundtrip Quality

## Нормативный источник

Перед действием прочитай `integrations/mcp/figma-canvas-write-guide.md`. Не дублируй его полную процедуру в run artifacts.

## Порядок

1. Выбери `design_system_mode`: `reuse|extend|product_specific|bespoke`. Не выбирай `reuse` только из-за доступности библиотеки.
2. Для новой/расширяемой системы выполни `visual_calibration` на 2-3 ключевых экранах до создания большой component matrix.
3. После visual verdict выполни `systemization`: variables/styles, component sets/properties, instances, Auto Layout/resizing и prototype links.
4. Создай Component Contract Matrix для повторяемых и интерактивных компонентов.
5. Используй Code Connect, если доступен; иначе запиши полный fallback mapping и причину недоступности.
6. Для Figma write проверь exact target/approval, загрузи обязательный skill текущего `use_figma` tool и пиши небольшими idempotent patches.
7. Для Figma → frontend передай exact nodes/screenshots, state inventory, contracts и frame/state mapping.
8. Для frontend → Figma классифицируй patch как `token_change|component_api_change|screen_composition_change`; DOM/screenshot import считай только draft/evidence.
9. Проверь structural, visual и behavioral evidence. Visual regression после systemization блокирует `ready`.

## Минимальный output

- выбранный mode и rationale;
- visual calibration verdict/evidence;
- Component Contract Matrix или ссылка на нее;
- Code Connect/fallback status;
- frame/state → route/story/component mapping;
- paired screenshot status;
- deviations с owner/follow-up.
