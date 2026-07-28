# Workflow: Figma DS ingest

## Назначение

Использовать, когда пользователь **дал конкретную Figma дизайн-систему** и хочет, чтобы агент мог переиспользовать её в будущих макетах/фронтенде без постоянного чтения всего Figma-файла.

Этот workflow read-only по отношению к Figma. Canvas write, создание компонентов или правка Variables выполняются только отдельным `figma_write` approval после ingest.

## Когда его НЕ запускать (входной гейт)

Умолчание студии — `reuse` shadcn/ui в коде (CLAUDE.md §6.1), а не Figma-библиотека. Отсюда:

- **Кит shadcn/ui в Figma уже заингестен — повторно не ингестить.** С 2026-07-28 в реестре есть `shadcn-ui-community` (file key `pCDj1p7ItjKJcXPJZDqXi6`): 172 компонента и сета с Node ID и ключами, семантические переменные, 14 125 иконок. Если задача — макеты на shadcn в Figma, читай `design/figma/shadcn-ui-community/components.md`, а не запускай ingest заново.
  - Прежний индекс той же библиотеки (community-оригинал `NUoNEuTJ3OZOGH2c780Z55`, июнь 2026) **удалён 2026-07-28**: ID страниц в нём совпадали с действующим китом, а Node ID компонентов — нет, и это делало два индекса опасно похожими. Восстановить при нужде: `git checkout 30040c1^ -- design/figma/shadcn-ui-components-2026`. Единственный действующий индекс этой библиотеки — `design/figma/shadcn-ui-community/`.
- Не запускай ingest «на всякий случай», чтобы заполнить реестр или чтобы у задачи появился `selected_design_system_slug`. Наличие записи в реестре само по себе не переводит задачу на Figma-маршрут.
- Не запускай ingest, чтобы получить токены: источник правды для токенов — DTCG в `design/tokens/` (`yarn tokens:build`). Для разового извлечения значений из макета есть skill `figma-token-extractor`, он дешевле полного ingest.
- Не запускай ingest, чтобы «свериться с эталоном DS». Роль `reference`-индексов упразднена вместе с архивацией; канон дизайн-систем читается из плагина `/figma-ds:standard`, а не из чужого Figma-файла.
- Запускай, когда пользователь явно передал файл и работа реально пойдёт по его Node ID: сборка макетов в этом файле, извлечение большой библиотеки, frontend по чужой DS.

Отдельно про бюджет чтений: у аккаунта View-seat порядка 6 чтений Figma REST в месяц. Ingest — дорогая операция, и она должна окупаться повторным использованием индекса, иначе дешевле прочитать нужный узел точечно.

## Входы

- Figma URL на file/page Components/library.
- `design_system_slug` в формате `^[a-z0-9][a-z0-9-]*$`.
- Scope: `full_library|components_page|selected_pages|selected_nodes`.
- Source type: `owned|corporate|community_copy|project_specific|unknown`.
- Цель использования: `reuse|extend|frontend_mapping|figma_build|qa`.

## Выходы

Долгоживущие файлы в `design/figma/<design_system_slug>/`:

- `source.md`
- `_scan/census.md`
- `_scan/manifest.md`
- `foundation.md`
- `components.md`
- `components/<category>.md`
- `component-contracts.json`
- `code-connect-fallback.md`, если Code Connect недоступен или не настроен
- `ds.config.json`

И обновление:

- `design/figma/registry.json`

## Фазы

1. **Preflight**
   - Проверить Figma access и exact source URL.
   - Создать `source.md`.
   - Создать/обновить запись в `design/figma/registry.json` со статусом `planned|partial`.

2. **Census**
   - Снять только страницы, top-level node counts, ComponentSet/Component counts и Variable collections.
   - Не читать children глубоко и не использовать `get_design_context` на большой области.
   - Записать `_scan/census.md`.

3. **Chunk Manifest**
   - Нарезать чтение по page/section/frame/window.
   - Записать `_scan/manifest.md` со строками `pending|done|blocked`.
   - Готовые `done` порции не перечитывать без refresh-запроса.

4. **Foundation**
   - Читать Variables по коллекциям и режимам.
   - Записывать `foundation.md`: primitive, semantic, component tokens.
   - Отмечать плоские/неполные collections как risk, не править Figma.

5. **Component Map**
   - Для каждой pending-порции читать только `id/name/description/componentPropertyDefinitions`.
   - В `COMPONENT_SET` фиксировать compact variant matrix.
   - Standalone `COMPONENT` считать без variant children.
   - Записывать `components.md`.

6. **Deep Profiles**
   - Только для категорий, нужных для сборки экранов или frontend.
   - Записывать `components/<category>.md`: slots, anatomy depth <= 3, full variant names, dimensions.

7. **Contract**
   - Создать/обновить `component-contracts.json`.
   - Зафиксировать Code Connect status или fallback mapping.
   - Создать `ds.config.json`.
   - Обновить `registry.json` на `indexed|partial|blocked`.

## Quality Gates

- Без `_scan/census.md` нельзя начинать компонентный каталог.
- Без `_scan/manifest.md` нельзя закрывать ingest.
- Без `foundation.md` и `components.md` нельзя выбирать `reuse`.
- Без `component-contracts.json` нельзя закрывать Figma/frontend roundtrip как `success`.
- Если DS большая, один MCP response не должен пытаться вернуть весь файл.
- Raw private Figma dumps запрещены.
- Любые write-действия в Figma запрещены в этом workflow.

## Использование После Ingest

При `design_system_mode=reuse|extend` агент обязан:

1. Указать `selected_design_system_slug`.
2. Прочитать `design/figma/registry.json`.
3. Прочитать `ds.config.json`, `foundation.md`, `components.md`.
4. Подтянуть `components/<category>.md` только для нужных категорий.
5. Обращаться в Figma только для missing node, refresh, screenshot verification или approved write.

Даже при `reuse` внешней Figma-DS реализация и приёмка остаются в коде: компоненты живут в `apps/frontend/src/components/`, витрина — истории Storybook, вердикт — `yarn vr:test`/`yarn test-storybook`/`yarn qa:mobile`. Индекс отвечает на вопрос «как устроен исходный компонент», а не заменяет витрину и не становится источником правды для токенов.
