# Git Cleanup Inventory — 2026-06-02

Источник: `git status --short`, `git diff --name-status`, `git diff --stat`.

## Цель

Разобрать dirty tree на логические пачки перед удалениями, откатами или коммитами. На этом шаге ничего не удаляется и не откатывается.

## Общая картина

- Tracked changes: 49 файлов.
- Untracked changes: 18 файлов/директорий.
- Самый большой tracked change: удаление `outputs/product-agent-studio-deck.html` (~1795 строк).
- Основной риск: изменения смешаны между audit/runtime fixes, agentic migration, frontend prototype, docs/policies и generated outputs.

## G1 — Audit Runtime Fixes

Статус: оставить как текущую рабочую пачку.

Файлы:

- `runtime/typescript/validate-workflow-run.ts`
- `runtime/typescript/status-resolver.ts`
- `runtime/typescript/test-workflow-validator.ts`
- `runtime/typescript/workflow-stage-executors.ts`
- `runtime/typescript/workflow-engine.ts`
- `package.json` только строка `workflow:test-validator`
- `reports/system-audit-2026-06-02.md`
- `reports/system-audit-remediation-plan-2026-06-02.md`

Смысл:

- Усилен `workflow:validate`.
- Добавлен canonical status resolver.
- Добавлен regression-test для blocked/partial/release/visual diff cases.

Рекомендация:

- Держать отдельно от agentic migration.
- Если делать commit, назвать примерно `fix workflow validation gates`.

## G2 — Agentic Runtime / Approval Migration

Статус: отдельная большая пачка, не смешивать с G1.

Tracked:

- `runtime/typescript/run-workflow-engine.ts`
- `runtime/typescript/workflow-state.ts`
- `runtime/typescript/context-truncator.ts`
- `runtime/typescript/doctor.ts`
- `package.json` строки `workflow:approve`, `workflow:deny`, `workflow:approvals`, `workflow:agentic-*`, `workflow:test-agentic*`

Untracked:

- `runtime/typescript/agentic-approval-targets.ts`
- `runtime/typescript/agentic-rollout.ts`
- `runtime/typescript/approval-gate.ts`
- `runtime/typescript/test-agentic-engine.ts`
- `runtime/typescript/test-agentic-executor.ts`
- `runtime/typescript/test-agentic-readiness.ts`
- `runtime/typescript/test-agentic-rollout.ts`
- `runtime/typescript/test-approval-gate.ts`

Смысл:

- Режимы `local|agentic`.
- Approval commands/gates.
- Agentic rollout/readiness/preflight.
- Дополнительные runtime tests.

Рекомендация:

- Проверить как отдельный блок через `yarn workflow:test-agentic`, `yarn workflow:doctor`, `yarn typecheck`.
- Не откатывать автоматически: это выглядит как осмысленная миграция.

## G3 — Docs, Agents, Guardrails, Templates

Статус: отдельная документационная пачка.

Tracked:

- `AGENTS.md`
- `COMMANDS.md`
- `PROJECT_CONNECTION_WORK_PLAN.md`
- `README.md`
- `agent-pack/agents/*.agent.md`
- `agent-pack/guardrails/*.md`
- `agent-pack/quality/*.md`
- `agent-pack/skills/*/SKILL.md`
- `agent-pack/templates/agent-output-contract.schema.md`
- `agent-pack/templates/file-format-conventions.md`
- `agent-pack/templates/stage-gate-ledger.template.md`
- `agent-pack/workflows/artifact-driven-pipeline.md`
- `agent-pack/workflows/deep-research.workflow.md`
- `agent-pack/workflows/landing-agent-orchestration.workflow.md`
- `runtime/typescript/README.md`
- `integrations/observability/*.md`

Untracked:

- `AGENTIC_EXECUTION_MIGRATION_PLAN.md`
- `agent-pack/templates/agent-sop.template.md`
- `agent-pack/templates/task-exec-plan.template.md`
- `agent-pack/workflows/agent-ops-best-practices.md`

Смысл:

- Обновление правил оркестрации, approval, agent SOP, workflow docs, observability.

Рекомендация:

- Сверить с текущим `AGENTS.md`, чтобы не было противоречий.
- Коммитить после G2 или вместе с G2, если docs описывают именно agentic migration.

## G4 — Frontend Prototype / Mouse View

Статус: требует решения владельца продукта.

Tracked:

- `apps/frontend/src/App.tsx`

Untracked:

- `apps/frontend/src/views/EsportsMouseView.tsx`
- `apps/frontend/src/assets/cyber_mouse_black.png`
- `apps/frontend/src/assets/cyber_mouse_cyan.png`
- `apps/frontend/src/assets/cyber_mouse_silver.png`

Смысл:

- Default route переключен с landing на `mouse`.
- Добавлен экран продажи мышек в стиле Apple.

Рекомендация:

- Если это текущий продуктовый прототип: вынести в отдельную frontend-пачку и проверить Playwright/default route.
- Если это временный эксперимент: кандидат на откат/удаление после явного подтверждения.

## G5 — Outputs / Generated Artifacts

Статус: не держать в основной runtime/docs пачке.

Tracked:

- `outputs/README.md`
- `outputs/registry.json`
- `outputs/product-agent-studio-deck.html` удален

Untracked:

- `outputs/apple-iphone-17/`

Смысл:

- Generated workflow output и registry.
- `outputs/apple-iphone-17/2026-06-02` использовался как regression fixture для аудита.

Рекомендация:

- Не коммитить `outputs/apple-iphone-17/` как часть runtime fix.
- Решить policy: реальные product outputs в git или только `outputs/products/*`/registry.
- Удаление `outputs/product-agent-studio-deck.html` подтвердить отдельно: это крупное удаление generated HTML.

## G6 — Visual Tooling / Cleanup Scripts

Статус: отдельная tooling-пачка, вероятно связана с R4/R5/R6 из remediation plan.

Tracked:

- `tooling/scripts/capture-local-screenshots.mjs`
- `tooling/scripts/cleanup-outputs.mjs`

Смысл:

- Screenshot capture и cleanup policy.

Рекомендация:

- Не смешивать с R1/R2.
- Проверять после R3/R4, когда visual reference gate будет закрыт.

## G7 — Environment Example

Статус: проверить вручную.

Tracked:

- `.env.example`

Смысл:

- Удалено 3 строки.

Рекомендация:

- Проверить, не удалены ли нужные optional provider keys.
- Не трогать `.env` с секретами.

## Предлагаемый порядок уборки

1. Зафиксировать/оставить G1 как первую чистую пачку.
2. Отдельно проверить G2 + G3: это agentic migration.
3. Принять решение по G4: оставить mouse frontend или откатить эксперимент.
4. Принять решение по G5: удалить/игнорировать generated outputs или сохранить как fixture.
5. После R3/R4 отдельно разобрать G6.
6. Проверить `.env.example` из G7.

## Что нельзя делать без подтверждения

- Удалять `outputs/apple-iphone-17/`.
- Восстанавливать или окончательно удалять `outputs/product-agent-studio-deck.html`.
- Откатывать `apps/frontend/src/App.tsx` и untracked mouse assets.
- Откатывать agentic runtime files.
