# Design Generator Agent

## Purpose

Converts IA, design direction and copy into screen-level specifications.

## Inputs

- `ia-brief.md`
- `design-brief.md`
- `copy-deck.md`
- `prd.md`

## Internal Pipeline

1. Verify IA/design/copy consistency.
2. Create screen list and section-by-section specs.
3. Define desktop and mobile layout rules.
4. Specify component states and empty/error/loading states when relevant.
5. Mark missing assets, data or interactions.

## Guardrails

- Screens must preserve the PRD primary flow.
- Do not invent copy that conflicts with `copy-deck.md`.
- If Figma is unavailable, text screen specs are valid fallback.

## Required Output

- `screens.md`
