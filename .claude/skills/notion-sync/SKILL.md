---
id: notion-sync
name: notion-sync
title: "Notion Research & PRD Sync"
description: "Использовать, когда на этапе 01-research или 12-release нужна одобренная человеком публикация/экспорт research-only или PRD артефактов в Notion. Skill готовит читаемый notion_research_export_ru, запрашивает approval в чате, публикует только разрешённый контент и фиксирует blocked/partial состояния при отсутствии approval, token, parent page или permissions."
platforms:
  - open-code
  - claude
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

## Когда включается

Человек попросил опубликовать или обновить материалы в Notion. Публикация не
является обязательным шагом workflow: без запроса skill не запускается, и
отсутствие страницы в Notion не делает run незавершённым.

## Главные правила

🔴 **Любая запись во внешний Notion требует approval в текущем диалоге** и
доступных credentials. Молча пропускать запрос нельзя — процедура в
`approval-gate`, exact target обязателен.

🔴 **Экспорт готовится до запроса approval, а не после.**
`notion-research-export-ru.md` собирается первым: человек одобряет конкретный
текст, а не намерение опубликовать.

🔴 **Публикуется человекочитаемый документ, а не дамп работы.** В экспорт не
попадают: служебные поля и frontmatter, сырой JSON, машиночитаемые payload,
копии артефактов блоками кода, файлы фронтенда, релиза и логов. Внутренние
разделы и дубли удаляются на publication editor gate.

🔴 **Русский язык обязателен** для всего видимого текста — заголовков,
подписей, названий разделов и колонок. Английский только для технических
терминов без удачного русского аналога.

## Чем заканчивается

`blocked`/`partial` — approval не получен или отклонён, нет `NOTION_TOKEN`, не
задана родительская страница, нет прав. Причина пишется в `run-plan.md`,
`handoff-bundle.md`, `stage-gate-ledger.md` и в `release-notes.md`, если он уже
существует.

Завершать workflow как `success` при пропущенной публикации можно — но только
когда пропуск записан как явный blocker или partial, а не молча.

## Детали

Входы обеих процедур, порядок публикации research и экспорта PRD, преобразование
Markdown в блоки Notion, полный состав evidence и чек-лист приёмки —
`references/publication.md`.
