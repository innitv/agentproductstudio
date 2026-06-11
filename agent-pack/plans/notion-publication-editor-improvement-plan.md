# План улучшения Notion-публикаций: Publication Editor Pass

## Цель

Сделать так, чтобы будущие Notion-публикации создавались как цельные рабочие пространства, а не как механический экспорт всех research artifacts. Правка должна жить в истоках: правилах, templates, agents и tooling scripts, а не в одной уже опубликованной странице.

## Наблюдения по последнему A3 Pay research

| Проблема | Где проявилась | Почему это мешает |
|---|---|---|
| Дублирование overview | `Карта связей исследования` и `Цепочка решений` есть в начале export и повторяются внутри `Сводка исследования` | Читатель видит не навигацию, а повтор одной и той же структуры. |
| Внутренний ledger попал в публичный слой | `Статус публикационного пакета`, `Метаданные артефакта`, `Проверка формы публикации`, provider policy | Это нужно агенту и QA, но не пользователю Notion workspace. |
| Сущности повторяются как Markdown tables и как базы | Personas, CJM, ICE/RICE, sources | После появления database layer Markdown-дубли должны стать коротким контекстом или исчезнуть. |
| `Сводка исследования` слишком многофункциональна | Summary содержит вопросы, источники, персоны, CJM, backlog, shape gate | Сводка должна быть decision page, а не второй research pack внутри research pack. |
| Synthetic interviews выглядят как самостоятельное доказательство | Отдельная страница interviews | Нужно подавать как материал для проверки гипотез, лучше в validation layer/database. |
| Publication record смешивается с public artifact | `notion-publication-result.md` правильный, но export тоже содержит часть служебных блоков | Нужен жесткий public/private split. |

## Вдохновение из GitHub/open-source

| Источник | Практика, которую берем |
|---|---|
| GitHub Agentic Workflows Markdown docs: https://github.github.com/gh-aw/reference/markdown/ | Инструкции должны быть редактируемыми Markdown-источниками, с четкой организацией и без смешивания workflow trace с финальным output. |
| `tryfabric/martian`: https://github.com/tryfabric/martian | Markdown нужно конвертировать через структурированную модель blocks/AST, а не строковыми хаками. Для нас это означает section ownership и filter pass перед Notion blocks. |
| `davialabs/davia`: https://github.com/davialabs/davia | Документация для агентов должна быть interactive/editable, но локальные source docs остаются первоисточником. Для нас: Notion workspace является рабочей поверхностью, а local artifacts остаются source of truth. |
| `luuisotorres/atlas-ai-agent`: https://github.com/luuisotorres/atlas-ai-agent | Pipeline стоит делить на extraction/research/synthesis/publish. Для нас: отдельный Publication Editor Pass между synthesis и publish. |
| `makenotion/notion-mcp-server`: https://github.com/makenotion/notion-mcp-server | Notion write должен работать через structured page/block edits и verification, а не через raw dump. |

## Целевой принцип

Перед публикацией Notion проходит `Publication Editor Pass`:

1. Разделяет public content и internal ledger.
2. Назначает ownership каждой сущности: где она живет как narrative, table block или database view.
3. Удаляет повторные overview/control sections из дочерних страниц.
4. Сжимает overview до decision page.
5. Переводит рабочие сущности в `integrated_hybrid`: database index + linked view на релевантной странице.
6. Записывает подробный publication record отдельно, не в публичный hub.

## Целевая структура будущего Notion workspace

| Страница | Что содержит | Что не содержит |
|---|---|---|
| `00 Обзор решений` | 5-7 решений, next actions, links to child pages/databases | provider tables, shape gates, duplicate personas/CJM/backlog tables |
| `01 Карта продукта` | цепочка `персона -> сценарий -> трение -> возможность -> требование -> проверка` | полные таблицы всех сущностей |
| `02 Персоны и сегменты` | короткий контекст + embedded personas database view | вторая Markdown-копия database rows |
| `03 CJM и трения` | сквозной flow + embedded CJM frictions view + detailed scenarios | повтор ранних мини-CJM tables |
| `04 Возможности и roadmap` | rationale order + embedded opportunities/backlog view | отдельные дубли ICE и RICE, если это уже view |
| `05 PRD и требования` | PRD narrative + embedded requirements/user stories view | internal PRD metadata/inputs |
| `06 Валидация и источники` | validation claims view + sources view + provider limitations | synthetic interviews как real evidence |
| `07 Журнал публикации` | optional internal/private publication record | не включается в public hub по умолчанию |

