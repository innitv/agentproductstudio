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
  - figma_layout_ir
  - figma_visual_qa
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

Для пользовательских макетов roundtrip работает в Figma Make-like режиме: сначала визуально правдоподобные product screens из текущей DS и референсов, затем systemization и verification. Node IDs, IR, inventory и QA JSON не являются пользовательским результатом.

## Порядок

1. Выбери `design_system_mode`: `reuse|extend|product_specific|bespoke`. Не выбирай `reuse` только из-за доступности библиотеки.
2. Если mode `reuse|extend`, выбери `selected_design_system_slug` из `design/figma/registry.json`. Если нужной ДС нет или индекс `partial|blocked`, сначала используй `figma-ds-ingest`.
3. Для внесенной ДС сначала читай локальный индекс: `ds.config.json`, `foundation.md|token-map.md`, `components.md|component-map.md` и только нужные `components/<category>.md`. Не читай весь Figma файл, если индекс достаточен.
3a. Для `reuse|extend` screen surface должен быть собран из реальных instances выбранной DS. Локальные components допустимы только для отсутствующих product-specific gaps или wrappers вокруг DS instances; они не могут быть основной заменой DS. Если подходящий DS component существует, но агент создает локальный аналог, Figma readiness блокируется.
4. Для новой/расширяемой системы выполни `visual_calibration` на 2-3 ключевых экранах до создания component matrix. Если пользователь просит макеты, эти 2-3 экрана должны быть полноценными UI screens, а не technical mockups.
4a. Для Figma/product UI/prototype surface создай `figma-layout-ir.json` через `figma-screen-compiler` до write: route, zones, layout constraints, copy-fit, component sources, DS honesty и verification contract.
5. После visual verdict выполни `systemization`: variables/styles, component sets/properties, instances, Auto Layout/resizing и prototype links. Systemization не имеет права ухудшать screenshot или превращать UI в техническую схему.
6. Создай Component Contract Matrix для повторяемых и интерактивных компонентов.
7. Используй Code Connect, если доступен; иначе запиши полный fallback mapping и причину недоступности.
8. Для Figma write проверь exact target/approval, загрузи обязательный skill текущего `use_figma` tool и пиши небольшими idempotent patches: сначала настоящие product screens, затем только недостающие component gaps.
8a. После write запусти `visual-layout-verifier` и создай `figma-visual-qa.json`; readiness запрещен без passed/passed_with_notes gate. Passed structural QA не дает readiness, если human-visible screenshot выглядит как technical board, wireframe или audit artifact.
9. Для Figma → frontend передай exact nodes/screenshots, state inventory, contracts и frame/state mapping.
10. Для frontend → Figma классифицируй patch как `token_change|component_api_change|screen_composition_change`; DOM/screenshot import считай только draft/evidence.
11. Проверь structural, visual и behavioral evidence. Visual regression после systemization блокирует `ready`.

## Минимальный output

- выбранный mode и rationale;
- selected design-system slug или reason `none`;
- локальный DS index paths или ingest blocker;
- visual calibration verdict/evidence;
- `figma-layout-ir.json` status;
- Component Contract Matrix или ссылка на нее;
- selected-DS instance evidence count и local wrapper count;
- Code Connect/fallback status;
- frame/state → route/story/component mapping;
- `figma-visual-qa.json` gate result and paired screenshot status;
- deviations с owner/follow-up.

Failure mode: если результат можно описать как "техническая картинка", "маленькие экраны на доске", "компонентная матрица" или "схема use cases", статус должен быть `rejected_needs_redesign`, даже при корректных node IDs и отсутствии clipping.
