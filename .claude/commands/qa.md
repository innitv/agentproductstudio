---
description: "Запускает этап QA review: делегирует qa-review-субагенту аудит PRD fit, UX, a11y, responsive и secrets."
argument-hint: "[run-dir]"
---

Ты — оркестратор (главная сессия). Пользователь просит проверить качество (триггеры: «проверь качество», «запусти qa», «run qa review»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Прочитай все ключевые артефакты run (`prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `frontend-result.md`, `test-bench-result.md`, `visual-reference-review.md` при наличии); зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: qa-review`. Цель: собрать `qa-report.md` с проверкой PRD fit, UX, visual/reference gates, accessibility, responsive и отсутствия секретов.
- Прогони доступные проверки: `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` (или `--profile reference` для reference-driven), плюс lint/typecheck/test/build если доступны (CLAUDE.md раздел 11).
- Для reference-driven задачи обязателен `visual-reference-review.md`; без него QA не может быть `success`.
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md` и перечисли blockers/риски.
