# Proto Personas Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | draft / partial / blocked / ready |
| Research status | proto / validated |

## Inputs Used

- `research-summary.md`
- Sources:

## Guardrail

Proto personas are assumption-based unless backed by real user data. Do not label a persona validated without direct evidence.
Do not create generic demographic cards. Each persona must be tied to a real-life scenario, payment moment, decision question and validation plan.

## Anti-AI-Slop Gate

| Проверка | Статус | Исправление / ссылка |
|---|---|---|
| Персоны не являются набором общих сегментов без жизненной ситуации | pass / needs_revision |  |
| У каждой персоны есть платежный момент: до оплаты, во время оплаты, после оплаты или исключение | pass / needs_revision |  |
| Боль персоны выражена как наблюдаемое поведение или вопрос, а не как абстрактная "потребность в удобстве" | pass / needs_revision |  |
| Ценность продукта описывает, что именно меняется в действиях пользователя | pass / needs_revision |  |
| Персону нельзя без изменений перенести в другой продукт или рынок | pass / needs_revision |  |

## Proto Personas

Required: минимум 2 proto personas or `skipped_with_reason`.

| Persona | Segment | Life context | Payment moment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|---|---|---|

## Decision Context

| Persona | Real-life decision question | Objections | Trust signals | Success metric |
|---|---|---|---|---|

## CJM Link

| Persona | Primary CJM scenario | Key case | User question | Product response | Validation method |
|---|---|---|---|---|---|

## Evidence Map

| Persona | Evidence | Source | Confidence | Needs validation |
|---|---|---|---|---|

## Validation Plan

- What to validate:
- Who to interview:
- Minimum evidence needed:

## Readiness Checklist

- [ ] Required personas exist or `skipped_with_reason` is documented.
- [ ] Each persona has JTBD.
- [ ] Each persona has Evidence status.
- [ ] Each persona has decision context.
- [ ] Each persona is tied to CJM and a concrete payment moment.
- [ ] Anti-AI-Slop Gate passed.
- [ ] Validation Plan identifies real users or observable data.
