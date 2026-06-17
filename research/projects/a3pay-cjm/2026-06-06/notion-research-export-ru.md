# A3 Pay CJM: исследование платежных сценариев России

## Статус документа

Статус: готово к публикации.

Провайдерное покрытие research-stage закрыто: Tavily, DeepSeek и Gemini вернули usable results, runtime validation до `01-research` прошла без ошибок. При этом DeepSeek и Gemini используются как cross-check / synthesis providers, а source-backed evidence опирается на Tavily, web search и проверенные источники из `source-log.md`.

## Краткий вывод

A3 Pay стоит развивать не как отдельный кошелек и не как замену СБП, а как сценарный платежный слой по номеру телефона. Главная ценность: связать платежное намерение, проверенного получателя, выбор способа оплаты, чек, статус, напоминания и повторные действия.

Самые перспективные сценарии:

- verified payment request по номеру телефона;
- единый inbox счетов для ЖКХ, телеком, налогов, штрафов и подписок;
- smart checkout для e-commerce;
- family/shared payments;
- авто-платежи: покупка, импорт, владение, штрафы, ОСАГО, сервис;
- travel payment bundle;
- позднее: недвижимость и цифровой рубль.

## Исследовательские вопросы

- Какие способы оплаты используют пользователи в разных жизненных сценариях?
- Где платежные цепочки фрагментированы между банками, merchants, госорганами, агентами и поставщиками услуг?
- В каких точках A3 Pay может стать универсальным платежным инструментом по номеру телефона?
- Какие сценарии обладают лучшим коммерческим потенциалом?
- Какие claims можно считать source-backed, а какие нужно валидировать интервью и партнерскими данными?

## Аудитория документа

| Сегмент | Контекст | Мотивация | Барьер |
|---|---|---|---|
| Регулярный плательщик семьи | ЖКХ, связь, налоги, штрафы, подписки | оплатить вовремя и видеть статус | счета разбросаны, дедлайны и комиссии неочевидны |
| Пользователь с подписками | цифровые сервисы, recurring payments | контролировать будущие списания | страх скрытых списаний и сложная отмена |
| Путешественник | билеты, отели, страховки, возвраты | собрать поездку и не потерять платежи | несколько поставщиков и статусов |
| Покупатель/владелец авто | покупка, импорт, ОСАГО, штрафы, сервис | провести цепочку платежей без ошибок | разные участники и документы |
| Покупатель недвижимости | бронь, ипотека, escrow, госпошлины, владение | безопасно провести крупные платежи | высокий риск ошибки и мошенничества |
| Merchant / сервисный бизнес | checkout, invoices, refunds | получить оплату быстрее и дешевле | отказы платежей, ручная сверка, много PSP |

## Пользовательские задачи

| JTBD | Trigger | Pain | Desired outcome |
|---|---|---|---|
| Оплатить обязательство без ручного ввода реквизитов | пришел счет, штраф, налог или квитанция | реквизиты и статусы расходятся | проверенный счет, понятный способ оплаты, подтверждение принятия |
| Разрешить регулярный платеж и контролировать списания | нужно оформить, продлить или отменить подписку | пользователь боится скрытых списаний | центр подписок: лимиты, пауза, отмена, резервный способ оплаты |
| Оплатить поездку и доплаты | планируется поездка или возврат | несколько поставщиков и платежей | единый маршрут платежей, split, страховка, refund tracker |
| Провести авто-платежи | покупка, импорт, обслуживание | разные получатели и документы | verified requests, этапные платежи, чек-лист |
| Провести крупную сделку безопасно | недвижимость или дорогая услуга | высокий риск ошибки | verified recipient, статусы банка/реестра/поставщика |

## Выводы, подтвержденные источниками

- Банк России фиксирует рост альтернативных способов оплаты: СБП, QR, платежные приложения, электронные кошельки и биометрия растут на фоне снижения доли карточных операций.
- СБП стала инфраструктурной нормой: в 2025 году через СБП прошло 18,3 млрд операций на 103 трлн рублей, а число компаний, принимающих СБП, выросло до 3 млн.
- В IV квартале 2025 года переводами через СБП пользовались 7 из 10 жителей России, оплатой товаров и услуг - 5 из 10.
- E-commerce в России в 2025 году достиг примерно 11,5 трлн рублей по данным АКИТ, что делает checkout, возвраты, рассрочки и повторные платежи стратегической зоной.
- Цифровой рубль с 1 сентября 2026 года становится обязательным к предоставлению крупнейшими банками и к приему крупными торговыми компаниями; A3 Pay нужно готовить rail abstraction.
- Криптовалюта не является массовым легальным retail payment rail внутри РФ вне экспериментальных режимов, поэтому не должна входить в mass-market MVP.

