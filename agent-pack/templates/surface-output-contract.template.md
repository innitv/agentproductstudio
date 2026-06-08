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

## 4. Evidence-To-Output Map

| Evidence source | Evidence status | Design / product decision | Output location | Applied / rejected |
|---|---|---|---|---|
| `<source>` | `source-backed` / `source-informed` / `synthetic` / `hypothesis` / `needs_validation` | `<decision>` | `<where>` | `applied` / `rejected` / `deferred` |

Правило: evidence должен быть не просто прочитан, а связан с конкретным решением и местом в output.

## 5. Surface Quality Bar

| Surface | Required checks |
|---|---|
| `figma_board` | структура canvas, фреймы/секции, readable hierarchy, native/editable layers, Russian Publication Gate, screenshot smoke, object inventory |
| `product_ui` / `frontend` | primary workflow, navigation, responsive, a11y, loading/empty/error/disabled states, browser screenshots, implementation evidence |
| `dashboard_console` | decision hierarchy, chart-to-question fit, metric definitions, no chartjunk, data quality labels, scan time under 5 seconds for primary KPI |
| `landing` | first viewport product signal, offer clarity, trust proof, CTA flow, responsive screenshots, no generic template |
| `prototype` | transition map, task path, state coverage, clickable/interaction notes |
| `notion_wiki` / `research_report` | publication completeness, structured tables/schemes, cross-links, navigation, source/evidence status |
| `presentation` | narrative arc, slide hierarchy, no overloaded slides, source notes for claims |

## 6. Write -> Verify -> Fix Plan

| Step | Required evidence | Status |
|---|---|---|
| Plan | Surface Output Contract reviewed | `pending` |
| Write | Output created in exact target/path | `pending` |
| Verify | API metadata/object inventory/screenshot/build/test evidence | `pending` |
| Fix | Gaps corrected or recorded as deviation | `pending` |

## 7. Deviations

| Deviation | Reason | Approval / waiver | Downstream impact |
|---|---|---|---|
| `<none>` |  |  |  |

