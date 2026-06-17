# Результат публикации в Notion

## Inputs Used

- `notion-research-export-ru.md`
- `notion-publication-plan.md`
- `approval-state.json`
- `node tooling/scripts/publish-notion-research-hub.mjs`

## Publication Record

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_research_publish` |
| Target parent page | `3696473174e58006af5fd367ef89d978` |
| Hub title | Исследование платежных сценариев России для A3 Pay |
| Hub page id | `37964731-74e5-8133-81fd-d90afcd6f41d` |
| Hub URL | https://www.notion.so/3796473174e5813381fdd90afcd6f41d |
| Layout strategy | `hub_with_grouped_child_pages_and_selective_toggles` |
| Child pages | 7 |
| Published blocks | 106 |
| Published at | 2026-06-08 |

## Approval

| Field | Value |
|---|---|
| Approval action | `notion_research_publish` |
| Approval target | `3696473174e58006af5fd367ef89d978` |
| Approval state | approved |
| Approval source | Пользователь в текущем чате попросил опубликовать последнее неопубликованное изменение. |

## Dry Run And Gates

| Gate | Status | Evidence |
|---|---|---|
| Russian Publication Gate | pass | Видимый текст export на русском, технические термины оставлены как terms. |
| Publication Shape Gate | pass | Dry-run прошел: personas, CJM, competitor matrix и ICE/RICE распознаны как таблицы. |
| Dry-run | pass | 7 дочерних страниц, примерно 93 блока. |
| External write | completed | Notion hub и дочерние страницы созданы через API. |

## Created Pages

| Page | Page id | Blocks | Source sections |
|---|---|---:|---|
| 00 Обзор, выводы и рамка исследования | `37964731-74e5-8116-bb49-f16dd13b7695` | 3 | Краткий вывод |
| 02 Конкуренты, активы A3 и стратегия | `37964731-74e5-8101-b8d0-efab7c27d45a` | 10 | Матрица позиционирования |
| 03 Прото-персоны | `37964731-74e5-819e-a269-c601c033f04d` | 8 | Прото-персоны |
| 05 CJM и сценарии | `37964731-74e5-8131-8658-ebfe02a17b38` | 17 | Сценарий 1, Сценарий 2 |
| 06 ICE/RICE бэклог и инициативы | `37964731-74e5-8103-a96b-fb51686f05dc` | 11 | ICE/RICE бэклог |
| 08 План валидации, провайдеры и источники | `37964731-74e5-8138-a887-ea957a679ff3` | 12 | Источники |
| 09 Дополнительные материалы | `37964731-74e5-8156-a6d7-c8dacd584687` | 32 | Входные артефакты, экосистема, дорожная карта, проверки |

## Residual Risks

| Risk | Status | Notes |
|---|---|---|
| DeepSeek/Gemini advisory check | logged | Historical legacy auto-run был выполнен по прежнему правилу; DeepSeek прошёл, Gemini вернул `503 Service Unavailable`. По текущим правилам DeepSeek/Gemini не входят в default-run; research run остается `partial` из-за legal/rails и custdev gaps, а не до Gemini retry. |
| Повторная публикация | versioned copy | Скрипт создал новый hub под parent page; idempotent update existing hub не выполнялся. |

## Full Republication Published

После сравнения опубликованного hub с полным research pack подготовлена и опубликована новая полная версия публикации.

| Field | Value |
|---|---|
| Status | published |
| Target parent page | `3696473174e58006af5fd367ef89d978` |
| Hub title | A3 Pay: полное исследование платежных сценариев России |
| Hub page id | `37964731-74e5-8197-8293-e78a19a0632c` |
| Hub URL | https://www.notion.so/3796473174e581978293e78a19a0632c |
| Source artifact | `notion-research-export-ru.md` |
| Export size | 57,538 bytes |
| Source pack size | 48,796 bytes |
| Export/source ratio | 1.179 |
| Child pages | 9 |
| Published blocks | 480 |

| Gate | Status | Evidence |
|---|---|---|
| Publication Shape Gate | pass | Dry-run распознал personas, CJM, competitor matrix и ICE/RICE как таблицы/схемы. |
| Publication Completeness Gate | pass | Dry-run подтвердил полный export: `publication_completeness_gate.pass=true`. |
| Explicit approval | pass | Пользователь написал «разрешаю» в текущем чате; approval записан через `workflow:approve`. |
| External write | completed | Создан новый full hub и 9 child pages. |

## Full Republication Created Pages

| Page | Page id | Blocks | Source sections |
|---|---|---:|---|
| 00 Обзор, выводы и рамка исследования | `37964731-74e5-8106-a5f0-c26ef6378c62` | 149 | Сводка исследования |
| 02 Конкуренты, активы A3 и стратегия | `37964731-74e5-8142-b1a9-f25444118c49` | 53 | Матрица позиционирования, Конкурентный анализ |
| 03 Прото-персоны | `37964731-74e5-8134-a030-d927aff3e990` | 34 | Прото-персоны |
| 04 Синтетические интервью и вопросы для интервью | `37964731-74e5-8130-bfcd-d3887e6db12d` | 26 | Синтетические интервью |
| 05 CJM и сценарии | `37964731-74e5-8117-b9a5-c988d9516640` | 81 | Сценарий 1, Сценарий 2, CJM и карта сценариев |
| 06 ICE/RICE бэклог и инициативы | `37964731-74e5-818c-bd04-fd59c5280d88` | 61 | ICE/RICE бэклог, Возможности, ICE/RICE и roadmap |
| 07 Roadmap и SWOT | `37964731-74e5-817f-844f-c641d7b3c147` | 27 | SWOT |
| 08 План валидации, провайдеры и источники | `37964731-74e5-8196-b9d9-c855dc61f484` | 18 | Источники и журнал evidence |
| 09 Дополнительные материалы | `37964731-74e5-813d-9a90-f6729ec5f12c` | 16 | Статус публикационного пакета, Использованные входные артефакты |

## Human-Readable Headings Republication

После explicit approval опубликована актуальная версия research hub с человекочитаемыми русскими заголовками разделов. Эта версия считается последней актуальной Notion-публикацией.

| Field | Value |
|---|---|
| Status | published |
| Target parent page | `3696473174e58006af5fd367ef89d978` |
| Hub title | A3 Pay: полное исследование платежных сценариев России — человекочитаемые разделы |
| Hub page id | `37964731-74e5-81b1-bff5-f189cc8c0887` |
| Hub URL | https://www.notion.so/3796473174e581b1bff5f189cc8c0887 |
| Child pages | 9 |
| Published blocks | 473 |
| Approval | Пользователь написал «разрешаю» в текущем чате; approval записан через `workflow:approve`. |

| Page | Page id | Blocks | Source sections |
|---|---|---:|---|
| 00 Обзор, выводы и рамка исследования | `37964731-74e5-816c-bcb0-df2fc1d81708` | 149 | Сводка исследования |
| 02 Конкуренты, активы A3 и стратегия | `37964731-74e5-811a-926c-ca7f11ae3e9e` | 51 | Матрица позиционирования, Конкурентный анализ |
| 03 Прото-персоны | `37964731-74e5-81e5-832f-d1c8c501e849` | 32 | Прото-персоны |
| 04 Синтетические интервью и вопросы для интервью | `37964731-74e5-8125-be5b-d1a693352522` | 24 | Синтетические интервью |
| 05 CJM и сценарии | `37964731-74e5-8143-848d-d02eed7b9b51` | 81 | Сценарий 1, Сценарий 2, CJM и карта сценариев |
| 06 ICE/RICE бэклог и инициативы | `37964731-74e5-819c-b11f-ef971b3387d2` | 61 | ICE/RICE бэклог, Возможности, приоритизация ICE/RICE и дорожная карта |
| 07 Roadmap и SWOT | `37964731-74e5-810f-8166-f28046c78969` | 26 | SWOT-анализ |
| 08 План валидации, провайдеры и источники | `37964731-74e5-81bf-801f-ec9cbba6e45f` | 18 | Источники и журнал доказательств |
| 09 Дополнительные материалы | `37964731-74e5-81de-b8db-ec6eee7e1a5b` | 16 | Статус публикационного пакета, Использованные входные артефакты |

## Anti-Slop Republication 2026-06-09

После explicit approval пользователя опубликована новая актуальная версия research hub после Anti-AI-Slop pass. Старая страница `3796473174e581b1bff5f189cc8c0887` не удалялась и остается предыдущей версией; новый hub создан рядом под тем же parent page.

| Field | Value |
|---|---|
| Status | published |
| Target parent page | `3696473174e58006af5fd367ef89d978` |
| Previous hub | `3796473174e581b1bff5f189cc8c0887` |
| Hub title | A3 Pay: исследование после anti-slop pass, 2026-06-09 |
| Hub page id | `37a64731-74e5-81e1-8cf5-e6466d61f3fe` |
| Hub URL | https://app.notion.com/p/37a6473174e581e18cf5e6466d61f3fe |
| Child pages | 9 |
| Published blocks | 624 |
| Source artifact | `notion-research-export-ru.md` |
| Export size | 124,570 bytes |
| Approval | Пользователь написал «разрешаю публикацию»; approval записан для `notion_hub:3796473174e581b1bff5f189cc8c0887` и `notion_parent:3696473174e58006af5fd367ef89d978`. |
| PRD publication | not_published; `prd.md` остается локальным артефактом до отдельного `notion_prd_export` approval. |

| Gate | Status | Evidence |
|---|---|---|
| Research Content Lint | pass | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07`. |
| Publication Shape Gate | pass | Dry-run: 9 child pages, 605 estimated blocks, tables for personas/CJM/competitors/ICE/RICE. |
| Publication Completeness Gate | pass | Export/source ratio 1.139+ after regeneration from full research pack. |
| Publication Cross-Link Gate | pass | Hub contains `Карта связей исследования` and `Цепочка решений` with Notion page mentions. |
| Notion write | completed | Script created hub `37a64731-74e5-81e1-8cf5-e6466d61f3fe` and 9 child pages. |
| Notion fetch verification | pass | MCP fetch confirmed hub title, parent, child pages, cross-link map and decision chain. |

