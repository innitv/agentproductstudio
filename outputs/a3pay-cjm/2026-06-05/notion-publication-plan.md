# Notion publication plan: A3Pay research pack

| Поле | Значение |
|---|---|
| Action | `notion_research_publish` |
| Target | `3696473174e58006af5fd367ef89d978` |
| Mode | `notion_api` via `tooling/scripts/publish-notion-research-hub.mjs` |
| Child page title | `A3Pay CJM: полное исследование платежных сценариев в России` |
| Source export | `outputs/a3pay-cjm/2026-06-05/notion-research-export-ru.md` |
| Approval | Exact approval recorded in `approval-state.json`. |
| Publication result | `hub_with_grouped_child_pages_published` |
| Short page | `37664731-74e5-81b3-b8a9-e16b54bc575e` |
| Short blocks published | `34` |
| Expanded page | `37664731-74e5-8106-b7f1-e36d3bfe80da` |
| Expanded blocks published | `306` |
| Russian expanded page | `37664731-74e5-8159-98fb-ee4e01ec132d` |
| Russian expanded blocks published | `306` |
| Final Russian page | `37664731-74e5-81d7-849e-c860ce735853` |
| Final Russian blocks published | `306` |
| Superseded Notion hub | `37664731-74e5-8129-bfc6-eb942cad9d09`; `37664731-74e5-818d-8a52-d9a7e733da0e`; `37664731-74e5-8187-ab1e-f2587809f929`; `37664731-74e5-8116-9d7e-db1e99d01776`; `37664731-74e5-814d-9d4d-ff80e05f006b` |
| Current Notion hub | `37664731-74e5-812f-b7c6-d52c7dfc9c4c` |
| Hub child pages | `8` |
| Hub total blocks | `449` |
| Hub toggle sections | `10` |
| Layout strategy | `hub_with_grouped_child_pages_and_selective_toggles` |
| Expanded export status | `published_selective_toggle_hub_current_after_tavily_deepseek_gemini_validation` |

## Source artifacts

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `cjm-map.md`

## Dry-run / block plan

Expected block conversion:

- Markdown headings -> Notion headings.
- Paragraphs -> Notion paragraph blocks.
- Bullet lists -> Notion bulleted list items.
- Tables -> Notion table blocks.
- Inline code/bold/links -> flattened clean text by local converter.

Unsupported or flattened:

- Markdown table formatting is converted to Notion tables where possible.
- Local file links are not published as machine links.
- Raw workflow metadata, JSON, schema/frontmatter and code blocks are not included.

## External writes

1. Create child page under configured parent page.
2. Append converted Notion blocks in chunks up to 80 blocks.
3. Record created page id/url or blocker in `stage-gate-ledger.md`.

## Idempotency strategy

For this run, corrected publications create a new child page or hub and mark previous pages as superseded in local evidence. Current grouped selective-toggle hub: `37664731-74e5-812f-b7c6-d52c7dfc9c4c`.
