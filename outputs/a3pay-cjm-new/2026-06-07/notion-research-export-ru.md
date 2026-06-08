# Исследование платежных сценариев России для A3 Pay

## Статус публикационного пакета

| Поле | Значение |
|---|---|
| Тип | Полный research pack для Notion |
| Источник | `outputs/a3pay-cjm-new/2026-06-07` |
| Ограничение | DeepSeek/Gemini cross-check не выполнен; выводы остаются `partial/needs_validation` там, где это указано в источниках. |

## Использованные входные артефакты

- `research-summary.md`
- `competitive-analysis.md`
- `cjm-map.md`
- `opportunity-roadmap.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `source-log.md`

## Прото-персоны
<!-- notion-section: personas -->

| Персона | Сегмент | Контекст | JTBD | Боль | Ценность A3 Pay | Evidence status |
|---|---|---|---|---|---|---|
| Анна, 34 | Городской пользователь с семьей | Платит ЖКХ, детские секции, подписки и онлайн-покупки | Видеть регулярные счета и платить без ошибок | Разные кабинеты, забытые сроки, непонятные чеки | Bills hub, reminders, receipt vault | hypothesis/source-informed |
| Сергей, 42 | Мастер или малый бизнес | Принимает предоплаты и финальные оплаты от клиентов | Дать клиенту понятный способ оплатить и не спорить о переводе | Переводы на карту выглядят неформально, нет назначения, возвраты вручную | Phone invoice, merchant profile, refund workflow | hypothesis/source-informed |
| Мария, 29 | E-commerce/travel buyer | Покупает в маркетплейсах, у небольших магазинов и бронирует поездки | Выбрать выгодный и безопасный способ оплаты | Неясные возвраты, много способов, BNPL/кэшбэк неочевидны | Unified checkout, refund vault, payment plan selector | hypothesis/source-informed |
| Алексей, 38 | High-ticket buyer | Покупает авто или недвижимость | Провести крупный платеж без риска ошибиться | Несколько сторон, документы, банк, сроки, аванс | Safe deposit/status companion | hypothesis/needs_validation |

## Сценарий 1: регулярные счета
<!-- notion-section: cjm -->

| Этап | Цель | Действия | Участники | Боли | Возможность A3 Pay |
|---|---|---|---|---|---|
| Получить начисление | Понять сумму и срок | Получает квитанцию или уведомление | УК, РСО, пользователь | Документы в разных местах | Phone-linked bill inbox |
| Проверить | Убедиться, что начисление корректно | Сверяет счетчики и период | Пользователь, УК | Непонятные строки | Explanation layer and history |
| Оплатить | Заплатить без комиссии | Выбирает СБП, Мир или карту | Банк, НСПК, портал | Комиссии и ручной ввод | Best rail selection |
| Подтвердить | Сохранить чек | Получает чек и статус | Банк, УК | Статус не обновился | Receipt/status vault |
| Повторить | Не забыть следующий месяц | Настраивает reminder или автоплатеж | Пользователь | Пропуск срока | Smart reminders |

## Сценарий 2: услуги и малый бизнес
<!-- notion-section: cjm -->

| Этап | Цель | Действия | Участники | Боли | Возможность A3 Pay |
|---|---|---|---|---|---|
| Договориться | Получить услугу | Запись или заказ | Клиент, merchant | Нет формального invoice | Merchant profile by phone |
| Предоплата | Забронировать слот | Перевод, ссылка или QR | Клиент, merchant, банк | Перевод на карту выглядит небезопасно | Phone invoice with terms |
| Оплата | Закрыть сумму | СБП или карта | Банк, merchant | Нет чека и назначения | Receipt and purpose |
| Возврат | Решить exception | Частичный возврат или перенос | Клиент, merchant | Ручная переписка | Refund workflow |
| Повтор | Вернуться | Сохраненный merchant | Клиент | Реквизиты теряются | Favorite merchants |

## Матрица позиционирования
<!-- notion-section: competitors -->

| Игрок | Тип | Сильная сторона | Слабое место | Роль A3 Pay |
|---|---|---|---|---|
| СБП | National payment rails | Массовость, низкая стоимость, доверие ЦБ/НСПК | UX зависит от банка, слабый scenario/status layer | UX and trust layer поверх СБП |
| Банковские приложения | Bank superapps | Trust, KYC, счета, кредиты, loyalty | Закрыты внутри своего банка | Cross-bank сценарный слой |
| Pay-сервисы | Bank/ecosystem Pay | Удобный checkout и loyalty | Ecosystem lock-in | Neutral payment selector |
| PSP | Merchant acquiring | APIs, checkout methods, merchant integrations | Merchant-first, нет user-owned payment memory | Receipt/status vault и phone alias |
| BNPL providers | Embedded finance | Affordability и AOV lift | Регулирование, лимиты, risk perception | Один вариант payment plan, не ядро |
| Госуслуги/ГИС ЖКХ | Public payment portal | Официальность и trust | Узкий public domain | Private-sector status/receipt UX |

## ICE/RICE бэклог
<!-- notion-section: scoring -->

| Сценарий / инициатива | Reach | Impact | Confidence | Effort | RICE | ICE | Приоритет |
|---|---:|---:|---:|---:|---:|---:|---|
| Phone invoice | 8 | 8 | 7 | 3 | 149.3 | 18.7 | P0 |
| Receipt/refund vault | 7 | 7 | 7 | 3 | 114.3 | 16.3 | P0 |
| Bills hub | 7 | 9 | 7 | 4 | 110.3 | 15.8 | P0 |
| Unified checkout | 8 | 8 | 6 | 5 | 76.8 | 14.4 | P0 |
| Payment plan selector | 6 | 8 | 6 | 5 | 57.6 | 12.0 | P1 |
| Safe auto deposit | 4 | 9 | 5 | 6 | 30.0 | 7.5 | P1 |
| Property companion | 3 | 10 | 4 | 8 | 15.0 | 5.0 | P2 |


## Сводка исследования
<!-- notion-section: overview -->

#### Метаданные артефакта

| Field | Value |
|---|---|
| Status | partial |
| Research mode | deep_research |
| Evidence level | source-backed + hypotheses |
| Readiness score | 0.78 |

#### Использованные входные материалы

- `recursive-brief.md`
- `run-plan.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- Tavily/web searches от `2026-06-07`
- Источники: Банк России, СБП/НСПК, Data Insight, Коммерсантъ, РБК, Ведомости, отраслевые страницы банков/экосистем

