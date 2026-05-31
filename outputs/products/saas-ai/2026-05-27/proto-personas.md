# Proto Personas

## Artifact Metadata

Status: ready

## Inputs Used

- `research-summary.md`

## Guardrail

Proto personas are assumption-based unless backed by real user data. Do not label a persona validated without direct evidence.

## Proto Personas

| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|---|
| Рациональный покупатель | Потенциальный покупатель продукта из запроса | Сравнить варианты и безопасно оставить заявку. | Product need from query | Неясные условия и сомнения в достоверности claims. | Понятная ценность, условия и быстрый контакт. | proto |
| Операционный координатор | Операционный или B2B-покупатель | Проверить, выдержит ли решение повторяемый процесс. | Product need from query | Нужно согласовать документы, сроки и поддержку. | Управляемый процесс и меньше ручной координации. | needs validation |

## Decision Context

| Persona | Buying context | Objections | Trust signals | Success metric |
|---|---|---|---|---|
| Рациональный покупатель | Online comparison before action | Needs proof, price and constraints | Sources, process clarity, support | Can explain offer and next step |
| Операционный координатор | Online comparison before action | Needs proof, price and constraints | Sources, process clarity, support | Can explain offer and next step |

## Evidence Map

| Persona | Evidence | Source | Confidence | Needs validation |
|---|---|---|---|---|
| Рациональный покупатель | proto | research-summary.md | low | yes |
| Операционный координатор | needs validation | research-summary.md | low | yes |

## Validation Plan

- What to validate: segment fit, objections, decision language and trust signals.
- Who to interview: target buyers matching the primary segment and operational/B2B segment.
- Minimum evidence needed: 5-7 interviews or observable funnel data before treating personas as validated.
