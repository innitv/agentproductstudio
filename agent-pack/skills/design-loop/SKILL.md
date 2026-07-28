---
id: design-loop
name: design-loop
title: "Design Prompt И Цикл Критики"
description: "Использовать на этапе 06-screens, когда есть STYLE_GUIDE.md или высокий риск визуального качества. Skill создает design-generator-prompt.md и design-loop-report.md с конкретной критикой в формате \"что выглядит дешево и почему\" и revision blocks."
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
3. Ограничь первичную генерацию 2-3 экранами и считай ее `visual_calibration`: проверь композицию, плотность, сценарную иерархию, rhythm, copy fit и responsive direction до systemization. Поверхность калибровки следует маршруту запуска — `track` из `run-state.json` (CLAUDE.md §0.3), а не выбирается по вкусу и не выводится по наличию файлов; выбор записывается в отчёт:
   - **по умолчанию — экран в коде** (`apps/frontend/src/views/`) плюс composition story: критику видно на реальном тексте и реальных состояниях, а результат калибровки не выбрасывается, а становится продуктом. Проверка машинная — `yarn vr:test`, `yarn test-storybook`;
   - **Figma-черновик** — когда направление ещё расходится и нужно дёшево перебрать несколько несовместимых вариантов до кода. Такой черновик по `CLAUDE.md` §6.1 не поддерживается синхронизацией и выбрасывается после переноса решений в `design/tokens/` и код.
4. Сравни результат с `STYLE_GUIDE.md`: tokens, composition metrics, hierarchy, accent usage, typography, spacing, data visualization, interaction states, mobile behavior.
5. Проведи критику как дизайнерский QA, а не как общую вкусовую оценку:
   - что выглядит generic/default;
   - где нарушена предметная иерархия;
   - где референс скопирован слишком буквально;
   - где не хватает states или responsive behavior;
   - где есть visual debt перед Figma/frontend.
6. Запиши `design-loop-report.md` по шаблону `agent-pack/artifacts/design/design-loop-report.template.md`.
7. Критика должна быть таблицей `Before | After | Why`, а не общим "сделай лучше".
8. На `track: figma` добавь calibration verdict и revision notes для `figma-handoff-bundle.md`. На `track: code` вердикт и revision blocks едут в `storybook-result.md` и `frontend-result.md`; Figma-артефакты не создаются и **записи в ledger не требуют вовсе** (`skipped_with_reason: Figma не участвует` писать запрещено), а маршрут-условные **секции** `screens.md`/`frontend-result.md` закрываются строкой `skipped_by_track` в `stage-gate-ledger.md`. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».
9. После создания components/variables сравни результат до/после systemization: для кодовой поверхности — прогоном `yarn vr:test` (машинный вердикт в `reports/visual-regression/summary.json`), для Figma-поверхности — screenshot до/после. Структурно более правильный, но визуально более слабый результат считается regression и блокирует `ready`.

## Gate

Если `design-loop-report.md` показывает unresolved style drift, frontend не должен трактовать дизайн как финально готовый без явного `passed_with_notes` или blocker в handoff.

Для Figma canvas write `design-loop-report.md` должен быть прочитан до `figma-handoff`. Нельзя сначала рисовать canvas, а потом задним числом объяснять стиль.
