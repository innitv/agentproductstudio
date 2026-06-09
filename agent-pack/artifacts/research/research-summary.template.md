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

## Anti-AI-Slop Gate

Заполни перед финальной записью. Gate проверяет качество объяснения целиком, а не только отдельные слова. Если вывод можно перенести в другой продукт без изменения смысла, если нет наблюдаемого поведения, механизма влияния или проверки, статус артефакта не может быть `ready`.

| Проверка | Статус | Исправление / ссылка |
|---|---|---|
| Нет финальных выводов, построенных на абстрактных продуктовых ярлыках без конкретного сценария | pass / needs_revision |  |
| Каждый крупный вывод проходит тест "нельзя без изменений вставить в другой продукт" | pass / needs_revision |  |
| Обещания улучшения раскрыты через механизм: почему -> где в пути -> чем продукт помогает -> как проверяем | pass / needs_revision |  |
| Метрики описаны как наблюдаемое действие пользователя или бизнеса | pass / needs_revision |  |
| Таблицы не повторяют один шаблон строк с заменой существительных | pass / needs_revision |  |
| Каждый крупный вывод объяснен через реальную ситуацию пользователя или бизнеса | pass / needs_revision |  |
| Есть связка `персона -> ситуация -> трение -> решение -> проверка` | pass / needs_revision |  |
| Research не является только тезисной выжимкой | pass / needs_revision |  |

## Цепочка решений

| Доказательство | Что это значит в жизни | Продуктовое решение | Где раскрыто подробнее |
|---|---|---|---|

## CJM-синтез сценариев

| Сценарий | Персона/контекст | Цель пользователя | Что происходит в жизни | Трение | Роль продукта | Приоритет | Статус доказательств |
|---|---|---|---|---|---|---|---|

## Подробные кейсы под CJM

Required: для каждого P0/P1 сценария минимум 2-4 кейса. Не заменять этот раздел краткой выжимкой.

| Сценарий | Кейс | Персона | Ситуация | Вопрос пользователя | Что ломается | Что делает продукт | Как проверяем |
|---|---|---|---|---|---|---|---|

## User Flow под CJM

Required: для основных сценариев показать этапы до оплаты, во время оплаты, после оплаты и при исключениях.

| Сценарий | Этап | Действие пользователя | Вопрос пользователя | Боль/барьер | Решение продукта | Метрика |
|---|---|---|---|---|---|---|

## Оценка возможностей

| Инициатива | Сценарий | Reach | Impact | Confidence | Effort | RICE | Приоритет |
|---|---|---:|---:|---:|---:|---:|---|

## Связь возможностей с CJM

| Инициатива | CJM-сценарий | Конкретное трение | Почему это важно | Validation method | Риск без проверки |
|---|---|---|---|---|---|

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

## Publication Cross-Link Gate

Required before detailed Notion hub publication.

| Check | Status | Evidence / location |
|---|---|---|
| `Карта связей исследования` exists and links personas, CJM, ICE/RICE, roadmap/SWOT, validation and sources | pass / needs_revision / skipped_with_reason |  |
| `Цепочка решений` exists with `доказательство -> интерпретация -> продуктовое решение -> подробности` | pass / needs_revision / skipped_with_reason |  |
| Cross-references are Markdown links or Notion-ready page mentions, not plain `см. раздел` text | pass / needs_revision / skipped_with_reason |  |

## Research Content Lint

Required before Notion/Figma/external publication.

| Command | Status | Blocking findings |
|---|---|---|
| `yarn research:lint outputs/<project-slug>/<YYYY-MM-DD>` | not_run / pass / fail |  |

## Notion Data Shape Plan

Required before detailed Notion hub publication. Use this to decide whether data belongs in child pages, table blocks or database indexes. If both child pages and database indexes are used, choose `integrated_hybrid` and plan embedded linked database views.

### Publication Editor Pass

