# Workflow: Deep Research

## Goal

Create a research base that is strong enough for PRD, IA, design, copy, prototype and test bench decisions without pretending that hypotheses are facts.

## Source Policy

```yaml
mode: deep_research
prefer:
  - tavily
  - deepseek
  - user_sources
  - official_sources
  - competitor_sites
  - reputable UX/product sources
allow:
  - local_files
  - tavily
  - deepseek
  - web_search
  - browser
deny:
  - external_write
require_citations: true
fallback: needs_validation
```

## Multi-Source Default

Для полного `deep_research` используются оба default providers: `tavily` и `deepseek`.
Одиночный provider не считается успешным research gate: если один из них недоступен, упал или не вернул источники, stage получает статус `partial`, а причина фиксируется в `research-summary.md`, `handoff-bundle.md` и `stage-gate-ledger.md`.
`deepseek` используется обязательно как API cross-check provider для поиска противоречий, рисков и claims-to-validate. Его вывод не заменяет source-backed evidence из Tavily/источников, но отсутствие DeepSeek блокирует полный статус `success`.
## Required Outputs

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Pipeline

1. Read `recursive-brief.md`.
2. Define research questions and assumptions.
3. Run multi-source research according to policy: Tavily + DeepSeek by default.
4. Cross-check findings across providers and mark contradictions as `claims_to_validate`.
5. Gather sources according to policy with provider name, retrieved_at and confidence.
6. Build audience and JTBD.
7. Create `proto_personas` with Evidence status.
8. Create `simulated_interviews` with Evidence status: `synthetic`.
9. Create competitor set and alternatives.
10. Create SWOT with evidence/status.
11. Create validation plan and claims-to-validate.
12. Update handoff and ledger.

## Mandatory Validation

Research is COMPLETE only when:

- all required artifacts exist;
- evidence log exists;
- providers requested/used/unavailable/failures are recorded;
- Tavily and DeepSeek both returned usable results for `success`; otherwise status is `partial`;
- validation plan exists;
- unknowns are documented;
- `skipped_with_reason` is present for any missing research unit;
- ledger is updated;
- handoff is updated.

## Guardrails

- Synthetic interviews are hypothesis-generation artifacts only.
- Synthetic participants must not replace real user research.
- Pricing, market size, competitor claims and user behavior require source-backed evidence or `needs validation`.

## Evidence References

- Intercom JTBD: https://www.intercom.com/books/jobs-to-be-done
- Atlassian Product Discovery: https://www.atlassian.com/agile/product-management/discovery
- UXAtlas on synthetic users and evidence risk: https://www.uxatlas.io/articles/synthetic-users-evidence
- UXArmy on synthetic participants limitations: https://uxarmy.com/blog/synthetic-participants-ux-research/
