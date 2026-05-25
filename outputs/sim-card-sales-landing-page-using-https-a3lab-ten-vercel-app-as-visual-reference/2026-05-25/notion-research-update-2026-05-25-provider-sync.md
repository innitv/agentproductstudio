# Provider sync update

## Current research providers

Default `deep_research` pipeline is synchronized to:

| Provider | Role | Status |
|---|---|---|
| Tavily | Source-backed research, competitor discovery, evidence URLs | active |
| DeepSeek | Research checks, contradiction review, claims-to-validate | active |

## Verification

- Provider order: `tavily,deepseek`.
- Current research report: `reports/research/sim-line-multi-source-2026-05-25-tavily-deepseek.json`.
- Latest API run returned both providers with no failures.
- Workflow validation, config validation, typecheck and build passed.

DeepSeek remains a check/synthesis provider: facts for public copy still require Tavily, official sources or user-provided primary sources.
