# Visual Reference Review Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | passed / passed_with_notes / blocked |
| Owner | qa-review |

## Inputs Used

- `reference-analysis.md`
- `design-brief.md`
- `screens.md`
- `figma-handoff-bundle.md`, если Figma canvas был создан или обновлен
- `frontend-result.md`
- Reference URL
- Local URL
- Figma file/node URL, если применимо

## Source Pair Matrix

| Pair | Required | Evidence | Status | Notes |
|---|---|---|---|---|
| `reference_to_figma` | yes / no | reference screenshots/cards; Figma node IDs; Figma screenshot/object inventory | passed / passed_with_notes / accepted_difference / blocked / not_applicable |  |
| `figma_to_frontend` | yes / no | Figma screenshot/node IDs; frontend screenshots; DOM/locator map; deviations | passed / passed_with_notes / accepted_difference / blocked / not_applicable |  |
| `reference_to_frontend` | yes / no | paired screenshots; `visual-diff-result.json`; section diff | passed / passed_with_notes / accepted_difference / blocked / not_applicable |  |
| `spec_to_frontend_behavior` | yes / no | prototype state inventory; Playwright interactions; traces/screenshots | passed / passed_with_notes / accepted_difference / blocked / not_applicable |  |

## Screenshot Set

| Screenshot | Path | Viewport | Capture type |
|---|---|---|---|

## Full-Site Comparison

| Area | Reference pattern | Figma result | Frontend result | Status |
|---|---|---|---|---|
| Header |  |  |  |  |
| Hero |  |  |  |  |
| Sections |  |  |  |  |
| Cards / components |  |  |  |  |
| CTA / controls |  |  |  |  |
| Media |  |  |  |  |
| Footer |  |  |  |  |
| Mobile layout |  |  |  |  |

## Gaps Found

## Corrections Made

## Remaining Differences

## Gate Result

Вердикт не может быть выше `passed_with_notes`, если доступен Figma output, но нет `reference_to_figma` или `figma_to_frontend` evidence. Вердикт `passed` запрещен без screenshot evidence и без проверки основных states/behavior для интерактивных поверхностей.
