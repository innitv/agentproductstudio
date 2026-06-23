---
agent_name: notion-publisher
owner_stage_ids: []
required_inputs:
  - prd
  - recursive_brief
  - research_summary
  - scenario_user_flows
  - competitive_analysis
  - proto_personas
  - synthetic_interviews
  - swot
  - stage_gate_ledger
  - release_notes
  - notion_target
  - approval_record
required_outputs:
  - notion_prd_export
approval_actions:
  - notion_research_publish
  - notion_prd_export
  - notion_agile_export
skills:
  - notion-sync
contract_schema: agent-pack/schemas/agent-output.schema.json
---

# Notion Publisher Agent (Агент Публикации в Notion)

## Purpose (Предназначение)

Подготавливает экспорт результатов исследований для Notion и публикует их после получения одобрения. Для полноценных воркфлоу продуктов публикация отдельной дочерней страницы с исследованиями в Notion обязательна (research-only child page publication is mandatory). При наличии `prd.md` и `proto-personas.md` агент также обеспечивает интерактивный экспорт User Stories и Персон в виде связанных баз данных (Agile Board) с Relation-связями и чек-листами Acceptance Criteria. Если одобрение, родительская страница, токен доступа или права отсутствуют, возвращается статус `partial`/`blocked` с указанием конкретной блокирующей причины.

## Inputs (Входные данные)

- `prd.md`
- `recursive-brief.md`
- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- Целевая родительская страница Notion или ранее настроенная страница проекта Notion
- Запись о получении одобрения пользователя (`approval_record`), если предоставлена

## Internal Pipeline (Внутренний процесс)

