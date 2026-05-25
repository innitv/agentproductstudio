# Code Review

## Priority Order

1. Пользовательский сценарий: ошибки, которые ломают основной flow.
2. Безопасность: секреты, внешние записи, рискованные permissions, утечки данных.
3. Архитектура: нарушение ownership, route contracts, stage gates, artifact contracts.
4. Accessibility and UX: keyboard, labels, responsive, readable states.
5. Performance: лишние запросы, тяжелые assets, blocking work.
6. Maintainability: ясность кода, локальные паттерны, тестируемость.

## Review Format

Начинай с findings, отсортированных по severity. Для каждого finding указывай файл и строку, поведение, риск и конкретную правку. Если findings нет, явно напиши, какие проверки выполнены и какой residual risk остается.

## Project-Specific Checks

- Frontend должен соответствовать текущим артефактам `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `prototype-report.md`.
- Если есть visual reference, проверяй `reference-analysis.md` и `visual-reference-review.md`.
- Не допускай claims без источников или пометки `needs_validation`.
- Не коммить `.env`, traces, screenshots, local logs и generated reports без явной причины.
