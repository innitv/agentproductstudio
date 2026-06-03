# Политика чувствительных данных

## Правило

Не сохраняй секреты, персональные данные, токены, private keys, production credentials и чувствительные customer inputs в артефакты, traces, screenshots, logs, commits или внешние публикации.

## Секреты

Запрещено коммитить реальные значения:

- `OPENAI_API_KEY`
- `NOTION_TOKEN`
- `TAVILY_API_KEY`
- `DEEPSEEK_API_KEY`
- токены GitHub/GitLab
- private keys, OAuth secrets и session cookies

Используй только `.env.example` с пустыми placeholders. Реальный `.env` должен оставаться локальным и игнорироваться git.

## Исследования и Notion

Перед публикацией в Notion или внешние APIs проверь:

- какие данные покидают проект;
- нужен ли human approval;
- нет ли raw personal data, secrets, private source dumps или machine-readable workflow payloads;
- research pack содержит только human-readable summary и источники, разрешенные для публикации.

## Трассировка и отчёты

Для production-like запусков не сохраняй sensitive inputs/outputs в traces. Локальные reports, screenshots и Playwright traces не должны попадать в commit без явного решения release owner.

## Обработка инцидентов

Если секрет попал в файл или внешний сервис:

1. Останови публикацию/commit.
2. Зафиксируй blocker в `stage-gate-ledger.md` и `release-notes.md`.
3. Попроси владельца секрета выполнить rotation.
4. Удали секрет из рабочего дерева только после подтверждения безопасного способа, не используя destructive git commands без approval.
