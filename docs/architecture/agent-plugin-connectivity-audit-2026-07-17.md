# Аудит: связность агентов, skills и плагина `figma-ds` — 2026-07-17

## Цель

Финальная проверка после резки §10–§12 из `integrations/mcp/figma-canvas-write-guide.md` (коммит `d5839e3`): сходится ли граф знания — агенты ↔ контракты ↔ skills ↔ плагин ↔ guide, нет ли висячих ссылок и дублей.

## Метод

- Механические валидаторы (13 agentic-тестов + doctor + qa:quick) — прогнаны оркестратором.
- Два параллельных субагента на срезы: (A) висячие/устаревшие ссылки по всему репо, (B) связность агент → skill → плагин.
- **Все находки субагентов верифицированы первоисточником** до подачи как факт (рабочее правило аудитов).

## Машинные проверки — все PASSED

| Проверка | Результат |
|---|---|
| `workflow:test-agentic` (13 тестов: agent-metadata, agent-capabilities, skill-metadata, skill-usage, figma-layout-contract, figma-layout-verifier, output-metadata, output-lifecycle, approval-gate, agentic-rollout/executor/readiness/engine) | passed |
| `workflow:doctor` | passed (warning: optional provider keys в `.env` — не связано с аудитом) |
| `qa:quick` (typecheck + validate:config + docs:audit) | passed |

`tooling/scripts/validate-config.mjs` проверяет guide по `requiredSnippets` (`Design System Strategy Gate`, `Two-pass build`, `Component Contract Matrix`, `Frontend → Figma`, `Figma → frontend`, `Visual regression`, `pseudo-REST`, `Local DS index first`) — все они в §1–§9, резка §10–§12 валидатор не задела.

## Верификация находок субагентов

| Находка | Вердикт после проверки |
|---|---|
| `ds-baseline` (обе копии) ссылается на `figma-ds-build` | **Подтверждено — реальный баг.** `ls` показал: каталога `figma-ds-build` нет ни в `~/.claude/skills/`, ни в `agent-pack/skills/`, ни в `.claude/skills/`. Мёртвая ссылка. ИСПРАВЛЕНО (см. ниже) |
| Ни один агент/контракт не ссылается на плагин напрямую | **Подтверждено как факт, но это НЕ баг.** `runtime/typescript/test-skill-metadata.ts:19` резолвит skill по пути `agent-pack/skills/<skillId>/SKILL.md` — плагинный `/figma-ds:build` в `skills:` контракта вписать физически нельзя, валидатор упадёт. Связь через `figma-roundtrip` — единственная возможная схема, а не недоделка |
| `plugins/figma-ds/README.md:7` упоминает `§10–§12` и `figma-ds-build` | **Не баг.** Явное прошедшее время («Раньше это знание лежало в четырёх местах») в разделе «Зачем» — объяснение мотивации, не утверждение о текущем состоянии |
| Ссылки на §10/§12 в `outputs/**`, `research/**`, `*-audit-*.md` | **Не баг, историческое.** Run artifacts и аудиты фиксируют прошлое состояние. `figma-canon-consistency-audit-2026-07-06.md` уже несёт приписку от 2026-07-17 |
| `.claude/commands/{copy,prd,ia,qa}.md` содержат «раздел 10/11» | **Ложное срабатывание.** Это ссылки на разделы `CLAUDE.md`, не на guide |
| Слово `playbook` в operating-rules/quality-gates/anti-ai-slop | **Ложное срабатывание.** Это словарь запрещённых AI-клише, не память `figma-ds-build-playbook` |

## Исправлено в этом аудите

**Мёртвая ссылка `figma-ds-build` → `/figma-ds:build`** — хвост миграции на плагин, не замеченный при резке guide. Три места:

- `.claude/skills/ds-baseline/SKILL.md:16` — имя в списке «не использовать для».
- `agent-pack/skills/ds-baseline/SKILL.md:37` — кроме имени, описывал **старую архитектуру**: «user-level skill `figma-ds-build` (живёт в `~/.claude/skills/`, самодостаточен)». Это противоречило текущему устройству (глобальных копий нет, знание в плагине под git). Заменено на `/figma-ds:build` + `/figma-ds:standard` с указанием `plugins/figma-ds/`.
- `agent-pack/skills/ds-baseline/SKILL.md:58` — техника systemization.

