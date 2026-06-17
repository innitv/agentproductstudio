# Stage gate ledger

## Run

| Поле | Значение |
|---|---|
| Project slug | `a3pay-cjm` |
| Run date | `2026-06-06` |
| Workflow profile | `standard` |
| Current status | `research_published` |

## Rule

Каждый research artifact содержит `## Inputs Used` или schema payload.

## Stage Status

| Stage | Owner | Required artifacts | Status | Notes |
|---|---|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `recursive-brief.md`, `handoff-bundle.md`, `stage-gate-ledger.md` | completed | Новый research-focused run создан. |
| 01-research | research | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | completed | Source-backed web evidence обновлен; Tavily, DeepSeek и Gemini прошли provider coverage. |
| CJM / opportunity | orchestrator | `cjm-map.md`, `opportunity-roadmap.md` | completed | Сценарии, ICE/RICE и roadmap записаны. |
| Notion export | orchestrator | `notion-research-export-ru.md`, `notion-publication-plan.md` | published | Russian Publication Gate пройден локально; пользователь разрешил публикацию; hub опубликован в Notion. |

## Provider Coverage

| Provider | Required | Status | Evidence |
|---|---:|---|---|
| Web search | yes | used | `source-log.md` |
| Tavily | yes for success | pass | `research-summary.md`, runner record 2026-06-06T08:15:57.610Z |
| DeepSeek | yes for success | pass | `research-summary.md`, runner record 2026-06-06T08:15:57.610Z |
| Gemini | yes for success | pass | `research-summary.md`, runner record 2026-06-06T08:15:57.610Z |

## Publication Plan

| Field | Value |
|---|---|
| action | `notion_research_publish` |
| target | `3696473174e58006af5fd367ef89d978` |
| mode | `notion_api` |
| layout_strategy | `hub_with_grouped_child_pages_and_selective_toggles` |
| source artifact | `notion-research-export-ru.md` |
| external writes | completed |
| approval state | approved in `approval-state.json`; user approved publication in current chat |
| published hub id | `37764731-74e5-8109-b359-f7a4ba80d6e7` |
| published hub URL | `https://www.notion.so/3776473174e58109b359f7a4ba80d6e7` |
| child pages | 8 |
| blocks published | 292 |

## Publication Evidence

| Step | Result |
|---|---|
| Approval | `notion_research_publish` approved for target `3696473174e58006af5fd367ef89d978` at `2026-06-06T08:22:00.000Z`. |
| Dry-run | Passed: layout `hub_with_grouped_child_pages_and_selective_toggles`, 8 child pages, estimated 278 blocks. |
| Publish | Created hub `37764731-74e5-8109-b359-f7a4ba80d6e7` with 8 child pages and 292 Russian human-readable blocks. |

## Validation Runs

- `yarn workflow:doctor`: pass.
- `workflow:start`: attempted; it targeted old `outputs/a3pay-cjm/2026-06-05` and surfaced stale state conflict, so a fresh `2026-06-06` run was created manually.
- `workflow:sync`: pending.
- `workflow:validate --profile standard`: pending.

## Research Stage Runner Record

| 2026-06-06T08:15:57.610Z | 01-research | ready | Providers used: tavily, deepseek, gemini; validation: pass |

## Гейт записи research-артефактов

| Файл | Действие | Оценка существующего | Оценка кандидата | Причина |
|---|---|---:|---:|---|
| research-summary.md | written | 85 | 77 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| competitive-analysis.md | written | 38 | 45 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| proto-personas.md | written | 42 | 41 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| synthetic-interviews.md | written | 50 | 29 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| swot.md | written | 28 | 44 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |

| 2026-06-06T08:20:47.700Z | workflow-engine rerun 01-research | reset | Forced rerun reset 01-research, 02-prd, 03-ia, 04-design, 05-copy, 06-screens, 07-prototype, 08-frontend, 10-test-bench, 11-qa, 12-release |
## Research Stage Runner Record

| 2026-06-06T08:21:17.419Z | 01-research | ready | Providers used: tavily, deepseek, gemini; validation: pass |

## Гейт записи research-артефактов

| Файл | Действие | Оценка существующего | Оценка кандидата | Причина |
|---|---|---:|---:|---|
| research-summary.md | written | 65 | 76 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| competitive-analysis.md | written | 52 | 40 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| proto-personas.md | written | 41 | 41 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| synthetic-interviews.md | written | 37 | 37 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |
| swot.md | written | 28 | 28 | Новый артефакт прошел quality gate или существующий артефакт был слабее. |

## Publication Shape Gate Sync

| Item | Status | Evidence |
|---|---|---|
| Runtime gate | implemented | `tooling/scripts/publish-notion-research-hub.mjs` blocks hub publication unless `publication_shape_gate.pass=true`. |
| Local export | pass | `notion-research-export-ru.md` now renders personas, CJM, competitive matrix and ICE/RICE as tables/schemes. |
| Dry-run after fix | pass | `publish-notion-research-hub.mjs --dry-run` returned 8 child pages, estimated 272 blocks and `publication_shape_gate.pass=true`. |
| Published Notion hub | needs_update | Current published hub `37764731-74e5-8109-b359-f7a4ba80d6e7` was created before the shape-gate export fix; republish/update requires a new interactive approval. |
