# Ворота качества

## Gate 0: настройка workflow

- `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `recursive-brief.md` существуют.
- Recursive brief содержит expansion, deepening, consolidation, assumptions и open questions.
- `yarn workflow:validate ... --through 00-intake` проходит без errors.
- Если stage исполняется через agentic specialist, structured envelope содержит обязательный `outputs.<artifact_name>` или `outputs.<file_name>` для каждого required artifact stage. `status: success` без полного Markdown artifact output запрещён.

## Gate 1: целостность исследования

- Research questions существуют.
- Для `deep_research` есть Provider Coverage по `tavily`, `deepseek` и `gemini`.
- Для `deep_research` статус `ready/success` допустим только если Tavily вернул usable sources, а DeepSeek и Gemini вернули usable cross-check/check/strategy results; иначе `partial` и `needs_validation`.
- DeepSeek и Gemini обязательны для research checks/cross-check, но их выводы отмечены как synthesis/strategy и не используются как source-backed evidence без внешнего источника.
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

## Gate 2: полнота PRD

- Problem, goals и non-goals существуют.
- Requirements приоритизированы через MoSCoW.
- Acceptance criteria тестируемы.
- Analytics events не содержат PII.
- Unvalidated claims помечены как `needs validation`.

## Gate 3: IA, дизайн и copy

- IA содержит primary screen, primary action и primary user flow.
- Design содержит responsive и accessibility notes.
- Если есть visual reference, `reference-analysis.md` содержит section-by-section visual spec, а `design-brief.md` и `screens.md` явно используют этот spec.
- Copy содержит hero, CTA, sections, FAQ, SEO и claims to validate.
- Copy не использует synthetic interviews как testimonials.

## Gate 4: экраны и прототип

- Screens согласованы с PRD, IA, design и copy.
- Prototype содержит start screen, transition map и completion step.
- Missing interactions явно описаны.

## Gate 5: фронтенд

- Frontend читает все upstream artifacts.
- Если frontend сделан в режиме `quick draft`, gate не может быть `passed`: допустим только `passed_with_notes`/`partial` с явным списком skipped upstream artifacts.
- Secrets не добавлены.
- Базовые responsive и accessibility требования реализованы.
- Доступные build/typecheck/test commands выполнены или blockers задокументированы.
- Если был visual reference: сняты full-page desktop/mobile screenshots референса и реализации.
- Если был visual reference: для каждой видимой секции сняты пары скриншотов с одинаковыми именами секций: `reference-desktop-section-<name>.png` + `local-desktop-section-<name>.png`, `reference-mobile-section-<name>.png` + `local-mobile-section-<name>.png`. Без полных пар gate = `blocked`.
- Если был visual reference: выполнен `yarn reference:diff <reference-report-dir> <local-report-dir> [output-dir]`, создан `visual-diff-result.json`, а результат зафиксирован в `visual-reference-review.md`. Без pixel diff gate = `blocked`.
- Если был visual reference: создан `visual-reference-review.md`, зафиксированы concrete gaps и corrections по всем секциям, компонентам и стилям.
- Если был visual reference: финальная реализация сверена по section-by-section mapping; generic/default landing style без соответствия референсу блокирует gate.

## Gate 6: test bench, QA и релиз

- Test bench описывает primary funnel и PII risk.
- QA проверяет Research integrity, PRD fit, UX, accessibility, responsive, analytics и secrets.
- QA проверяет full-page visual reference screenshot review, если пользователь давал reference URL/site.
- Release notes включают changed files, validation и rollback notes.
- Notion research-only child page publication выполнена для полного workflow и записана в `stage-gate-ledger.md` + `release-notes.md`, либо workflow явно помечен `partial/blocked` с причиной.
- Notion publication не содержит full workflow dump, schema/frontmatter, raw JSON payloads или code-block копии всех артефактов.
- Полный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` возвращает no errors для complete workflow без visual reference.
- Полный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference` возвращает no errors для complete workflow с visual reference.
