# Stage Gate Ledger

## Run

- Project slug:
- Date:
- Goal:

## Rule

Каждый stage считается завершенным только когда:

- обязательные артефакты stage записаны в `outputs/<project-slug>/<YYYY-MM-DD>/`;
- каждый артефакт содержит `## Inputs Used`, кроме `run-plan.md` и `handoff-bundle.md`;
- `handoff-bundle.md` обновлен после stage;
- unknowns, assumptions, risks и next artifact явно перенесены дальше;
- `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` не возвращает ошибок для complete bundle без visual reference.
- `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference` не возвращает ошибок для complete bundle с visual reference.

## Stage Status

| Stage | Owner | Required artifacts | Status | Gate notes |
|---|---|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `handoff-bundle.md`, `recursive-brief.md` | pending |  |
| 01-research | research | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | pending |  |
| 02-prd | prd | `prd.md` | pending |  |
| 03-ia | ia | `ia-brief.md` | pending |  |
| 04-design | design | `design-brief.md` | pending |  |
| 05-copy | copywriting | `copy-deck.md` | pending |  |
| 06-screens | design-generator | `screens.md` | pending |  |
| 07-prototype | prototype | `prototype-report.md` | pending |  |
| 08-frontend | frontend | `frontend-result.md` | pending |  |
| 09-test-bench | test-bench | `test-bench-result.md` | pending |  |
| 10-qa | qa-review | `qa-report.md` | pending |  |
| 11-release | release | `release-notes.md` | pending |  |

## Validation Runs

| Time | Command | Result | Notes |
|---|---|---|---|
