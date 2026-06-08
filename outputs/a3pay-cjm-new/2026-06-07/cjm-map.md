# CJM-карта платежных сценариев России для A3 Pay

## Использованные входные материалы

- `research-summary.md`
- `recursive-brief.md`
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- Источники Банка России, СБП/НСПК, Data Insight, отраслевые источники

## Карта платежной экосистемы

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

## CJM 1: ЖКХ и регулярные счета

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Получить начисление | Понять сумму и срок | Получает квитанцию/уведомление | Бумага, email, ГИС ЖКХ, банк | УК, РСО, пользователь | Документы в разных местах | Не увидел счет | Phone-linked bill inbox |
| Проверить | Убедиться, что начисление корректно | Сверяет счетчики/период | App/web | Пользователь, УК | Непонятные строки | Откладывает оплату | Explanation layer and history |
| Оплатить | Заплатить без комиссии | СБП/Мир/карта | Банк, Госуслуги, QR | Банк, НСПК | Комиссии и ручной ввод | Ошибка реквизитов | Best rail selection |
| Подтвердить | Сохранить чек | Получает чек/status | Bank app, email | Банк, УК | Статус не обновился | Повторное обращение | Receipt/status vault |
| Повторить | Не забыть следующий месяц | Напоминание/автоплатеж | Push/SMS | Пользователь | Пропуск срока | Пени | Smart reminders |

## CJM 2: Повседневные услуги и малый бизнес

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Договориться | Получить услугу | Запись/заказ | Messenger, phone | Клиент, мастер/клиника/школа | Нет формального invoice | Недоверие | Merchant profile by phone |
| Предоплата | Забронировать слот | Перевод/ссылка/QR | Bank app, messenger | Клиент, merchant | "Переведи на карту" выглядит небезопасно | Отказ от предоплаты | Phone invoice with terms |
| Оплата | Закрыть сумму | СБП/карта | Link, QR, app | Банк, merchant | Нет чека/назначения | Спор | Receipt and purpose |
| Возврат/перенос | Решить exception | Частичный возврат | Bank/merchant | Клиент, merchant | Ручная переписка | Негатив | Refund workflow |
| Повтор | Вернуться | Сохраненный merchant | App | Клиент | Забытые реквизиты | Потеря клиента | Favorite merchants |

## CJM 3: E-commerce long-tail

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Checkout | Быстро оплатить | Выбор способа | Web/mobile | Покупатель, merchant | Слишком много вариантов | Abandonment | Unified selector |
| Confirm | Подтвердить платеж | Банк app/3DS/QR | Bank app | Банк, PSP | Переключение контекста | Timeout | Deep link fallback |
| Delivery/refund | Видеть статус | Refund/partial capture | Merchant app | Merchant, PSP | Неясно, куда вернут деньги | Support load | Status vault |
| Reorder | Повторить покупку | Saved route | App/web | Покупатель | Реквизиты/карта устарели | Потеря repeat | Phone alias + rail fallback |

## CJM 4: Путешествие

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Plan | Найти билеты/отель | Сравнение цены и условий | OTA/bank travel | OTA, пользователь | Высокий чек | Откладывание | Payment plan preview |
| Book | Забронировать | Предоплата/полная оплата | Card/СБП/BNPL | OTA, банк | Время подтверждения | Ошибка оплаты | Multi-rail checkout |
| Change/cancel | Вернуть/перенести | Refund, fee | Support | OTA, airline, hotel | Длинный возврат | Негатив | Refund tracker |
| Travel | Использовать ваучеры/loyalty | Доплаты | App/POS | Пользователь | Разные currencies/limits | Cash fallback | Receipt vault |

## CJM 5: Авто

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Выбор | Проверить авто/условия | Бронь/задаток | Dealer site, Госуслуги | Покупатель, дилер | Недоверие к задатку | Нет оплаты | Safe deposit invoice |
| Финансирование | Получить кредит | Заявка/одобрение | Bank/dealer | Банк, дилер | Длинный funnel | Отказ/ожидание | Credit handoff status |
| Сделка | Оплатить остаток | Аккредитив/перевод/касса | Bank, dealer | Покупатель, банк | Страх ошибки | Delay | Deal checklist |
| После покупки | Оплатить сервис/страховку | Полисы/ТО | App, POS | Страховая, сервис | Много отдельных счетов | Пропуск | Ownership bills hub |

## CJM 6: Недвижимость

| Stage | Goal | Payment actions | Channels | Actors | Pain/barrier | Drop-off | A3 Pay integration |
|---|---|---|---|---|---|---|---|
| Подбор | Понять бюджет | Ипотечный расчет | Bank/developer | Покупатель, банк | Неясная полная стоимость | Отказ | Budget and rail planner |
| Бронь | Закрепить объект | Бронь/задаток | Developer/bank | Покупатель, застройщик | Доверие и возврат | Спор | Safe invoice |
| Сделка | Перевести крупную сумму | Эскроу/аккредитив | Bank/Rosreestr | Банк, Росреестр | Сложная последовательность | Delay | Status companion |
| Владение | Платить ЖКХ/налоги/страховку | Регулярные счета | Госуслуги, банк | УК, ФНС, банк | Разные кабинеты | Просрочка | Property bills hub |
