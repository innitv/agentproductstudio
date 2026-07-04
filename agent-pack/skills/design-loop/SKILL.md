---
id: design-loop
name: design-loop
title: "Design Prompt И Цикл Критики"
description: "Использовать на 06-screens, когда есть STYLE_GUIDE.md или высокий риск визуального качества. Создает design-generator-prompt.md и design-loop-report.md с конкретной критикой и revision blocks."
platforms:
  - claude
mcp_servers: []
strictness_profile: strict
owner_stage_ids:
  - 06-screens
required_inputs:
  - style_guide
  - design_brief
  - ia_brief
  - copy_deck
required_outputs:
  - design_generator_prompt
  - design_loop_report
approval_actions: []
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Design Prompt И Цикл Критики

## Назначение

Превращает `STYLE_GUIDE.md` и продуктовый контекст в точный prompt для генерации/ручной сборки экранов, затем фиксирует критику результата в формате "что выглядит дешево и почему".

## Процедура

1. Убедись, что есть `STYLE_GUIDE.md`, `design-brief.md`, `ia-brief.md` и `copy-deck.md`. Если `copy-deck.md` отсутствует, не придумывай финальный copy; пометь copy gaps.
2. Собери `design-generator-prompt.md` по шаблону `agent-pack/artifacts/design/design-generator-prompt.template.md`.
3. Ограничь первичную генерацию 2-3 экранами и считай ее `visual_calibration`: проверь композицию, плотность, сценарную иерархию, rhythm, copy fit и responsive direction до systemization.
4. Сравни результат с `STYLE_GUIDE.md`: tokens, composition metrics, hierarchy, accent usage, typography, spacing, data visualization, interaction states, mobile behavior.
5. Проведи критику как дизайнерский QA, а не как общую вкусовую оценку:
   - что выглядит generic/default;
   - где нарушена предметная иерархия;
   - где референс скопирован слишком буквально;
   - где не хватает states или responsive behavior;
   - где есть visual debt перед Figma/frontend.
6. Запиши `design-loop-report.md` по шаблону `agent-pack/artifacts/design/design-loop-report.template.md`.
7. Критика должна быть таблицей `Before | After | Why`, а не общим "сделай лучше".
8. Если результат уходит в Figma, добавь calibration verdict и revision notes для `figma-handoff-bundle.md`.
9. После создания components/variables сравни screenshot до/после systemization. Структурно более правильный, но визуально более слабый результат считается regression и блокирует `ready`.

## Gate

Если `design-loop-report.md` показывает unresolved style drift, frontend не должен трактовать дизайн как финально готовый без явного `passed_with_notes` или blocker в handoff.

Для Figma canvas write `design-loop-report.md` должен быть прочитан до `figma-handoff`. Нельзя сначала рисовать canvas, а потом задним числом объяснять стиль.