## Рабочие задачи

| ID | Задача | Файлы-истоки | Definition of Done |
|---|---|---|---|
| PEP-01 | Добавить правило `Publication Editor Pass` | `AGENTS.md`, `artifact-driven-pipeline.md`, `notion-publisher.agent.md`, `notion-sync/SKILL.md`, `quality-gates.md` | Правила требуют public/private split, dedupe и section ownership до Notion write. |
| PEP-02 | Расширить Surface Output Contract | `surface-output-contract.template.md`, research/PRD templates | Контракт содержит `public_content_map`, `internal_record_map`, `dedupe_plan`, `entity_ownership_map`. |
| PEP-03 | Обновить генератор export | `tooling/scripts/generate-notion-research-export.mjs` | Export больше не вставляет `Статус публикационного пакета`, duplicate cross-link sections, artifact metadata и publication shape gate в public markdown. |
| PEP-04 | Добавить publication editor/dedupe lint | `publish-notion-research-hub.mjs`, `lint-research-content.mjs` или новый helper | Dry-run показывает `publication_editor_gate`; duplicate section ownership и internal sections блокируют publication или дают `needs_revision`. |
| PEP-05 | Усилить dry-run shape plan | `publish-notion-research-hub.mjs` | `notion_data_shape_plan` содержит `embedded_database_views`, `section_ownership`, `public_private_split`, `dedupe_actions`. |
| PEP-06 | Закрепить config validation | `validate-config.mjs` | `yarn validate:config` падает, если `Publication Editor Pass`/dedupe/integrated hybrid правила исчезают из source files. |
| PEP-07 | Проверить на A3 Pay dry-run без внешней записи | scripts only | Dry-run текущего export показывает меньше дублей и корректный `integrated_hybrid`; Notion write не выполняется без отдельного approval. |

## Не цели

- Не переписывать вручную последнюю опубликованную Notion-страницу в рамках этого плана.
- Не удалять существующие publication records и run artifacts.
- Не делать внешнюю запись в Notion без отдельного exact approval.
- Не заменять локальные artifacts как source of truth.

## Порядок выполнения

1. PEP-01, PEP-02, PEP-06: сначала нормативный слой и проверка сохранности правил.
2. PEP-03, PEP-04, PEP-05: потом tooling, чтобы будущие exports реально менялись.
3. PEP-07: локальная проверка на A3 Pay через dry-run/lint без внешней публикации.

## Статус синхронизации

Обновлено: 2026-06-09.

| ID | Статус | Что синхронизировано |
|---|---|---|
| PEP-01 | done | `AGENTS.md`, `artifact-driven-pipeline.md`, `notion-publisher.agent.md`, `notion-sync/SKILL.md`, `quality-gates.md` требуют `Publication Editor Pass`, public/private split, dedupe и ownership до Notion write. |
| PEP-02 | done | `surface-output-contract.template.md`, research и PRD templates содержат public/internal split, entity ownership и `integrated_hybrid` правила. |
| PEP-03 | done | `generate-notion-research-export.mjs` и related publication flow очищают public export от internal ledger/control sections. |
| PEP-04 | done | `publish-notion-research-hub.mjs` проверяет `publication_editor_gate`, duplicate/control sections и publication blockers на dry-run. |
| PEP-05 | done | Dry-run shape plan содержит `notion_data_shape_plan`, `database_index_candidates`, `embedded_database_views` и `integrated_hybrid`. |
| PEP-06 | done | `validate-config.mjs` закрепляет Publication Editor Pass, integrated hybrid и anti-slop snippets как config invariants. |
| PEP-07 | done | A3 Pay run проходит local dry-run/lint/sync; внешняя Notion write не выполнялась в этом sync pass. |

Дополнительная синхронизация 2026-06-09: DeepSeek/Gemini удалены из default research run и оставлены только как explicit opt-in advisory checks. Это не меняет Publication Editor Pass напрямую, но защищает будущие Notion exports от слабого provider synthesis как источника фактов.
