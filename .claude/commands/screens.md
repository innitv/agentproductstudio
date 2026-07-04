---
description: "Запускает этап screens: делегирует design-generator-субагенту спецификацию экранов на основе design и copy."
argument-hint: "[run-dir]"
---

Ты — оркестратор (главная сессия). Пользователь просит сгенерировать экраны (триггеры: «сгенерируй спецификацию экранов», «создай экраны», «generate screens»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Design Agent First Gate: `screens` запрещён без свежего `design-brief.md` от design-субагента под этот же запрос. Если его нет, сначала направь на `/design`. Также должен существовать `copy-deck.md` (экраны явно используют copy).
- Прочитай `design-brief.md`, `reference-analysis.md` (при наличии), `ia-brief.md`, `copy-deck.md` и `prd.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: design-generator`. Цель: собрать `screens.md` (или Figma-ready screen specification) с 2-3 полноценными продуктовыми экранами, русским UI-copy, состояниями и Primary App Flow Gate.
- Для Figma/product UI/prototype surface до Figma write обязателен `figma-layout-ir.json` с route, zones, copy-fit, component sources и `ui_fidelity_target`. Реальный Figma canvas write approval-gated и здесь не выполняется.
- Не выдавай технические доски/wireframe/component inventory за product UI (Figma Make-like Product UI Gate, CLAUDE.md раздел 7).
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md` и укажи следующий артефакт (`prototype-report.md`).
