---
description: "Запускает новый продуктовый workflow: intake, scaffold run ledger и research как первый этап."
argument-hint: "[цель или бриф лендинга]"
---

Ты — оркестратор (главная сессия). Пользователь хочет начать новый продуктовый workflow (триггеры: «начать воркфлоу», «start landing», «новый проект»). Цель/бриф передан в `$ARGUMENTS`.

Порядок действий:
- Сначала выполни `yarn workflow:doctor`, чтобы проверить окружение, ключи и целостность шаблонов. При критичных проблемах зафиксируй blocker и не продолжай.
- Определи тип задачи по стартовому контракту CLAUDE.md (раздел 0.1): `full product workflow`, `reference-driven workflow` или `quick draft`. Если в `$ARGUMENTS` есть URL/screenshot/«как этот сайт», это reference-driven — обязателен `yarn reference:scan <url> [slug]` до `reference-analysis.md`.
- Определи **масштаб** по CLAUDE.md раздел 0.2 — это отдельная ось от типа: `full` (новый продукт или существенная фича), `increment` (новая секция/экран в существующем продукте), `patch` (правка готового). Не уверен — бери `full`. Масштаб режет только глубину: approval gates, run ledger, `00-intake` и `11-qa` остаются на любом уровне, и мелкий масштаб не является поводом для `quick draft`.
- Создай run ledger в `outputs/<project-slug>/<YYYY-MM-DD>/` (для standalone research — `research/projects/<research-slug>/<YYYY-MM-DD>/`): `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `run-state.json`, `run-meta.json`, `artifact-manifest.json`, `run-index.md`. Можно использовать `yarn workflow:start "$ARGUMENTS" --scale <full|increment|patch>` как scaffold.
- Зафиксируй масштаб в `run-plan.md` и `run-state.json`, а стадии, которые он исключает, перечисли в `stage-gate-ledger.md` как `skipped_by_scale`. Понижать масштаб задним числом нельзя — `yarn workflow:validate` отклонит run, где стадия вне масштаба уже отработала.
- Соблюдай порядок этапов из `agent-pack/workflows/artifact-driven-pipeline.md`: research -> PRD -> IA -> design -> copy -> screens -> prototype -> frontend -> QA -> release. Frontend запрещён до PRD/IA/design/copy/screens/prototype (кроме явного `quick draft`).
- Первым продуктовым этапом делегируй research: вызови `Task` tool с `subagent_type: research` и целью из `$ARGUMENTS`. Финальный синтез собирает оркестратор, а не специалист.
- Внешние действия (Notion/Figma/deploy/git write) требуют exact approval — не выполняй их на старте.
- В конце обнови `handoff-bundle.md` и `stage-gate-ledger.md` и сообщи путь к run-dir и следующий требуемый артефакт.
