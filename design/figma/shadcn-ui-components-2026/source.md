# shadcn/ui components with variables — source

## Статус

`partial_indexed` — источник сохранен как локальный read-only индекс для будущего `reuse|extend`.

## Source

- Figma URL: https://www.figma.com/design/NUoNEuTJ3OZOGH2c780Z55/shadcn-ui-components-with-variables---Tailwind-classes---Updated-January-2026--Community-?node-id=0-1&t=MXPujchvftWrxiMT-1
- File key: `NUoNEuTJ3OZOGH2c780Z55`
- Initial node: `0:1`
- Source type: `community_copy`
- Scope: `full_library`
- Цель использования: `reuse`, `extend`, `figma_build`, `frontend_mapping`
- Ingest date: `2026-06-27`

## Использованные исходные данные

- Figma metadata для `0:1`, root pages и страницы `Button`.
- Read-only Figma Plugin API census: pages, local Variables, styles, ComponentSet/Component counts.
- `get_design_context` для representative node `402:654` (`Button`).
- `get_libraries` и `search_design_system` для проверки library/search baseline.

## Политика записи

Этот ingest не менял исходный Figma-файл. Любой canvas write, создание Variables/components, публикация библиотеки или Code Connect требует отдельного `figma_write` approval с exact target.

## Ограничения

- Figma `search_design_system` по исходному fileKey не вернул опубликованные components/variables/styles, поэтому система сохранена как локальный индекс на основе read-only file scan.
- Чтение `componentPropertyDefinitions` через Plugin API упало с ошибкой Figma `Component set has existing errors`; это зафиксировано как риск в `_scan/census.md`.
- `get_design_context` показал, что components используют shadcn/Tailwind CSS variable naming (`--background`, `--border`, `--radius-lg`, `--size/sm`, `--family/sans` и т.д.). При frontend mapping нужно переводить это в проектные conventions, а не вставлять сгенерированный React/Tailwind код напрямую.
