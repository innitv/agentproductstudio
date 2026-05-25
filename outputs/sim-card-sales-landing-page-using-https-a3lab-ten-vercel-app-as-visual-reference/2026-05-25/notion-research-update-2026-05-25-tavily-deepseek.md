# Обновление research pipeline — Tavily + DeepSeek

## Что изменено

Для `deep_research` теперь используется default multi-source связка:

- Tavily — source-backed web/API evidence и список источников.
- DeepSeek — обязательный research check/cross-check: противоречия, риски, claims-to-validate, unknowns.

DeepSeek не считается source-backed evidence сам по себе. Его вывод используется для проверок и стресс-теста гипотез, а фактические утверждения должны подтверждаться Tavily/первичными источниками.

## Проверка

Проведен новый API-run по default provider order.

| Provider | Requested | Used | Failures | Validation |
|---|---:|---:|---:|---|
| Tavily | yes | yes | 0 | pass |
| DeepSeek | yes | yes | 0 | pass |

Результат: `ready` для research gate по новому правилу Tavily + DeepSeek. Количественные market-size claims и legal/KYC claims всё равно остаются `needs_validation` до проверки по первичным источникам и реальной операционной модели.
