# Notion Local Token MCP

Этот режим использует локальный `@notionhq/notion-mcp-server` и `NOTION_TOKEN`.

## Setup

1. Создай internal integration в Notion:
   `https://www.notion.so/profile/integrations`
2. Скопируй token.
3. Вставь token только в локальный `.env`:

```env
NOTION_TOKEN=<notion-integration-token>
```

4. Подключи нужные страницы к integration в Notion.
5. Запусти локальный сервер:

```bash
yarn notion:mcp
```

## MCP Config

Готовый пример лежит в:

```text
integrations/mcp/notion-local-token.mcp.example.json
```

Для Claude Code уже есть блок `notion` в `.mcp.json` (пример — `integrations/mcp/mcp-servers.example.json`).

## Safety

- Не сохраняй реальный `NOTION_TOKEN` в репозиторий.
- Для записи в Notion нужен human approval по `agent-pack/guardrails/approval-matrix.md`.
- Если token попал в чат, issue, commit или лог, перевыпусти его в Notion.
