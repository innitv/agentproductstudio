---
schema_payload:
  {
    "status": "ready",
    "inputs_used": [
      "ia-brief.md",
      "design-brief.md",
      "copy-deck.md"
    ],
    "screen_list": [
      {
        "name": "Landing page",
        "sections": [
          "Hero",
          "Value",
          "FAQ",
          "Lead form"
        ]
      }
    ],
    "desktop_specification": "Desktop: header + hero in first viewport, then full-width content bands with constrained inner content.",
    "mobile_specification": "Mobile: one-column layout, CTA and form remain reachable without horizontal scrolling.",
    "states": [
      "default",
      "form_focus",
      "form_success",
      "validation_error"
    ]
  }
---

# Screens

## Artifact Metadata

| Field | Value |
|---|---|
| Status | ready |
| Owner | design-generator |
## Inputs Used
- ia-brief.md
- design-brief.md
- copy-deck.md
## Screen
Landing page: Hero, value sections, FAQ and lead form.
## Desktop
Desktop: header + hero in first viewport, then full-width content bands with constrained inner content.
## Mobile
Mobile: one-column layout, CTA and form remain reachable without horizontal scrolling.
## States
- default
- form_focus
- form_success
- validation_error
