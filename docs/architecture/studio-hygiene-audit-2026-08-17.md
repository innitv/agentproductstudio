# Аудит студии: синхронизация, навыки, агенты, хуки + проверка тезиса о дроблении

- Дата: 2026-08-17
- Повод: запрос владельца — уборка внутри студии, синхронизация файлов, навыков, агентов, хуков; отдельно — проверить тезис «Anthropic советует дробить всё: агентов на субагентов, скиллы на подскиллы, задачи на этапы».
- Метод: `/subsystem-audit:audit`. Сбор распараллелен двумя субагентами (инвентаризация студии; первоисточники Anthropic), синтез собран оркестратором. Каждая поданная находка верифицирована первоисточником.

## 0. Итог одной фразой

Студия механически здорова: **все 30 команд агрегатора `workflow:test-agentic` зелёные**, реестры сходятся, дерево чисто, битых ссылок нет, ни один навык не превышает порог Anthropic в 500 строк. Настоящие проблемы — не в структуре, а в **двух местах, где норма заявлена, но не исполняется**: гейты показа человеку (271 ошибка валидатора по 10 прогонам) и индекс в 231 символе от провала ratchet.

Тезис о дроблении первоисточниками **подтверждается только в одной части из трёх** (размер навыка), в двух других Anthropic пишет прямо обратное.

## 1. Машинные проверки: состояние

| Команда | Exit | Существенное |
|---|---|---|
| `workflow:doctor` | 0 | 6 каталогов и 4 шаблона на месте; предупреждение — 7 optional keys в `.env` |
| `workflow:test-agent-capabilities` | 0 | реестр возможностей сходится |
| `workflow:skills` | 0 | 11 стадий × 11 агентов |
| `workflow:test-studio-hygiene` | 0 | 4 проверки; **запас 231 символ** |
| `docs:audit` | 0 | 177 md, 693 пути, 92 ссылки, 72 команды — битых нет |
| `validate:config`, `typecheck`, `tokens:check` | 0 | чисто |
| `workflow:test-agentic` (30 команд) | 0 | все зелёные |
| `workflow:registry-sync`, `research:registry-sync` | 0 | 10 = 10, 7 = 7, in sync |
| `research:lint` без аргумента | 1 | **не дефект** — см. §4.2 |
| `figma:audit` без аргумента | 1 | требует `--registry`; см. §4.3 |

## 2. Инвентаризация (числа)

| Слой | Количество | Объём |
|---|---|---|
| Обёртки агентов `.claude/agents/` | 11 | 1 067 строк / 122 710 байт |
| Контракты `agent-pack/agent-contracts/` | 11 | 1 971 строка / 297 015 байт |
| Навыки проекта `.claude/skills/*/SKILL.md` | 28 | 3 227 строк / 353 214 байт |
| Плагины (junction) | 3 | `figma-ds` 2 навыка + 5 references, `ui-craft` 2, `subsystem-audit` 1 |
| Хуки `.claude/hooks/` | 7 | 332 строки / 22 225 байт |
| Slash-команды | 16 | 244 строки |
| Заметки памяти | 20 | 138 887 байт, индекс `MEMORY.md` 19 строк |

Соответствие обёртка ↔ контракт **1:1**: контрактов без обёртки — 0, обёрток без контракта — 0.

**Всегда загружаемый блок:** глобальный `CLAUDE.md` 2 236 + проектный 34 769 + `MEMORY.md` 4 907 = **41 912 символов (~12 тыс. токенов)** в каждой сессии и в каждом субагенте.

**Размеры навыков против порога Anthropic (500 строк):** максимум — `shadcn` 277, `shadcn-library` 265, `recursive-brief` 209, `run-retrospective` 192. **Ни один не превышает порог**, ближайший — на 45 % от лимита. Progressive disclosure применён там, где нужен: `figma-ds/build` держит 5 файлов `references/` (55 071 байт), которые не грузятся в контекст, пока не понадобятся.

## 3. Проверка тезиса о дроблении по первоисточникам

Все цитаты открыты субагентом, URL приведены. Даты — как на страницах.

