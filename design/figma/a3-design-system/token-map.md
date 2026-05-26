# Figma Token Map

## Source

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=16-203&m=dev
- Scope: A3 design-system tokens
- Date: 2026-05-26
- Access mode: Figma REST file node API with local `FIGMA_API_TOKEN`

## Inputs Used

- Figma node `16:203`
- Figma node `16:292`
- User-provided Figma exports for typography, effects, radius, spacing and component size tokens
- `apps/frontend/src/styles.css`

## Notes

- Figma Variables API was not available for the current token because it requires the `file_variables:read` scope.
- Color token values were extracted from visible frame structure: token names, table rows and color swatches.
- Typography, effect, radius, spacing and component size values were extracted from user-provided Figma CSS/token exports.

## Color Base Tokens

| Token | RGBA | CSS variable |
|---|---|---|
| `base.accent` | `rgba(83, 151, 235, 1)` | `--base-accent` |
| `base.neutral` | `rgba(112, 124, 142, 1)` | `--base-neutral` |
| `base.success` | `rgba(43, 182, 115, 1)` | `--base-success` |
| `base.warning` | `rgba(255, 180, 91, 1)` | `--base-warning` |
| `base.error` | `rgba(244, 89, 89, 1)` | `--base-error` |
| `base.info` | `rgba(25, 152, 255, 1)` | `--base-info` |
| `base.status-01` | `rgba(0, 178, 136, 1)` | `--base-status-01` |
| `base.status-02` | `rgba(17, 146, 187, 1)` | `--base-status-02` |
| `base.status-03` | `rgba(105, 82, 245, 1)` | `--base-status-03` |
| `base.status-04` | `rgba(153, 36, 255, 1)` | `--base-status-04` |
| `base.status-05` | `rgba(227, 58, 130, 1)` | `--base-status-05` |
| `base.status-06` | `rgba(250, 83, 0, 1)` | `--base-status-06` |

## Frontend Mapping

| Figma token | Current semantic alias | Usage |
|---|---|---|
| `base.accent` | `--a3-brand-surface` -> `--base-accent` | Page blue surface |
| `base.info` | `--a3-brand-action` -> `--base-info` | CTA/action blue |
| `base.neutral` | `--base-neutral` | Neutral foundation for future text/border scales |
| `base.success` | `--base-success` | Success states |
| `base.warning` | `--base-warning` | Warning states |
| `base.error` | `--base-error` | Error states |
| `base.status-*` | `--base-status-*` | Additional status palettes |

## Color Palette Tokens

Source node: `16:292`

### Core Palettes

| Step | Accent | Neutral | Success | Warning | Error | Info |
|---:|---|---|---|---|---|---|
| 0 | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| 10 | `#F4F7FC` | `#F8F9FA` | `#EAF8F1` | `#FFF8EF` | `#FEEEEE` | `#F8FCFF` |
| 25 | `#E4EDFA` | `#EBEDF0` | `#D5F0E3` | `#FFF0DE` | `#FDDEDE` | `#F4FAFF` |
| 50 | `#D4E3F8` | `#D1D6DD` | `#BFE9D5` | `#FFE9CE` | `#FCCDCD` | `#E8F5FF` |
| 100 | `#C4D9F6` | `#C4CAD3` | `#95DBB9` | `#FFE1BD` | `#FBBDBD` | `#C6E5FF` |
| 200 | `#A5C4F1` | `#AAB3C0` | `#80D3AB` | `#FFDAAD` | `#F89B9B` | `#8CCBFF` |
| 300 | `#86AFEC` | `#8996A8` | `#6BCC9D` | `#FFCB8C` | `#F67A7A` | `#6ABCFF` |
| 400 | `#679AEA` | `#7C8A9E` | `#55C58F` | `#FFBC6B` | `#F56A6A` | `#47ADFF` |
| 500 | `#5397EB` | `#707C8E` | `#2BB673` | `#FFB45B` | `#F45959` | `#1998FF` |
| 600 | `#4179C4` | `#5D6877` | `#22925C` | `#E6A252` | `#DC5050` | `#1581D9` |
| 700 | `#3A679F` | `#4A535F` | `#1A6D45` | `#CC9049` | `#AB3E3E` | `#116AB3` |
| 800 | `#294B7A` | `#383E47` | `#165B3A` | `#996C37` | `#923535` | `#0F5B99` |
| 900 | `#203B61` | `#32373F` | `#11492E` | `#805A2E` | `#7A2D2D` | `#0C4C80` |
| 925 | `#1B334F` | `#25292F` | `#0D3722` | `#664824` | `#622424` | `#0B416E` |
| 950 | `#162A40` | `#191C20` | `#092417` | `#4C361B` | `#491B1B` | `#093559` |
| 990 | `#0F1D2D` | `#0C0E10` | `#04120B` | `#332412` | `#180909` | `#051E33` |
| 1000 | `#0A151F` | `#2C2E2B` | `#000000` | `#000000` | `#000000` | `#000000` |