1. Проверить наличие полного research pack и его читаемость для человека: `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, а также `cjm-map.md`/`opportunity-roadmap.md`/доменные матрицы, если они есть.
2. Создать русскоязычный экспорт только для результатов исследований без схем, YAML frontmatter, необработанного JSON или полных дампов кодовых блоков.
3. Сформировать Surface Output Contract для `notion_wiki`: expected hub/child pages/databases/sections, coverage gate по research pack, evidence-to-output map, Russian Publication Gate, cross-link coverage и verification plan.
4. Сформировать publication plan и dry-run/preview до внешней записи: target, mode, layout strategy, source artifacts, checksum, block/page/database count, database schema, unsupported blocks, expected writes, `notion_data_shape_plan` и результаты `Publication Shape Gate`, `Publication Editor Pass`, `Publication Completeness Gate`, `Publication Cross-Link Gate`.
4. Если целевая страница, интерактивное approval или publication shape gate отсутствуют, создать резервный файл Markdown и установить статус `partial` или `blocked` с `recommended_next_step` для получения approval или исправления export. Не позволять Оркестратору завершать воркфлоу со статусом `success` без публикации.
5. Если целевая страница и одобрение получены, выбрать способ публикации по объему: короткий export — отдельная дочерняя страница (separate Notion child page); подробный research pack — hub page с дочерними страницами по разделам; рабочие сущности — базы данных. Если одновременно есть child pages и базы, использовать `integrated_hybrid`: встроить базы как linked database views в релевантные страницы.
6. До approval и внешней записи выполнить Publication Completeness Gate: `notion-research-export-ru.md` должен быть собран из всех доступных research artifacts, а не из краткой выжимки. Если export существенно меньше полного source pack или не покрывает ключевые разделы (`scenario-user-flows`, `personas`, `CJM`, competitors, ICE/RICE/backlog, roadmap/SWOT/sources), вернуть `partial/needs_revision` и регенерировать export.
7. До approval и внешней записи выполнить Publication Editor Pass: убрать internal ledger/debug sections из public export, удалить duplicate control sections, назначить владельца каждой сущности (`entity_ownership_map`) и оставить publication trace только в local records. Если overview повторяет содержимое child pages вместо decision/navigation layer, вернуть `partial/needs_revision`.
8. До approval и внешней записи выполнить Publication Cross-Link Gate: подробный hub должен содержать `Карта связей исследования` и `Цепочка решений`, а ссылки на personas, CJM, ICE/RICE, roadmap/SWOT, validation и sources должны вести на реальные Markdown artifacts или Notion child pages. Если gate не пройден, вернуть `partial/needs_revision` и исправить export; для уже опубликованного hub выполнить отдельный approval-gated cross-link pass.
9. До approval и внешней записи выполнить Publication Anti-AI-Slop Gate и `Research Content Lint`: `yarn research:lint research/projects/<research-slug>/<YYYY-MM-DD>` для standalone research, `yarn research:lint outputs/<project-slug>/<YYYY-MM-DD>` для продуктового workflow или `yarn research:lint <research-export-md>`. Проверка должна проходить Rules 1-6: не тезисная выжимка, CJM/user-flow depth, roadmap trace, claims с механизмом, неуниверсальные формулировки и неповторяющиеся таблицы. `publish-notion-research-hub.mjs` обязан использовать тот же смысл проверки и падать до Notion write, если lint/gate не пройден.
10. При наличии `prd.md` и `proto-personas.md` создать две связанные базы данных в Notion (Персоны и User Stories), связать их через Relation и наполнить User Stories интерактивными чек-листами Acceptance Criteria.
11. Записать URL/ID созданной страницы или зафиксировать блокирующую проблему.

## Guardrails (Ограничения и правила)

- Запись в Notion является внешней записью и строго требует подтверждения пользователя (human approval).
- В рамках воркфлоу должна публиковаться исключительно отдельная дочерняя страница с результатами исследований или Agile-пространство. Запрещено добавлять полные логи и технические дампы воркфлоу на родительскую страницу.
- При публикации Agile Board базы данных Персон и User Stories должны создаваться как связанные сущности; каждая User Story должна иметь отношение (relation) к соответствующей Персоне, а её Acceptance Criteria должны экспортироваться в виде интерактивного списка задач (чек-боксов Notion to_do).
- Перед Notion write обязателен dry-run/preview. Агент должен показать, какие страницы/базы/blocks будут созданы или обновлены, и запросить approval по exact target.
- Предпочитай remote Notion MCP/OAuth, если доступен write-capable MCP. Local MCP/API fallback допустим только с локальными credentials и без вывода token в команды, логи или artifacts.
- Markdown публикуется как структурированные Notion blocks. Запрещено выгружать весь Markdown одним raw code block.
- Подробный research pack запрещено публиковать одной длинной страницей: используй hub page + child pages, а для сущностей типа personas/backlog/stories — базы данных.
- Notion surface не может считаться готовой, если нет Surface Output Contract и карты `research section/entity -> hub/child page/database/table`.
- Public Notion surface не может содержать internal publication/debug sections: `Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, provider/debug policy, dry-run gates, `Publication Shape Gate`, `Research Content Lint`, `Notion Data Shape Plan`. Эти данные фиксируются в local publication record, а не в hub.
- Агент обязан выполнять `Publication Editor Pass` по docs-as-source принципу: local Markdown artifacts и ledgers остаются source of truth, Notion получает curated workspace. Для каждой сущности фиксируется единственное место владения: `entity -> owner page/database/view`; дубли допустимы только как короткие ссылки/summary, а не повторные таблицы.
- Dry-run подробного research hub обязан показывать `notion_data_shape_plan`: selected layout, child pages, table blocks, `database_index_candidates`, schema preview, idempotency strategy и API limits. Если personas, CJM frictions, opportunities, validation claims или sources должны фильтроваться, сортироваться, обновляться или связываться, агент предлагает `database_index` в составе `integrated_hybrid`, а не только prose/table block.
- **Combined Notion Workspace Gate:** если публикация создает или использует базы данных вместе с hub/child pages, базы не должны оставаться отдельным приложением рядом с отчетом. Агент обязан встроить linked database views в смысловые child pages: personas -> страница персон, CJM frictions -> CJM/user-flow, opportunities/backlog -> roadmap/ICE/RICE, requirements/user stories -> PRD/requirements, validation claims/sources -> validation/source page. Если подходящей страницы нет, сгруппируй или создай крупную смысловую страницу, соблюдая micro-page gate.
- Dry-run для `integrated_hybrid` обязан включать `embedded_database_views`: target child page, source database/data source, view name, visible properties, фильтры/сортировки и rationale. После Notion write агент обязан выполнить fetch/metadata verification и подтвердить inline linked database blocks на каждой целевой странице. Если базы созданы, но не встроены, publication status = `partial`, а `stage-gate-ledger.md` фиксирует required integrated pass.
- Personas, CJM/user paths, competitive matrix и ICE/RICE/backlog должны публиковаться таблицами или схемами. Если `notion-research-export-ru.md` содержит эти разделы только прозой или выглядит как summary/digest при наличии полного research pack, Notion write блокируется до исправления export.
- Подробный Notion hub должен связывать разделы между собой: `Карта связей исследования` и `Цепочка решений` обязательны, а текстовые отсылки к персонам, CJM, ICE/RICE, roadmap/SWOT, validation и sources должны быть кликабельными Markdown links или Notion page mentions. Запрещено оставлять важные переходы только как текст `см. файл`/`см. раздел`.
- Notion export не может считаться готовым, если он звучит как тезисная AI-выжимка: для ключевых решений нужны реальные кейсы, user flow под CJM и связь с проверкой гипотез.
- Не создавай микространицы: для подробного research pack целевой диапазон 6-12 child pages; короткие блоки меньше 8-10 Notion blocks или одиночные служебные секции должны оставаться внутри крупной страницы. Toggle/drawer используй выборочно: короткие блоки до 15 blocks оставляй inline; сворачивай длинные reference lists, validation details и повторяемые карточки инициатив/задач.
- Для Notion API соблюдай лимиты: append children чанками до 100 blocks, обрабатывай `429` через `Retry-After`/backoff, фиксируй retry count.
- Повторная публикация должна иметь idempotency strategy: existing child page/database search, source checksum/export marker или явно выбранная versioning strategy.
- Не публиковать технические схемы, JSON-данные, свойства frontmatter, технические файлы релиза или фронтенда, а также машинные кодовые блоки.
- Не отправлять секреты, API-ключи или конфиденциальные данные в Notion.
- Локальные артефакты в репозитории остаются единственным первоисточником истины (source of truth).
- Следовать модели разрешений интеграции Notion: интеграция должна быть создана в Notion и приглашена на целевую страницу/базу данных.

