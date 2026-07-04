---
description: "Запускает новый продуктовый workflow: intake, scaffold run ledger и research как первый этап."
argument-hint: "[цель или бриф лендинга]"
---

Ты — оркестратор (главная сессия). Пользователь хочет начать новый продуктовый workflow (триггеры: «начать воркфлоу», «start landing», «новый проект»). Цель/бриф передан в `$ARGUMENTS`.

Порядок действий:
- Сначала выполни `yarn workflow:doctor`, чтобы проверить окружение, ключи и целостность шаблонов. При критичных проблемах зафиксируй blocker и не продолжай.
- Определи тип задачи по стартовому контракту CLAUDE.md (раздел 0.1): `full product workflow`, `reference-driven workflow` или `quick draft`. Если в `$ARGUMENTS` есть URL/screenshot/«как этот сайт», это reference-driven — обязателен `yarn reference:scan <url> [slug]` до `reference-analysis.md`.
- Создай run ledger в `outputs/<project-slug>/<YYYY-MM-DD>/` (для standalone research — `research/projects/<research-slug>/<YYYY-MM-DD>/`): `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`. Можно использовать `yarn workflow:start "$ARGUMENTS"` как scaffold.
- Соблюдай порядок этапов из `agent-pack/workflows/artifact-driven-pipeline.md`: research -> PRD -> IA -> design -> copy -> screens -> prototype -> frontend -> QA -> release. Frontend запрещён до PRD/IA/design/copy/screens/prototype (кроме явного `quick draft`).
- Первым продуктовым этапом делегируй research: вызови `Task` tool с `subagent_type: research` и целью из `$ARGUMENTS`. Финальный синтез собирает оркестратор, а не специалист.
- Внешние действия (Notion/Figma/deploy/git write) требуют exact approval — не выполняй их на старте.
- В конце обнови `handoff-bundle.md` и `stage-gate-ledger.md` и сообщи путь к run-dir и следующий требуемый артефакт.
