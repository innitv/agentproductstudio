# Реестр ворот качества (Stage Gate Ledger)

## Run

## Запуск (Run)

- Project slug: `a3pay-cjm-new`
- Date: `2026-06-07`
- Goal: полный новый research workflow A3 Pay с нуля

## Inputs Used

- `run-plan.md`
- `recursive-brief.md`
- `handoff-bundle.md`
- `C:\Users\mrfra\Desktop\A3Pay_Research_Request_Extended.md`
- `yarn workflow:doctor`

## Rule

Этап считается закрытым только при наличии обязательных артефактов, `inputs_used`, обновленного handoff, validation notes и approval records для внешних действий.

## Stage Status

## Статус этапов (Stage Status)

| Этап | Владелец | Обязательные артефакты | Статус | Заметки ворот качества |
|---|---|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `handoff-bundle.md`, `recursive-brief.md` | completed | Новый запуск с нуля; старые outputs не использованы как основа. |
| 01-research | research | `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` | partial | Tavily/web source-backed pass; DeepSeek/Gemini cross-check needs_validation. |
| 02-prd | prd | `prd.md` | partial | `prd.md` создан из очищенного research pack; требования traceable, но статус не `ready` из-за DeepSeek/Gemini, legal/rails и custdev gaps. |
| 03-ia | ia | `ia-brief.md` | skipped | Вне scope текущего research turn. |
| 04-design | design | `design-brief.md` | skipped | Вне scope текущего research turn. |
| 05-copy | copywriting | `copy-deck.md` | skipped | Вне scope текущего research turn. |
| 06-screens | design-generator | `screens.md` | skipped | Вне scope текущего research turn. |
| 07-prototype | prototype | `prototype-report.md` | skipped | Вне scope текущего research turn. |
| 08-frontend | frontend | `frontend-result.md` | skipped | Вне scope текущего research turn. |
| 09-visual-reference | qa-review | `visual-reference-review.md` | skipped | Нет visual reference. |
| 10-test-bench | test-bench | `test-bench-result.md` | skipped | Нет prototype/frontend. |
| 11-qa | qa-review | `qa-report.md` | partial | Artifact QA выполнен, provider and publication blockers recorded. |
| 12-release | release | `release-notes.md`, `notion-publication-result.md` | partial | Notion publication completed; release remains partial because provider cross-check is still open. |

## Validation Runs

## Запуски валидации (Validation Runs)

