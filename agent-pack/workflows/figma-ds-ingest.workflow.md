# Workflow: Figma DS ingest

## Назначение

Использовать, когда пользователь дает новую или большую Figma дизайн-систему и хочет, чтобы агент мог переиспользовать ее в будущих макетах/фронтенде без постоянного чтения всего Figma-файла.

Этот workflow read-only по отношению к Figma. Canvas write, создание компонентов или правка Variables выполняются только отдельным `figma_write` approval после ingest.

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
