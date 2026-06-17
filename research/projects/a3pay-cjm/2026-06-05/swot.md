# SWOT

## Artifact Metadata

Status: ready

## Inputs Used

- `research-summary.md`
- `competitive-analysis.md`

## SWOT

| Quadrant | Item | Evidence | Confidence | Implication |
|---|---|---|---|---|
| Strength | A3 Pay как слой оркестрации платежных обязательств, статусов и способов оплаты, а не отдельный кошелек | Provider coverage and source-backed findings | medium | Use this as PRD/IA/design framing |
| Weakness | Сильнейший сценарий пока требует validation: ЖКХ, налоги, штрафы и регулярные услуги | Evidence status: source-backed | medium | Keep claims scoped until user/partner validation |
| Opportunity | Корзина проверенных счетов и напоминаний; Центр регулярных платежей и лимитов | Opportunity score and scenario synthesis | medium | Start roadmap from highest repeatability and trust leverage |
| Threat | Unsourced market claims can leak into PRD or copy | DeepSeek/Gemini guardrail and validation plan | high | Block success until claims are validated |

## Strategic Notes

- Treat Tavily as source-backed evidence provider, and DeepSeek/Gemini as contradiction, check and strategic synthesis providers.
- Дизайн должен сохранить роль продукта: Проверенный получатель и понятное назначение платежа..

## Strategic Decisions

- Downstream PRD should inherit `partial` if default provider coverage is incomplete.

## Risks

- No additional provider risks recorded.

## Readiness Checklist

- [x] Default multi-source research coverage passed.
