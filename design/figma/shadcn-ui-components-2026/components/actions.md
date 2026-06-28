# Deep Profile: Actions

## Статус

`done_with_risks`

## Inputs Used

- `Button` metadata for page `72:2719`.
- `Button` `get_design_context` for frame `402:654`.
- Root census for `Button Group`, `Toggle`, `Toggle Group`.
- Read-only focused Figma scan for `Button`, `Button Group`, `Toggle`, `Toggle Group`, 2026-06-27.

## Button

| Field | Value |
|---|---|
| Page | `Button` (`72:2719`) |
| Primary frame | `402:654` |
| Component container | `73:3681` |
| Component sets on page | 1 |
| Standalone components on page | 0 |
| Documentation link | `https://ui.shadcn.com/docs/components/button` |
| Component set | `Buttons` (`73:3681`) |
| Variants | 26 |

### Observed variants

| Axis | Values |
|---|---|
| `Type` | `Size-small`, `Size-default`, `Size-large`, `primary`, `secondary`, `destructive`, `outline`, `hhost`, `link`, `icon`, `with icon`, `Rounded`, `loading`, `Button group` |
| `State` | `default`, `hover`, `loading` |

### Risk

`componentPropertyDefinitions` for `Buttons` (`73:3681`) returns `Component set has existing errors`. The variant contract above is reconstructed from child component names.

### Observed token patterns

- Background/foreground variables: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--accent`, `--accent-foreground`.
- Borders/shadows: `--border`, `--border-width`, `Box Shadow/shadow-xs`.
- Radius variables: `--radius-lg`, `--radius-md`, `--radius-full`.
- Type variables: `--family/sans`, `--size/sm`, `--weight/medium`, `--leading/5`, `--tracking/normal`.

### Frontend mapping note

For shadcn codebases, map to `components/ui/button.tsx` with variant/class-authority style patterns. For this repo, do not import shadcn blindly; create an explicit adapter or component contract first.

## Button Group

| Field | Value |
|---|---|
| Page | `Button Group` (`1185:1979`) |
| Primary frame | `1185:1980` |
| Component sets | 4 |
| Standalone components | 7 |

### Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Button` | `1185:3073` | 3 | `Size: small, default, large` |
| `Dropdown Menu` | `1186:3685` | 2 | `State: default, open` |
| `Select` | `1186:3770` | 2 | `State: default, open` |
| `Popover` | `1186:3808` | 2 | `State: default, open` |

### Standalone Component Sources

| Component | Node id | Size |
|---|---|---|
| `Button group` | `1185:2953` | `331x36` |
| `Orientation` | `1185:3010` | `36x72` |
| `Nested` | `1186:3137` | `237x32` |
| `Separator` | `1186:3146` | `122x32` |
| `Split` | `1186:3165` | `113x36` |
| `Input` | `1186:3177` | `231x36` |
| `Input Group` | `1186:3210` | `270x36` |

## Toggle

| Field | Value |
|---|---|
| Page | `Toggle` (`73:2902`) |
| Primary frame | `79:10987` |
| Component sets | 5 |
| Standalone components | 1 |

### Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Default` | `79:11038` | 2 | `State: default, active` |
| `Outline` | `79:11048` | 2 | `State: default, active` |
| `With_text` | `79:11049` | 2 | `State: default, active` |
| `Small` | `79:11050` | 2 | `State: default, active` |
| `Large` | `79:11051` | 2 | `State: default, active` |

Standalone disabled source: `Disabled` (`79:11045`, `36x36`).

## Toggle Group

| Field | Value |
|---|---|
| Page | `Toggle Group` (`73:2903`) |
| Primary frame | `79:11264` |
| Component sets | 5 |
| Standalone components | 1 |

### Component Set Contracts

| Set | Node id | Variants | Properties |
|---|---|---:|---|
| `Default` | `624:124` | 2 | `State: default, active` |
| `Outline` | `624:135` | 2 | `State: default, active` |
| `Outline` | `624:168` | 2 | `State: default, active` |
| `Small` | `624:191` | 2 | `State: default, active` |
| `Outline` | `624:236` | 2 | `State: default, active` |

Standalone disabled source: `Examples/Disabled` (`79:11343`, `96x36`).

## Implementation Notes

- `Button` has the richest state/intent matrix but its component set has Figma-side property-definition errors; use child-name axes unless the source file is repaired.
- `hhost` appears to be the source spelling for ghost; do not normalize inside Figma contract without explicit mapping.
- `Toggle` and `Toggle Group` use `default|active`, not `Off|On`.
