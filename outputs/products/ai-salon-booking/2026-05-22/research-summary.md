# Research Summary

## Context

Исследуем лендинг для AI-сервиса, который помогает салонам красоты автоматизировать запись клиентов. Цель лендинга - конвертировать владельцев и администраторов в заявку на демо.

## Recursive Brief Input

- Source: пользовательский запрос "Сделай лендинг для сервиса, который помогает салонам красоты автоматизировать запись клиентов через AI".
- Key assumptions: рынок уже знаком с online booking; AI-ценность должна быть не "календарь", а автоматическая обработка входящих заявок, переносов, напоминаний и повторных записей.
- Open questions: география, цена, интеграции, реальные каналы заявок, юридические требования к персональным данным.

## Research Questions

- Какие боли у салонов вокруг записи и администрирования?
- Как конкуренты формулируют ценность booking/AI booking?
- Какой оффер для первого экрана наиболее правдоподобен без кейсов?

## Audience

| Segment | Context | Motivation | Barrier |
|---|---|---|---|
| Владелец небольшого салона | Отвечает за загрузку мастеров, выручку и администраторов. | Больше записей без найма второго администратора. | Боится ошибок AI и потери контроля. |
| Администратор салона | Обрабатывает звонки, мессенджеры, отмены, переносы. | Меньше рутины и ручных напоминаний. | Не хочет сложную систему поверх текущего хаоса. |
| Solo-мастер / micro-studio | Сам делает услуги и отвечает клиентам между процедурами. | Не терять клиентов, которые пишут во время работы или ночью. | Ограниченный бюджет и низкая терпимость к настройке. |

## Jobs To Be Done

| Segment | JTBD | Pain | Desired outcome |
|---|---|---|---|
| Владелец | Когда заявки приходят в разные каналы, хочу автоматически доводить клиента до записи. | Потерянные сообщения, пустые окна, no-show. | Заполненный календарь и контроль качества записи. |
| Администратор | Когда клиент хочет перенести запись, хочу быстро предложить доступные слоты. | Переписка туда-сюда, ошибки в расписании. | Быстрый перенос без ручного сравнения календарей. |
| Solo-мастер | Когда я занят с клиентом, хочу чтобы сервис ответил вместо меня. | Ответы вечером, пропущенные заявки. | Клиент получил слот, а мастер не отвлекался. |

## Proto Personas

| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|---|
| Марина, владелец nail-студии | Малый салон | Закрыть входящие заявки без второго администратора | Клиенты пишут в Instagram/WhatsApp после работы | Потерянные заявки и ручные напоминания | Больше подтвержденных записей | proto |
| Ольга, администратор салона | Салон 5-10 мастеров | Быстро обрабатывать переносы | Клиент не может прийти и просит другое время | Нужно сверять мастера, услугу, длительность | 2-3 подходящих слота за минуту | proto |
| Дима, барбер | Solo-мастер | Записывать клиентов во время процедур | Клиент пишет, пока мастер занят | Ответ через 2 часа, клиент ушел к другому | Ответ и бронь без отвлечения | proto |

## Synthetic Interviews

Симулированные интервью используются только для генерации гипотез и вопросов проверки. Они не считаются evidence реального пользовательского поведения.

| Interview | Persona | Scenario | Objection | Opportunity | Validation need |
|---|---|---|---|---|---|
| S1 | Марина | Хочет меньше пустых окон в будни | "AI запишет не на ту услугу" | Правила услуг, длительности и ручное подтверждение спорных записей | Проверить на интервью |
| S2 | Ольга | Переносы и отмены в течение дня | "Мне быстрее самой" | Быстрые варианты слотов и шаблоны ответов | UX-тест с администраторами |
| S3 | Дима | Работает без администратора | "Не хочу платить за сложную CRM" | Простой setup, booking link и мессенджер | Проверить willingness-to-pay |

## Competitors and Alternatives