#### Политика источников

| Provider | Requested | Used | Sources count | Validation state | Notes |
|---|---:|---:|---:|---|---|
| tavily | yes | yes | 20+ | pass | Использован для поиска и source scan. |
| web search | yes | yes | 10+ | pass | Использован для official/current facts. |
| deepseek | yes | no | 0 | needs_validation | Cross-check не выполнен в текущей сессии. |
| gemini | yes | no | 0 | needs_validation | `workflow:doctor` предупредил об optional provider config. |

#### Исследовательские вопросы

| Question | Status | Answer summary |
|---|---|---|
| Какие способы оплаты используют пользователи? | answered_with_limitations | Карты, СБП/QR, банковские приложения, переводы, BNPL, loyalty, cash and sector-specific rails. |
| Где возникают разрывы UX? | answered_with_limitations | Выбор rail, доверие к получателю, статус, чек, возврат, регулярность, многосторонние сделки. |
| Где A3 Pay может интегрироваться? | answered_with_limitations | Phone invoice, bills hub, checkout, refunds, payment plans, high-ticket companion. |

#### Аудитория исследования

| Segment | Context | Motivation | Barrier | Evidence status |
|---|---|---|---|---|
| Regular bill payer | ЖКХ, телеком, subscriptions | Оплатить вовремя и сохранить чек | Разные кабинеты | source-informed hypothesis |
| Small merchant/service | Услуги и предоплаты | Формализовать оплату | Нет простого invoice/status | source-informed hypothesis |
| E-commerce/travel buyer | Online checkout and high AOV | Выбрать безопасный и выгодный способ | Возвраты и BNPL условия | source-informed hypothesis |
| High-ticket buyer | Auto/real estate | Безопасно провести крупный платеж | Документы и много сторон | needs_validation |

#### Пользовательские задачи

| Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|
| Regular bill payer | Когда приходит счет, я хочу оплатить его без ошибки и сохранить подтверждение | Квитанция/срок | Потеря счета | Оплата + чек + напоминание | source-informed |
| Small merchant | Когда клиент готов платить, я хочу отправить формальный счет по телефону | Заказ/бронь | Перевод на карту | Invoice and status | hypothesis |
| Buyer | Когда checkout предлагает много способов, я хочу выбрать лучший | Покупка | Недоверие/возврат | Clear rail selector | source-informed |

#### Прото-персоны

См. `proto-personas.md`; кратко: Анна, Сергей, Мария, Алексей.

#### Синтетические интервью

См. `synthetic-interviews.md`; используются только как hypotheses, not evidence.

#### План валидации исследования

| Hypothesis | Who to interview or observe | Minimum evidence | Decision unlocked | Status |
|---|---|---|---|---|
| Phone invoice increases trust | 5 merchants + 5 customers | 70% understand and prefer formal invoice vs card transfer | MVP wedge | planned |
| Bills hub drives repeat use | 5 regular bill payers | 3+ remembered bills and willingness to connect account | Retention strategy | planned |
| Refund vault reduces anxiety | 4 e-commerce/travel buyers | Clear comprehension in prototype | Checkout scope | planned |

