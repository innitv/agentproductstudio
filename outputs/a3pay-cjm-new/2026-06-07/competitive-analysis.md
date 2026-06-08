# Конкурентный анализ

## Использованные входные материалы

- `research-summary.md`
- `cjm-map.md`
- Tavily/web sources: Банк России, СБП/НСПК, Data Insight, ЮKassa, T-Pay/Yandex Pay public materials, BNPL market sources

## Набор конкурентов

- СБП
- Карты Мир / card acquiring
- SberPay, T-Pay, Alfa Pay, Yandex Pay
- ЮKassa and PSPs
- BNPL providers
- Госуслуги/ГИС ЖКХ
- International alias-payment analogues

## Матрица сравнения конкурентов

| Competitor | Type | Covered scenarios | Strengths | Weaknesses | Differentiation opportunity for A3 Pay |
|---|---|---|---|---|---|
| СБП | National payment rails | P2P, C2B, QR, NFC, payment link, linked account, ЖКХ | Массовость, низкая стоимость для merchant, доверие ЦБ/НСПК, 226 банков | UX зависит от банка; limited scenario orchestration; merchant/user status layer слабый | A3 Pay поверх СБП: phone invoice, status, reminders, receipts, refunds |
| Карты Мир / card acquiring | Card network and acquiring | Retail, e-commerce, subscriptions, travel | Привычность, POS coverage, chargeback/refund rails | Merchant fees, card data, settlement delay, card lifecycle | Rail fallback and routing by context |
| SberPay | Bank/ecosystem Pay | Sber clients, e-commerce, offline QR/NFC | Сильная клиентская база, loyalty, ecosystem | Lock-in, конкуренция с ЦБ по QR, не neutral | Cross-bank merchant-neutral phone payment |
| T-Pay / T-Bank | Bank Pay + ecosystem | Online/offline pay, travel, BNPL via Долями | UX, cashback, travel ecosystem, BNPL | Focus on own bank/ecosystem | Multi-bank and multi-rail orchestration |
| Yandex Pay / Сплит | Pay + BNPL | E-commerce, travel, services | Checkout UX, embedded BNPL, Яндекс ecosystem | Ecosystem boundaries, regulatory pressure on BNPL | A3 Pay as neutral selector across rails |
| ЮKassa | Payment aggregator | Merchant checkout, cards, SБП, Pay-сервисы, BNPL | Большая merchant base, APIs, payment methods | Merchant-first, not user identity/product across scenarios | User-owned receipt/status and phone alias |
| CloudPayments/Robokassa/PayMaster | PSP/acquiring | Online merchants | APIs, ready integrations | Commodity checkout, limited user journey | Scenario-specific payment intelligence |
| Долями/Сплит/Подели/Плати частями | BNPL | E-commerce, travel, high AOV retail | Affordability, AOV lift | Regulation, limits, credit-risk perception | Present BNPL as one choice in payment plan |
| Госуслуги/ГИС ЖКХ | Public payment portal | Fees, ЖКХ, госуслуги | Official source, trust, public services | Narrow domain; UX fragmented from private payments | Bring public-like status/receipt UX to private services |
| Международные аналоги: Pix, UPI, Bizum, PayNow | Faster payment/alias systems | Alias payments, QR, P2P/P2M | Phone/ID alias, ubiquity, instant payments | Local context differs; regulation and adoption path vary | Validate alias-led UX and merchant onboarding patterns |

## Покрытие сценариев

| Scenario | СБП | Banks/Pay | PSP | BNPL | Госуслуги | A3 Pay target |
|---|---|---|---|---|---|---|
| P2P/phone transfer | strong | strong | weak | none | weak | medium |
| Merchant phone invoice | medium | medium | medium | weak | none | strong |
| ЖКХ recurring | medium | strong | weak | none | strong | strong |
| E-commerce checkout | growing | strong | strong | strong | none | strong |
| Travel high AOV | medium | strong | medium | strong | none | medium |
| Auto deal payment | weak | medium | weak | credit only | medium via docs | medium |
| Real estate payment | weak | bank-led | weak | none | registry status only | companion only |

## Стратегические выводы

- СБП - не конкурент, а базовый rail. A3 Pay лучше строить как UX and orchestration layer.
- Банковские Pay-сервисы сильны, но замкнуты. Дифференциация A3 Pay - нейтральность и сценарная широта.
- PSP закрывают merchant checkout, но не создают user-owned payment memory across scenarios.
- BNPL полезен как embedded option, но не должен быть ядром из-за регулирования и ограничения high-ticket применения.
