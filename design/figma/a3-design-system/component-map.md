# Figma Component Map

## Status

`partial_component_extraction`

## Inputs Used

- `design/figma/a3-design-system/README.md`
- `design/figma/a3-design-system/token-map.md`
- `design/figma/a3-design-system/design-system-audit.md`
- Figma node `396:1320` for `DropdownMenu`
- Figma node `387:1282` for `Elements / Item`
- Figma node `234:38` for `Chips`
- Figma node `608:662` for `Switch`
- Figma node `644:2504` for `Select`
- Figma node `635:2327` for `TextArea`
- Figma node `627:1899` for `SegmentedControl`
- Figma node `626:11` for `Elements / Segment`
- Figma node `588:239` for `RadioButton`
- Figma node `615:14` for `Tooltip`
- Figma node `976:6677` for `Elements / Layout Tooltip`
- Figma node `975:6109` for `Pointer container`
- Figma node `725:248` for `Toast`
- Figma node `579:4735` for `InlineNotification`
- Figma node `779:23829` for `IconButton`
- Figma node `579:2942` for `FunctionButton`
- Figma node `382:1472` for `Breadcrumbs`
- Figma node `382:809` for `Elements / Breadcrumb / Neutral`
- Figma node `239:997` for `Elements / More Button / Neutral`
- Figma nodes `813:27491`, `813:27490` for current crumb variants
- Figma node `638:1979` for `InputCard`

## Notes

- Checkbox, radio, switch, segmented control, button, icon button, function button, input, input card, select, textarea, dropdown, tooltip, toast, inline notification, breadcrumbs and chips component mappings have been extracted from specific Figma component sets.
- Continue from specific Figma component library frames or Dev Mode component pages.
- Base design-system tokens are available for component mapping: colors, typography, effects, radius, spacing and component sizes.

## Extraction Targets

| Area | Status | Notes |
|---|---|---|
| Buttons | completed | Button, IconButton and FunctionButton component sets extracted and implemented. |
| Inputs / Selects / Textareas | completed | Input, InputCard, select and textarea extracted and implemented. |
| Controls | completed | Checkbox, radio, switch and segmented control extracted and implemented. |
| Dropdown / Menu | completed | DropdownMenu and Elements / Item extracted and implemented. |
| Tags / Chips | partial | Chips extracted and implemented; tags pending. |
| Cards / Panels | pending | Map radius, shadow, spacing and surface colors. |
| Navigation | partial | Breadcrumbs extracted and implemented; map remaining navigation components. |
| Overlays | partial | Tooltip extracted and implemented; other overlays pending. |
| Feedback | partial | Toast and InlineNotification extracted and implemented; alerts and notification placement patterns pending. |

## Checkbox

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=221-3095&m=dev
- Figma node: `221:3095`
- Figma entity: `COMPONENT_SET | Checkbox`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `label text#221:1` | text | default `Label` |
| `label#221:2` | boolean | default `true` |
| `size` | variant | `s`, `xs`; default `s` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |
| `checked` | variant | `false`, `true`; default `false` |
| `indeterminate` | variant | `false`, `true`; default `false` |

### Visual Mapping

| Figma state | Size | Frame | Label | Code mapping |
|---|---:|---|---|---|
| default unchecked | `s` | `20x20`, radius `4`, stroke `rgba(124, 138, 158, 0.25)` width `2` | `16/24`, `rgba(44, 46, 43, 1)` | `.a3-checkbox--s`, unchecked input |
| default unchecked | `xs` | `16x16`, radius `4`, stroke `rgba(124, 138, 158, 0.25)` width `2` | `14/20`, `rgba(44, 46, 43, 1)` | `.a3-checkbox--xs`, unchecked input |
| hover unchecked | `s/xs` | same size, stroke `rgba(124, 138, 158, 0.5)` | default label | `.a3-checkbox:hover` |
| checked | `s/xs` | fill `--base-accent`, transparent stroke, white check icon | default label | `input:checked` |
| checked hover | `s/xs` | fill `--accent-600`, transparent stroke, white check icon | default label | `input:checked` + hover |
| indeterminate | `s/xs` | fill `--base-accent`, transparent stroke, white minus icon | default label | `indeterminate` prop / `data-indeterminate` |
| disabled unchecked | `s/xs` | fill `rgba(124, 138, 158, 0.15)`, transparent stroke | `rgba(124, 138, 158, 0.8)` | `disabled` |
| disabled checked / mixed | `s/xs` | fill `rgba(124, 138, 158, 0.15)`, icon `rgba(124, 138, 158, 0.8)` | `rgba(124, 138, 158, 0.8)` | `disabled` + checked/mixed |

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Checkbox` | `apps/frontend/src/components/ui/checkbox.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-checkbox*` |
| Native accessibility | `<input type="checkbox">` inside `<label>` |
| Mixed state | `indeterminate` prop sets DOM `input.indeterminate` and `aria-checked="mixed"` |
| Size `s` | `--checkbox-size-s-box: 20px`, `--checkbox-size-s-height: 24px` |
| Size `xs` | `--checkbox-size-xs-box: 16px`, `--checkbox-size-xs-height: 20px` |
| Radius | `--checkbox-radius: var(--border-radius-s)` |
| Gap | `--checkbox-gap: var(--spacing-1-5x)` |

## Radio

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=588-239&m=dev
- Figma node: `588:239`
- Figma entity: `COMPONENT_SET | RadioButton`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `label#588:2` | boolean | default `true` |
| `lable text#588:3` | text | default `Label` |
| `size` | variant | `s`, `xs`; default `s` |
| `variant` | variant | `primary`; default `primary` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |
| `checked` | variant | `no`, `yes`; default `no` |

### Visual Mapping

