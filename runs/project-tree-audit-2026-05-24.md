# Project Tree Audit: 2026-05-24

## Scope

Проверка структуры проекта `C:\Project\product-agent-studio`, runtime workflow, `agent-pack`, frontend и доступных локальных команд.

## Tree Summary

- `agent-pack/`: восстановлен baseline агентов, workflows, guardrails, quality gates, templates и schemas.
- `runtime/typescript/`: содержит route config, Agents SDK layer, stage gates, workflow validator и scaffold runner.
- `apps/frontend/`: React/Vite frontend с текущим лендингом FreshStep.
- `tests/playwright/`: desktop/mobile smoke tests.
- `outputs/`: содержит текущие и исторические workflow outputs.

## Artifact Pack Status

- Agents: 13 files present.
- Artifact templates: 17 expected templates present.
- Schemas: 13 schema files present.
- Required research templates present: `research-summary`, `competitive-analysis`, `proto-personas`, `synthetic-interviews`, `swot`.
- Stage gate template present: `agent-pack/templates/stage-gate-ledger.template.md`.

## Runtime Status

- `runtime/typescript/workflow-stages.ts` defines per-stage required artifacts.
- `runtime/typescript/validate-workflow-run.ts` validates full runs and partial runs via `--through <stage-id>`.
- `runtime/typescript/run-landing-workflow.ts` creates startup artifacts:
  - `workflow-scaffold.md`
  - `run-plan.md`
  - `handoff-bundle.md`
  - `stage-gate-ledger.md`
  - `recursive-brief.md`

## Checks Run

| Command | Result |
|---|---|
| `yarn validate:config` | pass |
| `yarn typecheck` | pass |
| `yarn agents:inspect` | pass |
| `yarn qa:playwright` | pass, 4 tests |
| `yarn notion:check` | pass, local token configured |
| `yarn landing:run "project tree verification clean intake"` | pass |
| `yarn workflow:validate outputs\project-tree-verification-clean-intake\2026-05-24 --through 00-intake` | pass, 0 errors, 0 warnings |
| `yarn workflow:validate outputs\project-tree-verification-stable-flow\2026-05-24 --through 01-research` | expected fail, research artifacts intentionally missing after intake-only scaffold |

## Known Non-Compliant Historical Output

`outputs\shoe-cleaning-service\2026-05-24` does not pass the new strict workflow validator. Main missing items:

- `stage-gate-ledger.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- full research sections required by `workflow-stages.ts`

This is expected after tightening gates. It should be backfilled before treating that historical landing run as a complete release bundle.

## Residual Risks

- Many newly restored `agent-pack` docs/templates are baseline versions, not the richer original files that existed before the folder disappeared.
- JSON schemas are structurally present, but most are permissive placeholder schemas except `research-summary.schema.json`.
- Notion publication was not tested because external write requires target page/database and human approval.
- No git repository is available in this workspace, so change tracking cannot be verified via `git status`.
