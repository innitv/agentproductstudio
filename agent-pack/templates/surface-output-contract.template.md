# Surface Output Contract

Используй этот контракт перед созданием любого крупного пользовательского результата: Figma board, product UI, dashboard/console, landing, prototype, frontend implementation, Notion/wiki/report, presentation или handoff package.

Контракт нужен не для бюрократии, а чтобы агент не подменил сложный результат красивой выжимкой и не потерял входные данные.

## 1. Surface Type

| Field | Value |
|---|---|
| Surface | `research_report` / `notion_wiki` / `figma_board` / `product_ui` / `dashboard_console` / `landing` / `prototype` / `frontend` / `presentation` / `handoff` / `other` |
| Primary user | Кто будет читать, принимать решение или пользоваться результатом |
| Primary job | Какое решение или действие должен разблокировать output |
| Output mode | `summary` / `full_board` / `interactive_ui` / `implementation` / `handoff` |
| External write target | URL/path или `none` |

## 2. Scope Contract

| Field | Value |
|---|---|
| Required inputs | Конкретные файлы, ссылки, screenshots, design system или source artifacts |
| Must-cover sections | Разделы/сценарии/экраны/состояния, которые нельзя потерять |
| Expected units | Примерное число страниц, фреймов, экранов, состояний, views или components |
| Non-goals | Что сознательно не входит в результат |
| Definition of Done | Проверяемый критерий готовности |

## 3. Coverage Gate

| Input / section | Output location | Coverage status | Notes |
|---|---|---|---|
| `<artifact/section>` | `<frame/page/screen/component>` | `covered` / `partial` / `skipped` | Причина и риск |

Правило: если важный вход имеет статус `partial` или `skipped`, финальный status не может быть `success` без явного waiver/deviation record.

### Public / Internal Split

Заполняется для `notion_wiki`, `research_report` и других публикационных поверхностей.