#### Ключевые выводы

Российская платежная экосистема уже массово безналичная: Банк России указывает 88% долю безналичных платежей в розничном обороте по итогам 2025 года, 31 платежную систему и 353 оператора по переводу денежных средств на 1 января 2026 года. Карты остаются базовым способом, но доля альтернативных сценариев быстро растет: СБП, QR, банковские Pay-сервисы, BNPL, привязанные счета, payment links и биометрия.

A3 Pay имеет наибольший шанс не как "еще один способ оплаты", а как слой orchestration: пользователь платит по номеру телефона, а продукт выбирает или предлагает rails под контекст: СБП, карта, счет, рассрочка, кредит, loyalty, invoice, recurring mandate, escrow/accreditive status. Главная возможность - закрыть разрывы между платежом, подтверждением, возвратом, регулярностью, несколькими участниками и reconciliation.

#### Рыночные факты

| Fact | Evidence | Product implication |
|---|---|---|
| Безналичный оборот стал нормой, но инструменты фрагментируются. | Банк России: 88% безналичных платежей в розничном обороте по итогам 2025 года; 476,5 млн карт Мир; СБП 226 банков-участников на 1 мая 2026. https://cbr.ru/PSystem/ | A3 Pay должен агрегировать выбор, а не конкурировать только с картой. |
| СБП стала массовым rails для переводов, покупок, ЖКХ и выплат. | Банк России: в СБП 49,1 млрд операций на 259,7 трлн рублей; IV кв. 2025 - 1,4 млрд покупок на 2,5 трлн рублей; 3 млн ТСП принимают СБП. https://www.cbr.ru/analytics/nps/sbp/4_2025 | Phone-number UX может использовать доверие к СБП и расширить его на merchant flows. |
| QR/биометрия растут из-за ухода Apple Pay/Google Pay и конкуренции банковских QR. | РБК по статистике ЦБ: за 9 месяцев 2024 по QR оплачено почти 1,5 млрд покупок на 2,56 трлн рублей; карты остаются крупнейшим способом. https://www.rbc.ru/finances/24/12/2024/676abde29a79470078eebbde | A3 Pay должен избегать войны QR-стандартов и предлагать универсальный alias/status layer. |
| E-commerce продолжает расти, но насыщается и концентрируется в маркетплейсах. | Data Insight/Коммерсантъ: в 2024 рынок e-commerce прогнозировался 10,7 трлн руб.; в 2025 рынок достиг 13,4 трлн руб., 8,3 млрд заказов, маркетплейсы 81% заказов и 62% продаж. https://www.kommersant.ru/doc/7248916, https://www.kommersant.ru/doc/8551330 | Стартовать лучше не против маркетплейсов, а в long-tail merchants, services and recurring. |
| BNPL стал крупным embedded-finance инструментом и входит в регулирование. | Банк России будет надзирать BNPL; закон 283-ФЗ; рынок 2024 около 300 млрд руб., оценки 2025 до 940 млрд руб. https://www.cbr.ru/press/event/?id=25803, https://bosfera.ru/press-release/obem-rynka-bnpl-servisov-dostig-940-mlrd-rubley-v-2025-godu | A3 Pay может быть payment choice layer: оплатить сейчас, частями, кредитом, бонусами. |
| High-ticket сделки используют escrow/accreditive и плохо укладываются в быстрый consumer checkout. | Банк ДОМ.РФ: эскроу, аккредитив, пополнение эскроу через СБП, контроль условий сделки. https://domrfbank.ru/escrow | Не трогать деньги напрямую на старте; делать orchestration, checklist, payment status and safe handoff. |

#### Карта платежной экосистемы

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

#### CJM-синтез сценариев

| Сценарий | Цель пользователя | Основное трение | Роль A3 Pay | Priority |
|---|---|---|---|---|
| ЖКХ и регулярные счета | Не забыть, оплатить без комиссии, сохранить чек | Разные кабинеты, квитанции, ручная сверка | Phone-linked bills, reminders, СБП/Мир route, чек и история | P0 |
| Повседневные услуги | Быстро оплатить мастера/клинику/школу/секцию | Перевод "на карту", нет invoice, нет возврата/status | Payment link по телефону, receipt, merchant profile | P0 |
| E-commerce long-tail | Оплатить без ввода карты и с понятным возвратом | Фрагментированные способы, trust gap | Unified checkout: СБП/карта/BNPL/loyalty | P0 |
| Путешествия | Забронировать и оплатить высокий чек | Предоплата, возвраты, рассрочка, foreign card limits | Payment plan, split, insurance/refund status | P1 |
| Авто | Безопасно внести аванс/оплатить сервис/покупку | Дилер, банк, кредит, ДКП, статус сделки | Deal checklist, safe invoice, credit/accreditive handoff | P1 |
| Недвижимость | Безопасно провести крупный платеж | Эскроу/аккредитив, документы, сроки, несколько сторон | Status orchestration and bank handoff | P2 |
| Госуслуги | Оплатить пошлины/штрафы без ошибок | Разные ведомства, реквизиты, комиссии | Payment reminder/status, receipt vault | P2 |

