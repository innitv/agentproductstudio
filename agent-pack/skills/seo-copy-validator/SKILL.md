---
id: seo-copy-validator
name: seo-copy-validator
title: "SEO & Copywriting Validator"
description: "Use when stage 05-copy or 11-qa must validate landing copy, SEO metadata, semantic heading hierarchy, and marketing claims against source-backed research. Produces copy_deck/qa_report evidence and marks unsupported claims as needs_validation."
platforms:
  - codex
  - open-code
  - claude
mcp_servers:
  - web_search
strictness_profile: strict
owner_stage_ids:
  - 05-copy
  - 11-qa
required_inputs:
  - prd
  - research_summary
  - copy_deck
required_outputs:
  - copy_deck
  - qa_report
approval_actions:
  - external_research_provider_call
validation_commands:
  - yarn validate:config
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: SEO & Copywriting Validator

## 1. Назначение

Применяй skill при создании или QA `copy-deck.md`, чтобы тексты соответствовали PRD, IA, research evidence, SEO constraints и не содержали неподтвержденных claims.

## 2. Обязательные inputs

- `prd.md`: позиционирование, goals, requirements, acceptance criteria.
- `research-summary.md`: source-backed findings и claims-to-validate.
- `copy-deck.md`: hero, CTA, sections, FAQ, SEO.
- Дополнительные research files, если claim ссылается на competitors/personas/interviews/SWOT.

## 3. Процедура

1. Проверь структуру copy по IA/screens: каждая секция должна иметь назначение, CTA или следующий шаг.
2. Проверь heading hierarchy: один H1, секционные H2, вложенные H3 без пропусков уровней.
3. Составь claims matrix для всех численных, сравнительных, юридических, медицинских, финансовых, performance и "best/first/only" утверждений.
4. Для каждого claim зафиксируй:
   - exact claim;
   - source artifact;
   - evidence source или `none`;
   - статус: `source_backed`, `synthetic_only`, `needs_validation`, `unsupported`;
   - действие: keep, soften, remove, validate later.
5. Tavily/source-backed evidence может подтверждать claims. DeepSeek/Gemini synthesis без внешних источников не считается source-backed evidence.
6. Проверь SEO metadata: title до 60 символов, description 110-160 символов, без keyword stuffing и заглушек.
7. Проверь `Voice & Terminology`: нет запрещенных терминов, generic SaaS/AI cliches, пустых усилителей и фраз, не соответствующих ToV.
8. Проверь `UX Microcopy`: формы, ошибки, пустые/loading/success states, consent/privacy notes и helper text не противоречат PRD и не собирают PII.
9. Проверь `Responsive Copy Variants`: у H1, CTA, карточек и validation messages есть короткие варианты, если они нужны для мобильных/компактных экранов.
10. Проверь `Copy-To-Design Handoff`: CTA labels, length constraints, content risks и proof/support needs переданы downstream.
11. Запиши `## Claims To Validate` в `copy-deck.md`; в QA stage добавь findings в `qa-report.md`.

## 4. External research gate

Если для claim validation нужен внешний поиск, проверь approval action `external_research_provider_call` и правила research stage. Не выдумывай источники и не превращай hypothesis в fact.

## 5. Evidence и failure modes

Ставь `partial`, если copy usable, но часть claims требует валидации. Ставь `blocked`, если ключевой value proposition зависит от неподтвержденного high-risk claim.

## 6. Validation gates

- [ ] Один H1 и корректная иерархия H2/H3.
- [ ] Нет fake testimonials, fake logos, fake numbers.
- [ ] Все спорные claims есть в `## Claims To Validate`.
- [ ] SEO title/description заполнены и соответствуют ограничениям.
- [ ] Voice & terminology не содержат generic AI/SaaS cliches.
- [ ] UX microcopy покрывает ключевые состояния интерфейса.
- [ ] Responsive copy variants подготовлены для компактных элементов.
- [ ] Copy-To-Design Handoff создан и пригоден для screens/prototype/frontend.
