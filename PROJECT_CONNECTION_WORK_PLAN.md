# Project Connection Work Plan

Дата создания: 2026-05-22
Последняя синхронизация: 2026-05-27

Цель: довести `product-agent-studio` до рабочей папки Codex agent pack без обязательного OpenAI API key, сохранив возможность развивать standalone OpenAI Agents SDK runtime.

## Текущий статус

- Overall: completed_with_optional_followups
- Основной режим: Codex agent pack / no-API-key workflow.
- Standalone Agents SDK mode: optional.
- Рабочий package manager: `yarn` 1.22.22.

## Что уже закрыто

### Базовая безопасность и конфигурация

Status: completed

- `.env.example` содержит placeholders для optional providers.
- `.env`, `.env.*`, `node_modules`, `dist`, reports и test outputs игнорируются.
- Реальные secrets не коммитятся; `validate-config` проверяет secret-like values.
- Approval и sensitive-data правила описаны в `agent-pack/guardrails/`.

### Node/TypeScript runtime scaffold

Status: completed

- Есть `package.json`, `tsconfig.json`, Yarn lock и runtime в `runtime/typescript/`.
- Основные scripts: `typecheck`, `validate:config`, `qa:quick`, `qa:playwright`, `qa:all`.
- Frontend живёт в `apps/frontend`.
- Playwright QA подключён для desktop/mobile.
- Optional Notion MCP установлен через `@notionhq/notion-mcp-server`.

### Workflow engine

Status: completed

- Persisted workflow engine реализован:
  - `runtime/typescript/workflow-engine.ts`
  - `runtime/typescript/workflow-state.ts`
  - `runtime/typescript/run-workflow-engine.ts`
- Команды:
  - `yarn workflow:start`
  - `yarn workflow:resume`
  - `yarn workflow:status`
  - `yarn workflow:run-stage`
  - `yarn workflow:run-local`
- Runner пишет `run-state.json`, `stage-results/`, `handoff-bundle.md`, `stage-gate-ledger.md` и обязательные stage artifacts.

### Artifact and schema validation

Status: completed

- `yarn workflow:validate` подключён через `runtime/typescript/validate-workflow-run.ts`.
- JSON Schemas лежат в `agent-pack/schemas/`.
- Validation поддерживает `--through`, `--profile standard`, `--profile reference`, `--profile auto`.
- Quality gates описаны в `agent-pack/quality/quality-gates.md`.

### Research providers

Status: completed

- Tavily + DeepSeek + Gemini default flow зафиксирован в docs и runtime.
- Реализации:
  - `runtime/typescript/tavily-research.ts`
  - `runtime/typescript/deepseek-research.ts`
  - `runtime/typescript/gemini-research.ts`
  - `runtime/typescript/multi-source-research.ts`
  - `runtime/typescript/research-stage-runner.ts`
- DeepSeek/Gemini помечены как cross-check/synthesis providers, а не source-backed evidence.

### Reference and visual review providers

Status: completed

- Firecrawl opt-in adapter: `runtime/typescript/firecrawl.ts`.
- Reference scan: `runtime/typescript/reference-scan.ts`.
- Visual diff tooling:
  - `runtime/typescript/visual-diff.ts`
  - `runtime/typescript/visual-section-diff.ts`
  - `runtime/typescript/visual-reference-review.ts`
- Команды:
  - `yarn reference:scan`
  - `yarn reference:diff`
  - `yarn reference:section-diff`
  - `yarn reference:review`

### Figma design source layer

Status: completed_for_tokens

- Общая Figma design-system библиотека хранится в `design/figma/a3-design-system/`.
- Приняты и задокументированы tokens: colors, typography, effects, radius, spacing, component sizes.
- Component extraction остаётся отдельной продуктовой задачей, не blocker для project connection.

### Notion provider

Status: completed_as_approval_gated_optional_provider

- Локальная инструкция: `integrations/mcp/notion-local-token.md`.
- Scripts:
  - `yarn notion:check`
  - `yarn notion:mcp`
- Publication remains approval-gated by design.

### Tracing policy

Status: completed_baseline

- Runtime defaults: `runtime/typescript/tracing.ts`.
- `includeSensitiveData: false` задан как baseline.
- Policy docs: `integrations/observability/tracing.policy.md`.

## Что осталось не как blocker, а как optional follow-up

### OpenAI Docs MCP

Status: optional_manual_setup

- Проектные правила требуют использовать official OpenAI documentation для OpenAI-related задач.
- В текущей среде это делается через доступный OpenAI docs skill / official docs flow.
- Автоматическая команда `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp` зависит от пользовательского Codex CLI/MCP окружения и не является частью committed runtime.

### Component mapping from Figma

Status: pending_product_task

- Следующий слой после tokens: извлечь component variants/states из Figma.
- Source files:
  - `design/figma/a3-design-system/component-map.md`
  - `design/figma/a3-design-system/design-system-audit.md`
- Это не blocker для подключения проекта; это отдельная design-system implementation задача.

### Production observability

Status: optional_future_runtime_task

- Baseline tracing defaults есть.
- Если standalone runtime станет production-like, нужно добавить run-log storage policy, redaction tests и trace review gate.

## Проверки

Последние обязательные проверки проходят:

- `yarn qa:quick`
- `yarn qa:playwright`
- `yarn build`

## Решение

План подключения проекта считается закрытым. Файл оставлен как синхронизированный status record, потому что `tooling/scripts/validate-config.mjs` ожидает его наличие. Новые работы по Figma components, OpenAI Docs MCP setup или production observability нужно вести отдельными планами, если они начнутся.
