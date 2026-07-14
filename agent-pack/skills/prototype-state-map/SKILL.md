---
id: prototype-state-map
name: prototype-state-map
title: "Prototype State Map (Карта Состояний И Переходов)"
description: "Использовать на этапе 07-prototype, чтобы превратить screens и IA в исполняемую спецификацию поведения: transition map, полный state inventory (loading/empty/error/success/permission), alternate и recovery paths, motion spec и test hooks. Skill требует acceptance walkthrough главного сценария и не позволяет начать frontend по набору статичных экранов без описанных состояний и путей восстановления."
platforms:
  - claude
  - open-code
mcp_servers: []
strictness_profile: standard
owner_stage_ids:
  - 07-prototype
required_inputs:
  - screens
  - ia_brief
  - copy_deck
required_outputs:
  - prototype_report
approval_actions: []
validation_commands:
  - yarn workflow:validate
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Prototype State Map (Карта Состояний И Переходов)

## 1. Назначение

Skill применяется на `07-prototype` — между screens и frontend. Он превращает набор экранов в executable spec поведения: что происходит после нажатия, что видит пользователь, пока идёт загрузка, и куда он попадает, когда всё сломалось.

Главная ошибка, от которой он защищает: frontend начинается по красивым статичным экранам, а состояния (`loading`, `empty`, `error`, `permission`) додумываются разработчиком на ходу — и появляются вразнобой.

Skill исполняет **Primary App Flow Gate** из [`claude-operating-rules.md`](../../workflows/claude-operating-rules.md) раздел 5.

## 2. Обязательные inputs

- `screens.md` — спецификация экранов с компонентами и copy.
- `ia-brief.md` — sitemap, primary user flow, главный экран и главное действие.
- `copy-deck.md` — тексты, включая тексты ошибок и пустых состояний.
- `prd.md` — acceptance criteria и analytics events, которые прототип обязан поддержать.

## 3. Процедура

1. **Primary flow.** Зафиксируй: primary user/job, trigger, entry point. Опиши главный сценарий как route/transition map от входа до результата.
2. **Для каждого экрана** запиши: вопрос пользователя на этом шаге, primary action, next state, success/completion evidence, error/recovery path.
3. **State inventory.** Для каждого экрана перечисли применимые состояния: `loading`, `empty`, `error`, `success`, `permission/disabled`. Состояние, которое применимо, но не описано, — это дыра, которую закроет случайное решение во frontend.
4. **Alternate и recovery paths.** Что делает пользователь, когда: данных нет, сеть упала, доступ запрещён, операция отклонена, он вернулся назад в середине флоу. Тупик без выхода — это дефект спецификации.
5. **Secondary entry/exit points.** Как пользователь попадает в флоу не с главной точки (deep link, возврат, уведомление).
6. **Motion spec.** Переходы, длительности, easing, и что происходит при `prefers-reduced-motion`. Детали проверяются skill'ом [`design-engineering`](../design-engineering/SKILL.md) на `08-frontend`.
7. **Test hooks.** Locators/test ids и analytics events для каждого ключевого действия — чтобы `10-test-bench` мог проверить воронку, а не изобретать селекторы.
8. **Acceptance walkthrough.** Пошагово пройди главный сценарий по карте: пользователь входит → действует → получает результат. Если P0-сценарий не проходит walkthrough, поверхность получает статус не выше `partial`, даже если экранов много и они хорошо оформлены.
9. **Frontend handoff contract.** Зафиксируй, что frontend обязан реализовать: маршруты, состояния, переходы, обработку ошибок.

## 4. Evidence и failure modes

Evidence: `prototype-report.md` с transition map, state inventory по экранам, alternate/recovery paths, motion spec, test hooks и результатом acceptance walkthrough.

- **`partial`** — P0-сценарий не проходит acceptance walkthrough, или применимые состояния описаны не для всех экранов.
- **`blocked`** — нет `screens.md` или `ia-brief.md`: прототип не строится по догадкам о том, какие экраны существуют.
- **Нарушение** — frontend начат до `prototype-report.md` (кроме явного `quick draft`).

## 5. Validation gates

- [ ] Primary user/job, trigger и entry point зафиксированы.
- [ ] Главный сценарий описан как transition map от входа до результата.
- [ ] Для каждого экрана: вопрос пользователя, primary action, next state, success evidence, error/recovery path.
- [ ] State inventory покрывает применимые `loading|empty|error|success|permission/disabled`.
- [ ] Alternate и recovery paths описаны; тупиков без выхода нет.
- [ ] Motion spec включает поведение при `prefers-reduced-motion`.
- [ ] Test hooks и analytics events описаны для ключевых действий.
- [ ] Acceptance walkthrough пройден для P0-сценария.
