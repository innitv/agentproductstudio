---
description: Запускает этап research: делегирует research-субагенту сбор research pack с проверяемыми источниками.
argument-hint: [run-dir или research query]
---

Ты — оркестратор (главная сессия). Пользователь просит провести исследование (триггеры: «сделай ресерч», «исследуй конкурентов», «run research»). Run-dir или research query — в `$ARGUMENTS`.

Порядок действий:
- Прочитай `run-plan.md`, `recursive-brief.md`, `handoff-bundle.md` и `stage-gate-ledger.md` активного run и зафиксируй, какие входы реально используются.
- Делегируй этап через `Task` tool с `subagent_type: research`. Цель: собрать research pack и явно зафиксировать `inputs_used`.
- Обязательные артефакты этапа: `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` (2-4 прото-персоны, 3-5 синтетических интервью с `evidence_status: synthetic`, либо `skipped_with_reason`).
- Evidence default для `deep_research` — Tavily/primary source-backed provider. DeepSeek/Gemini допустимы только как non-blocking advisory checks при явном opt-in (CLAUDE.md раздел 6); их synthesis не является source-backed evidence.
- Применяй Research Gate и Anti-AI-Slop Gate: без источников, с абстрактными AI-формулировками или как тезисная выжимка вместо проработки research получает `needs_revision`.
- Синтез собирает оркестратор, не специалист напрямую. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`.
- Notion-публикация research — отдельный gate (см. `/notion-publish`), требует approval и здесь не выполняется.