| Figma state | Size | Circle | Label | Code mapping |
|---|---:|---|---|---|
| default unchecked | `s` | `22x22`, stroke `rgba(124, 138, 158, 0.25)` width `2`, radius full | `16/24`, weight `600`, `--neutral-1000` | `.a3-radio--s`, unchecked input |
| default unchecked | `xs` | `20x20`, stroke `rgba(124, 138, 158, 0.25)` width `2`, radius full | `14/20`, weight `600`, `--neutral-1000` | `.a3-radio--xs`, unchecked input |
| hover unchecked | `s/xs` | stroke `rgba(124, 138, 158, 0.5)` | default label | `.a3-radio:hover` |
| checked | `s` | fill `--base-accent`, white dot `8x8` | default label | `input:checked` |
| checked | `xs` | fill `--base-accent`, white dot about `7x7` | default label | `input:checked` |
| checked hover | `s/xs` | fill `--accent-600`, white dot | default label | `input:checked` + hover |
| disabled unchecked | `s/xs` | fill `rgba(124, 138, 158, 0.15)`, transparent stroke | `rgba(124, 138, 158, 0.8)` | `disabled` |
| disabled checked | `s/xs` | fill disabled, dot `rgba(124, 138, 158, 0.8)` | disabled label | `disabled` + checked |

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `RadioButton` | `apps/frontend/src/components/ui/radio.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-radio*` |
| Native accessibility | `<input type="radio">` inside `<label>` |
| Sizes | `size="s"`, `xs` |
| Checked state | native `checked` / `defaultChecked` |
| Disabled state | native `disabled` plus `data-disabled` |
| Label | `label` prop |
| Name/grouping | native `name` prop |

## Button

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=213-183&m=dev
- Figma node: `213:183`
- Figma entity: `COMPONENT_SET | Button`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `icon#213:0` | boolean | default `false` |
| `action icon#213:5` | boolean | default `false` |
| `icon variant#213:10` | instance swap | default icon component |
| `action icon variant#213:15` | instance swap | default icon component |
| `Label text#213:20` | text | default `Button label` |
| `size` | variant | `xl`, `l`, `m`, `s`; default `xl` |
| `variant` | variant | `primary`, `secondary`, `outline`, `ghost`; default `primary` |
| `colorScheme` | variant | `accent`; default `accent` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |

### Visual Mapping

| Figma variant | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| `primary` | bg `--base-accent`, fg `--neutral-0` | bg `--accent-600` | bg `--accent-700` | bg `rgba(124, 138, 158, 0.15)`, fg `rgba(124, 138, 158, 0.8)` |
| `secondary` | bg `rgba(83, 151, 235, 0.12)`, fg `--base-accent` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.3)`, fg `--accent-700` | bg disabled, fg disabled |
| `outline` | bg transparent, border `--accent-200`, fg `--base-accent` | bg `rgba(83, 151, 235, 0.12)`, border `--accent-400`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.2)`, border `--accent-400`, fg `--accent-700` | bg transparent, border disabled, fg disabled |
| `ghost` | bg transparent, fg `--base-accent` | bg `rgba(83, 151, 235, 0.12)`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-700` | bg transparent, fg disabled |

| Size | Height | Text | Icon | Code class |
|---|---:|---|---:|---|
| `xl` | `56px` | `16/24`, weight `700` | `24px` | `.a3-button--xl` |
| `l` | `48px` | `16/24`, weight `700` | `24px` | `.a3-button--l` |
| `m` | `36px` | `14/20`, weight `700` | `20px` | `.a3-button--m` |
| `s` | `24px` | `12/16`, weight `700` | `16px` | `.a3-button--s` |

Shared visual values:

- Radius: `6px` / `--border-radius-buttons`.
- Border width for outline-like variants: `2px`.
- Leading/action icon slots are supported in code as `leadingIcon` and `actionIcon`.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Button` | `apps/frontend/src/components/ui/button.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-button*` |
| Variants | `variant="primary"`, `secondary`, `outline`, `ghost` |
| Sizes | `size="xl"`, `l`, `m`, `s` |
| Legacy aliases | `variant="default"` -> primary, `size="default"` -> m, `sm` -> s, `lg` -> l |
| Leading icon | `leadingIcon` prop |
| Action icon | `actionIcon` prop |

## Breadcrumbs

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=382-1472&m=dev
- Figma node: `382:1472`
- Figma entity: `COMPONENT_SET | Breadcrumbs`
- Element URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=382-809&m=dev
- Element node: `382:809`
- Element entity: `COMPONENT_SET | Elements / Breadcrumb / Neutral`
- More button URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=239-997&m=dev
- More button node: `239:997`
- More button entity: `COMPONENT_SET | Elements / More Button / Neutral`
- Current crumb nodes: `813:27491`, `813:27490`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

Breadcrumbs:

| Property | Type | Values / default |
|---|---|---|
| `2 crumbs#813:0` | boolean | default `true` |
| `3 crumbs#813:3` | boolean | default `true` |
| `4 crumbs#813:6` | boolean | default `true` |
| `current crumb#813:9` | boolean | default `true` |
| `hidden crumbs` | variant | `true`, `false`; default `false` |
| `colorScheme` | variant | `neutral`; default `neutral` |

Breadcrumb item:

| Property | Type | Values / default |
|---|---|---|
| `hover` | variant | `false`, `true`; default `false` |
| `colorScheme` | variant | `secondary`; default `secondary` |

More button:

| Property | Type | Values / default |
|---|---|---|
| `state` | variant | `default`, `hover`, `active`; default `default` |
| `active` | variant | `false`, `true`; default `false` |
| `colorScheme` | variant | `neutral`; default `neutral` |

### Visual Mapping

| Part / state | Visual values | Code mapping |
|---|---|---|
| Breadcrumb text | Mont `12/16`, weight `700`, `--neutral-1000` | `.a3-breadcrumb` |
| Current crumb neutral | Mont `12/16`, weight `700`, `--neutral-300` | `current` item |
| Separator dot | `3x3`, `--neutral-1000` | `BreadcrumbSeparator` |
| More button default | `24x24`, radius `8px`, transparent bg, `--neutral-1000` icon | `BreadcrumbMoreButton` |
| More button hover | bg `rgba(124, 138, 158, 0.1)`, icon `--neutral-600` | CSS `:hover` |
| More button active | bg `rgba(124, 138, 158, 0.2)`, icon `--neutral-700`, dropdown shown | `open` / `active` |
| Hidden menu | dropdown width `120px`, item size `s` | hidden items rendered through `Dropdown` |

Implementation note:

