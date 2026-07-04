---
name: figma-screen-compiler
description: Использовать, когда Figma/product UI/prototype surface нужно собрать или обновить из screens и design-контекста — компилирует спецификации экранов в figma-layout-ir.json, применяет route/component/layout constraints и блокирует готовность к Figma write, если отсутствуют IR, DS honesty, copy-fit или visual QA требования.
---

# Figma Screen Compiler

Skill превращает `screens.md` и дизайн-контекст в `figma-layout-ir.json`: компактный machine-readable контракт для route, screens, zones, layout constraints, component sources, copy-fit и verification contract. IR — внутренний guardrail перед canvas write, а не макет и не canvas deliverable. Применяй перед любым Figma write для `figma_board`, `product_ui`, `prototype`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/figma-screen-compiler/SKILL.md`](../../../agent-pack/skills/figma-screen-compiler/SKILL.md). Следуй ей.**

## Когда использовать
- Перед любым Figma canvas write для `figma_board`, `product_ui` или `prototype`.
- Результат должен быть похож на приложение, а не набор декоративных страниц.
- Пользователь просит собрать макеты/use cases/flow (Figma Make-like результат).
- Нужно применить route/component/layout constraints и copy-fit до write.

## Ключевые шаги
- Прочитай `screens.md`, `design-brief.md`, `copy-deck.md`; при reuse/extend — `design/figma/registry.json` и DS index.
- Скомпилируй `figma-layout-ir.json`: route, screens, zones, layout constraints, component sources, copy-fit, verification contract.
- Примени DS honesty и copy-fit constraints; не превращай IR в видимую техническую доску или node inventory.
- Заблокируй write readiness, если отсутствуют IR, DS honesty, copy-fit или visual QA требования.

## Обязательные проверки
- `yarn validate:config`
- `yarn workflow:test-skill-metadata`
