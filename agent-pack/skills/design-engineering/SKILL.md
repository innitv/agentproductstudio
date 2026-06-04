---
id: design-engineering
name: design-engineering
title: "Motion И Interaction Polish"
description: "Использовать на 08-frontend и 11-qa для проверки UI motion, interaction states, easing, reduced motion, focus и hover behavior."
platforms:
  - codex
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 08-frontend
  - 11-qa
required_inputs:
  - design_brief
  - screens
  - prototype_report
  - frontend_result
required_outputs:
  - frontend_result
approval_actions: []
validation_commands:
  - yarn typecheck
  - yarn build
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Motion И Interaction Polish

## Назначение

Проверяет невидимые детали интерфейса: feedback, motion, focus, active states и reduced-motion behavior.

## Порядок Работы

1. Прочитай `design-brief.md`, `screens.md`, `prototype-report.md` и `frontend-result.md`.
2. Если есть `figma-handoff-bundle.md`, проверь, что motion/state rules и component variants не потерялись при переносе в код.
3. Определи критичные user actions: primary CTA, navigation, form submit, modal/open close, selected row/card, filter/sort/search.
4. Проверь каждый action в состояниях default, hover, focus, active/pressed, disabled, loading, error и success.
5. Для визуально значимой UI-задачи проверь desktop/mobile viewport через browser/Playwright screenshots или зафиксируй blocker.

## Checklist

- Не использовать `transition: all`.
- UI-анимации имеют цель и обычно короче 300ms.
- Entry UI motion использует responsive easing, не `ease-in`.
- Не начинать появление интерактивных элементов с `scale(0)`.
- Hover-анимации включать только через `@media (hover: hover) and (pointer: fine)`.
- Transform-based motion имеет `prefers-reduced-motion`.
- Кнопки и pressable elements имеют active feedback.
- Focus states видимы с клавиатуры.
- Disabled/loading/error/empty/success states не ломают layout.
- Частые keyboard actions не получают декоративную анимацию.
- Длинный текст не меняет высоту fixed controls, не выталкивает icons и не создает horizontal overflow.
- Dashboard/console interactions не превращаются в декоративный motion; priority отдается scanability, predictability и repeated-use ergonomics.
- Landing/marketing interactions поддерживают narrative flow, но не скрывают primary CTA и brand/product signal.

## Evidence

Результат проверки фиксируется в `frontend-result.md`, `qa-report.md` или `storybook-result.md` в зависимости от stage.

Минимальная evidence-запись:

- какие critical actions проверены;
- какие viewport checks выполнены;
- где проверены keyboard focus и reduced motion;
- какие deviations от `figma-handoff-bundle.md` или `prototype-report.md` оставлены намеренно;
- какие issues требуют follow-up.
