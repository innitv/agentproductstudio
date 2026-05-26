# Required Connections

Дата: 2026-05-22

Документ фиксирует минимальные подключения для работы проекта как Codex agent pack и opt-in providers, которые требуют отдельного approval.

## Baseline Without API Key

Основной режим: папка проекта используется как agent pack внутри Codex. В этом режиме отдельный `OPENAI_API_KEY` не нужен, потому что выполнение модели обеспечивает Codex-среда.

Обязательные подключения для этого режима:

| Connection | Purpose | Required secret | Approval |
|---|---|---:|---|
| OpenAI Docs MCP | Официальная документация OpenAI API, Codex, Agents SDK, Apps SDK, MCP | no | no |
| Filesystem/local files | Чтение инструкций, шаблонов, schemas и запись outputs | no | no в workspace |

## Optional Standalone Runtime

`OPENAI_API_KEY` нужен только если проект запускается как отдельное локальное приложение через OpenAI Agents SDK, например `yarn landing:run "<goal>"` должен сам вызывать модель без Codex-интерфейса.

| Connection | Purpose | Required secret | Default mode |
|---|---|---:|---|
| OpenAI API | Standalone Agents SDK runner | `OPENAI_API_KEY` | disabled |

## Optional Providers

| Connection | Purpose | Required secret | Default mode |
|---|---|---:|---|
| Browser/Playwright MCP | QA, screenshots, responsive checks, competitor page scan | no | opt-in |
| Firecrawl API | Scrape/crawl/reference scan, markdown/metadata/links for competitor and visual reference pages | `FIRECRAWL_API_KEY` | opt-in |
| Tavily | Source-backed research с источниками и конкурентный анализ | `TAVILY_API_KEY` | default for deep_research when approved |
| DeepSeek API | Research checks, contradiction review, claims-to-validate | `DEEPSEEK_API_KEY` | default for deep_research when approved |
| Notion MCP | Публикация PRD / notion export | `NOTION_TOKEN` | disabled |
| GitHub MCP | PR/issues/release handoff | `GITHUB_PERSONAL_ACCESS_TOKEN` | read-only |
| GitLab MCP | MR/issues/release handoff | OAuth/session | read-only |
| Figma MCP | Design system context и Figma handoff | OAuth/session | read-only |

## Rules

- Реальные tokens не сохраняются в репозиторий, outputs, traces или AGENTS.md.
- `OPENAI_API_KEY` не является обязательным для Codex agent pack режима.
- Firecrawl используется для публичных reference/competitor URLs; локальный preview проверяется Playwright, если нет публичного tunnel.
- Write-действия во внешних системах требуют human approval.
- Если provider недоступен, agent возвращает `partial` с `needs_validation` или использует разрешённый fallback из `runtime/typescript/research.config.ts`.
- Для OpenAI-related задач используется OpenAI Docs MCP или официальный fallback.
