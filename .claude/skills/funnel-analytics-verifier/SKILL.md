---
name: funnel-analytics-verifier
description: Использовать, когда на этапе 10-test-bench или 11-qa нужно проверить PRD analytics events, CTA/form funnel поведение и отсутствие PII в analytics payloads через Playwright interception или dataLayer checks. Skill пишет test-bench-result и qa-report evidence.
---

# Funnel Analytics & PII Verifier

Skill проверяет главный funnel path, события аналитики из PRD и отсутствие PII в event payloads. Применяется после frontend implementation. Использует Playwright network interception, mock endpoint или `window.dataLayer` в зависимости от реализации.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/funnel-analytics-verifier/SKILL.md`](../../../agent-pack/skills/funnel-analytics-verifier/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 10-test-bench или 11-qa после frontend implementation.
- Нужно проверить analytics events из PRD (name, trigger, properties).
- Нужно проверить CTA/form funnel поведение end-to-end.
- Нужно убедиться в отсутствии PII в analytics payloads.

## Ключевые шаги
- Извлеки event contract из PRD: name, trigger, required/allowed/prohibited properties, destination.
- Если PRD не задает allowlist, создай минимальный allowlist как assumption и пометь `needs_validation`.
- Покрой Playwright-тестом главный путь: landing view, primary CTA, form open/fill/submit, success/error.
- Перехватывай analytics через network interception, mock endpoint или `window.dataLayer`.
- Проверь отсутствие PII; запиши `test-bench-result.md` и `qa-report.md`.

## Обязательные проверки
- `yarn qa:playwright`
