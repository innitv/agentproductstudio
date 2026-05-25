# SWOT

## Inputs Used

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`

## SWOT

| Type | Item | Evidence/status | Product implication |
|---|---|---|---|
| Strength | Clear SIM/eSIM selection can reduce confusion | source-backed + hypothesis | Put checker above tariffs |
| Strength | Reference pattern supports complex service explanation | reference-backed | Use large promise + step cards |
| Weakness | Real tariff/catalog data absent | needs validation | Avoid price claims |
| Weakness | KYC/legal requirements unclear | needs validation | Add neutral request form |
| Opportunity | eSIM flow can be faster than physical delivery | source-backed context | Separate eSIM and physical SIM cards |
| Opportunity | B2B packet request can capture higher-value leads | hypothesis | Add business CTA |
| Threat | SIM swap/port-out fraud concerns can reduce trust | source-backed | Add safety block |
| Threat | Exact copying of reference creates IP/trade dress risk | reference analysis | Use inspired but distinct style |

## Strategic Notes

- The landing should sell clarity and confidence rather than aggressive price discounts.
- The first screen must expose the product category immediately: SIM/eSIM, tariffs, delivery/activation.
- Production requires legal review and operator/catalog integration.

## Agent Output

```yaml
agent_name: research
status: success
inputs_used:
  - research-summary.md
outputs:
  swot: swot.md
assumptions:
  - Strategy is for prototype validation, not production launch.
risks:
  - Unsupported operational claims would damage trust.
open_questions:
  - Which claims can be backed by real operations?
recommended_next_step: Create PRD.
```
