# Handoff: процедура записи в Figma и состав evidence

Детали для `figma-handoff`. Читать, когда skill запущен — то есть когда работа
действительно идёт в Figma и предстоит canvas write.

## Процедура

1. Прочитай `STYLE_GUIDE.md`, `design-brief.md`, `screens.md` и при наличии `design-loop-report.md`.
1a. Если surface `figma_board|product_ui|prototype`, убедись, что `figma-screen-compiler` уже создал `figma-layout-ir.json`. Если нет, остановись на `partial` и сначала выполни compiler. Figma write без IR запрещен.
2. Прочитай `integrations/mcp/figma-canvas-write-guide.md` и зафиксируй `design_system_mode`: `reuse|extend|product_specific|bespoke`, rationale и rejected alternatives.
2a. Для `reuse|extend` выбери `selected_design_system_slug` из `design/figma/registry.json` и прочитай локальный индекс. Если индекс отсутствует, остановись на `partial` и направь в `figma-ds-ingest`. Для shadcn-макетов индекс уже есть — `shadcn-ui-community`; целевой файл для write в этом случае **сам файл кита** (`pCDj1p7ItjKJcXPJZDqXi6`), потому что он не опубликован как библиотека и снаружи его компоненты не импортируются.
2b. Для внесенной ДС подтягивай только нужные категории `components/<category>.md`, а не весь Figma файл.
2c. Для `extend|product_specific` проверь visual calibration verdict по 2-3 ключевым экранам. Без него component systemization блокируется.
2d. Подготовь primitive variables, semantic aliases, text styles, paint/effect styles, components и screen list.
2e. Подготовь `Source Pair Plan`: какие пары обязательны для этой поверхности (`reference_to_figma`, `figma_to_frontend`, `reference_to_frontend`, `spec_to_frontend_behavior`) и какое evidence будет нужно после Figma write/frontend implementation.
3. Определи canvas strategy:
   - отдельные полноразмерные product frames на странице, если это app/screen flow;
   - target frame, если пользователь явно просит вписать результат в конкретное место;
   - component/foundation frames отдельно от screen frames только если пользователь просит библиотеку или это нужно для отсутствующего gap;
   - не добавлять на пользовательский canvas route arrows, evidence tables, node-id panels, audit notes и other technical scaffolding без явного запроса;
   - не вписывать все в один frame только потому, что пользователь дал ссылку на anchor.
4. Проверь существующую дизайн-систему: `search_design_system`, libraries, variables, styles, components. Найденная библиотека является кандидатом, а не обязательным выбором; следуй выбранному `design_system_mode`.
4a. Подготовь Component Contract Matrix и Code Connect/fallback status для каждого повторяемого или интерактивного компонента.
4b. Подготовь DS honesty audit: где используются реальные DS components/instances, где local components, где bespoke frames, и какие deviations приняты.
4c. Для `reuse|extend` запрещено закрывать handoff, если screen frames в основном собраны из локальных компонентов агента. Каждый screen должен использовать реальные instances выбранной DS; локальный component разрешен только как wrapper/gap с явным reason и не считается заменой DS component source.
4d. Не перечитывай весь Figma-файл при наличии локального индекса `design/figma/<slug>/components.md`; читай только нужные categories/nodes и фиксируй exact source ids.
5. Запиши `figma-handoff-bundle.md` по `agent-pack/artifacts/design/figma-handoff-bundle.template.md`.
6. Выполни Russian Publication Gate до Figma write:
   - весь видимый текст в Figma, включая frame names, headers, labels, cards, chips, table headers и descriptions, должен быть на русском;
   - английский допускается только для технических терминов без удачного русского аналога (`API`, `MCP`, `SDK`, `P0`, `RICE`, `BNPL`, `CJM`, `workflow`, `node id`);
   - испанский и другие посторонние языки запрещены;
   - старые draft-фреймы должны быть обновлены, скрыты или явно помечены `superseded`, если не соответствуют актуальному research pack.
7. Запроси human approval на Figma write и проверь `write_allowed=true`.
8. Перед write убедись, что доступен official remote `use_figma`; локальный Figma Dev Mode MCP может быть read-only.
9. Выполняй write малыми idempotent шагами:
   - write-check или non-destructive probe;
   - импорт/переиспользование существующих components/styles;
   - создание только недостающих component gaps;
   - полноценные product screen frames;
   - screenshot verification;
   - `visual-layout-verifier` с `figma-visual-qa.json`;
   - screenshot comparison до/после systemization и polish pass;
   - update handoff status and node IDs.
10. Если approval отсутствует, `use_figma` недоступен или нет edit прав, верни `partial`/`blocked`; не имитируй запись в Figma.


## Evidence

После записи в Figma зафиксируй в `figma-handoff-bundle.md`:

- target file и target node/anchor;
- selected design-system slug и paths локального индекса;
- созданные frame names и node IDs, если доступны;
- использованные libraries/components или причину `none_found`;
- `design_system_mode`, visual calibration verdict и systemization regression result;
- Component Contract Matrix и Code Connect/fallback status;
- `figma-layout-ir.json` status и DS honesty audit, включая count selected-DS instances vs local wrappers;
- `figma-visual-qa.json` gate result после write;
- результат `get_screenshot` или другую визуальную проверку;
- status/evidence для `reference_to_figma` и план проверки `figma_to_frontend`;
- Russian Publication Gate status;
- известные visual gaps и следующий gate для human visual review.

Handoff запрещено закрывать как `ready`, если screenshot показывает технический board, пустые карточки, component matrix, audit layout или shadcn-like reconstruction вместо UI выбранной тематики.
