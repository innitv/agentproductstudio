---
schema_payload:
  status: ready
  inputs_used:
    - ia-brief.md
    - screens.md
    - prd.md
    - copy-deck.md
  prototype_type: "Frontend prototype"
  start_screen: "#top"
  transition_map:
    - from: "#top"
      trigger: "Проверить регион"
      to: "#regions"
    - from: "#packs"
      trigger: "Select code"
      to: "#safety"
  completion_step: "User clicks package selection CTA"
  missing_interactions:
    - "Real checkout"
    - "Live stock"
---
# Prototype Report

## Inputs Used

- `ia-brief.md`
- `screens.md`
- `prd.md`
- `copy-deck.md`

## Prototype Type

Frontend prototype.

## Start Screen

`#top`

## Transition Map

| From | Trigger | To | Expected state |
|---|---|---|---|
| Header | click Regions | `#regions` | region section visible |
| Hero | click Проверить регион | `#regions` | region section visible |
| Region | click package | `#packs` | packages visible |
| Package | click Select | `#safety` | safety reminder |

## Completion Step

User clicks package selection CTA.

## Manual Test Script

1. Open page.
2. Confirm disclaimer visible.
3. Click region CTA.
4. Select a package.
5. Confirm safety section says no password.

## Missing Interactions

- Real checkout.
- Live stock.
- Region validation against account data.

## Risks

- Users may still confuse independent store with official channel if disclaimer is not prominent.
