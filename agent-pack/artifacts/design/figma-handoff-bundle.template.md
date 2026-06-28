# Figma Handoff Bundle

## Статус

`draft|ready|partial|blocked`

## Использованные Входы

- `STYLE_GUIDE.md`
- `design-brief.md`
- `screens.md`
- `design-loop-report.md`, если доступен

## Approval State

- Human approval requested: `yes|no`
- Human approval granted: `yes|no`
- Target Figma file:
- Target Figma node / anchor:
- `write_allowed=true`: `yes|no`
- Figma MCP mode: `remote use_figma|read-only|unavailable`

## Canvas Strategy

- Strategy: `separate_frames|target_frame|update_existing|component_library_only`
- Причина выбора:
- Frames to create/update:
- Anchor usage:
- Existing design system search: `completed|not_found|skipped_with_reason`
- Libraries/components reused:
- Что создается с нуля:

## Layout Compiler Contract

| Field | Value |
|---|---|
| `figma-layout-ir.json` status | `ready|partial|blocked|not_required` |
| Layout IR path |  |
| Route compiled | yes / no |
| Screen zones compiled | yes / no |
| Copy-fit constraints compiled | yes / no |
| Component sources compiled | yes / no |
| Verification contract compiled | yes / no |
| Blocker / deviation |  |

## Design System Strategy

| Field | Value |
|---|---|
| `design_system_mode` | `reuse` / `extend` / `product_specific` / `bespoke` |
| Selected foundation / none |  |
| Rationale |  |
| Rejected alternatives |  |
| Product-specific boundaries |  |
| Maintenance impact |  |

## Two-Pass Build

| Pass | Scope | Evidence | Verdict |
|---|---|---|---|
| `visual_calibration` | 2-3 key screens; composition, density, hierarchy, rhythm, copy fit, responsive direction | screenshots / visual review | `passed|passed_with_notes|blocked` |
| `systemization` | variables, styles, component sets/properties, instances, Auto Layout/resizing, prototype | object inventory + before/after screenshot | `passed|regression_found|blocked` |

## Surface Output Contract

| Field | Value |
|---|---|
| Surface type | `figma_board` / `handoff` |
| Expected frames / pages |  |
| Expected entities / sections |  |
| Coverage result | pending / pass / partial / blocked |
| Verification evidence required | Figma node IDs, screenshot, Auto Layout smoke check |

### Data / Artifact Coverage

| Source Artifact / Data Group | Expected Frame / Component | Status | Notes |
|---|---|---|---|

### Evidence-To-Frame Map

| Evidence / Source | Frame / Component | Visual Treatment | Verification Signal |
|---|---|---|---|

### Source Pair Plan

| Pair | Required | Planned Evidence | Gate |
|---|---|---|---|
| `reference_to_figma` | yes / no | reference screenshots/cards; Figma node IDs; Figma screenshot/object inventory |  |
| `figma_to_frontend` | yes / no | Figma frame screenshots; component/state inventory; frontend locator/component map |  |
| `reference_to_frontend` | yes / no | paired screenshots; `visual-diff-result.json`; section diff |  |
| `spec_to_frontend_behavior` | yes / no | prototype states; interaction checks; traces/screenshots |  |

## Foundation

### Primitive Variables

| Name | Type | Value | Scope |
|---|---|---|---|

### Semantic Variables

| Name | Alias | Usage |
|---|---|---|

### Text Styles

| Name | Font | Size | Weight | Line Height |
|---|---|---:|---:|---:|

### Paint Styles

| Name | Values | Usage |
|---|---|---|

### Effect Styles

| Name | Values | Usage |
|---|---|---|

### Figma Variables Implementation

| Collection | Variable | Type | Alias / Value | Status |
|---|---|---|---|---|

## Auto Layout Rules

| Area | Direction | Padding | Gap | Resize Behavior | Notes |
|---|---|---:|---:|---|---|

## Компоненты

| Component | Figma Type | Auto Layout | Variants | States | Variables Used | Notes |
|---|---|---|---|---|---|---|

## Component Sets / Variants

| Component Set | Variant Properties | Required States | Resize Contract |
|---|---|---|---|

## Component Contract Matrix

| Stable ID | Figma source | Property / allowed values | Semantic variables | React target / prop mapping | Required states | Story / test / locator | Deviation owner / follow-up |
|---|---|---|---|---|---|---|---|

## DS Honesty Audit

| UI element | Claimed source | Actual Figma source | Instance required | Status | Deviation |
|---|---|---|---:|---|---|

### DS Instance Summary

Required for `design_system_mode=reuse|extend`.

| Field | Value |
|---|---|
| Selected DS slug |  |
| Selected-DS component sources in IR |  |
| Visible selected-DS instances in inventory |  |
| Local wrapper component sources |  |
| Missing required DS sources |  |
| Verdict | `passed|needs_repair|blocked` |

## Code Connect / Mapping Status

- Code Connect status: `connected|unavailable|not_configured|skipped_with_reason`
- Mapping location / URL:
- Fallback registry location:

## Frame / State Handoff Map

| Figma frame / state | Node ID / screenshot | Frontend route / story / component | Behavior evidence | Status |
|---|---|---|---|---|

## Экраны Для Сборки

| Screen | Frame | Size | Components | Layout Strategy | Notes |
|---|---|---:|---|---|---|

## Figma Write Plan

1. Inspect target and existing libraries.
2. Create/update variables and styles.
3. Create/update component frames or component sets.
4. Create/update screen frames.
5. Run screenshot verification.
6. Apply visual polish pass.
7. Update this bundle with node IDs and evidence.

## Проверка

- Figma node IDs:
- Скриншоты:
- `figma-visual-qa.json`:
- Screenshot review result: `passed|passed_with_notes|blocked`
- Auto Layout smoke check:
- Variables/components smoke check:
- Detached instance audit:
- Variable binding / raw-value deviation audit:
- Resize / long-copy audit:
- Text height / clipping audit:
- Overlap / safe area audit:
- Route walkthrough audit:
- Systemization visual regression check:
- Paired Figma/browser screenshot status:
- Известные расхождения:

## Блокеры

-
