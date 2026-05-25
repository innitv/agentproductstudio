# Deep Research Agent Pack Fill: 2026-05-24

## Scope

Наполнены файлы, которые после восстановления были слишком минимальными:

- `agent-pack/agents/*.agent.md`
- `agent-pack/artifacts/**/*.template.md`
- `agent-pack/schemas/*.schema.json`
- `agent-pack/workflows/*.md`
- `agent-pack/quality/quality-gates.md`
- `agent-pack/guardrails/guardrails.policy.md`

## Research Basis

- Atlassian Product Discovery: continuous evidence-driven discovery and updated decisions from new data.
- Intercom Jobs-to-be-Done: product decisions should connect to the customer's job/progress.
- UXAtlas / UXArmy synthetic users discussions: synthetic participants are useful for hypothesis generation but not a replacement for real user evidence.
- JSON Schema Draft 2020-12 official docs: schemas should declare `$schema` and describe validation constraints.
- Notion official docs/help: Notion publication requires integration setup, target access and appropriate permissions.
- OpenAI Agents SDK docs: specialist agents can be exposed as tools / handoff-style capabilities while the orchestrator keeps ownership.

## Key Changes

- Agent instructions now include purpose, inputs, internal pipeline, tools/guardrails and output expectations.
- Research contracts explicitly require `proto_personas`, `simulated_interviews`, `skipped_with_reason`, `evidence_status: synthetic`, validation plan and synthetic-as-fact QA checks.
- Artifact templates now include production-ready sections and readiness checklists.
- JSON schemas are no longer empty placeholders; key artifacts have required fields and structured constraints.
- Workflow docs now document stage graph, research lock, frontend lock, Notion approval and validation commands.

## Validation

| Command | Result |
|---|---|
| `yarn validate:config` | pass |
| `yarn typecheck` | pass |
| JSON parse check for `agent-pack/schemas/*.json` | pass |
| `yarn agents:inspect` | pass |
| `yarn qa:playwright` | pass, 4 tests |
| `yarn workflow:validate outputs\project-tree-verification-clean-intake\2026-05-24 --through 00-intake` | pass, 0 errors, 0 warnings |

## Remaining Notes

- Full schema validation is present at the JSON Schema level, but `workflow:validate` still checks Markdown sections by markers. A future improvement is schema-aware Markdown frontmatter or generated JSON artifacts.
- Notion write was not executed because it requires target page/database and human approval.
