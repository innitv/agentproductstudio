# CJM map: A3Pay payment scenarios in Russia

| Поле | Значение |
|---|---|
| Artifact status | `ready_for_figma` |
| Inputs used | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md` |

## Master journey model

| Phase | User question | Payment friction | A3 Pay role |
|---|---|---|---|
| Trigger | Что нужно оплатить и почему сейчас? | Уведомления разбросаны по apps/channels. | Unified obligation feed, reminders, provider verification. |
| Calculation | Сколько всего стоит? | Итоговая сумма складывается из нескольких платежей. | Calculator, basket, itemized payment plan. |
| Recipient trust | Кому я плачу? | Реквизиты, мошенничество, ошибки назначения. | Verified recipient by phone/provider ID. |
| Method choice | Чем выгоднее/можно оплатить? | Card, СБП, wallet, BNPL, installment, limits. | Rail selector and fallback. |
| Confirmation | Платеж прошел? | Статус у банка и поставщика расходится. | Payment proof + provider acceptance status. |
| Aftercare | Что дальше? | Возвраты, доплаты, повторные платежи. | Timeline, recurring mandate, refund tracker. |

## Scenario 1: Недвижимость

| Step | Actors | Pain | A3 Pay insertion |
|---|---|---|---|
| Поиск объекта и расчёт бюджета | Buyer, seller, bank, realtor | Неочевидны все допрасходы. | Cost checklist: задаток, оценка, страховка, госпошлины, аккредитив/эскроу. |
| Бронирование / задаток | Buyer, seller/realtor | Trust risk and receipt ambiguity. | Verified request-to-pay with contract/order ID. |
| Ипотека / документы | Bank, notary, Rosreestr | УКЭП, документы, сроки регистрации. | Status companion; no replacement of registry/bank flow. |
| Основной расчет | Bank, buyer, seller | High trust, high compliance. | Partner-led status view for аккредитив/эскроу, not direct P2P. |
| Ownership payments | УК, insurance, taxes | Регулярные обязательства после сделки. | Auto bill onboarding and reminders. |

**Priority:** P2 for core transaction, P0/P1 for post-purchase service payments.

## Scenario 2: Авто purchase/import/ownership

| Step | Actors | Pain | A3 Pay insertion |
|---|---|---|---|
| Выбор авто / расчет | Buyer, dealer, broker | Полная стоимость меняется из-за курса, пошлин, доставки. | Auto payment calculator and reserve estimate. |
| Предоплата | Buyer, broker/dealer | Trust, fraud, unclear terms. | Verified request-to-pay, staged hold/status. |
| Таможня / утильсбор | Buyer, FTS, broker | Реквизиты, ЕЛС, документы, дедлайны. | Payment checklist, receipt vault, partner workflow. |
| ЭПТС / СБКТС / доставка | Broker, labs, logistics | Разные получатели и этапы. | Milestone payments and notifications. |
| Владение | Insurance, tax, штрафы, service | Регулярные и episodic payments. | Auto owner payment hub. |

**Priority:** P1 because friction is high and phone/request-to-pay can reduce manual coordination.

## Scenario 3: Travel

| Step | Actors | Pain | A3 Pay insertion |
|---|---|---|---|
| Booking | User, OTA, airline, hotel | Multiple providers, price changes. | Multi-provider checkout and payment link. |
| Add-ons | Airline, insurer, eSIM, transfer | Доплаты scattered across emails/apps. | Travel payment itinerary. |
| Trip changes | Provider, user | Refund uncertainty. | Refund/status tracker. |
| Group travel | Friends/family | Split and collect money. | Phone-based split payment requests. |

**Priority:** P1 with partner-led launch in bank/travel apps.

## Scenario 4: Госуслуги / ЖКХ

| Step | Actors | Pain | A3 Pay insertion |
|---|---|---|---|
| Начисление | Provider, ГИС ЖКХ, user | Не все начисления видны одинаково. | Aggregated verified bill feed. |
| Проверка | User, УК/РСО | Ошибки счетов и реквизитов. | Highlight provider data, status and anomalies. |
| Оплата | User, bank/SBP/card | Несколько счетов, разные суммы. | Basket payment and rail selector. |
| Подтверждение | Provider, user | Статус “банк списал” не равен “поставщик принял”. | Provider acceptance status. |
| Повтор | User/family | Забывание, просрочки. | Reminders, recurring mandates, family payer. |

**Priority:** P0.

## Scenario 5: Everyday purchases

| Step | Actors | Pain | A3 Pay insertion |
|---|---|---|---|
| Checkout | User, merchant | Saved methods already strong. | A3 Pay button only where provider network/loyalty matters. |
| Payment choice | User | Cashback/fee/method confusion. | Best-method selector. |
| Receipt/refund | Merchant, user | Refund status. | Receipt vault and refund tracker. |

**Priority:** P1/P2 unless connected to service payment basket, loyalty or BNPL.

## Scenario 6: Subscriptions / recurring

| Step | Actors | Pain | A3 Pay insertion |
|---|---|---|---|
| Subscribe | User, merchant | User fears hidden recurring charge. | Transparent mandate and next charge preview. |
| Charge | Merchant, bank | Failed payments and churn. | Smart retries and fallback rail. |
| Control | User | Cancel/pause hard to find. | Subscription control center. |
| Family/team | User/family | Кто за что платит. | Shared payer and delegated payment. |

**Priority:** P0.

## ICE/RICE backlog

| Initiative | Scenario | Reach | Impact | Confidence | Effort | RICE | Priority |
|---|---|---:|---:|---:|---:|---:|---|
| Verified bill basket + reminders | ЖКХ/gov | 5 | 4 | 4 | 2 | 40 | P0 |
| Phone request-to-pay with provider verification | Service payments | 4 | 4 | 4 | 2 | 32 | P0 |
| Recurring mandate control center | Subscriptions | 4 | 4 | 3 | 2 | 24 | P0 |
| Provider status/proof-of-payment API | ЖКХ/gov/merchants | 3 | 5 | 3 | 3 | 15 | P1 |
| BNPL/installment selector | Everyday/travel | 3 | 4 | 3 | 3 | 12 | P1 |
| Travel payment itinerary | Travel | 2 | 4 | 3 | 3 | 8 | P1 |
| Auto staged payment tracker | Auto | 2 | 5 | 3 | 4 | 7.5 | P1 |
| Real estate payment companion | Real estate | 1 | 5 | 2 | 5 | 2 | P2 |

## 12-24 month roadmap

| Horizon | Product focus | Outcome |
|---|---|---|
| 0-3 months | Research validation, partner interviews, service-payment MVP scope | Confirm P0 use cases and API feasibility. |
| 3-6 months | Bill basket, verified phone requests, provider status MVP | Increase repeat payments and reduce payment-status support. |
| 6-12 months | Recurring mandates, family/delegated payments, smart retries | Build retention loop and recurring payment share. |
| 12-18 months | BNPL broker, travel itinerary, auto payment milestones | Expand into higher-AOV multi-party scenarios. |
| 18-24 months | Real estate companion and bank/notary partnerships | Enter high-trust, low-frequency scenarios without replacing regulated actors. |
