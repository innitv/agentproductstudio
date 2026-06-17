# Run Plan

## Статус

`partial`

## Запрос

Глубокое исследование: как проходят платежи внутри компаний недвижимости в России, включая все возможные способы оплаты и покупки недвижимости на разных сервисах, агрегаторах, у застройщиков, банков и в корпоративных сценариях.

## Дата

2026-06-15

## Workflow Profile

standard

## План этапов

- 00-intake: Intake and Recursive Brief -> run-plan.md, handoff-bundle.md, stage-gate-ledger.md, recursive-brief.md
- 01-research: Deep Research -> research-summary.md, competitive-analysis.md, proto-personas.md, synthetic-interviews.md, swot.md
- 02-prd: Product Requirements -> prd.md
- 03-ia: Information Architecture -> ia-brief.md
- 04-design: Design Brief -> design-brief.md
- 05-copy: Copy Deck -> copy-deck.md
- 06-screens: Screens -> screens.md
- 07-prototype: Prototype -> prototype-report.md
- 08-frontend: Frontend -> frontend-result.md
- 09-visual-reference: Visual Reference Review -> visual-reference-review.md
- 10-test-bench: Test Bench -> test-bench-result.md
- 11-qa: QA Review -> qa-report.md
- 12-release: Release -> release-notes.md

## Surface Output Contract

| Поле | Значение |
|---|---|
| surface_type | `research_report` |
| Аудитория | продуктовая команда, которая проектирует платежный/сделочный сервис для недвижимости в РФ |
| Scope | покупка первички, вторички, ИЖС/загородной недвижимости, аренда, коммерческая недвижимость, агрегаторы, банки, застройщики, внутренние B2B-платежи |
| Must-cover sections | платежные схемы, сервисы и агрегаторы, роли участников, риски, пользовательские сценарии, claims to validate, источники |
| Non-goals | юридическое заключение, финансовая рекомендация, расчет тарифов конкретной сделки |
| Quality bar | source-backed факты, сценарная привязка, таблицы по способам оплаты, отдельные риски и проверки |
| Verification plan | `yarn research:lint`, `yarn workflow:sync`, `yarn workflow:validate` или явная запись blocker |

## Ограничения

- Notion/Figma/deploy/git write не выполняются без отдельного approval.
- Tavily pro research timeout зафиксирован как non-blocking: источники собраны отдельными Tavily search-запросами.
