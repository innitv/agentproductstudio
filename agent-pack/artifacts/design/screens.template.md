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
- `design/figma/registry.json`, если используется Figma DS
- `design/figma/<selected_design_system_slug>/ds.config.json`, если выбран `reuse|extend`
- `design/figma/<selected_design_system_slug>/foundation.md|token-map.md`, если применимо
- `design/figma/<selected_design_system_slug>/components.md|component-map.md`, если применимо

## Input Readiness Pass

| Input | Required Signal | Status | Notes |
|---|---|---|---|
| `prd.md` | requirements, acceptance criteria, analytics/test signals |  |  |
| `ia-brief.md` | primary screen/action, entry points, state map |  |  |
| `design-brief.md` | visual direction, components, responsive/accessibility notes |  |  |
| `copy-deck.md` | CTA labels, section copy, microcopy, claims-to-validate |  |  |
| `STYLE_GUIDE.md` / reference | style rules, allowed/disallowed patterns |  |  |
| Visual Evidence Grounding | same-domain/adjacent/state references, visual_reference_cards |  |  |

## Design-System Grounding

### Design System Strategy

| Field | Value |
|---|---|
| `design_system_mode` | `reuse` / `extend` / `product_specific` / `bespoke` |
| Source / foundation |  |
| Gap rationale |  |
| Elements intentionally kept bespoke |  |
| Visual calibration verdict | `passed` / `passed_with_notes` / `blocked` / `not_required` |

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
| Primary App Flow Gate | pending / pass / partial / blocked / not_applicable |
| Coverage result | pending / pass / partial / blocked |
| Verification plan | screenshot / browser / prototype / QA / manual review |

### Coverage Gate

| Input Source | Required Signal | Output Unit | Included / Excluded | Reason / Notes |
|---|---|---|---|---|

### Evidence-To-Output Map

| Evidence / Source | Interpretation | Screen / Frame / Component | Verification Signal |
|---|---|---|---|

### Visual Evidence-To-Screen Map

| Visual Reference | Borrowed Pattern | Screen / Frame / Component | Applied / Rejected / Deferred | Verification Signal |
|---|---|---|---|---|
| `<screenshot/live capture/user reference/design-system example>` | layout / density / hierarchy / state / responsive behavior |  |  | screenshot / object inventory / browser capture / visual review |

### Source Pair Plan

| Pair | Required | Expected Evidence | Downstream Owner |
|---|---|---|---|
| `reference_to_figma` | yes / no | reference screenshots/cards; Figma node IDs; Figma screenshot/object inventory | design-generator / figma-handoff |
| `figma_to_frontend` | yes / no | Figma frame screenshots; component/state inventory; frontend component/locator map | frontend / qa-review |
| `reference_to_frontend` | yes / no | paired screenshots; `visual-diff-result.json`; section diff | frontend / qa-review |
| `spec_to_frontend_behavior` | yes / no | prototype states; Playwright/manual flow evidence | prototype / frontend / qa-review |

### Primary App Flow Gate

| Field | Value |
|---|---|
| Primary user/job |  |
| Trigger / entry point |  |
| P0 route / transition map |  |
| Primary action |  |
| Success / completion evidence |  |
| Error / recovery path |  |
| Acceptance walkthrough |  |

| Step | Screen / state | User question | Primary action | Next state | Evidence / assertion |
|---|---|---|---|---|---|
| 1 |  |  |  |  |  |

## Screen List

| Screen | Purpose | Entry Point | Primary Action | Next State | Completion Evidence | PRD Requirement | IA Node | Status |
|---|---|---|---|---|---|---|---|---|

## Screen Traceability

| Screen | Research / JTBD Signal | PRD Requirement | IA Node | Copy Source | Prototype / Test Signal |
|---|---|---|---|---|---|

## Screen 1

### Screen Goal

- User goal:
- User question:
- Entry condition:
- Primary action:
- Next state:
- Success outcome:
- Error / recovery path:

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

## Component Contract Matrix

| Stable ID | Figma component / node | Figma properties / values | Semantic variables | React target / props | Required states | Story / route / locator | Deviation |
|---|---|---|---|---|---|---|---|

## Frame / State Implementation Map

| Figma frame / state | Node / screenshot evidence | Frontend route / story / component | Behavior test | Status |
|---|---|---|---|---|

## Layout Compiler Contract

| Field | Value |
|---|---|
| `figma-layout-ir.json` required | yes / no |
| Layout IR status | `ready` / `partial` / `blocked` / `not_required` |
| Route compiled | yes / no |
| Screen zones compiled | yes / no |
| Copy-fit constraints compiled | yes / no |
| Component sources / DS honesty compiled | yes / no |
| Verification contract requires screenshots | yes / no |
| Verification contract requires object inventory | yes / no |
| Verification contract requires visual QA | yes / no |
| Blocker / deviation |  |

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
| `figma-layout-ir.json` required |  |  |
| Layout IR route/zones/copy-fit/component sources |  |  |
| Screenshot verification plan |  |  |
| `figma-visual-qa.json` required after write |  |  |
| Visual calibration completed before systemization |  |  |
| Component Contract Matrix completed |  |  |
| Code Connect / fallback mapping planned |  |  |
| Before/after systemization comparison planned |  |  |

## Asset Notes

| Asset | Source / Rights | Usage | Fallback |
|---|---|---|---|

## Acceptance Notes

| Requirement | Screen Evidence | Status |
|---|---|---|

## Open Questions
