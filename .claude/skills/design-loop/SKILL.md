---
name: design-loop
description: Использовать на этапе 06-screens, когда есть STYLE_GUIDE.md или высокий риск визуального качества. Skill создает design-generator-prompt.md и design-loop-report.md с конкретной критикой в формате "что выглядит дешево и почему" и revision blocks.
---

# Design Prompt И Цикл Критики

Skill превращает `STYLE_GUIDE.md` и продуктовый контекст в точный prompt для генерации или ручной сборки экранов, затем фиксирует критику результата как дизайнерский QA, а не как вкусовую оценку. Применяется на этапе 06-screens при высоком визуальном риске.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/design-loop/SKILL.md`](../../../agent-pack/skills/design-loop/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 06-screens и есть `STYLE_GUIDE.md`.
- Высокий риск визуального качества или generic/default результата.
- Нужен точный design-generator prompt для генерации/ручной сборки экранов.
- Нужна структурированная критика результата с revision blocks.

## Ключевые шаги
- Проверь наличие `STYLE_GUIDE.md`, `design-brief.md`, `ia-brief.md`, `copy-deck.md`; пометь copy gaps, не придумывай финальный copy.
- Собери `design-generator-prompt.md` по шаблону.
- Ограничь первичную генерацию 2-3 экранами как `visual_calibration`.
- Сравни результат с `STYLE_GUIDE.md`: tokens, composition, hierarchy, typography, spacing, interaction states.
- Проведи критику: что generic/default, где нарушена иерархия; зафиксируй в `design-loop-report.md`.

## Обязательные проверки
- `yarn validate:config`
