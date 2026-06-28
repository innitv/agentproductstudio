# Deep Profile: Data Display

## Статус

`done`

## Inputs Used

- Read-only focused Figma scan, 2026-06-27.
- Safe `componentPropertyDefinitions` read per data-display component set.

## Summary

| Component | Frame id | Sets | Standalone | Key axes / states | Notes |
|---|---|---:|---:|---|---|
| `Card` | `73:4333` | 0 | 1 | standalone `Card` | Login card specimen. |
| `Table` | `76:10620` | 0 | 1 | standalone `Table` | Responsive table specimen. |
| `Data Table` | `73:5727` | 0 | 1 | standalone `Data table` | TanStack table specimen. |
| `Chart` | `296:98` | 0 | 0 | specimen only | Recharts examples; chart-specific pages exist separately. |
| `Avatar` | `73:3473` | 0 | 3 | standalone circle/square/group | Avatar family. |
| `Badge` | `73:3479` | 1 | 0 | `Type=default|secondary|destructive|outline|...` | Badge variants. |
| `Carousel` | `73:4464` | 0 | 4 | standalone examples | Embla carousel examples. |
| `Aspect Ratio` | `1098:925` | 0 | 0 | specimen only | Ratio container. |
| `Item` | `1196:924` | 5 | 4 | `Type`, `Size`, `State` axes | Versatile content item family. |
| `KPD` | `1196:1098` | 1 | 4 | `Tooltip State=default|hover` | Keyboard display/input helper. |
| `Scroll-area` | `76:8955` | 0 | 2 | standalone vertical/horizontal scroll | Custom scroll examples. |
| `Separator` | `76:10176` | 0 | 1 | standalone separator | Semantic/visual separation. |

## Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Badge` | `665:2024` | 8 | `Type: default, default_number, destructive, destructive_number, outline, secondary, secondary_icon, secondary_number` |
| `Item` | `1198:338` | 3 | `Type: default, outline, muted` |
| `Item / Size` | `1198:339` | 2 | `Size: sm, default` |
| `Item / Avatar` | `1200:509` | 2 | `Type: 1, 2` |
| `Item / Link` | `1201:1030` | 2 | `Type: default, outline` |
| `Item / Dropdown` | `1201:1323` | 2 | `State: default, open` |
| `KPD / Tooltip` | `1468:5912` | 2 | `State: default, hover` |

## Standalone Component Sources

| Component | Node id | Size | Notes |
|---|---|---|---|
| `Card` | `73:4454` | `368x394` | Header/content/footer login example. |
| `Table` | `76:10754` | `725x372` | Invoice table. |
| `Data table` | `73:5865` | `590x421` | Filter + columns + rows. |
| `Avatar / Circle` | `455:365` | `32x32` | Circular avatar. |
| `Avatar / Square` | `455:364` | `32x32` | Square avatar. |
| `Avatar_group` | `455:363` | `80x32` | Avatar group. |
| `Carousel` | `479:736` | `414x360` | Main carousel. |
| `Carousel / Sizes` | `73:4562` | `503x165` | Size examples. |
| `Carousel / Orientation` | `73:4561` | `320x384` | Orientation examples. |
| `Carousel / API` | `73:4560` | `414x354` | API specimen. |
| `Scroll_area` | `76:9051` | `190x286` | Vertical scroll. |
| `Horizontal_scrolling` | `76:9052` | `382x256` | Horizontal scroll. |
| `Separator` | `76:10202` | `191x116` | Separator specimen. |

## Implementation Notes

- Chart frame is not a reusable component set; use chart pages (`Area`, `Bar`, `Line`, `Pie`, `Radar`, `Radial`) for chart-specific references.
- `Badge` and `Item` are the strongest reusable component-set sources in this category.
