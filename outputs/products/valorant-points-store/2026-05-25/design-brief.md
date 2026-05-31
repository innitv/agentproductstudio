---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
    - ia-brief.md
    - research-summary.md
    - copy-deck.md
    - reference-analysis.md
  visual_direction: "Оригинальный editorial commerce landing, вдохновленный sales-ритмом Pixel Perfect без прямого копирования."
  sections:
    - name: "Hero"
      purpose: "value and disclaimer"
    - name: "Regions"
      purpose: "compatibility"
    - name: "Packs"
      purpose: "selection"
    - name: "Flow"
      purpose: "purchase clarity"
  components:
    - "Header"
    - "Region segmented control"
    - "Package cards"
    - "Numbered flow list"
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
- `reference-analysis.md`
- Reference: `https://pixelperfect.school/ai-native-designer`

## Visual Direction

Оригинальный editorial commerce look, вдохновленный sales-ритмом Pixel Perfect без прямого копирования. Light cream grid background, black structural blocks, red urgency accents, cyan verification accent, large first-screen typography, numbered sections and dense commerce cards. Не копировать VALORANT site layout, Pixel Perfect copy, логотипы, official Riot art, maps или official typography.

## UX Principles

- Region safety first.
- Fast scan for package cards.
- Explicit unaffiliated status.
- No account credential flow.
- Sales-flow clarity before future checkout.

## User Journey

| Step | User intent | UI response | Risk |
|---|---|---|---|
| Hero | Is this safe? | No-login value prop + disclaimer | confusion |
| Region | Will it redeem? | region selector | mismatch |
| Packs | What to buy? | package cards | fake stock |
| Flow | What happens next? | four numbered steps | unclear fulfillment |
| Safety | Can I trust it? | safety rules and FAQ | scam concern |

## Sections

| Section | Purpose | Components | Content source |
|---|---|---|---|
| Hero | value/disclaimer | CTA, visual, offer panel | PRD/copy |
| Regions | compatibility | segmented chips | research |
| Packs | selection | cards | copy |
| Flow | purchase clarity | numbered list | PRD/copy |
| Safety | trust | icon grid | PRD |
| FAQ | objections | cards | copy |

## Components

- Header
- Hero offer visual
- Region segmented control
- Package cards
- Numbered flow list
- Safety grid
- FAQ cards

## Responsive Notes

| Viewport | Layout | Priority content | Risk |
|---|---|---|---|
| Desktop | 2-col hero, 3-col cards, 4-col flow | region + packs | visual overload |
| Mobile | single column | CTA, disclaimer, region | long copy |

## Accessibility Notes

- Heading order: one H1, section H2s.
- Labels: region controls readable.
- Focus: native anchors/buttons.
- Contrast: black/cream/red/cyan combinations checked by visual review.
- Motion: minimal framer transitions.

## Asset Requirements

Оригинальный generated hero image, без Riot assets и без копирования Pixel Perfect media.

## Risks

- Looking too close to reference site. Use only broad landing patterns and original VP Nexus execution.
