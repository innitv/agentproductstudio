# Stage Gate Ledger

## Run

- Project slug: standard-profile-flow-smoke
- Date: 2026-05-26
- Goal: Standard profile flow smoke
- Workflow profile: standard

## Rule

Каждый stage считается завершенным только когда обязательные артефакты записаны, `handoff-bundle.md` обновлен, risks/open questions перенесены дальше и validation не возвращает errors для complete bundle.

## Stage Status

| Stage | Owner | Required artifacts | Status | Gate notes |
|---|---|---|---|---|
| 00-intake Intake and Recursive Brief | orchestrator | `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md` | partial | Scaffold initialized |
| 01-research Deep Research | research | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | pending | Scaffold initialized |
| 02-prd Product Requirements | prd | `prd.md` | pending | Scaffold initialized |
| 03-ia Information Architecture | ia | `ia-brief.md` | pending | Scaffold initialized |
| 04-design Design Brief | design | `reference-analysis.md`, `design-brief.md` | pending | Scaffold initialized |
| 05-copy Copy Deck | copywriting | `copy-deck.md` | pending | Scaffold initialized |
| 06-screens Screens | design-generator | `screens.md` | pending | Scaffold initialized |
| 07-prototype Prototype | prototype | `prototype-report.md` | pending | Scaffold initialized |
| 08-frontend Frontend | frontend | `frontend-result.md` | pending | Scaffold initialized |
| 09-visual-reference Visual Reference Review | qa-review | `visual-reference-review.md` | pending | Scaffold initialized |
| 10-test-bench Test Bench | test-bench | `test-bench-result.md` | pending | Scaffold initialized |
| 11-qa QA Review | qa-review | `qa-report.md` | pending | Scaffold initialized |
| 12-release Release | release | `release-notes.md` | pending | Scaffold initialized |

## Validation Runs

| Time | Command | Result | Notes |
|---|---|---|---|
