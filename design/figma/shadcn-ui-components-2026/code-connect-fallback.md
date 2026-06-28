# Code Connect fallback: shadcn-ui-components-2026

## Статус

`not_configured`

## Причина

Для community source не найдено активное Code Connect покрытие через `search_design_system`; исходный файл сохранен как локальный read-only индекс. До отдельного Code Connect setup использовать fallback mapping ниже.

## Fallback Mapping

| Figma page/frame | Frontend target convention | Notes |
|---|---|---|
| `Button` / `402:654` | `components/ui/button.tsx` or project adapter | shadcn Button variants, Tailwind variables. |
| `Input` / `76:8518` | `components/ui/input.tsx` | Read focused context before implementation. |
| `Textarea` / `76:10807` | `components/ui/textarea.tsx` | Read focused context before implementation. |
| `Checkbox` / `73:4564` | `components/ui/checkbox.tsx` | Read focused context before implementation. |
| `Select` / `76:9053` | `components/ui/select.tsx` | Read focused context before implementation. |
| `Dialog` / `74:7828` | `components/ui/dialog.tsx` | Likely Radix/shadcn pattern. |
| `Dropdown Menu` / `74:8113` | `components/ui/dropdown-menu.tsx` | Likely Radix/shadcn pattern. |
| `Tabs` / `76:10755` | `components/ui/tabs.tsx` | Read focused context before implementation. |
| `Table` / `76:10620` | `components/ui/table.tsx` | Read focused context before implementation. |
| `Sidebar` / `269:47` | `components/ui/sidebar.tsx` | Distinguish component sidebar from block sidebar. |

## Rule

When using this fallback, cite `selected_design_system_slug=shadcn-ui-components-2026` and the exact page/frame id. Do not claim Code Connect coverage until real mappings are created and validated.
