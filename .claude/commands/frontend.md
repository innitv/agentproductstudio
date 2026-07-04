---
description: Запускает этап frontend: делегирует frontend-субагенту реализацию UI, состояния, адаптивность и analytics hooks.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит код (триггеры: «напиши код», «сверстай лендинг», «implement frontend»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Frontend Lock: реализация запрещена до завершённых PRD, IA, design, copy, screens и prototype (кроме явного `quick draft`). Если чего-то не хватает, направь на соответствующий этап и не начинай frontend.
- Начиная с этого этапа передавай специалисту сжатый `handoff-bundle.md`, а не всю переписку (State Truncation Gate, CLAUDE.md раздел 3). Прочитай `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `prototype-report.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: frontend`. Цель: собрать `frontend-result.md` и bespoke React/Vite/Tailwind реализацию с состояниями, адаптивностью, accessibility и analytics hooks.
- Reference-driven: layout, сетка, breakpoints и порядок секций берутся только из reference-analysis, не из дефолтных grid/шаблонов (CLAUDE.md раздел 7). Для reference-driven задач далее обязательна визуальная сверка (`/visual-diff`).
- Не выполняй deploy или git write без exact approval.
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`.
