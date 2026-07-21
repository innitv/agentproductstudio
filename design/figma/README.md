# Figma design systems

Эта папка хранит долгоживущие локальные индексы Figma дизайн-систем. A3 — первый зарегистрированный пример, но не дефолт для всех продуктов.

## Роли индексов (не путать)

У локального индекса — одна из двух ролей (поле `role` в `registry.json`; отсутствует = `working`):

- **`working`** — продуктовая DS, на которой строим / которую переиспользуем / расширяем. Отвечает на «на чём строить». **Только `working`-запись может быть `selected_design_system_slug`** (см. «Правило выбора»). Примеры: `a3-design-system`, `shadcn-ui-components-2026`.
- **`reference`** — эталон «как DS сделана ПРАВИЛЬНО»: и по структуре (тиеры токенов, матрица состояний, типы property), и по подаче/документации (раскладка Foundations/Components, анатомия, плотность доков). Отвечает на «как правильно устроить и оформить». Пример: `material-3-kit` (M3). **Никогда не `selected_design_system_slug`** — на нём не строят продукт, с ним только СВЕРЯЮТСЯ.

Что `reference` НЕ задаёт: **бренд-вид/эстетику конкретного продукта** (цвета, форма, tone) — это per-project, из референсов и решений самого проекта (`design/figma/<product-slug>/`, reference-analysis), а не из глобального эталона. `reference` учит «как правильно СДЕЛАТЬ и ПОДАТЬ DS», а не «сделай похоже на Material».

**Рабочая модель одной фразой:** бренд-стиль берём из готового продукта-референса (реальный сайт/макет) и кладём на структурные рельсы M3 — продукт даёт «как выглядит», M3 даёт «как правильно устроено и подано».

Правило против путаницы: `reference` — **compare-only**. Сверка идёт с локальным индексом (golden-скриншоты + `component-contracts.json`), а НЕ с живым Figma-файлом; живьём — только разовый ingest при отсутствии baseline или пере-ингест при изменении эталона (`version_id`/`lastModified`). Это правило продублировано в эталон-гейте хуков (`orchestrator-reminder.mjs`, `figma-selfcheck.mjs`).

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
