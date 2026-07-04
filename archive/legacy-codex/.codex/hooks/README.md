# Hooks

Hooks are deterministic lifecycle checks around the product pipeline. They are not the place for product judgment; product judgment stays in agents, QA and quality gates.

## Lifecycle Hooks

| Hook | Purpose | Blocks When |
|---|---|---|
| `before_run` | Load project instructions, route config, schemas, policies. | Required config or policy file is missing. |
| `before_agent_call` | Check required inputs for the target agent. | Required artifact is missing and no scaffold mode is allowed. |
| `after_agent_call` | Validate agent status and output contract. | Agent returns `blocked` or invalid schema. |
| `before_tool_call` | Check approval matrix and sensitive payloads. | Action requires approval or payload contains secret-like data. |
| `after_tool_call` | Redact sensitive output and attach evidence. | Tool output contains secrets or unsafe data. |
| `before_qa` | Require a complete handoff bundle. | Any required product artifact is missing. |
| `after_qa` | Route failed QA back to the owner capability. | QA verdict is `fail`. |
| `before_final` | Check quality gates, release notes and no sensitive outputs. | QA/release/validation is incomplete. |

## Required Product Bundle Before QA

```text
recursive_brief
research_summary
prd
ia_brief
design_brief
screens
copy_deck
prototype_report
frontend_result
test_bench_result
```

## Implementation Notes

- TypeScript skeleton: `runtime/typescript/hooks.ts`.
- Guardrail policy: `agent-pack/guardrails/guardrails.policy.md`.
- Approval matrix: `agent-pack/guardrails/approval-matrix.md`.
- Tracing policy: `integrations/observability/tracing.policy.md`.

## Safety

- Do not log raw sensitive payloads.
- Do not run deploy, deletion, external send, mass change, secret change or broad MCP connection without human approval.
- If a hook blocks, `orchestrator` updates risks/open questions and routes the task back to the responsible capability.
