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

## New Rules Hub Database Layer 2026-06-09

После публикации нового research hub `A3 Pay: исследование платежных сценариев России - версия по новым правилам` создан отдельный research-only database layer. В этом hub PRD не публиковался, поэтому requirements database намеренно не создавалась.

| Field | Value |
|---|---|
| Status | published |
| Action | `notion_agile_export` |
| Target hub | `37a64731-74e5-81ef-a178-ebd2bdaa422b` |
| Target hub URL | https://app.notion.com/p/37a6473174e581efa178ebd2bdaa422b |
| Approval | `notion_agile_export` approved for `notion_hub:37a6473174e581efa178ebd2bdaa422b` |
| Layout strategy | `integrated_hybrid`: research child pages + embedded database views |
| Created databases | 5 |
| Created rows | 27 |
| Embedded linked views | 5 |
| Verification | Notion fetch confirmed linked database blocks inside relevant child pages. |

## New Rules Created Databases

| Database | Database URL | Data source | Rows | Purpose |
|---|---|---|---:|---|
| A3 Pay Personas - new rules | https://app.notion.com/p/be0c2a67a0ee4ba79228d88434dc1d49 | `collection://98ae66ee-82f2-40ce-8221-142891cd89d3` | 4 | Сегменты, ситуации, боли и evidence status. |
| A3 Pay CJM Frictions - new rules | https://app.notion.com/p/1f37477446b04499a36bdaf224d76221 | `collection://28ebf2a2-5eef-4653-985f-846c9f525be2` | 5 | Трения по CJM, сценарии, метрики и приоритеты. |
| A3 Pay Opportunities - new rules | https://app.notion.com/p/92505c076681446da13573f3a0047e0b | `collection://491a4629-9c54-4eda-8acb-0295f2b7b456` | 7 | Возможности, ICE/RICE и метод проверки. |
| A3 Pay Validation Claims - new rules | https://app.notion.com/p/512347001be3476993bd83902daa1fae | `collection://555d104f-b503-4ff9-bda4-d8c607f7bb63` | 5 | Гипотезы, проверка и решение, которое разблокируется. |
| A3 Pay Sources - new rules | https://app.notion.com/p/6a7d441dbab74202964e804e02c25463 | `collection://c8ca0456-e9b5-431f-abed-e9cbc7cc875f` | 6 | Источники, URL, тип и качество доказательства. |

## New Rules Integrated Linked Views

| Child page | Embedded view | View id | Data source | Verification |
|---|---|---|---|---|
| `03 Прото-персоны` | Рабочая база персон | `view://37a64731-74e5-8198-85c8-000c07b69f67` | `collection://98ae66ee-82f2-40ce-8221-142891cd89d3` | Notion fetch confirms inline database block on page. |
| `05 CJM и сценарии` | Рабочая база CJM-трений | `view://37a64731-74e5-8196-b451-000c2b7bac0f` | `collection://28ebf2a2-5eef-4653-985f-846c9f525be2` | Notion fetch confirms inline database block on page. |
| `06 ICE/RICE бэклог и инициативы` | Рабочий backlog возможностей | `view://37a64731-74e5-81bf-9d8a-000cdddac936` | `collection://491a4629-9c54-4eda-8acb-0295f2b7b456` | Notion fetch confirms inline database block on page. |
| `08 План валидации и источники` | Рабочая база гипотез для проверки | `view://37a64731-74e5-8111-8ea5-000cda434914` | `collection://555d104f-b503-4ff9-bda4-d8c607f7bb63` | Notion fetch confirms inline database block on page. |
| `08 План валидации и источники` | Рабочая база источников | `view://37a64731-74e5-81f0-ab66-000c3cc14e5a` | `collection://c8ca0456-e9b5-431f-abed-e9cbc7cc875f` | Notion fetch confirms inline database block on page. |

## New Rules PRD Requirements Layer 2026-06-09

После добавления PRD в новый hub создана отдельная база требований и встроена в страницу PRD как linked database view.

| Field | Value |
|---|---|
| Status | published |
| Target PRD page | `37a64731-74e5-817e-9542-ed85a6dcdcc5` |
| Database | A3 Pay Requirements - new rules |
| Database URL | https://app.notion.com/p/6a688cd26de549e3a5e643ebcc5fc3df |
| Data source | `collection://f45e31a7-545c-4d53-910e-6be840a0f73a` |
| Rows | 14 |
| Linked view | Рабочая база требований |
| View id | `view://37a64731-74e5-8198-92c8-000cf76f1d65` |
| Verification | Notion fetch confirms inline database block on `10 PRD для MVP`. |