## Сводка возможностей по сценариям

| Возможность | Сценарий | Пользовательская ценность | Бизнес-ценность | Приоритет |
|---|---|---|---|---|
| Verified payment request by phone | услуги, P2B, СБП | не вводить реквизиты, видеть получателя | low-friction acquisition | P0 |
| Unified bill inbox | ЖКХ, телеком, налоги, штрафы | все счета и дедлайны в одном месте | recurring engagement | P0 |
| Smart checkout button | e-commerce | один выбор: карта, СБП, BNPL | merchant conversion | P0 |
| Receipt and refund tracker | e-commerce, travel | понятный статус после оплаты | меньше support load | P1 |
| Family/shared payments | семья, образование, медицина | оплатить за близкого без хаоса | network effects | P1 |
| Auto payment hub | авто-владение | штрафы, ОСАГО, сервис, парковка | vertical expansion | P1 |
| Travel payment bundle | travel | билеты, отель, страховка, возвраты | partner revenue | P1 |
| Property payment checklist | недвижимость | безопасная сделка и платежи | high-ticket trust | P2 |
| Digital ruble ready rail | retail/gov future | готовность к новой форме оплаты | regulatory readiness | P2 |

## Конкурентный контекст

## Набор конкурентов

| Игрок | Покрытие | Сильные стороны | Gaps | Вывод для A3 Pay |
|---|---|---|---|---|
| СБП | C2C, C2B, QR, link, NFC, B2C | масштаб, низкая комиссия, phone identity | слабый post-payment слой | A3 Pay как UX/orchestration layer поверх СБП |
| Банковские приложения | платежи, переводы, ЖКХ, штрафы, подписки | доверие, KYC, счета, кредитные офферы | закрыты внутри одного банка | bank-neutral сценарный слой |
| ЮKassa / PSP | e-commerce checkout, карты, СБП, pay-сервисы | API, merchant tools, модули | merchant-first, не user journey-first | smart checkout + receipt/status |
| SberPay | ecosystem pay, QR/NFC | охват и доверие | lock-in экосистемы | open multi-bank alternative |
| T-Pay + Долями | pay + BNPL | сильный UX, оплата частями | зависимость от Т-Банка | BNPL как опция, не ядро |
| Яндекс Pay / Сплит | e-commerce, travel, ecosystem | частые покупки и loyalty | закрытая экосистема | utility/high-trust payments |
| Госуслуги / ФНС / ГИС ЖКХ | начисления и обязательные платежи | source of truth | разрозненный UX | verified charges + reminders |
| Цифровой рубль | future regulated rail | обязательное внедрение крупными игроками | новая инфраструктура | rail внутри unified checkout |

## Матрица позиционирования

| Параметр | СБП | Банки | PSP | Экосистемы | A3 Pay target |
|---|---|---|---|---|---|
| Оплата по номеру телефона | высокая | высокая | средняя | средняя | высокая |
| Нейтральность между банками | высокая | низкая | средняя | низкая | высокая |
| Сценарный слой пользователя | низкий | средний | низкий | средний | высокий |
| Merchant tooling | средний | средний | высокий | средний | средний/высокий |
| Чеки, возвраты, статус | низкий | средний | средний | средний | высокий |
| Family/shared payments | низкий | средний | низкий | средний | высокий |

## Активы A3

- Phone-first идентичность и платежный запрос.
- Потенциал работать поверх нескольких rails: СБП, карты, PSP, BNPL, цифровой рубль.
- Возможность владеть статусом сценария, а не только фактом списания денег.
- Нейтральность между банками и merchants.

## Незакрытые конкурентами разрывы

- Единая корзина проверенных обязательных платежей.
- Универсальный статус после оплаты: принят поставщиком, в обработке, возврат, спор.
- Оплата за близкого без пересылки реквизитов.
- High-trust payment checklist для авто, недвижимости и дорогих услуг.
- Merchant fallback: карта отказала, предложить СБП, BNPL или invoice link без потери checkout.

## Стратегическая рекомендация

