---
schema_payload:
  status: ready
  inputs_used:
    - screens.md
    - copy-deck.md
  prototype_type: "manual clickable landing prototype"
  start_screen: "Hero"
  transition_map:
    - from: "Hero"
      action: "Primary CTA"
      to: "Request"
    - from: "Hero"
      action: "Secondary CTA"
      to: "Tariffs"
  completion_step: "Request form reached"
  missing_interactions:
    - "Real form submission"
---
# Prototype Report

## Inputs Used

- `screens.md`
- `copy-deck.md`
- `prd.md`

## Prototype Type

Manual clickable landing prototype implemented as responsive React page.

## Start Screen

Hero section with `SIM Line`, primary copy and CTA `Подобрать SIM`.

## Transition Map

| From | Action | To | Expected result |
|---|---|---|---|
| Hero | Подобрать SIM | Request section | User sees form |
| Hero | Сравнить тарифы | Tariffs section | User sees product cards |
| Tariff card | Выбрать | Request section | User continues to lead form |
| eSIM checker | Проверить eSIM | Request section | User can request compatibility check |

## Missing Interactions

- Real form submit.
- Real tariff selection state.
- Real eSIM device database.
- Real payment/KYC.

## Agent Output

```yaml
agent_name: prototype
status: success
inputs_used:
  - screens.md
outputs:
  prototype_report: prototype-report.md
assumptions:
  - Anchor links are sufficient for prototype.
risks:
  - Real checkout requires separate flow.
open_questions:
  - Should form connect to CRM later?
recommended_next_step: Implement frontend.
```
