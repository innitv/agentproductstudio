# Политика guardrails

## Целостность доказательств

- Не представляй hypotheses как facts.
- Каждый market, competitor, pricing или behavior claim должен иметь source-backed evidence или статус `needs validation`.
- Proto personas остаются proto, пока не подтверждены real user data.
- Synthetic interviews всегда synthetic и не используются как proof.
- Не подменяй required source-backed provider/API/MCP/browser/reference check локальной догадкой или другим удобным источником. Если конкретный source-backed provider обязателен, результат должен быть фактическим provider output или documented failure.
- Если required source-backed provider не вызван, упал, требует approval или недоступен, stage не может иметь `success`; используй `partial`/`blocked` и зафиксируй failure в `research-summary.md`, `handoff-bundle.md` и `stage-gate-ledger.md`. DeepSeek/Gemini на `01-research` не входят в default-run; если явно включены как advisory checks, они не блокируют `success`, если source-backed evidence проходит gates.
- Assumptions не могут заменять Findings, evidence, provider coverage или acceptance criteria.

## Продуктовые утверждения

- Не обещай guaranteed outcomes без evidence.
- Не переноси claims из synthetic interviews в PRD/copy/frontend без `needs validation`.
- Risky claims должны быть перечислены в `claims_to_validate`.

## Anti-AI-Slop Gate

- Anti-AI-Slop Gate проверяет не только отдельные слова, а качество мышления в артефакте. Список паттерных слов является диагностическим индикатором, но не исчерпывает проблему.
- Не подменяй продуктовый вывод паттерными словами без жизненного объяснения. Формулировки `orchestration`, `rails`, `wedge`, `trust layer`, `seamless`, `unlock`, `flywheel`, `layer`, `companion`, `playbook` допустимы только как технические термины с русской расшифровкой и конкретным примером.
- Считай AI slop любое место, где текст звучит уверенно, но не содержит наблюдаемого поведения, конкретного контекста, причины решения, ограничения, источника или способа проверки.
- Запрещены универсальные выводы, которые можно вставить в любой продукт без изменения смысла. Каждый вывод должен содержать доменную деталь: конкретный сценарий, участника, ограничение рынка, регуляторный/операционный контекст, канал, объект оплаты, документ, событие или пользовательский страх.
- Запрещены пустые причинно-следственные связки: "это повысит доверие", "улучшит опыт", "снизит friction", "ускорит рост", если не указано, через какой механизм, в каком моменте пути и по какой метрике это проверяется.
- Запрещена однотипная композиция абзацев и таблиц, где каждый пункт повторяет один шаблон без новых деталей. Если строки отличаются только заменой существительных, это `needs_revision`.
- Запрещены псевдометрики без поведения: `conversion`, `retention`, `engagement`, `trust`, `activation` должны быть раскрыты как конкретное действие пользователя или бизнеса.
- Для research/CJM/roadmap/Notion/Figma-поверхностей каждый крупный вывод должен отвечать на вопросы: кто пользователь, что он делает в реальной жизни, где сомневается, что делает продукт, как это проверяется.
- Тезисная выжимка не заменяет проработку. Если пользователь просит подробно или задача является full/research workflow, обязательны кейсы, user flow, CJM-связи, метрики и validation method.
- CJM без ключевых кейсов, вопроса пользователя на этапе, боли, решения продукта и метрики считается `needs_revision`.
- Roadmap/ICE/RICE без связи с конкретным CJM friction и способом проверки считается `needs_revision`.

## Ворота стадий

- Не пропускай required artifacts.
- Не начинай downstream work, если upstream stage заблокирован.
- Не подменяй заявленный surface scope краткой выжимкой, обзорной картинкой или малым числом фреймов/экранов без coverage rationale. Если входных данных больше, чем output units, обязан быть Coverage Gate с явной картой включено/исключено.
- Для любой пользовательской поверхности `success` запрещен без Surface Output Contract, evidence-to-output map и verification evidence либо documented blocker.
- Не начинай frontend до PRD, IA, design, copy, screens и prototype, кроме явного режима `quick draft`.
- `quick draft` допустим только по явному запросу пользователя, не может завершаться как `success` и запрещен для reference-driven задач, внешних публикаций, Figma write, deploy и production-quality acceptance.
- Обновляй `handoff-bundle.md` и `stage-gate-ledger.md` после каждого stage.
- После ручной правки артефактов запускай `yarn workflow:sync <run-dir>` (`outputs/<project-slug>/<YYYY-MM-DD>` для product workflow или `research/projects/<research-slug>/<YYYY-MM-DD>` для standalone research) или фиксируй blocker, если синхронизация невозможна.

## Внешние записи

Human approval требуется для:

- Публикация или update в Notion.
- Agentic model-provider calls (`model_provider_call`) с exact stage target.
- External research provider calls с project/product context, кроме явно включенных non-blocking DeepSeek/Gemini advisory checks на `01-research`.
- Деплой.
- Внешние сообщения.
- Изменение секретов.
- Удаление данных.
- Широкое подключение MCP.
- Write-действия в GitHub/GitLab.

Approval matching строгий по target: targetless approval не покрывает targeted request, а targeted approval не покрывает targetless request.

Исключение для research: DeepSeek/Gemini advisory check на `01-research` не входит в default-run и может запускаться без отдельного approval только после явного opt-in. Разрешенный scope: contradiction review, claims-to-validate, проверка логики и пробелов исследования. Запрещенный scope: публикация, запись во внешние системы, deploy, git write, изменение секретов, отправка сообщений или использование provider synthesis как source-backed evidence. Результат или failure обязательно фиксируется в run ledger как advisory, но не блокирует readiness сам по себе.

## Чувствительные данные

- Не сохраняй секреты в code, outputs, traces или docs.
- Не включай raw PII в analytics events.
- Для production-like traces избегай sensitive inputs и outputs.

## Инструменты

- Предпочитай local file operations вместо external MCP, если этого достаточно.
- Перед external MCP проверь permissions, какие данные покидают project и нужен ли approval.
- Для OpenAI-related implementation questions используй official docs.
- Если пользователь или workflow явно требует Tavily/OpenAI Docs MCP/Notion/visual reference screenshot gate, не обходи это другим инструментом. Для DeepSeek/Gemini на `01-research` запускай advisory check только при явном opt-in и только как non-blocking validation; для остальных approval-gated providers запроси approval или верни blocker.
