# DeepSeek API Provider

## Назначение

DeepSeek подключается как обязательный API provider для cross-check/synthesis внутри default `deep_research` pipeline вместе с Tavily и Gemini. Он помогает найти противоречия, риски, альтернативные формулировки JTBD и claims to validate, но не заменяет source-backed evidence.

## Endpoint

Используется OpenAI-compatible Chat Completions endpoint:

```env
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/chat/completions
DEEPSEEK_RESEARCH_MODEL=deepseek-v4-flash
```

Default model в runtime: `deepseek-v4-flash`.

## Secret Handling

- Храни ключ только в `.env`: `DEEPSEEK_API_KEY`.
- Не сохраняй ключ в outputs, traces, AGENTS.md или MCP config в открытом виде.
- Если ключ попал в чат, лог или commit, считай его скомпрометированным.

## Runtime Files

- Adapter: `runtime/typescript/deepseek-research.ts`
- Fan-out runner: `runtime/typescript/multi-source-research.ts`
- Source policy: `runtime/typescript/research.config.ts`

## Research Rule

Default `deep_research` requires Tavily + DeepSeek + Gemini. DeepSeek output has `confidence: low` until validated against Tavily, official sources or user sources. It can create `claims_to_validate`, but cannot be used as a cited market fact by itself.
