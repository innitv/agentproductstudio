# Политика создания новой дизайн-системы

Эта политика применяется только при `design_system_mode=product_specific` или подтвержденном `extend`. A3 не является обязательным foundation для нового продукта.

Основной workflow: `agent-pack/workflows/ds-baseline.workflow.md`.
Figma SOP: `integrations/mcp/figma-canvas-write-guide.md`.

## Правила

1. Сначала создать и визуально проверить 2-3 ключевых экрана; затем извлечь foundation и реальные повторяемые patterns.
2. Не выбирать палитру, шрифт, spacing, radius или component list по отраслевому preset без visual evidence и product rationale.
3. Уникальные элементы сохранять bespoke, пока повторение не доказано.
4. После visual verdict создать variables/styles, component sets/properties, instances и Auto Layout/resizing.
5. Для каждого интерактивного/повторяемого компонента заполнить Component Contract Matrix.
6. После systemization сравнить screenshots с calibration version; visual regression блокирует `ready`.
7. Figma write выполнять только после exact approval, небольшими plugin-context patches и с object inventory + screenshot verification.

## Статус A3

`design/figma/a3-design-system/token-map.md` и `component-map.md` являются source of truth только для задач с `design_system_mode=reuse|extend` и явно выбранной A3 foundation. Для `product_specific|bespoke` они могут использоваться как справочный материал, но не как обязательный визуальный язык.
