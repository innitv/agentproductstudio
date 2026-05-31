# PRD: Valorant Points Marketplace Landing

agent_name: prd
status: success

## Problem

Игроки хотят купить внутриигровую валюту дешевле и удобнее, но рынок third-party кодов вызывает недоверие: риск неверного региона, уже активированного кода, отсутствия чека, фишинга и нарушения правил платформы.

## Product Goal

Создать продажный лендинг для неофициального магазина prepaid-кодов VALORANT Points с акцентом на безопасность, прозрачность и быстрый выбор пакета.

## Non-Goals

- Не создавать официальный Riot/VALORANT сайт.
- Не копировать Riot assets, logo, agents, maps, screenshots, trade dress.
- Не реализовывать реальную оплату.
- Не собирать Riot login/password.
- Не обещать поддержку Riot по third-party purchases.

## MoSCoW

### Must

- Hero с оффером дешевых VP/prepaid codes.
- Явный disclaimer: сайт не аффилирован с Riot Games.
- Product cards с пакетами VP, region и delivery.
- Trust block: no account login, receipt, region check, replacement policy.
- How it works: choose pack -> pay -> receive code -> redeem in game.
- FAQ с safety/region/refund.
- Responsive desktop/mobile.
- Playwright smoke QA.

### Should

- Gaming-style visual без копирования Riot assets.
- Countdown/stock urgency без фейковых claims.
- Highlight "no password required".

### Could

- Region selector.
- Promo code field.
- Reviews.
- Live stock sync.

### Won't For Now

- Payment integration.
- Real inventory.
- Riot API integration.
- Account top-up service.

## Requirements

- `REQ-001`: H1 сообщает, что пользователь может купить discounted VALORANT prepaid codes.
- `REQ-002`: рядом с CTA есть disclaimer `Unofficial store`.
- `REQ-003`: минимум 3 currency pack cards.
- `REQ-004`: блок safety содержит "No Riot password".
- `REQ-005`: есть 4-step purchase flow.
- `REQ-006`: есть FAQ про region и third-party risk.
- `REQ-007`: mobile layout readable.

## Acceptance Criteria

- `yarn typecheck` passes.
- `yarn build` passes.
- `yarn qa:playwright` passes.
- No forbidden package-manager references introduced.
- No Riot/VALORANT official assets copied into repo.

## Analytics

- `landing_viewed`
- `pack_card_viewed`
- `pack_buy_clicked`
- `region_warning_viewed`
- `faq_opened`
- `checkout_started` future
- `code_delivery_completed` future

recommended_next_step: implement frontend strictly within PRD and QA criteria.