- Figma exposes toggles for 2/3/4/current crumbs, but frontend accepts an arbitrary `items` array.
- Collapsed breadcrumbs are represented by `hiddenItems`; when provided, the first visible item, more button and remaining visible items are rendered.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Breadcrumbs` | `apps/frontend/src/components/ui/breadcrumbs.tsx` `Breadcrumbs` |
| Component set `Elements / Breadcrumb / Neutral` | `BreadcrumbLink` |
| Component set `Elements / More Button / Neutral` | `BreadcrumbMoreButton` |
| Dot divider | `BreadcrumbSeparator` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-breadcrumb*` |
| Hidden crumbs | `hiddenItems` prop |
| Current crumb | item `current: true` and `aria-current="page"` |
| Dropdown menu | Reuses `Dropdown` and `DropdownItem` |

## Icon Button

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=779-23829&m=dev
- Figma node: `779:23829`
- Figma entity: `COMPONENT_SET | IconButton`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `icon variant#782:0` | instance swap | default menu kebab icon |
| `size` | variant | `xl`, `l`, `m`, `s`; default `xl` |
| `variant` | variant | `primary`, `secondary`, `outline`, `ghost`; default `primary` |
| `colorScheme` | variant | `accent`, `neutral`; default `accent` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |

### Visual Mapping

| Variant / scheme | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| `primary / accent` | bg `--base-accent`, fg `--neutral-0` | bg `--accent-600` | bg `--accent-700` | bg disabled, fg disabled |
| `primary / neutral` | bg `--base-neutral`, fg `--neutral-0` | bg `--neutral-600` | bg `--neutral-700` | bg disabled, fg disabled |
| `secondary / accent` | bg `rgba(83, 151, 235, 0.12)`, fg `--base-accent` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.3)`, fg `--accent-700` | bg disabled, fg disabled |
| `secondary / neutral` | bg `rgba(124, 138, 158, 0.1)`, fg `--base-neutral` | bg `rgba(124, 138, 158, 0.2)`, fg `--neutral-600` | bg `rgba(124, 138, 158, 0.3)`, fg `--neutral-700` | bg disabled, fg disabled |
| `outline / accent` | bg transparent, border `--accent-200`, fg `--base-accent` | bg accent subtle, border `--accent-400`, fg `--accent-600` | bg stronger subtle, fg `--accent-700` | transparent bg, disabled border/fg |
| `outline / neutral` | bg transparent, border neutral subtle, fg `--base-neutral` | bg neutral subtle, border stronger, fg `--neutral-600` | bg stronger neutral subtle, fg `--neutral-700` | transparent bg, disabled border/fg |
| `ghost / accent` | bg transparent, fg `--base-accent` | bg accent subtle, fg `--accent-600` | bg stronger subtle, fg `--accent-700` | transparent bg, disabled fg |
| `ghost / neutral` | bg transparent, fg `--base-neutral` | bg neutral subtle, fg `--neutral-600` | bg stronger neutral subtle, fg `--neutral-700` | transparent bg, disabled fg |

| Size | Button box | Icon | Code class |
|---|---:|---:|---|
| `xl` | `56x56` | `24px` | `.a3-icon-button--xl` |
| `l` | `48x48` | `24px` | `.a3-icon-button--l` |
| `m` | `36x36` | `24px` | `.a3-icon-button--m` |
| `s` | `24x24` | `16px` | `.a3-icon-button--s` |

Shared visual values:

- Radius: `6px` / `--border-radius-buttons`.
- Outline border width: `2px`.
- Icon-only buttons require an accessible label in usage through `aria-label`.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `IconButton` | `apps/frontend/src/components/ui/icon-button.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-icon-button*` |
| Variants | `variant="primary"`, `secondary`, `outline`, `ghost` |
| Color schemes | `colorScheme="accent"`, `neutral` |
| Sizes | `size="xl"`, `l`, `m`, `s` |
| Legacy aliases | `variant="default"` -> primary, `size="default"` -> m, `sm` -> s, `lg` -> l |
| Icon slot | required `icon` prop |

## Function Button

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=579-2942&m=dev
- Figma node: `579:2942`
- Figma entity: `COMPONENT_SET | FunctionButton`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `label#579:0` | boolean | default `true` |
| `label text#579:25` | text | default `Label` |
| `icon#579:50` | boolean | default `true` |
| `icon variant#579:75` | instance swap | default icon component |
| `action icon#778:50` | boolean | default `false` |
| `action icon variant#778:59` | instance swap | default action icon component |
| `variant` | variant | `primary`, `secondary`, `tertiary`; default `primary` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |
| `iconPosition` | variant | `left`; default `left` |

### Visual Mapping

| Variant / state | Text and icon color | Code mapping |
|---|---|---|
| `primary / default` | `--base-accent` | `variant="primary"` |
| `secondary / default` | `--neutral-1000` | `variant="secondary"` |
| `tertiary / default` | `--neutral-300`; action icon stays neutral text color in Figma evidence | `variant="tertiary"` |
| `hover` | `--accent-600` | CSS `:hover` |
| `pressed` | `--accent-700` | CSS `:active` |
| `disabled` | `rgba(124, 138, 158, 0.8)` | native `disabled` |

Shared visual values:

- Height: `24px`.
- Text: Mont `14/20`, weight `600`.
- Leading/action icon slots: `24px`.
- No fill, no border; button is a functional text/icon affordance.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `FunctionButton` | `apps/frontend/src/components/ui/function-button.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-function-button*` |
| Variants | `variant="primary"`, `secondary`, `tertiary` |
| Leading icon | `icon` prop |
| Label | `children` |
| Action icon | `actionIcon` prop |

## Input

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=492-2765&m=dev
- Figma node: `492:2765`
- Figma entity: `COMPONENT_SET | Input`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `hint#492:6` | boolean | default `false` |
| `lebel#492:7` | boolean | default `true` |
| `iconLeft#492:8` | boolean | default `false` |
| `iconRight#492:9` | boolean | default `false` |
| `iconLeft variant#492:10` | instance swap | default search icon |
| `iconRight variant#492:11` | instance swap | default close icon |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `filled`, `error`, `disabled`; default `default` |
| `value` | variant | `none`, `placeholder`, `filled`; default `none` |

### Visual Mapping