#### Оценка возможностей

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

#### Стратегическая рекомендация

1. 0-6 месяцев: запустить wedge в регулярных и service payments: phone invoice, recurring reminders, СБП/карта route, receipt/status vault.
2. 6-12 месяцев: добавить unified checkout для long-tail e-commerce and services, возвраты, merchant dashboard, payment links, basic loyalty prompts.
3. 12-24 месяца: расширить embedded finance: BNPL/payment plan selector, travel/high-ticket deposits, dealer workflows, затем real estate companion через банковских партнеров.

#### Конкуренты и альтернативы

| Name | Category | Strength | Gap for A3 Pay |
|---|---|---|---|
| СБП | National rails | Массовость, банки, низкая стоимость, QR/NFC/link/account | UX зависит от банка; мало orchestration вокруг сценария. |
| Банковские приложения | Bank superapps | Trust, KYC, счета, кредиты, loyalty | Закрыты в своем банке, merchant-neutral UX слабее. |
| SberPay/T-Pay/Alfa Pay/Yandex Pay | Pay services | Удобный checkout внутри экосистем | Fragmented acceptance, ecosystem lock-in. |
| ЮKassa/CloudPayments/Robokassa | Payment aggregators | Merchant integrations, checkout methods | Не user-centric phone identity layer. |
| BNPL: Долями, Сплит, Подели, Плати частями | Embedded finance | Увеличение affordability/AOV | Фрагментированы и регулируются; не покрывают весь payment journey. |
| Госуслуги/ГИС ЖКХ | Public service payments | Официальность, bills, ЖКХ | UX не универсален для private services and commerce. |

#### Наблюдения

| Finding | Impact | Evidence | Confidence | Product implication |
|---|---|---|---|---|
| Массовая проблема не в отсутствии способов оплаты, а в выборе, подтверждении, возврате и сверке. | high | Рост альтернативных способов и СБП, QR, BNPL. | high | A3 Pay = orchestration + trust layer. |
| Малый бизнес в СБП уже массовый, но нуждается в простых invoice/status tools. | high | 3 млн ТСП, около 80% - МСП в СБП. | high | P0 для phone invoice and merchant profile. |
| High-ticket рынки привлекательны, но слишком тяжелы для первого wedge. | medium | Escrow/accreditive, auto credit workflows. | medium | Начать как companion/status, не money custody. |
| BNPL важен, но regulatory change делает его не единственным pillar. | medium | Закон 283-ФЗ, Банк России oversight. | high | Встроить как option, не core identity. |

#### Гипотезы для проверки

| Claim | Current evidence | Risk | Validation method |
|---|---|---|---|
| Пользователи готовы платить по номеру телефона merchant'у, если есть чек и защита. | Косвенно: массовость СБП P2P/C2B. | Trust and fraud perception. | 12 интервью + clickable prototype. |
| Merchant готов подключить A3 Pay ради reconciliation/status, не только комиссии. | Косвенно: pain с settlement, refunds, invoice. | Цена/интеграция может быть барьером. | 8 merchant interviews. |
| Регулярные платежи - лучший стартовый wedge. | Частота и боль квитанций/подписок. | Банки/Госуслуги уже сильны. | Smoke MVP with 20 users. |

#### Источники

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

#### Проверка формы публикации

| Section | Required shape | Status | Evidence |
|---|---|---|---|
| Personas | comparative table | pass | `proto-personas.md` |
| CJM/user paths | table/scheme | pass | `cjm-map.md` |
| Competitors | matrix | pass | `competitive-analysis.md` |
| ICE/RICE/backlog | scoring table | pass | `opportunity-roadmap.md` |

#### Неизвестные и открытые зоны

- Лицензионная модель и банковские партнеры A3 Pay.
- Реальная доступность DeepSeek/Gemini provider calls.
- Notion target для публикации.

## Конкурентный анализ
<!-- notion-section: competitors -->

#### Использованные входные материалы

- `research-summary.md`
- `cjm-map.md`
- Tavily/web sources: Банк России, СБП/НСПК, Data Insight, ЮKassa, T-Pay/Yandex Pay public materials, BNPL market sources

#### Набор конкурентов

- СБП
- Карты Мир / card acquiring
- SberPay, T-Pay, Alfa Pay, Yandex Pay
- ЮKassa and PSPs
- BNPL providers
- Госуслуги/ГИС ЖКХ
- International alias-payment analogues

#### Матрица сравнения конкурентов

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

#### Покрытие сценариев

