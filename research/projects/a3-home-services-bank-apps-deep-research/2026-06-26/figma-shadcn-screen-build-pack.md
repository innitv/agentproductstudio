# Shadcn DS build-pack для Figma-экранов A3 Home Services

## Artifact Metadata

Status: superseded_needs_revision
Surface type: `figma_board`
Target Figma file from prior mockups: `https://www.figma.com/design/dL70YFBGi981ETZX2hcxBp`
Design system: `design/figma/shadcn-ui-components-2026`
Source DS file key: `NUoNEuTJ3OZOGH2c780Z55`
Дата: 2026-06-27

## Superseded Note

Эта версия не должна использоваться как продуктовая схема приложения. Она была собрана как набор тематических экранов по `F01-F06` и shadcn component matrix, но не удержала главный пользовательский маршрут внутри банковского приложения.

Нормативная коррекция: `figma-app-flow-correction-2026-06-27.md`.

Главная ошибка: экранная матрица была построена вокруг компонентов и отдельных flows, а не вокруг P0-сценария `Дом -> объект -> счет ЖКУ -> оплата -> статус поставщика -> исправление проблемы`.

Новая коррекция после review 2026-06-28: этот artifact нельзя использовать как источник для новых макетов. Он описывает технический путь `reconstruct-from-contracts`, который производит служебные Figma-картинки вместо product UI. Для запроса "собери макеты/use cases/flow" использовать только Figma Make-like маршрут: Lazyweb/reference evidence -> use cases -> текущая дизайн-система -> реальные product screens; technical inventory только после визуального результата.

## Inputs Used

- `figma-home-usecase-mockups.md`
- `scenario-user-flows.md`
- `design/figma/shadcn-ui-components-2026/component-contracts.json`
- `design/figma/shadcn-ui-components-2026/components/actions.md`
- `design/figma/shadcn-ui-components-2026/components/forms.md`
- `design/figma/shadcn-ui-components-2026/components/data-display.md`
- `design/figma/shadcn-ui-components-2026/components/navigation.md`

## Token-saving Figma route

Цель: не сканировать Figma заново и не тащить большой design context. Для записи использовать локальный ID pack и короткий script, который работает с заранее выбранными component IDs.

Ограничение Figma: `nodeId` переносим только внутри того файла, где живет node. ID из community DS (`NUoNEuTJ3OZOGH2c780Z55`) нельзя напрямую вызвать через `getNodeByIdAsync` в целевом файле `dL70YFBGi981ETZX2hcxBp`, если компонент не скопирован/импортирован в этот файл.

Разрешенные режимы:

| Режим | Когда использовать | Токены | Риск |
|---|---|---:|---|
| `target-local-ds` | DS components уже скопированы в target file | low | лучший вариант: используем локальные node IDs target-файла |
| `reconstruct-from-contracts` | deprecated | blocked | запрещен для product UI макетов; может использоваться только как явно помеченный technical fallback, если пользователь просит схему или audit artifact |
| `write-in-source-ds-file` | пользователь явно разрешил писать в community/source copy | low | не рекомендуется для исходной DS |
| `import-library-components` | DS опубликована как library и доступна target-файлу | medium | требует отдельной настройки library/import |

Рекомендуемый режим для следующего шага: `target-local-ds` или `import-library-components`. Если нужного компонента нет, создать только точечный gap-компонент и продолжить сборку экранов из существующей DS. `reconstruct-from-contracts` не использовать для продуктовых макетов.

## Screen build matrix

