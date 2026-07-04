# Stage Gate Ledger

| Stage | Status | Required artifacts | Gate notes |
|---|---|---|---|
| 00-intake | completed | `run-plan.md`, `handoff-bundle.md` | Task classified as standalone research. |
| 01-research | completed | `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `source-log.md` | Exact market proof not found; adjacent evidence and product inference separated. |
| visual evidence | partial | Lazyweb preflight note in `research-summary.md` | Lazyweb returned zero flow coverage for exact chat/bill payment queries; visual benchmark needed before design. |
| PRD | not_started | `prd.md` | Needed only if concept proceeds. |
| design | not_started | `design-brief.md`, `screens.md` | Requires visual evidence collection first. |

## Validation

| Check | Status | Notes |
|---|---|---|
| `yarn workflow:doctor` | passed | Optional provider key warnings only. |
| Subagent research | completed | Two subagents returned market and product scenario synthesis. |
| Source/evidence separation | completed | See `source-log.md`. |
| `yarn research:lint research/projects/a3-yandex-alice-utilities-smart-home-research/2026-06-30` | passed | Combined research pack passed no-shallow-summary, CJM depth, generic claim, portable sentence and repetitive row gates. |
| `yarn workflow:sync research/projects/a3-yandex-alice-utilities-smart-home-research/2026-06-30` | blocked | Manual research-only run-state did not match runtime `stages` shape; command failed with `Cannot read properties of undefined (reading '00-intake')`. Content artifacts remain valid and linted. |
| Notion publication dry-run | passed | `publication_allowed: true`; shape, completeness, editor, cross-link and anti-slop gates passed. |
| Notion publication | published | Hub URL: https://www.notion.so/38f6473174e5819eaccbed460ff0fe2c |
