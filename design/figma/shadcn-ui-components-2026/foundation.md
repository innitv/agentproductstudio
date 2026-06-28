# Foundation: shadcn-ui-components-2026

## Статус

`foundation_summary_indexed`

## Inputs Used

- Read-only Plugin API variable/style census.
- Representative `Button` design context, node `402:654`.
- Focused variable audit in `_scan/variable-audit.md`.

## Token Architecture

Система хранит Tailwind-oriented primitives и shadcn semantic variables внутри Figma Variables:

- Tailwind utility collections: `tw/colors`, `tw/padding`, `tw/space`, `tw/border-radius`, `tw/margin`, `tw/border-width`, `tw/gap`, `tw/stroke-width`, `tw/font`, `tw/height`, `tw/max-height`, `tw/max-width`, `tw/opacity`.
- Semantic shadcn collection: `tokens`.
- Mode-aware semantic layer: `mode` with `light mode` and `dark mode`.
- Radix-like color layer: `rdx/colors` with `light mode` and `dark mode`.

## Variable Collections

| Collection | Modes | Variables | Use |
|---|---|---:|---|
| `tokens` | `Mode 1` | 89 | shadcn CSS variables such as background, foreground, border, radius, primary, secondary. |
| `mode` | `light mode`, `dark mode` | 47 | Theme-mode semantic values. |
| `rdx/colors` | `light mode`, `dark mode` | 396 | Radix-like color ramps for themeable surfaces. |
| `tw/colors` | `Mode 1` | 244 | Tailwind color primitives. |
| `tw/font` | `Mode 1` | 47 | Font family, weight, leading, tracking, size variables. |
| `tw/space`, `tw/gap`, `tw/padding`, `tw/margin` | `Mode 1` | 660 total | Spacing and layout utility variables. |
| `tw/border-radius`, `tw/border-width`, `tw/stroke-width` | `Mode 1` | 205 total | Shape and stroke utility variables. |
| `tw/height`, `tw/max-height`, `tw/max-width` | `Mode 1` | 110 total | Sizing utilities. |
| `tw/opacity` | `Mode 1` | 21 | Opacity utilities. |

## Styles

| Style type | Count | Notes |
|---|---:|---|
| Text styles | 117 | Includes shadcn/Tailwind style names such as `Text-4xl/Semi Bold`, `Text-base/Regular`, `Text-sm/Medium` in representative output. |
| Effect styles | 27 | Representative context includes `Box Shadow/shadow-xs`. |
| Paint styles | 0 | Colors are variable-driven, not paint-style-driven. |

## Representative Button Token Evidence

`get_design_context` for `402:654` exposed these CSS variable patterns:

- Color: `--background`, `--foreground`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--border`, `--accent`, `--accent-foreground`.
- Radius: `--radius-lg`, `--radius-md`, `--radius-full`, `--rounded-3xl`, `--rounded-md`.
- Spacing: `--gap-4`, `--gap-2`, `--px-4`, `--px-3`, `--py-2`, `--space-y-10`.
- Typography: `--family/sans`, `--size/4xl`, `--size/base`, `--size/sm`, `--weight/semibold`, `--weight/medium`, `--leading/10`, `--leading/6`, `--leading/5`, `--tracking/normal`.

## Reuse Guidance

- Для Figma build: использовать эту систему как source для shadcn-style screens, особенно когда нужен Tailwind/shadcn визуальный язык.
- Для frontend mapping: не вставлять сгенерированный Tailwind код напрямую; сначала сопоставлять с локальным frontend stack и CSS/token conventions.
- Для theme work: начинать с `tokens`, `mode`, `rdx/colors`; Tailwind utility collections использовать как raw implementation layer.
- Для dark mode: считать `mode` и `rdx/colors` главными mode-aware sources.

## Variable Audit Summary

- Подробный аудит сохранен в `_scan/variable-audit.md`.
- `mode` и `rdx/colors` — единственные collections с `light mode` / `dark mode`.
- `tokens` содержит raw numeric primitives, а не semantic color tokens.
- Большинство collections не имеют WEB code syntax; исключения: `tw/opacity` полностью, `tw/max-width` частично.
- Цветовые collections (`tw/colors`, `mode`, `rdx/colors`) используют `ALL_SCOPES`, что допустимо для read-only reuse, но является debt для производной production-библиотеки.

## Gaps

- Полные значения 1819 variables не выгружались в этот индекс, чтобы не хранить raw dump. Для конкретного token mapping выполнять targeted read по collection/variable name.
- Перед approved Figma write в производную библиотеку нужно сузить `ALL_SCOPES` и добавить WEB code syntax.
