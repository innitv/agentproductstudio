# MCP Architecture

## Цель

MCP подключает внешние источники и действия к агентному процессу: браузер, файлы, таск-трекер, дизайн, репозиторий, деплой, аналитику.

## Рекомендуемые категории MCP

1. OpenAI Docs — официальная документация OpenAI API, Codex, Agents SDK, Apps SDK и MCP.
2. Browser / web automation — анализ сайтов, конкурентных лендингов, скриншотов.
3. Search / deep research — актуальные источники и проверки фактов.
4. Files / knowledge base — внутренние документы, PRD, брендбук, прошлые исследования.
5. GitHub / GitLab — issues, pull requests, code review, commits.
6. Figma — дизайн-файлы, компоненты, tokens.
7. Task tracker — Linear/Jira/Notion задачи.
8. Notion — публикация team-ready PRD, статусов решений и handoff-документов.
9. Deployment — Vercel/Netlify/cloud provider.
10. Analytics — PostHog/GA/Amplitude события и метрики.

Практический шаблон для GitHub, GitLab и Playwright/browser MCP смотри в `integrations/mcp/repository-and-browser-mcp.md`.
Практический шаблон для Figma Design System MCP смотри в `integrations/mcp/figma-design-system-mcp.md`.

## Политика доступа

- Минимально необходимые права.
- Отдельные токены для dev/staging/prod.
- Никаких секретов в AGENTS.md.
- Human approval для деплоя, удаления данных, массовых изменений и отправки внешних сообщений.
- Human approval для подключения GitHub/GitLab/browser MCP и включения write-tools.

## Где использовать

- Orchestrator: OpenAI Docs MCP для сверки OpenAI-related решений.
- Research Agent: web/search/browser/files.
- Design Agent: Figma/files/browser screenshots.
- Frontend Agent: repo/files/package manager.
- QA Agent: browser, test runner, accessibility tools.
- Release Agent: GitHub/Vercel/task tracker.
- Notion Publisher Agent: Notion integrations/mcp/API только после approval, с локальным PRD как source of truth.

## Принцип заменяемости

MCP-серверы и tools не должны определять архитектуру агентов. Например, research не должен становиться `Tavily agent`, а PRD не должен зависеть от Notion как обязательного места хранения. Сначала формируется локальный проверяемый артефакт по контракту проекта, затем он может быть экспортирован во внешний сервис, если это нужно и разрешено.

Для research используй adaptive provider layer: `integrations/mcp/research-providers.md`. Конкретный deep research provider выбирается по prompt, source policy, доступам и fallback rules.

Для Notion сначала формируется локальный `prd` и `notion_prd_export`. Если Notion integrations/mcp/API недоступен или approval не получен, агент создаёт Notion-ready Markdown для ручного импорта. PRD не должен зависеть от Notion как обязательного хранилища.

Рекомендуемый порядок:

1. Проверить, нужен ли внешний инструмент для задачи.
2. Проверить права, данные, approval и локальную альтернативу.
3. Получить или подтвердить доступ, если инструмент рискованный.
4. Сохранить очищенный результат в artifact/output.
5. Не сохранять sensitive raw tool outputs в traces или публичных артефактах.

## Рекомендуемый OpenAI Docs MCP

```json
{
  "openaiDeveloperDocs": {
    "url": "https://developers.openai.com/mcp"
  }
}
```

Этот сервер read-only и нужен для поиска и чтения официальной документации OpenAI из агентного окружения.
