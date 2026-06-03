# Политика guardrails

## Целостность доказательств

- Не представляй hypotheses как facts.
- Каждый market, competitor, pricing или behavior claim должен иметь source-backed evidence или статус `needs validation`.
- Proto personas остаются proto, пока не подтверждены real user data.
- Synthetic interviews всегда synthetic и не используются как proof.
- Не подменяй required provider/API/MCP/browser/reference check локальной догадкой или другим удобным источником. Если конкретный provider обязателен, результат должен быть фактическим provider output или documented failure.
- Если required provider не вызван, упал, требует approval или недоступен, stage не может иметь `success`; используй `partial`/`blocked` и зафиксируй failure в `research-summary.md`, `handoff-bundle.md` и `stage-gate-ledger.md`.
- Assumptions не могут заменять Findings, evidence, provider coverage или acceptance criteria.

## Продуктовые утверждения

- Не обещай guaranteed outcomes без evidence.
- Не переноси claims из synthetic interviews в PRD/copy/frontend без `needs validation`.
- Risky claims должны быть перечислены в `claims_to_validate`.

## Ворота стадий

- Не пропускай required artifacts.
- Не начинай downstream work, если upstream stage заблокирован.
- Не начинай frontend до PRD, IA, design, copy, screens и prototype, кроме явного режима `quick draft`.
- `quick draft` допустим только по явному запросу пользователя, не может завершаться как `success` и запрещен для reference-driven задач, внешних публикаций, Figma write, deploy и production-quality acceptance.
- Обновляй `handoff-bundle.md` и `stage-gate-ledger.md` после каждого stage.
- После ручной правки артефактов запускай `yarn workflow:sync outputs/<project-slug>/<YYYY-MM-DD>` или фиксируй blocker, если синхронизация невозможна.

## Внешние записи

Human approval требуется для:

- Публикация или update в Notion.
- Agentic model-provider calls (`model_provider_call`) с exact stage target.
- External research provider calls с project/product context.
- Деплой.
- Внешние сообщения.
- Изменение секретов.
- Удаление данных.
- Широкое подключение MCP.
- Write-действия в GitHub/GitLab.

Approval matching строгий по target: targetless approval не покрывает targeted request, а targeted approval не покрывает targetless request.

## Чувствительные данные

- Не сохраняй секреты в code, outputs, traces или docs.
- Не включай raw PII в analytics events.
- Для production-like traces избегай sensitive inputs и outputs.

## Инструменты

- Предпочитай local file operations вместо external MCP, если этого достаточно.
- Перед external MCP проверь permissions, какие данные покидают project и нужен ли approval.
- Для OpenAI-related implementation questions используй official docs.
- Если пользователь или workflow явно требует Tavily/DeepSeek/OpenAI Docs MCP/Notion/visual reference screenshot gate, не обходи это другим инструментом. Запроси approval или верни blocker.