| Page | Page id | Blocks | Source sections |
|---|---|---:|---|
| 00 Обзор, выводы и рамка исследования | `37a64731-74e5-8177-8245-eb276e579cb4` | 196 | Карта связей исследования, Цепочка решений, Сводка исследования |
| 02 Конкуренты, активы A3 и стратегия | `37a64731-74e5-81ea-84f6-d2774c72723f` | 51 | Матрица позиционирования, Конкурентный анализ |
| 03 Прото-персоны | `37a64731-74e5-8154-9b85-dabc75758dd2` | 32 | Прото-персоны |
| 04 Синтетические интервью и вопросы для интервью | `37a64731-74e5-8139-a4c3-f538f4e8fe8e` | 24 | Синтетические интервью |
| 05 CJM и сценарии | `37a64731-74e5-81d0-b078-f111191cf360` | 161 | Сценарий 1, Сценарий 2, CJM и карта сценариев |
| 06 ICE/RICE бэклог и инициативы | `37a64731-74e5-81cd-b33c-e88e1431e905` | 81 | ICE/RICE бэклог, Возможности, приоритизация ICE/RICE и дорожная карта |
| 07 Roadmap и SWOT | `37a64731-74e5-8134-9839-f6ec67678ab2` | 26 | SWOT-анализ |
| 08 План валидации, провайдеры и источники | `37a64731-74e5-8180-87d6-ce1e7f6f05b8` | 18 | Источники и журнал доказательств |
| 09 Дополнительные материалы | `37a64731-74e5-8198-af49-ead081013beb` | 16 | Статус публикационного пакета, Использованные входные артефакты |

