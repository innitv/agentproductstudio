# Variable Audit: shadcn-ui-components-2026

## Статус

`done_with_risks`

## Inputs Used

- Read-only Figma variable scan, 2026-06-27.
- Collections: all 16 local variable collections.

## Summary

| Collection | Modes | Count | Types | Scopes | Code syntax | Value model |
|---|---|---:|---|---|---|---|
| `tw/colors` | `Mode 1` | 244 | `COLOR` | `ALL_SCOPES` | 0/244 with WEB syntax | raw colors |
| `tw/padding` | `Mode 1` | 245 | `FLOAT` | `WIDTH_HEIGHT`, `GAP` | 0/245 | aliases |
| `tw/space` | `Mode 1` | 68 | `FLOAT` | `GAP` | 0/68 | aliases |
| `tw/border-radius` | `Mode 1` | 149 | `FLOAT` | `CORNER_RADIUS` | 0/149 | aliases |
| `tw/margin` | `Mode 1` | 245 | `FLOAT` | `WIDTH_HEIGHT`, `GAP` | 0/245 | aliases |
| `tokens` | `Mode 1` | 89 | `FLOAT` | none | 0/89 | raw numeric primitives |
| `mode` | `light mode`, `dark mode` | 47 | `COLOR` 35, `FLOAT` 12 | `ALL_SCOPES` | 0/47 | mostly aliases; 90 alias values, 4 raw values |
| `tw/border-width` | `Mode 1` | 45 | `FLOAT` | `STROKE_FLOAT` | 0/45 | aliases |
| `tw/gap` | `Mode 1` | 102 | `FLOAT` | `WIDTH_HEIGHT`, `GAP` | 0/102 | aliases |
| `tw/stroke-width` | `Mode 1` | 11 | `FLOAT` | `STROKE_FLOAT` | 0/11 | aliases |
| `tw/font` | `Mode 1` | 47 | `FLOAT` 41, `STRING` 6 | font scopes | 0/47 | 41 aliases, 6 raw strings |
| `tw/height` | `Mode 1` | 24 | `FLOAT` | `WIDTH_HEIGHT` | 0/24 | aliases |
| `tw/max-height` | `Mode 1` | 35 | `FLOAT` | `WIDTH_HEIGHT` | 0/35 | aliases |
| `tw/max-width` | `Mode 1` | 51 | `FLOAT` | `WIDTH_HEIGHT` | 1/51 with WEB syntax | aliases |
| `rdx/colors` | `light mode`, `dark mode` | 396 | `COLOR` | `ALL_SCOPES` | 0/396 | raw light/dark colors |
| `tw/opacity` | `Mode 1` | 21 | `FLOAT` | `OPACITY` | 21/21 with WEB syntax | aliases |

## Key Findings

- `mode` and `rdx/colors` are the only mode-aware collections. They carry `light mode` and `dark mode`.
- Most collections have no WEB code syntax. `tw/opacity` is complete; `tw/max-width` has only one variable with code syntax.
- Several color collections use `ALL_SCOPES`, especially `tw/colors`, `mode`, and `rdx/colors`. This is workable for read-only reuse but not ideal for a clean production library.
- Utility spacing/radius/width variables are mostly aliases into primitive numeric tokens.
- `tokens` is not shadcn semantic colors; it is a raw numeric primitive collection with no scopes.

## Representative Samples

| Collection | Sample names |
|---|---|
| `tw/colors` | `slate/50`, `slate/100`, `gray/50`, `zinc/100` |
| `mode` | `background`, `foreground`, `border`, `destructive`, `secondary`, `muted-foreground`, `primary`, `secondary-foreground` |
| `rdx/colors` | `gray/1`, `gray/8`, `gray/12` |
| `tw/font` | `size/2xl`, `size/xl`, `tracking/wide`, `tracking/tight`, `leading/24`, `leading/32` |
| `tw/border-radius` | `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full` |
| `tw/opacity` | `opacity-40`, `opacity-35`, `opacity-20`, `opacity-15`, `opacity-10`, `opacity-95` |

## Risks / Required Fixes Before Production Library Write

- Add WEB code syntax if this system is copied into an owned production Figma library.
- Narrow color scopes from `ALL_SCOPES` to appropriate fill/text/stroke scopes during any approved Figma write cleanup.
- Treat `mode` as the semantic color source for shadcn tokens; do not assume `tokens` contains semantic colors.
- Verify exact variable values only when needed; this audit intentionally stores structure and counts, not a full raw dump.
