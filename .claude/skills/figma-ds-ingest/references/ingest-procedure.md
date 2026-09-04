# Ingest: рабочий порядок, инварианты, отчёт

Детали для `figma-ds-ingest`. Читать, когда skill запущен — то есть когда
источником дизайн-системы действительно выбрана Figma-библиотека, которой ещё
нет в `design/figma/registry.json`.

## Рабочий порядок

1. **Preflight**
   - Зафиксируй `design_system_slug`, Figma URL, source type и scope.
   - Проверь `design/figma/registry.json`.
   - Если slug уже есть, определи режим: `refresh|extend_index|inspect_only`.
   - Запиши `source.md`.

2. **Census First**
   - Сначала снимай только страницы, top-level types, ComponentSet/Component counts и Variable collections.
   - Не используй полный `get_design_context` на больших выделениях.
   - Не заходи в instance children.
   - Выход: `_scan/census.md`.

3. **Chunk Manifest**
   - Нарежь чтение на page/section/frame/window chunks.
   - Выход: `_scan/manifest.md` со статусами `pending|done|blocked`.
   - При перезапуске пропускай `done`.

4. **Foundation**
   - Читай Variables по коллекциям и modes.
   - Пиши `foundation.md`: primitive, semantic aliases, component tokens, notes.
   - Если semantic layer отсутствует или collection плоская, запиши risk вместо silent normalization.

5. **Components**
   - Для каждой pending-порции читай `id`, `name`, `description`, `componentPropertyDefinitions`.
   - Для `COMPONENT_SET` фиксируй compact matrix.
   - Для standalone `COMPONENT` фильтруй variant children по `parent.type !== "COMPONENT_SET"`.
   - Выход: `components.md`.

6. **Deep Profiles**
   - Создавай только для категорий, которые нужны для screen build/frontend mapping.
   - Пиши `components/<category>.md`: Node ID, variants, props, slots, anatomy depth <= 3, representative dimensions.

7. **Contract**
   - Создай/обнови `component-contracts.json`.
   - Запиши Code Connect status или fallback mapping.
   - Создай `ds.config.json`.
   - Обнови `design/figma/registry.json`.

## Инварианты

- Локальный индекс является первым источником после ingest.
- Figma читается точечно: missing nodes, refresh, screenshot verification, approved write.
- Node ID обязателен для каждого компонента, пригодного к сборке.
- ComponentSet Node ID нельзя путать с page/frame Node ID.
- Не сохраняй raw private dumps.
- Не закрывай `reuse` как ready без `foundation.md`, `components.md` и registry entry.
- Не закрывай frontend/Figma roundtrip как success без `component-contracts.json` или explicit deviation.

## Формат Итогового Отчета

В финальном ответе укажи:

- slug;
- source URL/scope;
- созданные/обновленные файлы;
- ingest status;
- component/variable counts;
- gaps/risks;
- можно ли использовать систему для `reuse|extend`;
- какие проверки выполнены.
