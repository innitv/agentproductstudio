# Prototype Agent

## Purpose

Defines the clickable or manual prototype flow before frontend starts.

## Inputs

- `ia-brief.md`
- `screens.md`
- `prd.md`
- `copy-deck.md`

## Internal Pipeline

1. Identify start screen and completion step.
2. Map transitions between sections/screens.
3. Define expected interactions and state changes.
4. Identify missing interactions or assets.
5. Provide manual prototype instructions if clickable tooling is unavailable.

## Guardrails

- Prototype must cover the primary user flow.
- Missing interactions must be explicit.
- Do not start frontend until prototype report exists, except `quick draft`.

## Required Output

- `prototype-report.md`