Значимость: `ds-baseline` подключён к `design` и `design-generator`, то есть агент на этапе systemization получал нерабочий идентификатор. Практический ущерб ограничивался тем, что у обоих агентов есть рабочий канал через `figma-roundtrip`.

Проверка после правки: `grep figma-ds-build` по всей нормативной зоне (`.claude`, `agent-pack`, `integrations`, `plugins`, `runtime`, `CLAUDE.md`, `README.md`, `repo-map.md`) — пусто. Остатки только в `outputs/**`, `research/**` (A3 run artifacts, историческое) и `plugins/figma-ds/README.md` (прошедшее время).

## Граф связности — состояние

Все 13 агентов имеют парный контракт 1:1, осиротевших нет. Junction `~/.claude/skills/figma-ds` → `C:\Project\ai native design\plugins\figma-ds` жив (`LinkType = Junction`). Дублей skills нет: каталогов `figma-ds-build` / `figma-ds-standard` не существует, знание только в плагине.

Четыре Figma-агента доходят до плагина за 1–2 хопа:

| Агент | Канал к плагину |
|---|---|
| `design` | `figma-roundtrip` (прямая ссылка на `/figma-ds:build` + `/figma-ds:standard`), `figma-screen-compiler` (`/figma-ds:standard`), `ds-baseline` (после фикса), контракт → guide §10 |
| `design-generator` | то же |
| `qa-review` | `figma-roundtrip`; контракт → guide §10 |
| `frontend` | `figma-roundtrip`; `figma-token-extractor` → guide §10 |

## Тупиковые ветки — ЗАКРЫТЫ (решение пользователя 2026-07-17)

**`visual-layout-verifier` и `ds-to-storybook`** не упоминали плагин ни в одной из копий, хотя смыслово пересекаются с ним. Не были багом (агенты доходят через `figma-roundtrip`), но держались на одном канале: уйди `figma-roundtrip` из чьих-то `skills:` — связность порвалась бы молча. По решению пользователя («лучше чтоб были ссылки, а то мало ли») добавлен второй канал:

- `visual-layout-verifier` (обе копии) — шаг про post-write чек-лист гигиены сборки из `/figma-ds:build` (мастер в панели, хвосты клона, сырые заливки, слот ↔ семья семантики, дубли стилей, оси вариантов, подписи значений). Этот чек-лист ловит класс дефектов, который IR-сверка не видит, — то есть ссылка не декоративная, а закрывает реальный пробел покрытия. В `agent-pack`-копии шаг вставлен пятым, нумерация 5→8 сдвинута; проверено грепом — на номера шагов этого skill никто не ссылается.
- `ds-to-storybook` (обе копии) — в шаге про states указан канон типов property и матрицы состояний `/figma-ds:standard`, с явным «сверяйся с ним, а не выводи набор из фактической структуры Figma-файла».

**Остаётся осознанным (не дефект):** связность держится на транзитивных ссылках внутри skills — прямой ссылки агент → плагин нет и быть не может (см. верификацию выше: валидатор резолвит skill по пути `agent-pack/skills/<id>/`). Альтернатива — расширять валидатор под плагинные id — структурное изменение, отдельное решение.

## Изменённые файлы

- `.claude/skills/ds-baseline/SKILL.md` — мёртвая ссылка.
- `agent-pack/skills/ds-baseline/SKILL.md` — мёртвая ссылка + описание старой архитектуры.
- `.claude/skills/visual-layout-verifier/SKILL.md`, `agent-pack/skills/visual-layout-verifier/SKILL.md` — второй канал к `/figma-ds:build`.
- `.claude/skills/ds-to-storybook/SKILL.md`, `agent-pack/skills/ds-to-storybook/SKILL.md` — второй канал к `/figma-ds:standard`.
- `docs/architecture/agent-plugin-connectivity-audit-2026-07-17.md` — этот отчёт.

## Валидация после правок

- `yarn workflow:test-agentic` — 13/13 passed.
- `yarn qa:quick` — typecheck / validate:config / docs:audit passed.
- `grep` по нормативной зоне — висячих ссылок нет.
