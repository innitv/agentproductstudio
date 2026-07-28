---
name: figma-roundtrip
description: Использовать для выбора reuse/extend/product-specific/bespoke стратегии, создания или обновления Figma design system, Figma canvas write, Figma-to-frontend и frontend-to-Figma передачи. Обеспечивает visual calibration до systemization, Component Contract Matrix, Code Connect/fallback mapping и paired verification.
---

# Figma Roundtrip Quality

Skill управляет полным циклом работы с Figma: выбор стратегии design system, canvas write, передача Figma-to-frontend и обратно. Обеспечивает visual calibration до systemization, Component Contract Matrix и парную verification. Для пользовательских макетов работает в Figma Make-like режиме — сначала правдоподобные product screens, затем systemization.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-roundtrip/SKILL.md`](../../../agent-pack/skills/figma-roundtrip/SKILL.md). Следуй ей.**

## Применимость
**Только маршрут `track: figma`.** Маршрут читается из `run-state.json` (CLAUDE.md §0.3), а не выводится по наличию `figma-layout-ir.json`. По `CLAUDE.md` §6.1 у Figma осталось две роли: дивергентный черновик на `04-design` и разовый показ человеку. Постоянной синхронизации нет, Figma-кит компонентов не ведётся.

- Дефолтный `design_system_mode` — `reuse` поверх shadcn/ui в коде (`apps/frontend/src/components/shadcn/`), а не поверх Figma-библиотеки.
- «frontend → Figma» — разовый показ, а не канал синхронизации; расхождение после него не блокирует код.
- Токены не ходят по кругу: правда в `design/tokens/` (`yarn tokens:build`), из Figma решения извлекаются один раз.
- Приёмка кода — `yarn vr:test`, `yarn test-storybook`, `yarn qa:mobile`, а не сверка с макетом.
- **На маршруте `track: code` Figma-артефакты (`figma-layout-ir.json`, `figma-handoff-bundle.md`, `figma-visual-qa.json`) не создаются и записи в ledger не требуют вовсе** — это штатный маршрут, а не пропуск. Писать `skipped_with_reason: Figma не участвует` **запрещено** (замена прежнего указания этого skill). Записи требуют только маршрут-условные **секции** `screens.md`/`frontend-result.md` — строкой `skipped_by_track` в таблице «Секции вне маршрута» `stage-gate-ledger.md`. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

## Когда использовать
- Нужно выбрать reuse/extend/product-specific/bespoke стратегию DS.
- Создание или обновление Figma design system, Figma canvas write.
- Передача Figma-to-frontend или разовый показ frontend-to-Figma.
- Нужна paired verification (Figma и frontend) с Component Contract Matrix.

## Ключевые шаги
- Прочитай `integrations/mcp/figma-canvas-write-guide.md`; не дублируй его в run artifacts.
- Выбери `design_system_mode`: reuse/extend/product_specific/bespoke (не reuse только из-за доступности библиотеки).
- Для reuse/extend выбери slug из `design/figma/registry.json`; если DS нет или индекс partial/blocked — сначала `figma-ds-ingest`.
- Проведи visual calibration до systemization; собери Component Contract Matrix и Code Connect/fallback mapping.
- Соблюдай механику Plugin API (`/figma-ds:build`) и канон DS (`/figma-ds:standard`), включая presentation-слой: cover-страница, page-интро, документация ключевых компонентов.
- Выполни paired verification; результаты в handoff bundle, IR, visual QA, frontend-result, qa-report.

## Обязательные проверки
- `yarn validate:config`
- `yarn typecheck`
