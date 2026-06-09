# Результат публикации database layer в Notion

## Inputs Used

- `notion-research-export-ru.md`
- `notion-prd-export.md`
- `prd.md`
- `notion-publication-result.md`
- `stage-gate-ledger.md`
- `approval-state.json`

## Publication Record

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_agile_export` |
| Target hub | `37a6473174e581e18cf5e6466d61f3fe` |
| Target hub URL | https://app.notion.com/p/37a6473174e581e18cf5e6466d61f3fe |
| Approval | `notion_agile_export` approved for `notion_hub:37a6473174e581e18cf5e6466d61f3fe` |
| Layout strategy | `hybrid`: research/PRD child pages + database indexes |
| Created databases | 6 |
| Created rows | 38 |
| Embedded linked views | 6 |
| Verification | Notion fetch confirmed database blocks on hub and linked database views inside relevant child pages |

## Created Databases

| Database | Database URL | Data source | Rows | Purpose |
|---|---|---|---:|---|
| A3 Pay Personas | https://app.notion.com/p/eae05652b09a4a1aa9fc067b5bae5360 | `collection://e2fc525b-229d-41ae-a6b5-3b435a9fa6ab` | 4 | Сегменты, боли, задачи и статус доказательств. |
| A3 Pay CJM Frictions | https://app.notion.com/p/c85e8fdbc1b44b6fa29e758e1139e424 | `collection://442cc17e-09df-42c4-a395-c53ee3112298` | 5 | Трения по этапам CJM, сценарии, метрики и приоритеты. |
| A3 Pay Opportunities | https://app.notion.com/p/16ecd4be3abc45519c18f2c3cb0f7f58 | `collection://d56fd360-90bb-4b34-ab7f-16b9223b2407` | 7 | ICE/RICE backlog и validation method. |
| A3 Pay Requirements | https://app.notion.com/p/504373cf876d4677af3f204e2f8b1bbd | `collection://8325a825-6feb-40d0-8c85-fc0d237f81c2` | 7 | PRD requirements, priority, evidence и acceptance signal. |
| A3 Pay Validation Claims | https://app.notion.com/p/ed019efe51ba4a208c72c6a68db481f7 | `collection://4e1922db-0717-4476-b5f3-1676ab983121` | 5 | Гипотезы, метод проверки и решение, которое разблокируется. |
| A3 Pay Sources | https://app.notion.com/p/866047a1dabf446baff447987aeabf78 | `collection://3731e5b8-d306-4034-834a-0286f63b6e39` | 10 | Источники, URL, evidence quality и дата проверки. |

## Integrated Linked Views

После замечания пользователя о разрыве между страницами и отдельными базами выбран комбинированный вариант `integrated_hybrid`: каждая рабочая база остается самостоятельной database index, но дополнительно встроена как linked database view в смысловую дочернюю страницу исследования. Так Notion hub читается как цельный артефакт: сначала контекст и выводы, ниже живая таблица для фильтрации, сортировки и обновления.

| Child page | Embedded view | View id | Data source | Verification |
|---|---|---|---|---|
| `03 Прото-персоны` | Рабочая база персон | `view://37a64731-74e5-818c-8124-000c2c8e36d0` | `collection://e2fc525b-229d-41ae-a6b5-3b435a9fa6ab` | Notion fetch confirms inline database block on page. |
| `05 CJM и сценарии` | Рабочая база CJM-трений | `view://37a64731-74e5-81a3-a1fc-000ce2714ed9` | `collection://442cc17e-09df-42c4-a395-c53ee3112298` | Notion fetch confirms inline database block on page. |
| `06 ICE/RICE бэклог и инициативы` | Рабочий backlog возможностей | `view://37a64731-74e5-810a-974f-000c50c121e9` | `collection://d56fd360-90bb-4b34-ab7f-16b9223b2407` | Linked view created under opportunities page; sorted by `Priority`. |
| `10 PRD для MVP` | Рабочая база требований | `view://37a64731-74e5-81c5-81e9-000c4c0da073` | `collection://8325a825-6feb-40d0-8c85-fc0d237f81c2` | Notion fetch confirms inline database block on PRD page. |
| `08 План валидации, провайдеры и источники` | Рабочая база гипотез для проверки | `view://37a64731-74e5-81c7-aedf-000c046678c1` | `collection://4e1922db-0717-4476-b5f3-1676ab983121` | Notion fetch confirms inline database block on page. |
| `08 План валидации, провайдеры и источники` | Рабочая база источников | `view://37a64731-74e5-81c6-b4cf-000cc68bad5b` | `collection://3731e5b8-d306-4034-834a-0286f63b6e39` | Notion fetch confirms inline database block on page. |

## Working Shape Decision

| Area | Shape |
|---|---|
| Читательский слой | Hub + дочерние страницы с narrative, таблицами и пояснениями. |
| Рабочий слой | Linked database views встроены прямо в релевантные страницы. |
| Индексный слой | Отдельные database pages остаются доступны для полного просмотра, отношений и будущей автоматизации. |
| Что не сделано | Database relations между сущностями не добавлены; это отдельный pass, если нужно строить полноценный операционный backlog. |

## Notes

- Relations between databases were not added in this pass. The recommended working chain is recorded on the hub: `Persona -> CJM friction -> Opportunity -> Requirement -> Acceptance signal -> Validation claim -> Source`.
- Requirements database title property was renamed from `ID` to `Requirement ID`, because the Notion connector rejected row creation for a title property named `ID`.
- `notion_query_data_sources` was unavailable in the current connector runtime (`Tool notion-query-data-sources not found`), so row verification is based on successful create responses and fetch verification of hub/child pages.
