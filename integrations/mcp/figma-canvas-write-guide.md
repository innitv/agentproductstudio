# SOP: Figma canvas и roundtrip Figma ↔ frontend

## Назначение

Этот документ — нормативный источник для Figma read/write и передачи между Figma и frontend. Старый pseudo-REST формат `action/create_node/payload`, hardcoded Slate/Inter и обязательное наследование чужой библиотеки запрещены.

**Когда этот SOP применяется (важно, читать первым).** С 2026-07-27 Figma не является источником правды (CLAUDE.md §6.1, обоснование — `docs/architecture/storybook-figma-research-2026-07-27.md`). Источник правды: токены — DTCG в `design/tokens/`, компоненты — код (`reuse` shadcn/ui по умолчанию), витрина — Storybook, приёмка — машинная (`yarn vr:test`, `yarn test-storybook`, `yarn qa:mobile`). Figma сузилась до двух ролей: **дивергентный черновик** на `04-design` и **разовый показ человеку**; обе не требуют поддерживать синхронизацию с репозиторием.

Отсюда границы применения:

- SOP **обязателен** на маршруте `track: figma` — там, где Figma действительно участвует: пользователь передал файл, нужен canvas write, идёт разовое извлечение токенов, frontend строится по чужой Figma-библиотеке. Гейты и approval здесь не ослаблены ни на шаг.
- SOP **не применяется** на маршруте `track: code` (дефолт студии). Не заводи Figma-стадию ради заполнения чек-листа.
- **Маршрут — ось запуска `track` в `run-state.json`** (CLAUDE.md §0.3), а не вывод по наличию файлов: определять его по существованию `figma-layout-ir.json` запрещено. Маршрут-условные Figma-**артефакты** (`figma-layout-ir.json`, `figma-handoff-bundle.md`, `figma-visual-qa.json`) на `track: code` не создаются и записи в ledger **не требуют вовсе**; маршрут-условные **секции** `screens.md`/`frontend-result.md` закрываются строкой `skipped_by_track` в таблице «Секции вне маршрута» `stage-gate-ledger.md`. Писать `skipped_with_reason: Figma не участвует` запрещено. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`) и как оформляется „Figma не участвует“».
- Ведение Figma-кита компонентов параллельно коду — **не наш маршрут**. Ресёрч шести зрелых DS показал: библиотеку компонентов из кода не генерирует никто, её ведут штатные дизайнеры; такого ресурса у студии нет, а расходящаяся вручную копия хуже её отсутствия.
- Code Connect нам **недоступен по тарифу** (Organization/Enterprise + full seat). Не трать шаги на попытку настроить — сразу фиксируй `code_connect_status=unavailable` и работай через Component Contract Matrix (§4).

**Границы знания (чтобы не заводить копий):** этот документ — **процесс студии**: §1–§9 — workflow, gates, Component Contract Matrix, verification, статусы. **Про Figma как таковую здесь ничего нет** — механика Plugin API, подводные камни, textbook-канон (тиеры токенов, naming, modes, component API/slots/states, a11y-пороги, docs/versioning) и визуальная подача живут в плагине `figma-ds` (§10). Про конкретный продукт (колонки, ширина витрины, node id) — рядом с продуктом в `design/figma/<slug>/`.

## 1. Design System Strategy Gate

До генерации зафиксируй один режим:

| Mode | Когда выбирать | Правило |
|---|---|---|
| `reuse` (умолчание) | Существующая система соответствует продукту и бренду | Не дублировать primitives/components. Для нового product UI существующая система — shadcn/ui в коде (`yarn shadcn add <component>`); зарегистрированная Figma-система из `design/figma/registry.json` — когда работа идёт по переданному пользователем файлу |
| `extend` | Foundation подходит, но есть доказанные product gaps | Новые entities имеют gap/reason и совместимый contract; недостающий компонент дописывается в своём слое, а не форком библиотеки |
| `product_specific` | Нужна самостоятельная продуктовая система | Создать новую foundation после visual calibration; требует записанного обоснования отказа от умолчания (`agent-pack/workflows/ds-baseline.workflow.md`) |
| `bespoke` | Повторяемость мала, уникальная композиция критична | Сначала screens; components только после подтвержденного повтора |

Доступная библиотека не означает автоматический `reuse` именно этой библиотеки. Запиши решение, rejected alternatives и влияние на frontend maintenance в `design-brief.md`, `screens.md` и — на Figma-маршруте — в `figma-handoff-bundle.md`. Полный текст гейта: `agent-pack/workflows/claude-operating-rules.md` §5.

## 2. Read path: Figma → context

### 2.1 Local DS index first

Если задача использует существующую дизайн-систему (`reuse|extend`), сначала проверь `design/figma/registry.json`.

- Если `selected_design_system_slug` есть и статус `indexed`, читай локальный индекс:
  - `design/figma/<slug>/ds.config.json`;
  - `foundation.md`;
  - `components.md`;
  - только нужные `components/<category>.md`.
- Не читай весь Figma-файл повторно, если локальный индекс отвечает на вопрос.
- В Figma обращайся только для missing nodes, refresh, screenshot/object verification или approved write.
- Если нужной DS нет в registry или индекс `partial|blocked`, сначала выполни read-only `figma-ds-ingest`. Ingest запускается только когда работа реально пойдёт по Node ID переданного файла: пустой реестр — это норма (рабочих DS в нём нет), и заполнять его «на всякий случай» запрещено (входной гейт — `agent-pack/workflows/figma-ds-ingest.workflow.md`).

### 2.2 Exact node context

Для точной реализации используй минимальный exact node scope:

1. Получи structured design context для exact frame/component node.
2. Если контекст слишком большой, сначала получи metadata/object map, затем перечитай только нужные nodes.
3. Получи screenshot того же node/state.
4. Собери inventory: variables/styles, component sets, properties, instances, Auto Layout/resizing, assets, prototype reactions.
5. Не считай screenshot заменой structure/state evidence, а metadata — заменой визуальной проверке.

## 3. Two-pass build

### Pass A — visual calibration

- Собери 2-3 ключевых экрана или состояния.
- Используй same-domain, adjacent и interaction/state references.
- Проверь Primary App Flow Gate: entry point, primary action, next state, success evidence, error/recovery path и walkthrough основного сценария.
- Проверь сценарную иерархию, composition, density, rhythm, copy fit, long text и mobile direction.
- Не создавай большую variant matrix до visual review.
- Зафиксируй screenshots и verdict: `passed|passed_with_notes|blocked`.

### Pass B — systemization

После `passed|passed_with_notes`:

- создай токены-переменные по трём тиерам (primitive → semantic → component) — канон и naming в `/figma-ds:standard`, механика в `/figma-ds:build`;
- создай text/paint/effect styles там, где это оправдано;
- создай component sets и properties из реально повторяющихся patterns;
- собирай screens из instances, а не копий frames;
- при `reuse|extend` instances должны приходить из выбранной DS (`selected_design_system_slug`) везде, где DS имеет подходящий компонент; локальный component допустим только как product gap или wrapper вокруг DS instances, а не как замена существующего DS компонента;
- настрой Auto Layout, HUG/FILL/FIXED, min/max и wrapping;
- добавь required states и prototype links;
- сравни screenshot до/после, чтобы systemization не ухудшила composition.

## 4. Component Contract Matrix

Для каждого повторяемого/интерактивного компонента запиши:

| Field | Required content |
|---|---|
| Stable component id | Независимый от display name идентификатор |
| Figma source | File/node/component key |
| Figma properties | Property names, allowed values, defaults |
| Variables | Semantic bindings; raw value только с reason |
| Required states | По применимости: default, hover, pressed, focus, disabled, loading, error, success, empty, selected |
| Resize contract | HUG/FILL/FIXED, min/max, long text, icon behavior |
| Frontend target | Import path/component |
| Prop mapping | Figma property → React prop/value |
| Evidence | Story/route, test locator, paired screenshots |
| Deviation | Accepted mismatch, owner, follow-up |

Если Code Connect доступен, опубликуй mapping и запиши URL/status. Если недоступен, matrix остается обязательным fallback.

### 4.1 DS Instance Enforcement

Для `design_system_mode=reuse|extend` Figma surface не считается готовой, если:

- в `figma-layout-ir.json` нет `component_sources[].source_type=design_system_component` для выбранной DS;
- screen-level `components[]` не ссылаются на selected-DS sources;
- object inventory не показывает visible `INSTANCE` nodes с `component_source` или `main_component_id`, совпадающими с выбранной DS;
- локальные wrapper components численно или функционально заменяют selected-DS components без отдельного перехода в `product_specific|bespoke`.

`local_components_with_deviation` — это не waiver. Это только отметка gap/wrapper, которая требует human review и не снимает обязанность использовать реальные selected-DS instances.

## 5. Write path: спецификация/код → Figma

Используй официальный plugin-context `use_figma` или эквивалентный доступный write tool. Перед каждым вызовом загрузи обязательный skill инструмента текущей среды.

Порядок:

1. Проверить auth, editor type, target file/page/node и edit rights.
2. Получить exact approval на target и scope; `write_allowed=true`.
3. Выполнить non-destructive probe/inspection.
4. Искать existing variables/components/libraries.
5. Выполнять небольшие idempotent patches: foundation → components → instances/screens → prototype.
6. После каждого логического блока получать object inventory; после визуально значимого блока — screenshot.
6a. После записи экранов выполнить app-flow walkthrough по созданным frames/prototype links: P0 entry → primary action → next state → success/error path. Без этого Figma surface остается `partial`.
7. Не удалять/перестраивать чужие frames; устаревшие версии помечать `superseded` или скрывать по согласованному scope.

Один огромный генеративный write запрещен для большой component matrix или multi-screen surface.

### 5.1 Multi-agent write safety (single-writer invariant)

Проект — оркестр субагентов, поэтому запись на канвас имеет жёсткие инварианты против гонок (Figma plugin API исполняет команды в одном sandbox; параллельные write от разных агентов ломают состояние):

- **Один writer за раз.** В конкретный Figma file/page пишет ровно один агент/сессия. Оркестратор не запускает два write-субагента на один target параллельно; write-фаза строго последовательна.
- **Explicit `parentId` / target node.** Каждая операция создания/структурного изменения указывает целевой parent явно; нельзя полагаться на «текущую страницу» или неявный контекст выбора — при чередовании агентов он небезопасен.
- **Каждый approval привязан к exact target** (file/page/node + scope). Approval на один target не распространяется на соседний frame или другую страницу.
- **После каждого логического блока — inventory/screenshot** (см. п.6 выше) до следующего write, чтобы следующий шаг опирался на подтверждённое состояние, а не на предположение.

Обоснование паттерна — практика multi-agent Figma-write (command queue, блокировка implicit page context, обязательный `parentId`) из [arinspunk/claude-talk-to-figma-mcp](https://github.com/arinspunk/claude-talk-to-figma-mcp). Мы достигаем той же безопасности через последовательный approval-gated write, а не через серверную очередь.

## 6. Frontend → Figma

Классифицируй изменение:

- `token_change`: править **только** DTCG-источник в `design/tokens/`, затем `yarn tokens:build` — он собирает CSS-переменные фронтенда и DTCG-экспорт для Figma Variables. Обратный порядок (сначала поправить переменную в Figma) запрещён: правка в Figma не попадает в код и расхождение не ловится ничем. Перенос в Figma — ручной импорт DTCG-файла в Variables view, по необходимости и без обязательства держать синхронно.
- `component_api_change`: обновить Component Contract Matrix, Code Connect/fallback mapping, истории Storybook и — на Figma-маршруте — Figma properties.
- `screen_composition_change`: приложить browser screenshot/DOM evidence и patch существующих instances; DOM/screenshot import допустим только как draft.

Не синхронизируй каждый DOM node с каждым Figma layer. Source of truth — contracts, states, tokens и accepted composition, а не идентичное дерево.

## 7. Figma → frontend

Перед кодом подготовь implementation packet:

- selected design-system slug и пути локального индекса;
- exact frame/node URLs и screenshots на целевых viewports;
- component/instance inventory;
- variables/styles/assets;
- state matrix и prototype transitions;
- frame/state → route/story/component mapping;
- Component Contract Matrix;
- intentional deviations.

Frontend сначала ищет production component в коде: официальный реестр shadcn/ui (`yarn shadcn search @shadcn`, установка `yarn shadcn add <component>`), затем уже существующие компоненты проекта, затем Component Contract Matrix. Code Connect в этот поиск не входит — он нам недоступен по тарифу. Новый primitive допустим только с `gap_reason`; локальный bespoke component не должен дублировать уже доступный contract. Реализованный компонент попадает в витрину историей — без истории он не считается сданным.

## 8. Verification

### Structural evidence

- page/frame/node inventory;
- components/component sets/instances count;
- selected-DS instance count vs local wrapper count;
- no detached instances для repeated primitives;
- variable/style bindings и raw-value deviations;
- Auto Layout/resizing audit;
- Russian Publication Gate.

### Visual evidence

- calibration screenshots;
- before/after systemization comparison;
- paired Figma/browser screenshots для must-cover frames/states;
- desktop/mobile и long-copy checks.

Visual regression после systemization блокирует `ready`, даже если object inventory стал формально полнее.

### Behavioral evidence

- prototype transition или interaction spec;
- Primary App Flow Gate walkthrough для app/prototype/frontend/Figma surface;
- story/state catalog;
- keyboard/focus/disabled/loading/error/success checks;
- Playwright/manual flow evidence.

## 9. Status rules

- `ready/success` запрещен, если выбранный `design_system_mode` не записан.
- `ready/success` запрещен без visual calibration evidence для новой/расширяемой системы.
- Наличие components/variables не компенсирует visual regression.
- Figma write без inventory + screenshot имеет статус не выше `partial`.
- Figma/app surface без Primary App Flow Gate walkthrough имеет статус не выше `partial`.
- Figma-driven frontend без Component Contract Matrix, frame/state mapping и paired screenshots имеет статус не выше `partial`.
- Любой accepted mismatch имеет deviation, owner и follow-up.


## 10. Механика Figma и textbook-канон — в плагине `figma-ds`

Здесь их нет намеренно. Всё, что верно про Figma безотносительно нашего процесса, живёт в плагине `figma-ds` (`plugins/figma-ds/`, раздаётся всем проектам) — **это единственный источник правды, копий не заводить:**

| Нужно | Куда идти |
|---|---|
| **Как сделать** в Plugin API `use_figma`: токены как Variables и три тиера, code syntax, component sets и слоты, цвет иконки, организация файла по страницам, ограничения платформы, подводные камни движка, финальная самопроверка перед отчётом/handoff (пакетный гейт, не после каждого write) | `/figma-ds:build` → `plugins/figma-ds/skills/build/SKILL.md` |
| **Что именно правильно** по канону: тиеры токенов и naming, DTCG, modes vs themes, выбор property (variant/boolean/text/instance-swap/slot), матрица состояний, точные пороги WCAG 2.2, документация/versioning/статусы, визуальная подача DS-файла | `/figma-ds:standard` → `plugins/figma-ds/skills/standard/SKILL.md` |

**Нормативность:** канон `/figma-ds:standard` обязателен для студии наравне с §1–§9 — отклонения фиксируются как `deviation` с reason, а не замалчиваются. Status-правило подачи (DS-deliverable без cover-страницы и документации ключевых компонентов — не выше `passed_with_notes`) действует оттуда же и учитывается в §9.

**Почему знание уехало из guide:** копия канона неизбежно отстаёт от практики — грабли пишутся там, где работают, а не там, где лежит документ. Так guide уже отстал и советовал биндить иконки к общему `color/ink` (реальный баг: тёмная иконка на цветном фоне). Плагин под git, правка из любого проекта физически попадает в студию. Ссылки выше даны и путём в репо, а не только slash-именем: если junction `~/.claude/skills/figma-ds` отвалится, канон всё равно читается по пути.
