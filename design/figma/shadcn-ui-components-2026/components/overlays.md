# Deep Profile: Overlays

## Статус

`done`

## Inputs Used

- Read-only focused Figma scan, 2026-06-27.
- Safe `componentPropertyDefinitions` read per overlay component set.

## Summary

| Component | Frame id | Sets | Key axes / states | Notes |
|---|---|---:|---|---|
| `Dialog` | `74:7828` | 2 | `State=default|open` | Includes custom close button variant. |
| `Alert Dialog` | `402:419` | 1 | `State=Button|open` | Trigger-state label differs from `default`. |
| `Drawer` | `74:7968` | 2 | `State=Button|Drawer`, `Button|Dialog` | Includes responsive dialog pattern. |
| `Sheet` | `76:10203` | 1 | `State=default|open` | Dialog-derived side sheet. |
| `Popover` | `76:8822` | 1 | `State=default|open` | Rich portal content. |
| `Hover Card` | `76:8466` | 1 | `State=Button|Hover` | Hover preview pattern. |
| `Tooltip` | `79:11350` | 1 | `State=default|hover` | Lightweight hover information. |
| `Dropdown Menu` | `74:8113` | 3 | `State=default|open` | Default, checkbox, radio group menu examples. |
| `Context Menu` | `73:5633` | 1 | `State=default|open` | Right-click menu. |
| `Menubar` | `76:8618` | 1 | `State=default|hover` | Persistent desktop-style menu. |
| `Accordion` | `73:3341` | 1 | `State=default|open` | Disclosure stack. |
| `Collapsible` | `73:4665` | 1 | `State=default|open` | Single expandable panel. |
| `Command` | `73:5422` | 1 | `State=default|open` | Command/search palette. |

## Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Dialog` | `594:105` | 2 | `State: default, open` |
| `Custom_close_button` | `594:108` | 2 | `State: default, open` |
| `Alert dialog` | `73:5720` | 2 | `State: Button, open` |
| `Drawer` | `594:255` | 2 | `State: Button, Drawer` |
| `Responsive Dialog` | `594:375` | 2 | `State: Button, Dialog` |
| `Sheet` | `615:3344` | 2 | `State: default, open` |
| `Popover` | `605:1287` | 2 | `State: default, open` |
| `Hover_card` | `597:458` | 2 | `State: Button, Hover` |
| `Tooltip` | `624:291` | 2 | `State: default, hover` |
| `Dropdown_menu` | `597:279` | 2 | `State: default, open` |
| `Dropdown / Checkboxes` | `597:331` | 2 | `State: default, open` |
| `Dropdown / Radio_group` | `597:383` | 2 | `State: default, open` |
| `Context menu` | `73:5726` | 2 | `State: default, open` |
| `Menubar` | `600:228` | 2 | `State: default, hover` |
| `Accordion` | `73:3394` | 2 | `State: default, open` |
| `Collapsible` | `73:4707` | 2 | `State: default, open` |
| `Command / Examples` | `73:5632` | 2 | `State: default, open` |

## Implementation Notes

- Overlay contracts are mostly binary. Do not invent richer state axes before a focused screenshot/context pass.
- Trigger labels vary (`Button`, `default`); normalize in code only through an explicit adapter.
- `Drawer` includes both drawer and responsive dialog patterns; treat them as separate frontend surfaces.