| Scenario | СБП | Banks/Pay | PSP | BNPL | Госуслуги | A3 Pay target |
|---|---|---|---|---|---|---|
| P2P/phone transfer | strong | strong | weak | none | weak | medium |
| Merchant phone invoice | medium | medium | medium | weak | none | strong |
| ЖКХ recurring | medium | strong | weak | none | strong | strong |
| E-commerce checkout | growing | strong | strong | strong | none | strong |
| Travel high AOV | medium | strong | medium | strong | none | medium |
| Auto deal payment | weak | medium | weak | credit only | medium via docs | medium |
| Real estate payment | weak | bank-led | weak | none | registry status only | companion only |

#### Стратегические выводы

- СБП - не конкурент, а базовый rail. A3 Pay лучше строить как UX and orchestration layer.
- Банковские Pay-сервисы сильны, но замкнуты. Дифференциация A3 Pay - нейтральность и сценарная широта.
- PSP закрывают merchant checkout, но не создают user-owned payment memory across scenarios.
- BNPL полезен как embedded option, но не должен быть ядром из-за регулирования и ограничения high-ticket применения.

## CJM и карта сценариев
<!-- notion-section: cjm -->

#### Использованные входные материалы

- `research-summary.md`
- `recursive-brief.md`
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- Источники Банка России, СБП/НСПК, Data Insight, отраслевые источники

#### Карта платежной экосистемы

| Индустрия | Основные способы оплаты | Участники | Типовые боли | Потенциал A3 Pay |
|---|---|---|---|---|
| Недвижимость | Ипотека, эскроу, аккредитив, банковский перевод, СБП для пополнения счетов | Покупатель, продавец, банк, Росреестр, застройщик, агент | Много сторон, страх крупного платежа, статус сделки размазан | P2: companion, checklist, payment status, partner handoff |
| Авто | Карта/перевод, кредит, трейд-ин, аккредитив, касса дилера | Покупатель, дилер, банк, ГИБДД/Госуслуги, страховая | Аванс, доверие к продавцу, документы, кредитный funnel | P1: safe invoice, deposit, credit handoff |
| Туризм | Карта, СБП, BNPL/рассрочка, loyalty, ваучеры | OTA, авиакомпания, отель, банк, страховая | Высокий чек, возвраты, сроки подтверждения | P1: payment plan, refund tracker |
| Ритейл | Карта, NFC, QR/СБП, Pay-сервисы, loyalty | Покупатель, retailer, банк, НСПК, PSP | Cashback mismatch, очереди, возвраты | P2: loyalty-aware routing |
| Госуслуги | Карта, СБП, Госуслуги, банковские приложения | Пользователь, ведомство, банк, портал | Ошибки реквизитов, статусы, квитанции | P2: reminder and receipt vault |
| Финуслуги | Переводы, СБП, карты, выплаты C2B/B2C | Клиент, банк, брокер, страховщик | KYC, подтверждения, лимиты | P1: payout status and phone alias |
| Здравоохранение | Карта, СБП, рассрочка, ДМС | Пациент, клиника, страховая, банк | Предоплаты, возвраты, high AOV | P1: invoice + payment plan |
| Образование | Карта, СБП, рассрочка, рекуррентные платежи | Родитель/студент, школа/курс, банк | Регулярность, просрочки, частичная оплата | P0/P1: recurring bills |
| ЖКХ | ГИС ЖКХ, Госуслуги Дом, QR, СБП, Мир | Житель, УК, РСО, банк, портал | Квитанции, комиссии, сроки, сверка | P0: bills hub |
| Телеком | Автоплатеж, карта, СБП, кабинет оператора | Абонент, оператор, банк | Забытые платежи, несколько номеров | P0: recurring multi-account payments |
| E-commerce | Карта, СБП, Pay, BNPL, wallet | Покупатель, merchant, PSP, банк | Trust, возвраты, выбор способа | P0: unified checkout |

#### CJM 1: ЖКХ и регулярные счета

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Получить начисление | Понять сумму и срок | Получает квитанцию/уведомление | Бумага, email, ГИС ЖКХ, банк | УК, РСО, пользователь | Документы в разных местах | Не увидел счет | Phone-linked bill inbox |
| Проверить | Убедиться, что начисление корректно | Сверяет счетчики/период | App/web | Пользователь, УК | Непонятные строки | Откладывает оплату | Explanation layer and history |
| Оплатить | Заплатить без комиссии | СБП/Мир/карта | Банк, Госуслуги, QR | Банк, НСПК | Комиссии и ручной ввод | Ошибка реквизитов | Best rail selection |
| Подтвердить | Сохранить чек | Получает чек/status | Bank app, email | Банк, УК | Статус не обновился | Повторное обращение | Receipt/status vault |
| Повторить | Не забыть следующий месяц | Напоминание/автоплатеж | Push/SMS | Пользователь | Пропуск срока | Пени | Smart reminders |

