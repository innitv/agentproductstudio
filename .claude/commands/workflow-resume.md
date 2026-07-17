---
description: "Продолжает начатый run с последнего завершённого этапа, соблюдая dependency order и gates."
argument-hint: "[run-dir]"
---

Ты — оркестратор (главная сессия). Пользователь хочет продолжить активный run (триггеры: «продолжить запуск», «resume workflow», «погнали дальше»). Путь run-dir передан в `$ARGUMENTS`; если он пуст, определи активный run через `yarn workflow:list` и уточни у пользователя при неоднозначности.

Порядок действий:
- Прочитай состояние run: `run-state.json`, `stage-gate-ledger.md` и сжатый `handoff-bundle.md` (для этапов от `08-frontend` передавай специалистам именно bundle, а не всю переписку — State Truncation Gate, CLAUDE.md раздел 3).
- Запусти `yarn workflow:resume $ARGUMENTS`, чтобы синхронизировать persisted state и определить следующий незавершённый этап.
- Следующий этап определяет persisted state — вывод `yarn workflow:resume` и `run-state.json` (они учитывают `profile` и `scale` этого run). Последовательность из `agent-pack/workflows/artifact-driven-pipeline.md` — только справка по порядку; она описывает масштаб `full`, поэтому при расхождении верь state, а не документу, и не делегируй стадию, исключённую масштабом (`skipped_by_scale`). Делегируй через `Task` tool (`subagent_type` = имя агента этапа). Переход дальше разрешён только при `status=complete`, `validation=passed`, `handoff_updated=true`.
- Проверь required inputs этапа: каждый этап обязан прочитать предыдущие артефакты и зафиксировать `inputs_used`.
- Для agentic run перед resume проверь readiness: `yarn workflow:agentic-preflight $ARGUMENTS --strict`.
- Внешние действия (Notion/Figma/deploy/git write) требуют exact approval — не выполняй их без интерактивного запроса.
- После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md` и сообщи текущий статус и следующий требуемый артефакт.
