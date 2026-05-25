# Release Notes

## Summary

Готов первый end-to-end demo-run для лендинга AI-сервиса автоматизации записи клиентов в салонах красоты. Созданы продуктовые артефакты и статический HTML-прототип.

## Changed Files

| File | Change |
|---|---|
| `outputs/ai-salon-booking/2026-05-22/recursive-brief.md` | Created intake brief |
| `outputs/ai-salon-booking/2026-05-22/research-summary.md` | Created research summary |
| `outputs/ai-salon-booking/2026-05-22/prd.md` | Created PRD |
| `outputs/ai-salon-booking/2026-05-22/ia-brief.md` | Created IA brief |
| `outputs/ai-salon-booking/2026-05-22/design-brief.md` | Created design brief |
| `outputs/ai-salon-booking/2026-05-22/screens.md` | Created screen specification |
| `outputs/ai-salon-booking/2026-05-22/copy-deck.md` | Created copy deck |
| `outputs/ai-salon-booking/2026-05-22/prototype-report.md` | Created prototype report |
| `outputs/ai-salon-booking/2026-05-22/frontend-result.md` | Created frontend result |
| `outputs/ai-salon-booking/2026-05-22/test-bench-result.md` | Created test bench result |
| `outputs/ai-salon-booking/2026-05-22/qa-report.md` | Created QA report |
| `outputs/ai-salon-booking/2026-05-22/frontend/index.html` | Created static landing prototype |

## Artifacts

| Artifact | Path | Status |
|---|---|---|
| recursive_brief | `outputs/ai-salon-booking/2026-05-22/recursive-brief.md` | created |
| research_summary | `outputs/ai-salon-booking/2026-05-22/research-summary.md` | created |
| prd | `outputs/ai-salon-booking/2026-05-22/prd.md` | created |
| notion_prd_export |  | not used |
| ia_brief | `outputs/ai-salon-booking/2026-05-22/ia-brief.md` | created |
| design_brief | `outputs/ai-salon-booking/2026-05-22/design-brief.md` | created |
| screens | `outputs/ai-salon-booking/2026-05-22/screens.md` | created |
| copy_deck | `outputs/ai-salon-booking/2026-05-22/copy-deck.md` | created |
| prototype_report | `outputs/ai-salon-booking/2026-05-22/prototype-report.md` | created |
| frontend_result | `outputs/ai-salon-booking/2026-05-22/frontend-result.md` | created |
| test_bench_result | `outputs/ai-salon-booking/2026-05-22/test-bench-result.md` | created |
| qa_report | `outputs/ai-salon-booking/2026-05-22/qa-report.md` | created |

## Validation

| Check | Result |
|---|---|
| Research claims separated from hypotheses | pass |
| PRD/IA/copy/prototype consistency | pass |
| Secrets | pass |
| Static build required | not applicable |
| Browser QA | not run |

## Deployment Notes

- Static file can be opened directly in browser.
- For production deployment, split CSS/JS, add backend form handler, privacy policy and analytics consent handling.

## Rollback Notes

- Remove `outputs/ai-salon-booking/2026-05-22/` to roll back this demo-run.

## Risks

- Product claims need pilot validation.
- Figma design system not applied yet.
- Browser QA not performed.

## Follow-ups

- Run Figma MCP after design-system link is provided.
- Run Playwright/browser QA.
- Add real product name, logo, pricing and integration list.
