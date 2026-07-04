---
name: figma-roundtrip
description: Использовать для выбора reuse/extend/product-specific/bespoke стратегии, создания или обновления Figma design system, Figma canvas write, Figma-to-frontend и frontend-to-Figma передачи. Обеспечивает visual calibration до systemization, Component Contract Matrix, Code Connect/fallback mapping и paired verification.
---

# Figma Roundtrip Quality

Skill управляет полным циклом работы с Figma: выбор стратегии design system, canvas write, передача Figma-to-frontend и обратно. Обеспечивает visual calibration до systemization, Component Contract Matrix и парную verification. Для пользовательских макетов работает в Figma Make-like режиме — сначала правдоподобные product screens, затем systemization.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-roundtrip/SKILL.md`](../../../agent-pack/skills/figma-roundtrip/SKILL.md). Следуй ей.**

## Когда использовать
- Нужно выбрать reuse/extend/product-specific/bespoke стратегию DS.
- Создание или обновление Figma design system, Figma canvas write.
- Передача Figma-to-frontend или frontend-to-Figma.
- Нужна paired verification (Figma и frontend) с Component Contract Matrix.

## Ключевые шаги
- Прочитай `integrations/mcp/figma-canvas-write-guide.md`; не дублируй его в run artifacts.
- Выбери `design_system_mode`: reuse/extend/product_specific/bespoke (не reuse только из-за доступности библиотеки).
- Для reuse/extend выбери slug из `design/figma/registry.json`; если DS нет или индекс partial/blocked — сначала `figma-ds-ingest`.
- Проведи visual calibration до systemization; собери Component Contract Matrix и Code Connect/fallback mapping.
- Выполни paired verification; результаты в handoff bundle, IR, visual QA, frontend-result, qa-report.

## Обязательные проверки
- `yarn validate:config`
- `yarn typecheck`
