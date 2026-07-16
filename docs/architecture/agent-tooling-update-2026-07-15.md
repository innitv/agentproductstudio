# Обновления по агентам: сверка с Claude Code 2026 и чужими коллекциями

**Дата:** 2026-07-15
**Тип:** limited engineering task / audit. Изначально — только находки и предложения; по решению пользователя P1-1, P1-2, P1-3, P2-1, P2-4 затем внедрены в этой же сессии (коммит `72344a7`).
**Фокус (по запросу пользователя):** (1) новые возможности субагентов Claude Code со времени прошлого аудита; (2) сравнение с популярными open-source agent-репозиториями. Дрифт нашей системы не проверялся.
**Предыдущий аудит:** `docs/architecture/agent-audit-2026-07-06.md`.

## Метод

- Верификация схемы frontmatter — по официальной документации `https://code.claude.com/docs/en/sub-agents` (прочитана напрямую, не пересказ агента).
- Сравнение с чужими репо — через web-агента (реальные URL, снимок звёзд/дат на июль 2026).
- Все находки сверены с фактическим состоянием наших файлов: `.claude/agents/*.md`, `.claude/settings.json`, `.claude/hooks/*`.

---

## Часть 1. Что нового в субагентах Claude Code (verified)

Полный официальный список полей frontmatter (обязательны только `name`, `description`):
`tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt`.

Ключевые факты, проверенные по первоисточнику:

1. **`disallowedTools` — валидное официальное поле** (denylist). Наши 11 обёрток с ним корректны — это НЕ устаревший синтаксис.
2. **Семантика при обоих полях:** «disallowedTools is applied first, then tools is resolved against the remaining pool. A tool listed in both is removed.»
3. **`model`:** `sonnet|opus|haiku|fable`, полный ID или `inherit` (дефолт `inherit`). Наши значения валидны.
4. **`color`:** `red|blue|green|yellow|purple|orange|pink|cyan`. Наши валидны.
5. **Task → Agent:** «In version 2.1.63, the Task tool was renamed to Agent. Existing Task(...) references still work as aliases.» → наши упоминания «Task tool» не сломаны, но терминологически устарели.
6. **`Agent(agent_type)`** в `tools` — allowlist, каких субагентов может спавнить агент; либо `permissions.deny` для запрета конкретных.
7. **`mcpServers` — ДОБАВЛЯЕТ доступ, а не ограничивает его.** Дословно: «Use the `mcpServers` field to give a subagent access to MCP servers **that aren't available in the main conversation**». Запись `mcpServers: [figma]` не отнимает у агента остальные MCP — ограничение делается ТОЛЬКО через `tools`/`disallowedTools`. Настоящий scoping достигается иначе: «To keep an MCP server out of the main conversation entirely… define it inline here rather than in `.mcp.json`. The subagent gets the tools; the parent conversation doesn't» — то есть сервер убирается из `.mcp.json` и объявляется inline внутри агента.
8. **`hooks` (PreToolUse/PostToolUse)** можно определить внутри агента.
9. **`memory: user|project|local`** — кросс-сессионная память агента.
10. **`effort: low|medium|high|xhigh|max`** — reasoning effort на уровне агента, оверрайдит сессию.
11. **`isolation: worktree`** — изолированная копия репо в git worktree, авто-очистка если нет изменений.
12. **Новое рантайм-поведение:** субагенты по умолчанию фоновые (v2.1.198+), вложенные субагенты (глубина до 5), agent teams / SendMessage / fork.

---

## Часть 2. Сравнение с чужими коллекциями (снимок, июль 2026)

