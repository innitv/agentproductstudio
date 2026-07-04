---
description: Запускает этап IA: делегирует ia-субагенту sitemap, primary user flow, главный экран и главное действие.
argument-hint: [run-dir]
---

Ты — оркестратор (главная сессия). Пользователь просит спроектировать структуру (триггеры: «сделай sitemap», «нарисуй user flow», «design architecture»). Run-dir — в `$ARGUMENTS`.

Порядок действий:
- Убедись, что `prd.md` создан и завершён; IA строится поверх PRD и research. Если PRD нет, направь на `/prd`.
- Прочитай `prd.md`, research pack и `handoff-bundle.md`; зафиксируй `inputs_used`.
- Делегируй этап через `Task` tool с `subagent_type: ia`. Цель: собрать `ia-brief.md` с sitemap, primary user flow, главным экраном и главным действием.
- Обеспечь согласованность IA с будущими screens и prototype flow (Quality Gate, CLAUDE.md раздел 11).
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md` и укажи следующий требуемый артефакт (`design-brief.md`).