| Name | Category | Positioning | Source | Notes |
|---|---|---|---|---|
| Fresha | Direct / all-in-one salon software | 24/7 online booking, calendar, marketplace, salon management | https://www.fresha.com/for-business/features | Сильный all-in-one competitor. |
| Square Appointments | Direct / appointment platform | Online booking, reminders, payments, cancellation fee/prepayment | https://apps.apple.com/us/app/square-appointments/id1023050786 | Особенно релевантно для Square users. |
| Acuity Scheduling | Indirect / scheduling platform | Scheduling, payments, reminders, packages | https://www.techradar.com/pro/website-building/squarespace-acuity-review-year | Не salon-specific, но решает scheduling. |
| Booksy | Direct / marketplace + booking | Booking, reminders, client management, marketing tools | https://en.wikipedia.org/wiki/Booksy | Сильный consumer marketplace angle. |
| Zyloe | Direct / AI salon software | AI phone answering, booking, deposits, CRM automation | https://zyloe.com/ | Прямой AI-позиционинг. |
| Willo | Direct / AI booking for beauty pros | AI assistant, booking page, deposits, reminders | https://www.gowillo.com/ | Близкий offer для beauty pros. |
| Статус-кво | Alternative | WhatsApp/Instagram вручную, Google Calendar, таблицы | hypothesis | Главная альтернатива для small salons. |

## Competitive Analysis

| Competitor | Type | Core offer | Key features | Pricing signal | Proof/trust | Weakness / gap | Opportunity for us |
|---|---|---|---|---|---|---|---|
| Fresha | direct | Salon management + booking | 24/7 booking, calendar, marketplace | source | Mature brand | Может быть шире и тяжелее, чем нужно small salon | AI-first assistant for incoming messages |
| Square Appointments | direct | Booking + payments | reminders, prepayment, cancellation fee | source | Square ecosystem | Less specialized for AI conversation | Position as AI layer around booking |
| Acuity | indirect | General scheduling | reminders, payments, packages | source | Known scheduling tool | Not salon-native AI receptionist | Beauty-specific scripts and rules |
| Zyloe/Willo | direct | AI booking for salons | AI assistant, deposits, reminders | source | AI positioning | Need differentiation | Russian-language/local messaging, simple demo-first offer |
| Manual admin | status quo | Human replies | flexible, familiar | hypothesis | Already in use | slow, inconsistent, no 24/7 | "AI handles routine, admin controls exceptions" |

## SWOT

| Quadrant | Item | Rationale | Evidence / status | Implication |
|---|---|---|---|---|
| Strength | AI handles asynchronous inquiries | Beauty clients often contact outside admin focus hours. | hypothesis + competitor positioning | Hero should focus on not missing clients. |
| Strength | Reminders and deposits are familiar | Competitors use reminders/no-show protection as standard value. | source | Use as expected feature, not unique claim. |
| Weakness | No proof yet | Product has no case studies in input. | needs validation | Avoid exact uplift numbers. |
| Weakness | Integration ambiguity | Existing salon tools vary. | needs validation | Present as demo/discovery item. |
| Opportunity | AI scheduling is becoming visible | Recent salon trend reports and competitors mention AI scheduling. | source | Category education is easier. |
| Opportunity | Small salons may not need full POS | Many need messaging + booking first. | hypothesis | Narrow MVP can compete on simplicity. |
| Threat | All-in-one incumbents | Fresha/Square/Booksy already own booking workflows. | source | Need sharper AI conversational wedge. |
| Threat | Trust and privacy concerns | AI handles client names, phones, service preferences. | hypothesis | Add control, handoff, data-safety copy. |

## Findings

| Finding | Evidence | Confidence |
|---|---|---|
| Online booking, reminders, payments/deposits are baseline expectations in salon software. | Fresha, Square Appointments, Acuity, Willo sources | high |
| AI-positioning should emphasize response automation and booking conversion, not just a calendar. | Zyloe/Willo/SalonSub positioning | medium |
| Claims like "reduce no-shows by 70-80%" appear in competitor marketing, but cannot be claimed for this product without proof. | Competitor pages | high |
| Trust message must show admin control and exception handling. | hypothesis based on AI risk | medium |

## Positioning Options

- Option 1: AI-администратор для салона, который отвечает клиентам и записывает их, пока команда занята.
- Option 2: Умная запись для beauty-бизнеса: мессенджеры, свободные окна и напоминания в одном сценарии.

## Key Messages

- Клиент получает быстрый ответ и доступные слоты без ожидания администратора.
- Салон задает правила, расписание и исключения; AI не забирает контроль.
- Заявки, переносы и напоминания становятся повторяемым процессом.

## Assumptions

- MVP рассчитан на small/mid beauty business, не на enterprise spa chains.
- Основной канал заявки - мессенджер или сайт.
- Главный CTA - демо, а не самостоятельная покупка.

## Unknowns

- Цена и модель оплаты.
- Реальные интеграции.
- География и требования к персональным данным.
- Результаты пилотов и кейсы.
