---
schema_payload:
  {
    "status": "blocked",
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
      "status": "partial",
      "note": "Research coverage is partial; product claims must remain marked needs validation."
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
    "blockers": [
      "Research remains partial; final success is blocked until provider coverage or approved fallback is recorded."
    ]
  }
---

# QA Report

# QA Report

## Status
blocked
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
Research coverage is partial; product claims must remain marked needs validation.
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
- Research remains partial; final success is blocked until provider coverage or approved fallback is recorded.
