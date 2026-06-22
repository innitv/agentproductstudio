# Аудит процесса Figma ↔ frontend

Дата: `2026-06-22`
Статус: `completed`
Тип работы: `limited engineering task + process research`

## Короткий вывод

Текущий процесс умеет создавать Figma-артефакты и доводить интерфейс до работающего frontend, но связь между двумя поверхностями остаётся ручной. Мы проверяем наличие фреймов, Auto Layout, компонентов, screenshots и работающих сценариев, однако не проверяем единый контракт:

`Figma component property → React prop → CSS token → UI state → story/test → screenshot pair`.

Из-за этого структурное улучшение Figma может ухудшить композицию, а перенос во frontend превращается в серию ручных подгонок. Главный вывод: не нужен ещё один генератор макетов. Нужен **component contract registry + Code Connect + state stories + автоматическая parity-проверка**.

## Статус внедрения

`implemented` — рекомендации аудита перенесены в `AGENTS.md`, единый Figma roundtrip SOP, design/frontend/QA agents, skills, templates, schemas, workflow manifest, capability registry и config validators. План и проверки: `agent-pack/plans/figma-roundtrip-implementation-plan.md`.

## Что было на практике

### 1. Из Figma в компоненты A3

- Токены и component contracts извлекались из конкретных Figma nodes и документировались в `design/figma/a3-design-system/`.
- Было создано 17 React-компонентов и отдельный `/components` playground.
- Figma naming нормализовался вручную: например, `succes` превращался в `success`.
- Качество подтверждалось build, Playwright и ручным playground.

Это полезный первый слой, но документация оставалась человеком читаемой таблицей. Она не стала исполняемым контрактом и не могла автоматически обнаружить, что Figma variant появился, React prop исчез или CSS использует другой token.

### 2. Из исследования/кода в Figma A3Pay

Фактическая эволюция особенно показательна:

1. `v1` — визуально живой, но плоский wireframe без системной структуры.
2. `v2` — 26 variables, 8 text styles, 4 component sets, 17 variants, 41 instances и Auto Layout.
3. После просмотра пользователя `v2` понижена до `partial`: техническая систематизация ухудшила композицию, плотность и ритм сценария.
4. `v3` вернула правильный порядок: сначала сценарий и визуальная иерархия, затем компоненты и Auto Layout.
5. `v4` добавила реальные визуальные ориентиры и переработала checkout, bank confirmation, receipt и merchant dashboard.

Это прямое доказательство, что наличие variables/components/Auto Layout не является достаточным quality gate.

### 3. Из Figma A3Pay во frontend

- Первая реализация была построена как отдельный `A3PayDemo.tsx` и большой bespoke CSS-файл.
- В актуальной feature-ветке это примерно 968 строк TSX и 1331 строка CSS.
- A3Pay не импортирует существующие `apps/frontend/src/components/ui/*`; повторяемые кнопки, cards, chips и inputs создаются локальными class names.
- После первой реализации потребовалось семь крупных итераций над TSX/CSS: исправление role screens, несколько Figma alignment passes, удаление demo framing, интерактивные flows и отдельная полировка.
- Playwright хорошо проверяет сценарии, тексты, адаптацию и несколько геометрических отношений, но не содержит обязательных Figma↔browser screenshot pairs или component/state parity.

Итог: frontend функционально убедителен, но не является продолжением Figma design system. Это параллельная реализация того же изображения.

## Основные недостатки

| Приоритет | Недостаток | Наблюдаемое последствие |
|---|---|---|
| P0 | Нет исполняемого component contract | Figma variants, React props и CSS states расходятся незаметно |
| P0 | Figma systemization применяется раньше проверки композиции | Технически корректная v2 визуально проиграла плоскому v1 |
| P0 | Нет обязательного Figma frame/state → route/story mapping | Frontend проверяет flow, но не полноту всех макетных состояний |
| P0 | Нет Code Connect | Dev Mode не показывает production-компонент и корректный prop mapping |
| P0 | A3Pay дублирует локальную UI-систему | Большой bespoke CSS, повторная реализация primitives, дорогие правки |
| P1 | Нет Storybook или эквивалентного state catalog | Playground показывает примеры, но не является тестируемой матрицей variants/states |
| P1 | Visual QA проверяет отдельные screenshots, а не стабильные пары | Совпадение с Figma устанавливается человеческой оценкой и серией коммитов |
| P1 | Нет метрик Figma-native качества | Можно получить много frames, но мало instances, bindings или корректных resizing rules |
| P1 | Старое руководство записи конфликтует с новым tool contract | Оно предлагает pseudo-REST `action/payload`, hardcoded Slate/Inter и frames вместо native bindings |
| P2 | Нет управляемой обратной синхронизации code → Figma | Изменения во frontend либо не возвращаются в дизайн, либо возвращаются как новый визуальный слепок |
| P2 | Нормализации имен не закреплены registry | `succes → success` исправлено вручную, но drift может вернуться |

