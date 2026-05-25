# Reference Analysis

## Inputs Used

- User reference URL: `https://a3lab-ten.vercel.app/`
- Reference screenshots: `reports/visual-review/sim-cards-a3lab-reference/reference-desktop-full.png`, `reference-mobile-full.png`
- `ia-brief.md`

## References

Reference is a Russian landing for payment service A3. Observed structure: clean header, large hero, concise CTA, light background, repeated service cards, process/product sections and final request area.

## Allowed Patterns

- Light, spacious service landing.
- Large direct hero with one primary CTA.
- Clean blue/green accent system.
- Cards explaining service modules.
- Process sections that reduce operational uncertainty.
- CTA form near bottom.

## Disallowed Copying

- No A3 name, logo, exact text, bank/payment positioning or identical sequence of copy.
- No direct pixel clone of shapes, illustrations or proprietary trade dress.
- No claim to be connected to A3 or banks.

## Design Implications

- Use a distinct brand: `SIM Line`.
- Keep reference-level clarity: large typography, service cards, blue/green accent.
- Replace payment service modules with SIM-specific modules: eSIM checker, delivery, tariff choice, activation support.
- First viewport must clearly signal SIM/eSIM, not generic SaaS.

## Agent Output

```yaml
agent_name: design
status: success
inputs_used:
  - ia-brief.md
outputs:
  reference_analysis: reference-analysis.md
assumptions:
  - Reference screenshots are sufficient for visual direction.
risks:
  - Exact clone would create IP/trade dress risk.
open_questions:
  - Should final brand be different from SIM Line?
recommended_next_step: Create design brief.
```