Начинать с P0-сценариев, где уже есть частотность и привычка к phone-first платежам: verified payment request, unified bill inbox и smart checkout. High-ticket сценарии использовать как стратегическое расширение после появления доверия, партнерских интеграций и dispute/status механики.

## Прото-персоны

| Персона | Сегмент | Контекст | JTBD | Боль | Ценность A3 Pay | Evidence status |
|---|---|---|---|---|---|---|
| Регулярный плательщик семьи | Mass retail / family finance | Платит ЖКХ, связь, налоги, штрафы, подписки за себя и близких | Видеть обязательства заранее и закрывать их без ошибок | Разные приложения, дедлайны, комиссии и статусы | Unified bill inbox, reminders, verified charges, receipt/status | proto, needs interviews |
| Контролирующий подписки | Digital services / recurring payments | Пользуется множеством цифровых сервисов и боится неожиданных списаний | Разрешить регулярный платеж и контролировать будущие списания | Неочевидная отмена, failed recurring, скрытые условия | Subscription center, лимиты, пауза/отмена, резервный способ оплаты | proto |
| Организатор поездки | Travel / group payments | Покупает билеты, бронирует отель, оформляет страховку, делит расходы | Собрать все платежи поездки и не потерять возвраты | Несколько поставщиков, частичные возвраты, групповые платежи | Travel payment bundle, split, refund tracker | proto |
| Покупатель или владелец автомобиля | Auto ownership / high-trust services | Покупает, импортирует или обслуживает авто | Провести цепочку платежей по авто без потери статусов | Дилер, брокер, таможня, страховка и сервис требуют разные платежи | Auto payment hub, verified staged payments, receipt vault | proto |
| Merchant / сервисный бизнес | SME / e-commerce / services | Принимает карты, СБП, ссылки, иногда наличные | Получать оплату быстрее и с меньшим числом ошибок | Payment failures, ручная сверка, возвраты | Smart checkout, fallback routing, invoice by phone | proto |

## Матрица приоритета персон

| Персона | Частотность сценария | Готовность к MVP | Потенциал выручки | Риск доверия | Приоритет discovery |
|---|---|---|---|---|---|
| Регулярный плательщик семьи | высокая | высокая | средний | средний | P0 |
| Merchant / сервисный бизнес | высокая | высокая | высокий | средний | P0 |
| Контролирующий подписки | средняя | средняя | средний | средний | P1 |
| Покупатель или владелец автомобиля | средняя | средняя | высокий | высокий | P1 |
| Организатор поездки | средняя | средняя | средний | средний | P1 |

## Синтетические интервью и вопросы для интервью

## Ограничение по синтетическим интервью

Синтетические интервью используются только для формулировки гипотез. Они не заменяют реальные пользовательские интервью и не являются source-backed evidence.

## Синтетическое интервью 1: регулярные платежи

Пользователь хочет один список счетов, дат и статусов. Главный страх: заплатить не тому получателю, не увидеть подтверждение или пропустить дедлайн.

Что проверить: какие платежи вызывают больше всего раздражения, какие подтверждения нужны, готов ли пользователь доверить A3 Pay напоминания и оплату.

## Синтетическое интервью 2: подписки

Пользователь принимает удобство автосписаний, но хочет контроль: лимиты, пауза, отмена, уведомление до списания.

Что проверить: готовность переключить подписки в A3 Pay и требования к прозрачности recurring mandates.

## Синтетическое интервью 3: авто

Пользователь воспринимает авто как цепочку платежей: бронь, основная сумма, страховка, пошлины, штрафы, сервис.

Что проверить: willingness to use verified payment request для дилера, брокера и частного продавца.

## Синтетическое интервью 4: merchant

Merchant хочет меньше отказов и ручной сверки. Новый способ оплаты интересен только если снижает friction или стоимость.

Что проверить: готовность подключать A3 Pay SDK/link, acceptable fee, reconciliation needs.

## Вопросы для реальных интервью

- Какие 3 платежа в месяц вызывают больше всего раздражения?
- Где вы в последний раз перепроверяли реквизиты или боялись ошибиться?
- В каких сценариях вы готовы платить по номеру телефона, а где нет?
- Что должно быть на экране, чтобы вы доверили A3 Pay крупный платеж?
- Как вы сейчас отслеживаете подписки, квитанции и возвраты?
- Как merchant сегодня обрабатывает failed payments и возвраты?

