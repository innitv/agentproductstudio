# Tavily Deep Research MCP

## Назначение

Tavily MCP используется как внешний research provider для web search, competitor discovery, market scans и source-backed findings. В проекте он подключается как заменяемый provider, а не как отдельная роль агента.

## Server

Используй remote MCP endpoint:

```toml
[mcp_servers.tavily]
url = "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"
```

Не сохраняй реальный API key в репозиторий, traces, outputs или AGENTS.md.

## Local TypeScript Adapter

Если нужен не MCP, а прямой вызов из runtime, используй:

- adapter: `runtime/typescript/tavily-research.ts`
- fan-out runner: `runtime/typescript/multi-source-research.ts`
- env key: `TAVILY_API_KEY`
- optional endpoint override: `TAVILY_API_ENDPOINT`

Точка вставки в локальный `.env`:

```env
TAVILY_API_KEY=tvly-your-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
RESEARCH_PROVIDER_ORDER=tavily,deepseek
```

## Secret Handling

- Храни ключ только в env: `TAVILY_API_KEY`.
- Если ключ был отправлен в чат, issue, commit или лог, считай его скомпрометированным и перевыпусти.
- В артефактах сохраняй только очищенный summary: findings, evidence URLs, confidence, unknowns.

## Source Policy

Рекомендуемый режим:

```yaml
source_policy:
  mode: deep_research
  prefer:
    - tavily
    - deepseek
    - official_sources
    - competitor_sites
  allow:
    - tavily
    - deepseek
    - web_search
    - browser
    - user_sources
  deny:
    - external_send
  require_citations: true
  fallback: web_search
```

## Output Contract

Tavily research должен возвращать:

- `query`
- `summary`
- `findings`
- `evidence`
- `competitors`
- `unknowns`
- `confidence`
- `claims_to_validate`

Затем `research.agent` переносит очищенный результат в `research-summary.md`.

## Approval

Подключение Tavily требует human approval, потому что prompt и часть контекста уходят во внешний сервис. Для market research можно отправлять только несекретное описание продукта, аудитории и географии.
