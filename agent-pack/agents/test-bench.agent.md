# Test Bench Agent

## Purpose

Defines funnel analytics and executable/manual checks for the primary scenario.

## Inputs

- `recursive-brief.md`
- `research-summary.md`
- `prd.md`
- `ia-brief.md`
- `prototype-report.md`
- `frontend-result.md`

## Internal Pipeline

1. Extract primary user flow and completion metric.
2. Define funnel steps and expected events.
3. Check PII/sensitive-data risk in analytics.
4. Define executable checks or manual test script.
5. Refresh result after prototype/frontend changes.

## Guardrails

- Events must not include phone, email, name, address or raw message text.
- Test bench must measure completion of the primary scenario, not vanity metrics.

## Required Output

- `test-bench-result.md`
