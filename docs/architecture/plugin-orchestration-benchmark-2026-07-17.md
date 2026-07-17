# Бенчмарк: наш плагин и оркестрация против практики GitHub/Anthropic — 2026-07-17

## Цель

Сверить два наших решения с внешней практикой: (1) плагин `figma-ds` и способ его раздачи (junction), (2) manager-style оркестрация субагентов. Найти, есть ли решения лучше.

## Метод

Два параллельных субагента с веб-поиском (официальная документация + GitHub API для звёзд). **Находки верифицированы оркестратором против фактического состояния репо** — одна отсеяна как ложная (см. ниже).

## Главный результат

**Оба наших решения — не самодеятельность, а попадание в официально документированные паттерны Anthropic.** Менять архитектуру не нужно; список улучшений ниже — точечный.

## Верификация находок субагентов

| Находка | Вердикт |
|---|---|
| «`origin` отсутствует, есть только `old-origin` → `ainativeagent`; манифест ссылается на другой репо» | **ЛОЖЬ.** `git remote -v` показывает `origin → https://github.com/innitv/agentproductstudio.git` (fetch и push) — ровно то, что в манифесте. Пуши этой сессии шли в него успешно. `old-origin` — безвредный рудимент. Правка не нужна |
| `"version": "1.0.0"` в `plugin.json` | **Подтверждено** чтением файла |
| `skills:` не заполнен у 5 из 12 агентов | **Подтверждено**: пусто у `research`, `prd`, `ia`, `prototype`, `release` (у `orchestrator` не нужно — не субагент) |
| `memory:` не используется нигде | **Подтверждено** грепом по `.claude/agents/` |
| «Прогнать `claude plugin validate` и добавить в CI» | **Не проверено:** `claude` CLI отсутствует в PATH этой среды (bash и PowerShell). Команда может существовать по докам, но подтвердить и встроить в CI отсюда нельзя |

## Часть 1. Плагин `figma-ds`

### Мы попали в официальный паттерн