| Screen | Flow | Основные shadcn компоненты | Source DS IDs |
|---|---|---|---|
| `01 Дом / обзор объекта A3` | F01, F02 | `Card`, `Badge`, `Button`, `Item`, `Tabs` | `Card 73:4333`, `Badge 73:3479`, `Button 402:654`, `Item 1196:924`, `Tabs 76:10755` |
| `02 Оплата / статус поставщика` | F02 | `Card`, `Button`, `Badge`, `Item`, `Separator` | `Card 73:4333`, `Button 402:654`, `Badge 73:3479`, `Item 1196:924`, `Separator 76:10202` |
| `03 Счетчики / передача и ошибка` | F03 | `Input`, `Button`, `Badge`, `Card`, `Tooltip` | `Input 76:8518`, `Button 402:654`, `Badge 73:3479`, `Card 73:4333`, `Tooltip 79:11350` |
| `04 Поставщики / источники данных A3` | F02, F05 | `Item`, `Badge`, `Table`, `Button`, `Card` | `Item 1196:924`, `Badge 73:3479`, `Table 76:10620`, `Button 402:654`, `Card 73:4333` |
| `05 УК и аварийная / быстрый контакт` | F04 | `Card`, `Button`, `Badge`, `Textarea`, `Dialog` | `Card 73:4333`, `Button 402:654`, `Badge 73:3479`, `Textarea 76:10807`, `Dialog 74:7828` |
| `06 Несколько объектов / семейная оплата` | F06 | `Card`, `Tabs`, `Switch`, `Checkbox`, `Button`, `Item` | `Card 73:4333`, `Tabs 76:10755`, `Switch 76:10548`, `Checkbox 73:4564`, `Button 402:654`, `Item 1196:924` |

## Component ID pack

| Component | Primary frame ID | Preferred local usage |
|---|---|---|
| `Button` | `402:654` | CTA, secondary action, destructive/error action; source set has property-definition errors, use child-name variant contract |
| `Card` | `73:4333` | Object summary, bill, meter, provider, emergency panels |
| `Badge` | `73:3479` | Status chips: `банк принял`, `ожидается квитирование`, `требует исправления` |
| `Item` | `1196:924` | Provider rows, object rows, document/status rows |
| `Input` | `76:8518` | Meter values, account/address entry |
| `Textarea` | `76:10807` | УК request body / comment |
| `Checkbox` | `73:4564` | Consent and limited access permissions |
| `Switch` | `76:10548` | Family reminders and access toggles |
| `Tabs` | `76:10755` | Objects / bills / meters segmentation |
| `Table` | `76:10620` | Provider source and reconciliation table |
| `Dialog` | `74:7828` | Payment status explanation / request confirmation |
| `Tooltip` | `79:11350` | Source explanation for ambiguous statuses |
| `Separator` | `76:10202` | Status timeline separation |

## Write plan

1. В target file `dL70YFBGi981ETZX2hcxBp` создать новую страницу `A3 Home Services / shadcn DS`.
2. Если target-local DS уже есть: найти только локальные component names по exact list из `Component ID pack`, сохранить target node IDs в `figma-shadcn-target-id-map.json`.
3. Если target-local DS нет: остановиться и выбрать `import-library-components` или создать только недостающий компонент-gap. Не собирать локальный мини-kit из shadcn-like компонентов.
4. Собрать 6 mobile frames шириной `390`, с Auto Layout и русским видимым текстом.
5. Создать `Evidence to output map`, где каждая карточка связана с F01-F06.
6. Выполнить metadata/object inventory проверку target page. Screenshot QA делать только после записи, не перед ней.

## Figma write result

Дата записи: 2026-06-27
Target file: `https://www.figma.com/design/dL70YFBGi981ETZX2hcxBp`
Page: `A3 Home Services / shadcn DS fixed`
Wrapper node: `10:3`
Screen nodes: `10:7`, `10:13`, `10:19`, `10:25`, `10:31`, `10:37`
Mode used: `reconstruct-from-contracts`

Что создано:

- 6 mobile screens по F01-F06.
- Fixed-layout Figma board, чтобы избежать схлопывания auto-layout при быстрой записи.
- Карта доказательств и покрытия.
- Видимый текст проверен на Russian Publication Gate: `passed_for_visible_ui`.

Verification:

- Первый auto-layout вариант был удален после screenshot QA из-за схлопывания карточек.
- Исправленный fixed-layout вариант проверен screenshot-ом wrapper node `10:3`; явных overlap/обрезок на общем board screenshot не найдено.

## Future Iteration Rule

Для будущих продуктовых макетов режим `reconstruct-from-contracts` запрещен. Нужен UI-first route: найти/import existing DS components, собрать реальные app screens, а недостающие элементы создавать точечно как gap-компоненты.
- `target-local-ds`: сначала ищем/используем локальную копию DS в target file и работаем по target-local node IDs.
- `new file`: создаем отдельный Figma file под shadcn-версию экранов.
