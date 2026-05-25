---
schema_payload:
  status: ready
  inputs_used:
    - reference-analysis.md
    - ia-brief.md
  visual_direction: "Clean light service landing with blue/green accents, large hero and structured cards."
  sections:
    - name: "Hero"
      purpose: "Explain offer"
    - name: "Solutions"
      purpose: "Reduce objections"
    - name: "Tariffs"
      purpose: "Compare scenarios"
    - name: "Flow"
      purpose: "Explain activation"
    - name: "Trust"
      purpose: "Show limits"
    - name: "Request"
      purpose: "Capture lead"
  components:
    - "Header"
    - "CTA button"
    - "Service card"
    - "Tariff card"
    - "Lead form"
  responsive_notes:
    - "Mobile stacks cards and keeps CTA visible."
  accessibility_notes:
    - "Use semantic sections, labels, sufficient contrast."
---
# Design Brief

## Inputs Used

- `reference-analysis.md`
- `prd.md`
- `ia-brief.md`

## Visual Direction

Светлый сервисный лендинг с крупным hero и спокойной B2B/consumer эстетикой. Палитра: белый/молочный фон, глубокий navy для текста, зеленый/синий акцент, немного теплого светлого серого. Не использовать доминирующий purple/cream/brown theme.

## Sections

| Section | Layout | Purpose |
|---|---|---|
| Hero | Large left copy + right SIM/eSIM dashboard visual | Explain offer |
| Solutions | 6 cards | Reduce objections |
| Tariffs | 3 product cards | Compare SIM/eSIM options |
| Flow | Horizontal/stacked steps | Explain activation |
| Trust | Dense trust band | Safety and documents |
| Request | Form + checklist | Capture lead |
| FAQ | Accordion-like cards | Handle doubts |

## Components

- Header with logo, nav and CTA.
- Primary button with arrow icon.
- Service cards with lucide icons.
- Tariff cards with price/status label.
- Compatibility checker mock.
- Lead form with labels.

## Responsive Notes

- Desktop: max-width 1180-1220px, hero around first viewport.
- Tablet: two-column cards.
- Mobile: single-column, no text overlap, CTA buttons full-width.

## Accessibility Notes

- Semantic `header`, `main`, `section`, `footer`.
- Form inputs have labels.
- Contrast checked by visual design.
- No text embedded in images.

## Agent Output

```yaml
agent_name: design
status: success
inputs_used:
  - reference-analysis.md
outputs:
  design_brief: design-brief.md
assumptions:
  - Frontend can implement custom CSS without design system expansion.
risks:
  - Over-copying reference must be avoided.
open_questions:
  - Need final production brand assets.
recommended_next_step: Create copy deck and screens.
```
