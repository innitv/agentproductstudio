---
schema_payload:
  status: ready
  inputs_used:
    - ia-brief.md
    - design-brief.md
    - copy-deck.md
    - prd.md
  screen_list:
    - screen: "Landing"
      purpose: "Region-safe VP code purchase"
  desktop_specification: "Two-column hero, region console, pack grid, safety grid, FAQ."
  mobile_specification: "Single-column layout, hidden nav, stacked cards."
  states:
    - "Default EU region selected"
    - "Package cards visible"
---
# Screens

## Inputs Used

- `ia-brief.md`
- `design-brief.md`
- `copy-deck.md`
- `prd.md`

## Screen List

| Screen | Purpose | Entry point | Completion action |
|---|---|---|---|
| Landing | Region-safe VP code purchase | `/` | package select |

## Screen 1

### Desktop Specification

Hero two columns; left copy and CTA, right original code-card visual. Sections below: region checker, packs, safety, FAQ, final CTA.

### Mobile Specification

Single column, sticky-safe header, region chips wrap, package cards one column.

### Sections

| Section | Layout | Copy source | Components | States |
|---|---|---|---|---|
| Hero | 2-col | copy deck | buttons, stats | default |
| Regions | horizontal chips | research | segmented buttons | selected |
| Packs | 3 cards | copy deck | cards | selected |
| Safety | grid | PRD | icon cards | default |

## Mobile

Cards stack and CTAs remain visible.

## States

- Default: EU region selected.
- Loading: not implemented.
- Empty: stock placeholder.
- Error: not implemented.
- Success: package selection visual only.

## Asset Notes

Generated original hero image, no Riot assets.

## Open Questions

- Real checkout URL.