## PRD Publication 2026-06-09

По явному запросу пользователя PRD опубликован как дочерняя страница внутри последнего research hub, а не как новый отдельный hub.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_prd_export` |
| Target hub | `37a6473174e581e18cf5e6466d61f3fe` |
| Target hub URL | https://app.notion.com/p/37a6473174e581e18cf5e6466d61f3fe |
| PRD page title | 10 PRD для MVP |
| PRD page id | `37a64731-74e5-81b6-81c3-ce6d25e3cced` |
| PRD page URL | https://app.notion.com/p/37a6473174e581b681c3ce6d25e3cced |
| Source artifact | `notion-prd-export.md` |
| Source PRD | `prd.md` |
| Published blocks | 43 |
| Approval | `notion_prd_export` approved for `notion_hub:37a6473174e581e18cf5e6466d61f3fe` from current chat request. |

| Gate | Status | Evidence |
|---|---|---|
| Russian Publication Gate | pass | Export rewritten with Russian visible headings/table headers; technical terms kept where appropriate. |
| Internal Inputs Gate | pass | `notion-prd-export.md` does not include `Inputs Used`, `Artifact Metadata`, `Surface Output Contract` or internal audit sections. |
| Notion write | completed | `publish-notion-research-page.mjs` created child page under latest research hub. |
| Notion fetch verification | pass | MCP fetch confirmed page title, parent hub and structured Russian blocks. |
| Hub navigation update | pass | Hub navigation now lists `10 PRD для MVP`; publication evidence count updated from 9 to 10 child pages. |

## Database Layer Publication 2026-06-09

По команде пользователя после data-shape анализа опубликован рабочий database layer внутри последнего research hub.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_agile_export` |
| Target hub | `37a6473174e581e18cf5e6466d61f3fe` |
| Layout strategy | `hybrid`: child pages + database indexes |
| Created databases | 6 |
| Created rows | 38 |
| Result artifact | `notion-database-layer-result.md` |
| Verification | Hub fetch confirmed database blocks and `Рабочие базы исследования` section. |

