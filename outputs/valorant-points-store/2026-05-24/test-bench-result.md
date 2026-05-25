---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
    - ia-brief.md
    - prototype-report.md
    - frontend-result.md
  main_funnel:
    - step: "Hero"
      action: "Click region CTA"
    - step: "Regions"
      action: "Choose region"
    - step: "Packs"
      action: "Select package"
  analytics_spec:
    - event: "region_check_click"
      trigger: "Region CTA or chip"
    - event: "package_select_click"
      trigger: "Package CTA"
  pii_risk: "none"
  executable_checks:
    - command: "yarn qa:playwright"
      result: "pass"
  result: "pass"
---
# Test Bench Result

## Inputs Used

- `prd.md`
- `ia-brief.md`
- `prototype-report.md`
- `frontend-result.md`

## Main Funnel

| Step | User action | Expected event | Success condition |
|---|---|---|---|
| Hero | click region CTA | `region_check_click` | reaches region section |
| Regions | choose region | `region_check_click` | region intent captured |
| Packs | select pack | `package_select_click` | package intent captured |

## Completion Metric

Package selection after region section.

## Analytics Spec

| Event | Trigger | Properties | PII Risk | Notes |
|---|---|---|---|---|
| region_check_click | CTA/chip | region_code | none | no account data |
| package_select_click | package CTA | package_id, region_code | none | no PII |
| safety_read_intent | safety link | section_id | none | trust |

## PII Risk

None in current events.

## Executable Checks

| Check | Command / method | Result |
|---|---|---|
| UI smoke | `yarn qa:playwright` | pass |

## Manual Test Script

1. Open page.
2. Confirm disclaimer.
3. Click region CTA.
4. Confirm package cards.
5. Confirm safety text.

## Result

pass

## Notes

Final command result recorded after validation.
