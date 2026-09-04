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

## Когда включается

`design_system_mode = product_specific` или подтверждённый `extend`, требующий
нового foundation.

🔴 **Своя DS — исключение, а не старт.** По решению от 2026-07-27 (`CLAUDE.md`
§6.1) дизайн-система по умолчанию — shadcn/ui. Прежде чем открывать skill,
ответь на два вопроса и запиши ответы в `design-brief.md`:

1. **Закрывается ли задача темой поверх shadcn?** Цвет, гарнитура и кольцо
   фокуса меняются свободно через `design/tokens/shadcn/`; два шрифтовых токена
   дают больше характера, чем два десятка геометрических. Если да — skill не
   применяется, собственный foundation будет дублированием.
2. **Что именно требует нового foundation?** Годится сильный визуальный
   характер продукта или нестандартный интерфейс: редактор, канвас, плотная
   таблица. Не годится «хочется своё», «shadcn выглядит типово» (лечится
   темой), «в реестре нет одного компонента» (пробел дописывается точечно
   поверх библиотечных — известные: `Chip`, `SegmentedControl`, `InputCard` со
   сбросом, уровень `warning` у `Alert`).

Без записанного ответа на оба — `blocked`: собственная DS без обоснования это
отклонение от дефолта, а не нейтральный выбор.

## Главное правило

🔴 **Foundation не строится, пока нет хотя бы одного хорошего экрана.** Токены,
палитра и «семь обязательных компонентов» не выводятся из отраслевого preset —
они извлекаются из утверждённых экранов. Наличие A3 или другой готовой системы
не обязывает её наследовать: ни палитру, ни Inter, ни радиусы.

Отсюда порядок: стратегия → визуальная калибровка на 2-3 экранах → вердикт →
извлечение foundation → инвентарь повторов → систематизация → проверка на
регресс. При вердикте `blocked` компоненты не строятся, сначала чинится
композиция.

## Где живёт foundation

🔴 **Источник правды для токенов — репозиторий, не Figma:** `design/tokens/`
(DTCG), сборка `yarn tokens:build`. Структура — один плоский слой на тему
(`design/tokens/shadcn/<theme>.json`), а не три тиера: канон трёх тиеров из
`/figma-ds:standard` описывает Figma-переменные и здесь не реализован.
Приводить файл к трём тиерам «ради канона» запрещено — это сломает гейт
паритета `yarn tokens:check`.

Figma-переменные — при необходимости зеркало, разовое и в одну сторону;
обратной синхронизации нет. Витрина результата — Storybook (`ds-to-storybook`),
не Figma-страница.

## Чем заканчивается

Статусы: `blocked` — вердикт калибровки отрицательный либо нет approval/target
для write; `partial` — систематизация ухудшила композицию без записи
отклонения; `rejected_needs_redesign` — структурные проверки прошли, но
скриншот выглядит как wireframe, audit board или инвентарь компонентов, а не
как экран продукта.

## Детали

Входы, процедура из девяти шагов, quality gates и чек-лист приёмки —
`references/build-procedure.md`. Нормативный процесс —
`agent-pack/workflows/ds-baseline.workflow.md`; техника записи в Figma —
`/figma-ds:build`, канон — `/figma-ds:standard`; выбор режима — `figma-roundtrip`.
