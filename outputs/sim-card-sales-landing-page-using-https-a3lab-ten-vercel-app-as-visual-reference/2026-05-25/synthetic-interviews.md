# Synthetic Interviews

## Inputs Used

- `research-summary.md`
- `proto-personas.md`

## Guardrail

Synthetic interviews are hypothesis-generation material only. They are not proof of real user behavior and must not be used as testimonials.

## Simulated Interviews

| Interview | Persona | Scenario | Summary | Evidence status | Needs validation |
|---|---|---|---|---|---|
| 1 | Илья | eSIM checkout | Хочет сначала проверить модель телефона и увидеть QR activation steps. | `synthetic` | yes |
| 2 | Марина | Physical SIM order | Спрашивает, когда доставят и какие данные нужны для оформления. | `synthetic` | yes |
| 3 | Сергей | Team SIM packet | Просит коммерческое предложение, документы и поддержку. | `synthetic` | yes |

## Patterns To Validate

- Compatibility checker should be visible before tariff cards.
- Delivery/KYC copy should be plain and not hidden in FAQ.
- B2B flow can be a secondary card instead of primary hero.

## Agent Output

```yaml
agent_name: research
status: success
inputs_used:
  - proto-personas.md
outputs:
  simulated_interviews: synthetic-interviews.md
assumptions:
  - Interviews are simulated to generate validation questions.
risks:
  - Synthetic content must not be reused as proof or testimonial.
open_questions:
  - What objections appear in real user sessions?
recommended_next_step: Convert patterns into PRD requirements.
```