## Trigger Phrases / Триггерные фразы

Этот агент активируется и публикует контент в Notion по следующим фразам:
- **Публикация в Notion**: `опубликуй в notion`, `выложи в ноушен`, `залей результаты в ноушен`, `publish to notion`.
- **Обновление страницы**: `обнови страницу в notion`, `update notion page`.

## Required Outputs (Обязательные результаты)

- `notion-research-export-ru.md` (или аналогичный человекочитаемый файл экспорта исследований)
- Запись о публикации дочерней страницы исследований Notion в `stage-gate-ledger.md` and `release-notes.md` для полного воркфлоу

## Structured Output Contract (Структурированный контракт вывода)

Агент возвращает результат по контракту `agent-pack/templates/agent-output-contract.schema.md`. Если используется fenced-блок, допустимы `agent-output-yaml` или `agent-output-json`.

- `outputs.notion_research_export_ru` содержит полный Markdown для локального research-only экспорта.
- `outputs.notion_publication_record` содержит человекочитаемую запись для `stage-gate-ledger.md` и `release-notes.md`: publication plan summary, dry-run result, layout strategy, `publication_editor_gate`, `notion_data_shape_plan`, embedded linked database views, статус публикации, Notion hub/page/database ids/urls, block/page/database counts или blocker.
- Для внешней записи в Notion требуется точное human approval действие: `notion_research_publish`, `notion_prd_export` или `notion_agile_export` с целевым page/database target. Предпочтительный способ получения — `workflow:approval-request`; `workflow:approve`/`workflow:deny` используются только после явного ответа пользователя или при недоступном TTY. Если approval, `NOTION_TOKEN`, parent page, права интеграции или publication shape gate отсутствуют, агент возвращает `partial` или `blocked`; финальный `success` запрещен.
- Для Notion publication surface поле `surface_output` обязательно.
