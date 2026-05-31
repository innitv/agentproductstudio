---
schema_payload:
  status: pass_with_known_limitations
  inputs_used:
    - research-summary.md
    - prd.md
    - frontend-result.md
    - visual-reference-review.md
    - test-bench-result.md
  research_integrity:
    proto_personas: "present"
    synthetic_interviews: "marked synthetic"
    synthetic_as_fact: "not detected"
  prd_fit: "pass"
  accessibility: "pass basic checks"
  responsive: "pass playwright"
  visual_reference_review: "pass_with_notes"
  validation:
    - command: "yarn qa:playwright"
      result: "pass"
  blockers: []
---
# QA Report

## Inputs Used

- All required workflow artifacts.
- `visual-reference-review.md`

## Status

`pass_with_known_limitations`

## Research Integrity

| Check | Result | Notes |
|---|---|---|
| proto-personas present | pass | 3 personas |
| synthetic interviews marked synthetic | pass | evidence_status synthetic |
| no synthetic-as-fact | pass | not used as proof |
| claims have evidence/status | pass | prices marked as not connected to live catalog |
| SWOT complete | pass | 4 quadrants |

## PRD Fit

Pass: region checker, no-login safety and disclaimer implemented.

## IA / Screens / Prototype Consistency

Pass.

## Copy Claims

Pass with limitations: prices/stock are explicitly placeholder.

## Accessibility

Basic pass: headings, alt text, native links/buttons.

## Responsive

Pass: desktop and mobile Playwright projects completed.

## Visual Reference Review

Pass with notes: full-page desktop/mobile screenshots, reference scroll-through screenshots and local section screenshots are present. Review covers header, hero, section rhythm, cards/components, CTA, media, footer and mobile layout. Defect found during review: package cards were hidden in full-page screenshot due to `whileInView`; fixed by rendering commerce cards without viewport-gated opacity.

## Funnel Analytics

Events avoid PII.

## Secrets / Sensitive Data

No secrets added.

## Validation

| Command | Result |
|---|---|
| `yarn qa:playwright` | pass |

## Blockers

None for local prototype.

## Risks / Follow-Up

- Legal review.
- Real catalog/pricing.
- Checkout/refund policy.

