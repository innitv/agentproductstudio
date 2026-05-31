# Proto Personas

## Inputs Used

- `research-summary.md`

## Guardrail

Proto personas основаны на допущениях, пока они не подтверждены реальными интервью или behavioral data.

## Proto Personas

Required: минимум 2 proto personas.

| Persona | Segment | JTBD | Trigger | Pain | Желаемый результат | Evidence status |
|---|---|---|---|---|---|---|
| Region-Safe Buyer | Competitive player | Купить VP code, который подойдет аккаунту | Skin bundle / night market | Wrong region, scam | Redeem code самостоятельно | proto |
| Gift Buyer | Gift buyer | Подарить VP без входа в аккаунт друга | Birthday / team gift | Не знает регион | Купить правильный code + receipt | proto |
| Skeptical First-Timer | New buyer | Проверить, что магазин не просит пароль | First third-party purchase | Боится аккаунт-скама | No-login flow и понятная support policy | proto |

## Decision Context

| Persona | Контекст покупки | Objections | Trust signals | Success metric |
|---|---|---|---|---|
| Region-Safe Buyer | Быстро перед покупкой скина | Region mismatch | Region badge, receipt, seller policy | Click package после region check |
| Gift Buyer | Покупает другому | Wrong account region | Region guide и gift flow | Starts checkout |
| Skeptical First-Timer | Сравнивает с official | "Это безопасно?" | Disclaimer, no password, official redeem instructions | Reads safety section |

## Evidence Map

| Persona | Evidence | Source | Confidence | Needs validation |
|---|---|---|---|---|
| Region-Safe Buyer | Region lock важен | Riot Support | high | interview priority |
| Gift Buyer | Gift/code flow правдоподобен | Riot Support + hypothesis | medium | validate |
| Skeptical First-Timer | No-login trust hypothesis | synthetic | low | validate |

## Validation Plan

- Что валидировать: страх ошибки региона, no-login trust, понятность gift flow.
- Кого интервьюировать: 5-8 игроков VALORANT, которые покупали VP или gift cards.
- Минимум evidence: 5 реальных interviews или support/search query data.