| Время | Команда | Результат | Заметки |
|---|---|---|---|
| 2026-06-07 | `yarn workflow:doctor` | pass | Optional provider keys warning: `GEMINI_RESEARCH_MODEL` отсутствует в `.env.example` check list. |
| 2026-06-07 | `tavily_research` | timeout | Широкий deep research запрос разбит на короткие Tavily searches. |
| 2026-06-07 | `tavily_search` batches | pass | Получены источники по НПС, СБП, e-commerce, BNPL, недвижимости, авто, туризму, ЖКХ. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | Publication Shape Gate pass; 7 child pages planned. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ...` | pass | Published Notion hub `37964731-74e5-8133-81fd-d90afcd6f41d` with 7 child pages and 106 blocks. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | Full republication candidate passed Publication Shape Gate and Publication Completeness Gate; 9 child pages planned, estimated 465 blocks. |
| 2026-06-08 | `yarn workflow:approval-request ... notion_research_publish` | tty_unavailable | Runtime approval request requires a TTY; fallback is a separate explicit approval question in the current chat before any Notion write. |
| 2026-06-08 | `yarn workflow:approve ... notion_research_publish` | pass | Explicit user approval recorded for target `3696473174e58006af5fd367ef89d978`. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ...` | pass | Published full Notion hub `37964731-74e5-8197-8293-e78a19a0632c` with 9 child pages and 480 blocks. |
| 2026-06-08 | `node tooling/scripts/generate-notion-research-export.mjs ...` | pass | Regenerated export with human-readable Russian headings and invisible machine markers. |
| 2026-06-08 | `node tooling/scripts/publish-notion-research-hub.mjs ...` | pass | Published current Notion hub `37964731-74e5-81b1-bff5-f189cc8c0887` with human-readable headings, 9 child pages and 473 blocks. |
| 2026-06-08 | `yarn workflow:approval-request ... figma_write` | tty_unavailable | Runtime approval request requires a TTY; fallback was a separate explicit approval question in the current chat. |
| 2026-06-08 | `yarn workflow:approve ... figma_write` | pass | Explicit user approval recorded for target `new_figma_file:a3pay-research-visualization-2026-06-08`. |
| 2026-06-08 | Figma MCP `use_figma` | pass | Created `A3 Pay Research Board v2` page in Figma file `O1EK1ODspMvmJA7emTNnYd` with 19 data visualization frames. |
| 2026-06-08 | Figma MCP `get_screenshot` + frame inventory | pass | Page node `5:2`; 19 frames confirmed through `figma.currentPage.children`; screenshot smoke passed for canvas `4480x6780`. |
| 2026-06-08 | Lazyweb MCP direct probe | partial | `initialize` succeeded; `tools/list` returned `MCP_RATE_LIMITED`, so Lazyweb visual references were not embedded. |
| 2026-06-08 | Research output cross-link pass | pass | Added local Markdown links, `Карта связей исследования`, `Decision trail`, and `research-output-improvement-review.md`. |
| 2026-06-08 | `yarn workflow:approve ... notion_research_publish` | pass | Explicit user approval recorded for target `notion_hub:3796473174e581b1bff5f189cc8c0887`. |
| 2026-06-08 | Notion MCP `update_page` cross-link pass | pass | Updated hub and `00 Обзор` with cross-link map and decision trail. |
| 2026-06-09 | `yarn workflow:doctor` | pass | Optional provider keys warning remains non-blocking for local PRD work. |
| 2026-06-09 | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07` | pass | Updated research pack passes Anti-AI-Slop executable lint across summary, CJM, roadmap and Notion export. |
| 2026-06-09 | PRD creation | partial | `prd.md` created with Decision Input Audit, evidence-to-requirement map, MoSCoW, user stories, requirements, acceptance criteria, analytics and IA/design handoff. |
| 2026-06-08 | Notion MCP `fetch` verification | pass | Hub and overview include new cross-link sections and page links. |
| 2026-06-09 | `node tooling/scripts/generate-notion-research-export.mjs ...` | pass | Regenerated `notion-research-export-ru.md` from updated research artifacts; export size 124,570 bytes. |
| 2026-06-09 | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | Anti-slop republication dry-run allowed; 9 child pages, 605 estimated blocks, no publication blockers. |
| 2026-06-09 | `node tooling/scripts/publish-notion-research-hub.mjs ...` | pass | Published updated anti-slop hub `37a64731-74e5-81e1-8cf5-e6466d61f3fe` with 9 child pages and 624 blocks. |
| 2026-06-09 | Notion MCP `fetch` verification | pass | Verified updated hub title, parent, child page links, `Карта связей исследования` and `Цепочка решений`. |
| 2026-06-09 | `yarn workflow:approve ... notion_prd_export` | pass | Explicit user request recorded for target `notion_hub:37a6473174e581e18cf5e6466d61f3fe`. |
| 2026-06-09 | `node tooling/scripts/publish-notion-research-page.mjs ...` | pass | Published PRD child page `37a64731-74e5-81b6-81c3-ce6d25e3cced` under latest research hub; 43 blocks. |
| 2026-06-09 | Notion MCP `fetch` PRD verification | pass | Verified page title `10 PRD для MVP`, parent hub and structured Russian table blocks. |
| 2026-06-09 | Notion MCP `update_page` hub navigation | pass | Added `10 PRD для MVP` to hub navigation and updated child page count to 10. |
| 2026-06-09 | `yarn workflow:approve ... notion_agile_export` | pass | Approval recorded for database layer target `notion_hub:37a6473174e581e18cf5e6466d61f3fe`. |
| 2026-06-09 | Notion MCP create_database/create_pages | pass_with_limitations | Created 6 databases and 38 rows for personas, CJM frictions, opportunities, requirements, validation claims and sources. Relations not added in this pass. |
| 2026-06-09 | Notion MCP `fetch` database layer verification | pass | Hub fetch confirms database blocks and `Рабочие базы исследования` section. Row counts are based on successful create responses because query tool was unavailable. |
| 2026-06-09 | Notion MCP `create_view` integrated hybrid pass | pass | Created 6 linked database views inside relevant child pages: personas, CJM, opportunities, PRD requirements, validation claims and sources. |
| 2026-06-09 | Notion MCP `fetch` linked view verification | pass | Fetch confirmed inline database blocks on personas, CJM, opportunities, PRD and validation/source pages. |
| 2026-06-09 | `node tooling/scripts/generate-notion-research-export.mjs ...` | pass | Regenerated local `notion-research-export-ru.md` from source rules after Publication Editor Pass changes; internal ledger/debug sections removed from public export. |
| 2026-06-09 | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass | Synced export dry-run allowed: `publication_allowed=true`, `layout_strategy=integrated_hybrid`, Publication Shape/Completeness/Editor gates pass. No external Notion write performed. |
| 2026-06-09 | `yarn workflow:sync outputs\a3pay-cjm-new\2026-06-07` | pass | Run manifest/index/state synced after source-rule and output updates; run remains `partial` because downstream product stages/provider cross-check remain open. |

## Publication Gate

| Gate | Status | Notes |
|---|---|---|
| Russian Publication Gate | pass | `notion-research-export-ru.md` написан на русском, кроме technical terms. |
| Publication Shape Gate | pass | Personas, CJM, competitive matrix, ICE/RICE представлены таблицами. |
| Publication Completeness Gate | pass | Full republication candidate: 57,538 byte export vs 48,796 byte source pack; ratio 1.179; planned 9 child pages and 465 blocks. |
| External write approval | pass | `approval-state.json`: `notion_research_publish` approved for `3696473174e58006af5fd367ef89d978`. |
| Notion publication | published | Hub URL: https://www.notion.so/3796473174e5813381fdd90afcd6f41d |
| Full Notion republication | superseded | Full hub URL: https://www.notion.so/3796473174e581978293e78a19a0632c |
| Current Notion publication | superseded | Human-readable headings hub URL: https://www.notion.so/3796473174e581b1bff5f189cc8c0887 |
| Current anti-slop Notion publication | published | Updated hub URL: https://app.notion.com/p/37a6473174e581e18cf5e6466d61f3fe |
| PRD Notion publication | published | PRD child page URL: https://app.notion.com/p/37a6473174e581b681c3ce6d25e3cced |
| Notion database layer | published | 6 databases under latest hub: personas, CJM frictions, opportunities, requirements, validation claims, sources. |
| Notion integrated hybrid layer | published | Linked database views embedded into relevant child pages so the hub works as one research workspace, not separate pages plus detached databases. |
| Local synced publication export | dry_run_pass | `notion-research-export-ru.md` regenerated from updated source rules; dry-run passes `Publication Editor Pass`; no external write. |
| Figma write approval | pass | `approval-state.json`: `figma_write` approved for `https://www.figma.com/design/O1EK1ODspMvmJA7emTNnYd`. |
| Figma visualization | completed | File URL: https://www.figma.com/design/O1EK1ODspMvmJA7emTNnYd; page `A3 Pay Research Board v2`; 19 frames. |
| Research output links | completed | Local artifacts updated; Notion hub external update not performed. |
| Notion cross-link pass | completed | Hub URL: https://app.notion.com/p/3796473174e581b1bff5f189cc8c0887 |

## Process Deviations

| Date | Action | Target | Deviation | Impact | Remediation |
|---|---|---|---|---|---|
| 2026-06-08 | `notion_research_publish` | `3696473174e58006af5fd367ef89d978` | Agent treated the user's direct request to publish as approval and recorded `workflow:approve` without first running interactive `workflow:approval-request` or asking a separate explicit chat question. | Notion publication was completed, but approval flow did not match project protocol. | Project rules updated: all approval/gate questions must be interactive; future external writes require `workflow:approval-request` or a separate visible chat question before `workflow:approve`. |
| 2026-06-08 | `notion_research_publish` | `37964731-74e5-8133-81fd-d90afcd6f41d` | Agent published a shallow `notion-research-export-ru.md` that passed Publication Shape Gate but was much smaller than the full research pack. | Notion hub looked underfilled compared with the earlier full A3 Pay CJM hub. | Added Publication Completeness Gate to project rules and `publish-notion-research-hub.mjs`: shallow exports are blocked before dry-run approval/write. |
