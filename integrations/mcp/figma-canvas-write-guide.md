# SOP: Figma canvas и roundtrip Figma ↔ frontend

## Назначение

Этот документ — нормативный источник для Figma read/write, создания новой продуктовой дизайн-системы и передачи между Figma и frontend. Старый pseudo-REST формат `action/create_node/payload`, hardcoded Slate/Inter и обязательное наследование A3 запрещены.

## 1. Design System Strategy Gate

До генерации зафиксируй один режим:

| Mode | Когда выбирать | Правило |
|---|---|---|
| `reuse` | Существующая система соответствует продукту и бренду | Не дублировать primitives/components |
| `extend` | Foundation подходит, но есть доказанные product gaps | Новые entities имеют gap/reason и совместимый contract |
| `product_specific` | Нужна самостоятельная продуктовая система | Создать новую foundation после visual calibration |
| `bespoke` | Повторяемость мала, уникальная композиция критична | Сначала screens; components только после подтвержденного повтора |

Доступная библиотека не означает автоматический `reuse`. Запиши решение, rejected alternatives и влияние на frontend maintenance в `design-brief.md`, `screens.md` и `figma-handoff-bundle.md`.

## 2. Read path: Figma → context

### 2.1 Local DS index first

Если задача использует существующую дизайн-систему (`reuse|extend`), сначала проверь `design/figma/registry.json`.

- Если `selected_design_system_slug` есть и статус `indexed`, читай локальный индекс:
  - `design/figma/<slug>/ds.config.json`;
  - `foundation.md|token-map.md`;
  - `components.md|component-map.md`;
  - только нужные `components/<category>.md`.
- Не читай весь Figma-файл повторно, если локальный индекс отвечает на вопрос.
- В Figma обращайся только для missing nodes, refresh, screenshot/object verification или approved write.
- Если нужной DS нет в registry или индекс `partial|blocked`, сначала выполни read-only `figma-ds-ingest`.

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

- создай primitive и semantic variables;
- создай text/paint/effect styles там, где это оправдано;
- создай component sets и properties из реально повторяющихся patterns;
- собирай screens из instances, а не копий frames;
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

## 6. Frontend → Figma

Классифицируй изменение:

- `token_change`: обновить versioned token source, затем Figma Variables и CSS variables.
- `component_api_change`: обновить Component Contract Matrix, Code Connect/fallback mapping, Figma properties и frontend stories.
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

Frontend сначала ищет production component по Code Connect/registry. Новый primitive допустим только с `gap_reason`; локальный bespoke component не должен дублировать уже доступный contract.

## 8. Verification

### Structural evidence

- page/frame/node inventory;
- components/component sets/instances count;
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
