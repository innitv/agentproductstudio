# Run Plan

## Контекст

Пользователь попросил глубокое исследование идеи для A3: интеграция платежей ЖКУ и связанных домовых сценариев в Яндекс Алису / приложение умного дома. Предыдущая ветка A3 рассматривала платежные сценарии в банковских приложениях и разделе "Дом"; новый фокус — conversational layer: чат/голос с умным домом, безопасное подтверждение платежа, статусы после оплаты, показания и семейные сценарии.

## Тип работы

`standalone research/CJM/market research`.

Каталог выполнения: `research/projects/a3-yandex-alice-utilities-smart-home-research/2026-06-30/`.

## Минимально достаточный маршрут

1. Прочитать существующий A3 run как context source, не переписывая его.
2. Собрать аналоги: Яндекс Smart Home / Smart Building, Госуслуги.Дом / ГИС ЖКХ, voice assistant account linking / consent / payment-adjacent patterns.
3. Разделить подтвержденные источниками факты и продуктовые inference.
4. Синтезировать P0/P1/P2 use cases для Алисы и приложения.
5. Описать conversational UX flows, данные/API capabilities, риски и validation plan.
6. Подготовить Notion-ready summary без внешней публикации.

## Sources Inventory

| Source | Role | Status |
|---|---|---|
| `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/` | Контекст предыдущего A3 исследования: объект, ЖКУ, платеж, статус поставщика, показания, семейная оплата | used |
| Яндекс Smart Building / Smart Home public pages and developer docs | Evidence для канала Алисы, smart-building сервисов, account linking и smart-home command model | used_with_manual_review_risk |
| Госуслуги.Дом / ГИС ЖКХ context from previous run | Evidence для домена ЖКУ и статусов/показаний | reused |
| Alexa / Google Home docs around account linking, consent, state reporting and PIN confirmation | Adjacent evidence для trust/consent patterns | used |
| Lazyweb flow search | UI evidence preflight for chat/bill payment flows | no_coverage_found |

## Definition of Done

- Созданы `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `source-log.md`.
- В каждом ключевом выводе указано: подтверждено источником, reused from prior A3 run или inference.
- Есть P0/P1/P2 сценарии и отдельная секция "как показывать в приложении Алисы".
- Зафиксированы риски: платежная безопасность, privacy shared-device, ошибки распознавания, статус поставщика, граница ответственности.
- В финальном ответе перечислены созданные файлы и проверки.