| State | Container | Label | Field text |
|---|---|---|---|
| `default` | bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | `--neutral-700` | `--neutral-1000` |
| `hover` | bg `--neutral-0`, border `rgba(124, 138, 158, 0.5)` | `--neutral-700` | `--neutral-1000` |
| `focus` | bg `--neutral-0`, border `--accent-400`, focus ring `rgba(83, 151, 235, 0.1)` | `--base-accent` | `--neutral-1000` |
| `filled` | same as default | `--neutral-700` | `--neutral-1000` |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | `--base-error` | `--neutral-1000` |
| `disabled` | bg `rgba(124, 138, 158, 0.15)`, transparent border | `rgba(124, 138, 158, 0.8)` | disabled fg |

| Size | Control height | Text | Icon | Code class |
|---|---:|---|---:|---|
| `l` | `48px` | `16/24`, weight `600` | `24px` | `.a3-input--l` |
| `m` | `36px` | `14/20`, weight `600` | `20px` | `.a3-input--m` |
| `s` | `24px` | `12/16`, weight `600` | `16px` | `.a3-input--s` |

Shared visual values:

- Width in Figma examples: `280px`.
- Radius: `6px` / `--border-radius-inputs`.
- Border width: `2px`.
- Hint/counter text: `12/16`, weight `600`, `--neutral-300`.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Input` | `apps/frontend/src/components/ui/input.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-input*` |
| Sizes | `size="l"`, `m`, `s` |
| Error state | `invalid` prop and `aria-invalid` |
| Disabled state | native `disabled` plus `data-disabled` |
| Focus state | CSS `:focus-within` |
| Label | `label` prop with `htmlFor` |
| Hint | `hint` prop with `aria-describedby` |
| Counter | `counter` prop with `aria-describedby` |
| Left/right icons | `leftIcon`, `rightIcon` props |

## Input Card

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=638-1979&m=dev
- Figma node: `638:1979`
- Figma entity: `COMPONENT_SET | InputCard`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `hint#492:6` | boolean | default `false` |
| `lebel#492:7` | boolean | default `true` |
| `iconRight#492:9` | boolean | default `false` |
| `iconRight variant#492:11` | instance swap | default close icon |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `filled`, `error`, `disabled default`, `disabled filled`; default `default` |
| `placeholder` | variant | `false`, `true`; default `false` |

### Visual Mapping

| State | Container | Label / value | Icon behavior |
|---|---|---|---|
| `default` | input-style bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | label `--neutral-700`, placeholder `--neutral-300`, value `--neutral-1000` | payment card icon left |
| `hover` | border `rgba(124, 138, 158, 0.5)` or accent focus evidence in placeholder variants | label may become `--base-accent` in some variants | same |
| `focus` | border `--accent-400`, focus ring `rgba(83, 151, 235, 0.1)` | label `--base-accent` | same |
| `filled` | default container | card brand icon can replace generic payment card icon | `brandIcon` prop |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | label `--base-error` | same |
| `disabled default` | bg `rgba(124, 138, 158, 0.15)`, transparent border | label/placeholder disabled fg | disabled |
| `disabled filled` | bg disabled | label/value disabled fg, brand icon retained | disabled |

| Size | Control height | Text | Icon | Code class |
|---|---:|---|---:|---|
| `l` | `48px` | `16/24`, weight `600`; inside label `12/16` in filled/placeholder modes | `24px` | `.a3-input-card--l` |
| `m` | `36px` | `14/20`, weight `600` | `20px` | `.a3-input-card--m` |
| `s` | `24px` | `12/16`, weight `600` | `16px` | `.a3-input-card--s` |

Shared visual values:

- Width in Figma examples: `280px`.
- Radius: `6px` / `--border-radius-inputs`.
- Border width: `2px`.
- Footer hint/counter text: `12/16`, weight `600`.
- Component reuses the accepted input color, border, focus, disabled and error tokens.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `InputCard` | `apps/frontend/src/components/ui/input-card.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-input-card*` |
| Input tokens | Reuses `--input-*` color, radius, border and focus tokens |
| Sizes | `size="l"`, `m`, `s` |
| Generic card icon | default `CreditCard` icon |
| Filled brand icon | `brandIcon` prop |
| Right icon / clear | `rightIcon` prop or `onClear` action |
| Error state | `invalid` prop and `aria-invalid` |
| Disabled state | native `disabled` plus `data-disabled` |
| Label | `label` prop with `htmlFor`; size `l` renders label inside the control |
| Hint | `hint` prop with `aria-describedby` |
| Counter | `counter` prop with `aria-describedby` |

## Textarea

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=635-2327&m=dev
- Figma node: `635:2327`
- Figma entity: `COMPONENT_SET | TextArea`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `scroll#637:0` | boolean | default `false` |
| `hint#637:40` | boolean | default `true` |
| `label#637:80` | boolean | default `true` |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `error`, `disabled`; default `default` |
| `value` | variant | `none`, `placeholder`, `filled`; default `none` |

### Visual Mapping

| State | Container | Label / value | Footer |
|---|---|---|---|
| `default` | input-style bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | label `--neutral-700`, placeholder `--neutral-300`, value `--neutral-1000` | hint/counter `--neutral-300` |
| `hover` | border `rgba(124, 138, 158, 0.5)` | same text colors | same |
| `focus` | border `--accent-400`, focus ring `rgba(83, 151, 235, 0.1)` | label `--base-accent` | same |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | label `--base-error` | hint `--base-error`, counter muted |
| `disabled` | bg `rgba(124, 138, 158, 0.15)`, transparent border | label/value `rgba(124, 138, 158, 0.8)` | disabled fg |

| Size | Control height | Text | Code class |
|---|---:|---|---|
| `l` | `104px` | `16/24`, weight `600` | `.a3-textarea--l` |
| `m` | `76px` | `14/20`, weight `600` | `.a3-textarea--m` |
| `s` | `56px` | `12/16`, weight `600` | `.a3-textarea--s` |

Shared visual values:

- Width in Figma examples: `280px`.
- Radius: `6px` / `--border-radius-inputs`.
- Border width: `2px`.
- Footer hint/counter text: `12/16`, weight `600`.
- Scroll track: `rgba(124, 138, 158, 0.1)`, thumb `--neutral-200`.
- Textarea reuses the accepted input color, border, focus, disabled and error tokens.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `TextArea` | `apps/frontend/src/components/ui/textarea.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-textarea*` |
| Trigger tokens | Reuses `--input-*` color, radius, border and focus tokens |
| Sizes | `size="l"`, `m`, `s` |
| Error state | `invalid` prop and `aria-invalid` |
| Disabled state | native `disabled` plus `data-disabled` |
| Focus state | CSS `:focus-within` / textarea `:focus` |
| Label | `label` prop with `htmlFor` |
| Hint | `hint` prop with `aria-describedby` |
| Counter | `counter` prop with `aria-describedby` |
| Scroll | `scroll` prop applies Figma scrollbar colors |

