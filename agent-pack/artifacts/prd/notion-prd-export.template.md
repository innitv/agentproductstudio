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
- Export status: `draft` / `ready_for_approval` / `published` / `blocked`
- Approval required: true
- Approval record:
- Published URL:
- Fallback markdown path:

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

## Publication Notes

- External Notion write requires human approval.
- If target or approval is missing, status must be `ready_for_approval` or `blocked`, and fallback Markdown must be created.
- Local artifacts remain source of truth.

## Permission Checklist

- [ ] Notion integration token is configured locally.
- [ ] Integration is invited to target page/database.
- [ ] Target page/database is provided.
- [ ] Human approval is recorded.

## Sources

- Notion API getting started: https://developers.notion.com/guides/get-started/getting-started
- Notion integration setup: https://www.notion.com/help/create-integrations-with-the-notion-api
