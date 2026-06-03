# Agentic Batch Inventory And Review — 2026-06-03

## Scope

Цель: отделить изменения, относящиеся к работе агентов, от продуктовых прототипов, generated outputs и visual tooling.

## Agentic Runtime Batch

Файлы:

- `package.json` — agentic/approval scripts.
- `runtime/typescript/agentic-approval-targets.ts`
- `runtime/typescript/agentic-rollout.ts`
- `runtime/typescript/approval-gate.ts`
- `runtime/typescript/run-workflow-engine.ts`
- `runtime/typescript/workflow-engine.ts`
- `runtime/typescript/workflow-state.ts`
- `runtime/typescript/workflow-stage-executors.ts`
- `runtime/typescript/status-resolver.ts`
- `runtime/typescript/test-agentic-engine.ts`
- `runtime/typescript/test-agentic-executor.ts`
- `runtime/typescript/test-agentic-readiness.ts`
- `runtime/typescript/test-agentic-rollout.ts`
- `runtime/typescript/test-approval-gate.ts`
- `runtime/typescript/validate-config-semantics.ts`

Review result:

- No blocking findings.
- Approval matching is target-scoped in both directions.
- `workflow:agentic-readiness --strict` uses strict readiness, not loose model-provider readiness.
- Agentic executor blocks without rollout enablement, `OPENAI_API_KEY`, exact approval target, registered specialist or required artifact output.
- Notion Agile export execution uses argument array execution instead of shell string interpolation.

## Agent Contract Docs Batch

Файлы:

- `AGENTS.md`
- `COMMANDS.md`
- `README.md`
- `PROJECT_CONNECTION_WORK_PLAN.md`
- `AGENTIC_EXECUTION_MIGRATION_PLAN.md`
- `runtime/typescript/README.md`
- `agent-pack/agents/*.agent.md`
- `agent-pack/guardrails/approval-matrix.md`
- `agent-pack/guardrails/guardrails.policy.md`
- `agent-pack/quality/quality-gates.md`
- `agent-pack/templates/agent-output-contract.schema.md`
- `agent-pack/workflows/agent-ops-best-practices.md`

Review result:

- No blocking findings.
- Agent docs use valid runtime statuses: `success|partial|blocked`.
- Markdown artifact outputs are documented as full `outputs.<artifact_name>` block scalars.
- `ready_for_approval` was removed from agent contracts.
- Approval matrix includes `model_provider_call` and matches runtime action ids.

## Explicitly Out Of Scope

- `apps/frontend/*`
- `outputs/*`
- `reports/visual-review/*`
- `design/figma/product-agent-studio-deck/*`
- Product prototype assets/views.

## Verification

- `yarn workflow:test-agentic` — pass.
- `yarn validate:config` — pass.
- `yarn docs:audit` — pass.
- `yarn typecheck` — pass.
- `yarn agents:inspect` — pass.
- `yarn agents:inspect --profile reference` — pass.
