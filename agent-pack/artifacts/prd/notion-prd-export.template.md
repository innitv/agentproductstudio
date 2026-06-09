# Notion PRD Export Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | draft / ready_for_approval / published / blocked |
| Owner | notion-publisher |

## Inputs Used

- `prd.md`
- `recursive-brief.md`
- `research-summary.md`

## Export Metadata

- Source PRD:
- Target workspace:
- Target database/page:
- Publication mode: `remote_mcp` / `local_mcp` / `notion_api` / `manual_import`
- Export status: `draft` / `ready_for_approval` / `published` / `blocked`
- Approval required: true
- Approval record:
- Source checksum:
- Published URL:
- Fallback markdown path:

## Publication Plan

- Action: `notion_prd_export` / `notion_agile_export`
- Exact target:
- Page title:
- Existing page/database lookup:
- Idempotency strategy:
- Expected writes:
- Expected block count:
- Expected chunk count:
- Unsupported blocks:

## Dry-Run Result

- Status: `not_run` / `passed` / `passed_with_warnings` / `blocked`
- Converter/tool:
- Block plan:
- Notion data shape plan:
- Database schema preview:
- Warnings:

## Notion Data Shape Plan

### Publication Editor Pass

| Check | Status | Notes |
|---|---|---|
| Public PRD export excludes internal sections | pass / needs_revision | Do not publish `Inputs Used`, `Artifact Metadata`, `Surface Output Contract`, internal audit/debug sections. |
| Requirements/user stories have one owner | pass / needs_revision | Full requirements and stories live in PRD page/database views, not repeated across research pages. |
| PRD overview is narrative, not duplicated research pack | pass / needs_revision | Link to research owners instead of copying full personas/CJM/backlog tables. |

| Entity / section | Recommended Notion shape | Target page for embedded view | Why | Schema preview / properties | Idempotency key |
|---|---|---|---|---|---|
| PRD narrative | `child_page` |  |  |  |  |
| Requirements | `database_index` / `notion_table_block` | PRD/requirements page |  |  |  |
| MoSCoW priorities | `database_index` / `notion_table_block` | PRD/requirements page |  |  |  |
| Acceptance Criteria | `to_do` blocks / `database_index` | PRD/requirements page |  |  |  |
| User Stories | `database_index` | PRD/user stories page |  |  |  |
| Personas | `database_index` | personas page |  |  |  |

If PRD export creates databases inside a Notion hub, use `integrated_hybrid`: keep databases as working indexes and embed linked database views into the PRD/personas/user-stories child pages. Detached databases without embedded views are `partial` until a linked-view pass is verified.

## Page Structure

1. Context
2. Problem Statement
3. Goals
4. Non-goals
5. Users and JTBD
6. Scope
7. Requirements and MoSCoW
8. Acceptance Criteria
9. Analytics
10. Risks, Assumptions and Open Questions

## Team-Ready Blocks

### Executive Summary

### Requirements Table

### MoSCoW Prioritization

### Acceptance Criteria

### Decisions Needed

## Agile Board Schema

### Personas Database

| Property | Type | Required | Notes |
|---|---|---|---|

### User Stories Database

| Property | Type | Required | Notes |
|---|---|---|---|

### Relations

| From | Relation Property | To | Notes |
|---|---|---|---|

### Acceptance Criteria Blocks

- Format: Notion `to_do`
- Source sections:
- Unsupported criteria:

## Publication Notes

- External Notion write requires human approval.
- If target or approval is missing, status must be `ready_for_approval` or `blocked`, and fallback Markdown must be created.
- Local artifacts remain source of truth.
- Markdown must be converted to structured Notion blocks, not uploaded as one raw code block.
- API/MCP writes must record block count, chunk count, retry count and any `429` backoff.
- Repeat publication must use the idempotency strategy above.

## Permission Checklist

- [ ] Notion integration token is configured locally.
- [ ] Integration is invited to target page/database.
- [ ] Target page/database is provided.
- [ ] Human approval is recorded.