## CJM и сценарии

## Общая модель CJM

Для A3 Pay платежный путь состоит не только из списания денег. Минимальная модель:

| Этап | Что происходит | Что должен сделать A3 Pay | Риск без A3 Pay |
|---|---|---|---|
| 1 | Возникло обязательство или желание купить | Принять intent: счет, корзина, запрос, напоминание | пользователь ищет реквизиты вручную |
| 2 | Пользователь видит получателя, сумму, срок и причину | Показать проверенного получателя и основание платежа | ошибка получателя или мошенническая ссылка |
| 3 | Пользователь выбирает способ оплаты | Дать выбор rail: СБП, карта, BNPL, wallet, цифровой рубль future | отказ платежа или лишний friction |
| 4 | A3 Pay отправляет платеж в rail | Выполнить routing, fallback и подтверждение | checkout drop-off, ручная сверка |
| 5 | Пользователь получает чек и статус | Сохранить чек, receipt vault, статус принятия | непонятно, дошли ли деньги |
| 6 | Возникает повтор, возврат, спор или следующий платеж | Напомнить, отследить refund/dispute, предложить повтор | пользователь теряет историю и доверие |

## Матрица сценариев CJM

| Сценарий | Этапы пути | Основные платежи | Главные боли | Роль A3 Pay | Приоритет |
|---|---|---|---|---|---|
| ЖКХ, телеком, налоги, штрафы | начисление -> проверка -> оплата -> подтверждение -> повтор | квитанции, лицевые счета, ЕНС, УИН, штрафы, связь | дедлайны, комиссии, разные статусы, бумажные квитанции | unified bill inbox, reminders, verified charge discovery, receipt/status | P0 |
| E-commerce | checkout -> подтверждение -> доставка -> возврат | карта, СБП, pay-сервисы, BNPL, доплаты | choice overload, failed payments, возвраты, неясный статус | smart checkout, method routing, fallback, receipt/refund tracker | P0 |
| Авто | выбор -> бронь -> финансирование -> оформление -> эксплуатация -> продажа | предоплата, основная сумма, кредит, ОСАГО, госпошлины, штрафы, парковка, сервис | разные получатели, лимиты, возвраты, подтверждения, частные сделки | auto payment hub, verified staged payments, receipt vault | P1 |
| Travel | планирование -> бронирование -> поездка -> изменения -> возвраты | билеты, отель, страховка, доплаты, групповые расходы | несколько поставщиков, частичные возвраты, split, изменения | travel payment bundle, split, refund tracker | P1 |
| Family/shared payments | запрос -> согласование -> оплата -> подтверждение -> история | платежи за близких, образование, медицина, подписки | пересылка реквизитов, кто платил, отсутствие общего статуса | shared requests, payer roles, family payment history | P1 |
| Недвижимость | поиск -> бронь -> ипотека -> сделка -> регистрация -> владение | бронь, оценка, страховка, комиссия, escrow/аккредитив/перевод, госпошлины, ЖКХ, налоги | крупные суммы, доверие к получателю, много участников, документы, страх ошибки | property payment checklist, verified requests, статусы банка/реестра/поставщиков | P2 |
| Цифровой рубль | выбор rail -> подтверждение -> списание -> чек -> спор/возврат | retail/gov payments через новый rail | новая инфраструктура, UX и acceptance uncertainty | rail abstraction inside unified checkout | P2 |

## P0 CJM: unified bill inbox

| Этап | Цель пользователя | Платежные действия | Участники | Боли | Возможность A3 Pay |
|---|---|---|---|---|---|
| Начисление | Узнать, что нужно оплатить | Получить счет, штраф, налог, квитанцию | поставщик, ГИС ЖКХ, ФНС, ГИБДД, оператор | счета разбросаны | charge discovery по номеру телефона/профилю |
| Проверка | Убедиться, что счет настоящий | Сверить сумму, срок, получателя | пользователь, поставщик | риск ошибки и фейковых реквизитов | verified recipient + reason |
| Оплата | Быстро закрыть обязательство | Выбрать СБП/карту/иной rail | банк, PSP, A3 Pay | комиссии и разные UX | single payment chooser |
| Подтверждение | Понять, что платеж принят | Получить чек и статус поставщика | поставщик, банк, A3 Pay | чек есть, а принятие не видно | receipt/status tracker |
| Повтор | Не пропустить следующий срок | Настроить напоминание или автоплатеж | пользователь, A3 Pay | дедлайны забываются | reminders, limits, recurring control |

