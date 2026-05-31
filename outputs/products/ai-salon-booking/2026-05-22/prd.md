# PRD

## 1. Context

Строим лендинг для AI-сервиса автоматизации записи клиентов в салонах красоты. Рынок уже знаком с online booking, поэтому лендинг должен быстро объяснить отличие: AI отвечает на входящие заявки, предлагает доступные слоты, помогает с переносами и напоминаниями, а администратор сохраняет контроль.

## 2. Problem Statement

Салоны теряют заявки, когда клиент пишет вне рабочего времени, администратор занят или запись требует переписки по услугам, мастерам и времени. Ручная обработка приводит к задержкам, ошибкам, пустым окнам и лишней нагрузке на команду.

## 3. Goals

- Конвертировать владельца/администратора в заявку на демо.
- Объяснить ценность AI без неподтвержденных promises.
- Снять страх потери контроля над расписанием.
- Собрать минимальные данные для qualification.

## 4. Non-goals

- Не продавать full POS/CRM как готовый факт.
- Не обещать конкретное снижение no-show без кейсов.
- Не реализовывать реальную интеграцию с календарем в этой итерации.
- Не публиковать во внешние сервисы без approval.

## 5. Users and Jobs To Be Done

| Segment | JTBD | Pain | Desired outcome |
|---|---|---|---|
| Владелец салона | Автоматизировать входящие заявки без найма | Потерянные клиенты, пустые окна | Больше подтвержденных записей |
| Администратор | Быстро обрабатывать записи и переносы | Ручная переписка, ошибки | AI предлагает слоты и шаблоны |
| Solo-мастер | Не отвлекаться во время услуг | Поздние ответы клиентам | Клиент записан, мастер работает |

## 6. Scope

### MVP

- Лендинг с hero, problem, how it works, features, trust, demo form, FAQ.
- Демо-сценарий "клиент пишет - AI предлагает слоты - запись подтверждена".
- Форма заявки: имя, телефон/email, тип бизнеса, число мастеров, основной канал заявок.
- Analytics plan для CTA и формы.

### Later

- Интерактивный booking simulator.
- Калькулятор потерь от пропущенных заявок.
- Интеграции с календарями/CRM.
- Кейсы и ROI-модель после пилотов.

### Out of scope

- Реальный backend.
- Реальная отправка SMS/WhatsApp.
- Обработка платежей и депозитов.
- Figma-прототип без предоставленной Figma-ссылки.

## 7. Requirements

| ID | Requirement | MoSCoW | Rationale | Notes |
|---|---|---|---|---|
| R1 | Первый экран объясняет AI-запись и содержит CTA на демо | Must | Primary conversion | CTA: "Получить демо" |
| R2 | Секция показывает 3-step flow записи | Must | Снимает абстрактность AI | Клиент -> AI -> подтверждение |
| R3 | Форма заявки собирает qualification | Must | Business goal | Без внешней отправки |
| R4 | Claims помечены без неподтвержденных процентов | Must | Research integrity | "помогает снизить", не "снижает на X%" |
| R5 | Trust section объясняет правила и handoff администратору | Must | AI adoption | Контроль расписания |
| R6 | FAQ закрывает интеграции, безопасность, setup | Should | Objection handling | Часть ответов needs validation |
| R7 | Responsive mobile-first layout | Must | Салоны часто работают с телефона | Static prototype |
| R8 | SEO metadata | Should | Discoverability | Salon booking AI |
| R9 | Visual product mockup | Should | Показывает интерфейс | HTML mockup |

## 7.1 MoSCoW Prioritization

| Priority | Definition | Features / Requirements |
|---|---|---|
| Must | Required for primary user flow, business goal or legal/security constraint. | R1, R2, R3, R4, R5, R7 |
| Should | Important but not blocking the first valid prototype. | R6, R8, R9 |
| Could | Useful enhancement if time/scope allows. | Calculator, booking simulator, testimonials |
| Won't | Explicitly excluded from this iteration. | Backend, real messaging, payments, production integrations |

## 8. Acceptance Criteria

- Given visitor opens landing, When hero is visible, Then value and primary CTA are understandable within first screen.
- Given visitor worries about AI mistakes, When reading trust section, Then they see rules, manual override and exception handoff.
- Given visitor submits demo form, When required fields are filled, Then success state appears locally.
- Given mobile viewport, When page is loaded, Then CTA, form and content remain readable without overlap.

## 9. Analytics

| Event | Trigger | Properties |
|---|---|---|
| `landing_view` | Page load | `slug`, `source` |
| `hero_cta_click` | Click primary hero CTA | `section`, `cta_text` |
| `secondary_cta_click` | Click preview CTA | `section`, `cta_text` |
| `demo_form_start` | First form input focus | `field` |
| `demo_form_submit` | Demo form submit | `business_type`, `team_size`, `lead_channel` |
| `faq_open` | FAQ item opened | `question_id` |

## 10. Team Handoff / Notion

- Executive summary: лендинг для AI-автоматизации записи beauty-клиентов с demo CTA.
- Decisions needed: название продукта, цена, интеграции, compliance policy.
- Owner: product/orchestrator.
- Reviewers: design, frontend, legal/privacy.
- Target Notion page/database: not set.
- Publication status: draft.

## 11. Risks and Assumptions

- Риск: без реального продукта форма и демо являются lead-gen prototype.
- Риск: AI claims требуют пилотов.
- Допущение: пользователь принимает русский язык и B2B SaaS tone.

## 12. Open Questions

- Как называется продукт?
- Какие каналы реально поддерживаются: WhatsApp, Instagram, Telegram, телефон, сайт?
- Есть ли политика обработки персональных данных?
- Есть ли пилотные салоны?