## Конфликт в текущих правилах

Новые проектные правила уже требуют component/library grounding, variables, Auto Layout, object inventory, screenshots и Source Pair Matrix. Это правильное направление.

Но `integrations/mcp/figma-canvas-write-guide.md` описывает другой мир:

- жёсткие Slate/Inter defaults вместо чтения реальной системы;
- создание generic frames/text/rectangles;
- raw RGBA вместо variable bindings;
- условный `action/create_node/payload`, не соответствующий текущему plugin-context workflow;
- нет component-property contract, instance audit, resizing audit и Code Connect.

Пока оба подхода считаются нормативными, агент может выполнить формальные шаги и всё равно создать макет, который трудно поддерживать.

## Что показывают решения на GitHub

### Figma Code Connect

[figma/code-connect](https://github.com/figma/code-connect) связывает Figma components с production-компонентами, поддерживает property-to-prop mapping и показывает реальный код в Dev Mode. Это недостающий мост для нашего A3 kit. Ограничение: функция зависит от тарифа Figma, поэтому нужен fallback registry.

### Framelink MCP

[GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) сокращает сырые Figma API-данные до layout/styling context, полезного coding agent. Главный урок: агенту нужно давать точный node context, а не весь файл и не один screenshot.

### TalkToFigma MCP

[grab/cursor-talk-to-figma-mcp](https://github.com/grab/cursor-talk-to-figma-mcp) работает через Figma plugin и предоставляет точечные операции для Auto Layout, sizing, component instances и instance overrides. Главный урок: canvas write должен быть набором проверяемых операций над native nodes, а не одним огромным генеративным вызовом.

### Tokens Studio

[tokens-studio/figma-plugin](https://github.com/tokens-studio/figma-plugin) хранит tokens в JSON, синхронизирует их через GitHub, поддерживает aliases и применяет spacing к Auto Layout. Главный урок: token source of truth должен быть машинным и versioned; Markdown `token-map.md` лучше генерировать из него, а не использовать как единственный источник.

### Screenshot-to-code

[abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) включает browser preview, чтобы агент мог отрендерить результат и визуально проверить собственную генерацию. Главный урок для нас — render/compare/fix должен быть частью одного прогона, но screenshot нельзя считать заменой structure/state checks.

### Что не стоит копировать

- One-shot «сгенерируй весь экран» без промежуточной object/state проверки.
- DOM/screenshot → Figma как обещание настоящей двусторонней синхронизации. Это полезный импорт черновика, но он не восстанавливает semantic components, variables и prototype behavior.
- Полный bidirectional sync одного и того же layout-дерева. Figma и React имеют разные модели; синхронизировать нужно contracts и evidence, а не каждый layer/div.

## Рекомендуемая архитектура

### 1. Единый registry компонентов

Добавить machine-readable `design-system/component-contracts.json` или YAML:

```text
component id
Figma component set/node key
Figma properties and allowed values
React import and prop mapping
token bindings
required states
Storybook story IDs
test locators
known deviations
```

Markdown `component-map.md`, Code Connect files и parity tests должны генерироваться или проверяться относительно registry.

### 2. Tokens как versioned source

- Primitive и semantic tokens хранить в JSON по формату, близкому к DTCG.
- Синхронизировать Figma Variables через Tokens Studio или собственный узкий adapter.
- CSS variables генерировать из того же JSON.
- Запретить raw hex/spacing в Figma write, если существует semantic token.

### 3. Нативный Figma build в два прохода

**Pass A — visual calibration:** 2–3 ключевых экрана, реальные references, иерархия, плотность, copy fit. Компоненты создаются только там, где повтор уже доказан.

**Pass B — systemization:** variables, text/effect styles, component sets, properties, nested instances, resizing, min/max behavior и prototype links. Систематизация не имеет права менять утверждённую композицию без deviation.

### 4. Figma → frontend

Для каждого экрана формировать `implementation packet`:

- exact frame/node URL;
- screenshot на целевом viewport;
- component-instance inventory;
- variables/styles used;
- state matrix и interaction transitions;
- asset list;
- frame → route/story mapping;
- intentional deviations.

Реализация сначала подбирает существующий production component через registry/Code Connect. Новый локальный primitive разрешён только после явного gap record.

### 5. Frontend → Figma

Обратно передавать три разных типа изменений, не смешивая их:

1. **Token change** — через token source и Figma Variables sync.
2. **Component API change** — через registry + Code Connect + обновление Figma component properties.
3. **Screen composition change** — browser screenshot/DOM snapshot только как evidence; затем агент редактирует существующие Figma instances, а не импортирует DOM как финальный макет.

### 6. Исполняемые gates

| Gate | Минимальное условие |
|---|---|
| Component parity | 100% обязательных Figma properties сопоставлены React props или deviation |
| State coverage | default/hover/focus/disabled/loading/error/success по применимости присутствуют в Figma и stories |
| Instance integrity | Нет detached instances; повторяемые primitives — instances |
| Variable binding | Цвета/типографика/radius/spacing используют semantic variables там, где они существуют |
| Layout | Auto Layout + HUG/FILL/FIXED проверены на compact/long copy и min/max viewport |
| Visual | Парные Figma/browser screenshots для каждого must-cover frame/state |
| Behavior | Prototype transition или interaction spec сопоставлены Playwright test |
| Accessibility | Focus, contrast, labels, keyboard behavior проверены отдельно от pixel diff |

## Новый рабочий процесс

```text
Brief + evidence
  → 2–3 calibration screens
  → human visual approval
  → component/state inventory
  → variables + component sets + instances
  → Figma structure audit
  → Code Connect / registry mapping
  → Storybook state implementation
  → product screen assembly
  → paired screenshots + behavior tests
  → drift report
  → targeted Figma or code corrections
```

Ключевое изменение порядка: **сначала доказать композицию, затем систематизировать; сначала реализовать component stories, затем собирать продуктовый экран**.

## План внедрения

### P0 — убрать причины повторения проблемы

1. Пометить старое `figma-canvas-write-guide.md` как deprecated и заменить его plugin-context SOP.
2. Создать schema для component contract registry.
3. Описать 5 пилотных компонентов: Button, Input, StatusCard/InlineNotification, Chip, PaymentRow.
4. Добавить frame/state → route/story mapping в `figma-handoff-bundle.md`.
5. Запретить frontend `success`, если Figma-driven screen не имеет paired screenshot evidence.

### P1 — сделать handoff исполняемым

1. Подключить Code Connect, если тариф позволяет; иначе генерировать локальный mapping report.
2. Добавить Storybook или лёгкий эквивалент на базе отдельных state routes.
3. Добавить parity validator: Figma properties ↔ registry ↔ TypeScript props ↔ stories.
4. Добавить Playwright screenshot projects для согласованных desktop/mobile viewports.
5. Ввести метрики instance/variable/layout coverage в Figma verification.

### P2 — аккуратный roundtrip

1. Автоматизировать token sync code ↔ Figma.
2. Добавить drift report в CI без автоматической перезаписи Figma.
3. Делать code → Figma screen updates только как patch существующих instances.
4. Хранить accepted deviations с владельцем и сроком пересмотра.

## Критерий успеха пилота

Пилот считается успешным, если один A3Pay flow можно изменить в Figma и довести до frontend без нового bespoke primitive, с автоматическим обнаружением prop/state drift, с парными screenshots всех обязательных состояний и не более чем одним визуальным correction pass после первой реализации.

## Проверенные источники проекта

- Git-история `a7b0342`, `df69ff2`, `accc040`, `0ec0a5e`, `a229e0a`, `8e92078`, `76be189`, `d4a022b`, `e349d3e`.
- `research/projects/a3pay-ozon-bank-mvp/2026-06-18/*` в ветке `codex/a3pay-demo-mvp`.
- `design/figma/a3-design-system/*`.
- `agent-pack/skills/figma-handoff/SKILL.md`.
- `integrations/mcp/figma-canvas-write-guide.md`.
- `tests/playwright/a3pay-demo.spec.ts` в ветке `codex/a3pay-demo-mvp`.