### Status Palettes

| Step | Status 01 | Status 02 | Status 03 | Status 04 | Status 05 | Status 06 |
|---:|---|---|---|---|---|---|
| 0 | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| 10 | `#F7FDFB` | `#F8FCFD` | `#FAFAFF` | `#FCF8FF` | `#FEF9FB` | `#FFFAF7` |
| 25 | `#F2FBF9` | `#F3FAFC` | `#F8F6FE` | `#FAF4FF` | `#FEF5F9` | `#FFF6F2` |
| 50 | `#E6F7F3` | `#E7F4F8` | `#F0EEFE` | `#F5E9FF` | `#FCEBF3` | `#FEEEE6` |
| 100 | `#BFECE1` | `#C4E4EE` | `#DAD4FC` | `#E6C8FF` | `#F8CEE0` | `#FED4BF` |
| 200 | `#80D8C4` | `#88C8DD` | `#B4A9FA` | `#CC92FF` | `#F19DC1` | `#FCA980` |
| 300 | `#59CDB2` | `#64B8D3` | `#9E8FF9` | `#BD71FF` | `#ED7FAE` | `#FC8F59` |
| 400 | `#33C1A0` | `#41A8C9` | `#8775F7` | `#AD50FF` | `#E9619B` | `#FB7533` |
| 500 | `#00B288` | `#1192BB` | `#6952F5` | `#9924FF` | `#E33A82` | `#FA5300` |
| 600 | `#009774` | `#0E7C9F` | `#5946D0` | `#821FD9` | `#C1316E` | `#D44700` |
| 700 | `#007D5F` | `#0C6683` | `#4939AC` | `#6B19B3` | `#9F295B` | `#AF3A00` |
| 800 | `#006B52` | `#0A5870` | `#3F3193` | `#5C1699` | `#88234E` | `#963200` |
| 900 | `#005944` | `#08495E` | `#35297A` | `#4D1280` | `#711D41` | `#7D2A00` |
| 925 | `#004D3A` | `#063342` | `#251D56` | `#420F6E` | `#621938` | `#6C2400` |
| 950 | `#003E30` | `#063342` | `#251D56` | `#360D59` | `#50142D` | `#571D00` |
| 990 | `#00241B` | `#031D25` | `#151031` | `#1F0733` | `#2D0C1A` | `#321100` |
| 1000 | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` |

Canonical CSS variable naming:

- Base tokens: `--base-{accent|neutral|success|warning|error|info|status-01..06}`.
- Core palettes: `--{accent|neutral|success|warning|error|info}-{step}`.
- Status palettes: `--status-{01..06}-{step}`.
- Compatibility aliases: `--a3-base-*` and `--a3-palette-*` remain in CSS for existing frontend styles.

## Typography Tokens

Source: user-provided Figma text style export.

All typography utilities are implemented in `apps/frontend/src/styles.css` with `font-family: var(--font-family-mont)`, `font-style: normal`, `text-decoration: none` and `text-transform: none`.

| Class | Size | Line height | Weight | CSS variables |
|---|---:|---:|---:|---|
| `.text-style-font-display-l` | `48px` | `52px` | `400` | `--font-display-l-size`, `--font-display-l-line` |
| `.text-style-font-display-l-strong` | `48px` | `52px` | `600` | `--font-display-l-size`, `--font-display-l-line` |
| `.text-style-font-display-m` | `42px` | `44px` | `400` | `--font-display-m-size`, `--font-display-m-line` |
| `.text-style-font-display-m-strong` | `42px` | `44px` | `600` | `--font-display-m-size`, `--font-display-m-line` |
| `.text-style-font-heading-h1` | `32px` | `44px` | `600` | `--font-heading-h1-size`, `--font-heading-h1-line` |
| `.text-style-font-heading-h2` | `28px` | `32px` | `600` | `--font-heading-h2-size`, `--font-heading-h2-line` |
| `.text-style-font-heading-h3` | `24px` | `26px` | `600` | `--font-heading-h3-size`, `--font-heading-h3-line` |
| `.text-style-font-body-l` | `20px` | `26px` | `400` | `--font-body-l-size`, `--font-body-l-line` |
| `.text-style-font-body-l-strong` | `20px` | `26px` | `600` | `--font-body-l-size`, `--font-body-l-line` |
| `.text-style-font-body-m` | `18px` | `24px` | `400` | `--font-body-m-size`, `--font-body-m-line` |
| `.text-style-font-body-m-strong` | `18px` | `24px` | `600` | `--font-body-m-size`, `--font-body-m-line` |
| `.text-style-font-body-s` | `16px` | `24px` | `400` | `--font-body-s-size`, `--font-body-s-line` |
| `.text-style-font-body-s-strong` | `16px` | `24px` | `600` | `--font-body-s-size`, `--font-body-s-line` |
| `.text-style-font-description-l` | `14px` | `20px` | `400` | `--font-description-l-size`, `--font-description-l-line` |
| `.text-style-font-description-l-strong` | `14px` | `20px` | `600` | `--font-description-l-size`, `--font-description-l-line` |
| `.text-style-font-description-m` | `13px` | `18px` | `400` | `--font-description-m-size`, `--font-description-m-line` |
| `.text-style-font-description-m-strong` | `13px` | `18px` | `600` | `--font-description-m-size`, `--font-description-m-line` |
| `.text-style-font-description-s` | `12px` | `16px` | `400` | `--font-description-s-size`, `--font-description-s-line` |
| `.text-style-font-description-s-strong` | `12px` | `16px` | `600` | `--font-description-s-size`, `--font-description-s-line` |
| `.text-style-mobile-font-font` | `12px` | `16px` | `400` | `--font-mobile-font-size`, `--font-mobile-font-line` |

Shared typography variables:

- `--font-family-mont`: `"Mont", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- `--font-weight-regular`: `400`.
- `--font-weight-strong`: `600`.

