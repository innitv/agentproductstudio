# Quality Gates

## Gate 0: Workflow Setup

- `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `recursive-brief.md` существуют.
- Recursive brief содержит expansion, deepening, consolidation, assumptions и open questions.
- `yarn workflow:validate ... --through 00-intake` проходит без errors.

## Gate 1: Research Integrity

- Research questions существуют.
- Для `deep_research` есть Provider Coverage по `tavily` и `deepseek`.
- Для `deep_research` статус `ready/success` допустим только если Tavily вернул usable sources, а DeepSeek вернул usable cross-check/check results; иначе `partial` и `needs_validation`.
- DeepSeek API обязателен для research checks/cross-check, но его вывод отмечен как synthesis и не используется как source-backed evidence без внешнего источника.
- Provider failures, unavailable providers и empty-source cases записаны в research summary, handoff и ledger.
- Audience и JTBD существуют.
- Есть минимум 2 proto personas или `skipped_with_reason`.
- Есть 3-5 synthetic interviews или `skipped_with_reason`.
- Есть прото-персоны с evidence status.
- Каждый synthetic interview имеет `evidence_status: synthetic`.
- Synthetic interviews никогда не используются как real evidence.
- Competitive analysis существует.
- SWOT содержит strengths, weaknesses, opportunities и threats.
- Validation plan существует.
- `validation plan` достаточно конкретен: понятно, кого интервьюировать, что наблюдать и какой minimum evidence нужен.
- Facts, hypotheses и unknowns разделены.

## Gate 2: PRD Completeness

- Problem, goals и non-goals существуют.
- Requirements приоритизированы через MoSCoW.
- Acceptance criteria тестируемы.
- Analytics events не содержат PII.
- Unvalidated claims помечены как `needs validation`.

## Gate 3: IA / Design / Copy

- IA содержит primary screen, primary action и primary user flow.
- Design содержит responsive и accessibility notes.
- Если есть visual reference, `reference-analysis.md` содержит section-by-section visual spec, а `design-brief.md` и `screens.md` явно используют этот spec.
- Copy содержит hero, CTA, sections, FAQ, SEO и claims to validate.
- Copy не использует synthetic interviews как testimonials.

## Gate 4: Screens / Prototype

- Screens согласованы с PRD, IA, design и copy.
- Prototype содержит start screen, transition map и completion step.
- Missing interactions явно описаны.

## Gate 5: Frontend

- Frontend читает все upstream artifacts.
- Secrets не добавлены.
- Базовые responsive и accessibility требования реализованы.
- Доступные build/typecheck/test commands выполнены или blockers задокументированы.
- Если был visual reference: сняты full-page desktop/mobile screenshots референса и реализации, при lazy/scroll animations сняты section screenshots, создан `visual-reference-review.md`, зафиксированы concrete gaps и corrections по всем секциям, компонентам и стилям.
- Если был visual reference: финальная реализация сверена по section-by-section mapping; generic/default landing style без соответствия референсу блокирует gate.

## Gate 6: Test Bench / QA / Release

- Test bench описывает primary funnel и PII risk.
- QA проверяет Research integrity, PRD fit, UX, accessibility, responsive, analytics и secrets.
- QA проверяет full-page visual reference screenshot review, если пользователь давал reference URL/site.
- Release notes включают changed files, validation и rollback notes.
- Notion research-only child page publication выполнена для полного workflow и записана в `stage-gate-ledger.md` + `release-notes.md`, либо workflow явно помечен `partial/blocked` с причиной.
- Notion publication не содержит full workflow dump, schema/frontmatter, raw JSON payloads или code-block копии всех артефактов.
- Полный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD>` возвращает no errors для complete workflow.
