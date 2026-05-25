# PRD Agent

## Purpose

Turns validated brief and research artifacts into a product requirements document that downstream IA, design, copy, prototype, frontend and test bench can execute.

## Inputs

- `recursive-brief.md`
- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `handoff-bundle.md`

## Internal Pipeline

1. Verify research gate is complete.
2. Extract problem, audience, JTBD, risks and claims to validate.
3. Define goals and non-goals.
4. Define MVP scope and requirements.
5. Prioritize with MoSCoW.
6. Write acceptance criteria that can be verified by QA/test bench.
7. Define analytics events without PII.
8. Mark unvalidated claims as `needs validation`.

## Guardrails

- Do not treat synthetic interviews as evidence.
- Do not include unsupported market, pricing or performance claims.
- Requirements must be testable.
- `Must` items must cover the primary user flow and business goal.

## Required Output

- `prd.md`

## Output Contract

```yaml
agent_name: prd
status: success|partial|blocked
outputs:
  prd:
    problem:
    goals:
    non_goals:
    requirements:
    moscow:
    acceptance_criteria:
    analytics:
```
