# Run Plan

## Статус

`in_progress`

## Запрос

Сделать новый лендинг продажи SIM-карт с визуальным референсом `https://a3lab-ten.vercel.app/`.

## Дата

2026-05-25

## Process Violation

До создания workflow scaffold был выполнен reference scan через Playwright. Frontend-код не менялся. Нарушение зафиксировано; дальнейшая работа идет заново по `AGENTS.md`: artifacts first, frontend only after PRD, IA, design, screens, copy and prototype.

## План этапов

- 00-intake: `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md`
- 01-research: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`
- 02-prd: `prd.md`
- 03-ia: `ia-brief.md`
- 04-design: `reference-analysis.md`, `design-brief.md`
- 05-copy: `copy-deck.md`
- 06-screens: `screens.md`
- 07-prototype: `prototype-report.md`
- 08-frontend: `frontend-result.md`
- 09-visual-reference: `visual-reference-review.md`
- 10-test-bench: `test-bench-result.md`
- 11-qa: `qa-report.md`
- 12-release: `release-notes.md`

## Ограничения

- Не копировать бренд, тексты, логотипы и trade dress A3 дословно.
- Использовать reference как композиционный ориентир: чистый B2B/consumer fintech-like layout, крупный hero, карточки преимуществ, тарифы, форма заявки.
- Основная тема: продажа физических SIM и eSIM с проверкой совместимости, выбором тарифа и заявкой.
- Research claims без источников помечать `needs validation`.
- Frontend заблокирован до завершения upstream artifacts.

## Source Policy

- Mode: `deep_research`
- Required source-backed/check providers: Tavily + DeepSeek; browser/reference scan only as fallback with `needs_validation`.
- DeepSeek may be used only as cross-check/synthesis and not as evidence.
- Current artifact run uses browser/reference scan and cited public sources; any unavailable API provider must be recorded as `needs_validation`.
