# Census: shadcn/ui components with variables

## Статус

`done_with_risks`

## Inputs Used

- Figma file key `NUoNEuTJ3OZOGH2c780Z55`
- Root metadata: 88 pages
- Read-only Plugin API scan, 2026-06-27
- Representative `get_design_context`: `Button` frame `402:654`

## Сводка

| Метрика | Значение |
|---|---:|
| Pages | 88 |
| Top-level frames | 84 |
| Component sets | 89 |
| Standalone components | 14203 |
| Variable collections | 16 |
| Variables | 1819 |
| Text styles | 117 |
| Effect styles | 27 |
| Paint styles | 0 |

## Variable Collections

| Collection | Modes | Variables | Назначение |
|---|---|---:|---|
| `tw/colors` | `Mode 1` | 244 | Tailwind color primitives |
| `tw/padding` | `Mode 1` | 245 | Padding utilities |
| `tw/space` | `Mode 1` | 68 | Spacing scale |
| `tw/border-radius` | `Mode 1` | 149 | Radius utilities |
| `tw/margin` | `Mode 1` | 245 | Margin utilities |
| `tokens` | `Mode 1` | 89 | shadcn semantic CSS variables |
| `mode` | `light mode`, `dark mode` | 47 | Light/dark semantic mode variables |
| `tw/border-width` | `Mode 1` | 45 | Border width utilities |
| `tw/gap` | `Mode 1` | 102 | Gap utilities |
| `tw/stroke-width` | `Mode 1` | 11 | Stroke width utilities |
| `tw/font` | `Mode 1` | 47 | Font family, size, weight, leading, tracking |
| `tw/height` | `Mode 1` | 24 | Height utilities |
| `tw/max-height` | `Mode 1` | 35 | Max-height utilities |
| `tw/max-width` | `Mode 1` | 51 | Max-width utilities |
| `rdx/colors` | `light mode`, `dark mode` | 396 | Radix-like color scales |
| `tw/opacity` | `Mode 1` | 21 | Opacity utilities |

## Page Groups

| Group | Pages |
|---|---|
| Intro | `Cover`, `About the libarary`, `shadcn/ui create plugin` |
| Core components | `Accordion`, `Alert Dialog`, `Alert`, `Aspect Ratio`, `Avatar`, `Badge`, `Breadcrumb`, `Button Group`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Combobox`, `Command`, `Contex Menu`, `Data Table`, `Date Picker`, `Dialog`, `Drawer`, `Dropdown Menu`, `Empty`, `Field`, `Hover Card`, `Input Group`, `Input OPT`, `Input`, `Item`, `KPD`, `Label`, `Menubar`, `Native Select`, `Navigation Menu`, `Pagination`, `Popover`, `Progress`, `Radio Group`, `Scroll-area`, `Select`, `Seperator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Sonner`, `Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toggle Group`, `Toggle`, `Tooltip` |
| Examples | `Examples`, `Dashboard`, `Tasks`, `Playground`, `Authentication` |
| Blocks | `Featured`, `Sidebar`, `Login`, `Signup`, `OTP`, `Calendar` |
| Charts | `Area`, `Bar`, `Line`, `Pie`, `Radar`, `Radial`, `Tooltip` |
| Icons | `Lucide Icons`, `Tabler Icons`, `HugeIcons`, `Phosphor Icons`, `Remix Icons` |

## High-Weight Pages

| Page | Primary frame id | Component sets | Standalone components | Notes |
|---|---|---:|---:|---|
| `Button` | `402:654` | 1 | 0 | Representative context captured. |
| `Button Group` | `1185:1980` | 4 | 7 | Related to button composition. |
| `Input Group` | `1188:5364` | 7 | 4 | Rich form controls. |
| `Input OPT` | `101:745` | 5 | 0 | OTP input variants. |
| `Textarea` | `76:10807` | 4 | 1 | Form field profile candidate. |
| `Calendar` | `73:3711` | 3 | 4 | Component page; separate Blocks calendar also exists. |
| `Accordion` | `73:3341` | 3 | 0 | Includes prototype frames. |
| `Alert Dialog` | `402:419` | 2 | 0 | Overlay/dialog candidate. |
| `Dropdown Menu` | `74:8113` | 3 | 0 | Menu candidate. |
| `Spinner` | `1196:1175` | 5 | 4 | Loading states. |
| `Toggle` | `79:10987` | 5 | 1 | Toggle variants. |
| `Toggle Group` | `79:11264` | 5 | 1 | Composite control. |
| `Lucide Icons` | `1086:1066` | 0 | 1469 | Icon source; do not deep-read by default. |
| `Tabler Icons` | `1086:77` | 0 | 4963 | Icon source; do not deep-read by default. |
| `HugeIcons` | `1361:5870` | 0 | 4527 | Icon source; do not deep-read by default. |
| `Phosphor Icons` | `1528:10` | 0 | 1512 | Icon source; do not deep-read by default. |
| `Remix Icons` | `1603:4` | 0 | 1654 | Icon source; do not deep-read by default. |

## Риски

- `componentPropertyDefinitions` нельзя читать массово: один или несколько component sets возвращают `Component set has existing errors`.
- В файле есть повторяющиеся page names (`Sidebar`, `Calendar`, `Tooltip`), поэтому downstream lookup должен использовать page id + frame id, а не только имя.
- Есть опечатки в page names: `About the libarary`, `Contex Menu`, `Seperator`, `Input OPT`, `KPD`; индекс сохраняет исходные имена без нормализации.
- Icon pages очень крупные. Их нужно читать только по точному запросу на icon family или node id.
