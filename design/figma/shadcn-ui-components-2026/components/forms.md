# Deep Profile: Forms

## Статус

`done`

## Inputs Used

- Read-only focused Figma scan, 2026-06-27.
- Primary frame ids from `components.md`.
- Safe `componentPropertyDefinitions` read per component set.

## Summary

| Component | Frame id | Sets | Standalone | Key axes / states | Notes |
|---|---|---:|---:|---|---|
| `Input` | `76:8518` | 3 | 1 | `State=default|active` | `Default`, `With Label`, `With Button`; standalone `File`. |
| `Input Group` | `1188:5364` | 7 | 4 | `Type=1|2|3|4` and smaller type sets | Composite input addons: icon, text, button, tooltip, spinner, dropdown. |
| `Field` | `1188:4206` | 0 | 12 | standalone examples | Field, Input, Textarea, Select, Slider, Fieldset, Checkbox, Radio, Switch, Choice Card, Field Group, Responsive Layout. |
| `Textarea` | `76:10807` | 4 | 1 | `State=default|active` | `Default`, `With_label`, `With_text`, `With_button`; standalone disabled. |
| `Checkbox` | `73:4564` | 1 | 3 | `Type=card|checked` | Standalone `Default`, `Subtext`, `Disabledd` source typo. |
| `Radio Group` | `76:8893` | 0 | 1 | standalone example | Options: Default, Comfortable, Compact. |
| `Select` | `76:9053` | 2 | 0 | `State=default|open` | `Select`, `Scrollable`. |
| `Native Select` | `1254:66` | 3 | 1 | `State=default|open` | `Native Select`, `With Groups`, `Invalid State`; typo sample `Select satus`. |
| `Input OPT` | `101:745` | 5 | 0 | `State=default|active` | OTP patterns: default, pattern, separator, controlled, form. |
| `Date Picker` | `73:5866` | 4 | 0 | `State=default|open` | Birth date, input, date-time, natural language picker. |
| `Calendar` | `73:3711` | 3 | 4 | `State=default|open` | Calendar, Persian/Hijri/Jalali, range, custom cell size. |
| `Combobox` | `73:4708` | 4 | 0 | `State=default|open` | Combobox, popover, dropdown menu, responsive. |
| `Slider` | `76:10513` | 0 | 1 | standalone `Slider` | Range input pattern. |
| `Switch` | `76:10548` | 1 | 0 | `State=Off|On` | Toggle state model differs from most open/active patterns. |
| `Label` | `76:8597` | 1 | 0 | `State=default|checked` | Accessible label pattern. |

## Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Input / Default` | `520:3062` | 2 | `State: default, active` |
| `Input / With Label` | `588:108` | 2 | `State: default, active` |
| `Input / With Button` | `588:141` | 2 | `State: default, active` |
| `Textarea / Default` | `623:3553` | 2 | `State: default, active` |
| `Textarea / With_label` | `623:3605` | 2 | `State: default, active` |
| `Textarea / With_text` | `623:3651` | 2 | `State: default, active` |
| `Textarea / With_button` | `623:3719` | 2 | `State: default, active` |
| `Select / Select` | `614:1543` | 2 | `State: default, open` |
| `Select / Scrollable` | `614:2466` | 2 | `State: default, open` |
| `Native Select` | `1256:373` | 2 | `State: default, open` |
| `Native Select / With Groups` | `1264:743` | 2 | `State: default, open` |
| `Native Select / Invalid State` | `1264:758` | 2 | `State: default, open` |
| `Input_OPT` | `101:1013` | 2 | `State: default, active` |
| `Input OPT / Pattern` | `597:584` | 2 | `State: default, active` |
| `Input OPT / Separator` | `597:640` | 2 | `State: default, active` |
| `Input OPT / Controlled` | `597:721` | 2 | `State: default, active` |
| `Input OPT / Form` | `597:816` | 2 | `State: default, active` |
| `Checkbox_card` | `511:817` | 2 | `Type: card, checked` |
| `Switch` | `76:10618` | 2 | `State: Off, On` |
| `Label` | `76:8617` | 2 | `State: default, checked` |
| `Combobox` | `517:566` | 2 | `State: default, open` |
| `Combobox / Popover` | `515:481` | 2 | `State: default, open` |
| `Combobox / Dropdown menu` | `516:117` | 2 | `State: default, open` |
| `Combobox / Responsive` | `1418:2011` | 2 | `State: default, open` |
| `Date Picker / Date of Birth Picker` | `626:2436` | 2 | `State: default, open` |
| `Date Picker / Picker with Input` | `626:2709` | 2 | `State: default, open` |
| `Date Picker / Date and Time Picker` | `626:2710` | 2 | `State: default, open` |
| `Date Picker / Natural Language Picker` | `626:2864` | 2 | `State: default, open` |
| `Calendar / Month and Year Selector` | `502:3321` | 2 | `State: default, open` |
| `Calendar / Date of Birth Picker` | `502:3324` | 2 | `State: default, open` |
| `Calendar / Date and Time Picker` | `502:3327` | 2 | `State: default, open` |

## Implementation Notes

- Most form overlays use binary state axes: `default|active` for input focus, `default|open` for popover/select/calendar.
- `Switch` uses `Off|On`, not `default|active`; keep this mapping explicit.
- `Field` is a composition/specimen page, not a clean component-set source.
- Preserve source typos in index (`Input OPT`, `Disabledd`, `Select satus`) and normalize only in downstream code adapters.
