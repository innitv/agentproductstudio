# Deep Profile: Navigation

## Статус

`done`

## Inputs Used

- Read-only focused Figma scan, 2026-06-27.
- Safe `componentPropertyDefinitions` read per navigation component set.

## Summary

| Component | Frame id | Sets | Standalone | Key axes / states | Notes |
|---|---|---:|---:|---|---|
| `Breadcrumb` | `101:424` | 1 | 0 | `Type=collapsed|custom_seperator|dropdown|link_component|responsive` | Source uses `custom_seperator` spelling. |
| `Navigation Menu` | `76:8691` | 1 | 0 | `State=default|open` | Site navigation menu. |
| `Pagination` | `76:8794` | 0 | 1 | standalone `Pagination` | No component set on frame. |
| `Sidebar` | `269:47` | 1 | 0 | `State=Closed|Open` | Component sidebar, not blocks sidebar. |
| `Tabs` | `76:10755` | 0 | 1 | standalone `Tabs` | Account/password specimen. |

## Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Breadcrumb` | `665:2036` | 5 | `Type: collapsed, custom_seperator, dropdown, link_component, responsive` |
| `Navigation_menu` | `601:467` | 2 | `State: default, open` |
| `Sidebar` | `616:3399` | 2 | `State: Closed, Open` |

## Standalone Component Sources

| Component | Node id | Size | Notes |
|---|---|---|---|
| `Pagination` | `76:8821` | `342x36` | Previous/pages/next layout. |
| `Tabs` | `76:10806` | `398x406` | Tab list + panels specimen. |

## Implementation Notes

- `Sidebar` page is the reusable component source; block-level `Sidebar` lives in the Blocks group and should be treated as a screen/layout reference.
- Keep `custom_seperator` as source spelling in Figma contract; map to `custom_separator` only in code if needed.
