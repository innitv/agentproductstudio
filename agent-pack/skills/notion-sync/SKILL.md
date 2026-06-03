---
id: notion-sync
title: "Notion Research & PRD Sync"
description: "Автоматический экспорт и синхронизация локальных артефактов исследований (SWOT, персоны, конкуренты) и требований (PRD) в рабочее пространство Notion"
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

# Навык: Notion Research & PRD Sync

## 1. Context (Контекст)
На этапе выпуска релиза субагенты обязаны синхронизировать русскую версию пакета исследований (`research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `swot.md`) и требований в Notion. Этот навык регламентирует шаги для безопасного, структурированного экспорта с прохождением Quality Gates без утечки сырых пайлоадов или личной информации (PII).

## 2. Triggers (Триггеры)
Агент применяет этот навык на этапе:
- **Стадия воркфлоу**: `12-release` (релиз и публикация).
- **Событие**: Наличие в репозитории готового отчета QA (`qa-report.md`) со статусом `pass` или `pass_with_known_limitations`.
- **Настройка**: Наличие `NOTION_TOKEN` в локальном файле `.env` и одобрение пользователя на внешнюю публикацию.

## 3. Action Step-by-Step (Алгоритм выполнения)

### Шаг 1: Верификация окружения и токенов
1. Запустить проверку токена через команду `yarn notion:check`.
2. Убедиться, что целевой Page ID указан в `.env` (переменная `NOTION_PAGE_ID` или `NOTION_TARGET`) либо в файле `workflow-scaffold.md`.

### Шаг 2: Проверка одобрения пользователя (Human Approval Gate)
1. Проверить в `stage-gate-ledger.md` наличие явного текстового подтверждения пользователя на публикацию в Notion.
2. Если подтверждение отсутствует, остановить выполнение шага со статусом `blocked`.

### Шаг 3: Экспорт пакета исследований (Research Pack)
1. Считать файлы исследований из run-папки.
2. Запустить скрипт `yarn notion:mcp` (или воспользоваться Notion MCP).
3. Создать дочернюю страницу (Child Page) внутри родительской страницы Notion с понятным русским названием (например, *«Пакет исследований: [Название Продукта] [Дата]»*).
4. Импортировать таблицы анализа конкурентов, SWOT-квадранты и карточки персон, преобразуя Markdown в блоки Notion.

### Шаг 4: Экспорт требований (PRD Agile Board)
1. Считать файл требований `prd.md`.
2. Извлечь разделы MoSCoW-приоритизации и пользовательских историй.
3. Запустить экспорт с помощью скрипта `node tooling/scripts/publish-notion-stories.mjs` для автоматического создания тасок на Agile Board.

## 4. Validation / Quality Gates (Критерии качества)
- [ ] Опубликованный контент полностью переведен на русский язык.
- [ ] В Notion не экспортируются сырые JSON/YAML payloads, системные frontmatter или технические machine-readable payloads.
- [ ] Все ссылки на страницы исследований и Agile-доску Notion записаны в локальный `release-notes.md`.
