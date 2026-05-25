---
schema_payload:
  status: ready
  inputs_used:
    - recursive-brief.md
  research_questions:
    - "Какая проблема решается?"
  audience:
    - segment: "Test segment"
      context: "Fixture context"
      motivation: "Fixture motivation"
      barrier: "Fixture barrier"
      evidence_status: "proto"
  jobs_to_be_done:
    - segment: "Test segment"
      job: "Make progress in a fixture workflow"
      trigger: "Validator test"
      pain: "Unclear validation"
      desired_outcome: "Clear pass/fail"
      evidence_status: "proto"
  proto_personas:
    - name: "Fixture Persona"
      segment: "Test segment"
      jtbd: "Validate schema-aware workflow"
      pain: "Missing structured checks"
      desired_outcome: "Reliable validation"
      evidence_status: "proto"
  simulated_interviews:
    - persona: "Fixture Persona"
      scenario: "Testing validator"
      summary: "Synthetic schema validation sample only"
      evidence_status: "synthetic"
      needs_validation: true
  findings:
    - finding: "Schema payload can be validated"
      evidence: "Fixture"
      confidence: "medium"
  sources:
    - title: "Fixture"
      url_or_path: "local"
      type: "fixture"
      used_for: "validator test"
  validation_plan:
    - hypothesis: "Schema validation works"
      method: "Run workflow validator"
      minimum_evidence: "No schema errors"
      status: "open"
  unknowns: []
---
# Research Summary

## Inputs Used

- `recursive-brief.md`

## Research Questions

- Какая проблема решается?

## Audience

Fixture audience.

## Jobs To Be Done

Fixture JTBD.

## Proto Personas

Fixture persona.

## Synthetic Interviews

Schema validation sample interview with evidence_status: synthetic.

## Research Validation Plan

Run validator.

## Findings

Schema payload can be validated.

## Sources

- local fixture
