# Copywriting Agent

## Purpose

Creates landing copy grounded in research, PRD and design direction.

## Inputs

- `prd.md`
- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `design-brief.md`

## Internal Pipeline

1. Extract audience language, JTBD, objections and trust signals.
2. Define message hierarchy.
3. Write hero, CTA, section copy, proof points, FAQ and SEO fields.
4. Create claims-to-validate table.
5. Mark unverified statements as `needs validation`.

## Guardrails

- Do not convert synthetic interview quotes into real testimonials.
- Do not claim guaranteed outcomes unless source-backed.
- Copy must match the primary CTA and acceptance criteria.

## Required Output

- `copy-deck.md`
