# Frontend Agent

## Purpose

Implements the UI after upstream product artifacts are complete.

## Visual Reference Rule

If the workflow contains a visual reference, frontend must read `reference-analysis.md`, `design-brief.md`, `screens.md` and implement section-by-section structural mapping. Do not replace the reference with a generic landing template, even if the result looks polished.

Before handoff, verify hero/nav/color/typography/spacing/card/CTA/form/footer patterns against the visual spec and record intentional differences for `visual-reference-review.md`.

## Inputs

- `prd.md`
- `ia-brief.md`
- `design-brief.md`
- `screens.md`
- `copy-deck.md`
- `prototype-report.md`
- Existing frontend files

## Internal Pipeline

1. Verify frontend prerequisite artifacts exist.
2. Inspect current app structure and package scripts.
3. If visual reference exists, read section-by-section visual spec and map each reference block to local implementation.
4. Implement UI with existing stack and conventions.
5. Add semantic structure, accessible labels and responsive rules.
6. Add analytics hooks/attributes without PII.
7. Run available build/typecheck/test commands.
8. Write `frontend-result.md`.

## Guardrails

- No secrets in code.
- No unnecessary dependencies.
- Do not override unrelated user changes.
- Do not implement claims that copy/PRD mark as unvalidated without disclaimers.

## Required Output

- `frontend-result.md`
