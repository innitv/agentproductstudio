# Release Notes Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready / blocked / released |
| Owner | release |

## Inputs Used

- `qa-report.md`
- `frontend-result.md`
- `test-bench-result.md`
- `stage-gate-ledger.md`
- `handoff-bundle.md`
- `artifact-manifest.json`
- `run-index.md`

## Release Scope

| Field | Value |
|---|---|
| Release type | artifact-only / code / external-publication / deploy / git-handoff / mixed |
| Exact target |  |
| Approval required | yes / no |
| Release owner | release |

## Run Ledger Audit

| Ledger Item | Status | Evidence / Notes |
|---|---|---|
| `run-state.json` |  |  |
| `run-meta.json` |  |  |
| `artifact-manifest.json` |  |  |
| `run-index.md` |  |  |
| `stage-gate-ledger.md` |  |  |
| `handoff-bundle.md` |  |  |

## Changed Files

| File | Type | Change | In Release Scope |
|---|---|---|---|

## Changed Artifacts

| Artifact | Producer Stage | Status | Evidence / Notes |
|---|---|---|---|

## Surface Output Summary

| Surface | Declared Scope | Actual Output | Verification Evidence | Deviations / Risk |
|---|---|---|---|---|

## What Changed

## Dependency & Sensitive Delta

| Area | Result | Evidence / Notes |
|---|---|---|
| `package.json` / lockfile |  |  |
| env / secrets |  |  |
| analytics payloads |  |  |
| raw provider outputs |  |  |
| PII risk |  |  |

## Validation

| Check | Command / Evidence | Result | Release Impact |
|---|---|---|---|

## Release Decision Matrix

| Gate | Required State | Actual State | Decision |
|---|---|---|---|
| QA status | pass / pass_with_known_limitations |  |  |
| Workflow validation | pass |  |  |
| External approvals | approved / not_required |  |  |
| External publication records | complete / not_required |  |  |
| Rollback readiness | ready |  |  |
| Remaining blockers | none or accepted waiver |  |  |

## Deployment Notes

| Step | Command / Action | Expected Result | Stop Condition |
|---|---|---|---|

## Post-Release Smoke Checks

| Check | Target | Expected Result | Owner |
|---|---|---|---|

## Rollback Notes

| Surface | Rollback Action | Validation After Rollback | Data Loss Risk | Approval Needed |
|---|---|---|---|---|

## Approval And External Records

| Action | Target | Approval / Record | Status | Evidence |
|---|---|---|---|---|

## Remaining Risks

| Risk | Severity | Owner | Follow-Up |
|---|---|---|---|

## Approval Notes
