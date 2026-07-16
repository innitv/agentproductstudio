# Обновления по агентам: сверка с Claude Code 2026 и чужими коллекциями

**Дата:** 2026-07-15
**Тип:** limited engineering task / audit (без изменений логики — только находки и предложения)
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
7. **`mcpServers`** можно скоупить на конкретного субагента (inline или ссылкой на уже настроенный сервер).
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

> **Статус внедрения (2026-07-15):** внедрены P1-1, P1-2, P1-3 (MCP least-privilege), P2-1 (`effort`), P2-4 (терминология). `validate:config`, `workflow:test-agent-capabilities`, `docs:audit` — зелёные; среда подтвердила, что тип `orchestrator` более не спавнится. Осознанно **отклонены**: `isolation: worktree`, `memory: project`, `maxTurns`, раздувание промптов (обоснование — раздел «Решения об отказе»). Остался открытым только P2-2 (`mcpServers`-scoping).

### P1-3. MCP least-privilege для группы «наследует всё». [ВНЕДРЕНО]

Найдено при внедрении P1-2: у `design`, `design-generator`, `qa-review`, `test-bench`, `notion-publisher` не было ни `tools`-allowlist, ни MCP-denylist — они наследовали **все** MCP-серверы. `qa-review` технически мог писать в Notion, `notion-publisher` — дёргать figma/tavily/lazyweb. Дыра «мягкая» (`permissions.ask` перехватывает notion/figma/github/gitlab), но политика была deny-by-exception.

Внедрено (консервативно — запрещено только то, что точно не нужно по контракту):
- `design`, `design-generator`, `qa-review` → `+ mcp__notion, mcp__github, mcp__gitlab` (figma нужен)
- `test-bench` → `+ mcp__figma, mcp__figmaDesktop, mcp__notion, mcp__github, mcp__gitlab` (нужен playwright)
- `notion-publisher` → `+ mcp__figma, mcp__figmaDesktop, mcp__github, mcp__gitlab` (notion нужен)

`tavily`/`lazyweb`/`playwright` намеренно не трогали: они read-only и не пишут во внешние системы — их разложит P2-2.

### P1 — низкий риск, ясная польза

**P1-1. Унифицировать модель ограничения инструментов (verified defect: мёртвый конфиг). [ВНЕДРЕНО]**
У 5 агентов (`copywriting`, `ia`, `prd`, `prototype`, `release`) заданы **оба** поля: `tools:` allowlist без MCP + `disallowedTools: mcp__...`. По документированной семантике denylist по MCP здесь **no-op** — allowlist их и так не впускает. При этом `research` и `frontend` ограничивают только через `disallowedTools` (наследуют всё минус запреты). В системе сосуществуют две модели ограничения.
Варианты: (а) убрать избыточный `disallowedTools` у allowlist-агентов; (б) закрепить архетипы (по образцу VoltAgent-матрицы): read-only reviewer / doc-writer / researcher / code-writer — и применять один способ консистентно.
Риск: минимальный (поведение не меняется, убирается шум). Проверяемо `yarn workflow:test-agent-capabilities`.

**P1-2. Механически закрепить manager-style: специалист не спавнит специалистов. [ВНЕДРЕНО]**
Реализовано: `disallowedTools: Task, Agent` добавлено `research`, `frontend`, `design`, `design-generator`, `qa-review`, `test-bench`, `notion-publisher`; в `settings.json` `permissions.deny` получил `Task(orchestrator)`, `Agent(orchestrator)`.


Сейчас «финал собирает только orchestrator, специалисты — bounded capabilities» держится на промпте. `research`/`frontend`/`design`/`qa-review` наследуют `Agent`/`Task` tool и технически могут спавнить субагентов. Ужесточение: добавить `Agent`/`Task` в `disallowedTools` тем специалистам, кому вложенный спавн не нужен, и/или `permissions.deny` на спавн `orchestrator`. Превращает вероятностное правило в детерминированный guardrail.
Риск: низкий, но нужно подтвердить, что ни один специалист не полагается на легитимный внутренний спавн.

### P2 — полезно, требует проектирования/решения

**P2-1. `effort` per-agent. [ВНЕДРЕНО]** Ортогональная модели ось. Проставлено: `effort: high` — `research` (gap loop, contradiction review), `prd` (traceability), `design`, `qa-review` (severity matrix); `effort: low` — `notion-publisher` (механическая публикация). Остальные наследуют сессию — трогали только там, где эффект очевиден. Оговорка: выигрыш вероятностный и точно не измеряется, это настройка по здравому смыслу.

**P2-2. `mcpServers` scoping вместо общего `.mcp.json` + denylist.** Сейчас `enableAllProjectMcpServers: true` + длинные denylist по MCP в каждой обёртке. Альтернатива: скоупить figma → `design`/`design-generator`/`qa-review`; playwright → `frontend`/`test-bench`; tavily/lazyweb → `research`/`design`. Чище least-privilege, короче frontmatter. Минус — заметный рефактор конфигурации.

**P2-3. `isolation: worktree` для `frontend`.** Изолировать генерацию кода в отдельном worktree (авто-очистка). Согласуется с защитой main (у нас main-direct commits). Меняет модель работы агента — требует обсуждения.

**P2-4. Терминология Task → Agent. [ВНЕДРЕНО]** Обновлены `CLAUDE.md` (3 места) и `orchestrator.md` (3 места). Заодно в обоих зафиксировано, что запрет спавна `orchestrator` и вложенной делегации теперь механический, а не только промптовый.

**P2-5. Опционально — `Workflow Position` / `Key Distinctions` в теле обёрток** (паттерн wshobson) для пар с пересечением ролей: `design` vs `design-generator`, `test-bench` vs `qa-review`. Сейчас это в `stage-handoff-contract.md`. Для нашей manager-style оркестрации ценность ниже (оркестратор классифицирует сам, не по авто-делегации), поэтому — только если замечаем реальные ошибки маршрутизации.

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

Открыт один пункт: **P2-2 (`mcpServers`-scoping)** — перевернуть политику с deny-by-exception на allow-by-design, чтобы новый MCP в `.mcp.json` по умолчанию не становился доступен всем 13 агентам.