[Skills-directory plugins](https://code.claude.com/docs/en/plugins-reference#skills-directory-plugins): папка под skills-каталогом с `.claude-plugin/plugin.json` грузится как плагин `<name>@skills-dir` без marketplace и без install. Ключевое: **«discovered in place rather than copied into the plugin cache»**, и правки `SKILL.md` **действуют в текущей сессии**.

Это ровно наш мотив («файл один, физически не может разойтись»). Отказ от marketplace был обоснован: marketplace копирует в cache, отсюда и `/plugin update`. Официальные доки прямо предлагают skills-dir как альтернативу `--plugin-dir`: «Instead of passing `--plugin-dir` on every launch, you can keep a plugin in your skills directory».

Также подтверждено корректным: манифест без поля `skills` (дефолтный скан `skills/`), только `plugin.json` внутри `.claude-plugin/`, namespace `/figma-ds:build`.

### Ограничение, о котором стоит знать

Официальные оговорки про симлинки ([plugin caching](https://code.claude.com/docs/en/plugins-reference#plugin-caching-and-file-resolution)) касаются симлинков **внутри** плагина при копировании в cache («outside the marketplace: skipped for security»). Наш junction — это **корень** skills-dir плагина, который не копируется, поэтому в эту логику не попадает. Работает как следствие discovery-in-place, но **явно Anthropic'ом не гарантировано**. Риск низкий; страховка — относительный симлинк в project scope (см. улучшения).

### Как делают другие (звёзды проверены через GitHub API 17.07.2026)

| Репо | ⭐ | Модель |
|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 161 959 | marketplace.json, один репо → несколько плагинов через `source: "./"` + `skills: [...]`, `strict: false` |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 138 053 | `plugins/` с 13 плагинами, у каждого свой `.claude-plugin/plugin.json` |
| [wshobson/agents](https://github.com/wshobson/agents) | 37 980 | multi-harness marketplace (Claude/Cursor/Codex поверх общего `plugins/`) |

Доминирующая модель — публичный git-marketplace **для раздачи наружу**. У нас другая задача (раздать себе), поэтому их модель нам не подходит по назначению, а не по качеству.

## Часть 2. Оркестрация

### Что у нас уже best practice

1. **Запрет вложенной делегации через `disallowedTools`** — [официально задокументированный механизм](https://code.claude.com/docs/en/sub-agents). С v2.1.172 вложенность разрешена (глубина ≤5), но сами Anthropic в [multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) её не используют: «Subagents do not spawn subordinate agents». Наш запрет — норма, не экзотика.
2. **`permissions.deny: Agent(orchestrator)`** — канонический формат, включая алиас `Task(...)`.
3. **Артефакты в файлах + lightweight handoff** — дословная рекомендация Anthropic: «Subagents call tools to store their work in external systems, then pass lightweight references back to the coordinator». Официальный плагин `feature-dev` держит всё в контексте разговора — **наш ledger сильнее официального примера**.
4. **Гейты человека между стадиями** — совпадает с `feature-dev` («DO NOT START WITHOUT USER APPROVAL»).
5. **Машинные валидаторы** — паритет с `wshobson/agents` (38k ⭐: `make validate` + 386 pytest).
6. **Single-threaded writes** — единственный класс multi-agent, который [Cognition](https://cognition.com/blog/multi-agents-working) признаёт работающим: «multiple agents contribute intelligence to a task while writes stay single-threaded».

### Риски, о которых стоит знать

- **Цена:** multi-agent ≈ 15× токенов обычного чата (Anthropic).
- **Профиль нагрузки:** Anthropic прямо пишет, что multi-agent плохо подходит для задач, где «all agents share the same context or involve many dependencies», и для coding tasks. Наш pipeline 00→12 — цепочка зависимостей, то есть формально антипаттерн; оправдан изоляцией контекста и специализацией промптов, а не параллелизмом. Аргумент против наращивания числа агентов.
- **Число агентов:** [«Too many specialist agents: flooding Claude with options makes automatic delegation less reliable»](https://claude.com/blog/subagents-in-claude-code). У нас 12 — близко к границе. Смягчено тем, что оркестратор маршрутизирует явно.
- **Cognition против orchestrator-worker:** [«Share context, and share full agent traces, not just individual messages»](https://cognition.com/blog/dont-build-multi-agents). Мы передаём `handoff-bundle.md`, а не полный trace. Защита: артефакты плотнее «individual messages», записи последовательны.

### Новое у Anthropic, чего у нас нет

- **[Workflow tool](https://code.claude.com/docs/en/workflows)** — четвёртый примитив: план живёт в скрипте, промежуточное — в переменных, контекст держит только финал. **Не подходит на весь pipeline**: «no mid-run user input» ломает наш главный гейт (человек утверждает макеты до вёрстки); доки сами советуют «run each stage as its own workflow». Реалистично — отдельные стадии (research fan-out, QA-аудит).
- **[Agent teams](https://code.claude.com/docs/en/agent-teams)** — экспериментально (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), «no nested teams», нет resume, split panes не работают в Windows Terminal, токены выше. **Не тащить.**
- **`/deep-research`** — эталон: fan-out → adversarial cross-check → синтез с отсевом непроверенных claims. Механизированный Anti-AI-Slop.
- **LLM-as-judge по рубрике** (factual/citation accuracy, completeness, source quality) + end-state оценка. Закрывает дыру «файл структурно валиден ≠ вывод хорош».

## Список улучшений (решение за пользователем)

| # | Что | Цена | Выгода |
|---|---|---|---|
| 1 | Убрать `"version": "1.0.0"` из `plugin.json` | 1 мин | Anthropic: для internal-плагинов под активной разработкой версию не ставить, иначе при попадании в marketplace плагин замёрзнет на 1.0.0. Сейчас безвреден (cache нет) — это мина на будущее |
| 2 | Дозаполнить `skills:` у `research`, `prd`, `ia`, `prototype`, `release` | ~0 | 5 из 12 обёрток не преднагружают процедуры — агент тратит ход на discovery |
| 3 | ~~Скрипт установки junction через `git rev-parse`~~ | — | **СДЕЛАНО**: `yarn plugin:link` (`tooling/scripts/link-plugin.mjs`) |
| 4 | ~~Относительный симлинк `<repo>/.claude/skills/figma-ds`, закоммиченный в git~~ | — | **ОТКЛОНЕНО по фактам**, см. ниже |
| 5 | `memory: project` для `qa-review` и `design` | ~0 | Накопление паттернов между run |
| 6 | Параллельные конкурирующие подходы на `04-design` (2-3 инстанса с разными фокусами) | 2-3× токенов стадии | Практика Anthropic (`feature-dev` так делает с `code-architect`); борется с anchoring |
| 7 | LLM-as-judge поверх artifact validation | средняя | Закрывает «валиден ≠ хорош» |
| 8 | Scale-adaptive глубина (из [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD), 50.7k ⭐) | средняя | У нас бинарь «13 стадий или quick draft»; градиент снизит соблазн срезать гейты |

### Что НЕ надо делать

- **Marketplace ради «правильности»** — официальные доки предлагают skills-dir как равноценную альтернативу. Мы в best practice, а не рядом с ней. Marketplace — только если появятся внешние потребители, и тогда **в дополнение** к junction.
- **Agent teams**, **вложенная делегация**, **каталоги на 100+ агентов** ([VoltAgent](https://github.com/VoltAgent/awesome-claude-code-subagents), 23k ⭐), **swarms** ([ruflo](https://github.com/ruvnet/ruflo), 64.7k ⭐), **векторный context-manager** — противоречат либо официальным предупреждениям, либо нашему (правильному) single-threaded write.

## Реализовано по итогам ресёрча (решение пользователя 2026-07-17)

1. **Убран `"version": "1.0.0"`** из `plugin.json` — по рекомендации Anthropic для internal-плагинов под активной разработкой. Манифест остаётся валидным: `name` — единственное обязательное поле.
2. **Дозаполнен `skills:`** у `research` (`research-pack`, `anti-ai-slop`, `approval-gate`, `notion-sync`), `prd` (`anti-ai-slop`), `prototype` (`prototype-state-map`), `release` (`notion-sync`, `approval-gate`, `run-ledger`, `selective-commit`, `outputs-cleanup`). Состав взят из контрактов (`yarn workflow:skills`), не придуман. `ia` пропущен: по манифесту у него skills нет.
3. **`memory: project`** у `qa-review` и `design`.
4. **`yarn plugin:link`** (`tooling/scripts/link-plugin.mjs`) — ставит ссылку `~/.claude/skills/<name>` → `plugins/<name>`, путь вычисляет через `git rev-parse --show-toplevel`. Снимает минус «junction завязан на абсолютный путь»: перенёс репо — перезапустил. Идемпотентен, есть `--check` для диагностики, отказывается трогать путь, если там настоящая копия (это признак дрейфа, разбирать вручную). Проверен на живом junction.

## Отклонено по фактам: относительный симлинк в git

Субагент рекомендовал закоммитить `<repo>/.claude/skills/figma-ds` → `../../plugins/figma-ds`, ссылаясь на то, что git трекает симлинки (mode `120000`) и после clone всё заработает. Проверка показала два блокера:

1. **`git config core.symlinks = false`** в этом репозитории (Windows). Git не сохранит симлинк как ссылку — после clone получится обычный текстовый файл с путём внутри. Обещанная выгода «работает после clone на любой машине» не наступает, а на её месте появляется мусорный файл, который Claude Code попытается прочитать как skill.
2. **Два скоупа → два плагина.** `~/.claude/skills/figma-ds` (personal) и `<repo>/.claude/skills/figma-ds` (project) дали бы два экземпляра `figma-ds@skills-dir` одновременно. Плагинные skills неймспейснуты, поэтому один другой не перекроет — обе копии остаются живыми. Это ровно тот дубль, ради устранения которого плагин и заводился.

Вывод: страховка сводится к `yarn plugin:link` (пункт 4). Если сценарий «машина без студии» станет реальным — правильный ход marketplace **в дополнение** к ссылке, а не симлинк в git.

## Изменённые файлы (документация — плагин был невидим в индексах)

Плагин не упоминался ни в `README.md`, ни в `CLAUDE.md`, ни в `AGENTS.md`, ни в `repo-map.md` — при навигации по цепочке индексов его нельзя было найти.

- `README.md` — строка в таблицу «Где что лежит», абзац про плагин и границу знания, `yarn plugin:link` в разделе «Проверки».
- `CLAUDE.md` — раздел 6: указатель на плагин с правилом границы и нормативностью канона.
- `AGENTS.md` — строка в список.
- `docs/architecture/repo-map.md` — `plugins/` в таблицу верхнего уровня и в фактическое дерево.
- `plugins/figma-ds/.claude-plugin/plugin.json` — убран `version`.
- `.claude/agents/{research,prd,prototype,release}.md` — `skills:`; `.claude/agents/{qa-review,design}.md` — `memory: project`.
- `tooling/scripts/link-plugin.mjs`, `package.json` — команда `yarn plugin:link`.

## Валидация

- `yarn qa:quick` — typecheck / validate:config / docs:audit passed.
- `yarn workflow:test-agentic` — 13/13 passed.