## P0 CJM: smart checkout

| Этап | Цель пользователя | Платежные действия | Участники | Боли | Возможность A3 Pay |
|---|---|---|---|---|---|
| Checkout | Завершить покупку | Выбрать способ оплаты | merchant, PSP, банк | слишком много вариантов | A3 Pay button with best rail |
| Подтверждение | Не ошибиться и не потерять заказ | Подтвердить сумму и получателя | merchant, A3 Pay | недоверие к ссылке/форме | verified merchant request |
| Fallback | Завершить платеж после отказа | Переключиться с карты на СБП/BNPL/link | банк, PSP | payment failed, корзина теряется | method routing + fallback |
| Доставка | Видеть статус после оплаты | Сопоставить чек и заказ | merchant, logistics | оплата отдельно от заказа | receipt/order status |
| Возврат | Понять, когда вернут деньги | Отследить refund/dispute | merchant, банк, PSP | refund opaque | refund tracker |

## ICE/RICE бэклог

| Сценарий | Impact | Confidence | Ease | ICE |
|---|---:|---:|---:|---:|
| Verified payment request by phone | 9 | 8 | 7 | 504 |
| Smart checkout button | 8 | 7 | 7 | 392 |
| Family/shared payments | 7 | 6 | 7 | 294 |
| Auto payment hub | 8 | 6 | 5 | 240 |
| Travel payment bundle | 7 | 5 | 5 | 175 |
| Property payment checklist | 9 | 5 | 3 | 135 |
| Unified bill inbox | 9 | 7 | 6 | 126 |
| Digital ruble rail | 6 | 6 | 3 | 108 |

| Сценарий | Reach | Impact | Confidence | Effort | RICE |
|---|---:|---:|---:|---:|---:|
| Verified payment request by phone | 8 | 3 | 0.8 | 4 | 4.8 |
| Smart checkout button | 8 | 2 | 0.7 | 4 | 2.8 |
| Unified bill inbox | 7 | 3 | 0.7 | 6 | 2.5 |
| Family/shared payments | 6 | 2 | 0.6 | 3 | 2.4 |
| Auto payment hub | 5 | 3 | 0.6 | 7 | 1.3 |
| Digital ruble rail | 5 | 2 | 0.6 | 8 | 0.8 |
| Travel payment bundle | 4 | 2 | 0.5 | 6 | 0.7 |
| Property payment checklist | 2 | 3 | 0.5 | 9 | 0.3 |

## Детализация бэклога

## P0: Verified payment request by phone

Пользователь получает запрос по номеру телефона, видит verified recipient, сумму, назначение, срок и выбирает rail: СБП, карта, PSP, позже цифровой рубль. Это ядро A3 Pay.

## P0: Unified bill inbox

Единый список обязательных платежей: ЖКХ, телеком, налоги, штрафы, подписки. Ценность: частотность, retention, trust.

## P0: Smart checkout

Merchant-side кнопка A3 Pay с routing: карта, СБП, BNPL, fallback, receipt/refund tracker. Ценность: conversion и снижение failed payments.

## P1: Family/shared payments

Оплата за близкого без пересылки реквизитов: payment request, permission, receipt, status.

## P1: Auto payment hub

Пакет платежей авто: бронь, оплата, ОСАГО, штрафы, сервис, парковка, налоги, receipt vault.

## P1: Travel payment bundle

План платежей поездки: билеты, отель, страховка, split, возвраты.

## P2: Property payment checklist

High-trust сценарий для недвижимости: verified payment stages, банк/реестр/поставщик, документы и статусы.

## Roadmap и SWOT

## Roadmap на 12-24 месяца

### 0-6 месяцев

- MVP: payment request by phone.
- Verified recipient.
- Method choice: СБП, карта, PSP.
- Receipt/status.
- Пилоты: ЖКХ/телеком/малые сервисы.

### 6-12 месяцев

- Unified bill inbox.
- Smart checkout SDK.
- Family/shared payments.
- Subscription control.

### 12-18 месяцев

- Auto payment hub.
- Travel payment bundle.
- BNPL/credit partner offers with transparent cost display.

### 18-24 месяца

- Property payment checklist.
- Digital ruble rail readiness.
- Advanced reconciliation for merchants and document-linked payments.

