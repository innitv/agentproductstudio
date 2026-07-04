# Handoff Bundle

## Goal

Исследовать идею A3 + Яндекс Алиса / умный дом для платежей ЖКУ, сценариев "чат с домом", статусов после оплаты, передачи показаний и семейной оплаты.

## Completed Artifacts

- `run-plan.md`
- `source-log.md`
- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`

## Inputs Used

- User request from 2026-06-30.
- Existing A3 research context: `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/`.
- Subagent research on market analogs and product scenarios.
- Lazyweb flow preflight with zero coverage for exact chat/bill payment flows.

## Key Decisions

1. Treat this as standalone research, not a full product workflow and not a UI implementation.
2. Create a new run under `research/projects/a3-yandex-alice-utilities-smart-home-research/2026-06-30/`.
3. Mark exact market proof as `not_found`, not as assumed.
4. Recommend confirmation-first MVP: voice/chat prepares and explains, app/bank confirms money movement.
5. Anchor A3 value in object/bill/status/role normalization.

## Core Recommendation

Build the concept around `чат с домом`, not around "голосом списать деньги".

P0:

- проверить текущий счет ЖКУ;
- подготовить оплату с app confirmation;
- объяснить долг после оплаты;
- передать показания с read-back;
- создать reminder.

P1:

- оплата за родителей with `family_payer` role;
- post-payment чек и sharing;
- smart-building notifications that route to bill/status/action.

## Risks

- Yandex policy/payment moderation unknown.
- A3 supplier reconciliation capability unknown.
- Shared speaker privacy risk.
- No exact public analogue found.
- Visual benchmark for app/chat screens is not yet collected.

## Next Required Artifact

If this moves toward product design: create `prd.md` and `design-brief.md` with a visual evidence collection step before any Figma/frontend work.