#### CJM 2: Повседневные услуги и малый бизнес

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Договориться | Получить услугу | Запись/заказ | Messenger, phone | Клиент, мастер/клиника/школа | Нет формального invoice | Недоверие | Merchant profile by phone |
| Предоплата | Забронировать слот | Перевод/ссылка/QR | Bank app, messenger | Клиент, merchant | "Переведи на карту" выглядит небезопасно | Отказ от предоплаты | Phone invoice with terms |
| Оплата | Закрыть сумму | СБП/карта | Link, QR, app | Банк, merchant | Нет чека/назначения | Спор | Receipt and purpose |
| Возврат/перенос | Решить exception | Частичный возврат | Bank/merchant | Клиент, merchant | Ручная переписка | Негатив | Refund workflow |
| Повтор | Вернуться | Сохраненный merchant | App | Клиент | Забытые реквизиты | Потеря клиента | Favorite merchants |

#### CJM 3: E-commerce long-tail

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Checkout | Быстро оплатить | Выбор способа | Web/mobile | Покупатель, merchant | Слишком много вариантов | Abandonment | Unified selector |
| Confirm | Подтвердить платеж | Банк app/3DS/QR | Bank app | Банк, PSP | Переключение контекста | Timeout | Deep link fallback |
| Delivery/refund | Видеть статус | Refund/partial capture | Merchant app | Merchant, PSP | Неясно, куда вернут деньги | Support load | Status vault |
| Reorder | Повторить покупку | Saved route | App/web | Покупатель | Реквизиты/карта устарели | Потеря repeat | Phone alias + rail fallback |

#### CJM 4: Путешествие

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Plan | Найти билеты/отель | Сравнение цены и условий | OTA/bank travel | OTA, пользователь | Высокий чек | Откладывание | Payment plan preview |
| Book | Забронировать | Предоплата/полная оплата | Card/СБП/BNPL | OTA, банк | Время подтверждения | Ошибка оплаты | Multi-rail checkout |
| Change/cancel | Вернуть/перенести | Refund, fee | Support | OTA, airline, hotel | Длинный возврат | Негатив | Refund tracker |
| Travel | Использовать ваучеры/loyalty | Доплаты | App/POS | Пользователь | Разные currencies/limits | Cash fallback | Receipt vault |

#### CJM 5: Авто

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Выбор | Проверить авто/условия | Бронь/задаток | Dealer site, Госуслуги | Покупатель, дилер | Недоверие к задатку | Нет оплаты | Safe deposit invoice |
| Финансирование | Получить кредит | Заявка/одобрение | Bank/dealer | Банк, дилер | Длинный funnel | Отказ/ожидание | Credit handoff status |
| Сделка | Оплатить остаток | Аккредитив/перевод/касса | Bank, dealer | Покупатель, банк | Страх ошибки | Delay | Deal checklist |
| После покупки | Оплатить сервис/страховку | Полисы/ТО | App, POS | Страховая, сервис | Много отдельных счетов | Пропуск | Ownership bills hub |

#### CJM 6: Недвижимость

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Подбор | Понять бюджет | Ипотечный расчет | Bank/developer | Покупатель, банк | Неясная полная стоимость | Отказ | Budget and rail planner |
| Бронь | Закрепить объект | Бронь/задаток | Developer/bank | Покупатель, застройщик | Доверие и возврат | Спор | Safe invoice |
| Сделка | Перевести крупную сумму | Эскроу/аккредитив | Bank/Rosreestr | Банк, Росреестр | Сложная последовательность | Delay | Status companion |
| Владение | Платить ЖКХ/налоги/страховку | Регулярные счета | Госуслуги, банк | УК, ФНС, банк | Разные кабинеты | Просрочка | Property bills hub |

## Возможности, приоритизация ICE/RICE и дорожная карта
<!-- notion-section: scoring -->

#### Использованные входные материалы

- `research-summary.md`
- `cjm-map.md`
- `competitive-analysis.md`
- `proto-personas.md`

#### Бэклог возможностей

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

#### Матрица ICE

| Initiative | Impact | Confidence | Ease | ICE | Notes |
|---|---:|---:|---:|---:|---|
| Phone invoice | 8 | 7 | 7 | 18.7 | Быстрый wedge для малого бизнеса. |
| Bills hub | 9 | 7 | 6 | 15.8 | Частый сценарий, но сильная конкуренция банков/Госуслуг. |
| Receipt/refund vault | 7 | 7 | 7 | 16.3 | Дешевле, усиливает trust. |
| Unified checkout | 8 | 6 | 5 | 14.4 | Больше интеграционной работы. |
| Payment plan selector | 8 | 6 | 4 | 12.0 | Зависит от BNPL/credit partners. |
| Safe auto deposit | 9 | 5 | 3 | 7.5 | Высокий чек, сложные партнерства. |
| Property companion | 10 | 4 | 2 | 5.0 | Стратегический, но не стартовый. |

