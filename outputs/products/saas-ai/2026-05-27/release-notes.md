---
schema_payload:
  {
    "status": "ready",
    "inputs_used": [
      "qa-report.md",
      "frontend-result.md",
      "test-bench-result.md"
    ],
    "changed_files": [
      "outputs/<project-slug>/<date>/*.md"
    ],
    "what_changed": [
      "Generated local standard workflow artifacts from intake through release."
    ],
    "validation": [
      {
        "command": "yarn workflow:validate",
        "result": "pass after runner completion"
      }
    ],
    "deployment_notes": [
      "No deployment performed by local workflow runner."
    ],
    "rollback_notes": [
      "Remove generated output directory if the run should be discarded."
    ]
  }
---

# Release Notes

# Release Notes

## Status
ready
## Inputs Used
- qa-report.md
- frontend-result.md
- test-bench-result.md
## Changed Files
- outputs/<project-slug>/<date>/*.md
## What Changed
- Generated local standard workflow artifacts from intake through release.
## Validation
| Command | Result |
|---|---|
| yarn workflow:validate | pass after runner completion |
## Deployment Notes
- No deployment performed by local workflow runner.
## Rollback Notes
- Remove generated output directory if the run should be discarded.
## Notion Research Publication
Notion publication is still approval-gated and must be recorded before external release success.
