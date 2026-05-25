---
schema_payload:
  status: ready
  inputs_used:
    - frontend-result.md
    - visual-reference-review.md
  main_funnel:
    - step: "Hero CTA"
      expected: "Request section"
    - step: "Tariff select"
      expected: "Request section"
    - step: "Request form"
      expected: "Visible fields"
  analytics_spec:
    - event: "sim_pick_click"
      trigger: "Primary CTA"
      pii: false
  pii_risk: medium
  executable_checks:
    - command: "yarn build"
      result: "passed"
  result: pass
---
# Test Bench Result

## Inputs Used

- `prd.md`
- `frontend-result.md`
- `visual-reference-review.md`

## Main Funnel

1. User opens landing.
2. User clicks `Подобрать SIM` or `Сравнить тарифы`.
3. User reviews SIM/eSIM options.
4. User reaches request form.
5. User can choose format and see lead fields.

## Analytics Spec

| Event | Trigger | Expected payload | PII |
|---|---|---|---|
| `sim_pick_click` | Hero/header CTA | source section | no |
| `tariff_view_click` | Secondary CTA | source section | no |
| `tariff_select_click` | Tariff card CTA | tariff id | no |
| `lead_submit_mock` | Request button | format only in prototype | avoid contact value |

## Executable Checks

- `yarn build` — passed.
- Playwright screenshot capture — passed.
- Full workflow validation — run after final artifacts.

## Result

`passed_with_notes`: frontend route and visual checks pass. Real form submit, data protection and CRM events are not implemented.

## Agent Output

```yaml
agent_name: test-bench
status: success
inputs_used:
  - frontend-result.md
outputs:
  test_bench_result: test-bench-result.md
assumptions:
  - Analytics are specified but not wired to a vendor.
risks:
  - Contact field must not be logged as analytics payload.
open_questions:
  - Which analytics provider should receive events?
recommended_next_step: QA review.
```
