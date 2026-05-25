# Landing Agent Orchestration Workflow

## Goal

Turn one product request into a validated artifact bundle and, when allowed by gates, a frontend implementation.

## Manager-Style Orchestration

- `orchestrator` owns the user dialogue, routing, gate enforcement and final response.
- Specialists are bounded capabilities, usually exposed as tools.
- Handoff is allowed only when a specialist must own a separate branch of work.
- The final answer is assembled by `orchestrator`, not by a specialist.

## Stage Graph

```text
00-intake
  -> 01-research
  -> 02-prd
  -> 03-ia
  -> 04-design
  -> 05-copy
  -> 06-screens
  -> 07-prototype
  -> 08-frontend
  -> 09-visual-reference-review, если был visual reference
  -> 10-test-bench
  -> 11-qa
  -> 12-release
```

Optional:

```text
02-prd -> notion-prd-export.md
```

Notion publication is an external write and requires target page/database plus human approval.

## Capabilities

| Stage | Agent | Required outputs |
|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md` |
| 01-research | research | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` |
| 02-prd | prd | `prd.md` |
| 03-ia | ia | `ia-brief.md` |
| 04-design | design | `reference-analysis.md`, `design-brief.md` |
| 05-copy | copywriting | `copy-deck.md` |
| 06-screens | design-generator | `screens.md` |
| 07-prototype | prototype | `prototype-report.md` |
| 08-frontend | frontend | `frontend-result.md` |
| 09-visual-reference-review | qa-review | `visual-reference-review.md` |
| 10-test-bench | test-bench | `test-bench-result.md` |
| 11-qa | qa-review | `qa-report.md` |
| 12-release | release | `release-notes.md` |

## Parallelism Rules

`orchestrator` may run specialists in parallel only when their inputs are already complete and their write scopes do not conflict.

Allowed parallelism:

- Test Bench may start after `recursive-brief.md` as companion work, but final `test-bench-result.md` must refresh after PRD, IA, prototype, frontend and visual reference review.
- Research sub-work can split into source research, competitive analysis, proto-personas, synthetic interviews and SWOT, but the research stage is not complete until all required research artifacts exist.
- IA and early design exploration may be prepared in parallel only after PRD/research inputs exist, but downstream `screens`, `prototype` and `frontend` must use the final handed-off artifacts.

Blocked parallelism:

- Frontend cannot start before PRD, IA, design, copy, screens and prototype are complete, except explicit `quick draft`.
- QA cannot start before frontend, visual reference review when applicable, and final test bench are complete.
- Release cannot start before QA passes or records a blocker.
- Specialists do not own final user response; `orchestrator` synthesizes final status.

## Runtime Enforcement

- Source of stage definitions: `runtime/typescript/workflow-stages.ts`.
- Partial validation: `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through <stage-id>`.
- Full validation: `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD>`.
- Errors block downstream completion.
- Warnings must be carried into risks/TODO.

## Research Lock

PRD and downstream stages are blocked until research outputs include JTBD, proto_personas, simulated_interviews, competitor analysis, SWOT, source/evidence status and validation plan.

## Frontend Lock

Frontend is blocked until PRD, IA, design, copy, screens and prototype artifacts are complete, except explicit `quick draft`.

## Visual Reference Lock

If the user provides a visual reference or asks to match a site, visual reference review is blocked until frontend exists and must complete before test bench finalization, QA and release.

## Failure Handling

- `partial`: continue only when risks are explicit and downstream claims preserve `needs validation`.
- `blocked`: stop and request the missing input, approval or source.
- `qa fail`: return to the responsible stage, then re-run validation.

## Sources

- OpenAI Agents SDK describes handoffs as tools and `Agent.asTool()` for specialist capabilities: https://openai.github.io/openai-agents-js/guides/handoffs/
- Atlassian product discovery emphasizes continuously updated discovery from new data: https://www.atlassian.com/agile/product-management/discovery
