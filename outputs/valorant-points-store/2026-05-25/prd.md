---
schema_payload:
  status: ready
  inputs_used:
    - recursive-brief.md
    - research-summary.md
    - competitive-analysis.md
    - proto-personas.md
    - synthetic-interviews.md
    - swot.md
  problem: "Players need a safe way to evaluate and buy region-compatible VP prepaid/cash codes without sharing Riot account credentials."
  goals:
    - "Explain region compatibility before package selection."
    - "Avoid any false official affiliation."
    - "Drive users to package selection after region check."
  non_goals:
    - "Copy Riot/VALORANT website design."
    - "Take Riot account credentials."
    - "Process real payments in this prototype."
  requirements:
    - id: "REQ-1"
      description: "Hero must state independent/unofficial status."
      priority: "must"
      evidence_status: "source-backed"
    - id: "REQ-2"
      description: "Region checker/filter must be visible before packages."
      priority: "must"
      evidence_status: "source-backed"
    - id: "REQ-3"
      description: "Packages must show region and no-login flow."
      priority: "must"
      evidence_status: "source-backed"
  moscow:
    must:
      - "Disclaimer"
      - "Region checker"
      - "No password safety block"
      - "Package cards"
    should:
      - "Receipt/replacement policy"
      - "FAQ"
    could:
      - "Live stock integration"
    wont:
      - "Official Riot branding"
      - "Real checkout"
  acceptance_criteria:
    - "No Riot/VALORANT logo or copied official UI assets are used."
    - "Primary CTA goes to region/package section."
    - "Safety section says no Riot password is required."
  analytics:
    - event: "region_check_click"
      trigger: "User clicks region selector/checker"
      properties:
        - "region_code"
      pii_risk: "none"
    - event: "package_select_click"
      trigger: "User selects a VP package"
      properties:
        - "package_id"
        - "region_code"
      pii_risk: "none"
---
# PRD

## Inputs Used

- `recursive-brief.md`
- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Problem

Игрок хочет купить VP prepaid/cash code, но боится wrong-region кода, scam-сценария и передачи аккаунта. Коммерческий сайт также не должен выглядеть как официальный Riot/VALORANT.

## Target Users And JTBD

| Segment | JTBD | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|
| Competitive player | Купить region-ready VP code | wrong region | Redeem самостоятельно | proto/source-backed risk |
| Gift buyer | Подарить VP code | не знает регион | clear gift flow | proto |

## Goals

| Goal | Metric / evidence | Priority |
|---|---|---|
| Сделать region safety главным сценарием | `region_check_click` | high |
| Снизить account-scam fear | safety section views/clicks | high |
| Довести до выбора пакета | `package_select_click` | high |

## Non-Goals

- Копировать дизайн Riot/VALORANT.
- Использовать Riot assets/logos.
- Реальная оплата.
- Вход в Riot аккаунт.

## Scope

### MVP

- Hero + disclaimer.
- Region checker.
- Package cards.
- Safety/trust section.
- FAQ.
- Checkout placeholder.

### Future

- Live inventory.
- Payment provider.
- CRM/support integration.

## Requirements

| ID | Requirement | User / business value | Evidence | Priority |
|---|---|---|---|---|
| REQ-1 | Unofficial disclaimer | legal/trust | Riot legal | must |
| REQ-2 | Region checker | redemption success | Riot support | must |
| REQ-3 | No password message | account safety | trust hypothesis | must |
| REQ-4 | Receipt/replacement note | support trust | support implication | should |

## MoSCoW

### Must

- Disclaimer.
- Region checker.
- Package cards.
- No Riot password safety block.

### Should

- FAQ.
- Receipt/replacement policy placeholder.
- Clear official redeem instruction.

### Could

- Live stock.
- Promo timers.

### Won't

- Copy VALORANT UI.
- Use official logos/key art.
- Real checkout.

## Acceptance Criteria

| Criterion | How to verify | Owner |
|---|---|---|
| No copied Riot visual assets | inspect code/assets | QA |
| Region checker visible | Playwright/screenshot | QA |
| CTA works | Playwright | QA |
| Safety says no password | text check | QA |

## Analytics

| Event | Trigger | Properties | PII risk | Success signal |
|---|---|---|---|---|
| region_check_click | select/check region | region_code | none | region selected |
| package_select_click | choose package | package_id, region_code | none | intent |
| safety_read_intent | click safety link | section_id | none | trust evaluation |

## Dependencies

- Real catalog/prices.
- Legal review.
- Payment/refund policy.

## Risks

- IP/trade dress infringement if copied.
- Failed redemption due to region.
- User confusion about official status.

## Open Questions

- Authorized reseller status?
- Supported regions?
- Refund/replacement policy?