#### Матрица RICE

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

#### Дорожная карта на 12-24 месяца

| Горизонт | Product focus | Capabilities | Success metrics |
|---|---|---|---|
| 0-3 месяца | Research validation + MVP wedge | Phone invoice prototype, merchant profile, receipt vault, bills inbox concept | 20 user tests, 8 merchant interviews, payment completion intent |
| 3-6 месяцев | Service payments beta | СБП/card route, payment links, reminders, refunds, merchant dashboard | activation, paid invoices, repeat payments, support tickets |
| 6-12 месяцев | Long-tail checkout | Unified checkout, recurring mandates, linked account, basic BNPL option | checkout conversion, merchant adoption, refund SLA |
| 12-18 месяцев | Embedded finance | Payment plan selector, travel/education/healthcare pilots | AOV lift, approval rate, default/complaint rate |
| 18-24 месяца | High-ticket companion | Auto deposit, property status companion, bank partner workflows | partner pilots, safe deposits, completed high-ticket flows |

#### Продуктовая стратегия

Сначала закрепиться в сценариях с высокой частотой и умеренным compliance: услуги, ЖКХ/регулярные счета, long-tail e-commerce. Затем расширяться в high-AOV вертикали через партнеров, не беря на себя custody денежных средств до появления юридической и операционной готовности.

Главная формула позиционирования: "A3 Pay превращает номер телефона в понятный платежный маршрут: счет, способ оплаты, чек, статус и возврат в одном месте".

## Прото-персоны
<!-- notion-section: personas -->

#### Использованные входные материалы

- `research-summary.md`
- `cjm-map.md`
- `opportunity-roadmap.md`
- Source-backed market facts and product hypotheses

#### Ограничение

Proto personas являются гипотезами для планирования интервью и проверки сценариев. Они не считаются доказательством реального пользовательского поведения.

#### Контекст решений

Персоны нужны для проверки wedge-сценариев A3 Pay: bills hub, phone invoice, checkout/refund vault, high-ticket companion.


#### Таблица персон

| Persona | Segment | Context | JTBD | Pain | A3 Pay value | Evidence status |
|---|---|---|---|---|---|---|
| Анна, 34 | Городской пользователь с семьей | Платит ЖКХ, детские секции, подписки, покупки онлайн | "Хочу видеть все регулярные счета и платить без ошибок" | Разные кабинеты, забытые сроки, непонятные чеки | Bills hub, reminders, receipt vault | hypothesis/source-informed |
| Сергей, 42 | Мастер/малый бизнес | Принимает предоплаты и финальные оплаты от клиентов | "Хочу дать клиенту понятный способ оплатить и не спорить о переводе" | Переводы на карту выглядят неформально, нет назначения, возвраты вручную | Phone invoice, merchant profile, refund workflow | hypothesis/source-informed |
| Мария, 29 | E-commerce/travel buyer | Покупает в маркетплейсах, у небольших магазинов, бронирует поездки | "Хочу выбрать самый выгодный и безопасный способ оплаты" | Неясные возвраты, много способов, BNPL/кэшбэк неочевидны | Unified checkout and payment plan selector | hypothesis/source-informed |
| Алексей, 38 | High-ticket buyer | Покупает авто или недвижимость | "Хочу провести крупный платеж без риска ошибиться" | Несколько сторон, документы, банк, сроки, аванс | Safe deposit/status companion | hypothesis/needs_validation |


#### План валидации

| Segment | Count | Screening criteria | Key questions |
|---|---:|---|---|
| Regular bills users | 5 | 3+ регулярных платежа в месяц | Где теряют счета? Что считают безопасной оплатой? |
| Small merchants/services | 5 | Принимают оплату от физлиц | Как выставляют счета? Где спорят? |
| E-commerce/travel buyers | 4 | Делали покупку 10k+ за последние 3 месяца | Как выбирают карту/СБП/BNPL? |
| Auto/real estate buyers | 4 | Сделка или подготовка за 12 месяцев | Где страшно платить? Кто должен гарантировать? |

## Синтетические интервью
<!-- notion-section: interviews -->

#### Использованные входные материалы

- `proto-personas.md`
- `cjm-map.md`
- `research-summary.md`

#### Ограничение

Synthetic interviews используются только для генерации гипотез, stress test интервью-гайда и поиска validation questions. Это не evidence о реальном поведении.


#### Интервью

| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |
|---|---|---|---|---|---|---|
| SI-1 | Анна | Оплата ЖКХ и секций | "Я уже плачу в банке, зачем еще приложение?" | A3 Pay должен показывать не только кнопку оплаты, а общий список счетов, сроки, чеки и историю | synthetic | Проверить willingness-to-switch |
| SI-2 | Сергей | Предоплата клиентом услуги | "Мне проще дать номер карты" | Формальный phone invoice повышает доверие клиента и снижает споры | synthetic | Проверить merchant willingness to pay |
| SI-3 | Мария | Покупка в небольшом интернет-магазине | "Я не хочу вводить карту и не уверена, что вернут деньги" | Unified checkout + refund tracker может повысить conversion | synthetic | Проверить trust signals |
| SI-4 | Алексей | Покупка автомобиля | "Задаток страшно переводить, пока не понял условия" | Safe deposit invoice and status checklist полезны даже без custody | synthetic | Проверить роль банка/гаранта |
| SI-5 | Мария | Бронирование тура | "Рассрочка удобна, но я боюсь переплаты и отмены" | Payment plan selector должен показывать график, переплату, refund rules | synthetic | Проверить comprehension of payment plans |


#### Паттерны для проверки

| Topic | Question | Decision unlocked |
|---|---|---|
| Trust | Что должно быть на экране, чтобы вы оплатили по номеру телефона компании/человеку? | Trust UX and merchant profile requirements |
| Rail choice | Когда вы выбираете карту, СБП, QR, BNPL или перевод? | Payment routing logic |
| Receipts | Где вы ищете чек и статус возврата? | Receipt vault MVP |
| Recurring | Какие платежи чаще всего забываются? | Bills hub priority |
| High-ticket | Кто должен гарантировать безопасность крупного платежа? | Partner and legal strategy |

## SWOT-анализ
<!-- notion-section: swot -->

#### Использованные входные материалы

- `research-summary.md`
- `competitive-analysis.md`
- `cjm-map.md`
- `opportunity-roadmap.md`

#### SWOT-матрица

| Strengths | Weaknesses |
|---|---|
| Phone-number UX понятен российским пользователям благодаря массовости СБП P2P. | Без собственных rails/партнеров A3 Pay зависит от банков, СБП, PSP и BNPL providers. |
| Может объединить оплату, чек, статус, возврат и reminders. | Риск восприниматься как "еще один checkout" без уникального trust layer. |
| Merchant-neutral позиционирование против закрытых банковских экосистем. | High-ticket сценарии требуют compliance, partner contracts and legal review. |
| Возможность начать с lightweight invoice/status layer. | Нужны real interviews and provider cross-check до статуса `ready`. |

| Opportunities | Threats |
|---|---|
| Рост альтернативных способов оплаты и СБП C2B. | Банки и экосистемы могут быстро копировать UX внутри своих каналов. |
| Long-tail services and merchants need formal payments without heavy acquiring. | Регулирование BNPL и платежных посредников может ограничить сценарии. |
| Регулярные платежи дают частоту и retention. | Пользователь может не захотеть еще одно приложение поверх банка. |
| High-ticket companion can unlock partnerships with авто/недвижимостью later. | Trust/fraud incidents на phone payments могут разрушить adoption. |


#### Стратегические заметки

| Horizon | SWOT-driven posture |
|---|---|
| 0-6 месяцев | Exploit: phone invoice, bills hub, receipt vault. |
| 6-12 месяцев | Expand: unified checkout and merchant dashboard. |
| 12-24 месяца | Partner: BNPL/payment plans, auto deposits, property companion. |

## Источники и журнал доказательств
<!-- notion-section: sources -->

#### Использованные входные материалы

- Tavily/web searches от `2026-06-07`
- `research-summary.md`

#### Проверенные источники

| Source | URL | Notes |
|---|---|---|
| Банк России: Национальная платежная система | https://cbr.ru/PSystem/ | НПС, Мир, СБП, безналичная доля |
| Банк России: СБП основные показатели IV кв. 2025 | https://www.cbr.ru/analytics/nps/sbp/4_2025 | СБП operations, purchases, TSP/MSP |
| Банк России: статистика НПС | https://cbr.ru/statistics/nps/psrf/ | Statistical tables index |
| РБК: QR and biometrics | https://www.rbc.ru/finances/24/12/2024/676abde29a79470078eebbde | QR payment scale |
| Коммерсантъ/Data Insight 2024 | https://www.kommersant.ru/doc/7248916 | E-commerce 2024 forecast |
| Коммерсантъ/Data Insight 2025 | https://www.kommersant.ru/doc/8551330 | E-commerce 2025 figures |
| Data Insight PDF 2025 | https://datainsight.ru/sites/default/files/eCommerce_2025.pdf | E-commerce structure |
| Банк России BNPL oversight | https://www.cbr.ru/press/event/?id=25803 | BNPL supervision |
| Банк ДОМ.РФ escrow | https://domrfbank.ru/escrow | Escrow and accreditives |
| СБП/НСПК | https://sbp.nspk.ru/ | Payment forms and UX |
