# Deep Profile: Feedback

## Статус

`done`

## Inputs Used

- Read-only focused Figma scan, 2026-06-27.
- Safe `componentPropertyDefinitions` read per feedback component set.

## Summary

| Component | Frame id | Sets | Standalone | Key axes / states | Notes |
|---|---|---:|---:|---|---|
| `Alert` | `73:3398` | 0 | 3 | standalone variants | Default, title-only, destructive. |
| `Sonner` | `76:10521` | 1 | 1 | `Type=default|success|info|warning|error|promise` | Toast/status variants. |
| `Progress` | `76:8886` | 0 | 1 | standalone `Progressbar` | Progress indicator. |
| `Skeleton` | `76:10492` | 0 | 2 | standalone skeleton/card | Loading placeholders. |
| `Spinner` | `1196:1175` | 5 | 4 | `Size`, `Color`, `Type` axes | Loading indicator plus composed examples. |
| `Empty` | `1186:3810` | 0 | 6 | standalone variants | Empty state family. |

## Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Sonner` | `1468:6037` | 6 | `Type: default, success, info, warning, error, promise` |
| `Spinner / Size` | `1202:641` | 4 | `Size: 12, 16, 24, 32` |
| `Spinner / Color` | `1202:668` | 4 | `Color: red, green, blue, yellow` |
| `Spinner / Button` | `1202:699` | 3 | `Type: default, outline, secondary` |
| `Spinner / Badge` | `1202:731` | 3 | `Type: default, secondary, outline` |
| `Spinner / Input Group` | `1202:778` | 2 | `Type: InputGroupInput, InputGroupTextarea` |

## Standalone Component Sources

| Component | Node id | Size | Notes |
|---|---|---|---|
| `Alert / Default` | `73:3445` | `731x66` | Icon, title, description. |
| `Alert / Title only` | `381:854` | `731x44` | No description. |
| `Alert / Destructive` | `381:855` | `731x130` | Error/payment example. |
| `Progressbar` | `76:8892` | `430x8` | Linear progress. |
| `Skeleton` | `76:10511` | `314x48` | List-like skeleton. |
| `Skeleton / Card` | `76:10512` | `250x177` | Card placeholder. |
| `Empty` | `1188:4199` | `520x332` | Generic empty state. |
| `Empty / Outline` | `1188:4200` | `520x276` | Outlined empty state. |
| `Empty / Background` | `1188:4201` | `520x256` | Filled background variant. |
| `Empty / Avatar` | `1188:4202` | `520x284` | Empty with avatar. |
| `Empty / Avatar Group` | `1188:4203` | `520x284` | Empty with avatar group. |
| `Empty / InputGroup` | `1188:4204` | `520x268` | Empty with input group. |

## Implementation Notes

- `Sonner` is the main toast/status component set.
- `Alert`, `Progress`, `Skeleton`, and `Empty` are specimen components, not variant sets; use focused screenshots before production mapping.
