# Adaptive Research Providers

## Цель

Research layer должен выбирать режим исследования и provider под конкретный prompt, доступы и source policy. Архитектура не должна зависеть от одного фиксированного deep research MCP.

## Research Modes

| Mode | Когда использовать | Разрешённые providers |
|---|---|---|
| `local_only` | Нельзя использовать web/external tools. | file_search |
| `user_sources_only` | Пользователь дал ссылки/файлы и запретил остальное. | user_sources, file_search |
| `web_search` | Нужна быстрая проверка актуальных фактов. | web_search, browser |
| `browser_scan` | Нужно изучить конкретные сайты, конкурентов или UX. | firecrawl, browser, web_search |
| `deep_research` | Нужен широкий конкурентный/рыночный research. | tavily, deepseek, gemini, firecrawl, deep_research_mcp, web_search, browser, user_sources |
| `official_docs` | Нужны только официальные источники. | openai_docs, official user sources |

## Provider Registry

| Provider | Purpose | Required integrations/mcp/Tool | Fallback |
|---|---|---|---|
| `file_search` | Локальные документы, брендбук, прошлые артефакты. | local file tools | `needs_validation` |
| `user_sources` | Ссылки и файлы из prompt. | file/browser tools | ask user |
| `openai_docs` | OpenAI API/Codex/agent-pack/agents/MCP docs. | OpenAI Docs MCP | official OpenAI web docs |
| `web_search` | Быстрый поиск актуальных источников. | web/search tool | `needs_validation` |
| `browser` | Проверка страниц, UX, competitor pages. | browser/Playwright MCP | text-only notes |
| `firecrawl` | Scrape/crawl/reference scan: markdown, metadata, links, screenshots for competitor/reference pages. | `FIRECRAWL_API_KEY`, `runtime/typescript/firecrawl.ts`, `runtime/typescript/reference-scan.ts` | browser/web_search |
| `deepseek` | Обязательный model-based cross-check/check provider через DeepSeek Chat Completions API. | DeepSeek API key | tavily/web_search/browser |
| `tavily` | Web/deep research с источниками и competitor discovery. | Tavily MCP или `runtime/typescript/tavily-research.ts` | web_search/browser |
| `gemini` | Обязательный model-based strategy/cross-check provider для contradiction review и claims-to-validate. | Gemini API key, `runtime/typescript/gemini-research.ts` | tavily/web_search/browser |
| `deep_research_mcp` | Многошаговый deep research. | Tavily/Exa/Perplexity/Firecrawl/custom MCP | web_search/browser |
| `custom_mcp` | Доменные источники клиента. | project-specific MCP | ask user |

## Source Policy Contract

```yaml
source_policy:
  mode: deep_research
  prefer:
    - user_sources
    - official_sources
    - competitor_sites
  allow:
    - file_search
    - openai_docs
    - web_search
    - browser
    - tavily
    - deepseek
    - gemini
    - deep_research_mcp
    - custom_mcp
  deny:
    - external_send
  require_citations: true
  fallback: needs_validation
```

## Rules

- User prompt wins over defaults.
- Full `deep_research` defaults to multi-source execution with `tavily`, `deepseek` and `gemini`.
- `tavily` is the source-backed provider; `deepseek` and `gemini` are required check/synthesis providers for contradiction checks, risks and `claims_to_validate`, but do not count as source-backed evidence by themselves.
- If any default provider is unavailable, failed, or returns no usable output, the research gate is `partial` and must record `needs_validation`.
- Do not use broad web if user requests `local_only`, `user_sources_only`, or `official_docs`.
- If provider is unavailable, switch only to an allowed fallback.
- If no allowed provider is available, return `partial` with `needs validation` or `blocked` if policy requires it.
- Every market, competitor or quantitative claim needs evidence or `needs validation`.
- Do not collect unnecessary personal data.

## Recommended MCP Setup

Required baseline:

- OpenAI Docs MCP for OpenAI-related research.
- Filesystem/local file tools for user sources and repo artifacts.
- Browser or web search for competitor/source checks.

Recommended deep research providers:

- Tavily MCP
- DeepSeek API provider
- Gemini API provider
- Exa MCP
- Perplexity MCP
- Firecrawl MCP
- Custom client knowledge MCP

These are interchangeable providers, not agent roles.

Tavily setup details: `integrations/mcp/tavily-deep-research-mcp.md`.
DeepSeek setup details: `integrations/mcp/deepseek-api.md`.

## Local Runtime Setup

Точка вставки ключей:

```env
TAVILY_API_KEY=tvly-your-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
DEEPSEEK_RESEARCH_MODEL=deepseek-v4-flash
GEMINI_API_KEY=your-gemini-key-here
GEMINI_RESEARCH_MODEL=gemini-2.5-flash
RESEARCH_PROVIDER_ORDER=tavily,deepseek,gemini
FIRECRAWL_API_KEY=fc-your-key-here
```

Для Codex-сессии без локального standalone runtime это остается opt-in конфигурацией проекта. Реальные ключи хранятся только в локальном `.env`, не в `.env.example`, outputs или traces.
