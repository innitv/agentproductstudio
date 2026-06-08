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
- Screenshot review result: `passed|passed_with_notes|blocked`
- Auto Layout smoke check:
- Variables/components smoke check:
- Известные расхождения:

## Блокеры

-