| Database | URL | Rows |
|---|---|---:|
| A3 Pay Personas | https://app.notion.com/p/eae05652b09a4a1aa9fc067b5bae5360 | 4 |
| A3 Pay CJM Frictions | https://app.notion.com/p/c85e8fdbc1b44b6fa29e758e1139e424 | 5 |
| A3 Pay Opportunities | https://app.notion.com/p/16ecd4be3abc45519c18f2c3cb0f7f58 | 7 |
| A3 Pay Requirements | https://app.notion.com/p/504373cf876d4677af3f204e2f8b1bbd | 7 |
| A3 Pay Validation Claims | https://app.notion.com/p/ed019efe51ba4a208c72c6a68db481f7 | 5 |
| A3 Pay Sources | https://app.notion.com/p/866047a1dabf446baff447987aeabf78 | 10 |

## Integrated Hybrid Layer 2026-06-09

После замечания пользователя о том, что отдельные страницы и отдельные базы не ощущаются цельным рабочим артефактом, опубликован комбинированный слой: базы остались доступными как самостоятельные indexes, но их linked views встроены в релевантные дочерние страницы.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_agile_export` integrated hybrid pass |
| Target hub | `37a6473174e581e18cf5e6466d61f3fe` |
| Target hub URL | https://app.notion.com/p/37a6473174e581e18cf5e6466d61f3fe |
| Embedded linked views | 6 |
| Verification | Notion fetch confirmed inline database blocks on personas, CJM, PRD and validation/source pages. |

| Child page | Linked database view | Data source |
|---|---|---|
| `03 Прото-персоны` | Рабочая база персон | `collection://e2fc525b-229d-41ae-a6b5-3b435a9fa6ab` |
| `05 CJM и сценарии` | Рабочая база CJM-трений | `collection://442cc17e-09df-42c4-a395-c53ee3112298` |
| `06 ICE/RICE бэклог и инициативы` | Рабочий backlog возможностей | `collection://d56fd360-90bb-4b34-ab7f-16b9223b2407` |
| `10 PRD для MVP` | Рабочая база требований | `collection://8325a825-6feb-40d0-8c85-fc0d237f81c2` |
| `08 План валидации, провайдеры и источники` | Рабочая база гипотез для проверки | `collection://4e1922db-0717-4476-b5f3-1676ab983121` |
| `08 План валидации, провайдеры и источники` | Рабочая база источников | `collection://3731e5b8-d306-4034-834a-0286f63b6e39` |

## Source Rules Sync Dry Run 2026-06-09

После обновления исходных правил публикации локальный export пересобран из полного research pack новым `Publication Editor Pass`. Это локальная синхронизация источников и выводов; внешняя запись в Notion не выполнялась.

