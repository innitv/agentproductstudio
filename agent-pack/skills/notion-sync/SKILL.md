---
id: notion-sync
name: notion-sync
title: "Notion Research & PRD Sync"
description: "Use when 01-research or 12-release needs human-approved Notion publication/export of research-only or PRD artifacts. Prepares readable notion_research_export_ru, asks approval in chat, publishes only allowed content, and records blocked/partial states when approval, token, parent page, or permissions are missing."
platforms:
  - codex
  - open-code
mcp_servers:
  - notion
strictness_profile: strict
owner_stage_ids:
  - 01-research
  - 12-release
required_inputs:
  - research_summary
  - scenario_user_flows
  - competitive_analysis
  - proto_personas
  - synthetic_interviews
  - swot
  - prd
  - approval_record
required_outputs:
  - notion_research_export_ru
  - notion_prd_export
approval_actions:
  - notion_research_publish
  - notion_prd_export
  - notion_agile_export
validation_commands:
  - yarn notion:check
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Notion Research & PRD Sync

## 1. Назначение

Применяй skill только для Notion publication/export stages. Любая запись во внешний Notion требует human approval в текущем диалоге и доступных credentials. Нельзя молча пропускать approval request.

## 2. Обязательные inputs

Для research publication:
- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `stage-gate-ledger.md`

Для PRD/export:
- `prd.md`
- approval record для соответствующего действия.

## 3. Процедура research publication

1. Подготовь `notion-research-export-ru.md` до запроса approval.
2. Экспорт должен быть человекочитаемым: без workflow dump, schema/frontmatter, raw JSON, machine-readable payloads, code-block копий артефактов, frontend/release/log files.
3. Экспорт должен быть полным research pack, а не краткой выжимкой:
   - собери `notion-research-export-ru.md` из `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`;
   - если есть дополнительные research artifacts (`cjm-map.md`, `opportunity-roadmap.md`, source logs, validation plans), включи их смысловые разделы или явно запиши `skipped_with_reason`;
   - перед approval/write выполни Publication Completeness Gate: export должен быть сопоставим с source artifacts по объему и покрытию. Если dry-run показывает shallow export, публикация запрещена до регенерации.
4. Выполни Russian Publication Gate до внешней записи:
   - весь видимый пользователю текст, заголовки, table headers, section labels, summaries, statuses и descriptions — на русском;
   - английский допустим только для технических терминов без удачного русского аналога (`API`, `MCP`, `SDK`, `P0`, `RICE`, `BNPL`, `CJM`, `workflow`, `node id`, имена файлов/команд/полей);
   - испанский и другие посторонние языки запрещены;
   - export должен быть полным research pack, а не краткой выжимкой, если пользователь явно не запросил summary;
   - если gate не пройден, публикация в Notion запрещена.
5. Собери `publication plan` до внешней записи:
   - `action`: `notion_research_publish`;
   - `target`: parent page id/url;
   - `mode`: `remote_mcp|local_mcp|notion_api|manual_import`;
   - `layout_strategy`: `flat_child_page|hub_with_child_pages|database_index|integrated_hybrid`;
   - title дочерней страницы;
   - source artifacts и checksum локального export;
   - примерное количество Notion blocks;
   - unsupported/converted Markdown elements;
   - external writes, которые будут выполнены.
