# Research Summary Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | draft / partial / blocked / ready |
| Research mode | local_only / web_search / deep_research / user_sources_only |
| Evidence level | source-backed / mixed / synthetic / hypothesis |
| Readiness score |  |

## Inputs Used

- `recursive-brief.md`
- `run-plan.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`
- Previous run artifacts:
- Sources:

## Artifact Context Inventory

Research stage must read the current run ledger before provider synthesis. Include local artifacts actually used from `outputs/<project-slug>/<YYYY-MM-DD>/`.

| Artifact | Type | Used for | Notes |
|---|---|---|---|
| `run-plan.md` | run ledger | scope and constraints |  |
| `recursive-brief.md` | intake | expansion/deepening/consolidation |  |
| `handoff-bundle.md` | handoff | decisions, risks, next artifact |  |
| `stage-gate-ledger.md` | gate ledger | validation and approval state |  |
| `stage-results/*.json` | runtime state | previous structured outputs |  |

## Source Policy

- Allowed sources:
- Denied sources:
- Citation requirement:
- External write: denied unless approval exists

## Research Plan

| Dimension | Questions | Required evidence | Status |
|---|---|---|---|
| Market/category |  | primary or reputable source | open |
| Competitors/alternatives |  | competitor/source-backed | open |
| User scenarios/JTBD |  | source-backed or interview plan | open |
| Trust/compliance |  | official/legal/primary source | open |
| Design implications |  | competitor/reference/product evidence | open |

## Provider Coverage

Required for `deep_research`: `tavily` must return usable sources, `deepseek` must return usable cross-check/check results, and `gemini` must return usable strategic cross-check results for `ready`.
If either default provider is unavailable, failed or empty, set Status to `partial` and record `needs_validation`.

| Provider | Requested | Used | Sources count | Validation state | Notes |
|---|---:|---:|---:|---|---|
| tavily | yes / no | yes / no |  | pass / needs_validation / failed |  |
| deepseek | yes / no | yes / no | 0 | pass / needs_validation / failed | required cross-check; not source-backed evidence |
| gemini | yes / no | yes / no | 0 | pass / needs_validation / failed | required strategy cross-check; not source-backed evidence |

## Provider Failures

| Provider | Error / blocker | Impact | Follow-up |
|---|---|---|---|

## Source Quality Pass

| Source | Authority | Freshness | Directness | Independence | Specificity | Decision impact | Quality state |
|---|---|---|---|---|---|---|---|

## Research Questions

| Question | Why it matters | Evidence needed | Status |
|---|---|---|---|

## Продуктовый синтез

| Field | Value |
|---|---|
| Theme |  |
| Positioning |  |
| Primary paths |  |

## CJM-синтез сценариев

| Сценарий | Цель пользователя | Трение | Роль продукта | Приоритет | Статус доказательств |
|---|---|---|---|---|---|

## Оценка возможностей

| Инициатива | Сценарий | Reach | Impact | Confidence | Effort | RICE | Приоритет |
|---|---|---:|---:|---:|---:|---:|---|

## Дорожная карта

| Горизонт | Фокус | Результат |
|---|---|---|

## Audience

| Segment | Context | Motivation | Barrier | Evidence status |
|---|---|---|---|---|

## Jobs To Be Done

| Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|

## Proto Personas

Required: 2-4 proto personas or `skipped_with_reason`.

| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|---|

## Synthetic Interviews

Required: 3-5 simulated interviews or `skipped_with_reason`.

Guardrail: synthetic interviews are used only for hypothesis generation, interview-script stress testing and validation questions. They are not evidence of real user behavior.

| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |
|---|---|---|---|---|---|---|

## Competitors and Alternatives

| Name | Type | Category | Core offer | Source | Evidence status |
|---|---|---|---|---|---|

## Findings

| Finding | Impact | Evidence | Confidence | Product implication |
|---|---|---|---|---|

## Contradiction Review

| Topic | Provider/source A | Provider/source B | Conflict | Resolution | Claim status |
|---|---|---|---|---|---|

## Claims To Validate

| Claim | Current evidence | Risk | Validation method |
|---|---|---|---|

## Research Validation Plan

| Hypothesis | Who to interview or observe | Minimum evidence | Decision unlocked | Status |
|---|---|---|---|---|

## Sources

| Source | Provider | Type | URL/path | Used for | Retrieved at | Confidence |
|---|---|---|---|---|---|---|

## Research-To-Design Handoff

| Handoff field | Notes |
|---|---|
| `primary_user_paths` |  |
| `trust_requirements` |  |
| `decision_moments` |  |
| `content_risks` |  |
| `visual_evidence_needs` |  |
| `validation_priority` |  |

## Candidate Quality / Write Gate

| File | Action | Candidate score | Existing score | Gate result | Reason |
|---|---|---:|---:|---|---|

## Publication Shape Gate

Required before `notion-research-export-ru.md` can be published to Notion.

| Section | Required shape | Status | Evidence |
|---|---|---|---|
| Personas | comparative table: Persona / Segment / Context / JTBD / Pain / Value / Evidence status | pass / needs_revision / skipped_with_reason |  |
| CJM/user paths | table or scheme: Stage / Goal / Actions / Actors / Pains / Opportunity | pass / needs_revision / skipped_with_reason |  |
| Competitors | competitor or positioning table | pass / needs_revision / skipped_with_reason |  |
| ICE/RICE/backlog | scoring table | pass / needs_revision / skipped_with_reason |  |

## Unknowns

- 

## Readiness Checklist

- [ ] Research questions are answered or marked `needs validation`.
- [ ] Artifact Context Inventory lists real run artifacts, not only `recursive-brief.md`.
- [ ] `inputs_used` reflects all meaningful local artifacts and provider outputs used for synthesis.
- [ ] Provider Coverage records requested, used, unavailable/failed providers.
- [ ] Research Plan covers market/category, competitors, user scenarios, trust/compliance and design implications.
- [ ] Source Quality Pass separates primary/source-backed facts from noisy snippets and model synthesis.
- [ ] Tavily returned usable sources or Status is `partial`.
- [ ] DeepSeek returned usable cross-check/check output or Status is `partial`.
- [ ] DeepSeek output is marked as cross-check/synthesis and not treated as evidence.
- [ ] Gemini returned usable strategic cross-check output or Status is `partial`.
- [ ] Gemini output is marked as cross-check/synthesis and not treated as evidence.
- [ ] Contradiction Review exists and unresolved conflicts are marked `needs_validation`.
- [ ] Audience segments are defined.
- [ ] JTBD is complete.
- [ ] CJM/user paths are present or `skipped_with_reason`.
- [ ] Opportunity scoring or prioritized opportunity list is present when research feeds PRD/IA/design.
- [ ] Proto Personas are present or `skipped_with_reason`.
- [ ] Synthetic Interviews are present or `skipped_with_reason`.
- [ ] Research Validation Plan is actionable.
- [ ] Findings separate evidence from hypotheses.
- [ ] Research-To-Design Handoff exists or has `skipped_with_reason`.
- [ ] Candidate Quality / Write Gate is recorded before overwriting existing research artifacts.
- [ ] Publication Shape Gate passes before Notion approval/publication.