| Репозиторий | ⭐ | Свежесть | Что берём на заметку |
|---|---|---|---|
| [anthropics docs — sub-agents](https://code.claude.com/docs/en/sub-agents) | — | нормативный | полная схема полей, `Agent(type)`, hooks, memory |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | ~50k | активен | теория: Anthropic «Building Effective Agents» (routing + evaluator-optimizer) |
| [wshobson/agents](https://github.com/wshobson/agents) | ~38k | коммит 2026-07-14 | секции **Workflow Position** и **Key Distinctions** в теле агента; имена с доменным префиксом; `model: inherit` |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | ~23k | активен | **матрица инструментов по архетипу роли**; model-routing opus/sonnet/haiku |
| [contains-studio/agents](https://github.com/contains-studio/agents) | ~12k | коммит 2025-07-28 (застыл) | организация по «департаментам»; `<example>`-блоки в description; событийная авто-делегация |

**Наблюдение по стилю промптов:** зрелые коллекции держат длинные промпты (3500–4800 слов) с фиксированным скелетом секций. У нас осознанно противоположная стратегия — тонкие обёртки + `agent-pack/agent-contracts/*.agent.md` как single source of truth под тестами. Это архитектурно чище; механическое раздувание тела обёрток нам противопоказано.

---

## Часть 3. Что у нас УЖЕ есть (не предлагать как новое)

- **Least-privilege инструменты** — `tools`/`disallowedTools` расставлены по всем 13 обёрткам.
- **`skills` preload** — используется (`design`, `design-generator`, `frontend`, `qa-review`, `test-bench`, `copywriting`, `notion-publisher`).
- **Hook-инфраструктура** — `SessionStart`, `UserPromptSubmit`, `PreToolUse` (Write/Edit → `guard-write.mjs`; Bash → `guard-bash.mjs`: selective-commit, force-push, frozen ledger zones), `PostToolUse` (`post-edit-sync.mjs`).
- **Детерминированный approval** для внешних действий — `permissions.ask` перехватывает `git commit/push/add`, `deploy`, `notion`, `figma`, `github`, `gitlab`.
- **Fan-out research несколькими агентами** — уже правило пользователя (CLAUDE.md, personal rules).

Вывод: значимая часть «best practices» из чужих репо у нас закрыта. Реально новое — несколько нативных полей Claude Code, появившихся/дозревших после 7 июля, плюс одна чистка консистентности.

---

## Часть 4. Находки и предложения (приоритизировано)

> **Статус внедрения (2026-07-15):** внедрены P1-1, P1-2, P1-3 (MCP least-privilege), P2-1 (`effort`), P2-4 (терминология). `validate:config`, `workflow:test-agent-capabilities`, `docs:audit` — зелёные; среда подтвердила, что тип `orchestrator` более не спавнится. Осознанно **отклонены**: `isolation: worktree`, `memory: project`, `maxTurns`, раздувание промптов (обоснование — раздел «Решения об отказе»). P2-2 (`mcpServers`-scoping) **пересмотрен**: исходная посылка оказалась неверной, рефактор не делался — см. поправку в самом пункте.

### P1 — низкий риск, ясная польза

**P1-1. Унифицировать модель ограничения инструментов (verified defect: мёртвый конфиг). [ВНЕДРЕНО]**
У 5 агентов (`copywriting`, `ia`, `prd`, `prototype`, `release`) заданы **оба** поля: `tools:` allowlist без MCP + `disallowedTools: mcp__...`. По документированной семантике denylist по MCP здесь **no-op** — allowlist их и так не впускает. При этом `research` и `frontend` ограничивают только через `disallowedTools` (наследуют всё минус запреты). В системе сосуществуют две модели ограничения.
Реализован вариант (а): избыточный `disallowedTools` удалён у всех пяти — allowlist остался единственным механизмом. Поведение не изменилось, убран мёртвый конфиг. Итоговая политика: узкая роль → `tools`-allowlist; широкая роль (нужен MCP) → наследование + `disallowedTools`.

**P1-2. Механически закрепить manager-style: специалист не спавнит специалистов. [ВНЕДРЕНО]**
Было: «финал собирает только orchestrator, специалисты — bounded capabilities» держалось на промпте, при том что `research`/`frontend`/`design`/`qa-review` наследовали `Agent`/`Task` tool и технически могли спавнить субагентов.

Реализовано: `disallowedTools: Task, Agent` добавлено `research`, `frontend`, `design`, `design-generator`, `qa-review`, `test-bench`, `notion-publisher`; в `settings.json` `permissions.deny` получил `Task(orchestrator)`, `Agent(orchestrator)`. Узкие роли с allowlist не нуждались в правке — `Agent` в их allowlist и так не входит.

Проверено: ни один специалист не полагался на легитимный вложенный спавн (по контрактам делегация — прерогатива оркестратора). Среда подтвердила эффект — тип `orchestrator` пропал из списка доступных для спавна.

**P1-3. MCP least-privilege для группы «наследует всё» (verified defect). [ВНЕДРЕНО]**
Найдено при внедрении P1-2: у `design`, `design-generator`, `qa-review`, `test-bench`, `notion-publisher` не было ни `tools`-allowlist, ни MCP-denylist — они наследовали **все** MCP-серверы. `qa-review` технически мог писать в Notion, `notion-publisher` — дёргать figma/tavily/lazyweb. Дыра «мягкая» (`permissions.ask` перехватывает notion/figma/github/gitlab), но политика была deny-by-exception.

Внедрено (консервативно — запрещено только то, что точно не нужно по контракту):
- `design`, `design-generator`, `qa-review` → `+ mcp__notion, mcp__github, mcp__gitlab` (figma нужен)
- `test-bench` → `+ mcp__figma, mcp__figmaDesktop, mcp__notion, mcp__github, mcp__gitlab` (нужен playwright)
- `notion-publisher` → `+ mcp__figma, mcp__figmaDesktop, mcp__github, mcp__gitlab` (notion нужен)

`tavily`/`lazyweb`/`playwright` намеренно не трогали: они read-only и не пишут во внешние системы, а раздавать их точечно по агентам без надёжного механизма scoping (см. P2-2) смысла нет. При необходимости ограничиваются тем же `disallowedTools`.

### P2 — рассмотрено (внедрено / пересмотрено / отклонено)

**P2-1. `effort` per-agent. [ВНЕДРЕНО]** Ортогональная модели ось. Проставлено: `effort: high` — `research` (gap loop, contradiction review), `prd` (traceability), `design`, `qa-review` (severity matrix); `effort: low` — `notion-publisher` (механическая публикация). Остальные наследуют сессию — трогали только там, где эффект очевиден. Оговорка: выигрыш вероятностный и точно не измеряется, это настройка по здравому смыслу.

**P2-2. `mcpServers` scoping. [ПЕРЕСМОТРЕН — исходная формулировка была основана на неверной посылке]**

> **Поправка (2026-07-15).** Изначально пункт был сформулирован как «перевернуть политику с deny-by-exception на allow-by-design, скоупив figma → design/qa, playwright → frontend/test-bench и т.д.». Проверка первоисточника перед рефактором показала, что **это не работает**: `mcpServers` добавляет доступ, а не отбирает (см. Часть 1, п. 7). Прописать `mcpServers: [figma]` агенту `design` не отняло бы у него notion. Рефактор дал бы ложное ощущение allow-by-design, не будучи им. Пункт переписан ниже.

Что реально возможно:

- **Вариант А (работает, применим точечно): inline-определение + удаление из `.mcp.json`.** Сервер, убранный из `.mcp.json` и объявленный inline в конкретном агенте, недоступен ни главной сессии, ни другим агентам. Бонус — его tool descriptions перестают потреблять контекст главной сессии. Идеально ложится на **`notion` → только `notion-publisher`** (он и есть единственный владелец Notion по нашей архитектуре; `yarn notion:*` — это CLI, не MCP, и продолжит работать). Для `figma` НЕ годится: он нужен четырём агентам (`design`, `design-generator`, `qa-review`, `frontend`), пришлось бы дублировать inline-конфиг в четырёх файлах и ловить их расхождение.
- **Вариант Б (отклонён): полный `tools`-allowlist с явным перечислением MCP.** Формально даёт allow-by-design, но хрупко: дока предупреждает, что если ни одна запись списка не резолвится в инструмент, субагент вообще не стартует; плюс allowlist замораживает набор встроенных инструментов при их расширении.
- **Вариант В (текущий, оставлен): denylist + `permissions.ask`.** Остаётся deny-by-exception — новый MCP в `.mcp.json` по умолчанию доступен всем агентам, пока его не впишут в denylist. Но чувствительные внешние системы (notion/figma/github/gitlab) перехватывает `permissions.ask`, так что «тихой» утечки прав нет.

**Рекомендация:** большой рефактор не делать. Вариант А точечно для `notion` — единственное, что даёт реальный выигрыш; берётся отдельно и по желанию.

**P2-3. `isolation: worktree` для `frontend`. [ОТКЛОНЕНО]** Изоляция генерации кода в отдельном worktree. Рассмотрено и отклонено — обоснование в разделе «Решения об отказе».

**P2-4. Терминология Task → Agent. [ВНЕДРЕНО]** Обновлены `CLAUDE.md` (3 места) и `orchestrator.md` (3 места). Заодно в обоих зафиксировано, что запрет спавна `orchestrator` и вложенной делегации теперь механический, а не только промптовый.

**P2-5. `Workflow Position` / `Key Distinctions` в теле обёрток (паттерн wshobson). [ОТКЛОНЕНО]** Для пар с пересечением ролей (`design` vs `design-generator`, `test-bench` vs `qa-review`). Рассмотрено и отклонено — обоснование в разделе «Решения об отказе»; вернуться только при реальных ошибках маршрутизации.

---

## Решения об отказе (2026-07-15)

Зафиксировано, чтобы не возвращаться к этим вариантам без новой причины. Общий принцип: наличие фичи в Claude Code ≠ польза для нашей архитектуры.

- **`isolation: worktree` для `frontend` — отклонено.** Наши run-каталоги, `handoff-bundle` и ledger завязаны на пути в рабочем дереве; worktree потребует переноса/мержа результата и усложнит handoff. Защита, ради которой его берут, уже обеспечена `guard-write` + git-дисциплиной.
- **`memory: project` — отклонено.** У нас уже три хранилища знания (`MEMORY.md`, run-ledger, реестры `research/registry.json` / `design/figma/registry.json`). Четвёртое, живущее внутри агента, неизбежно разойдётся с ledger, и источник правды размоется — ровно та болезнь, из-за которой агенты живут только в репо. Пересмотреть только при конкретной боли, которую это лечит.
- **`maxTurns` — отклонено.** Наши агенты выполняют длинную легитимную работу (research gap loop). Лимит рубил бы хорошие прогоны ради защиты от проблемы, которой у нас не наблюдалось.
- **Длинные промпты / `Workflow Position` / `Key Distinctions` в теле обёрток — отклонено.** Паттерн ценен для систем с авто-делегацией по `description`; у нас оркестратор классифицирует сам. Показательно: болевая пара `design` vs `design-generator` уже закрыта **механически** гейтом `blocked_missing_design_agent_handoff` — надёжнее любой формулировки в промпте. Вернуться только если появятся реальные ошибки маршрутизации.

---

## Итог

Система зрелая; логических дыр в агентах не найдено. Найдено и устранено два верифицированных дефекта: **мёртвый (no-op) `disallowedTools` при заданном allowlist** (P1-1) и **MCP-наследование без ограничений у 5 агентов** (P1-3). Главный сдвиг — то, что раньше держалось на дисциплине промпта (manager-style, «не спавни оркестратора», least-privilege по MCP), стало механическим: `disallowedTools` + `permissions.deny`.

Политика прав теперь связная и объяснимая:
- **Узкие роли** (`copywriting`, `ia`, `prd`, `prototype`, `release`) — `tools`-allowlist на файлы+bash; MCP и вложенный спавн недостижимы по построению.
- **Широкие роли** (`research`, `design`, `design-generator`, `frontend`, `qa-review`, `test-bench`, `notion-publisher`) — наследование минус точечные запреты; у каждого остаётся ровно нужный MCP.
- **`orchestrator`** — главная сессия, спавн запрещён механически.

Политика остаётся **deny-by-exception**: новый MCP-сервер в `.mcp.json` по умолчанию доступен всем агентам, пока его не впишут в denylist. Изначально предполагалось перевернуть это на allow-by-design через `mcpServers`, но проверка первоисточника показала, что поле так не работает (P2-2). Смягчающее обстоятельство: чувствительные внешние системы перехватывает `permissions.ask`. Единственный реально работающий шаг — inline-объявление `notion` внутри `notion-publisher` с удалением из `.mcp.json`; берётся отдельно и по желанию.

**Методический урок сессии:** семантику поля нужно проверять по первоисточнику ДО планирования рефактора, а не после. Рекомендация P2-2 звучала убедительно и была бы реализована, если бы допущение не проверили перед правкой конфига.