6. Выбери layout strategy:
   - `flat_child_page`: только для короткого export до 120 blocks и до 6 крупных разделов.
   - `hub_with_child_pages`: default для подробного research pack; hub содержит краткое резюме, навигацию и publication evidence, дочерние страницы содержат разделы исследования.
   - `database_index`: для рабочих сущностей, которые нужно фильтровать/сортировать: personas, user stories, backlog, opportunities, risks, sources, interview insights.
   - `integrated_hybrid`: hub + дочерние страницы + базы данных для сущностей, где каждая база дополнительно встроена linked database view в релевантную child page. Это обязательная форма, если в одной публикации есть и narrative pages, и рабочие базы.
   - micro-page gate: для `hub_with_child_pages` цель 6-12 дочерних страниц; отдельная дочерняя страница должна содержать не меньше 8-10 Notion blocks или несколько связанных секций. Короткие служебные блоки, одиночные выводы, мини-SWOT части, краткие персоны и вопросы группируй в крупную страницу. Toggle/drawer используй выборочно: короткие блоки до 15 blocks оставляй inline, если они читаются без перегруза; сворачивай длинные reference lists, validation details и повторяемые карточки инициатив/задач.
   - CJM, personas, roadmap, ICE/RICE и конкурентные матрицы публикуй таблично или схемой. Не превращай CJM в набор длинных текстовых карточек, если есть этапы, боли, участники и opportunities: минимум нужна таблица `Этап / Цель / Действия / Участники / Боли / Возможность`.
   - Персоны публикуй как сравнительную таблицу `Персона / Сегмент / Контекст / JTBD / Боль / Ценность / Evidence status`; подробные описания по персонам можно убирать в selective toggles после таблицы.
   - Для `integrated_hybrid` заранее спланируй `embedded_database_views`: personas -> страница персон, CJM frictions -> CJM/user-flow, opportunities/backlog -> roadmap/ICE/RICE, requirements/user stories -> PRD/requirements, validation claims/sources -> validation/source page. После записи проверь fetch/metadata, что linked views действительно встроены на страницы.