### 3.1. Что подтверждается

**Механизм назван верно.** «As the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases. Context, therefore, must be treated as a finite resource with diminishing marginal returns» — [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), 29.09.2025.

«LLMs generally perform better when each consideration is handled by a separate LLM call, allowing focused attention on each specific aspect» — [Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents), 19.12.2024.

**Единственная численная рекомендация — про навык:** «Keep SKILL.md body under 500 lines for optimal performance», «Split content into separate files when approaching this limit» — [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices); то же в [Claude Code docs](https://code.claude.com/docs/en/skills) и [skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md).

Критерий выноса — не размер сам по себе: «If certain contexts are mutually exclusive or rarely used together, keeping the paths separate will reduce the token usage» — [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), 16.10.2025.

### 3.2. Что первоисточники ограничивают или отрицают

| Часть тезиса | Что пишет Anthropic |
|---|---|
| «Дробить всё, правило универсальное» | «Find the simplest solution possible, and only increasing complexity when needed» ([Building Effective AI Agents]). «The patterns in this guide aren't set in stone» ([Best practices](https://code.claude.com/docs/en/best-practices)) |
| «Агентов на субагентов» — как способ поднять качество | «It's tempting to define a custom subagent for everything, but flooding Claude with options makes automatic delegation less reliable. Most teams settle on a handful of well-scoped agents rather than a sprawling roster» — [How and when to use subagents](https://claude.com/blog/subagents-in-claude-code), 07.04.2026 |
| Когда субагенты оправданы | Численный порог: «When a task requires exploring ten or more files, or involves three or more independent pieces of work». Иначе — «for smaller or tightly sequential tasks, sticking to the main conversation is usually simpler» (там же) |
| «Скиллы на подскиллы» | Термина `subskill` в первоисточниках Anthropic **нет**. Есть progressive disclosure внутри одного навыка: метаданные → `SKILL.md` → bundled files |
| Глубина дробления навыка | «Keep references one level deep from SKILL.md» — при вложенных ссылках модель читает файлы частично (`head -100`) и получает неполную информацию ([Skill authoring best practices]) |
| Обратный сигнал | «If Claude repeatedly reads the same file, consider whether that content should be in the main SKILL.md instead» (там же) |
| Применимость к нашему pipeline | «Some domains that require all agents to share the same context or involve many dependencies between agents are not a good fit for multi-agent systems today»; «most coding tasks involve fewer truly parallelizable tasks than research» — [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), 13.06.2025 |
| Цена дробления | «Multi-agent systems use about 15× more tokens than chats» (там же), плюс требование: «tasks where the value of the task is high enough to pay for the increased performance» |
| Дробление как измеренный failure mode | «Early agents made errors like spawning 50 subagents for simple queries» (там же) |

### 3.3. Чем компенсируется дробление у самих Anthropic

Две вещи, без которых оно вредно, и обе у нас уже есть:

- детальное описание задачи исполнителю: «Each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries… Without detailed task descriptions, agents duplicate work, leave gaps, or fail to find necessary information» — у нас это Delegation Packet;
- артефакты через файлы, а не через контекст: «Implement artifact systems where specialized agents can create outputs that persist independently… reduces token overhead from copying large outputs through conversation history» — у нас это run-ledger.

### 3.4. Сверка со списком уже отклонённого

Требование `/subsystem-audit:audit` §6. По памяти `agent-system-audit` и `skills-architecture`:

- **число агентов не наращивать** — аудит 2026-07-17 (близко к границе «handful»), сокращение 2026-07-28 с 13 агентов до 11 по эмпирике: `prototype-report.md` и `test-bench-result.md` не создавались ни разу;
- **отдельный субагент по презентациям отклонён 2026-08-11** — роль занята `design`/`design-generator`, буксовали на нормах, а не на роли;
- **деление навыка на две редактируемые копии упразднено 2026-07-28** — шесть пар из 25 разошлись; но это про зеркала одного текста, НЕ про progressive disclosure с разным содержимым;
- прецедент `memory: project`: «официальная рекомендация» — слабая причина против конкретного аргумента, по которому фичу уже откатывали.

**Вывод по тезису:** применима одна часть — размер навыка, и она у нас уже соблюдена с запасом. Остальные две в нашей конфигурации противопоказаны первоисточниками, а не только прошлыми решениями.

## 4. Находки

Порядок: рассогласование норм → эргономика → мусор. User-facing багов и секретов не найдено.

### 4.1. P0 — норма заявлена, но машинно не исполнена ни разу

**271 error и 90 warnings по 10 активным прогонам.** Ошибки типовые, а не разбросанные:

| Класс | Факт |
|---|---|
| `human_review: 8.5a` и `8.5b` | не записаны **ни в одном** из 10 прогонов (20 ошибок) |
| Маркеры канала `<!-- retro: pass=N found_by=… -->` | отсутствуют; в `a3-brand-presentation-template` — 11 заходов из 11 без маркера |
| `run-state.json status` | `pending`/`partial` при фактически выполненной работе |
| `attempts` | расходится с фактом: «правки шли мимо движка» |

Это ровно тот класс, который зафиксирован в памяти как главный вывод прогона `a3-shadcn`: гейты человека заведены, `validateHumanReviewGates` их требует, а записи не появляются. Метрики `yarn workflow:retro` по той же причине показывают нули при девяти фактических возвратах.

🔴 Гейт, объявленный в `CLAUDE.md` §5 нерушимым, **не исполнен ни разу** — при том, что механическая проверка существует и работает. Разрыв не в проверке, а в дисциплине записи.

### 4.2. P1 — индекс в 231 символе от провала ratchet

`CLAUDE.md` = **34 769 символов** при `CLAUDE_MD_CHAR_LIMIT = 35_000` (`runtime/typescript/studio-hygiene.ts:31`). Запас **0,66 %**. Следующая правка индекса длиной больше одной фразы уронит `workflow:test-studio-hygiene`, а с ним всю цепочку `workflow:test-agentic`.

Верифицировано подсчётом символов и чтением константы.

Порог — ratchet: «фиксирует достигнутое, снижать можно по мере выноса, повышать — только с ответом, почему знание не уехало в навык» (`rule-placement` §3). То есть правильный ход — **вынос, а не повышение порога**.

### 4.3. P2 — четыре проверки гигиены живут только в тесте

`runtime/typescript/doctor.ts` импортирует из `studio-hygiene.ts` **единственную** функцию `detectAbandonedWorktrees` (строка 5, вызов 137). `collectStudioHygieneFindings` и `validateStudioHygiene` вызываются только из `test-studio-hygiene.ts`.

Следствие: `CLAUDE.md` §3 велит запускать `yarn workflow:doctor` перед прогоном, но размер индекса, указатели плагинов и `@custom-variant dark` doctor не проверяет. Тот, кто следует §3 буквально, не узнает, что индекс на грани.

Верифицировано грепом импортов.

### 4.4. P2 — эргономика двух команд

- `yarn research:lint` без аргумента линтует корень репозитория как research pack и даёт 4 fail (в том числе `generic_claim_detector` на строках 37 и 90 самого `CLAUDE.md`). **С путём run-каталога проходит** — проверено на `a3-cabinet-web-flows/2026-08-17`: pass по всем правилам. То есть это не дефект логики, а отсутствие проверки аргумента: скрипт должен требовать путь, а не молча брать корень.
- `yarn figma:audit` без `--registry` падает с сообщением о неоднозначности. В `design/figma/registry.json` два элемента `systems`, поля `default_system` нет.

Ни одна из двух команд не входит в агрегатор `workflow:test-agentic` — их падение не видно ни одной сводной проверке.

### 4.5. P2 — мусор от неудачных вызовов CLI

- `outputs/archive/help/2026-08-01` и `/2026-08-17` — **goal буквально `--help`**: `workflow:start --help` не обрабатывает флаг (в движке `grep -c help` = 0) и заводит прогон. Внутри — сгенерированные артефакты research.
- `outputs/archive/3/2026-08-17` — слаг `3` из русской цели «Веб-флоу кабинета А3…»; тот же прогон затем переехал в правильный каталог.
- `outputs/temp/ai-contest-pitch/` — 5 файлов от 26 июля без run-ledger.
- `outputs/products/` — пустой legacy-каталог.
- `design/figma/product-agent-studio-deck/` — пустая заглушка, в `design/figma/registry.json` не упомянута.

Файлов `tmp*`, `*.bak`, `*-old*`, `*.orig` в нормативных зонах **нет**. Дерево git чисто.

### 4.6. Исправлено в ходе аудита

**Опись переноса врала в обе стороны.** `README-где-документы.md` (студия) объявлял перенесёнными `design-brief.md` (108 КБ), `screens.md`, `reference-analysis.md`, `reference-analysis-2.md` — все четыре остались в студии, потому что их потребовал валидатор и они были возвращены; указатель не поправили. В приёмнике (`siteportfolio/runs/2026-08-11-swiss-shot/README.md`) таблица тоже называла `design-brief.md`, противореча собственной приписке ниже.

Обе описи исправлены. Класс дефекта: **`docs:audit` проверяет ссылки, а не соответствие описи диску** — опись может врать при зелёной проверке.

### 4.7. Ложная находка, снятая до подачи

Субагент подал как дефект: блок `## Universal Execution Discipline` дословно повторяется в 11 контрактах из 11 (840 байт × 11, «избыточно 8 400 байт»).

Проверка первоисточником: это **стаб**, а не копия — три строки с явной отсылкой «Полный нормативный текст — `agent-pack/workflows/claude-operating-rules.md`, раздел 7; при изменении править там». Ровно тот паттерн, который заводили 2026-07-06 после сверки md5. Дедупликация здесь противопоказана.

Прочие 11 дублей — фрагменты 88–349 символов (преамбула обёрток, прецеденты, пути), роль-специфичные или намеренно продублированные пары «навык ↔ спека». Системной проблемы дублирования в студии нет: 12 блоков ≥120 символов на 108 нормативных файлов, суммарно 7 370 символов.

## 5. Что вынесено на решение владельца

Структурные правки молча не вносились (§5 шаблона).

1. **Гейты 8.5a/8.5b (P0).** Три варианта: (а) записывать в ledger по факту каждого показа — дисциплина, которая уже трижды не удержалась; (б) сделать запись побочным эффектом команды показа — то есть завести `yarn workflow:human-review <run-dir> <gate> --notes`, чтобы строка появлялась не вручную; (в) признать гейт неисполнимым в текущем виде и переформулировать. Рекомендую (б): проверка есть, не хватает механизма записи.
2. **Индекс `CLAUDE.md` (P1).** Вынести из него один раздел в навык или operating rules, освободив 2–4 тыс. символов, — и снизить ratchet-порог на освободившееся. Кандидат на вынос определяется по правилу «растущий класс знания в индекс не кладут».
3. **Гигиена в `doctor` (P2).** Добавить вызов `collectStudioHygieneFindings` в `workflow:doctor` — одна строка, но меняет поведение команды, которую все запускают перед прогоном.
4. **Мусор (P2).** Удалить `outputs/archive/help/*`, `outputs/archive/3/*`, пустые `outputs/products/`, `design/figma/product-agent-studio-deck/`; решить судьбу `outputs/temp/ai-contest-pitch/`. Удаление данных требует его решения.
5. **CLI (P2).** Научить `workflow:start` обрабатывать `--help` и валидировать слаг (русская цель дала слаг `3`); заставить `research:lint` требовать аргумент; добавить `default_system` в реестр Figma либо `--registry` в скрипт `figma:audit`; внести обе команды в агрегатор.

## 6. Чего аудит не проверял

- Содержательное качество текстов контрактов и навыков — только объём и связность.
- Поведение агентов в бою: аудит статический, прогонов не запускалось.
- Плагины `figma-ds`/`ui-craft`/`subsystem-audit` изнутри — считались только размеры и наличие указателей в обёртках.
- Валидность 271 ошибки валидатора поштучно: проверен класс ошибок и типовые представители, не каждая строка.
