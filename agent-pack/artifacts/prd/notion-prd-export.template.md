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
- Database schema preview:
- Warnings:

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
