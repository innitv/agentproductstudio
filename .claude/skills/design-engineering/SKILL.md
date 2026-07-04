---
name: design-engineering
description: Использовать на этапах 08-frontend и 11-qa для проверки UI motion, interaction states, easing, reduced motion, focus и hover behavior. Skill проверяет невидимые детали интерфейса: feedback, motion, focus, active states и reduced-motion поведение.
---

# Motion И Interaction Polish

Skill проверяет невидимые детали интерфейса: feedback, motion, focus, active states и reduced-motion behavior. Применяется, когда UI уже реализован и нужно убедиться, что критичные user actions ведут себя корректно во всех состояниях. Работает поверх `design-brief.md`, `screens.md`, `prototype-report.md` и `frontend-result.md`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/design-engineering/SKILL.md`](../../../agent-pack/skills/design-engineering/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 08-frontend: проверка motion, interaction states и easing после реализации UI.
- Этап 11-qa: финальная проверка focus/hover/active/reduced-motion поведения.
- Есть `figma-handoff-bundle.md` и нужно убедиться, что motion/state rules и component variants не потерялись при переносе в код.
- Нужно проверить Component Contract Matrix: Figma properties/values имеют React prop mapping.

## Ключевые шаги
- Прочитай `design-brief.md`, `screens.md`, `prototype-report.md`, `frontend-result.md`.
- Определи критичные user actions: primary CTA, navigation, form submit, modal open/close, selected row/card, filter/sort/search.
- Проверь каждый action в состояниях default, hover, focus, active/pressed, disabled, loading, error, success.
- Проверь reduced-motion behavior и focus visibility.
- Зафиксируй результат в `frontend-result.md`.

## Обязательные проверки
- `yarn typecheck`
- `yarn build`
