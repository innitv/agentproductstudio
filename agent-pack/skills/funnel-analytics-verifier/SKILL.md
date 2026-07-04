---
id: funnel-analytics-verifier
name: funnel-analytics-verifier
title: "Funnel Analytics & PII Verifier"
description: "Use when stage 10-test-bench or 11-qa must verify PRD analytics events, CTA/form funnel behavior, and absence of PII in analytics payloads through Playwright interception or dataLayer checks. Writes test_bench_result and qa_report evidence."
platforms:
  - codex
  - open-code
  - claude
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 10-test-bench
  - 11-qa
required_inputs:
  - prd
  - prototype_report
  - frontend_result
required_outputs:
  - test_bench_result
  - qa_report
approval_actions: []
validation_commands:
  - yarn qa:playwright
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Funnel Analytics & PII Verifier

## 1. Назначение

Применяй skill после frontend implementation, когда нужно проверить главный funnel path, события аналитики из PRD и отсутствие PII в event payloads.

## 2. Обязательные inputs

- `prd.md`: раздел Analytics, event names, triggers, allowed properties.
- `prototype-report.md`: основной пользовательский сценарий.
- `frontend-result.md`: локальный URL/команды запуска и реализованные analytics hooks.

## 3. Процедура

1. Извлеки event contract из PRD: event name, trigger, required properties, allowed properties, prohibited properties, expected destination.
2. Если PRD не задает allowlist, создай минимальную allowlist в `test-bench-result.md` как assumption и пометь проверку `needs_validation`.
3. Покрой Playwright-тестом главный путь: landing view, primary CTA, form open/fill/submit, success/error state.
4. Перехватывай analytics через network interception, mock endpoint или `window.dataLayer`, в зависимости от фактической реализации.
5. Для каждого event проверь:
   - name соответствует PRD;
   - trigger произошел один раз или в ожидаемом количестве;
   - required properties присутствуют;
   - prohibited properties отсутствуют;
   - payload не содержит raw email, phone, password, full name, free-text message или token-like strings.
6. Запусти `yarn qa:playwright`.
7. Запиши результаты в `test-bench-result.md` и, для QA stage, краткое резюме в `qa-report.md`.

## 4. Evidence и failure modes

`test-bench-result.md` обязан содержать таблицу:
- event;
- trigger;
- capture method;
- expected payload;
- actual payload summary without PII;
- status;
- failing assertion или screenshot/link на trace.

Ставь `partial`, если analytics implementation отсутствует, но UI path работает. Ставь `blocked`, если нельзя запустить frontend или проверить основной сценарий.

## 5. Validation gates

- [ ] Все PRD events проверены или явно помечены `not_implemented`.
- [ ] PII denylist применяется ко всем analytics payloads.
- [ ] Основной funnel path покрыт Playwright.
- [ ] `yarn qa:playwright` результат записан в артефакты.
