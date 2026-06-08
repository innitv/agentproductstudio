# Screens Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | draft / partial / blocked / ready |
| Owner | design-generator |

## Inputs Used

- `ia-brief.md`
- `design-brief.md`
- `copy-deck.md`
- `prd.md`
- `STYLE_GUIDE.md`, если применимо
- `reference-analysis.md`, если применимо
- `design/figma/a3-design-system/token-map.md`, если применимо
- `design/figma/a3-design-system/variants-and-states-policy.md`, если применимо

## Input Readiness Pass

| Input | Required Signal | Status | Notes |
|---|---|---|---|
| `prd.md` | requirements, acceptance criteria, analytics/test signals |  |  |
| `ia-brief.md` | primary screen/action, entry points, state map |  |  |
| `design-brief.md` | visual direction, components, responsive/accessibility notes |  |  |
| `copy-deck.md` | CTA labels, section copy, microcopy, claims-to-validate |  |  |
| `STYLE_GUIDE.md` / reference | style rules, allowed/disallowed patterns |  |  |

## Design-System Grounding

| Asset | Reuse Decision | Gap / New Need | Notes |
|---|---|---|---|
| Tokens / variables |  |  |  |
| Typography styles |  |  |  |
| Component sets |  |  |  |
| Icons / assets |  |  |  |
| Layout / spacing rules |  |  |  |

## Surface Output Contract

| Field | Value |
|---|---|
| Surface type | `figma_board` / `product_ui` / `dashboard_console` / `landing` / `prototype` / `handoff` |
| Expected output units | screens / frames / sections / states / components |
| Coverage result | pending / pass / partial / blocked |
| Verification plan | screenshot / browser / prototype / QA / manual review |

### Coverage Gate

| Input Source | Required Signal | Output Unit | Included / Excluded | Reason / Notes |
|---|---|---|---|---|

### Evidence-To-Output Map

| Evidence / Source | Interpretation | Screen / Frame / Component | Verification Signal |
|---|---|---|---|

## Screen List

| Screen | Purpose | Entry Point | Completion Action | PRD Requirement | IA Node | Status |
|---|---|---|---|---|---|---|

## Screen Traceability

| Screen | Research / JTBD Signal | PRD Requirement | IA Node | Copy Source | Prototype / Test Signal |
|---|---|---|---|---|---|

## Screen 1

### Screen Goal

- User goal:
- Primary action:
- Success outcome:

### Desktop Specification

| Area | Layout / Grid | Components | Copy Source | Notes |
|---|---|---|---|---|

### Tablet Specification

| Area | Layout / Grid | Components | Copy Source | Notes |
|---|---|---|---|---|

### Mobile Specification

| Area | Layout / Grid | Components | Copy Source | Notes |
|---|---|---|---|---|

### Sections

| Section | Layout | Copy Source | Components | States | Acceptance Notes |
|---|---|---|---|---|---|

## Component Inventory

| Component | Source | Variants | States | Auto Layout Intent | Frontend Owner |
|---|---|---|---|---|---|

## State Inventory

| Surface | Default | Loading | Empty | Error | Validation | Success | Disabled / Permission |
|---|---|---|---|---|---|---|---|

## Responsive Constraints

| Viewport | Constraint | Risk | Required Behavior |
|---|---|---|---|

## Accessibility Notes

| Area | Requirement | Evidence / Notes |
|---|---|---|
| Heading hierarchy |  |  |
| Landmarks / semantics |  |  |
| Labels and errors |  |  |
| Focus order |  |  |
| Contrast / readability |  |  |
| Touch targets |  |  |

## Analytics / Test Hooks

| Signal | Trigger | Expected Assertion | PII Risk |
|---|---|---|---|

## Figma Readiness

| Check | Status | Notes |
|---|---|---|
| Variables/styles required |  |  |
| Component sets/variants defined |  |  |
| Auto Layout critical areas defined |  |  |
| Canvas strategy |  |  |
| Screenshot verification plan |  |  |

## Asset Notes

| Asset | Source / Rights | Usage | Fallback |
|---|---|---|---|

## Acceptance Notes

| Requirement | Screen Evidence | Status |
|---|---|---|

## Open Questions
