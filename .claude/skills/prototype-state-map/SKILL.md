---
name: prototype-state-map
description: Использовать на этапе 07-prototype, чтобы превратить screens и IA в исполняемую спецификацию поведения: transition map, полный state inventory (loading/empty/error/success/permission), alternate и recovery paths, motion spec и test hooks. Skill требует acceptance walkthrough главного сценария и не позволяет начать frontend по набору статичных экранов без описанных состояний и путей восстановления.
---

# Prototype State Map (Карта Состояний И Переходов)

Превращает набор экранов в executable spec поведения. Защищает от ситуации, когда frontend начинается по красивым статичным экранам, а состояния (`loading`, `empty`, `error`, `permission`) додумываются разработчиком на ходу.

**Полная процедура и failure modes — в [`agent-pack/skills/prototype-state-map/SKILL.md`](../../../agent-pack/skills/prototype-state-map/SKILL.md). Следуй ей.** Исполняет Primary App Flow Gate из [`claude-operating-rules.md`](../../../agent-pack/workflows/claude-operating-rules.md) §5.

## Когда использовать
- Этап `07-prototype`, после `screens.md` и до frontend.
- Есть интерактивные сценарии, формы, навигация или обработка ошибок.

## Ключевые шаги
- Primary user/job, trigger, entry point; главный сценарий как transition map от входа до результата.
- Для каждого экрана: вопрос пользователя, primary action, next state, success evidence, error/recovery path.
- State inventory: `loading | empty | error | success | permission/disabled` для всех применимых экранов.
- Alternate и recovery paths: нет данных, упала сеть, доступ запрещён, возврат в середине флоу. Тупик без выхода — дефект спецификации.
- Motion spec, включая `prefers-reduced-motion`; test hooks и analytics events для `10-test-bench`.
- Acceptance walkthrough P0-сценария: не проходит — статус не выше `partial`, сколько бы экранов ни было.

## Обязательные проверки
- `yarn workflow:validate <run-dir>`