| Content class | Destination | Public? | Notes |
|---|---|---|---|
| Product/research decisions | public hub / child page | yes |  |
| Working entities | database index + embedded linked view | yes |  |
| Source/evidence references | sources/validation page or database | yes, если не содержит secrets/raw payloads |  |
| Approval records, dry-run gates, lint output, block counts | local publication record / ledger | no | Не публиковать в public Notion hub. |
| `Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, provider/debug policy | local artifacts only | no | Удалять на Publication Editor Pass. |

### Entity Ownership Map

| Entity | Owner page / database / view | Allowed summary elsewhere | Duplicate policy |
|---|---|---|---|
| `personas` |  | link / one-line summary | no repeated full table |
| `cjm_frictions` |  | link / one-line summary | no repeated full table |
| `opportunities/backlog` |  | link / top 3 only | no repeated ICE/RICE tables |
| `requirements/user_stories` |  | link / key decisions only | no repeated requirements table |
| `validation_claims/sources` |  | link / status summary | no repeated source tables |

Правило: public Notion export проходит `Publication Editor Pass` только если каждая рабочая сущность имеет одного владельца и не размножается полной таблицей по нескольким страницам.

## 4. Evidence-To-Output Map

| Evidence source | Evidence status | Design / product decision | Output location | Applied / rejected |
|---|---|---|---|---|
| `<source>` | `source-backed` / `source-informed` / `synthetic` / `hypothesis` / `needs_validation` | `<decision>` | `<where>` | `applied` / `rejected` / `deferred` |

Правило: evidence должен быть не просто прочитан, а связан с конкретным решением и местом в output.

## 5. Visual Evidence Grounding

Заполняется для любой визуальной или интерактивной поверхности: `figma_board`, `product_ui`, `dashboard_console`, `landing`, `prototype`, `frontend`, `presentation` и visual `handoff`.

### Visual Evidence Plan

| Layer | Target references | Source / tool | Status | Skipped reason / risk |
|---|---|---|---|---|
| Same-domain references | Прямые конкуренты, аналоги, реальные продукты той же категории | user refs / web / Lazyweb / screenshot library / benchmark dataset | `planned|collected|skipped` |  |
| Adjacent high-quality references | Смежные продукты с сильной UX-подачей, близкой плотностью или похожим уровнем доверия | web / Lazyweb / library | `planned|collected|skipped` |  |
| Interaction/state references | Реальные loading/empty/error/success/disabled/permission/status/refund/etc. состояния похожего сценария | screenshots / screen recording / docs / live capture | `planned|collected|skipped` |  |
| Design-system grounding | UI Kit, variables, tokens, components, local libraries | Figma / codebase / docs | `planned|collected|skipped` |  |

Правило: UI Kit/design system не заменяет real-world visual evidence. Если real-world evidence недоступен, статус поверхности не выше `partial`, кроме explicit waiver/deviation.

### Visual Reference Cards

| Reference | Surface / screen / state | Observed pattern | What to borrow | What to avoid | Applicability | IP / trade-dress risk | Output location |
|---|---|---|---|---|---|---|---|
| `<source/url/path>` |  |  |  |  | `high|medium|low` | `low|medium|high` |  |

### Visual Evidence-To-Output Map

| Visual evidence | Visual decision | Output unit | Verification signal |
|---|---|---|---|
| `<screenshot/live capture/reference>` | layout / density / hierarchy / state / responsive behavior | `<frame/screen/component/slide>` | screenshot / object inventory / browser capture / visual diff / manual review |

### Source Pair Matrix

Заполняется, если визуальная поверхность проходит через Figma, frontend, reference screenshots или интерактивный prototype.

| Pair | Required | Evidence | Status | Notes |
|---|---|---|---|---|
| `reference_to_figma` | yes / no | reference screenshots/cards; Figma node IDs; Figma screenshot/object inventory | `passed|passed_with_notes|accepted_difference|blocked|not_applicable` |  |
| `figma_to_frontend` | yes / no | Figma screenshots/node IDs; frontend screenshots; DOM/locator/component map | `passed|passed_with_notes|accepted_difference|blocked|not_applicable` |  |
| `reference_to_frontend` | yes / no | paired screenshots; `visual-diff-result.json`; section diff | `passed|passed_with_notes|accepted_difference|blocked|not_applicable` |  |
| `spec_to_frontend_behavior` | yes / no | prototype states; Playwright/manual interactions; traces/screenshots | `passed|passed_with_notes|accepted_difference|blocked|not_applicable` |  |

### Figma / Design System Strategy

| Field | Value |
|---|---|
| `design_system_mode` | `reuse|extend|product_specific|bespoke|not_applicable` |
| Visual calibration before systemization | `required|not_required` |
| Component Contract Matrix | path / planned / not_applicable |
| Code Connect / fallback mapping | status / path |
| Frame/state implementation map | path / planned / not_applicable |

Правило: pixel diff не заменяет metadata/object inventory, DOM/locator/component mapping или behavior checks.

## 6. Surface Quality Bar

| Surface | Required checks |
|---|---|
| `figma_board` | структура canvas, фреймы/секции, readable hierarchy, native/editable layers, Visual Evidence Grounding, Source Pair Matrix, Russian Publication Gate, screenshot smoke, object inventory |
| `product_ui` / `frontend` | primary workflow, navigation, Visual Evidence Grounding, Source Pair Matrix, responsive, a11y, loading/empty/error/disabled states, browser screenshots, implementation evidence |
| `dashboard_console` | decision hierarchy, chart-to-question fit, metric definitions, no chartjunk, data quality labels, real dashboard references for density/states, scan time under 5 seconds for primary KPI |
| `landing` | first viewport product signal, offer clarity, trust proof, CTA flow, real landing/product references, responsive screenshots, no generic template |
| `prototype` | transition map, task path, state coverage, clickable/interaction notes, real flow/state references |
| `notion_wiki` / `research_report` | publication completeness, structured tables/schemes, cross-links, navigation, source/evidence status, `notion_data_shape_plan` for page/table/database choice, `integrated_hybrid` linked views when pages and databases coexist |
| `presentation` | narrative arc, slide hierarchy, visual references for comparable deck/surface style when design-critical, no overloaded slides, source notes for claims |

### Notion Data Shape Plan

Заполняется для `notion_wiki`, `research_report` и любых external publication surfaces, которые могут стать страницами или базами Notion.

| Entity / section | Recommended shape | Reason | Schema preview / properties | Idempotency key |
|---|---|---|---|---|
| `<section>` | `hub_page` / `child_page` / `notion_table_block` / `database_index` / `embedded_linked_database_view` / `toggle` |  |  |  |

Правило: если сущность нужно фильтровать, сортировать, обновлять или связывать с другими сущностями, preferred shape = `database_index`. Если одновременно есть narrative child page и database_index, preferred publication shape = `integrated_hybrid`: база создается/обновляется как рабочий index и встраивается linked database view в релевантную child page. Если таблица нужна только для чтения внутри отчета, preferred shape = `notion_table_block`.

### Embedded Linked Database Views

Заполняется для `integrated_hybrid`, когда Notion-публикация должна ощущаться цельным workspace, а не набором отдельных страниц и баз.

| Entity | Target child page | Source database / data source | View name | Visible properties / filters | Verification evidence |
|---|---|---|---|---|---|
| `personas` | страница персон |  |  |  |  |
| `cjm_frictions` | страница CJM/user flow |  |  |  |  |
| `opportunities/backlog` | страница roadmap/ICE/RICE |  |  |  |  |
| `requirements/user_stories` | страница PRD/requirements |  |  |  |  |
| `validation_claims/sources` | страница validation/source |  |  |  |  |

Правило: если linked view не встроен в подходящую страницу или fetch/metadata verification не подтверждает inline database block, Notion surface получает `partial` до исправления.

## 7. Write -> Verify -> Fix Plan

| Step | Required evidence | Status |
|---|---|---|
| Plan | Surface Output Contract reviewed | `pending` |
| Write | Output created in exact target/path | `pending` |
| Verify | API metadata/object inventory/screenshot/build/test evidence | `pending` |
| Fix | Gaps corrected or recorded as deviation | `pending` |

## 8. Deviations

| Deviation | Reason | Approval / waiver | Downstream impact |
|---|---|---|---|
| `<none>` |  |  |  |
