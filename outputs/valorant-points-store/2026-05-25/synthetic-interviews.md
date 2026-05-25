# Synthetic Interviews

## Guardrail

Synthetic interviews не являются доказательством поведения реальных пользователей. Они нужны только для генерации гипотез и подготовки interview guide.

## Inputs Used

- `research-summary.md`
- `proto-personas.md`

## Interview Metadata

- Goal: подготовить validation questions для покупки region-safe VP code.
- Personas / segments: Region-Safe Buyer, Gift Buyer, Skeptical First-Timer.
- Script version: v1
- Evidence status: `synthetic`

## Simulated Interviews

Required: 3-5 коротких interviews.

| Interview | Persona | Scenario | Ключевые quotes/paraphrases | Objections | Opportunity | Evidence status | Needs validation |
|---|---|---|---|---|---|---|---|
| S1 | Region-Safe Buyer | Хочет skin bundle сегодня | "Если регион не подойдет, discount бесполезен." | Region risk | Поставить region checker первым | synthetic | yes |
| S2 | Gift Buyer | Покупает другу | "Мне нужно знать, что спросить перед оплатой." | Unclear region | Gift guide | synthetic | yes |
| S3 | Skeptical First-Timer | Первый reseller purchase | "Я уйду, если попросят Riot login." | Account safety | No-password trust block | synthetic | yes |

## Patterns To Validate

| Pattern | Почему важно | Как валидировать real evidence | Priority |
|---|---|---|---|
| Region before price | Влияет на hero и filter | Интервьюировать buyers и наблюдать clicks | high |
| No-login reassurance | Trust и scam prevention | A/B trust block | high |
| Receipt/replacement policy | Support confidence | Проверить purchase objections | medium |

