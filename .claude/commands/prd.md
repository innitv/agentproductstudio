---
description: Запускает этап PRD: делегирует prd-субагенту требования, MoSCoW и acceptance criteria на основе research.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит подготовить требования (триггеры: «напиши prd», «сформируй требования», «generate prd»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Проверь Research Lock: PRD запрещён, пока не созданы и не прошли валидацию `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`. Если research не готов, направь пользователя на `/research`.
- Прочитай research pack, `recursive-brief.md` и `handoff-bundle.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: prd`. Цель: собрать `prd.md` с problem, goals, scope, requirements, MoSCoW, acceptance criteria и analytics.
- Утверждения из синтетических интервью переноси только с пометкой `needs validation`; не заполняй gaps «разумными» фактами (CLAUDE.md раздел 10).
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md` и укажи следующий требуемый артефакт (`ia-brief.md`).