## Tooltip

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=615-14&m=dev
- Figma node: `615:14`
- Figma entity: `COMPONENT_SET | Tooltip`
- Layout item URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=976-6677&m=dev
- Layout item node: `976:6677`
- Layout item entity: `COMPONENT | Elements / Layout Tooltip`
- Pointer direction URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=975-6109&m=dev
- Pointer direction node: `975:6109`
- Pointer direction entity: `COMPONENT_SET | Pointer container`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

Tooltip:

| Property | Type | Values / default |
|---|---|---|
| `closeButton#976:8` | boolean | default `false` |
| `content swap#976:26` | instance swap | default `976:6677` |
| `autoWidth` | variant | `false`, `true`; default `false` |

Elements / Layout Tooltip:

| Property | Type | Values / default |
|---|---|---|
| `title#976:24` | boolean | default `true` |
| `subtitle#976:25` | boolean | default `true` |

Pointer container:

| Property | Type | Values / default |
|---|---|---|
| `placement` | variant | `Bottom Center`, `Bottom Left`, `Bottom Right`, `Left Bottom`, `Left Center`, `Left Top`, `Top Center`, `Top Left`, `Top Right`, `Right Bottom`, `Right Center`, `Right Top`; default `Bottom Center` |

### Visual Mapping

| Part / state | Visual values | Code mapping |
|---|---|---|
| Fixed tooltip | width `200px`, min height `58px` | `TooltipContent autoWidth={false}` |
| Auto-width tooltip | width by content, Figma example `71px` | `autoWidth` prop |
| Bubble | bg `--neutral-0`, radius `6px`, shadow `--shadow-bottom-m` | `.a3-tooltip` |
| Content padding | `12px` horizontal, `8px` vertical | `.a3-tooltip__content` |
| Title | Mont `14/20`, weight `600`, `--neutral-1000` | `title` prop / `TooltipLayout` |
| Subtitle | Mont `12/16`, weight `600`, `--neutral-700` | `subtitle` prop / `TooltipLayout` |
| Close button | `20x20`, radius `4px`, bg `rgba(124, 138, 158, 0.1)`, icon `16px` | `closeButton` prop |
| Top/bottom pointer | `14x8` triangle | `placement` prop |
| Left/right pointer | `8x14` visual direction from rotated triangle | `placement` prop |

Supported frontend placements:

- `bottom-center`, `bottom-left`, `bottom-right`
- `top-center`, `top-left`, `top-right`
- `left-center`, `left-top`, `left-bottom`
- `right-center`, `right-top`, `right-bottom`

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Tooltip` | `apps/frontend/src/components/ui/tooltip.tsx` `Tooltip`, `TooltipContent` |
| Component `Elements / Layout Tooltip` | `TooltipLayout` |
| Component set `Pointer container` | CSS placement and pointer rules |
| Visual classes | `apps/frontend/src/styles.css` `.a3-tooltip*` |
| Auto width | `autoWidth` prop |
| Close button | `closeButton` and `onClose` props |
| Title/subtitle | `title`, `subtitle` props or custom `content` |
| Direction | `placement` prop |
| Trigger behavior | hover/focus wrapper through `Tooltip`; standalone content through `TooltipContent` |

## Toast

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=725-248&m=dev
- Figma node: `725:248`
- Figma entity: `COMPONENT_SET | Toast`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `closeButton#725:0` | boolean | default `true` |
| `Hedaer#725:3` | boolean | default `true` |
| `hedaer text#725:6` | text | default `Header` |
| `subtitle#725:9` | boolean | default `true` |
| `subtitle text#725:12` | text | default `Subtitle` |
| `actionButtons#725:15` | boolean | default `true` |
| `button 1#725:18` | boolean | default `true` |
| `button 2#725:21` | boolean | default `true` |
| `icon#725:24` | boolean | default `true` |
| `colorScheme` | variant | `info`, `success`, `warning`, `error`; default `info` |

### Visual Mapping

| Part / scheme | Visual values | Code mapping |
|---|---|---|
| Toast container | width `375px`, min height `112px`, bg `--neutral-0`, radius `6px`, shadow `--shadow-bottom-l` | `.a3-toast` |
| Layout | padding `12px`, gap `12px`, left icon container plus text/action content | flex root and content grid |
| Icon container | `48x48`, radius `6px` | `.a3-toast__icon-container` |
| Info icon | bg `rgba(25, 152, 255, 0.1)`, fg `--base-info` | `colorScheme="info"` |
| Success icon | bg `rgba(43, 182, 115, 0.1)`, fg `--base-success` | `colorScheme="success"` |
| Warning icon | bg `rgba(255, 180, 91, 0.2)`, fg `--base-warning` | `colorScheme="warning"` |
| Error icon | bg `rgba(244, 89, 89, 0.1)`, fg `--base-error` | `colorScheme="error"` |
| Header | Mont `14/20`, weight `700`, `--neutral-1000` | `title` prop |
| Subtitle | Mont `14/20`, weight `600`, `--neutral-700` | `subtitle` prop |
| Close button | `24x24`, radius `6px`, bg `rgba(124, 138, 158, 0.1)`, icon `--base-neutral` | `closeButton` / `onClose` |
| Actions | up to two Figma action buttons, gap `16px` | `actions` prop using `FunctionButton` |

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Toast` | `apps/frontend/src/components/ui/toast.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-toast*` |
| Color schemes | `colorScheme="info"`, `success`, `warning`, `error` |
| Icon slot | `icon` prop, with default status icons from `lucide-react` |
| Header/subtitle | `title` and `subtitle` props |
| Close button | `closeButton` and `onClose` props |
| Action buttons | `actions` array, rendered with `FunctionButton` |
| Accessibility role | `role="status"` by default; `role="alert"` for error scheme |

## Inline Notification

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=579-4735&m=dev
- Figma node: `579:4735`
- Figma entity: `COMPONENT_SET | InlineNotification`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `icon container#579:109` | boolean | default `true` |
| `colseButton#579:110` | boolean | default `true` |
| `title#579:111` | boolean | default `true` |
| `title text#579:112` | text | default `Title` |
| `subtitle#579:113` | boolean | default `true` |
| `subtitle text#579:114` | text | default `Subtitle` |
| `button right#579:115` | boolean | default `true` |
| `button left#579:116` | boolean | default `true` |
| `actionButtons#579:117` | boolean | default `true` |
| `colorScheme` | variant | `info`, `warning`, `succes`, `error`; default `info` |

