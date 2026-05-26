---
schema_payload:
  {
    "status": "pass_with_known_limitations",
    "inputs_used": [
      "recursive-brief.md",
      "research-summary.md",
      "prd.md",
      "ia-brief.md",
      "design-brief.md",
      "screens.md",
      "copy-deck.md",
      "prototype-report.md",
      "frontend-result.md",
      "test-bench-result.md"
    ],
    "research_integrity": {
      "status": "ready",
      "note": "Research coverage passed configured provider checks."
    },
    "prd_fit": "PRD, IA, copy and prototype share the same lead-generation funnel.",
    "accessibility": "Requires final browser QA for labels, focus and contrast.",
    "responsive": "Requires final Playwright or manual responsive QA after frontend edits.",
    "validation": [
      {
        "command": "yarn workflow:validate",
        "result": "planned by runner"
      }
    ],
    "blockers": []
  }
---

# QA Report

# QA Report

## Status
pass_with_known_limitations
## Inputs Used
- recursive-brief.md
- research-summary.md
- prd.md
- ia-brief.md
- design-brief.md
- screens.md
- copy-deck.md
- prototype-report.md
- frontend-result.md
- test-bench-result.md
## Research Integrity
Research coverage passed configured provider checks.
## PRD Fit
PRD, IA, copy and prototype share the same lead-generation funnel.
## Accessibility
Requires final browser QA for labels, focus and contrast.
## Responsive
Requires final Playwright or manual responsive QA after frontend edits.
## Validation
| Command | Result | Notes |
|---|---|---|
| yarn workflow:validate | planned by runner | Standard profile |
## Blockers
- No blocking QA issues in generated artifacts.
