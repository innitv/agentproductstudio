---
schema_payload:
  {
    "status": "partial",
    "inputs_used": [
      "ia-brief.md",
      "screens.md"
    ],
    "prototype_type": "Manual clickable prototype instructions",
    "start_screen": "Landing page hero",
    "transition_map": [
      {
        "from": "Hero CTA",
        "to": "Lead form",
        "trigger": "click"
      },
      {
        "from": "Lead form",
        "to": "Success state",
        "trigger": "submit valid form"
      }
    ],
    "completion_step": "Success state confirms next contact step",
    "missing_interactions": [
      "Real backend submission",
      "CRM integration"
    ]
  }
---

# Prototype Report

## Artifact Metadata

| Field | Value |
|---|---|
| Status | partial |
| Owner | prototype |
## Inputs Used
- ia-brief.md
- screens.md
## Prototype Type
Manual clickable prototype instructions
## Start Screen
Landing page hero
## Transition Map
| From | Trigger | To |
|---|---|---|
| Hero CTA | click | Lead form |
| Lead form | submit valid form | Success state |
## Completion Step
Success state confirms next contact step
## Missing Interactions
- Real backend submission
- CRM integration
