# Figma Layout Verifier Execution Plan

## Status

`completed`

## Goal

Превратить новый Figma compiler/verifier контракт из markdown-правила в первый исполнимый контур:

1. локальный verifier script;
2. тест на verifier;
3. inventory export текущего Figma board;
4. `figma-layout-ir.json` и `figma-visual-qa.json` для A3 Home Services v3;
5. запись результата в run artifacts.

## Scope

Target run:

`research/projects/a3-home-services-bank-apps-deep-research/2026-06-26`

Target Figma board:

- file: `NUoNEuTJ3OZOGH2c780Z55`
- page: `for flow`
- board node: `3013:2`
- screens: `3013:28`, `3013:90`, `3013:152`, `3013:205`, `3013:259`, `3013:311`

## Steps

1. Create `runtime/typescript/figma-layout-verifier.ts`.
2. Add `yarn figma:verify-layout`.
3. Add `runtime/typescript/test-figma-layout-verifier.ts`.
4. Export board inventory from Figma MCP with bounding boxes, text metrics, auto-layout flags and instance/source hints.
5. Author `figma-layout-ir.json` for the current A3 route.
6. Run verifier and generate `figma-visual-qa.json`.
7. Update `figma-app-flow-v3-shadcn-ds-2026-06-28.md`, `handoff-bundle.md`, and `stage-gate-ledger.md`.
8. Run validation.

## Verifier v1 Checks

| Check | Method | Gate |
|---|---|---|
| `text_height` | flag text nodes with height below 80% of expected line height | block |
| `text_overflow` | flag text nodes wider/taller than parent bounds | block |
| `overlap` | flag visible sibling overlap above tolerance inside screens | block |
| `clipping` | flag visible descendants outside screen bounds | block |
| `safe_area` | flag first content above IR safe area | block |
| `route_coherence` | ensure all IR route screen IDs have inventory screens | block |
| `ds_instance_honesty` | flag required DS components with no instance evidence | block or deviation |

## Definition Of Done

- Verifier script exists and runs without network.
- Test covers pass and fail examples.
- Current A3 board has `figma-layout-ir.json` and `figma-visual-qa.json`.
- If the current board fails DS honesty, record a truthful deviation instead of pretending it passed.
- Validation commands pass or blockers are recorded.

## Result

| Item | Result |
|---|---|
| Verifier script | `runtime/typescript/figma-layout-verifier.ts` |
| Regression test | `runtime/typescript/test-figma-layout-verifier.ts` |
| CLI | `yarn figma:verify-layout` |
| Current IR | `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/figma-layout-ir.json` |
| Current inventory | `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/figma-inventory-v3-shadcn-ds-2026-06-28.json` |
| Current QA | `research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/figma-visual-qa.json` |
| Gate | `passed_with_notes`, `ready_allowed=true` |

During Figma-side full-tree verification, the first pass found one real overflow: `payment_review` checkbox text node `3013:183` exceeded parent `3013:182`. The Figma node was repaired by resizing the checkbox slot to 24px, then the verifier was rerun successfully.