| Check | Status | Notes |
|---|---|---|
| Public export excludes internal ledger/debug sections | pass / needs_revision | Remove `Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, provider/debug policy, dry-run/lint/data-shape gates from public Notion pages. |
| Overview is decision/navigation layer only | pass / needs_revision | Keep 5-7 decisions and links; do not repeat full personas/CJM/backlog/source tables. |
| Duplicate control sections removed | pass / needs_revision | `Карта связей исследования` and `Цепочка решений` appear once. |
| Entity ownership map exists | pass / needs_revision | Each entity has one owner page/database/view. |

| Entity | Owner page / database / view | Allowed summary elsewhere | Duplicate policy |
|---|---|---|---|
| Personas |  | one-line segment summary / link | no repeated full table |
| CJM frictions |  | top frictions / link | no repeated stage tables outside CJM owner |
| Opportunities / ICE-RICE |  | top priorities / link | no repeated ICE and RICE tables outside backlog owner |
| Validation claims |  | risk summary / link | no repeated claims table |
| Sources |  | source status / link | no repeated full source table |

| Entity / section | Recommended Notion shape | Target page for embedded view | Why | Schema preview / key properties |
|---|---|---|---|---|
| Overview / narrative | `hub_page` / `child_page` |  |  |  |
| Personas | `database_index` / `notion_table_block` / `child_page` | страница персон |  |  |
| CJM frictions | `database_index` / `notion_table_block` / `child_page` | страница CJM/user flow |  |  |
| Opportunities / ICE-RICE | `database_index` / `notion_table_block` / `child_page` | страница roadmap/ICE/RICE |  |  |
| Validation claims | `database_index` / `notion_table_block` / `child_page` | страница validation plan |  |  |
| Sources | `database_index` / `toggle` / `child_page` | страница sources/evidence |  |  |

| Dry-run field | Required value |
|---|---|
| `notion_data_shape_plan.selected_layout` | `hub_with_child_pages` / `integrated_hybrid` |
| `publication_editor_gate.pass` | true before Notion write |
| `publication_editor_gate.entity_ownership_map` | personas / cjm_frictions / opportunities / validation_claims / sources owners |
| `publication_editor_gate.dedupe_actions` | removed/skipped/kept_with_rationale |
| `notion_data_shape_plan.database_index_candidates` | personas / cjm_frictions / opportunities / validation_claims / sources as applicable |
| `notion_data_shape_plan.embedded_database_views` | target child page + source database/data source + view name + visible properties |
| `notion_data_shape_plan.idempotency_strategy` | hub page, child pages and database rows |
| `notion_data_shape_plan.api_limits` | append chunk size, request payload limits and rate limit handling |

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
- [ ] Anti-AI-Slop Gate passed: abstract pattern words are removed or explained through real-life scenarios.
- [ ] Narrative Depth Gate passed: detailed cases and user flows are present, not only bullet summaries.
- [ ] CJM includes user questions, pains, product response, metrics and validation method.
- [ ] Opportunity scoring is tied to CJM frictions and validation methods.
- [ ] Opportunity scoring or prioritized opportunity list is present when research feeds PRD/IA/design.
- [ ] Proto Personas are present or `skipped_with_reason`.
- [ ] Synthetic Interviews are present or `skipped_with_reason`.
- [ ] Research Validation Plan is actionable.
- [ ] Findings separate evidence from hypotheses.
- [ ] Research-To-Design Handoff exists or has `skipped_with_reason`.
- [ ] Candidate Quality / Write Gate is recorded before overwriting existing research artifacts.
- [ ] Publication Shape Gate passes before Notion approval/publication.
- [ ] Publication Editor Pass passes before Notion approval/publication.
- [ ] Publication Cross-Link Gate passes before Notion approval/publication.
- [ ] Research Content Lint is run or recorded as blocked before external publication.
- [ ] Notion Data Shape Plan exists for detailed hub publication.
- [ ] If database indexes and child pages coexist, `integrated_hybrid` is planned with embedded linked database views.