## Effect Tokens

Source: user-provided Figma effect style export.

| Class | CSS variable | Box shadow |
|---|---|---|
| `.effect-style-shadow-none` | `--shadow-none` | `inset 0px 0px 0px rgba(0, 0, 0, 0)` |
| `.effect-style-shadow-bottom-s` | `--shadow-bottom-s` | `0px 2px 4px rgba(44, 46, 43, 0.05), 0px 0px 8px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-m` | `--shadow-bottom-m` | `0px 4px 8px rgba(44, 46, 43, 0.05), 0px 0px 16px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-l` | `--shadow-bottom-l` | `0px 12px 20px rgba(44, 46, 43, 0.05), 0px 0px 20px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-xl` | `--shadow-bottom-xl` | `0px 32px 32px rgba(44, 46, 43, 0.05), 0px 0px 32px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-controls` | `--shadow-bottom-controls` | `0px 2px 2px rgba(44, 46, 43, 0.2), 0px 0px 1px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-s` | `--shadow-top-s` | `0px -2px 4px rgba(44, 46, 43, 0.05), 0px 0px 8px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-m` | `--shadow-top-m` | `0px -4px 8px rgba(44, 46, 43, 0.05), 0px 0px 16px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-l` | `--shadow-top-l` | `0px -12px 20px rgba(44, 46, 43, 0.05), 0px 0px 20px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-xl` | `--shadow-top-xl` | `0px -32px 32px rgba(44, 46, 43, 0.05), 0px 0px 32px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-controls` | `--shadow-top-controls` | `0px -2px 2px rgba(44, 46, 43, 0.2), 0px 0px 1px rgba(44, 46, 43, 0.1)` |

