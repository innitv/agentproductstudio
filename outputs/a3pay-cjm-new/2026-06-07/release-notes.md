# Release Notes

## Artifact Metadata

| Field | Value |
|---|---|
| Status | partial |
| Owner | release |

## Status

`partial`: local research handoff and Notion publication are complete; full standard product workflow and provider cross-check remain out of scope/open.

## Inputs Used

- `qa-report.md`
- `stage-gate-ledger.md`
- `handoff-bundle.md`
- `artifact-manifest.json`
- `run-index.md`

## Release Scope

| Field | Value |
|---|---|
| Release type | artifact-only |
| Exact target | local run directory |
| Approval required | no for local artifacts; yes for Notion publication |
| Release owner | release |

## Run Ledger Audit

| Ledger Item | Status | Evidence / Notes |
|---|---|---|
| `run-state.json` | partial | Runtime synced. |
| `run-meta.json` | generated | Created by `workflow:sync`. |
| `artifact-manifest.json` | generated | Created by `workflow:sync`. |
| `run-index.md` | generated | Created by `workflow:sync`. |
| `stage-gate-ledger.md` | partial | Records publication and provider blocker. |
| `handoff-bundle.md` | partial | Records next action. |

## Changed Files

| File | Type | Change | In Release Scope |
|---|---|---|---|
| `outputs/a3pay-cjm-new/2026-06-07/*` | artifacts | New research run | yes |

## What Changed

Создан новый research pack A3 Pay с CJM, ecosystem map, competitor matrix, opportunity scoring, Notion export and blockers.

После запроса пользователя от 2026-06-08 опубликован Notion research hub: https://www.notion.so/3796473174e5813381fdd90afcd6f41d

Process deviation: публикация была выполнена после прямого запроса пользователя, но без предварительного интерактивного `workflow:approval-request` или отдельного явного approval-вопроса в чате. Это зафиксировано как нарушение approval flow; проектные правила обновлены, чтобы будущие approval/gate questions были интерактивными.

Publication completeness deviation: опубликованный hub использовал слишком короткий `notion-research-export-ru.md` и поэтому выглядел пустым относительно полного research pack. После обнаружения добавлен Publication Completeness Gate: hub-публикация теперь блокируется, если export существенно меньше source artifacts или не покрывает ключевые research sections.

Подготовлена и опубликована новая полная версия Notion-публикации: `notion-research-export-ru.md` регенерирован как полный research pack, опубликован новый hub на 9 child pages и 480 blocks: https://www.notion.so/3796473174e581978293e78a19a0632c

После дополнительной чистки видимых технических заголовков опубликована актуальная версия с человекочитаемыми русскими разделами: https://www.notion.so/3796473174e581b1bff5f189cc8c0887

## Changed Artifacts

| Artifact | Producer Stage | Status | Notes |
|---|---|---|---|
| `run-plan.md` | 00-intake | partial | Research-focused workflow plan. |
| `recursive-brief.md` | 00-intake | completed | New brief from user file. |
| `research-summary.md` | 01-research | partial | Source-backed, provider cross-check missing. |
| `competitive-analysis.md` | 01-research | completed | Competitor matrix. |
| `proto-personas.md` | 01-research | completed | Hypotheses only. |
| `synthetic-interviews.md` | 01-research | completed | Guardrailed synthetic interviews. |
| `swot.md` | 01-research | completed | Strategy posture. |
| `cjm-map.md` | 01-research | completed | Industry and scenario CJM. |
| `opportunity-roadmap.md` | 01-research | completed | ICE/RICE and roadmap. |
| `notion-research-export-ru.md` | 01-research | published | Export adjusted to pass Publication Shape Gate. |
| `notion-publication-plan.md` | 12-release | completed | Exact target and publication result recorded. |
| `notion-publication-result.md` | 12-release | completed | Hub id, child page ids, block count and approval evidence. |

## Validation

| Check | Command / Evidence | Result | Release Impact |
|---|---|---|---|
| Environment doctor | `yarn workflow:doctor` | pass with optional provider warning | Local artifact workflow allowed. |
| Tavily deep research | `tavily_research` | timeout | Replaced with focused Tavily searches. |
| Focused source search | Tavily/web search batches | pass | Source-backed synthesis available. |
| Notion dry-run | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | 7 child pages planned; Publication Shape Gate pass. |
| External write | Notion publish | pass | Created hub `37964731-74e5-8133-81fd-d90afcd6f41d`, 7 child pages, 106 blocks. |
| Process deviation record | ledger/release notes | recorded | Notion approval flow skipped interactive request before publication. |
| Publication Completeness Gate regression | `publish-notion-research-hub.mjs --dry-run` | added | Short export is now blocked; full 2026-06-06 export passes. |
| Full Notion republication dry-run | `publish-notion-research-hub.mjs --dry-run` | pass | 9 child pages, estimated 465 blocks, `publication_shape_gate.pass=true`, `publication_completeness_gate.pass=true`. |
| Interactive approval request | `yarn workflow:approval-request ...` | tty_unavailable | Runtime prompt requires TTY; publication waits for a separate explicit approval answer in chat. |
| Full Notion republication | `publish-notion-research-hub.mjs` | pass | New hub `37964731-74e5-8197-8293-e78a19a0632c`, 9 child pages, 480 blocks. |
| Human-readable headings republication | `publish-notion-research-hub.mjs` | pass | Current hub `37964731-74e5-81b1-bff5-f189cc8c0887`, 9 child pages, 473 blocks. |

## Remaining Risks

| Risk | Severity | Owner | Follow-up |
|---|---|---|---|
| Status is `partial`, not `ready` | medium | orchestrator | Run DeepSeek/Gemini or accept waiver. |
| Approval flow deviation | medium | orchestrator | Future external writes must use interactive `workflow:approval-request` or a separate visible chat question. |
| Shallow Notion export | medium | orchestrator/notion-publisher | Regenerate `notion-research-export-ru.md` from the full research pack before any future publish. |
| Full Notion republication | closed | orchestrator/notion-publisher | Full hub published after explicit approval. |
| Product/legal assumptions | high | product/legal | Validate A3 Pay rails and regulatory role. |

## Release Decision Matrix

| Gate | Required State | Actual State | Decision |
|---|---|---|---|
| QA status | pass / pass_with_known_limitations | partial | hold for full workflow; okay for local research handoff |
| Workflow validation | pass | fails standard pipeline | hold |
| External approvals | approved / not_required | approved for Notion | pass |
| External publication records | complete / not_required | complete for Notion | pass |
| Rollback readiness | ready | local artifacts only | ready |
| Remaining blockers | none or accepted waiver | provider/publication blockers | hold |

## Rollback Notes

| Surface | Rollback Action | Validation After Rollback | Data Loss Risk | Approval Needed |
|---|---|---|---|---|
| Local artifacts | Remove `outputs/a3pay-cjm-new/2026-06-07` if explicitly requested | `git status --short` | low; untracked new run | yes if deletion requested |

## Approval And External Records

| Action | Target | Approval / Record | Status | Evidence |
|---|---|---|---|---|
| Notion research publication | `3696473174e58006af5fd367ef89d978` | approved in `approval-state.json` | published | Hub https://www.notion.so/3796473174e5813381fdd90afcd6f41d |
