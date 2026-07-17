---
id: ds-baseline
name: ds-baseline
title: "DS Baseline (Новая Дизайн-Система С Нуля)"
description: "Использовать, когда design_system_mode = product_specific или подтверждённый extend требует нового foundation: продукту нужен самостоятельный визуальный язык, а не наследование существующей библиотеки. Skill ведёт двухпроходную сборку — visual calibration на 2-3 экранах, затем systemization токенов и компонентов — и запрещает генерировать foundation из отраслевого preset вместо утверждённых экранов."
platforms:
  - claude
  - open-code
mcp_servers:
  - figma
strictness_profile: strict
owner_stage_ids:
  - 04-design
  - 06-screens
required_inputs:
  - prd
  - ia_brief
  - design_brief
  - style_guide
required_outputs:
  - design_brief
  - screens
  - design_loop_report
  - figma_handoff_bundle
approval_actions:
  - figma_write
validation_commands:
  - yarn figma:audit
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: DS Baseline (Новая Дизайн-Система С Нуля)

## 1. Назначение

Skill применяется, когда `design_system_mode = product_specific` или подтверждённый `extend` требует нового foundation. Нормативный процесс — [`agent-pack/workflows/ds-baseline.workflow.md`](../../workflows/ds-baseline.workflow.md); техника записи в Figma — skill `/figma-ds:build`, канон DS — `/figma-ds:standard` (плагин `figma-ds`, `plugins/figma-ds/`, раздаётся всем проектам); выбор самого режима — [`figma-roundtrip`](../figma-roundtrip/SKILL.md).

Skill защищает от главной ошибки: **сборки foundation до того, как появился хотя бы один хороший экран.** Токены, палитра и «семь обязательных компонентов» не выводятся из отраслевого preset — они извлекаются из утверждённых экранов. Наличие A3 или другой готовой системы не обязывает её наследовать, и не наследуется автоматически ни палитра, ни Inter/Slate, ни стандартные радиусы.

## 2. Обязательные inputs

- `prd.md`, `ia-brief.md` — что за продукт и какой главный сценарий.
- `design-brief.md` с зафиксированным `design_system_mode`, rationale и отклонёнными системами.
- `STYLE_GUIDE.md` (при reference-driven задаче) — слой подачи и антипаттерны.
- Visual evidence plan и reference cards (см. Universal Visual Evidence Grounding).
- Аудит существующих библиотек: что уже есть и почему не подходит.
- Platform, locale, accessibility и brand constraints.
- Exact Figma target и approval `figma_write` — только перед write.

## 3. Процедура

1. **Strategy.** Подтверди `product_specific`/`extend`, зафиксируй rationale, отклонённые системы и границы. Решение учитывает характер продукта, аудиторию, brand separation, плотность, платформу, срок жизни интерфейса и цену поддержки.
2. **Visual calibration.** Собери 2-3 ключевых экрана или состояния **без** большой component matrix. Проверь композицию, плотность, иерархию, ритм, copy fit, длинный текст и responsive-направление. На этом проходе запрещено систематизировать макет ценой ухудшения композиции.
3. **Visual verdict.** Вынеси вердикт: `passed | passed_with_notes | blocked`. При `blocked` foundation и компоненты **не строятся** — сначала чинится композиция.
4. **Foundation extraction.** Из утверждённых экранов извлеки primitive и semantic токены, typography roles, spacing/radius/effect решения. Не генерируй их из отраслевого preset.
5. **Pattern inventory.** Отметь реальные повторы. Уникальные блоки остаются bespoke — «универсальный набор компонентов» не создаётся, если экранам он не нужен.
6. **Systemization.** Создай variables/styles, component sets и properties, nested instances, Auto Layout/resizing и prototype links. Техника — по `/figma-ds:build` (три уровня токенов, консолидация через properties), канон — `/figma-ds:standard`.
7. **Component Contract Matrix.** Свяжи Figma properties/values с semantic variables, React props, состояниями, stories/tests и deviations.
8. **Regression check.** Сравни screenshots calibration и systemized версий. Systemization не имеет права ухудшить композицию; если изменила — нужен screenshot comparison и deviation record.
9. **Roundtrip handoff.** Запиши Code Connect/fallback status и mapping `frame/state → route/story/component`.

Figma write выполняется небольшими idempotent patches только после exact approval.

## 4. Evidence и failure modes

Обязательные выходы: `design-brief.md` с Design System Strategy; `screens.md` с Component Contract Matrix; `design-loop-report.md` с visual calibration и regression check; `figma-handoff-bundle.md` с foundation, mappings и verification evidence.

Quality gates:

- Нет hardcoded отраслевой палитры или шрифта без evidence и rationale.
- Не создан «универсальный набор компонентов», не нужный экранам.
- Все повторяющиеся primitives — instances; detached-копии имеют deviation.
- Semantic bindings используются там, где токен существует; raw values имеют причину.
- Проверены required states, длинный copy, HUG/FILL/FIXED и min/max поведение.

Failure modes:

- **`blocked`** — visual verdict `blocked`: композиция не готова, foundation строить нельзя. Также при отсутствии approval/target для write.
- **`partial`** — systemization выполнена, но regression check показал ухудшение композиции без deviation record.
- **`rejected_needs_redesign`** — структурные проверки прошли, но screenshot выглядит как wireframe, audit board или component inventory, а не как реальный экран продукта.

## 5. Validation gates

- [ ] `design_system_mode` подтверждён с rationale; отклонённые системы записаны.
- [ ] Visual calibration выполнена на 2-3 экранах **до** создания компонентов; вердикт зафиксирован.
- [ ] Foundation извлечён из утверждённых экранов, а не из отраслевого preset.
- [ ] Component Contract Matrix заполнена; Code Connect status записан.
- [ ] Regression check выполнен: systemization не ухудшила композицию.
- [ ] Approval `figma_write` с exact target получен до write; после write — metadata + screenshot.
- [ ] `yarn figma:audit --registry design/figma/<slug>/component-contracts.json` пройден без `needs_revision`/`blocked` (или зафиксирован deviation).
