# Технический аудит дизайн-системы Figma

## Статус

`partial` (частично выполнен)

## Использованные исходные данные (Inputs Used)

- [README.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/README.md)
- [token-map.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/token-map.md)
- [component-map.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/component-map.md)
- [variants-and-states-policy.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/variants-and-states-policy.md)
- [ds-baseline-policy.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/ds-baseline-policy.md)

## Переменные и токены (Variables And Tokens)

- Базовые токены цвета извлечены и сопоставлены.
- Токены палитры цветов извлечены и сопоставлены.
- Токены типографики извлечены из предоставленного пользователем экспорта стилей Figma и сопоставлены.
- Токены эффектов/теней извлечены из предоставленного пользователем экспорта стилей Figma и сопоставлены.
- Токены скругления границ извлечены из предоставленного пользователем экспорта токенов Figma и сопоставлены.
- Токены отступов извлечены из предоставленного пользователем экспорта токенов Figma и сопоставлены.
- Токены размеров компонентов извлечены из предоставленного пользователем экспорта токенов Figma и сопоставлены.

## Компоненты (Components)

Отраженный аудит компонентов является частичным в [component-map.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/component-map.md); кнопки (`button`), иконки-кнопки (`icon button`), функциональные кнопки (`function button`), чекбоксы (`checkbox`), радио-кнопки (`radio`), переключатели (`switch`), сегментированные элементы управления (`segmented control`), поля ввода (`input`), карточки ввода (`input card`), выпадающие списки (`select`), многострочные поля ввода (`textarea`), контекстные меню (`dropdown`), подсказки (`tooltip`), всплывающие уведомления (`toast`), встроенные уведомления (`inline notification`), хлебные крошки (`breadcrumbs`) и чипы (`chips`) извлечены и реализованы, в то время как теги, карточки/панели, оставшиеся элементы навигации и другие оверлеи находятся в ожидании реализации.

## Маппинг фронтенда (Frontend Mapping)

Базовые токены, палитра цветов, типографика, эффекты, скругления границ, отступы и токены размеров сопоставлены с пользовательскими свойствами CSS в [apps/frontend/src/styles.css](file:///c:/Project/product-agent-studio/apps/frontend/src/styles.css).

Ручной предпросмотр компонентов доступен в [apps/frontend/src/components-playground.tsx](file:///c:/Project/product-agent-studio/apps/frontend/src/components-playground.tsx) через роут `/components` на локальном сервере разработки фронтенда.

Имена служебных классов Figma для типографики и эффектов также реализованы в [apps/frontend/src/styles.css](file:///c:/Project/product-agent-studio/apps/frontend/src/styles.css):

- `.text-style-*` для стилей дисплеев, заголовков, тела документа, описаний и мобильных текстов.
- `.effect-style-*` для стилей теней сверху/снизу и сброса теней.
- `.a3-checkbox*` для набора компонентов Figma `Checkbox`.
- `.a3-radio*` для набора компонентов Figma `RadioButton`.
- `.a3-switch*` для набора компонентов Figma `Switch`.
- `.a3-segmented-control*` и `.a3-segment*` для наборов компонентов Figma `SegmentedControl` и `Elements / Segment`.
- `.a3-button*` для набора компонентов Figma `Button`.
- `.a3-icon-button*` для набора компонентов Figma `IconButton`.
- `.a3-function-button*` для набора компонентов Figma `FunctionButton`.
- `.a3-input*` для набора компонентов Figma `Input`.
- `.a3-input-card*` для набора компонентов Figma `InputCard`.
- `.a3-select*` для набора компонентов Figma `Select`.
- `.a3-textarea*` для набора компонентов Figma `TextArea`.
- `.a3-dropdown*` для наборов компонентов Figma `DropdownMenu` и `Elements / Item`.
- `.a3-tooltip*` для наборов компонентов Figma `Tooltip`, `Elements / Layout Tooltip` и `Pointer container`.
- `.a3-toast*` для набора компонентов Figma `Toast`.
- `.a3-inline-notification*` для набора компонентов Figma `InlineNotification`.
- `.a3-breadcrumb*` для наборов компонентов Figma `Breadcrumbs`, элемента хлебных крошек и кнопки "еще".
- `.a3-chip*` для набора компонентов Figma `Chips`.

## Риски (Risks)

- В текущем API-токене Figma отсутствует `file_variables:read`; значения токенов извлекались на основе визуальной структуры фреймов, а не канонического Figma Variables API.
- `Mont` сопоставлен как основной шрифт дизайн-системы, но файл/импорт шрифта еще не интегрирован в бандл; CSS откатывается к Inter/системным шрифтам.

## Следующие шаги (Next Actions)

- Извлечь следующие варианты и состояния компонентов из Figma, используя [variants-and-states-policy.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/variants-and-states-policy.md).
- Сопоставить существующие компоненты фронтенда с принятыми токенами дизайн-системы в рамках контролируемой миграции.
- Использовать [ds-baseline-policy.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/ds-baseline-policy.md) при запуске новых проектов с нуля для обеспечения стандартных коллекций переменных.
