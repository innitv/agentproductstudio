# Figma Component Map

## Status

`pending_component_extraction`

## Inputs Used

- `design/figma/a3-design-system/README.md`
- `design/figma/a3-design-system/token-map.md`
- `design/figma/a3-design-system/design-system-audit.md`

## Notes

- Component mapping has not been extracted yet.
- Start from specific Figma component library frames or Dev Mode component pages.
- Base design-system tokens are available for component mapping: colors, typography, effects, radius, spacing and component sizes.

## Extraction Targets

| Area | Status | Notes |
|---|---|---|
| Buttons | pending | Map size, radius, typography, icon spacing, variants and states. |
| Inputs / Selects / Textareas | pending | Map input radius, height, border, placeholder, focus, error and disabled states. |
| Controls | pending | Map control radius, size, active/hover/focus states. |
| Tags / Chips | pending | Map `--size-m-tag`, `--size-m-chip`, radius and color variants. |
| Cards / Panels | pending | Map radius, shadow, spacing and surface colors. |
| Navigation | pending | Map typography, spacing, active states and responsive behavior. |

## Frontend Migration Rule

Do not bulk-rewrite existing frontend component styles until each component has an extracted Figma contract. Use the accepted tokens from `token-map.md` during a controlled migration pass and verify with build plus visual QA.
