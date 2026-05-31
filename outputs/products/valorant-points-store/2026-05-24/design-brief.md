---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
    - ia-brief.md
    - research-summary.md
    - copy-deck.md
  visual_direction: "Оригинальный high-contrast tactical marketplace, не копия Riot site."
  sections:
    - name: "Hero"
      purpose: "value and disclaimer"
    - name: "Regions"
      purpose: "compatibility"
    - name: "Packs"
      purpose: "selection"
  components:
    - "Header"
    - "Region segmented control"
    - "Package cards"
    - "Safety cards"
  responsive_notes:
    - "Desktop two-column hero"
    - "Mobile single column"
  accessibility_notes:
    - "Semantic headings"
    - "Alt text"
    - "Native links/buttons"
---
# Design Brief

## Inputs Used

- `prd.md`
- `ia-brief.md`
- `research-summary.md`
- `copy-deck.md`

## Visual Direction

Оригинальный high-contrast tactical marketplace: graphite background, red-orange и cyan accents, angular panels, code-card visuals. Не копировать VALORANT site layout, logo, agent art, maps или official typography.

## UX Principles

- Region safety first.
- Fast scan for package cards.
- Explicit unaffiliated status.
- No account credential flow.

## User Journey

| Step | User intent | UI response | Risk |
|---|---|---|---|
| Hero | Is this safe? | Disclaimer + no-login | confusion |
| Region | Will it redeem? | region selector | mismatch |
| Packs | What to buy? | package cards | fake stock |

## Sections

| Section | Purpose | Components | Content source |
|---|---|---|---|
| Hero | value/disclaimer | CTA, stat chips, visual | PRD/copy |
| Regions | compatibility | segmented chips | research |
| Packs | selection | cards | copy |
| Safety | trust | icon grid | PRD |
| FAQ | objections | accordion-like cards | copy |

## Components

- Header
- Hero visual
- Region segmented control
- Package cards
- Safety grid
- FAQ cards

## Responsive Notes

| Viewport | Layout | Priority content | Risk |
|---|---|---|---|
| Desktop | 2-col hero, 3-col cards | region + packs | visual overload |
| Mobile | single column | CTA, disclaimer | long copy |

## Accessibility Notes

- Heading order: one H1, section H2s.
- Labels: region controls readable.
- Focus: native anchors/buttons.
- Contrast: high contrast text.
- Motion: minimal framer transitions.

## Asset Requirements

Оригинальный generated hero image, без Riot assets.

## Risks

- Looking too close to official VALORANT site. Use original brand `VP Nexus`.
