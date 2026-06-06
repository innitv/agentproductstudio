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
| Регулярный плательщик | Регулярный плательщик семьи | Оплатить обязательство без ручного ввода реквизитов и проверить, что поставщик принял платеж. | Product need from query | Начисления разбросаны по приложениям, реквизиты и статусы расходятся. | Корзина проверенных счетов, напоминания, выбор платежного маршрута и статус принятия поставщиком. | proto |
| Контролирующий подписки | Пользователь с повторными цифровыми сервисами | Разрешить регулярный платеж и контролировать будущие списания. | Product need from query | Пользователь боится скрытых списаний, а продавец теряет платежи из-за ошибок и отказов. | Центр подписок: мандаты, лимиты, пауза/отмена, умные повторы и резервный способ оплаты. | proto |
| Организатор поездки | Путешественник или организатор поездки | Оплатить поездку, доплаты, страховку и возвраты в одном понятном маршруте. | Product need from query | Несколько поставщиков, предоплаты, изменения, возвраты и групповые платежи. | Платежный маршрут поездки: план платежей, запросы разделения суммы, трекер возвратов и статусов. | proto |

## Decision Context

| Persona | Buying context | Objections | Trust signals | Success metric |
|---|---|---|---|---|
| Регулярный плательщик | Online comparison before action | Needs proof, price and constraints | Sources, process clarity, support | Can explain offer and next step |
| Контролирующий подписки | Online comparison before action | Needs proof, price and constraints | Sources, process clarity, support | Can explain offer and next step |
| Организатор поездки | Online comparison before action | Needs proof, price and constraints | Sources, process clarity, support | Can explain offer and next step |

## Evidence Map

| Persona | Evidence | Source | Confidence | Needs validation |
|---|---|---|---|---|
| Регулярный плательщик | proto | research-summary.md | low | yes |
| Контролирующий подписки | proto | research-summary.md | low | yes |
| Организатор поездки | proto | research-summary.md | low | yes |

## Validation Plan

- What to validate: segment fit, objections, decision language and trust signals.
- Who to interview: target buyers matching the primary segment and operational/B2B segment.
- Minimum evidence needed: 5-7 interviews or observable funnel data before treating personas as validated.
