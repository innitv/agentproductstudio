# Competitive Analysis: voice/smart-home + ЖКУ payments

## Market Map

| Конкурент / игрок | Тип сценария | Сильные стороны | Слабые стороны | Возможность для A3 |
|---|---|---|---|---|
| Яндекс Smart Building | smart building assistant | Алиса уже входит в сервисы жилого комплекса: домофон, пропуск, шлагбаум, камеры | Оплата ЖКУ публично не заявлена | Добавить A3 как платежно-статусный слой к домовым сервисам |
| Яндекс Smart Home | smart home command platform | Account linking, состояние устройств, команды, сценарии | Команды устройствам ниже по риску, чем денежные операции | Использовать паттерн состояния объекта, но подтверждать деньги отдельно |
| Госуслуги.Дом / ГИС ЖКХ | ЖКУ-инфраструктура | Объект, начисления, показания, обращения, статусы | Не conversational-first и не smart-home channel | A3 может дать Алисе доменный слой счетов и статусов |
| Банки и bill-pay apps | платежный сценарий | Платеж, чек, банковский статус | Слабый домовой контекст и слабое объяснение статуса поставщика | Связать платеж с объектом, поставщиком и квитированием |
| Alexa / Google Home patterns | voice assistant trust | Account linking, consent, state reporting, PIN patterns | Не являются proof ЖКУ-платежей через Алису | Перенять consent/confirmation модель для безопасного MVP |

## Аналоги

| Аналог | Что можно брать | Что нельзя утверждать |
|---|---|---|
| Яндекс Smart Building | Канал "Алиса как интерфейс жилого комплекса"; связка аккаунта ЖК и Яндекс ID; привычные команды дома | Что там уже есть платежи ЖКУ |
| Яндекс Smart Home | Сценарии, состояние объектов, уведомления, mobile app handoff | Что device command model достаточно безопасен для платежей |
| Госуслуги.Дом | Доменные сценарии: счет, показания, обращения, долг | Что пользователь хочет именно голосовую оплату |
| Alexa/Google Home docs | Account linking, consent, state reporting, PIN/confirmation patterns | Что западные smart-home platforms поддерживают ЖКУ-платежи как стандарт |
| Bill payment networks | Агрегация счетов, получатели, подтверждение платежа | Что это conversational UI |

## Differentiation for A3

| Product angle | Why it matters | MVP implication |
|---|---|---|
| Дом как объект, а не платежная категория | Пользователь говорит "за квартиру", а не "найти поставщика ЖКУ" | Начинать с адреса/роли/объекта |
| Статусная цепочка после оплаты | Главная боль: долг висит после банковской операции | Сделать timeline обязательным |
| Семейная роль | Много платежей за родителей/вторые объекты | Создать `family_payer`, не полный доступ |
| Голос как подготовка, приложение как подтверждение | Shared device и ошибочное распознавание делают voice-only risky | Финальное списание только в защищенном UI |
| A3 как нормализатор | У Алисы нет доменного слоя ЖКУ, у банка нет полного домового контекста | A3 связывает объект, начисление, получателя, статус, чек |

## Main Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Voice-only payment creates safety and fraud concerns | high | app/bank confirmation, PIN/biometry, no one-phrase autopay |
| Shared speaker exposes address/debt/sum | high | privacy-aware voice response, details only in app |
| Multiple objects cause wrong payment | high | explicit object disambiguation and read-back |
| Supplier status updates late | high | separate bank/supplier/GIS statuses |
| Yandex skill/payment policy blocks flow | high | validate with Yandex partner/legal before PRD |
| A3 lacks supplier reconciliation | medium/high | start with bill presentment/reminders if status unavailable |
| Exact market proof is weak | medium | position as differentiated opportunity, test with prototype |

## Recommended Competitive Position

A3 should not pitch this as "мы добавим оплату в колонку". Better:

> "Мы добавляем в Алису домовой финансовый контекст: счет, статус, показания, напоминания и безопасный переход к оплате."

That position avoids overpromising voice payments and centers the durable value: state, trust, roles and proof.
