# Figma Design System Audit

## Status

`partial`

## Inputs Used

- `design/figma/a3-design-system/README.md`
- `design/figma/a3-design-system/token-map.md`
- `design/figma/a3-design-system/component-map.md`

## Variables And Tokens

- Color base tokens extracted and mapped.
- Color palette tokens extracted and mapped.
- Typography tokens extracted from user-provided Figma style export and mapped.
- Effect/shadow tokens extracted from user-provided Figma style export and mapped.
- Border radius tokens extracted from user-provided Figma token export and mapped.
- Spacing tokens extracted from user-provided Figma token export and mapped.
- Component size tokens extracted from user-provided Figma token export and mapped.

## Components

Component audit is partial in `component-map.md`; button, icon button, function button, checkbox, radio, switch, segmented control, input, input card, select, textarea, dropdown, tooltip, toast, inline notification, breadcrumbs and chips are extracted and implemented, while tags, cards/panels, remaining navigation and other overlays are pending.

## Frontend Mapping

Color base, color palette, typography, effect, border radius, spacing and size tokens are mapped to CSS custom properties in `apps/frontend/src/styles.css`.

Manual component preview is available in `apps/frontend/src/components-playground.tsx` through `/components` in the local frontend dev server.

Typography and effect Figma utility class names are also implemented in `apps/frontend/src/styles.css`:

- `.text-style-*` for display, heading, body, description and mobile text styles.
- `.effect-style-*` for bottom/top shadow styles and shadow reset.
- `.a3-checkbox*` for the Figma Checkbox component set.
- `.a3-radio*` for the Figma RadioButton component set.
- `.a3-switch*` for the Figma Switch component set.
- `.a3-segmented-control*` and `.a3-segment*` for the Figma SegmentedControl and Elements / Segment component sets.
- `.a3-button*` for the Figma Button component set.
- `.a3-icon-button*` for the Figma IconButton component set.
- `.a3-function-button*` for the Figma FunctionButton component set.
- `.a3-input*` for the Figma Input component set.
- `.a3-input-card*` for the Figma InputCard component set.
- `.a3-select*` for the Figma Select component set.
- `.a3-textarea*` for the Figma TextArea component set.
- `.a3-dropdown*` for the Figma DropdownMenu and Elements / Item component sets.
- `.a3-tooltip*` for the Figma Tooltip, Elements / Layout Tooltip and Pointer container component sets.
- `.a3-toast*` for the Figma Toast component set.
- `.a3-inline-notification*` for the Figma InlineNotification component set.
- `.a3-breadcrumb*` for the Figma Breadcrumbs, breadcrumb item and more button component sets.
- `.a3-chip*` for the Figma Chips component set.

## Risks

- Current Figma API token lacks `file_variables:read`; token values were extracted from frame evidence rather than canonical Figma Variables API.
- `Mont` is mapped as the primary design-system font, but the font file/import is not bundled yet; CSS falls back to Inter/system fonts.

## Next Actions

- Extract the next component variants and states from Figma.
- Map existing frontend components to accepted design-system tokens in a controlled migration pass.
