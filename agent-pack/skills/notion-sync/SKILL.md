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
3. В конце `01-research` явно спроси в чате: `Разрешить публикацию пакета исследований в Notion?`
4. Если пользователь разрешил, проверь `NOTION_TOKEN`, parent page и права. Затем публикуй только research pack в отдельную child page.
5. Запиши publication URL/page id в `stage-gate-ledger.md`, `handoff-bundle.md` и, если workflow дошел до release, `release-notes.md`.

## 4. Процедура PRD/Agile export

1. Отдельно запроси approval для PRD/export/agile board, если он не был явно дан.
2. Экспортируй только согласованные PRD/user story sections.
3. Не отправляй secrets, raw traces, private logs, machine payloads.

## 5. Evidence и failure modes

Если approval denied/missing, `NOTION_TOKEN` отсутствует, parent page не задан или прав нет, зафиксируй `blocked`/`partial` в:
- `run-plan.md`;
- `handoff-bundle.md`;
- `stage-gate-ledger.md`;
- `release-notes.md`, если он уже существует.

Полный workflow нельзя завершать как `success`, если Notion research page пропущена без явного blocker/partial record.

## 6. Validation gates

- [ ] `notion-research-export-ru.md` создан до approval request.
- [ ] Approval задан явно в чате.
- [ ] Published content не содержит raw/schema/machine payloads.
- [ ] Publication URL или blocker записан в workflow artifacts.
