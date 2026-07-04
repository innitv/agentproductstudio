---
description: Запускает этап test bench: делегирует test-bench-субагенту проверку воронки и analytics главного сценария.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит проверить воронку (триггеры: «запусти тест-бенч», «проверь воронку», «run test bench»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Прочитай `prd.md` (analytics events), `prototype-report.md`, `frontend-result.md` и `handoff-bundle.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: test-bench` с задействованием skill `funnel-analytics-verifier`. Цель: собрать `test-bench-result.md` с funnel analytics и результатом проверки главного сценария.
- Проверь PRD analytics events, CTA/form funnel-поведение и отсутствие PII в analytics payloads (Playwright interception или dataLayer checks).
- Test Bench может стартовать как scaffold раньше, но финальный `test-bench-result.md` обязан обновиться после prototype/frontend (CLAUDE.md раздел 5).
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`.
