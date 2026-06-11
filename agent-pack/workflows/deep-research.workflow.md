# Workflow: глубокое исследование

## Цель

Создать исследовательскую базу, достаточную для решений по PRD, IA, дизайну, copy, прототипу и test bench, не выдавая гипотезы за факты.

## Политика источников

```yaml
mode: deep_research
prefer:
  - tavily
  - user_sources
  - official_sources
  - competitor_sites
  - reputable UX/product sources
allow:
  - local_files
  - tavily
  - deepseek
  - gemini
  - web_search
  - browser
deny:
  - external_write
require_citations: true
fallback: needs_validation
```

## Multi-Source Default

Для полного `deep_research` source of truth — `tavily` или другой source-backed/primary provider. Одиночный LLM-provider не считается успешным research gate, но одиночный source-backed provider может быть достаточен, если coverage, citations, source quality pass и Research Content Lint проходят.

`deepseek` и `gemini` не входят в default-run. Используй их только при явном opt-in как optional/advisory API cross-check/strategy providers для поиска противоречий, рисков и claims-to-validate. Их выводы не заменяют source-backed evidence из Tavily/источников, не увеличивают `sources_count` и не блокируют полный статус `success`, если они недоступны, упали или вернули шум. В таком случае фиксируй `advisory_failed`/`skipped_with_reason` в `research-summary.md`, `handoff-bundle.md` и `stage-gate-ledger.md`.
## Обязательные выходы

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Pipeline

1. Выполнить artifact context inventory: прочитать текущий run ledger, включая `run-plan.md`, `recursive-brief.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, прошлые research/export/CJM artifacts, `stage-results/*.json` и пользовательские local artifacts, если они уже лежат в run directory.
2. На основе всего artifact context создать research plan: questions, assumptions, decision needs, source classes, search dimensions и expected handoff для PRD/IA/design.
3. Сформировать targeted search queries по market/category, competitors/alternatives, user scenarios/JTBD, trust/compliance, pricing/business model и design implications. Query не должен терять ограничения и выводы, уже зафиксированные в run artifacts.
4. Запустить source-backed research по policy: Tavily/primary sources сначала; DeepSeek/Gemini только как advisory checks при явном opt-in.
5. Выполнить source quality pass: authority, freshness, directness, independence, specificity и relevance to decision. Noisy scrape не использовать как самостоятельный finding.
6. Запустить gap loop: если не хватает источников по конкурентам, primary facts, user evidence или design implications, выполнить дополнительный поиск или пометить `needs_validation`.
7. Сверить findings между providers и пометить противоречия как `claims_to_validate`.
8. Собрать sources по policy с provider name, `retrieved_at`, confidence, source type и `used_for`.
9. Сформировать artifact-driven synthesis: audience, JTBD, CJM/user paths, opportunity scoring, roadmap и research-to-design handoff на основе artifact context + provider output.
10. Создать `proto_personas` со статусом evidence.
11. Создать `synthetic_interviews` со статусом evidence: `synthetic`.
12. Создать список конкурентов и альтернатив.
13. Создать SWOT с evidence/status.
14. Создать validation plan и claims-to-validate.
15. Перед записью выполнить candidate quality/write gate: обязательные секции, доменная конкретика, русскоязычность публикационных секций, provider coverage, source-backed facts, claims-to-validate и отсутствие generic placeholders. Слабый candidate не должен молча затирать более полный artifact.
16. Обновить handoff и ledger, включая список реально использованных входных файлов и результат write gate.

## Обязательная валидация

Research считается COMPLETE только когда:

- все обязательные artifacts существуют;
- artifact context inventory выполнен по текущей run directory;
- `inputs_used` отражает реальные run artifacts, которые были прочитаны, а не только `recursive-brief.md`;
- evidence log существует;
- research plan существует;
- source quality pass существует;
- requested/used/unavailable/failures по providers записаны;
- Tavily или другой source-backed/primary provider вернул usable results для `success`; DeepSeek/Gemini failures не блокируют `success`, но должны быть записаны как advisory status;
- contradiction review существует, а unresolved conflicts записаны в claims-to-validate;
- validation plan существует;
- research-to-design handoff существует или содержит `skipped_with_reason`;
- candidate quality/write gate записан в handoff или ledger;
- unknowns задокументированы;
- `skipped_with_reason` is present for any missing research unit;
- ledger обновлён;
- handoff обновлён.

## Guardrails

- Synthetic interviews являются только артефактами для генерации гипотез.
- Synthetic participants не должны заменять real user research.
- Pricing, market size, competitor claims и user behavior требуют source-backed evidence или `needs validation`.
