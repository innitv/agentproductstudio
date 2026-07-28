---
name: figma-screen-compiler
description: Использовать, когда Figma/product UI/prototype surface нужно собрать или обновить из screens и design-контекста: компилирует спецификации экранов в figma-layout-ir.json, применяет route/component/layout constraints и блокирует готовность к Figma write, если отсутствуют IR, DS honesty, copy-fit или visual QA требования.
---

# Figma Screen Compiler

Skill превращает `screens.md` и дизайн-контекст в `figma-layout-ir.json`: компактный machine-readable контракт для route, screens, zones, layout constraints, component sources, copy-fit и verification contract. IR — внутренний guardrail перед canvas write, а не макет и не canvas deliverable. Применяй перед любым Figma write для `figma_board`, `product_ui`, `prototype`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-screen-compiler/SKILL.md`](../../../agent-pack/skills/figma-screen-compiler/SKILL.md). Следуй ей.**

## Применимость
**Только маршрут `track: figma`** из `run-state.json` (CLAUDE.md §0.3, §6.1). Определять маршрут по наличию `figma-layout-ir.json` запрещено. IR нужен исключительно как guardrail перед Figma canvas write. Для кодовой поверхности контракт экрана — composition story плюс `yarn vr:test` / `yarn test-storybook`.

На маршруте `track: code` `figma-layout-ir.json` не создаётся и **записи в ledger не требует вовсе** — это штатный маршрут, а не пропуск. Писать `skipped_with_reason: Figma не участвует` **запрещено** (замена прежнего указания). Записи требуют только маршрут-условные **секции** `screens.md` (`## Layout Compiler Contract`, `## Figma Readiness`) — строкой `skipped_by_track` в таблице «Секции вне маршрута» `stage-gate-ledger.md`; `## Component Contract Matrix` и `## Frame / State Implementation Map` обязательны на обоих маршрутах. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

## Когда использовать
- Перед любым Figma canvas write для `figma_board`, `product_ui` или `prototype`.
- Результат должен быть похож на приложение, а не набор декоративных страниц.
- Пользователь просит собрать макеты/use cases/flow (Figma Make-like результат).
- Нужно применить route/component/layout constraints и copy-fit до write.

## Ключевые шаги
- Следуй `integrations/mcp/figma-canvas-write-guide.md` (§3 Two-Pass, §4 Contract Matrix) и канону `/figma-ds:standard`; write — через `figma-roundtrip`/`figma-handoff`.
- Прочитай `screens.md`, `design-brief.md`, `copy-deck.md`; при reuse/extend — `design/figma/registry.json` и DS index.
- Скомпилируй `figma-layout-ir.json`: route, screens, zones, layout constraints, component sources, copy-fit, verification contract.
- Примени DS honesty и copy-fit constraints; не превращай IR в видимую техническую доску или node inventory.
- Заблокируй write readiness, если отсутствуют IR, DS honesty, copy-fit или visual QA требования.

## Обязательные проверки
- `yarn validate:config`
- `yarn workflow:test-skill-metadata`