## Border Radius Tokens

Source: user-provided Figma radius token export.

| Token | Value | Purpose |
|---|---:|---|
| `--border-radius-base` | `6px` | Base radius |
| `--border-radius-none` | `0px` | No radius |
| `--border-radius-2xs` | `2px` | Extra small radius |
| `--border-radius-xs` | `3px` | Small control radius |
| `--border-radius-s` | `4px` | Small radius |
| `--border-radius-m` | `var(--border-radius-base)` | Medium/default radius |
| `--border-radius-l` | `8px` | Large radius |
| `--border-radius-xl` | `12px` | Extra large radius |
| `--border-radius-2xl` | `24px` | Large container radius |
| `--border-radius-inputs` | `var(--border-radius-m)` | Inputs and input-based components |
| `--border-radius-buttons` | `var(--border-radius-m)` | Buttons |
| `--border-radius-controls` | `var(--border-radius-xs)` | Controls |
| `--border-radius-full` | `9999px` | Full/pill radius |

## Spacing Tokens

Source: user-provided Figma spacing token export.

| Token | Value |
|---|---:|
| `--spacing-base` | `16px` |
| `--spacing-none` | `0px` |
| `--spacing-px` | `1px` |
| `--spacing-0-5x` | `2px` |
| `--spacing-1x` | `4px` |
| `--spacing-1-5x` | `6px` |
| `--spacing-2x` | `8px` |
| `--spacing-3x` | `12px` |
| `--spacing-4x` | `var(--spacing-base)` |
| `--spacing-5x` | `20px` |
| `--spacing-6x` | `24px` |
| `--spacing-8x` | `32px` |
| `--spacing-10x` | `40px` |
| `--spacing-12x` | `48px` |
| `--spacing-16x` | `64px` |
| `--spacing-20x` | `80px` |
| `--spacing-24x` | `96px` |
| `--spacing-32x` | `128px` |
| `--spacing-48x` | `192px` |

## Size Tokens

Source: user-provided Figma component size token export.

| Token | Value | Purpose |
|---|---:|---|
| `--size-base` | `16px` | Base component size value |
| `--size-2xs` | `var(--size-base)` | Component height, 2xs |
| `--size-xs` | `20px` | Component height, xs |
| `--size-s` | `24px` | Component height, s |
| `--size-m-tag` | `28px` | Tag component height, m |
| `--size-m-chip` | `32px` | Chip component height, m |
| `--size-m` | `36px` | Component height, m |
| `--size-l` | `48px` | Component height, l |
| `--size-xl` | `56px` | Component height, xl |

## Implementation

- Added canonical Figma base color variables to `apps/frontend/src/styles.css` in RGBA format.
- Added canonical Figma color palette variables to `apps/frontend/src/styles.css` in RGBA format.
- Added typography variables and utility classes to `apps/frontend/src/styles.css`.
- Added effect/shadow variables and utility classes to `apps/frontend/src/styles.css`.
- Added border radius variables to `apps/frontend/src/styles.css`.
- Added spacing and component size variables to `apps/frontend/src/styles.css`.
- Kept `--a3-*` compatibility aliases for existing frontend styles.
- Replaced common hard-coded UI colors with semantic CSS variables where safe.
- Added `FIGMA_API_TOKEN` to `.env.example`.

## Follow-Up

- Reissue or update the Figma token with `file_variables:read` scope to read canonical Figma Variables directly.
- Map component variants and states to the accepted color, typography, effect, radius, spacing and size tokens.
