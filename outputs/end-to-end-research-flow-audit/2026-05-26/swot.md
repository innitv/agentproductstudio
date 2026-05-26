# SWOT

## Artifact Metadata

Status: ready

## Inputs Used

- `research-summary.md`
- `competitive-analysis.md`

## SWOT

| Quadrant | Item | Evidence | Confidence | Implication |
|---|---|---|---|---|
| Strength | Clear artifact-driven workflow can preserve research-to-frontend traceability | Local workflow files and provider output | medium | Use handoff bundle as source of truth |
| Weakness | Research readiness depends on configured external providers | Provider coverage state | medium | Keep partial status when providers are missing |
| Opportunity | Firecrawl and Playwright can improve reference-driven evidence collection | reference:scan package | medium | Feed screenshots and markdown into design gates |
| Threat | Unsourced market claims can leak into PRD or copy | DeepSeek guardrail and validation plan | high | Block success until claims are validated |

## Strategic Notes

- Treat Tavily as source-backed evidence provider and DeepSeek as contradiction/check provider.
- Use Firecrawl/reference scan for public competitor/reference pages when URLs are known.

## Strategic Decisions

- Downstream PRD should inherit `partial` if default provider coverage is incomplete.

## Risks

- No additional provider risks recorded.

## Readiness Checklist

- [x] Default multi-source research coverage passed.
