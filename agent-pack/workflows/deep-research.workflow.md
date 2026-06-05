# Workflow: глубокое исследование

## Цель

Создать исследовательскую базу, достаточную для решений по PRD, IA, дизайну, copy, прототипу и test bench, не выдавая гипотезы за факты.

## Политика источников

```yaml
mode: deep_research
prefer:
  - tavily
  - deepseek
  - gemini
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

Для полного `deep_research` используются все default providers: `tavily`, `deepseek` и `gemini`.
Одиночный provider не считается успешным research gate: если один из них недоступен, упал или не вернул источники, stage получает статус `partial`, а причина фиксируется в `research-summary.md`, `handoff-bundle.md` и `stage-gate-ledger.md`.
`deepseek` и `gemini` используются обязательно как API cross-check/strategy providers для поиска противоречий, рисков и claims-to-validate. Их выводы не заменяют source-backed evidence из Tavily/источников, но отсутствие DeepSeek/Gemini блокирует полный статус `success`.
## Обязательные выходы

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Pipeline

1. Прочитать `recursive-brief.md`.
2. Определить research questions и assumptions.
3. Запустить multi-source research по policy: Tavily + DeepSeek + Gemini по умолчанию.
4. Сверить findings между providers и пометить противоречия как `claims_to_validate`.
5. Собрать sources по policy с provider name, `retrieved_at` и confidence.
6. Сформировать audience и JTBD.
7. Создать `proto_personas` со статусом evidence.
8. Создать `synthetic_interviews` со статусом evidence: `synthetic`.
9. Создать список конкурентов и альтернатив.
10. Создать SWOT с evidence/status.
11. Создать validation plan и claims-to-validate.
12. Обновить handoff и ledger.

## Обязательная валидация

Research считается COMPLETE только когда:

- все обязательные artifacts существуют;
- evidence log существует;
- requested/used/unavailable/failures по providers записаны;
- Tavily, DeepSeek и Gemini вернули usable results для `success`; иначе статус остается `partial`;
- validation plan существует;
- unknowns задокументированы;
- `skipped_with_reason` is present for any missing research unit;
- ledger обновлён;
- handoff обновлён.

## Guardrails

- Synthetic interviews являются только артефактами для генерации гипотез.
- Synthetic participants не должны заменять real user research.
- Pricing, market size, competitor claims и user behavior требуют source-backed evidence или `needs validation`.
