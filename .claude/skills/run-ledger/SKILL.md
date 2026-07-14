---
name: run-ledger
description: Использовать при старте продуктового run и после каждого этапа, чтобы вести run ledger: run-plan, handoff-bundle, stage-gate-ledger, run-state, artifact-manifest. Skill фиксирует inputs_used, статусы стадий и gate notes, синхронизирует состояние через yarn workflow:sync после ручных правок и не позволяет закрыть workflow как success при незаписанных blocker и skipped_with_reason.
---

# Run Ledger (Ведение Журнала Запуска)

Состояние workflow должно быть записано, а не восстанавливаться по памяти сессии. Главная ошибка: этап «сделан», но `handoff-bundle.md` и `stage-gate-ledger.md` не обновлены — и следующий агент (или следующая сессия после сжатия контекста) не знает, на чём стоит.

**Полная процедура и Definition of Done — в [`agent-pack/skills/run-ledger/SKILL.md`](../../../agent-pack/skills/run-ledger/SKILL.md). Следуй ей.** Нормативный pipeline — [`agent-pack/workflows/artifact-driven-pipeline.md`](../../../agent-pack/workflows/artifact-driven-pipeline.md).

## Когда использовать
- Старт продуктового run: создать ledger до первых стадий.
- После завершения каждого этапа.
- После ручной правки файлов run.

## Ключевые шаги
- Ledger до стадий: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`.
- После этапа: в `handoff-bundle.md` — completed artifacts, решения, риски, следующий артефакт; в `stage-gate-ledger.md` — статус, gate notes, validation.
- `inputs_used` — реально прочитанные файлы, а не список по умолчанию.
- Пропуски пишутся явно: `skipped_with_reason`, `partial`, `blocked`. Молчаливый пропуск запрещён.
- С `08-frontend` специалистам передаётся сжатый `handoff-bundle.md`, а не вся история.

## Обязательные проверки
- `yarn workflow:sync <run-dir>` после ручных правок
- `yarn workflow:validate <run-dir> --profile standard`
