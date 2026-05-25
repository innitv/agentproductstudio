---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
  primary_screen: "Landing home"
  primary_action: "Подобрать SIM"
  sitemap:
    - path: "#top"
      purpose: "Hero"
    - path: "#solutions"
      purpose: "Benefits"
    - path: "#tariffs"
      purpose: "Product cards"
    - path: "#flow"
      purpose: "Activation flow"
    - path: "#request"
      purpose: "Lead form"
  primary_user_flow:
    - "Open landing"
    - "Read hero"
    - "Check SIM/eSIM options"
    - "Choose tariff"
    - "Submit request"
---
# IA Brief

## Inputs Used

- `prd.md`
- `research-summary.md`

## Primary Screen

Одностраничный landing home для `SIM Line`.

## Primary Action

`Подобрать SIM` ведет к форме заявки и tariff cards.

## Sitemap

| Anchor | Purpose |
|---|---|
| `#top` | Hero and primary promise |
| `#solutions` | Benefits and service modules |
| `#tariffs` | SIM/eSIM product cards |
| `#flow` | Activation steps |
| `#trust` | Safety, documents, support |
| `#request` | Lead form |
| `#faq` | Objection handling |

## Primary User Flow

1. Пользователь открывает страницу.
2. Видит крупное предложение: SIM и eSIM с подбором.
3. Переходит к вариантам SIM/eSIM.
4. Сравнивает тарифные карточки.
5. Проверяет совместимость/условия.
6. Оставляет заявку.

## Navigation

Desktop: логотип, 4 links, CTA. Mobile: compact header with CTA only, sections stacked.

## Agent Output

```yaml
agent_name: ia
status: success
inputs_used:
  - prd.md
outputs:
  ia_brief: ia-brief.md
assumptions:
  - One-page landing is sufficient.
risks:
  - Real checkout would require extra screens.
open_questions:
  - Need separate B2B page later?
recommended_next_step: Create reference analysis and design brief.
```
