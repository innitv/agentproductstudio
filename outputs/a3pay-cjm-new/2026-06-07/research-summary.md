# Research Summary: A3 Pay и платежные сценарии России

## Artifact Metadata

| Field | Value |
|---|---|
| Status | partial |
| Research mode | deep_research |
| Evidence level | source-backed + hypotheses |
| Readiness score | 0.78 |

## Inputs Used

- `recursive-brief.md`
- `run-plan.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- Tavily/web searches от `2026-06-07`
- Источники: Банк России, СБП/НСПК, Data Insight, Коммерсантъ, РБК, Ведомости, отраслевые страницы банков/экосистем

## Source Policy

| Provider | Requested | Used | Sources count | Validation state | Notes |
|---|---:|---:|---:|---|---|
| tavily | yes | yes | 20+ | pass | Использован для поиска и source scan. |
| web search | yes | yes | 10+ | pass | Использован для official/current facts. |
| deepseek | yes | no | 0 | needs_validation | Cross-check не выполнен в текущей сессии. |
| gemini | yes | no | 0 | needs_validation | `workflow:doctor` предупредил об optional provider config. |

## Research Questions

| Question | Status | Answer summary |
|---|---|---|
| Какие способы оплаты используют пользователи? | answered_with_limitations | Карты, СБП/QR, банковские приложения, переводы, BNPL, loyalty, cash and sector-specific rails. |
| Где возникают разрывы UX? | answered_with_limitations | Выбор rail, доверие к получателю, статус, чек, возврат, регулярность, многосторонние сделки. |
| Где A3 Pay может интегрироваться? | answered_with_limitations | Phone invoice, bills hub, checkout, refunds, payment plans, high-ticket companion. |

## Audience

| Segment | Context | Motivation | Barrier | Evidence status |
|---|---|---|---|---|
| Regular bill payer | ЖКХ, телеком, subscriptions | Оплатить вовремя и сохранить чек | Разные кабинеты | source-informed hypothesis |
| Small merchant/service | Услуги и предоплаты | Формализовать оплату | Нет простого invoice/status | source-informed hypothesis |
| E-commerce/travel buyer | Online checkout and high AOV | Выбрать безопасный и выгодный способ | Возвраты и BNPL условия | source-informed hypothesis |
| High-ticket buyer | Auto/real estate | Безопасно провести крупный платеж | Документы и много сторон | needs_validation |

## Jobs To Be Done

| Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|
| Regular bill payer | Когда приходит счет, я хочу оплатить его без ошибки и сохранить подтверждение | Квитанция/срок | Потеря счета | Оплата + чек + напоминание | source-informed |
| Small merchant | Когда клиент готов платить, я хочу отправить формальный счет по телефону | Заказ/бронь | Перевод на карту | Invoice and status | hypothesis |
| Buyer | Когда checkout предлагает много способов, я хочу выбрать лучший | Покупка | Недоверие/возврат | Clear rail selector | source-informed |

## Proto Personas

См. `proto-personas.md`; кратко: Анна, Сергей, Мария, Алексей.

## Synthetic Interviews

См. `synthetic-interviews.md`; используются только как hypotheses, not evidence.

## Research Validation Plan

| Hypothesis | Who to interview or observe | Minimum evidence | Decision unlocked | Status |
|---|---|---|---|---|
| Phone invoice increases trust | 5 merchants + 5 customers | 70% understand and prefer formal invoice vs card transfer | MVP wedge | planned |
| Bills hub drives repeat use | 5 regular bill payers | 3+ remembered bills and willingness to connect account | Retention strategy | planned |
| Refund vault reduces anxiety | 4 e-commerce/travel buyers | Clear comprehension in prototype | Checkout scope | planned |

## Executive Summary

Российская платежная экосистема уже массово безналичная: Банк России указывает 88% долю безналичных платежей в розничном обороте по итогам 2025 года, 31 платежную систему и 353 оператора по переводу денежных средств на 1 января 2026 года. Карты остаются базовым способом, но доля альтернативных сценариев быстро растет: СБП, QR, банковские Pay-сервисы, BNPL, привязанные счета, payment links и биометрия.

A3 Pay имеет наибольший шанс не как "еще один способ оплаты", а как слой orchestration: пользователь платит по номеру телефона, а продукт выбирает или предлагает rails под контекст: СБП, карта, счет, рассрочка, кредит, loyalty, invoice, recurring mandate, escrow/accreditive status. Главная возможность - закрыть разрывы между платежом, подтверждением, возвратом, регулярностью, несколькими участниками и reconciliation.

## Market Facts

| Fact | Evidence | Product implication |
|---|---|---|
| Безналичный оборот стал нормой, но инструменты фрагментируются. | Банк России: 88% безналичных платежей в розничном обороте по итогам 2025 года; 476,5 млн карт Мир; СБП 226 банков-участников на 1 мая 2026. https://cbr.ru/PSystem/ | A3 Pay должен агрегировать выбор, а не конкурировать только с картой. |
| СБП стала массовым rails для переводов, покупок, ЖКХ и выплат. | Банк России: в СБП 49,1 млрд операций на 259,7 трлн рублей; IV кв. 2025 - 1,4 млрд покупок на 2,5 трлн рублей; 3 млн ТСП принимают СБП. https://www.cbr.ru/analytics/nps/sbp/4_2025 | Phone-number UX может использовать доверие к СБП и расширить его на merchant flows. |
| QR/биометрия растут из-за ухода Apple Pay/Google Pay и конкуренции банковских QR. | РБК по статистике ЦБ: за 9 месяцев 2024 по QR оплачено почти 1,5 млрд покупок на 2,56 трлн рублей; карты остаются крупнейшим способом. https://www.rbc.ru/finances/24/12/2024/676abde29a79470078eebbde | A3 Pay должен избегать войны QR-стандартов и предлагать универсальный alias/status layer. |
| E-commerce продолжает расти, но насыщается и концентрируется в маркетплейсах. | Data Insight/Коммерсантъ: в 2024 рынок e-commerce прогнозировался 10,7 трлн руб.; в 2025 рынок достиг 13,4 трлн руб., 8,3 млрд заказов, маркетплейсы 81% заказов и 62% продаж. https://www.kommersant.ru/doc/7248916, https://www.kommersant.ru/doc/8551330 | Стартовать лучше не против маркетплейсов, а в long-tail merchants, services and recurring. |
| BNPL стал крупным embedded-finance инструментом и входит в регулирование. | Банк России будет надзирать BNPL; закон 283-ФЗ; рынок 2024 около 300 млрд руб., оценки 2025 до 940 млрд руб. https://www.cbr.ru/press/event/?id=25803, https://bosfera.ru/press-release/obem-rynka-bnpl-servisov-dostig-940-mlrd-rubley-v-2025-godu | A3 Pay может быть payment choice layer: оплатить сейчас, частями, кредитом, бонусами. |
| High-ticket сделки используют escrow/accreditive и плохо укладываются в быстрый consumer checkout. | Банк ДОМ.РФ: эскроу, аккредитив, пополнение эскроу через СБП, контроль условий сделки. https://domrfbank.ru/escrow | Не трогать деньги напрямую на старте; делать orchestration, checklist, payment status and safe handoff. |

## Payment Ecosystem Map

| Способ оплаты | Где силен | Боли | Возможность A3 Pay |
|---|---|---|---|
| Наличные | P2P, мелкие услуги, рынки, аварийные случаи | Нет digital trail, риск безопасности, неудобный возврат | Конвертировать в payment link/phone invoice, чек и статус. |
| Банковские карты | Retail, e-commerce, travel, subscriptions | Комиссия эквайринга, ввод реквизитов, card lifecycle, chargeback | Fallback rail, tokenized pay, receipts. |
| Интернет-эквайринг | E-commerce, услуги, билеты | Интеграционная сложность, возвраты, fraud, комиссия | Unified checkout и reconciliation. |
| Торговый эквайринг | Offline retail/services | POS cost, терминалы, settlement delay | СБП/QR/NFC альтернативы, lightweight merchant acceptance. |
| СБП | P2P, QR, C2B, ЖКХ, выплаты | UX зависит от банка, QR friction, cashback mismatch | Phone alias, status tracking, reminders, linked-account payments. |
| Банковские переводы | High-ticket, B2C services, invoices | Реквизиты, ошибки, долгое подтверждение | Phone invoice, pre-filled details, escrow/accreditive handoff. |
| Электронные кошельки | Ниши, микроплатежи, digital services | Ограничения идентификации и баланса | Дополнительный rail, не core wedge. |
| Pay-сервисы банков | Экосистемные клиенты | Закрытость внутри банка/экосистемы | Cross-bank choice and merchant-neutral UX. |
| Loyalty/бонусы | Retail, travel, banks | Разрозненность, неочевидная ценность | Pay with mix: деньги + бонусы + скидка за rail. |
| BNPL/рассрочка | E-commerce, travel, high AOV retail | Регулирование, лимиты, риск просрочек | Offer selection and transparent schedule. |
| Кредитные продукты | Auto, недвижимость, образование, healthcare | Длинный funnel, документы, отказ | Pre-qualification and payment plan routing. |
| Криптовалюты | Трансграничные/нишевые кейсы | Регуляторный риск, волатильность, AML | Не core для массового российского A3 Pay. |

## CJM-синтез сценариев

| Сценарий | Цель пользователя | Основное трение | Роль A3 Pay | Priority |
|---|---|---|---|---|
| ЖКХ и регулярные счета | Не забыть, оплатить без комиссии, сохранить чек | Разные кабинеты, квитанции, ручная сверка | Phone-linked bills, reminders, СБП/Мир route, чек и история | P0 |
| Повседневные услуги | Быстро оплатить мастера/клинику/школу/секцию | Перевод "на карту", нет invoice, нет возврата/status | Payment link по телефону, receipt, merchant profile | P0 |
| E-commerce long-tail | Оплатить без ввода карты и с понятным возвратом | Фрагментированные способы, trust gap | Unified checkout: СБП/карта/BNPL/loyalty | P0 |
| Путешествия | Забронировать и оплатить высокий чек | Предоплата, возвраты, рассрочка, foreign card limits | Payment plan, split, insurance/refund status | P1 |
| Авто | Безопасно внести аванс/оплатить сервис/покупку | Дилер, банк, кредит, ДКП, статус сделки | Deal checklist, safe invoice, credit/accreditive handoff | P1 |
| Недвижимость | Безопасно провести крупный платеж | Эскроу/аккредитив, документы, сроки, несколько сторон | Status orchestration and bank handoff | P2 |
| Госуслуги | Оплатить пошлины/штрафы без ошибок | Разные ведомства, реквизиты, комиссии | Payment reminder/status, receipt vault | P2 |

## Opportunity Scoring

| Инициатива | Сценарий | Reach | Impact | Confidence | Effort | RICE | ICE | Приоритет |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Phone invoice для услуг и малого бизнеса | Повседневные услуги | 8 | 8 | 7 | 3 | 149.3 | 18.7 | P0 |
| Recurring bills hub | ЖКХ, телеком, subscriptions | 7 | 9 | 7 | 4 | 110.3 | 15.8 | P0 |
| Unified checkout СБП + карта + BNPL | E-commerce long-tail | 8 | 8 | 6 | 5 | 76.8 | 14.4 | P0 |
| Refund/status vault | E-commerce, travel, services | 7 | 7 | 7 | 3 | 114.3 | 16.3 | P0 |
| Payment plan selector | Travel, healthcare, education | 6 | 8 | 6 | 5 | 57.6 | 12.0 | P1 |
| Dealer safe payment flow | Auto | 4 | 9 | 5 | 6 | 30.0 | 7.5 | P1 |
| Escrow/accreditive companion | Недвижимость | 3 | 10 | 4 | 8 | 15.0 | 5.0 | P2 |
| Loyalty rail optimization | Retail/e-commerce | 7 | 6 | 5 | 6 | 35.0 | 5.0 | P2 |

## Strategic Recommendation

1. 0-6 месяцев: запустить wedge в регулярных и service payments: phone invoice, recurring reminders, СБП/карта route, receipt/status vault.
2. 6-12 месяцев: добавить unified checkout для long-tail e-commerce and services, возвраты, merchant dashboard, payment links, basic loyalty prompts.
3. 12-24 месяца: расширить embedded finance: BNPL/payment plan selector, travel/high-ticket deposits, dealer workflows, затем real estate companion через банковских партнеров.

## Competitors and Alternatives

| Name | Category | Strength | Gap for A3 Pay |
|---|---|---|---|
| СБП | National rails | Массовость, банки, низкая стоимость, QR/NFC/link/account | UX зависит от банка; мало orchestration вокруг сценария. |
| Банковские приложения | Bank superapps | Trust, KYC, счета, кредиты, loyalty | Закрыты в своем банке, merchant-neutral UX слабее. |
| SberPay/T-Pay/Alfa Pay/Yandex Pay | Pay services | Удобный checkout внутри экосистем | Fragmented acceptance, ecosystem lock-in. |
| ЮKassa/CloudPayments/Robokassa | Payment aggregators | Merchant integrations, checkout methods | Не user-centric phone identity layer. |
| BNPL: Долями, Сплит, Подели, Плати частями | Embedded finance | Увеличение affordability/AOV | Фрагментированы и регулируются; не покрывают весь payment journey. |
| Госуслуги/ГИС ЖКХ | Public service payments | Официальность, bills, ЖКХ | UX не универсален для private services and commerce. |

## Findings

| Finding | Impact | Evidence | Confidence | Product implication |
|---|---|---|---|---|
| Массовая проблема не в отсутствии способов оплаты, а в выборе, подтверждении, возврате и сверке. | high | Рост альтернативных способов и СБП, QR, BNPL. | high | A3 Pay = orchestration + trust layer. |
| Малый бизнес в СБП уже массовый, но нуждается в простых invoice/status tools. | high | 3 млн ТСП, около 80% - МСП в СБП. | high | P0 для phone invoice and merchant profile. |
| High-ticket рынки привлекательны, но слишком тяжелы для первого wedge. | medium | Escrow/accreditive, auto credit workflows. | medium | Начать как companion/status, не money custody. |
| BNPL важен, но regulatory change делает его не единственным pillar. | medium | Закон 283-ФЗ, Банк России oversight. | high | Встроить как option, не core identity. |

## Claims To Validate

| Claim | Current evidence | Risk | Validation method |
|---|---|---|---|
| Пользователи готовы платить по номеру телефона merchant'у, если есть чек и защита. | Косвенно: массовость СБП P2P/C2B. | Trust and fraud perception. | 12 интервью + clickable prototype. |
| Merchant готов подключить A3 Pay ради reconciliation/status, не только комиссии. | Косвенно: pain с settlement, refunds, invoice. | Цена/интеграция может быть барьером. | 8 merchant interviews. |
| Регулярные платежи - лучший стартовый wedge. | Частота и боль квитанций/подписок. | Банки/Госуслуги уже сильны. | Smoke MVP with 20 users. |

## Sources

| Source | Provider | URL/path | Used for | Confidence |
|---|---|---|---|---|
| Банк России: Национальная платежная система | web/tavily | https://cbr.ru/PSystem/ | market baseline, Мир, СБП | high |
| Банк России: СБП основные показатели | web/tavily | https://www.cbr.ru/analytics/nps/sbp/4_2025 | СБП usage, ТСП, МСП, покупки | high |
| Банк России: статистика НПС | web | https://cbr.ru/statistics/nps/psrf/ | data tables index | high |
| РБК по QR/биометрии | web | https://www.rbc.ru/finances/24/12/2024/676abde29a79470078eebbde | QR and biometric payment scale | medium |
| Коммерсантъ/Data Insight e-commerce 2024 | web | https://www.kommersant.ru/doc/7248916 | e-commerce 2024 | medium |
| Коммерсантъ/Data Insight e-commerce 2025 | tavily | https://www.kommersant.ru/doc/8551330 | e-commerce 2025 | medium |
| Data Insight PDF 2025 | tavily | https://datainsight.ru/sites/default/files/eCommerce_2025.pdf | market structure | medium |
| Банк России BNPL oversight | web/tavily | https://www.cbr.ru/press/event/?id=25803 | BNPL regulation | high |
| Банк ДОМ.РФ escrow | tavily | https://domrfbank.ru/escrow | real estate payment mechanics | medium |
| СБП/НСПК site | tavily | https://sbp.nspk.ru/ | payment forms and UX | medium |

## Publication Shape Gate

| Section | Required shape | Status | Evidence |
|---|---|---|---|
| Personas | comparative table | pass | `proto-personas.md` |
| CJM/user paths | table/scheme | pass | `cjm-map.md` |
| Competitors | matrix | pass | `competitive-analysis.md` |
| ICE/RICE/backlog | scoring table | pass | `opportunity-roadmap.md` |

## Unknowns

- Лицензионная модель и банковские партнеры A3 Pay.
- Реальная доступность DeepSeek/Gemini provider calls.
- Notion target для публикации.
