# Figma design systems

Эта папка хранит долгоживущие локальные индексы Figma дизайн-систем. A3 — первый зарегистрированный пример, но не дефолт для всех продуктов.

## Правило выбора

Перед Figma handoff, frontend implementation или canvas write агент выбирает `design_system_mode`:

- `reuse` — использовать зарегистрированную систему без дублирования primitives/components.
- `extend` — использовать зарегистрированную foundation и добавить только подтвержденные gaps.
- `product_specific` — создать новую продуктовую систему после visual calibration.
- `bespoke` — не строить библиотеку заранее, выносить только доказанные повторы.

Если выбран `reuse|extend`, укажи `selected_design_system_slug` из `registry.json`.

## Локальный индекс

Для общей Figma DS агент работает с локальным индексом:

- `source.md` — источник и scope.
- `_scan/census.md` — перепись страниц, component sets, компонентов и variables.
- `_scan/manifest.md` — порции ingest со статусами `pending|done|blocked`.
- `foundation.md` — variables, semantic aliases, modes.
- `components.md` — компактная карта компонентов с Node ID.
- `components/<category>.md` — deep profiles: slots, variants, anatomy, sizes.
- `component-contracts.json` — machine-readable Figma → frontend contract.
- `code-connect-fallback.md` — mapping, если Code Connect недоступен.

После ingest агент читает индекс, а не весь Figma-файл. В Figma нужно ходить только для missing nodes, refresh, write или verification.