Implementation note:

- Figma variant name `succes` is normalized to frontend `colorScheme="success"`.

### Visual Mapping

| Part / scheme | Visual values | Code mapping |
|---|---|---|
| Inline container | width `375px`, min height `110px`, radius `6px`, border `2px`, no shadow | `.a3-inline-notification` |
| Content area | width `327px`, padding `12px 16px`, body/action gap `16px` | `.a3-inline-notification__content` |
| Icon container | width `48px`, full component height, icon `24px` centered | `.a3-inline-notification__icon-container` |
| Info scheme | border `--info-200`, icon area bg `rgba(25, 152, 255, 0.1)`, icon `--base-info` | `colorScheme="info"` |
| Success scheme | border `--success-200`, icon area bg `rgba(43, 182, 115, 0.1)`, icon `--base-success` | `colorScheme="success"` |
| Warning scheme | border `--warning-200`, icon area bg `rgba(255, 180, 91, 0.2)`, icon `--base-warning` | `colorScheme="warning"` |
| Error scheme | border `--error-200`, icon area bg `rgba(244, 89, 89, 0.1)`, icon `--base-error` | `colorScheme="error"` |
| Title | Mont `14/20`, weight `700`, `--neutral-1000` | `title` prop |
| Subtitle | Mont `14/20`, weight `600`, `--neutral-700` | `subtitle` prop |
| Close button | `24x24`, radius `6px`, bg `rgba(124, 138, 158, 0.1)`, icon `--base-neutral` | `closeButton` / `onClose` |
| Actions | two Figma action buttons, each `76x24`, gap `16px` | `actions` prop using `FunctionButton` |

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `InlineNotification` | `apps/frontend/src/components/ui/inline-notification.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-inline-notification*` |
| Color schemes | `colorScheme="info"`, `success`, `warning`, `error` |
| Icon container toggle | `icon` prop controls icon content; container is part of layout |
| Title/subtitle | `title` and `subtitle` props |
| Close button | `closeButton` and `onClose` props |
| Action buttons | `actions` array, rendered with `FunctionButton`; supports leading and action icons |
| Accessibility role | `role="status"` by default; `role="alert"` for error scheme |

## Select

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=644-2504&m=dev
- Figma node: `644:2504`
- Figma entity: `COMPONENT_SET | Select`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `hint#492:6` | boolean | default `false` |
| `iconLeft#492:8` | boolean | default `false` |
| `iconLeft variant#492:10` | instance swap | default search icon |
| `DropdownMenu#989:0` | boolean | default `false` |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `error`, `disabled`; default `default` |
| `label` | variant | `true`; default `true` |
| `value` | variant | `none`, `placeholder`, `filled`; default `none` |

### Visual Mapping

| State | Trigger container | Label / value | Dropdown |
|---|---|---|---|
| `default` | input-style bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | label `--neutral-700`, placeholder `--neutral-300`, value `--neutral-1000` | closed |
| `hover` | border `rgba(124, 138, 158, 0.5)` | same text colors | closed |
| `focus` | border `--accent-400`, focus ring `rgba(83, 151, 235, 0.1)` | label `--base-accent`, chevron up | `DropdownMenu` appears below trigger |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | label/hint `--base-error` | closed |
| `disabled` | bg `rgba(124, 138, 158, 0.15)`, transparent border | label/value `rgba(124, 138, 158, 0.8)` | closed |

| Size | Trigger height | Text | Icon | Code class |
|---|---:|---|---:|---|
| `l` | `48px` | `16/24`, weight `600` | `24px` | `.a3-select--l` |
| `m` | `36px` | `14/20`, weight `600` | `20px` | `.a3-select--m` |
| `s` | `24px` | `12/16`, weight `600` | `16px` | `.a3-select--s` |

Shared visual values:

- Width in Figma examples: `280px`.
- Radius: `6px` / `--border-radius-inputs`.
- Border width: `2px`.
- Hint text: `12/16`, weight `600`.
- Focus/open state reuses the extracted `DropdownMenu` and `Elements / Item` contracts.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Select` | `apps/frontend/src/components/ui/select.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-select*` |
| Trigger tokens | Reuses `--input-*` sizing, colors, radius, border and focus tokens |
| DropdownMenu slot | Reuses `Dropdown`, `DropdownItem` from `apps/frontend/src/components/ui/dropdown.tsx` |
| Sizes | `size="l"`, `m`, `s` |
| Error state | `invalid` prop and `aria-invalid` |
| Disabled state | native `disabled` plus `data-disabled` |
| Focus/open state | `open` / `defaultOpen` and `aria-expanded` |
| Label | `label` prop |
| Hint | `hint` prop with `aria-describedby` |
| Left icon | `leftIcon` prop |
| Options | `options` array with `label`, `value`, optional `hint`, `icon`, `disabled` |
| Form value | optional hidden input via `name` prop |

## Dropdown

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=396-1320&m=dev
- Figma node: `396:1320`
- Figma entity: `COMPONENT | DropdownMenu`
- Internal item URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=387-1282&m=dev
- Internal item node: `387:1282`
- Internal item entity: `COMPONENT_SET | Elements / Item`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

DropdownMenu:

| Property | Type | Values / default |
|---|---|---|
| `top panel#396:13` | boolean | default `false` |
| `bottom panel#396:14` | boolean | default `false` |
| `Elements / ItemsList#891:4` | slot | item list content |
| `scroll#891:5` | boolean | default `false` |
| `Swap top#892:0` | slot | optional top panel |
| `Swap bottom#892:1` | slot | optional bottom panel |

Elements / Item:

