---
description: "Показывает статус workflow: список активных run и детальное состояние этапов и gates."
argument-hint: "[run-dir]"
allowed-tools: Bash(yarn workflow:list), Bash(yarn workflow:status:*), Read, Glob
---

Ты — оркестратор (главная сессия). Пользователь хочет увидеть статус workflow (триггеры: «покажи статус», «workflow status», «что готово»).

Порядок действий:
- Если `$ARGUMENTS` пуст, выполни `yarn workflow:list`, чтобы показать все активные run (`outputs/<project-slug>/<YYYY-MM-DD>/` и research runs).
- Если в `$ARGUMENTS` передан конкретный run-dir, выполни `yarn workflow:status $ARGUMENTS` для детального состояния этапов, статусов и validation.
- Дополнительно прочитай `stage-gate-ledger.md` и `handoff-bundle.md` этого run, чтобы показать: какие артефакты созданы, какие этапы `complete/partial/blocked`, какие gates не пройдены и какой следующий требуемый артефакт.
- Это read-only команда: ничего не генерируй, не делегируй специалистам и не выполняй внешних действий. Только собери и представь статус.
- В ответе кратко перечисли: что готово, что в работе, какие blockers/gates открыты и рекомендуемый следующий шаг (например `/research`, `/prd`, `/frontend`).
