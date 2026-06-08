# Карта возможностей и roadmap A3 Pay

## Inputs Used

- `research-summary.md`
- `cjm-map.md`
- `competitive-analysis.md`
- `proto-personas.md`

## Opportunity Backlog

| Возможность | Сценарий | Пользовательская ценность | Бизнес-ценность | Сложность | Приоритет |
|---|---|---|---|---|---|
| Phone invoice | Услуги, образование, клиники, ремонт | Оплата по телефону без ручных реквизитов, с чеком | Merchant onboarding, transaction fee/SaaS | medium | P0 |
| Bills hub | ЖКХ, телеком, subscriptions | Один список счетов, напоминания, чек | Retention, recurring usage | medium | P0 |
| Unified checkout | E-commerce long-tail | Выбор СБП/карты/BNPL без лишних шагов | PSP/merchant revenue | high | P0 |
| Receipt and refund vault | E-commerce, travel, services | Понятно, где платеж и возврат | Lower support cost, trust | low-medium | P0 |
| Merchant profile by phone | Услуги и P2M | Проверка получателя до оплаты | Fraud reduction, merchant trust | medium | P0 |
| Payment plan selector | Travel, healthcare, education | Видно "сейчас / частями / кредит" | Embedded finance revenue | high | P1 |
| Safe auto deposit | Auto | Безопасный задаток и условия возврата | Dealer partnerships | high | P1 |
| Property payment companion | Недвижимость | Понятный статус эскроу/аккредитива | Bank/developer partnerships | very high | P2 |
| Loyalty-aware routing | Retail/e-commerce | Лучший способ оплаты с учетом выгоды | Conversion/AOV | high | P2 |

## ICE Matrix

| Initiative | Impact | Confidence | Ease | ICE | Notes |
|---|---:|---:|---:|---:|---|
| Phone invoice | 8 | 7 | 7 | 18.7 | Быстрый wedge для малого бизнеса. |
| Bills hub | 9 | 7 | 6 | 15.8 | Частый сценарий, но сильная конкуренция банков/Госуслуг. |
| Receipt/refund vault | 7 | 7 | 7 | 16.3 | Дешевле, усиливает trust. |
| Unified checkout | 8 | 6 | 5 | 14.4 | Больше интеграционной работы. |
| Payment plan selector | 8 | 6 | 4 | 12.0 | Зависит от BNPL/credit partners. |
| Safe auto deposit | 9 | 5 | 3 | 7.5 | Высокий чек, сложные партнерства. |
| Property companion | 10 | 4 | 2 | 5.0 | Стратегический, но не стартовый. |

## RICE Matrix

| Initiative | Reach | Impact | Confidence | Effort | RICE | Priority |
|---|---:|---:|---:|---:|---:|---|
| Phone invoice | 8 | 8 | 7 | 3 | 149.3 | P0 |
| Receipt/refund vault | 7 | 7 | 7 | 3 | 114.3 | P0 |
| Bills hub | 7 | 9 | 7 | 4 | 110.3 | P0 |
| Unified checkout | 8 | 8 | 6 | 5 | 76.8 | P0 |
| Payment plan selector | 6 | 8 | 6 | 5 | 57.6 | P1 |
| Loyalty-aware routing | 7 | 6 | 5 | 6 | 35.0 | P2 |
| Safe auto deposit | 4 | 9 | 5 | 6 | 30.0 | P1 |
| Property companion | 3 | 10 | 4 | 8 | 15.0 | P2 |

## Roadmap 12-24 месяца

| Горизонт | Product focus | Capabilities | Success metrics |
|---|---|---|---|
| 0-3 месяца | Research validation + MVP wedge | Phone invoice prototype, merchant profile, receipt vault, bills inbox concept | 20 user tests, 8 merchant interviews, payment completion intent |
| 3-6 месяцев | Service payments beta | СБП/card route, payment links, reminders, refunds, merchant dashboard | activation, paid invoices, repeat payments, support tickets |
| 6-12 месяцев | Long-tail checkout | Unified checkout, recurring mandates, linked account, basic BNPL option | checkout conversion, merchant adoption, refund SLA |
| 12-18 месяцев | Embedded finance | Payment plan selector, travel/education/healthcare pilots | AOV lift, approval rate, default/complaint rate |
| 18-24 месяца | High-ticket companion | Auto deposit, property status companion, bank partner workflows | partner pilots, safe deposits, completed high-ticket flows |

## Product Strategy

Сначала закрепиться в сценариях с высокой частотой и умеренным compliance: услуги, ЖКХ/регулярные счета, long-tail e-commerce. Затем расширяться в high-AOV вертикали через партнеров, не беря на себя custody денежных средств до появления юридической и операционной готовности.

Главная формула позиционирования: "A3 Pay превращает номер телефона в понятный платежный маршрут: счет, способ оплаты, чек, статус и возврат в одном месте".