| Field | Value |
|---|---|
| Status | dry_run_pass |
| Source artifact | `notion-research-export-ru.md` |
| Export size | 104,839 bytes |
| Source pack size | 109,378 bytes |
| Export/source ratio | 0.959 |
| Layout strategy | `integrated_hybrid` |
| Planned child pages | 8 |
| Estimated blocks | 453 |
| External write | not_performed |

| Gate | Status | Evidence |
|---|---|---|
| Publication Shape Gate | pass | Personas, CJM, competitive matrix and ICE/RICE распознаны как таблицы/схемы. |
| Publication Completeness Gate | pass | Export собран из полного source pack, ratio 0.959. |
| Publication Editor Pass | pass | Public export очищен от internal ledger/debug sections; `entity_ownership_map` построен для personas, CJM frictions, opportunities, validation claims и sources. |
| Research Content Lint | pass | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07\notion-research-export-ru.md`. |
| Notion dry-run | pass | `publication_allowed=true`, blockers пустые, `layout_strategy=integrated_hybrid`. |

## New Rules Publication 2026-06-09

После approval пользователя `разрешаю публикацию` опубликована последняя исправленная research-версия по новым правилам. Эта версия создана под тем же parent page как новый hub; предыдущие Notion-публикации не удалялись.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_research_publish` |
| Target parent page | `3696473174e58006af5fd367ef89d978` |
| Hub title | A3 Pay: исследование платежных сценариев России - версия по новым правилам |
| Hub page id | `37a64731-74e5-81ef-a178-ebd2bdaa422b` |
| Hub URL | https://app.notion.com/p/37a6473174e581efa178ebd2bdaa422b |
| Source artifact | `notion-research-export-ru.md` |
| Child pages | 8 |
| Published blocks | 471 |
| Layout strategy | `integrated_hybrid` |

| Gate | Status | Evidence |
|---|---|---|
| Approval record | pass | `workflow:approve ... notion_research_publish --target 3696473174e58006af5fd367ef89d978`. |
| Research Content Lint | pass | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07`. |
| Public export lint | pass | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07\notion-research-export-ru.md`. |
| Notion dry-run | pass | `publication_allowed=true`, blockers empty, `layout_strategy=integrated_hybrid`. |
| External write | completed | Hub and 8 child pages created. |
| Notion fetch verification | pass | MCP fetch confirmed hub title, parent, child pages, Russian navigation and `08 План валидации и источники`. |

| Page | Page id |
|---|---|
| `00 Обзор, выводы и рамка исследования` | `37a64731-74e5-8178-8c55-f5408646adc7` |
| `02 Конкуренты, активы A3 и стратегия` | `37a64731-74e5-818c-b719-f317b0112333` |
| `03 Прото-персоны` | `37a64731-74e5-81a2-9ca0-c219b42aeb55` |
| `04 Синтетические интервью и вопросы для интервью` | `37a64731-74e5-8148-84ca-ffed71d6655a` |
| `05 CJM и сценарии` | `37a64731-74e5-81ea-8e9c-dfa90e2e3208` |
| `06 ICE/RICE бэклог и инициативы` | `37a64731-74e5-81b6-83a8-f85890b203fe` |
| `07 Roadmap и SWOT` | `37a64731-74e5-8124-8208-cb0df1ddf383` |
| `08 План валидации и источники` | `37a64731-74e5-81c3-8553-e7654b586c57` |

## New Rules Integrated Hybrid Database Layer 2026-06-09

