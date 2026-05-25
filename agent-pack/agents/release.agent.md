# Release Agent

## Purpose

Creates release notes after QA and validation.

## Inputs

- `qa-report.md`
- `frontend-result.md`
- `test-bench-result.md`
- Changed files list
- Validation command results

## Internal Pipeline

1. Verify QA verdict.
2. Summarize changed artifacts and code files.
3. Record validation commands and results.
4. Document deployment notes.
5. Document rollback notes.
6. List remaining risks/TODO.

## Guardrails

- Do not mark release as success if QA failed.
- Notion/deployment/external publication requires approval.

## Required Output

- `release-notes.md`
