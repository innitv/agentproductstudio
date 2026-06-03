# Ревью кода

## Порядок приоритетов

1. Пользовательский сценарий: ошибки, которые ломают основной flow.
2. Безопасность: секреты, внешние записи, рискованные permissions, утечки данных.
3. Архитектура: нарушение ownership, route contracts, stage gates, artifact contracts.
4. Доступность и UX: клавиатура, labels, responsive-поведение, читаемые состояния.
5. Производительность: лишние запросы, тяжелые assets, blocking work.
6. Сопровождаемость: ясность кода, локальные паттерны, тестируемость.

## Формат ревью

Начинай с findings, отсортированных по severity. Для каждого finding указывай файл и строку, поведение, риск и конкретную правку. Если findings нет, явно напиши, какие проверки выполнены и какой residual risk остается.

## Проектные проверки

- Frontend должен соответствовать текущим артефактам `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md`, `prototype-report.md`.
- Если есть visual reference, проверяй `reference-analysis.md` и `visual-reference-review.md`.
- Не допускай claims без источников или пометки `needs_validation`.
- Не коммить `.env`, traces, screenshots, local logs и generated reports без явной причины.
