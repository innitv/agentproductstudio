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

## 1.1. Preflight: своя DS — исключение, а не старт

По решению от 2026-07-27 (`CLAUDE.md` §6.1) **дизайн-система по умолчанию — shadcn/ui**. Прежде чем открывать этот skill, ответь на два вопроса и запиши ответы в `design-brief.md`:

1. **Закрывается ли задача темой поверх shadcn?** Цвет, гарнитура и кольцо фокуса меняются свободно через `design/tokens/shadcn/` и `yarn tokens:build` — два шрифтовых токена дают больше характера, чем два десятка геометрических. Если да, этот skill не применяется: собственный foundation здесь будет дублированием.
2. **Что именно требует нового foundation?** Допустимые основания: сильный визуальный характер продукта или нестандартный интерфейс (редактор, канвас, плотная таблица). Недопустимые: «хочется своё», «shadcn выглядит типово» (это лечится темой), «в реестре нет одного компонента» (пробел дописывается точечно в своём слое поверх библиотечных — известные пробелы: `Chip`, `SegmentedControl`, `InputCard` со сбросом, уровень `warning` у `Alert`).

Без записанного ответа на оба вопроса skill возвращает `blocked`: собственная DS без обоснования — это отклонение от дефолта, а не нейтральный выбор.

## 1.2. Где живёт foundation

**Источник правды для токенов — репозиторий, не Figma:** `design/tokens/` (DTCG, три тиера), сборка `yarn tokens:build`. Baseline-гейт отклоняет незаявленные изменения значений, поэтому правка значения делается в токенах, а не в компоненте и не в Figma-переменной.

Отсюда порядок для новой системы: извлечённый из экранов foundation записывается в `design/tokens/` и оттуда попадает в код. Figma-переменные — при необходимости зеркало, разовое и в одну сторону; обратной синхронизации нет и не планируется. Витрина результата — Storybook (`ds-to-storybook`), не Figma-страница.

## 2. Обязательные inputs

- `prd.md`, `ia-brief.md` — что за продукт и какой главный сценарий.
- `design-brief.md` с зафиксированным `design_system_mode`, rationale и отклонёнными системами.
- `STYLE_GUIDE.md` (при reference-driven задаче) — слой подачи и антипаттерны.
- Visual evidence plan и reference cards (см. Universal Visual Evidence Grounding).
- Аудит существующих библиотек: что уже есть и почему не подходит.
- Platform, locale, accessibility и brand constraints.
- Exact Figma target и approval `figma_write` — только перед write.

## 3. Процедура

0. **Preflight.** Пройди §1.1: почему тема поверх shadcn задачу не закрывает. Без записанного ответа — `blocked`.
1. **Strategy.** Подтверди `product_specific`/`extend`, зафиксируй rationale, отклонённые системы (shadcn/ui входит в список обязательно) и границы. Решение учитывает характер продукта, аудиторию, brand separation, плотность, платформу, срок жизни интерфейса и цену поддержки.
2. **Visual calibration.** Собери 2-3 ключевых экрана или состояния **без** большой component matrix. Проверь композицию, плотность, иерархию, ритм, copy fit, длинный текст и responsive-направление. На этом проходе запрещено систематизировать макет ценой ухудшения композиции. Поверхность калибровки выбирается по задаче: экран в коде + composition story (дешевле проверить машинно и он же станет результатом) либо Figma-черновик, если направление ещё расходится и ошибиться нужно дёшево до кода.
3. **Visual verdict.** Вынеси вердикт: `passed | passed_with_notes | blocked`. При `blocked` foundation и компоненты **не строятся** — сначала чинится композиция.
4. **Foundation extraction.** Из утверждённых экранов извлеки primitive и semantic токены, typography roles, spacing/radius/effect решения. Не генерируй их из отраслевого preset. Записывай извлечённое в `design/tokens/` (§1.2) и прогоняй `yarn tokens:build`: значение, не прошедшее сборку и baseline-гейт, не является токеном системы.
5. **Pattern inventory.** Отметь реальные повторы. Уникальные блоки остаются bespoke — «универсальный набор компонентов» не создаётся, если экранам он не нужен.
6. **Systemization.** Опиши систему в целевой среде. Для кодовой системы это компоненты + стори состояний в витрине (`ds-to-storybook`) и токены в `design/tokens/`; приёмка — `yarn test-storybook` и `yarn vr:test`. Если систему дополнительно нужно показать в Figma: variables/styles, component sets и properties, nested instances, Auto Layout/resizing и prototype links — техника по `/figma-ds:build` (три уровня токенов, консолидация через properties), канон — `/figma-ds:standard`. Figma-слой не становится вторым источником правды: он собирается из уже принятых токенов.
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

- [ ] Preflight §1.1 пройден: записано, почему тема поверх shadcn задачу не закрывает.
- [ ] `design_system_mode` подтверждён с rationale; отклонённые системы записаны, shadcn/ui среди них.
- [ ] Извлечённый foundation лежит в `design/tokens/` и проходит `yarn tokens:build` с baseline-гейтом.
- [ ] Visual calibration выполнена на 2-3 экранах **до** создания компонентов; вердикт зафиксирован.
- [ ] Foundation извлечён из утверждённых экранов, а не из отраслевого preset.
- [ ] Component Contract Matrix заполнена; Code Connect status записан.
- [ ] Regression check выполнен: systemization не ухудшила композицию.
- [ ] Approval `figma_write` с exact target получен до write; после write — metadata + screenshot.
- [ ] `yarn figma:audit --registry design/figma/<slug>/component-contracts.json` пройден без `needs_revision`/`blocked` (или зафиксирован deviation).
