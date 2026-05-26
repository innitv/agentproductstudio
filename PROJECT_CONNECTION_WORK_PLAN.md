# Project Connection Work Plan

Дата: 2026-05-22

Цель: довести `product-agent-studio` до рабочей папки Codex agent pack без обязательного OpenAI API key, сохранив возможность позже развивать standalone OpenAI Agents SDK runtime.

## Статус

- Overall: in_progress
- Последнее обновление: 2026-05-22

## Фаза 1. Базовая безопасность и конфигурация

Status: completed

Задачи:

- [x] Убрать реальные/похожие на реальные secrets из конфигов.
- [x] Заменить секреты на env placeholders.
- [x] Добавить `.env.example` с обязательными и опциональными переменными.
- [x] Добавить `.gitignore` для локальных секретов и зависимостей.
- [x] Зафиксировать, какие MCP серверы обязательны, а какие опциональны.

Acceptance criteria:

- В репозитории нет явных API keys.
- Tavily, DeepSeek, Firecrawl, GitHub, Notion и optional OpenAI runtime ключи описаны только как env variables.
- Подключения с внешней передачей данных требуют approval по существующим guardrails.

## Фаза 2. Node/TypeScript runtime scaffold

Status: completed

Задачи:

- [x] Добавить `package.json`.
- [x] Добавить `tsconfig.json`.
- [x] Добавить scripts: `typecheck`, `validate:config`, `landing:run`.
- [x] Подключить зависимости для будущего runtime: `@openai/agents`, `zod`.
- [x] Подключить frontend animation dependency: `framer-motion`.
- [x] Подключить frontend build stack: React, React DOM, Vite, Vite React plugin.
- [x] Подключить shadcn/ui foundation: Tailwind CSS, `components.json`, `@/*` alias, базовый `Button`.
- [x] Перенести frontend app в `apps/frontend` без включения Yarn workspaces.
- [x] Подключить Playwright QA: `@playwright/test`, Chromium browser, desktop/mobile smoke tests.
- [x] Подключить Notion MCP opt-in provider: `@notionhq/notion-mcp-server`.
- [x] Подключить dev dependencies: `typescript`, `tsx`, `@types/node`.
- [x] Перейти на Yarn 1.22.22 как рабочий package manager в текущем окружении.

Acceptance criteria:

- Проект имеет воспроизводимую точку входа для runtime.
- `yarn typecheck` и `yarn validate:config` определены и проходят.
- `yarn build` собирает React/Vite frontend в `dist/frontend`.
- `yarn qa:playwright` выполняет Playwright QA против production preview.
- `landing:run` указывает на `runtime/typescript/run-landing-workflow.ts`.

## Фаза 3. Config validation

Status: completed

Задачи:

- [x] Добавить локальный validator для проверки опасных значений в `.codex/config.example.toml` и MCP examples.
- [x] Проверять наличие запрещенных hardcoded keys.
- [x] Проверять, что Tavily config использует `${TAVILY_API_KEY}`.
- [x] Добавить проверку обязательных файлов runtime.

Acceptance criteria:

- `yarn validate:config` падает при hardcoded secret-like values.
- Validator не требует внешней сети.
- Validator можно запускать до установки MCP.

## Фаза 4. Codex Agent Pack Runtime

Status: in_progress

Задачи:

- [ ] Подключить официальную документацию OpenAI Docs MCP. Blocked: `codex` CLI не найден в текущем окружении.
- [x] Зафиксировать no-API-key режим как основной способ работы.
- [x] Реализовать локальный scaffold runner, который проверяет структуру workflow без вызова OpenAI API.
- [x] Реализовать загрузку agent instructions из `agent-pack/agents/*.agent.md`.
- [x] Создать optional Agents SDK слой: orchestrator, specialists и specialists-as-tools.
- [ ] Реализовать передачу `handoff_bundle` между локальными проверками/артефактами.
- [ ] Подключить tracing с `includeSensitiveData: false`.
- [ ] Оставить OpenAI Agents SDK integration как optional standalone mode.

Acceptance criteria:

- Runtime без API key умеет проверить структуру и подготовить outputs scaffold.
- Agents SDK слой строится без вызова модели через `yarn agents:inspect`.
- Orchestrator сохраняет финальную ответственность в Codex workflow.
- Все specialists возвращают результат по `agent-pack/templates/agent-output-contract.schema.md`.

## Фаза 5. Schema validation

Status: in_progress

Задачи:

- [ ] Перенести JSON Schema контракты из `agent-pack/schemas/*.schema.json` в Zod или подключить JSON Schema validator.
- [ ] Валидировать каждый artifact перед передачей следующему этапу.
- [ ] Валидировать финальный bundle перед QA и release.

Acceptance criteria:

- Невалидный artifact блокирует следующий этап.
- Ошибка валидации возвращает понятный diagnostic.

## Фаза 6. MCP providers

Status: pending

Задачи:

- [ ] Подключить OpenAI Docs MCP.
- [ ] Подключить filesystem/local file provider.
- [ ] Подключить browser/Playwright MCP для QA.
- [x] Подключить Firecrawl как opt-in scrape/reference scan provider вместе с Playwright.
- [x] Добавить end-to-end research stage runner для Tavily + DeepSeek artifacts.
- [x] Настроить локальный web/deep research provider flow: Tavily + DeepSeek, Firecrawl/browser как fallback/reference layer.
- [ ] Оставить Notion, GitHub/GitLab, Figma как opt-in providers с approval.

Acceptance criteria:

- Research может работать минимум в `local_only` и `web_search`/`browser_scan`; Firecrawl покрывает публичный scrape/reference scan, Playwright — screenshots/responsive QA.
- OpenAI-related задачи используют official docs.
- Write-действия во внешних системах требуют human approval.

## Фаза 7. Verification

Status: pending

Задачи:

- [x] Запустить config validator напрямую через `node tooling/scripts/validate-config.mjs`.
- [x] Запустить `yarn validate:config`.
- [x] Запустить `yarn typecheck`.
- [x] После установки зависимостей запустить smoke workflow на fixture.
- [x] Проверить отсутствие secrets.
- [x] Обновить README с фактическим способом запуска.

Acceptance criteria:

- Все доступные локальные проверки проходят.
- Недоступные проверки явно описаны как blocked с причиной.

Current blockers:

- Проектный package manager: только `yarn` 1.22.22.
- `codex` CLI не найден в PATH, поэтому OpenAI Docs MCP нельзя подключить автоматически командой `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp`.
- `yarn landing:run "Smoke landing workflow"` работает без API key и создает `outputs/smoke-landing-workflow/2026-05-23/workflow-scaffold.md`.