| Property | Type | Values / default |
|---|---|---|
| `prefix slot#387:5` | boolean | default `false` |
| `icon#387:6` | boolean | default `false` |
| `icon variant#387:7` | instance swap | default icon component |
| `item text#387:8` | text | default `Item text` |
| `hint text#387:9` | text | default `Hint` |
| `hint#398:15` | boolean | default `false` |
| `Swap prefix#894:29` | slot | optional prefix content |
| `type` | variant | `menu item`, `group title`, `group divider`; default `menu item` |
| `size` | variant | `m`, `s`; default `m` |
| `multiselect` | variant | `false`, `true`; default `false` |
| `selected` | variant | `false`, `true`; default `false` |
| `hover` | variant | `false`, `true`; default `false` |
| `disabled` | variant | `false`, `true`; default `false` |

### Visual Mapping

| Part / state | Size | Visual values | Code mapping |
|---|---:|---|---|
| Dropdown container | `280x212` example | bg `--neutral-0`, radius `6px`, shadow `--shadow-bottom-xl` | `.a3-dropdown` |
| Item `m` | `280x36`, inner example `256x36` | text `14/20`, weight `600`, radius `6px` | `.a3-dropdown-item--m` |
| Item `s` | `280x28` | text `12/16`, weight `600`, radius `6px` | `.a3-dropdown-item--s` |
| Default item | `m/s` | bg transparent, text `--neutral-1000`, hint `--neutral-300` | default `DropdownItem` |
| Hover item | `m/s` | bg `rgba(124, 138, 158, 0.08)` | CSS `:hover` |
| Selected item | `m/s` | bg `rgba(83, 151, 235, 0.12)`, fg `--base-accent` | `selected` prop |
| Selected hover | `m/s` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-700` | `selected` + `:hover` |
| Disabled item | `m/s` | transparent bg, fg `rgba(124, 138, 158, 0.8)` | native `disabled` |
| Multiselect | `m/s` | left check slot `16x16`; selected check uses current fg | `multiselect` + `selected` |
| Group title `m` | `280x32` | text `12/16`, weight `600`, color `--neutral-300` | `DropdownGroupTitle size="m"` |
| Group title `s` | `280x28` | same text style | `DropdownGroupTitle size="s"` |
| Divider `m` | `280x17` | 1px line `rgba(124, 138, 158, 0.25)` | `DropdownDivider size="m"` |
| Divider `s` | `280x13` | 1px line `rgba(124, 138, 158, 0.25)` | `DropdownDivider size="s"` |
| Scroll | `4x196` track, `4x81.67` thumb | track `rgba(124, 138, 158, 0.1)`, thumb `--neutral-200` | `scroll` prop |

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component `DropdownMenu` | `apps/frontend/src/components/ui/dropdown.tsx` `Dropdown` |
| Component set `Elements / Item` | `DropdownItem`, `DropdownGroupTitle`, `DropdownDivider` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-dropdown*` |
| Top panel slot | `topPanel` prop |
| Bottom panel slot | `bottomPanel` prop |
| Scroll state | `scroll` prop |
| Size variants | `size="m"`, `s` |
| Selected state | `selected` prop and `aria-checked` for multiselect |
| Multiselect state | `multiselect` prop with reserved check slot |
| Disabled state | native `disabled` plus `data-disabled` |
| Icon / prefix slots | `icon` and `prefix` props |
| Hint text | `hint` prop |

## Chips

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=234-38&m=dev
- Figma node: `234:38`
- Figma entity: `COMPONENT_SET | Chips`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `label text#234:1` | text | default `Chips` |
| `Icon#777:0` | boolean | default `false` |
| `Icon#777:33` | instance swap | default icon component |
| `action#1020:0` | boolean | default `false` |
| `action icon#1020:17` | instance swap | default action icon component |
| `size` | variant | `m`; default `m` |
| `variant` | variant | `primary`, `secondary`; default `primary` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |
| `selected` | variant | `false`, `true`; default `false` |

### Visual Mapping

| Figma state | Variant | Visual values | Code mapping |
|---|---|---|---|
| default unselected | `primary` | height `40px`, radius `24px`, bg `rgba(124, 138, 158, 0.1)`, fg `--neutral-1000` | `variant="primary"` |
| hover unselected | `primary` | bg `rgba(124, 138, 158, 0.2)` | CSS `:hover` |
| pressed unselected | `primary` | bg `rgba(124, 138, 158, 0.3)` | CSS `:active` |
| selected | `primary` | bg `--base-accent`, fg `--neutral-0` | `selected` prop |
| selected hover | `primary` | bg `--accent-600`, fg `--neutral-0` | `selected` + `:hover` |
| selected pressed | `primary` | bg `--accent-700`, fg `--neutral-0` | `selected` + `:active` |
| disabled | `primary` | bg `rgba(124, 138, 158, 0.15)`, fg `rgba(124, 138, 158, 0.8)` | native `disabled` |
| default unselected | `secondary` | bg transparent, border `rgba(124, 138, 158, 0.25)`, fg `--neutral-1000` | `variant="secondary"` |
| hover unselected | `secondary` | bg `rgba(124, 138, 158, 0.1)`, same border | CSS `:hover` |
| pressed unselected | `secondary` | bg `rgba(124, 138, 158, 0.2)`, same border | CSS `:active` |
| selected | `secondary` | bg `rgba(83, 151, 235, 0.12)`, transparent border | `selected` prop |
| selected hover | `secondary` | bg `rgba(83, 151, 235, 0.2)` | `selected` + `:hover` |
| selected pressed | `secondary` | bg `rgba(83, 151, 235, 0.3)` | `selected` + `:active` |
| disabled | `secondary` | bg transparent, border `rgba(124, 138, 158, 0.15)`, fg `rgba(124, 138, 158, 0.8)` | native `disabled` |

Shared visual values:

- Size `m`: Figma example `79x40`.
- Radius: `24px` / `--border-radius-2xl`.
- Text: Mont `16/24`, weight `600`.
- Icon and action icon slots: `24x24`.
- Horizontal padding: `16px`; gap: `8px`.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Chips` | `apps/frontend/src/components/ui/chip.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-chip*` |
| Variants | `variant="primary"`, `secondary` |
| Size | `size="m"` |
| Selected state | `selected` prop and `aria-pressed` |
| Disabled state | native `disabled` plus `data-disabled` |
| Icon slot | `icon` prop |
| Action icon slot | `actionIcon` prop |
| Default dismiss icon helper | `ChipDismissIcon` export |

## Switch

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=608-662&m=dev
- Figma node: `608:662`
- Figma entity: `COMPONENT_SET | Switch`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

| Property | Type | Values / default |
|---|---|---|
| `label#608:2` | boolean | default `true` |
| `label text#608:3` | text | default `Label` |
| `size` | variant | `s`, `xs`; default `s` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |
| `checked` | variant | `false`, `true`; default `false` |
| `label position` | variant | `right`, `left`; default `right` |

