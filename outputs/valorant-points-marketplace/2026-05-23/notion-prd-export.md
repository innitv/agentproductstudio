# Notion PRD Export: Valorant Points Marketplace

agent_name: notion-publisher
status: success

## Publication Status

- Source PRD: `outputs/valorant-points-marketplace/2026-05-23/prd.md`
- Target parent page: `36964731-74e5-8006-af5f-d367ef89d978`
- Approval required: true
- Published URL: https://www.notion.so/PRD-Valorant-Points-Marketplace-2026-05-23-3696473174e5812ba4ddf19115567d83
- Published page id: `36964731-74e5-812b-a4dd-f19115567d83`

## Summary

Неофициальный лендинг для продажи discounted prepaid codes / VALORANT Points codes. Сайт не должен имитировать Riot Games, не должен запрашивать Riot credentials и обязан показывать region/disclaimer/safety policy.

## Goals

- Продавать оффер дешевых prepaid-кодов.
- Показать безопасность: no password, region check, receipt, replacement review.
- Сформировать доверие до checkout.

## Scope

In: hero, packs, safety, how-it-works, FAQ, CTA, responsive QA.

Out: payment integration, real stock, Riot API, account top-up, Riot credentials.

## MoSCoW

Must: offer, disclaimer, packs, safety, process, FAQ, QA.

Should: custom gaming visual, strong CTA, no official assets.

Could: reviews, region selector, promo code.

Won't now: checkout, inventory, account top-up.

## Acceptance Criteria

- Build and Playwright pass.
- No official Riot/VALORANT assets copied.
- Disclaimer visible.
- No password/request credentials pattern.

## Risks

- Third-party prepaid-code sales carry ToS/IP/trust risks.
- Discounts and delivery times require supplier validation.
- Legal review is needed before real launch.
