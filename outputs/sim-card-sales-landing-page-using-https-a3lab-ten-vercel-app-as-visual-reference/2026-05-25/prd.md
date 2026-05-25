---
schema_payload:
  status: ready
  inputs_used:
    - recursive-brief.md
    - research-summary.md
  problem: "Покупателю SIM/eSIM сложно быстро понять формат, совместимость, тариф и порядок получения."
  goals:
    - "Объяснить SIM/eSIM offer на первом экране."
    - "Довести пользователя до заявки на подбор SIM."
  non_goals:
    - "Реальный checkout/payment."
  requirements:
    - id: "REQ-1"
      description: "Hero with primary CTA"
      priority: must
      evidence_status: source-backed
    - id: "REQ-2"
      description: "Tariff cards"
      priority: must
      evidence_status: hypothesis
    - id: "REQ-3"
      description: "Compatibility/trust flow"
      priority: must
      evidence_status: source-backed
  moscow:
    must:
      - "Primary CTA"
    should:
      - "FAQ"
    could:
      - "B2B packet"
    wont:
      - "Payment integration"
  acceptance_criteria:
    - "Page builds successfully."
  analytics:
    - event: "sim_pick_click"
      trigger: "Primary CTA"
      properties:
        - "source"
      pii_risk: low
---
# PRD

## Inputs Used

- `recursive-brief.md`
- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `swot.md`

## Problem

Покупателю SIM/eSIM сложно понять, какой формат ему нужен, поддерживает ли устройство eSIM, какие условия подключения и что произойдет после заявки. Лендинг должен снимать эти вопросы до формы.

## Goals

- Сразу объяснить offer: SIM/eSIM без похода в салон, с подбором и понятной активацией.
- Довести пользователя до primary CTA `Подобрать SIM`.
- Показать тарифные варианты без неподтвержденных ценовых claim.
- Визуально приблизиться к reference-level polish без копирования A3.

## Non-Goals

- Реальный платежный checkout.
- Интеграция с операторскими API.
- Хранение персональных данных.
- Юридически полноценный KYC flow.

## Requirements

- Hero: крупный заголовок, benefit, primary CTA, secondary CTA.
- Benefits: 4-6 карточек, объясняющих подбор, eSIM, доставку, поддержку.
- Tariffs/products: минимум 3 карточки: eSIM, physical SIM, business packet.
- Flow: 4 шага от проверки устройства до активации.
- Trust: безопасность, документы, перенос номера/новый номер, поддержка.
- FAQ: 4 вопроса по eSIM, доставке, документам, совместимости.
- Form/CTA: lead capture mock with non-sensitive fields.

## MoSCoW

| Priority | Items |
|---|---|
| Must | Hero, CTA, tariffs, activation flow, trust block, responsive layout |
| Should | FAQ, B2B card, compatibility checker UI |
| Could | Animated cards, detailed operator filters |
| Won't | Payment, real identity verification, real catalog stock |

## Acceptance Criteria

- На desktop и mobile первый экран показывает, что продукт про SIM/eSIM.
- Все CTA ведут к секции заявки или тарифов.
- Нет дословного текста, бренда или визуальных assets A3.
- Claims without real evidence are marked as `needs validation` in artifacts and avoided in UI.
- `yarn build` проходит.

## Analytics

| Event | Trigger | Payload | PII risk |
|---|---|---|---|
| `sim_pick_click` | Primary CTA | source section | low |
| `tariff_select_click` | Tariff card CTA | tariff id | low |
| `esim_check_click` | Compatibility checker | format only | low |
| `lead_form_focus` | Form interaction | field id only | medium if extended |

## Agent Output

```yaml
agent_name: prd
status: success
inputs_used:
  - research-summary.md
outputs:
  prd: prd.md
assumptions:
  - Prices and operators are placeholders.
risks:
  - Legal/KYC must be validated before launch.
open_questions:
  - Real catalog and delivery regions.
recommended_next_step: Create IA.
```
