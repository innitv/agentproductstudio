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

Component audit is pending in `component-map.md`; extraction targets are listed for buttons, inputs, controls, tags/chips, cards/panels and navigation.

## Frontend Mapping

Color base, color palette, typography, effect, border radius, spacing and size tokens are mapped to CSS custom properties in `apps/frontend/src/styles.css`.

Typography and effect Figma utility class names are also implemented in `apps/frontend/src/styles.css`:

- `.text-style-*` for display, heading, body, description and mobile text styles.
- `.effect-style-*` for bottom/top shadow styles and shadow reset.

## Risks

- Current Figma API token lacks `file_variables:read`; token values were extracted from frame evidence rather than canonical Figma Variables API.
- `Mont` is mapped as the primary design-system font, but the font file/import is not bundled yet; CSS falls back to Inter/system fonts.

## Next Actions

- Extract component variants and states.
- Map existing frontend components to accepted design-system tokens in a controlled migration pass.
