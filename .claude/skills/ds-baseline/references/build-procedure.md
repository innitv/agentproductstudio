# Сборка нового foundation: входы, процедура, приёмка

Детали для `ds-baseline`. Читать, когда skill запущен — то есть когда решение
«нужен собственный foundation» уже обосновано и записано.

## Обязательные inputs

- `prd.md`, `ia-brief.md` — что за продукт и какой главный сценарий.
- `design-brief.md` с зафиксированным `design_system_mode`, rationale и отклонёнными системами.
- `STYLE_GUIDE.md` (при reference-driven задаче) — слой подачи и антипаттерны.
- Visual evidence plan и reference cards (см. Universal Visual Evidence Grounding).
- Аудит существующих библиотек: что уже есть и почему не подходит.
- Platform, locale, accessibility и brand constraints.
- Exact Figma target и approval `figma_write` — только перед write.

## 3. Процедура

0. **Preflight.** Пройди §1.1: почему тема поверх shadcn задачу не закрывает. Без записанного ответа — `blocked`.
1. **Strategy.** Подтверди `product_specific`/`extend`, зафиксируй rationale, отклонённые системы (shadcn/ui входит в список обязательно) и границы. Решение учитывает характер продукта, аудиторию, brand separation, плотность, платформу, срок жизни интерфейса и цену поддержки.
2. **Visual calibration.** Собери 2-3 ключевых экрана или состояния **без** большой component matrix. Проверь композицию, плотность, иерархию, ритм, copy fit, длинный текст и responsive-направление. На этом проходе запрещено систематизировать макет ценой ухудшения композиции. Поверхность калибровки выбирается по задаче: экран в коде + composition story (дешевле проверить машинно и он же станет результатом) либо Figma-черновик, если направление ещё расходится и ошибиться нужно дёшево до кода.
3. **Visual verdict.** Вынеси вердикт: `passed | passed_with_notes | blocked`. При `blocked` foundation и компоненты **не строятся** — сначала чинится композиция.
4. **Foundation extraction.** Из утверждённых экранов извлеки primitive и semantic токены, typography roles, spacing/radius/effect решения. Не генерируй их из отраслевого preset. Записывай извлечённое в `design/tokens/` (§1.2) и прогоняй `yarn tokens:build`: значение, не прошедшее сборку и baseline-гейт, не является токеном системы.
5. **Pattern inventory.** Отметь реальные повторы. Уникальные блоки остаются bespoke — «универсальный набор компонентов» не создаётся, если экранам он не нужен.
6. **Systemization.** Опиши систему в целевой среде. Для кодовой системы это компоненты + стори состояний в витрине (`ds-to-storybook`) и токены в `design/tokens/`; приёмка — `yarn test-storybook` и `yarn vr:test`. Если систему дополнительно нужно показать в Figma: variables/styles, component sets и properties, nested instances, Auto Layout/resizing и prototype links — техника по `/figma-ds:build` (три уровня токенов, консолидация через properties), канон — `/figma-ds:standard`. Figma-слой не становится вторым источником правды: он собирается из уже принятых токенов.
7. **Component Contract Matrix.** Свяжи Figma properties/values с semantic variables, React props, состояниями, stories/tests и deviations.
8. **Regression check.** Сравни screenshots calibration и systemized версий. Systemization не имеет права ухудшить композицию; если изменила — нужен screenshot comparison и deviation record.
9. **Roundtrip handoff.** Запиши Code Connect/fallback status и mapping `frame/state → route/story/component`.

Figma write выполняется небольшими idempotent patches только после exact approval.

## 4. Evidence и failure modes

Обязательные выходы: `design-brief.md` с Design System Strategy; `screens.md` с Component Contract Matrix; `design-loop-report.md` с visual calibration и regression check; `figma-handoff-bundle.md` с foundation, mappings и verification evidence.

Quality gates:

- Нет hardcoded отраслевой палитры или шрифта без evidence и rationale.
- Не создан «универсальный набор компонентов», не нужный экранам.
- Все повторяющиеся primitives — instances; detached-копии имеют deviation.
- Semantic bindings используются там, где токен существует; raw values имеют причину.
- Проверены required states, длинный copy, HUG/FILL/FIXED и min/max поведение.

Failure modes:

- **`blocked`** — visual verdict `blocked`: композиция не готова, foundation строить нельзя. Также при отсутствии approval/target для write.
- **`partial`** — systemization выполнена, но regression check показал ухудшение композиции без deviation record.
- **`rejected_needs_redesign`** — структурные проверки прошли, но screenshot выглядит как wireframe, audit board или component inventory, а не как реальный экран продукта.

## 5. Validation gates

- [ ] Preflight §1.1 пройден: записано, почему тема поверх shadcn задачу не закрывает.
- [ ] `design_system_mode` подтверждён с rationale; отклонённые системы записаны, shadcn/ui среди них.
- [ ] Извлечённый foundation лежит в `design/tokens/` и проходит `yarn tokens:build` с baseline-гейтом.
- [ ] Visual calibration выполнена на 2-3 экранах **до** создания компонентов; вердикт зафиксирован.
- [ ] Foundation извлечён из утверждённых экранов, а не из отраслевого preset.
- [ ] Component Contract Matrix заполнена; Code Connect status записан.
- [ ] Regression check выполнен: systemization не ухудшила композицию.

Два последних пункта относятся только к работе по переданному Figma-файлу. Без неё витрина результата — Storybook, записи в Figma нет, и требовать их запрещено: пункты не выполняются, записи в ledger не требуют и на статус не влияют.

- [ ] **(только при Figma-работе)** Approval `figma_write` с exact target получен до write; после write — metadata + screenshot.
- [ ] **(только при Figma-работе)** `yarn figma:audit --registry design/figma/<slug>/component-contracts.json` пройден без `needs_revision`/`blocked` (или зафиксирован deviation).

Эквивалент этих двух проверок без Figma: `yarn tokens:check` (паритет темы со снимком реестра), `yarn test-storybook` и `yarn vr:test` — то есть Machine Acceptance Gate, обязательный всегда.
