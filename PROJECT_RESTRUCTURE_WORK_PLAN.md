# Project Restructure Work Plan

Дата: 2026-05-23

Цель: разложить проект на крупные зоны ответственности, чтобы agent pack, frontend, runtime, integrations и tooling не смешивались в корне.

## Целевая структура

```text
product-agent-studio/
  AGENTS.md
  README.md
  package.json
  yarn.lock
  tsconfig.json
  playwright.config.ts

  agent-pack/
    agent-pack/agents/
    agent-pack/workflows/
    agent-pack/artifacts/
    agent-pack/templates/
    agent-pack/schemas/
    agent-pack/guardrails/
    agent-pack/quality/
    agent-pack/evals/
    agent-pack/skills/

  apps/
    frontend/

  runtime/
    typescript/

  integrations/
    integrations/mcp/
    integrations/observability/

  tooling/
    scripts/

  .codex/
  tests/
  outputs/
  runs/
  reports/
```

## Решения

- `AGENTS.md` остаётся в корне, потому что Codex использует его как главный файл проектных инструкций.
- `.codex/` остаётся в корне, потому что это ожидаемое место для Codex config/hooks/rules.
- `package.json`, `yarn.lock`, `tsconfig.json`, `playwright.config.ts` остаются в корне как управляющие файлы.
- `apps/frontend/` уже является правильным местом для React/Vite frontend.
- Корневую папку проекта переименовываем отдельным шагом после проверок.

## Фаза 1. Agent Pack

Status: completed

- [x] Перенести агентские инструкции в `agent-pack/agents/`.
- [x] Перенести workflow в `agent-pack/workflows/`.
- [x] Перенести artifact templates в `agent-pack/artifacts/`.
- [x] Перенести shared templates в `agent-pack/templates/`.
- [x] Перенести JSON Schema в `agent-pack/schemas/`.
- [x] Перенести guardrails в `agent-pack/guardrails/`.
- [x] Перенести quality docs в `agent-pack/quality/`.
- [x] Перенести evals в `agent-pack/evals/`.
- [x] Перенести skills в `agent-pack/skills/`.

## Фаза 2. Integrations And Tooling

Status: completed

- [x] Перенести MCP docs/configs в `integrations/mcp/`.
- [x] Перенести observability docs в `integrations/observability/`.
- [x] Перенести scripts в `tooling/scripts/`.

## Фаза 3. Path Updates

Status: completed

- [x] Обновить `runtime/typescript/agents.registry.ts`.
- [x] Обновить `runtime/typescript/run-landing-workflow.ts`.
- [x] Обновить `tooling/scripts/validate-config.mjs`.
- [x] Обновить `.codex/config.example.toml`.
- [x] Обновить `AGENTS.md`.
- [x] Обновить `README.md`.
- [x] Обновить runtime docs.
- [x] Обновить file format conventions.
- [x] Обновить MCP/integration docs после переноса.
- [x] Обновить `package.json` scripts.

## Фаза 4. Verification

Status: completed

- [x] `yarn validate:config`.
- [x] `yarn typecheck`.
- [x] `yarn build`.
- [x] `yarn qa:playwright`.
- [x] `yarn agents:inspect`.
- [x] Строгий поиск запрещённых package-manager команд вне generated/dependency директорий.

## Фаза 5. Root Rename

Status: completed

- [x] Корневая папка переименована в `C:\Project\product-agent-studio`.
- [x] Старый путь отсутствует.