После публикации нового hub выполнен research-only database pass, чтобы рабочие базы были встроены в смысловые страницы, а не жили отдельно от narrative.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_agile_export` |
| Target hub | `37a64731-74e5-81ef-a178-ebd2bdaa422b` |
| Approval | `notion_agile_export` approved for `notion_hub:37a6473174e581efa178ebd2bdaa422b` |
| Created databases | 5 |
| Created rows | 27 |
| Embedded linked views | 5 |
| Verification | Notion fetch confirmed inline database blocks on personas, CJM, opportunities and validation/source child pages. |

| Database | URL | Data source | Rows |
|---|---|---|---:|
| A3 Pay Personas - new rules | https://app.notion.com/p/be0c2a67a0ee4ba79228d88434dc1d49 | `collection://98ae66ee-82f2-40ce-8221-142891cd89d3` | 4 |
| A3 Pay CJM Frictions - new rules | https://app.notion.com/p/1f37477446b04499a36bdaf224d76221 | `collection://28ebf2a2-5eef-4653-985f-846c9f525be2` | 5 |
| A3 Pay Opportunities - new rules | https://app.notion.com/p/92505c076681446da13573f3a0047e0b | `collection://491a4629-9c54-4eda-8acb-0295f2b7b456` | 7 |
| A3 Pay Validation Claims - new rules | https://app.notion.com/p/512347001be3476993bd83902daa1fae | `collection://555d104f-b503-4ff9-bda4-d8c607f7bb63` | 5 |
| A3 Pay Sources - new rules | https://app.notion.com/p/6a7d441dbab74202964e804e02c25463 | `collection://c8ca0456-e9b5-431f-abed-e9cbc7cc875f` | 6 |

| Child page | Linked database view | View id | Data source |
|---|---|---|---|
| `03 Прото-персоны` | Рабочая база персон | `view://37a64731-74e5-8198-85c8-000c07b69f67` | `collection://98ae66ee-82f2-40ce-8221-142891cd89d3` |
| `05 CJM и сценарии` | Рабочая база CJM-трений | `view://37a64731-74e5-8196-b451-000c2b7bac0f` | `collection://28ebf2a2-5eef-4653-985f-846c9f525be2` |
| `06 ICE/RICE бэклог и инициативы` | Рабочий backlog возможностей | `view://37a64731-74e5-81bf-9d8a-000cdddac936` | `collection://491a4629-9c54-4eda-8acb-0295f2b7b456` |
| `08 План валидации и источники` | Рабочая база гипотез для проверки | `view://37a64731-74e5-8111-8ea5-000cda434914` | `collection://555d104f-b503-4ff9-bda4-d8c607f7bb63` |
| `08 План валидации и источники` | Рабочая база источников | `view://37a64731-74e5-81f0-ab66-000c3cc14e5a` | `collection://c8ca0456-e9b5-431f-abed-e9cbc7cc875f` |

## New Rules PRD Publication 2026-06-09

По запросу пользователя `закинь prd` PRD добавлен в последний опубликованный research hub по новым правилам.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_prd_export` |
| Target hub | `37a64731-74e5-81ef-a178-ebd2bdaa422b` |
| PRD page title | `10 PRD для MVP` |
| PRD page id | `37a64731-74e5-817e-9542-ed85a6dcdcc5` |
| PRD page URL | https://app.notion.com/p/37a6473174e5817e9542ed85a6dcdcc5 |
| Source artifact | `notion-prd-export.md` |
| Published blocks | 43 |
| Hub navigation | updated; child page count changed from 8 to 9 |

| Gate | Status | Evidence |
|---|---|---|
| Approval record | pass | `workflow:approve ... notion_prd_export --target notion_hub:37a6473174e581efa178ebd2bdaa422b`. |
| Notion write | completed | `publish-notion-research-page.mjs` created PRD child page under new rules hub. |
| Notion fetch verification | pass | MCP fetch confirmed page title, parent hub, Russian PRD content and target hub id in export table. |
| Hub navigation update | pass | Hub now lists `10 PRD для MVP` and publication evidence says 9 child pages. |
| PRD export lint | pass | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07\notion-prd-export.md` passes after adding `CJM-связка PRD`, key cases and сквозной user flow. |

## New Rules PRD Requirements Database 2026-06-09

Чтобы PRD был частью цельного workspace, а не только текстовой страницей, создана база требований и встроена linked view в страницу PRD.

| Field | Value |
|---|---|
| Status | published |
| Database | A3 Pay Requirements - new rules |
| Database URL | https://app.notion.com/p/6a688cd26de549e3a5e643ebcc5fc3df |
| Data source | `collection://f45e31a7-545c-4d53-910e-6be840a0f73a` |
| Rows | 14 |
| Embedded view | `view://37a64731-74e5-8198-92c8-000cf76f1d65` |
| Verification | Notion fetch confirmed inline database block on PRD page. |
| CJM block | published | Notion PRD page includes `CJM-связка PRD`, key cases and сквозной user flow under CJM. |