### Visual Mapping

| Figma state | Size | Track / knob | Label | Code mapping |
|---|---:|---|---|---|
| default unchecked | `s` | track `44x24`, bg `rgba(124, 138, 158, 0.25)`, knob `20x20`, radius full | `16/24`, weight `600`, `--neutral-1000` | `.a3-switch--s`, unchecked input |
| default unchecked | `xs` | track `32x18` inside `32x20`, bg `rgba(124, 138, 158, 0.25)`, knob `14x14` | `14/20`, weight `600`, `--neutral-1000` | `.a3-switch--xs`, unchecked input |
| hover unchecked | `s/xs` | track bg `rgba(124, 138, 158, 0.5)` | default label | `.a3-switch:hover` |
| checked | `s/xs` | track bg `--base-accent`, white knob translated to end | default label | `input:checked` |
| checked hover | `s/xs` | track bg `--accent-600` | default label | `input:checked` + hover |
| disabled unchecked | `s/xs` | track bg `rgba(124, 138, 158, 0.25)`, white knob | `rgba(124, 138, 158, 0.8)` | `disabled` |
| disabled checked | `s/xs` | track bg `--base-accent`, white knob | `rgba(124, 138, 158, 0.8)` | `disabled` + checked |
| label left | `s/xs` | switch after label | same as size | `labelPosition="left"` |
| label right | `s/xs` | switch before label | same as size | `labelPosition="right"` |

Shared visual values:

- Radius: `9999px` / `--border-radius-full`.
- Gap between switch and label: `6px`.
- Knob shadow: `--shadow-bottom-controls`.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `Switch` | `apps/frontend/src/components/ui/switch.tsx` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-switch*` |
| Native accessibility | `<input type="checkbox" role="switch">` inside `<label>` |
| Sizes | `size="s"`, `xs` |
| Checked state | native `checked` / `defaultChecked` |
| Disabled state | native `disabled` plus `data-disabled` |
| Label | `label` prop |
| Label position | `labelPosition="right"` or `left` |

## Segmented Control

Source:

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=627-1899&m=dev
- Figma node: `627:1899`
- Figma entity: `COMPONENT_SET | SegmentedControl`
- Segment item URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=626-11&m=dev
- Segment item node: `626:11`
- Segment item entity: `COMPONENT_SET | Elements / Segment`
- Extracted: 2026-05-27 through Figma REST node API with local `FIGMA_API_TOKEN`

### Figma Contract

SegmentedControl:

| Property | Type | Values / default |
|---|---|---|
| `size` | variant | `l`, `m`, `s`; default `m` |
| `variant` | variant | `primary`; default `primary` |
| `onlyicon` | variant | `false`, `true`; default `false` |

Elements / Segment:

| Property | Type | Values / default |
|---|---|---|
| `icon#626:4` | boolean | default `false` |
| `icon variant#626:5` | instance swap | default icon component |
| `label#626:6` | boolean | default `true` |
| `label text#626:7` | text | default `Label` |
| `variant` | variant | `primary`; default `primary` |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `selected` | variant | `false`, `true`; default `false` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |

### Visual Mapping

| Part / state | Size | Visual values | Code mapping |
|---|---:|---|---|
| Container `l` | `48px` height | bg `rgba(124, 138, 158, 0.1)`, radius `24px`, padding `6px` | `.a3-segmented-control--l` |
| Container `m` | `36px` height | bg `rgba(124, 138, 158, 0.1)`, radius `24px`, padding `4px` | `.a3-segmented-control--m` |
| Container `s` | `24px` height | bg `rgba(124, 138, 158, 0.1)`, radius `24px`, padding `2px` | `.a3-segmented-control--s` |
| Item `l` | `36px` height | text `16/24`, icon `24px`, horizontal padding `16px` | `.a3-segment--l` |
| Item `m` | `28px` height | text `14/20`, icon `24px`, horizontal padding `12px` | `.a3-segment--m` |
| Item `s` | `20px` height | text `12/16`, icon `16px`, horizontal padding `8px` | `.a3-segment--s` |
| Default item | `l/m/s` | transparent bg, fg `--neutral-1000` | unselected item |
| Hover item | `l/m/s` | bg `rgba(124, 138, 158, 0.1)` | CSS `:hover` |
| Selected item | `l/m/s` | bg `--base-accent`, fg `--neutral-0` | selected value |
| Disabled item | `l/m/s` | fg `rgba(124, 138, 158, 0.8)` | native `disabled` |
| Disabled selected | `l/m/s` | bg `rgba(124, 138, 158, 0.15)`, fg disabled | disabled + selected |
| Icon-only | `l/m/s` | label hidden, icon remains centered | `iconOnly` prop |

Implementation note:

- Figma examples show assembled controls with three visible segments, but the frontend component intentionally supports fewer or more segments through an `options` array or custom `SegmentedControlItem` children.
- When content exceeds available width, the control keeps stable segment sizes and allows horizontal overflow instead of compressing labels unpredictably.

### Frontend Mapping

| Figma part | Code target |
|---|---|
| Component set `SegmentedControl` | `apps/frontend/src/components/ui/segmented-control.tsx` `SegmentedControl` |
| Component set `Elements / Segment` | `SegmentedControlItem` |
| Visual classes | `apps/frontend/src/styles.css` `.a3-segmented-control*`, `.a3-segment*` |
| Sizes | `size="l"`, `m`, `s` |
| Icon-only state | `iconOnly` prop |
| Selected state | `value` / `defaultValue` |
| Value change | `onValueChange` |
| Form value | optional hidden input via `name` prop |
| Arbitrary count | `options` array or `children`; supports less than 3 and more than 3 segments |

## Frontend Migration Rule

Do not bulk-rewrite existing frontend component styles until each component has an extracted Figma contract. Use the accepted tokens from `token-map.md` during a controlled migration pass and verify with build plus visual QA.
