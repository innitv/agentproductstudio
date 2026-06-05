# QA Report Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | pass / pass_with_known_limitations / fail / blocked |
| Owner | qa-review |
| QA Scope | product pipeline / reference-driven / frontend / publication / release |

## Inputs Used

- `recursive-brief.md`
- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `prd.md`
- `ia-brief.md`
- `design-brief.md`
- `copy-deck.md`
- `screens.md`
- `prototype-report.md`
- `frontend-result.md`
- `test-bench-result.md`
- `stage-gate-ledger.md`
- `handoff-bundle.md`

## QA Scope & Evidence Plan

| Audit Area | Planned Check | Evidence Source | Status |
|---|---|---|---|
| Product pipeline |  |  | pending / pass / fail / blocked |
| Research integrity |  |  | pending / pass / fail / blocked |
| PRD traceability |  |  | pending / pass / fail / blocked |
| IA / screens / prototype |  |  | pending / pass / fail / blocked |
| Frontend implementation |  |  | pending / pass / fail / blocked |
| Accessibility |  |  | pending / pass / fail / blocked |
| Responsive |  |  | pending / pass / fail / blocked |
| Visual reference |  |  | not_applicable / pending / pass / fail / blocked |
| Figma handoff |  |  | not_applicable / pending / pass / fail / blocked |
| Notion publication |  |  | not_applicable / pending / pass / fail / blocked |
| Analytics / PII |  |  | pending / pass / fail / blocked |
| Release readiness |  |  | pending / pass / fail / blocked |

## Research Integrity

| Check | Result | Notes |
|---|---|---|
| Research Plan present |  |  |
| Source Quality Pass present |  |  |
| Contradiction Review present |  |  |
| Research-To-Design Handoff present |  |  |
| proto-personas present |  |  |
| synthetic interviews marked synthetic |  |  |
| no synthetic-as-fact |  |  |
| claims have evidence/status |  |  |
| SWOT complete |  |  |
| DeepSeek/Gemini claims not used as source-backed evidence |  |  |

## PRD Fit

## Traceability Audit

| Research / JTBD Signal | PRD Requirement | IA Node | Screen / Component | Copy / Prototype / Test Signal | Status |
|---|---|---|---|---|---|

## IA / Screens / Prototype Consistency

## Copy Claims

## Accessibility

| Check | Result | Evidence | Notes |
|---|---|---|---|
| Semantic hierarchy / landmarks |  |  |  |
| Labels / names / descriptions |  |  |  |
| Keyboard path |  |  |  |
| Focus / active / disabled states |  |  |  |
| Contrast / readability |  |  |  |
| Motion / reduced motion |  |  |  |

## Responsive

## Negative & Edge Path Pass

| Scenario | Result | Evidence | Notes |
|---|---|---|---|
| Empty state |  |  |  |
| Loading state |  |  |  |
| Error state |  |  |  |
| Validation state |  |  |  |
| Success state |  |  |  |
| Long text / overflow |  |  |  |
| Repeated submit / duplicate action |  |  |  |
| Touch and keyboard completion |  |  |  |

## Funnel Analytics

## Secrets / Sensitive Data

## Visual Reference / Figma Handoff

| Check | Result | Evidence | Notes |
|---|---|---|---|
| Reference screenshots desktop/mobile |  |  |  |
| Section screenshot pairs |  |  |  |
| `visual-diff-result.json` present |  |  |  |
| `visual-reference-review.md` updated |  |  |  |
| Figma target / node evidence |  |  |  |
| Variables / components / Auto Layout deviations |  |  |  |

## Validation

| Command | Result |
|---|---|

## Evidence Matrix

| Finding ID | Evidence Type | Path / Command / Screenshot / Trace | Notes |
|---|---|---|---|

## Severity Matrix

| Finding ID | Severity | Owner Stage | Affected Artifact / Surface | Evidence | Recommendation | Release Impact |
|---|---|---|---|---|---|---|

## Skipped / Unavailable Checks

| Check | Reason | Impact | Required Follow-Up |
|---|---|---|---|

## Devil's Advocate / False Positive Pass

- Happy-path blind spots:
- Mock-only risks:
- Stale screenshot / stale artifact risks:
- Remaining doubts:

## Blockers

## Risks / TODO