## SWOT

| Type | Points |
|---|---|
| Strengths | phone-first привычка рынка, multi-rail orchestration, scenario UX |
| Weaknesses | зависимость от банковских/merchant интеграций, trust burden, unit economics |
| Opportunities | рост СБП, recurring payments, checkout routing, цифровой рубль |
| Threats | копирование банками и экосистемами, регулирование BNPL, медленные гос/ЖКХ интеграции |

## План валидации, провайдеры и источники

## План валидации исследования

- 12-15 пользовательских интервью: ЖКХ, авто, travel, subscriptions, e-commerce.
- 6-8 merchant interviews: e-commerce, сервисы, УК/ЖКХ, travel, education.
- 4 expert interviews: PSP, банк, compliance, BNPL.
- Quant survey на 600+ респондентов по trust, willingness to use phone-first payment request и сценарному спросу.

## Гипотезы для проверки

- Пользователи готовы использовать phone-first payment request для регулярных платежей, если видят verified recipient и чек.
- Merchant value выше в smart checkout/reconciliation, чем в простом новом способе оплаты.
- High-ticket сценарии требуют отдельного trust layer и не подходят как самый первый MVP.
- BNPL должен быть опцией, а не главным позиционированием A3 Pay.

## Покрытие источников и провайдеров

| Provider | Status | Notes |
|---|---|---|
| Tavily | pass | returned usable sources; noisy hits filtered from publication pack |
| DeepSeek | pass | cross-check provider, not source-backed evidence |
| Gemini | pass | strategy/cross-check provider, not source-backed evidence |
| Web/source log | pass | primary source-backed layer for publication claims |

## Выводы DeepSeek/Gemini cross-check

- Синтетические выводы нельзя переносить как рыночные факты без источников.
- High-ticket payments require stronger verification and dispute/status mechanisms.
- Claims about market size, adoption and willingness-to-pay need primary sources or interviews.

## Источники

- Банк России: https://www.cbr.ru/psystem/b_doc/onrnps/
- Банк России, СБП: https://www.cbr.ru/analytics/nps/sbp/4_2025/
- Банк России, прием СБП: https://www.cbr.ru/press/event/?id=28285
- Банк России, наличный оборот: https://www.cbr.ru/press/event/?id=28491
- Банк России, итоги платежей и расчетов 2025: https://www.cbr.ru/about_br/publ/results_work/2025/razvitie-sistemy-platey-i-raschetov/
- Банк России, цифровой рубль: https://www.cbr.ru/Reception/TopicalMessage/Page/7845
- Банк России, прием цифрового рубля: https://www.cbr.ru/fintech/dr/accepting_payments_dr/
- Банк России, криптовалюта и ЭПР: https://www.cbr.ru/press/event/?id=23448
- АКИТ / ComNews, e-commerce 2025: https://www.comnews.ru/content/243883/2026-02-19/2026-w08/1009/akit-obem-internet-torgovli-rossii-2025-godu-vyros-28
- Автостат / Forbes, авторынок 2025: https://www.forbes.ru/biznes/553391-prodazi-novyh-avtomobilej-v-rossii-v-2025-godu-upali-na-15-5
- Автостат / Российская газета, импорт авто: https://rg.ru/2026/02/26/import-idet-vniz-vvoz-avtomobilej-v-rossiiu-sokratilsia-na-59.html
- Институт Гайдара, booking channels: https://www.iep.ru/en/66-of-hotel-rooms-in-russia-are-booked-directly-and-only-34-through-aggregators.html
- Минцифры / Интерфакс, Госуслуги: https://www.interfax-russia.ru/moscow/news/chislo-polzovateley-portala-gosuslugi-dostiglo-120-mln-mincifry-rf
- ФНС, ЕНС: https://www.nalog.gov.ru/rn77/ens/
- ЮKassa: https://yookassa.ru/
- T-Bank developer docs: https://developer.tbank.ru/ecosystembundle/scenarios/payments/b-side/alt
- T-Банк, Долями: https://www.tbank.ru/finance/blog/dolyame-for-all/
- BNPL market / Банковское обозрение: https://bosfera.ru/press-release/obem-rynka-bnpl-servisov-dostig-940-mlrd-rubley-v-2025-godu
- Банк России, BNPL regulation review: https://www.cbr.ru/Collection/Collection/File/60978/4q_2025_1q_2026.pdf
