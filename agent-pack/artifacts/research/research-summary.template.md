# Research Summary Template

## Artifact Metadata

| Field | Value |
|---|---|
| Status | draft / partial / blocked / ready |
| Research mode | local_only / web_search / deep_research / user_sources_only |
| Evidence level | source-backed / mixed / synthetic / hypothesis |
| Readiness score |  |

## Inputs Used

- `recursive-brief.md`
- `handoff-bundle.md`
- Sources:

## Source Policy

- Allowed sources:
- Denied sources:
- Citation requirement:
- External write: denied unless approval exists

## Provider Coverage

Required for `deep_research`: `tavily` must return usable sources and `deepseek` must return usable cross-check/check results for `ready`.
If either default provider is unavailable, failed or empty, set Status to `partial` and record `needs_validation`.

| Provider | Requested | Used | Sources count | Validation state | Notes |
|---|---:|---:|---:|---|---|
| tavily | yes / no | yes / no |  | pass / needs_validation / failed |  |
| deepseek | yes / no | yes / no | 0 | pass / needs_validation / failed | required cross-check; not source-backed evidence |

## Provider Failures

| Provider | Error / blocker | Impact | Follow-up |
|---|---|---|---|

## Research Questions

| Question | Why it matters | Evidence needed | Status |
|---|---|---|---|

## Audience

| Segment | Context | Motivation | Barrier | Evidence status |
|---|---|---|---|---|

## Jobs To Be Done

| Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|

## Proto Personas

Required: 2-4 proto personas or `skipped_with_reason`.

| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|---|

## Synthetic Interviews

Required: 3-5 simulated interviews or `skipped_with_reason`.

Guardrail: synthetic interviews are used only for hypothesis generation, interview-script stress testing and validation questions. They are not evidence of real user behavior.

| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |
|---|---|---|---|---|---|---|

## Competitors and Alternatives

| Name | Type | Category | Core offer | Source | Evidence status |
|---|---|---|---|---|---|

## Findings

| Finding | Impact | Evidence | Confidence | Product implication |
|---|---|---|---|---|

## Claims To Validate

| Claim | Current evidence | Risk | Validation method |
|---|---|---|---|

## Research Validation Plan

| Hypothesis | Who to interview or observe | Minimum evidence | Decision unlocked | Status |
|---|---|---|---|---|

## Sources

| Source | Provider | Type | URL/path | Used for | Retrieved at | Confidence |
|---|---|---|---|---|---|---|

## Unknowns

- 

## Readiness Checklist

- [ ] Research questions are answered or marked `needs validation`.
- [ ] Provider Coverage records requested, used, unavailable/failed providers.
- [ ] Tavily returned usable sources or Status is `partial`.
- [ ] DeepSeek returned usable cross-check/check output or Status is `partial`.
- [ ] DeepSeek output is marked as cross-check/synthesis and not treated as evidence.
- [ ] Audience segments are defined.
- [ ] JTBD is complete.
- [ ] Proto Personas are present or `skipped_with_reason`.
- [ ] Synthetic Interviews are present or `skipped_with_reason`.
- [ ] Research Validation Plan is actionable.
- [ ] Findings separate evidence from hypotheses.
