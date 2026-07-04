---
description: Запускает этап release: делегирует release-субагенту release-notes, validation и deployment/rollback notes.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит подготовить релиз (триггеры: «подготовь релиз», «создай релиз-ноутс», «release now»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Убедись, что QA завершён и validation пройдена. Прочитай `qa-report.md`, `frontend-result.md`, `stage-gate-ledger.md` и `handoff-bundle.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: release`. Цель: собрать `release-notes.md` с changed files, validation результатами, deployment notes и rollback notes.
- Проверь Completion Gate: для полного workflow должна быть Notion research publication record или явный blocker/partial (см. `/notion-publish`). Не возвращай `success`, если Notion-публикация пропущена молча.
- Deploy и git commit/push требуют exact approval — не выполняй их без интерактивного запроса (CLAUDE.md раздел 8). Release-notes могут быть подготовлены без выполнения deploy.
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md` и перечисли, что сделано и какие TODO остались.
