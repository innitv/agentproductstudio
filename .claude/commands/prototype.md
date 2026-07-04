---
description: Запускает этап prototype: делегирует prototype-субагенту transition map и инструкции кликабельного прототипа.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит собрать прототип (триггеры: «создай прототип», «сделай transition map», «make prototype»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Убедись, что `screens.md` создан и завершён. Если экранов нет, направь на `/screens`.
- Прочитай `screens.md`, `ia-brief.md`, `design-brief.md` и `handoff-bundle.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: prototype`. Цель: собрать `prototype-report.md` с transition/route map, состояниями `loading|empty|error|success|permission/disabled` и acceptance walkthrough основного сценария.
- Прототип должен проходить Primary App Flow Gate: пользователь может пройти P0-сценарий от входа до результата (CLAUDE.md раздел 7).
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`. Frontend разрешён только после этого этапа.
