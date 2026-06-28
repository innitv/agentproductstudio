# Stage Gate Ledger

## Run

| Поле | Значение |
|---|---|
| Run ID | `a3-home-services-bank-apps-deep-research-2026-06-26` |
| Mode | `deep_research` |
| Owner | `research.agent` |
| Status | `ready` |

## Rule

Research stage считается готовым только при наличии обязательных outputs, provider coverage, source quality pass, contradiction review, claims-to-validate, validation plan, scenario-user-flows и успешного Research Content Lint.

## Stage Status

| stage | owner | status | timestamp | artifacts | validation | handoff_updated |
|---|---|---:|---|---|---|---|
| 00-intake | orchestrator | partial | 2026-06-26 | `recursive-brief.md`, `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` | intake ready for research | true |
| 01-research | research.agent | ready | 2026-06-26 | `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | `yarn research:lint` pass | true |
| Notion publication | orchestrator/notion-publisher | success | 2026-06-26 | `notion-research-export-ru.md`, `notion-publication-result.md` | dry-run gates pass; Notion write success | true |
| Applied conclusions | orchestrator | success | 2026-06-26 | `applied-home-services-page-ru.md` | published to Notion page `38b64731-74e5-81d4-a6fd-c00de30f186e` | true |
| Figma mockups | orchestrator/figma | superseded_needs_revision | 2026-06-26 | `figma-home-usecase-mockups.md`, Figma file `dL70YFBGi981ETZX2hcxBp` | Superseded: thematic screen set did not work as an app flow | true |
| Figma P0 app flow correction | orchestrator/figma | ready | 2026-06-27 | `figma-app-flow-correction-2026-06-27.md`, Figma page `A3 Home Services / P0 app flow 2026-06-27`, board `12:3` | Figma metadata + screenshot QA; scenario acceptance test added | true |
| Figma app flow v2 Lazyweb | orchestrator/figma | ready_for_review | 2026-06-28 | `figma-app-flow-v2-lazyweb-2026-06-28.md`, Figma page `A3 Home Services / App flow v2 Lazyweb 2026-06-28`, board `16:3` | Lazyweb evidence applied; Primary App Flow Gate; metadata + screenshot QA | true |
| Figma app flow v3 shadcn DS | orchestrator/figma | ready_for_review_verified | 2026-06-28 | `figma-app-flow-v3-shadcn-ds-2026-06-28.md`, `figma-layout-ir.json`, `figma-inventory-v3-shadcn-ds-2026-06-28.json`, `figma-visual-qa.json`, Figma page `for flow`, board `3013:2` | Built in user-provided shadcn/Tailwind variables file; Auto Layout + screenshot QA; executable verifier passed with notes after checkbox overflow repair | true |

## Gate Notes

- External write: denied until exact approval.
- Notion external write: approved by user for parent `3696473174e58006af5fd367ef89d978`; published hub `38b64731-74e5-81d3-98d1-ca3190a5a898`.
- Research provider calls: approved by user for source-backed research.
- DeepSeek/Gemini: skipped without opt-in and not used as source-backed evidence.
- Previous local runner produced technical `ready`, but content quality failed because a generic payment template entered the pack. The rewrite restores strict topic boundary around "Дом"/ЖКХ and records provider noise as rejected.
- Figma external write: requested by user for Alfa `Дом` use case mockups; created file `A3 Home Services — Alfa Дом use cases` in team `A-3`.
- Lazyweb UI evidence: attempted; backend blocked due outdated skill-pack requiring `0.13.0+`. External install via `curl | bash` was rejected by auto-review; user approved continuing without Lazyweb.
- Figma correction external write: user approved remake after rejecting the prior mockups as not app-like. Created a separate page `A3 Home Services / P0 app flow 2026-06-27` in existing file `dL70YFBGi981ETZX2hcxBp`; did not overwrite old frames.

## Provider Record

| Provider | Requested | Used | Status | Evidence role |
|---|---:|---:|---|---|
| tavily | yes | yes | partial_reused | URL inventory from previous run; only domain-relevant sources retained |
| web_search | yes | yes | pass | source-backed verification on 2026-06-26 |
| deepseek | no | no | skipped_without_opt_in | advisory not used |
| gemini | no | no | skipped_without_opt_in | advisory not used |

## Гейт записи research-артефактов

| Файл | Действие | Результат |
|---|---|---|
| research-summary.md | rewritten | содержит provider coverage, source quality pass, key cases, CJM user flow, contradiction review, claims-to-validate |
| scenario-user-flows.md | rewritten | содержит индекс флоу, P0/P1 routes, user questions, statuses, validation_metric |
| competitive-analysis.md | rewritten | сравнивает Госуслуги.Дом, ГИС ЖКХ, УК/ТСЖ apps, bank + A3 opportunity; exact bank claims marked needs_validation |
| proto-personas.md | rewritten | только домовые personas, все с Evidence status |
| synthetic-interviews.md | rewritten | только synthetic hypothesis guide, no factual claims |
| swot.md | rewritten | SWOT tied to домовые scenarios and evidence |
| handoff-bundle.md | rewritten | includes research-to-design handoff and candidate write gate |
| stage-gate-ledger.md | rewritten | records current ready state and validation plan |

## Validation Runs

| Команда | Статус | Заметка |
|---|---|---|
| `yarn research:lint research/projects/a3-home-services-bank-apps-deep-research/2026-06-26` | pass | Research Content Lint passed after rewrite |
| `yarn research:lint research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/notion-research-export-ru.md` | pass | Notion export passed Anti-AI-Slop/research lint |
| `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | `publication_allowed: true`; no blockers |
| `node tooling/scripts/publish-notion-research-hub.mjs ...` | pass | Created Notion hub `38b64731-74e5-81d3-98d1-ca3190a5a898`, 8 child pages, 413 blocks |
| `node tooling/scripts/publish-notion-research-page.mjs ... applied-home-services-page-ru.md ...` | pass | Created applied conclusions page `38b64731-74e5-81d4-a6fd-c00de30f186e`, 30 blocks |
| `rg -n "<rejected/noise terms>" required outputs` | pass | no matches in required outputs; command returned exit code 1 because nothing was found |
| Figma metadata + screenshot QA | superseded | Created 6 mobile frames, reference board, local component kit and evidence map; later rejected as a thematic page set, not a usable app flow |
| Figma P0 app flow metadata + screenshot QA | pass | Created page `A3 Home Services / P0 app flow 2026-06-27`, board `12:3`, screens `12:38`, `12:71`, `12:99`, `12:134`, `12:162`; screenshot URL generated by Figma MCP asset `5e44817e-5a6e-4127-823f-65e8d947110b` |
| Figma app flow v2 Lazyweb metadata + screenshot QA | pass | Created page `A3 Home Services / App flow v2 Lazyweb 2026-06-28`, board `16:3`, screens `17:2`, `17:51`, `17:93`, `17:133`, `17:177`, `17:213`; final screenshot asset `79e85e57-0bca-40b9-bebd-565bd342cc43` |
| Figma app flow v3 shadcn DS screenshot QA | pass | Built in file `NUoNEuTJ3OZOGH2c780Z55`, page `for flow`, board `3013:2`, screens `3013:28`, `3013:90`, `3013:152`, `3013:205`, `3013:259`, `3013:311`; fixed vertical stacking and text clipping; final screenshot asset `03286ce3-48d5-458d-b9f0-80fc9d9b6343` |
| `yarn figma:verify-layout --ir research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/figma-layout-ir.json --inventory research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/figma-inventory-v3-shadcn-ds-2026-06-28.json --out research/projects/a3-home-services-bank-apps-deep-research/2026-06-26/figma-visual-qa.json` | pass | Gate `passed_with_notes`, `ready_allowed=true`; checked route coherence, text height, text overflow, overlap, clipping, safe area and DS honesty; first Figma-side run found checkbox overflow and the node was repaired before final verifier run |

## Open Risks

- `claims_to_validate`: точный A3 endpoint inventory, exact Т-Банк/Альфа feature scope, data contract for supplier/GIS status.
- Notion write performed and recorded in `notion-publication-result.md`.
- Previous Figma write is superseded for product use; correction recorded in `figma-app-flow-correction-2026-06-27.md`.
- No deploy/git write performed.
