---
schema_payload:
  status: ready
  inputs_used:
    - ia-brief.md
    - design-brief.md
    - copy-deck.md
  screen_list:
    - name: "Landing page"
      sections:
        - "Hero"
        - "Tariffs"
        - "Request"
  desktop_specification: "Two-column hero, card grids, full-width service bands."
  mobile_specification: "Single-column responsive landing."
  states:
    - "default"
---
# Screens

## Inputs Used

- `ia-brief.md`
- `design-brief.md`
- `copy-deck.md`

## Screen

Desktop landing:

1. Header: brand, nav, CTA.
2. Hero: left copy, CTA pair, right visual dashboard with SIM/eSIM cards.
3. Solutions: 6 service cards in grid.
4. Tariffs: 3 product cards.
5. Flow: 4 activation steps.
6. Trust: security/documents/support.
7. Request: form and checklist.
8. FAQ and footer.

## Mobile

- Header keeps brand and CTA, hides nav.
- Hero stacks copy above visual dashboard.
- Cards become one column.
- Request form fields stack.
- Buttons full-width where needed.

## Desktop Layout Notes

- Use full-width bands instead of nested cards.
- Keep cards radius <= 8px.
- Avoid decorative orbs/gradients.
- Keep typography large in hero, compact in cards.

## Agent Output

```yaml
agent_name: design-generator
status: success
inputs_used:
  - design-brief.md
  - copy-deck.md
outputs:
  screens: screens.md
assumptions:
  - Single landing screen is enough for prototype.
risks:
  - Actual form validation not implemented.
open_questions:
  - Need separate checkout screen later?
recommended_next_step: Create prototype report.
```
