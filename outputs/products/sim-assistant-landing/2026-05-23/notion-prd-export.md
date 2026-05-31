# Notion PRD Export: SIM Assistant Landing

agent_name: notion-publisher
status: success

## Publication Status

- Source PRD: `outputs/sim-assistant-landing/2026-05-23/prd.md`
- Target: `36964731-74e5-8006-af5f-d367ef89d978`.
- Status: published.
- Approval required: true.
- Published URL: https://www.notion.so/PRD-SIM-Assistant-Landing-2026-05-23-3696473174e581729cfad4ccbdb7f91c
- Fallback markdown path: `outputs/sim-assistant-landing/2026-05-23/notion-prd-export.md`

## Summary

Лендинг для сервиса продажи SIM/eSIM через виртуального помощника. Помощник подбирает тариф, объясняет условия, собирает заявку и передает сложные кейсы менеджеру.

## Goals

- Быстро объяснить ценность SIM/eSIM assistant-first сервиса.
- Подвести пользователя к CTA `Подобрать SIM`.
- Показать процесс подключения и контроль статуса.
- Не обещать неподтвержденные сроки, цены или оператора.

## Scope

In:

- Hero, product cards, metrics, assistant preview, process, CTA.
- Responsive frontend.
- Research, PRD, IA, design, copy, QA artifacts.

Out:

- Реальная покупка SIM/eSIM.
- Реальная KYC/операторская интеграция.
- Реальный AI assistant backend.

## Requirements

- H1: "Продажа SIM и eSIM через виртуального помощника".
- Primary CTA: "Подобрать SIM".
- 3 product cards.
- Assistant conversation preview.
- 4-step connection process.
- Desktop/mobile QA.

## MoSCoW

Must: hero, CTA, product cards, assistant block, process, responsive QA.

Should: visual asset, accessibility labels, source-backed research.

Could: chat demo, calculator, CRM integration.

Won't now: operator API, KYC, payments.

## Acceptance Criteria

- `yarn build` passes.
- `yarn qa:playwright` passes.
- Research includes sources.
- No secrets in committed files or artifacts.

## Risks

- Нужен legal/KYC review.
- Claims про скорость и количество сценариев требуют validation.
- Нужен Notion target and approval для публикации.
- Published page id: `36964731-74e5-8172-9cfa-d4ccbdb7f91c`.

## Decisions Needed

- Указать Notion parent page/database.
- Подтвердить можно ли публиковать PRD во внешний workspace.
- Подтвердить юридическую модель продажи SIM/eSIM.

## Local Check

- `yarn notion:check`: passed.
- Notion API read-only search: request succeeded, accessible parent pages not found.
- Notion API create child page: success, page id `36964731-74e5-8172-9cfa-d4ccbdb7f91c`.
