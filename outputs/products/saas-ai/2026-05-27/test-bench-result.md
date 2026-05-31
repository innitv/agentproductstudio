---
schema_payload:
  {
    "status": "ready",
    "inputs_used": [
      "recursive-brief.md",
      "research-summary.md",
      "prd.md",
      "ia-brief.md",
      "prototype-report.md",
      "frontend-result.md"
    ],
    "main_funnel": [
      {
        "step": "hero_view"
      },
      {
        "step": "hero_cta_click"
      },
      {
        "step": "lead_form_submit"
      }
    ],
    "analytics_spec": [
      {
        "event": "hero_cta_click",
        "pii_risk": "none"
      },
      {
        "event": "lead_form_submit",
        "pii_risk": "low"
      }
    ],
    "pii_risk": "low",
    "executable_checks": [
      {
        "check": "CTA and form visible on desktop/mobile",
        "status": "planned"
      }
    ],
    "result": "pass"
  }
---

# Test Bench Result

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Owner | test-bench |
## Inputs Used
- recursive-brief.md
- research-summary.md
- prd.md
- ia-brief.md
- prototype-report.md
- frontend-result.md
## Main Funnel
1. hero_view
2. hero_cta_click
3. lead_form_submit
## Analytics Spec
| Event | Trigger | PII risk |
|---|---|---|
| hero_cta_click | click CTA | none |
| lead_form_submit | valid submit | low |
## Executable Checks
- CTA and form visible on desktop/mobile
- No analytics properties contain raw phone/email
## Result
pass
