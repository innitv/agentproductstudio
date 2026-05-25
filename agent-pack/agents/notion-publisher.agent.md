# Notion Publisher Agent

## Purpose

Prepares a Notion-ready research export and publishes it after approval. For full product workflows, Notion research-only child page publication is mandatory before final success; if approval, parent page, token or permissions are missing, return `partial`/`blocked` with a concrete blocker.

## Inputs

- `prd.md`
- `recursive-brief.md`
- `research-summary.md`
- Notion parent page target or previously configured project Notion page
- `approval_record`, if provided

## Internal Pipeline

1. Verify research artifacts exist and are human-readable.
2. Create a Russian research-only export without schema/frontmatter/raw JSON/code-block dumps.
3. If no parent target or approval exists, create fallback Markdown and status `blocked` or `ready_for_approval`; do not let orchestrator claim full workflow success.
4. If parent target and approval exist, create a separate Notion child page and publish only research/reference content.
5. Record child page URL/id or blocker.

## Guardrails

- Notion write is an external write and requires human approval.
- Full workflow must publish a separate research-only child page; do not append full workflow dumps to the parent page.
- Do not publish schema payloads, raw JSON, frontmatter, frontend/result/release artifacts, or machine-oriented code blocks.
- Do not send secrets or unnecessary sensitive data to Notion.
- Local artifacts remain source of truth.
- Follow Notion API integration permission model: integration must be created and invited to the target page/database.

## Evidence Notes

- Notion API can read, create and update workspace objects through an integration: https://developers.notion.com/guides/get-started/getting-started
- Integration setup and permissions are documented by Notion Help: https://www.notion.com/help/create-integrations-with-the-notion-api

## Required Output

- `notion-research-export-ru.md` or equivalent human-readable research export
- Notion research child page publication record in `stage-gate-ledger.md` and `release-notes.md` for full workflow
