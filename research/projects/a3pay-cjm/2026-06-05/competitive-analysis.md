# Competitive Analysis

## Artifact Metadata

Status: ready

## Inputs Used

- `research-summary.md`
- Tavily provider output when configured

## Competitor Set

| Name | Type | Source URL | Last Verified | Evidence Status |
|---|---|---|---|---|
| A3 — сервис электронных платежей и эквайринга для бизнеса | market alternative | https://www.a-3.ru | 2026-06-06T07:43:00.639Z | source-backed |

## Comparison Matrix

| Конкурент / альтернатива | Давление на сценарий | Claim | Evidence | Confidence |
|---|---|---|---|---|
| A3 — сервис электронных платежей и эквайринга для бизнеса | ЖКХ, налоги, штрафы и регулярные услуги | платежей, направление получателям платежей информации о результатах проведения платежей. [...] ООО «Платёжный сервис А3» аккредитовано в качестве организации, осуществляющей деятельность в области информационных технолог | https://www.a-3.ru | low |

## Scenario Opportunity Map

| Сценарий | Главное трение | Ответ продукта | Приоритет |
|---|---|---|---|
| ЖКХ, налоги, штрафы и регулярные услуги | Начисления разбросаны по приложениям, реквизиты и статусы расходятся. | Корзина проверенных счетов, напоминания, выбор платежного маршрута и статус принятия поставщиком. | P0 |
| Подписки и повторные списания | Пользователь боится скрытых списаний, а продавец теряет платежи из-за ошибок и отказов. | Центр подписок: мандаты, лимиты, пауза/отмена, умные повторы и резервный способ оплаты. | P0 |
| Путешествия | Несколько поставщиков, предоплаты, изменения, возвраты и групповые платежи. | Платежный маршрут поездки: план платежей, запросы разделения суммы, трекер возвратов и статусов. | P1 |
| Авто: покупка, импорт и владение | Дилер/брокер/таможня/страховка/сервис требуют разные платежи и подтверждения. | Калькулятор, этапные платежи, хранилище чеков и проверенные запросы на оплату по этапам. | P1 |
| Недвижимость | Крупный чек, много регулируемых участников, высокий риск ошибки и мошенничества. | Payment companion: чек-лист платежей, verified requests, статусы банка/реестра/поставщиков. | P2 |
| Повседневные покупки | Сохраненные карты уже сильны; СБП/кошелек/BNPL конкурируют за кнопку оплаты. | Выбор лучшего способа оплаты, loyalty/BNPL-брокер и трекер чеков/возвратов там, где есть явная выгода. | P1 |

## Takeaways

- Keep competitor claims conservative until source-backed comparison is complete.
- Use this analysis to identify trust, pricing, proof and CTA patterns for PRD and IA.

## Strategic Risks

- Competitor set may be incomplete if Tavily returned few or no relevant sources.

## Differentiation Opportunities

- Clarify process, constraints and proof points earlier than generic alternatives.

## Readiness Checklist

- [ ] At least 3 competitor or alternative sources captured.
