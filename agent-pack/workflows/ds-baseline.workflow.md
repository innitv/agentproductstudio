# Workflow: новая продуктовая дизайн-система

## Назначение

Использовать, когда `design_system_mode=product_specific` или подтвержденный `extend` требует нового foundation. Этот workflow не наследует A3, отраслевые палитры, Inter/Slate, стандартные радиусы или семь «обязательных» компонентов автоматически.

Нормативный Figma SOP: `integrations/mcp/figma-canvas-write-guide.md`.

## Входы

- product brief, PRD, IA, copy constraints;
- visual evidence plan и reference cards;
- platform, locale, accessibility and brand constraints;
- existing libraries audit;
- exact Figma target и approval только перед write.

## Процесс

1. **Strategy**: подтвердить `product_specific`/`extend`, rationale, rejected systems и boundaries.
2. **Visual calibration**: собрать 2-3 ключевых screens/states без большой component matrix. Проверить composition, density, hierarchy, rhythm, copy fit, long text и responsive direction.
3. **Visual verdict**: `passed|passed_with_notes|blocked`. При `blocked` не строить foundation/components.
4. **Foundation extraction**: извлечь из утвержденных экранов primitive/semantic tokens, typography roles, spacing/radius/effect decisions. Не генерировать их из отраслевого preset.
5. **Pattern inventory**: отметить реальные повторы и оставить уникальные блоки bespoke.
6. **Systemization**: создать variables/styles, component sets/properties, nested instances, Auto Layout/resizing и prototype links.
7. **Component Contract Matrix**: связать Figma properties/values с semantic variables, React props, states, stories/tests и deviations.
8. **Regression check**: сравнить calibration/systemized screenshots. Systemization не должна ухудшать композицию.
9. **Roundtrip handoff**: записать Code Connect/fallback status и frame/state → route/story/component mapping.

## Quality gates

- Нет hardcoded отраслевой палитры или шрифта без evidence/rationale.
- Не создается «универсальный набор компонентов», если он не нужен экранам.
- Все repeated primitives — instances; detached copies имеют deviation.
- Semantic bindings используются там, где token существует; raw values имеют reason.
- Required states, long copy, HUG/FILL/FIXED и min/max поведение проверены.
- Figma write выполняется небольшими idempotent patches после exact approval.

## Outputs

- `design-brief.md` с Design System Strategy;
- `screens.md` с Component Contract Matrix;
- `design-loop-report.md` с visual calibration и regression check;
- `figma-handoff-bundle.md` с foundation, mappings и verification evidence.
