---
name: figma-handoff
description: Использовать, когда пользователь просит Figma design system или canvas write. Skill создает figma-handoff-bundle.md — текстовый foundation/components/screens contract — перед любым approval-gated Figma MCP write.
---

# Figma Handoff Bundle

Skill готовит текстовый foundation/components/screens bundle перед любой записью в Figma. Работает вместе с `figma-roundtrip`: сначала strategy и visual calibration, затем systemization, текстовый contract и approval, только потом MCP write. Handoff остается внутренним слоем — пользовательский canvas не должен выглядеть как техническая спецификация.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-handoff/SKILL.md`](../../../agent-pack/skills/figma-handoff/SKILL.md). Следуй ей.**

## Применимость
**Только маршрут `track: figma`** из `run-state.json` (CLAUDE.md §0.3) — пользователь просит макет в Figma или показ человеку (`CLAUDE.md` §6.1). Определять маршрут по наличию файлов запрещено. `design_system_mode` по умолчанию решается в пользу shadcn/ui в коде, а не Figma-библиотеки. Handoff не является предусловием frontend: код собирается из `design/tokens/` и shadcn.

На маршруте `track: code` `figma-handoff-bundle.md` не создаётся и **записи в ledger не требует вовсе** — это штатный маршрут, а не пропуск. Писать `skipped_with_reason: Figma не участвует` **запрещено** (замена прежнего указания). Записи требуют только маршрут-условные **секции** `screens.md`/`frontend-result.md` — строкой `skipped_by_track` в таблице «Секции вне маршрута» `stage-gate-ledger.md`. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

## Когда использовать
- Пользователь просит Figma design system или canvas write.
- Перед любым approval-gated Figma MCP write на этапах 04-design или 06-screens.
- Нужно зафиксировать `design_system_mode`: reuse/extend/product_specific/bespoke.
- Surface `figma_board|product_ui|prototype` требует текстового contract перед write.

## Ключевые шаги
- Прочитай `STYLE_GUIDE.md`, `design-brief.md`, `screens.md`, при наличии `design-loop-report.md`.
- Если surface `figma_board|product_ui|prototype`, убедись, что `figma-screen-compiler` создал `figma-layout-ir.json`; без IR write запрещен.
- Прочитай `integrations/mcp/figma-canvas-write-guide.md`; зафиксируй `design_system_mode` и rationale.
- Собери foundation/components/screens bundle как текстовый contract.
- Запроси `figma_write` approval; только после этого MCP write.

## Обязательные проверки
- `yarn validate:config`
