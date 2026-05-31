# PRD: SIM Assistant Landing

agent_name: prd
status: success

## Problem

Покупка SIM/eSIM часто требует выбора тарифа, проверки условий, идентификации и ручной переписки. Для бизнеса это превращается в операционный процесс: кто подключен, какой статус, кто оплатил, где документы, что делать со сложными случаями.

## Goals

- Объяснить за 5-10 секунд, что сервис продает SIM/eSIM через виртуального помощника.
- Сформировать доверие через сценарии: подбор, документы, активация, поддержка.
- Дать понятный primary CTA: `Подобрать SIM`.
- Показать, что помощник не заменяет legal/KYC контроль, а упрощает путь до него.

## Non-Goals

- Не реализовывать реальную покупку SIM.
- Не подключать платежи, KYC, CRM или операторские API.
- Не публиковать claims о ценах, сроках и операторах без подтверждения.

## MoSCoW

### Must

- Hero с прямым value proposition.
- Блок продуктов: SIM для команд, eSIM, виртуальный помощник.
- Блок assistant conversation.
- Процесс подключения.
- CTA для заявки.
- Responsive desktop/mobile.
- Playwright smoke QA.

### Should

- Метрики доверия как hypothesis/marketing placeholders.
- Визуальный asset с eSIM/assistant контекстом.
- Accessibility: semantic sections, labels, visible CTA.

### Could

- Интерактивный чат-демо.
- Pricing calculator.
- Интеграция с Notion/CRM для заявок.

### Won't For Now

- Реальная интеграция с оператором.
- Реальный AI assistant backend.
- Реальная публикация в Notion без target page/database и approval.

## Requirements

- `REQ-001`: первый экран содержит H1 "Продажа SIM и eSIM через виртуального помощника".
- `REQ-002`: primary CTA называется "Подобрать SIM".
- `REQ-003`: на странице есть 3 продуктовых карточки.
- `REQ-004`: на странице есть блок виртуального помощника с сообщениями.
- `REQ-005`: на странице есть process list из 4 шагов.
- `REQ-006`: mobile viewport не ломает карточки и CTA.

## Acceptance Criteria

- `yarn build` проходит.
- `yarn qa:playwright` проходит на desktop/mobile.
- Нет секретов в frontend.
- Research artifacts содержат источники.
- Notion export готов локально.

## Analytics

События:

- `landing_viewed`
- `cta_pick_sim_clicked`
- `cta_pilot_clicked`
- `assistant_block_viewed`
- `process_block_viewed`
- `lead_form_started` future
- `lead_form_submitted` future

recommended_next_step: добавить форму заявки и реальный event tracking после утверждения PRD.

