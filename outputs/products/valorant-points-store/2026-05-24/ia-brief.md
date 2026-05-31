---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
    - research-summary.md
    - proto-personas.md
  primary_screen: "VP Nexus landing page"
  primary_action: "Проверить регион"
  completion_step: "User clicks a package CTA after region check"
  sitemap:
    - section: "#top"
      purpose: "value and disclaimer"
    - section: "#regions"
      purpose: "region compatibility"
    - section: "#packs"
      purpose: "package selection"
  primary_user_flow:
    - "Open hero"
    - "Read disclaimer"
    - "Choose region"
    - "Select package"
---
# IA Brief

## Inputs Used

- `prd.md`
- `research-summary.md`
- `proto-personas.md`

## Primary Screen

Single landing page for `VP Nexus`.

## Primary Action

`Проверить регион` -> region/packages section.

## Completion Step

User clicks a package CTA after selecting/checking region.

## Sitemap

| Route / section | Purpose | User question answered | CTA |
|---|---|---|---|
| `#top` | value + disclaimer | Is this official/safe? | Проверить регион |
| `#regions` | compatibility | Which code fits my account? | Show packs |
| `#packs` | package selection | What can I buy? | Select package |
| `#safety` | trust | Do I share password? | Read policy |
| `#faq` | objections | What if code fails? | Contact placeholder |

## Primary User Flow

1. Open hero.
2. Read unofficial/no-password disclaimer.
3. Choose region.
4. Compare packages.
5. Select package.
6. Read safety/FAQ if unsure.

## JTBD To Sections Mapping

| JTBD | Section / screen | Content needed | Evidence status |
|---|---|---|---|
| Buy region-ready code | regions/packs | region chips | source-backed risk |
| Gift code safely | FAQ/safety | gift note | proto |

## Navigation Rules

Header links scroll to sections.

## Content Priority

Region compatibility > package price > safety > policy.

## Open Questions

- Exact supported regions.