7. Выполни Publication Editor Pass до dry-run/write:
   - public export не содержит `Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, provider/debug policy, dry-run gates, `Publication Shape Gate`, `Research Content Lint`, `Notion Data Shape Plan`;
   - overview содержит решения, навигацию и next actions, а не повтор всех таблиц;
   - каждая сущность имеет одного владельца (`entity_ownership_map`): owner page/database/view;
   - повторные таблицы сущностей удалены или заменены ссылкой на owner page/view;
   - publication trace остается в `notion-publication-result.md`, `stage-gate-ledger.md`, `release-notes.md`.
8. Выполни dry-run/preview: построить block/page/database plan без записи в Notion. Если converter/MCP недоступен, зафиксируй fallback как `manual_import`. Dry-run для hub-публикации обязан вернуть `publication_editor_gate.pass=true`, `publication_completeness_gate.pass=true` и `publication_shape_gate.pass=true`; иначе Notion write запрещен.
8. В конце `01-research` используй интерактивный approval request, чтобы пользователь выбрал ответ, а не пропустил строку в чате:
   - предпочтительный runtime command: `yarn workflow:approval-request outputs/<project-slug>/<YYYY-MM-DD> notion_research_publish --target <notion-parent-page-id> --by human --reason "Публикация research pack в Notion"`;
   - если runtime TTY недоступен, задай отдельный заметный вопрос в чате: `Разрешить публикацию пакета исследований в Notion?` и после ответа запиши `yarn workflow:approve` или `yarn workflow:deny`;
   - approval должен быть точным по `action` и `target`.
   - общая фраза пользователя «опубликуй», «давай», «продолжай» или похожий текущий запрос не заменяет этот интерактивный шаг; сначала покажи exact target, source artifact и expected writes.
9. Если пользователь разрешил, проверь Notion mode:
   - предпочитай remote Notion MCP/OAuth, если он доступен и имеет write tools;
   - local MCP/API fallback допускается только при локальном `NOTION_TOKEN` и доступном parent page;
   - не передавай token как bare CLI argument, не печатай token в логах, не сохраняй token в outputs.
10. Публикуй только research pack. Для подробного research pack используй `tooling/scripts/publish-notion-research-hub.mjs <parent-page> <research-export-md> "<hub-title>"`; для коротких документов допустим `tooling/scripts/publish-notion-research-page.mjs`.
11. Для повторной публикации используй idempotency rule: ищи existing hub/child page/export marker по title/source checksum и обновляй/создавай новую версию только по явно выбранной стратегии.
12. Если используется Notion API, соблюдай request limits: append children чанками до 100 blocks, обрабатывай `429` через `Retry-After`/backoff, фиксируй retry count.
13. Запиши publication URL/page id в `stage-gate-ledger.md`, `handoff-bundle.md` и, если workflow дошел до release, `release-notes.md`.
14. Если Notion write был выполнен без интерактивного approval request или отдельного заметного вопроса в чате, не исправляй историю задним числом. Запиши `process_deviation` в `stage-gate-ledger.md`, `handoff-bundle.md` и `release-notes.md`: action, target, что было опубликовано, какой approval step пропущен, как предотвращать повторение.

## 4. Процедура PRD/Agile export

1. Отдельно запроси approval для PRD/export/agile board, если он не был явно дан.
2. До записи подготовь `publication plan` и dry-run:
   - PRD page/table structure;
   - database schema для Personas и User Stories;
   - properties, statuses, priorities, relation map;
   - Acceptance Criteria -> Notion `to_do` blocks;
   - expected create/update operations.
3. Экспортируй только согласованные PRD/user story sections.
4. Для Agile Board базы данных создаются/обновляются идемпотентно: сначала search/query existing database by title/schema marker, затем patch только согласованные properties/pages.
5. Не отправляй secrets, raw traces, private logs, machine payloads.

## 5. Markdown -> Notion Blocks

- Используй structured converter/MCP markdown tool, если доступен. Не превращай весь Markdown в один code block.
- Сохраняй иерархию: headings, paragraphs, lists, checkboxes, quotes/callouts и tables.
- Unsupported blocks фиксируй в publication evidence с решением: `converted|flattened|skipped_with_reason`.
- Локальные ссылки заменяй на Notion links, если известна target page; иначе оставляй человекочитаемый текст и фиксируй gap.
- Большие документы режь на логические секции, а не случайные чанки текста.

## 6. Evidence и failure modes

Если approval denied/missing, `NOTION_TOKEN` отсутствует, parent page не задан или прав нет, зафиксируй `blocked`/`partial` в:
- `run-plan.md`;
- `handoff-bundle.md`;
- `stage-gate-ledger.md`;
- `release-notes.md`, если он уже существует.

Полный workflow нельзя завершать как `success`, если Notion research page пропущена без явного blocker/partial record.

Evidence записи должна включать:

- `publication plan` summary;
- dry-run result;
- publication editor gate: public/private split, internal sections removed, duplicate sections removed, entity ownership map;
- approval action и exact target;
- Notion mode: `remote_mcp|local_mcp|notion_api|manual_import`;
- layout strategy: `flat_child_page|hub_with_child_pages|database_index|integrated_hybrid`;
- embedded linked database views для `integrated_hybrid`: target child page, source database/data source, view name, visible properties, filters/sorts и verification status;
- created/updated page ids/urls;
- hub id, child page ids, database ids, block count, chunk count, retry count;
- database ids и relation property names для Agile Board;
- unsupported blocks и chosen fallback;
- blocker или `published`.

## 7. Validation gates

- [ ] `notion-research-export-ru.md` создан до approval request.
- [ ] Publication Completeness Gate пройден: export не является краткой выжимкой при наличии полного research pack.
- [ ] Russian Publication Gate пройден до внешней записи.
- [ ] Export является полным research pack, если пользователь не просил краткую выжимку.
- [ ] Layout strategy выбран до publication approval.
- [ ] Publication Editor Pass пройден: public export не содержит internal ledger/debug sections и duplicate control sections.
- [ ] `entity_ownership_map` определяет владельца для personas, CJM, opportunities/backlog, requirements/user stories, validation claims и sources.
- [ ] Подробный research pack опубликован как hub + child pages, а не одной длинной страницей.
- [ ] Если созданы базы и child pages, выбран `integrated_hybrid`: linked database views встроены в релевантные страницы, а не оставлены отдельно.
- [ ] Для `integrated_hybrid` fetch/metadata verification подтвердил inline linked database views на целевых child pages.
- [ ] Publication plan и dry-run/preview созданы до внешней записи.
- [ ] Approval получен через `workflow:approval-request` или отдельный заметный вопрос в чате, если TTY недоступен; общий command/request пользователя не засчитан как approval.
- [ ] Approval содержит exact target.
- [ ] Если approval flow нарушен, создан `process_deviation` record.
- [ ] Published content не содержит raw/schema/machine payloads.
- [ ] Markdown опубликован как Notion blocks, а не как единый raw code block.
- [ ] Для API/MCP записи учтены chunking/rate-limit/retry.
- [ ] Повторная публикация имеет idempotency strategy.
- [ ] Publication URL или blocker записан в workflow artifacts.
