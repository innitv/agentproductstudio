# Карта компонентов Figma

## Статус

`partial_component_extraction` (частичное извлечение компонентов)

## Использованные исходные данные (Inputs Used)

- [design/figma/a3-design-system/README.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/README.md)
- [design/figma/a3-design-system/token-map.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/token-map.md)
- [design/figma/a3-design-system/design-system-audit.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/design-system-audit.md)
- Нода Figma `396:1320` для `DropdownMenu`
- Нода Figma `387:1282` для `Elements / Item`
- Нода Figma `234:38` для `Chips`
- Нода Figma `608:662` для `Switch`
- Нода Figma `644:2504` для `Select`
- Нода Figma `635:2327` для `TextArea`
- Нода Figma `627:1899` для `SegmentedControl`
- Нода Figma `626:11` для `Elements / Segment`
- Нода Figma `588:239` для `RadioButton`
- Нода Figma `615:14` для `Tooltip`
- Нода Figma `976:6677` для `Elements / Layout Tooltip`
- Нода Figma `975:6109` для `Pointer container`
- Нода Figma `725:248` для `Toast`
- Нода Figma `579:4735` для `InlineNotification`
- Нода Figma `779:23829` для `IconButton`
- Нода Figma `579:2942` для `FunctionButton`
- Нода Figma `382:1472` для `Breadcrumbs`
- Нода Figma `382:809` для `Elements / Breadcrumb / Neutral`
- Нода Figma `239:997` для `Elements / More Button / Neutral`
- Ноды Figma `813:27491`, `813:27490` для текущих вариантов хлебных крошек
- Нода Figma `638:1979` для `InputCard`

## Примечания (Notes)

- Извлечено и сопоставлено со спецификациями соответствующих наборов компонентов Figma: Checkbox, radio, switch, segmented control, button, icon button, function button, input, input card, select, textarea, dropdown, tooltip, toast, inline notification, breadcrumbs и chips.
- Продолжайте работу с конкретных фреймов библиотеки компонентов Figma или страниц компонентов Dev Mode.
- Базовые токены дизайн-системы доступны для маппинга компонентов: цвета, типографика, эффекты, скругления, отступы и размеры компонентов.

## Цели извлечения (Extraction Targets)

| Область (Area) | Статус (Status) | Примечания (Notes) |
|---|---|---|
| Кнопки (Buttons) | completed | Наборы компонентов Button, IconButton и FunctionButton извлечены и реализованы. |
| Поля ввода / Выпадающие списки / Текстовые области | completed | Input, InputCard, select и textarea извлечены и реализованы. |
| Элементы управления (Controls) | completed | Checkbox, radio, switch и segmented control извлечены и реализованы. |
| Контекстные меню (Dropdown / Menu) | completed | DropdownMenu и Elements / Item извлечены и реализованы. |
| Теги / Чипы (Tags / Chips) | partial | Chips извлечены и реализованы; теги ожидают реализации. |
| Карточки / Панели (Cards / Panels) | pending | Сопоставить радиус, тень, отступы и цвета поверхностей. |
| Навигация (Navigation) | partial | Хлебные крошки Breadcrumbs извлечены и реализованы; сопоставить оставшиеся компоненты навигации. |
| Оверлеи (Overlays) | partial | Подсказка Tooltip извлечена и реализована; другие оверлеи ожидают реализации. |
| Обратная связь (Feedback) | partial | Toast и InlineNotification извлечены и реализованы; алерты и паттерны размещения уведомлений ожидают реализации. |

---

## Checkbox (Чекбокс)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=221-3095&m=dev
- Figma нода: `221:3095`
- Figma сущность: `COMPONENT_SET | Checkbox`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `label text#221:1` | text | default `Label` |
| `label#221:2` | boolean | default `true` |
| `size` | variant | `s`, `xs`; default `s` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |
| `checked` | variant | `false`, `true`; default `false` |
| `indeterminate` | variant | `false`, `true`; default `false` |

### Визуальный маппинг (Visual Mapping)

| Состояние Figma (Figma state) | Размер (Size) | Фрейм / Визуальные значения | Лейбл (Label) | Маппинг кода (Code mapping) |
|---|---:|---|---|---|
| default unchecked | `s` | `20x20`, радиус `4`, обводка `rgba(124, 138, 158, 0.25)` ширина `2` | `16/24`, `rgba(44, 46, 43, 1)` | `.a3-checkbox--s`, неотмеченный input |
| default unchecked | `xs` | `16x16`, радиус `4`, обводка `rgba(124, 138, 158, 0.25)` ширина `2` | `14/20`, `rgba(44, 46, 43, 1)` | `.a3-checkbox--xs`, неотмеченный input |
| hover unchecked | `s/xs` | тот же размер, обводка `rgba(124, 138, 158, 0.5)` | дефолтный лейбл | `.a3-checkbox:hover` |
| checked | `s/xs` | заливка `--base-accent`, прозрачная обводка, белая иконка галочки | дефолтный лейбл | `input:checked` |
| checked hover | `s/xs` | заливка `--accent-600`, прозрачная обводка, белая иконка галочки | дефолтный лейбл | `input:checked` + hover |
| indeterminate | `s/xs` | заливка `--base-accent`, прозрачная обводка, белая иконка минуса | дефолтный лейбл | свойство `indeterminate` / `data-indeterminate` |
| disabled unchecked | `s/xs` | заливка `rgba(124, 138, 158, 0.15)`, прозрачная обводка | `rgba(124, 138, 158, 0.8)` | `disabled` |
| disabled checked / mixed | `s/xs` | заливка `rgba(124, 138, 158, 0.15)`, иконка `rgba(124, 138, 158, 0.8)` | `rgba(124, 138, 158, 0.8)` | `disabled` + checked/mixed |

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Checkbox` | `apps/frontend/src/components/ui/checkbox.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-checkbox*` |
| Нативная доступность (A11y) | `<input type="checkbox">` внутри `<label>` |
| Смешанное состояние (Mixed state) | Свойство `indeterminate` устанавливает DOM-свойство `input.indeterminate` и `aria-checked="mixed"` |
| Размер `s` | `--checkbox-size-s-box: 20px`, `--checkbox-size-s-height: 24px` |
| Размер `xs` | `--checkbox-size-xs-box: 16px`, `--checkbox-size-xs-height: 20px` |
| Радиус скругления | `--checkbox-radius: var(--border-radius-s)` |
| Зазор (Gap) | `--checkbox-gap: var(--spacing-1-5x)` |

---

## Radio (Радио-кнопка)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=588-239&m=dev
- Figma нода: `588:239`
- Figma сущность: `COMPONENT_SET | RadioButton`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `label#588:2` | boolean | default `true` |
| `lable text#588:3` | text | default `Label` |
| `size` | variant | `s`, `xs`; default `s` |
| `variant` | variant | `primary`; default `primary` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |
| `checked` | variant | `no`, `yes`; default `no` |

### Визуальный маппинг (Visual Mapping)

| Состояние Figma (Figma state) | Размер (Size) | Круг (Circle) | Лейбл (Label) | Маппинг кода (Code mapping) |
|---|---:|---|---|---|
| default unchecked | `s` | `22x22`, обводка `rgba(124, 138, 158, 0.25)` ширина `2`, радиус full | `16/24`, вес `600`, `--neutral-1000` | `.a3-radio--s`, неотмеченный input |
| default unchecked | `xs` | `20x20`, обводка `rgba(124, 138, 158, 0.25)` width `2`, радиус full | `14/20`, вес `600`, `--neutral-1000` | `.a3-radio--xs`, неотмеченный input |
| hover unchecked | `s/xs` | обводка `rgba(124, 138, 158, 0.5)` | дефолтный лейбл | `.a3-radio:hover` |
| checked | `s` | заливка `--base-accent`, белая точка `8x8` | дефолтный лейбл | `input:checked` |
| checked | `xs` | заливка `--base-accent`, белая точка около `7x7` | дефолтный лейбл | `input:checked` |
| checked hover | `s/xs` | заливка `--accent-600`, белая точка | дефолтный лейбл | `input:checked` + hover |
| disabled unchecked | `s/xs` | заливка `rgba(124, 138, 158, 0.15)`, прозрачная обводка | `rgba(124, 138, 158, 0.8)` | `disabled` |
| disabled checked | `s/xs` | заливка disabled, точка `rgba(124, 138, 158, 0.8)` | disabled лейбл | `disabled` + checked |

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `RadioButton` | `apps/frontend/src/components/ui/radio.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-radio*` |
| Нативная доступность (A11y) | `<input type="radio">` внутри `<label>` |
| Размеры | `size="s"`, `xs` |
| Состояние Checked | нативные `checked` / `defaultChecked` |
| Состояние Disabled | нативный `disabled` плюс `data-disabled` |
| Лейбл | свойство `label` |
| Имя/Группировка | нативное свойство `name` |

---

## Button (Кнопка)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=213-183&m=dev
- Figma нода: `213:183`
- Figma сущность: `COMPONENT_SET | Button`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `icon#213:0` | boolean | default `false` |
| `action icon#213:5` | boolean | default `false` |
| `icon variant#213:10` | instance swap | дефолтный компонент иконки |
| `action icon variant#213:15` | instance swap | дефолтный компонент иконки |
| `Label text#213:20` | text | default `Button label` |
| `size` | variant | `xl`, `l`, `m`, `s`; default `xl` |
| `variant` | variant | `primary`, `secondary`, `outline`, `ghost`; default `primary` |
| `colorScheme` | variant | `accent`; default `accent` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |

### Визуальный маппинг (Visual Mapping)

| Вариант Figma | Обычное (Default) | Наведение (Hover) | Нажатие (Pressed) | Отключено (Disabled) |
|---|---|---|---|---|
| `primary` | bg `--base-accent`, fg `--neutral-0` | bg `--accent-600` | bg `--accent-700` | bg `rgba(124, 138, 158, 0.15)`, fg `rgba(124, 138, 158, 0.8)` |
| `secondary` | bg `rgba(83, 151, 235, 0.12)`, fg `--base-accent` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.3)`, fg `--accent-700` | bg disabled, fg disabled |
| `outline` | bg transparent, border `--accent-200`, fg `--base-accent` | bg `rgba(83, 151, 235, 0.12)`, border `--accent-400`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.2)`, border `--accent-400`, fg `--accent-700` | bg transparent, border disabled, fg disabled |
| `ghost` | bg transparent, fg `--base-accent` | bg `rgba(83, 151, 235, 0.12)`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-700` | bg transparent, fg disabled |

| Размер | Высота (Height) | Текст (Text) | Иконка (Icon) | Класс кода (Code class) |
|---|---:|---|---:|---|
| `xl` | `56px` | `16/24`, вес `700` | `24px` | `.a3-button--xl` |
| `l` | `48px` | `16/24`, вес `700` | `24px` | `.a3-button--l` |
| `m` | `36px` | `14/20`, вес `700` | `20px` | `.a3-button--m` |
| `s` | `24px` | `12/16`, вес `700` | `16px` | `.a3-button--s` |

Общие визуальные значения:

- Радиус скругления: `6px` / `--border-radius-buttons`.
- Ширина обводки для вариантов типа outline: `2px`.
- Слоты для ведущей/закрывающей иконки поддерживаются в коде как `leadingIcon` и `actionIcon`.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Button` | `apps/frontend/src/components/ui/button.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-button*` |
| Варианты (Variants) | `variant="primary"`, `secondary`, `outline`, `ghost` |
| Размеры (Sizes) | `size="xl"`, `l`, `m`, `s` |
| Устаревшие алиасы | `variant="default"` -> primary, `size="default"` -> m, `sm` -> s, `lg` -> l |
| Ведущая иконка | свойство `leadingIcon` |
| Закрывающая иконка | свойство `actionIcon` |

---

## Breadcrumbs (Хлебные крошки)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=382-1472&m=dev
- Figma нода: `382:1472`
- Figma сущность: `COMPONENT_SET | Breadcrumbs`
- Нода элемента: `382:809`
- Сущность элемента: `COMPONENT_SET | Elements / Breadcrumb / Neutral`
- Нода кнопки "ещё": `239:997`
- Сущность кнопки "ещё": `COMPONENT_SET | Elements / More Button / Neutral`
- Текущие ноды крошек: `813:27491`, `813:27490`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

Хлебные крошки (Breadcrumbs):

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `2 crumbs#813:0` | boolean | default `true` |
| `3 crumbs#813:3` | boolean | default `true` |
| `4 crumbs#813:6` | boolean | default `true` |
| `current crumb#813:9` | boolean | default `true` |
| `hidden crumbs` | variant | `true`, `false`; default `false` |
| `colorScheme` | variant | `neutral`; default `neutral` |

Элемент хлебных крошек (Breadcrumb item):

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `hover` | variant | `false`, `true`; default `false` |
| `colorScheme` | variant | `secondary`; default `secondary` |

Кнопка "ещё" (More button):

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `state` | variant | `default`, `hover`, `active`; default `default` |
| `active` | variant | `false`, `true`; default `false` |
| `colorScheme` | variant | `neutral`; default `neutral` |

### Визуальный маппинг (Visual Mapping)

| Часть / состояние | Визуальные значения | Маппинг кода (Code mapping) |
|---|---|---|
| Текст крошки | Mont `12/16`, вес `700`, `--neutral-1000` | `.a3-breadcrumb` |
| Текущая нейтральная крошка | Mont `12/16`, вес `700`, `--neutral-300` | `current` элемент |
| Разделительная точка | `3x3`, `--neutral-1000` | `BreadcrumbSeparator` |
| Кнопка "ещё" по умолчанию | `24x24`, радиус `8px`, прозрачный фон, иконка `--neutral-1000` | `BreadcrumbMoreButton` |
| Кнопка "ещё" ховер | bg `rgba(124, 138, 158, 0.1)`, иконка `--neutral-600` | CSS `:hover` |
| Кнопка "ещё" активна | bg `rgba(124, 138, 158, 0.2)`, иконка `--neutral-700`, выпадающий список открыт | `open` / `active` |
| Скрытое меню | ширина dropdown `120px`, размер элемента `s` | скрытые элементы рендерятся через `Dropdown` |

Примечание по реализации (Implementation note):

- Figma предоставляет переключатели для 2/3/4/текущих крошек, но фронтенд принимает произвольный массив `items`.
- Свернутые хлебные крошки представлены в `hiddenItems`; когда они переданы, рендерятся первый видимый элемент, кнопка "еще" и оставшиеся видимые элементы.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Breadcrumbs` | `apps/frontend/src/components/ui/breadcrumbs.tsx` `Breadcrumbs` |
| Component set `Elements / Breadcrumb / Neutral` | `BreadcrumbLink` |
| Component set `Elements / More Button / Neutral` | `BreadcrumbMoreButton` |
| Разделитель в виде точки | `BreadcrumbSeparator` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-breadcrumb*` |
| Скрытые крошки | свойство `hiddenItems` |
| Текущая крошка | элемент `current: true` и `aria-current="page"` |
| Выпадающее меню | Повторно использует `Dropdown` и `DropdownItem` |

---

## IconButton (Иконка-кнопка)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=779-23829&m=dev
- Figma нода: `779:23829`
- Figma сущность: `COMPONENT_SET | IconButton`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `icon variant#782:0` | instance swap | дефолтная иконка меню kebab |
| `size` | variant | `xl`, `l`, `m`, `s`; default `xl` |
| `variant` | variant | `primary`, `secondary`, `outline`, `ghost`; default `primary` |
| `colorScheme` | variant | `accent`, `neutral`; default `accent` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |

### Визуальный маппинг (Visual Mapping)

| Вариант / схема | Обычное (Default) | Наведение (Hover) | Нажатие (Pressed) | Отключено (Disabled) |
|---|---|---|---|---|
| `primary / accent` | bg `--base-accent`, fg `--neutral-0` | bg `--accent-600` | bg `--accent-700` | bg disabled, fg disabled |
| `primary / neutral` | bg `--base-neutral`, fg `--neutral-0` | bg `--neutral-600` | bg `--neutral-700` | bg disabled, fg disabled |
| `secondary / accent` | bg `rgba(83, 151, 235, 0.12)`, fg `--base-accent` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-600` | bg `rgba(83, 151, 235, 0.3)`, fg `--accent-700` | bg disabled, fg disabled |
| `secondary / neutral` | bg `rgba(124, 138, 158, 0.1)`, fg `--base-neutral` | bg `rgba(124, 138, 158, 0.2)`, fg `--neutral-600` | bg `rgba(124, 138, 158, 0.3)`, fg `--neutral-700` | bg disabled, fg disabled |
| `outline / accent` | bg transparent, border `--accent-200`, fg `--base-accent` | bg accent subtle, border `--accent-400`, fg `--accent-600` | bg stronger subtle, fg `--accent-700` | прозрачный bg, disabled border/fg |
| `outline / neutral` | bg transparent, border neutral subtle, fg `--base-neutral` | bg neutral subtle, border stronger, fg `--neutral-600` | bg stronger neutral subtle, fg `--neutral-700` | прозрачный bg, disabled border/fg |
| `ghost / accent` | bg transparent, fg `--base-accent` | bg accent subtle, fg `--accent-600` | bg stronger subtle, fg `--accent-700` | прозрачный bg, disabled fg |
| `ghost / neutral` | bg transparent, fg `--base-neutral` | bg neutral subtle, fg `--neutral-600` | bg stronger neutral subtle, fg `--neutral-700` | прозрачный bg, disabled fg |

| Размер | Фрейм кнопки | Иконка (Icon) | Класс кода (Code class) |
|---|---:|---:|---|
| `xl` | `56x56` | `24px` | `.a3-icon-button--xl` |
| `l` | `48x48` | `24px` | `.a3-icon-button--l` |
| `m` | `36x36` | `24px` | `.a3-icon-button--m` |
| `s` | `24x24` | `16px` | `.a3-icon-button--s` |

Общие визуальные значения:

- Радиус скругления: `6px` / `--border-radius-buttons`.
- Ширина обводки outline: `2px`.
- Кнопки, содержащие только иконки, требуют доступного текстового описания через свойство `aria-label` при использовании.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `IconButton` | `apps/frontend/src/components/ui/icon-button.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-icon-button*` |
| Варианты (Variants) | `variant="primary"`, `secondary`, `outline`, `ghost` |
| Цветовые схемы | `colorScheme="accent"`, `neutral` |
| Размеры (Sizes) | `size="xl"`, `l`, `m`, `s` |
| Устаревшие алиасы | `variant="default"` -> primary, `size="default"` -> m, `sm` -> s, `lg` -> l |
| Слот иконки | обязательное свойство `icon` |

---

## FunctionButton (Функциональная кнопка)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=579-2942&m=dev
- Figma нода: `579:2942`
- Figma сущность: `COMPONENT_SET | FunctionButton`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `label#579:0` | boolean | default `true` |
| `label text#579:25` | text | default `Label` |
| `icon#579:50` | boolean | default `true` |
| `icon variant#579:75` | instance swap | дефолтный компонент иконки |
| `action icon#778:50` | boolean | default `false` |
| `action icon variant#778:59` | instance swap | дефолтная иконка действия |
| `variant` | variant | `primary`, `secondary`, `tertiary`; default `primary` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |
| `iconPosition` | variant | `left`; default `left` |

### Визуальный маппинг (Visual Mapping)

| Вариант / состояние | Цвет текста и иконки | Маппинг кода (Code mapping) |
|---|---|---|
| `primary / default` | `--base-accent` | `variant="primary"` |
| `secondary / default` | `--neutral-1000` | `variant="secondary"` |
| `tertiary / default` | `--neutral-300`; иконка действия сохраняет цвет текста в Figma | `variant="tertiary"` |
| `hover` | `--accent-600` | CSS `:hover` |
| `pressed` | `--accent-700` | CSS `:active` |
| `disabled` | `rgba(124, 138, 158, 0.8)` | нативный `disabled` |

Общие визуальные значения:

- Высота: `24px`.
- Текст: Mont `14/20`, вес `600`.
- Слоты для ведущей иконки / иконки действия: `24px`.
- Без заливки, без обводки; кнопка представляет собой компактную функциональную надпись с иконкой.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `FunctionButton` | `apps/frontend/src/components/ui/function-button.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-function-button*` |
| Варианты | `variant="primary"`, `secondary`, `tertiary` |
| Ведущая иконка | свойство `icon` |
| Надпись | `children` |
| Иконка действия | свойство `actionIcon` |

---

## Input (Поле ввода)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=492-2765&m=dev
- Figma нода: `492:2765`
- Figma сущность: `COMPONENT_SET | Input`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `hint#492:6` | boolean | default `false` |
| `lebel#492:7` | boolean | default `true` |
| `iconLeft#492:8` | boolean | default `false` |
| `iconRight#492:9` | boolean | default `false` |
| `iconLeft variant#492:10` | instance swap | дефолтная иконка поиска |
| `iconRight variant#492:11` | instance swap | дефолтная иконка закрытия |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `filled`, `error`, `disabled`; default `default` |
| `value` | variant | `none`, `placeholder`, `filled`; default `none` |

### Визуальный маппинг (Visual Mapping)

| Состояние | Контейнер | Лейбл (Label) | Текст поля (Field text) |
|---|---|---|---|
| `default` | bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | `--neutral-700` | `--neutral-1000` |
| `hover` | bg `--neutral-0`, border `rgba(124, 138, 158, 0.5)` | `--neutral-700` | `--neutral-1000` |
| `focus` | bg `--neutral-0`, border `--accent-400`, фокус-кольцо `rgba(83, 151, 235, 0.1)` | `--base-accent` | `--neutral-1000` |
| `filled` | аналогично default | `--neutral-700` | `--neutral-1000` |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | `--base-error` | `--neutral-1000` |
| `disabled` | bg `rgba(124, 138, 158, 0.15)`, прозрачная рамка | `rgba(124, 138, 158, 0.8)` | disabled fg |

| Размер | Высота управления | Текст (Text) | Иконка (Icon) | Класс кода (Code class) |
|---|---:|---|---:|---|
| `l` | `48px` | `16/24`, вес `600` | `24px` | `.a3-input--l` |
| `m` | `36px` | `14/20`, вес `600` | `20px` | `.a3-input--m` |
| `s` | `24px` | `12/16`, вес `600` | `16px` | `.a3-input--s` |

Общие визуальные значения:

- Ширина в примерах Figma: `280px`.
- Радиус скругления: `6px` / `--border-radius-inputs`.
- Ширина обводки рамки: `2px`.
- Текст подсказки/счетчика: `12/16`, вес `600`, `--neutral-300`.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Input` | `apps/frontend/src/components/ui/input.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-input*` |
| Размеры | `size="l"`, `m`, `s` |
| Состояние ошибки | свойство `invalid` и `aria-invalid` |
| Состояние отключения | нативный `disabled` плюс `data-disabled` |
| Состояние фокуса | CSS `:focus-within` |
| Лейбл | свойство `label` с `htmlFor` |
| Подсказка (Hint) | свойство `hint` с `aria-describedby` |
| Счетчик (Counter) | свойство `counter` с `aria-describedby` |
| Левая/правая иконки | свойства `leftIcon`, `rightIcon` |

---

## InputCard (Карточка ввода)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=638-1979&m=dev
- Figma нода: `638:1979`
- Figma сущность: `COMPONENT_SET | InputCard`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `hint#492:6` | boolean | default `false` |
| `lebel#492:7` | boolean | default `true` |
| `iconRight#492:9` | boolean | default `false` |
| `iconRight variant#492:11` | instance swap | дефолтная иконка закрытия |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `filled`, `error`, `disabled default`, `disabled filled`; default `default` |
| `placeholder` | variant | `false`, `true`; default `false` |

### Визуальный маппинг (Visual Mapping)

| Состояние | Контейнер | Лейбл / Значение | Поведение иконки |
|---|---|---|---|
| `default` | в стиле input bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | лейбл `--neutral-700`, placeholder `--neutral-300`, значение `--neutral-1000` | иконка банковской карты слева |
| `hover` | border `rgba(124, 138, 158, 0.5)` или акцентный фокус в плейсхолдерах | лейбл может стать `--base-accent` в некоторых вариантах | так же |
| `focus` | border `--accent-400`, фокус-кольцо `rgba(83, 151, 235, 0.1)` | лейбл `--base-accent` | так же |
| `filled` | стандартный контейнер | иконка бренда карты может заменить дефолтную иконку | свойство `brandIcon` |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | лейбл `--base-error` | так же |
| `disabled default` | bg `rgba(124, 138, 158, 0.15)`, прозрачная рамка | лейбл/placeholder в цвете disabled | отключено |
| `disabled filled` | bg disabled | лейбл/значение в цвете disabled, иконка бренда сохраняется | отключено |

| Размер | Высота управления | Текст (Text) | Иконка (Icon) | Класс кода (Code class) |
|---|---:|---|---:|---|
| `l` | `48px` | `16/24`, вес `600`; внутри лейбла `12/16` в заполненном/placeholder режимах | `24px` | `.a3-input-card--l` |
| `m` | `36px` | `14/20`, вес `600` | `20px` | `.a3-input-card--m` |
| `s` | `24px` | `12/16`, вес `600` | `16px` | `.a3-input-card--s` |

Общие визуальные значения:

- Ширина в примерах Figma: `280px`.
- Радиус скругления: `6px` / `--border-radius-inputs`.
- Ширина обводки рамки: `2px`.
- Нижняя подсказка/счетчик: `12/16`, вес `600`.
- Компонент повторно использует токены цвета, рамки, фокуса, отключения и ошибок из input.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `InputCard` | `apps/frontend/src/components/ui/input-card.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-input-card*` |
| Токены Input | Повторно использует `--input-*` цвета, скругление, рамку и фокус |
| Размеры | `size="l"`, `m`, `s` |
| Дефолтная иконка | стандартная иконка `CreditCard` |
| Заполненная иконка бренда | свойство `brandIcon` |
| Правая иконка / Очистка | свойство `rightIcon` или действие `onClear` |
| Состояние ошибки | свойство `invalid` и `aria-invalid` |
| Состояние отключения | нативный `disabled` плюс `data-disabled` |
| Лейбл | свойство `label` с `htmlFor`; размер `l` рендерит лейбл внутри элемента управления |
| Подсказка | свойство `hint` с `aria-describedby` |
| Счетчик | свойство `counter` с `aria-describedby` |

---

## Textarea (Многострочное поле ввода)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=635-2327&m=dev
- Figma нода: `635:2327`
- Figma сущность: `COMPONENT_SET | TextArea`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `scroll#637:0` | boolean | default `false` |
| `hint#637:40` | boolean | default `true` |
| `label#637:80` | boolean | default `true` |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `error`, `disabled`; default `default` |
| `value` | variant | `none`, `placeholder`, `filled`; default `none` |

### Визуальный маппинг (Visual Mapping)

| Состояние | Контейнер | Лейбл / Значение | Футер (Нижняя часть) |
|---|---|---|---|
| `default` | в стиле input bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | лейбл `--neutral-700`, placeholder `--neutral-300`, значение `--neutral-1000` | подсказка/счетчик `--neutral-300` |
| `hover` | border `rgba(124, 138, 158, 0.5)` | те же цвета текста | так же |
| `focus` | border `--accent-400`, фокус-кольцо `rgba(83, 151, 235, 0.1)` | лейбл `--base-accent` | так же |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | лейбл `--base-error` | подсказка `--base-error`, счетчик приглушен |
| `disabled` | bg `rgba(124, 138, 158, 0.15)`, прозрачная рамка | лейбл/значение `rgba(124, 138, 158, 0.8)` | disabled fg |

| Размер | Высота управления | Текст (Text) | Класс кода (Code class) |
|---|---:|---|---|
| `l` | `104px` | `16/24`, вес `600` | `.a3-textarea--l` |
| `m` | `76px` | `14/20`, вес `600` | `.a3-textarea--m` |
| `s` | `56px` | `12/16`, вес `600` | `.a3-textarea--s` |

Общие визуальные значения:

- Ширина в примерах Figma: `280px`.
- Радиус скругления: `6px` / `--border-radius-inputs`.
- Ширина обводки рамки: `2px`.
- Подсказка/счетчик в футере: `12/16`, вес `600`.
- Полоса прокрутки (scroll): дорожка `rgba(124, 138, 158, 0.1)`, бегунок `--neutral-200`.
- Textarea повторно использует токены цвета, скруглений, рамки, фокуса, отключения и ошибок из input.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `TextArea` | `apps/frontend/src/components/ui/textarea.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-textarea*` |
| Токены триггера | Повторно использует `--input-*` цвета, скругление, рамку и фокус |
| Размеры | `size="l"`, `m`, `s` |
| Состояние ошибки | свойство `invalid` и `aria-invalid` |
| Состояние отключения | нативный `disabled` плюс `data-disabled` |
| Состояние фокуса | CSS `:focus-within` / textarea `:focus` |
| Лейбл | свойство `label` с `htmlFor` |
| Подсказка | свойство `hint` с `aria-describedby` |
| Счетчик | свойство `counter` с `aria-describedby` |
| Скролл (Scroll) | свойство `scroll` применяет цвета полосы прокрутки Figma |

---

## Tooltip (Всплывающая подсказка)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=615-14&m=dev
- Figma нода: `615:14`
- Figma сущность: `COMPONENT_SET | Tooltip`
- Нода шаблона: `976:6677`
- Сущность шаблона: `COMPONENT | Elements / Layout Tooltip`
- Нода стрелки-указателя: `975:6109`
- Сущность стрелки-указателя: `COMPONENT_SET | Pointer container`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

Tooltip:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `closeButton#976:8` | boolean | default `false` |
| `content swap#976:26` | instance swap | default `976:6677` |
| `autoWidth` | variant | `false`, `true`; default `false` |

Elements / Layout Tooltip:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `title#976:24` | boolean | default `true` |
| `subtitle#976:25` | boolean | default `true` |

Pointer container:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `placement` | variant | `Bottom Center`, `Bottom Left`, `Bottom Right`, `Left Bottom`, `Left Center`, `Left Top`, `Top Center`, `Top Left`, `Top Right`, `Right Bottom`, `Right Center`, `Right Top`; default `Bottom Center` |

### Визуальный маппинг (Visual Mapping)

| Часть / состояние | Визуальные значения | Маппинг кода (Code mapping) |
|---|---|---|
| Фиксированная подсказка | ширина `200px`, мин. высота `58px` | `TooltipContent autoWidth={false}` |
| Автоматическая ширина | ширина по контенту, в примере Figma `71px` | свойство `autoWidth` |
| Облако (Bubble) | bg `--neutral-0`, радиус `6px`, тень `--shadow-bottom-m` | `.a3-tooltip` |
| Внутренний отступ | `12px` по горизонтали, `8px` по вертикали | `.a3-tooltip__content` |
| Заголовок (Title) | Mont `14/20`, вес `600`, `--neutral-1000` | свойство `title` / `TooltipLayout` |
| Подзаголовок (Subtitle) | Mont `12/16`, вес `600`, `--neutral-700` | свойство `subtitle` / `TooltipLayout` |
| Кнопка закрытия | `20x20`, радиус `4px`, bg `rgba(124, 138, 158, 0.1)`, иконка `16px` | свойство `closeButton` |
| Верхний/нижний указатель | треугольник `14x8` | свойство `placement` |
| Левый/правый указатель | визуальное направление `8x14` из повернутого треугольника | свойство `placement` |

Поддерживаемые варианты позиционирования (placements) на фронтенде:

- `bottom-center`, `bottom-left`, `bottom-right`
- `top-center`, `top-left`, `top-right`
- `left-center`, `left-top`, `left-bottom`
- `right-center`, `right-top`, `right-bottom`

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Tooltip` | `apps/frontend/src/components/ui/tooltip.tsx` `Tooltip`, `TooltipContent` |
| Component `Elements / Layout Tooltip` | `TooltipLayout` |
| Component set `Pointer container` | CSS-правила позиционирования и стрелки-указателя |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-tooltip*` |
| Авто-ширина | свойство `autoWidth` |
| Кнопка закрытия | свойства `closeButton` и `onClose` |
| Заголовок / подзаголовок | свойства `title`, `subtitle` или кастомное содержимое `content` |
| Позиционирование | свойство `placement` |
| Поведение триггера | обертка при наведении/фокусе через `Tooltip`; независимый рендер контента через `TooltipContent` |

---

## Toast (Всплывающее уведомление)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=725-248&m=dev
- Figma нода: `725:248`
- Figma сущность: `COMPONENT_SET | Toast`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `closeButton#725:0` | boolean | default `true` |
| `Hedaer#725:3` | boolean | default `true` |
| `hedaer text#725:6` | text | default `Header` |
| `subtitle#725:9` | boolean | default `true` |
| `subtitle text#725:12` | text | default `Subtitle` |
| `actionButtons#725:15` | boolean | default `true` |
| `button 1#725:18` | boolean | default `true` |
| `button 2#725:21` | boolean | default `true` |
| `icon#725:24` | boolean | default `true` |
| `colorScheme` | variant | `info`, `success`, `warning`, `error`; default `info` |

### Визуальный маппинг (Visual Mapping)

| Часть / схема | Визуальные значения | Маппинг кода (Code mapping) |
|---|---|---|
| Контейнер Toast | ширина `375px`, мин. высота `112px`, bg `--neutral-0`, радиус `6px`, тень `--shadow-bottom-l` | `.a3-toast` |
| Макет (Layout) | внутренние отступы `12px`, зазор `12px`, левая иконка плюс контент текста/кнопок | корневой flex и сетка контента |
| Контейнер иконки | `48x48`, радиус `6px` | `.a3-toast__icon-container` |
| Иконка Info | bg `rgba(25, 152, 255, 0.1)`, fg `--base-info` | `colorScheme="info"` |
| Иконка Success | bg `rgba(43, 182, 115, 0.1)`, fg `--base-success` | `colorScheme="success"` |
| Иконка Warning | bg `rgba(255, 180, 91, 0.2)`, fg `--base-warning` | `colorScheme="warning"` |
| Иконка Error | bg `rgba(244, 89, 89, 0.1)`, fg `--base-error` | `colorScheme="error"` |
| Заголовок (Header) | Mont `14/20`, вес `700`, `--neutral-1000` | свойство `title` |
| Подзаголовок | Mont `14/20`, вес `600`, `--neutral-700` | свойство `subtitle` |
| Кнопка закрытия | `24x24`, радиус `6px`, bg `rgba(124, 138, 158, 0.1)`, иконка `--base-neutral` | `closeButton` / `onClose` |
| Действия (Actions) | до двух функциональных кнопок Figma, зазор `16px` | свойство `actions` с использованием `FunctionButton` |

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Toast` | `apps/frontend/src/components/ui/toast.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-toast*` |
| Цветовые схемы | `colorScheme="info"`, `success`, `warning`, `error` |
| Слот иконки | свойство `icon`, по умолчанию со стандартными статусными иконками из `lucide-react` |
| Заголовок/подзаголовок | свойства `title` и `subtitle` |
| Кнопка закрытия | свойства `closeButton` и `onClose` |
| Кнопки действий | массив `actions`, рендерится с помощью `FunctionButton` |
| Доступность (A11y) | `role="status"` по умолчанию; `role="alert"` для схемы ошибок `error` |

---

## Inline Notification (Встроенное уведомление)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=579-4735&m=dev
- Figma нода: `579:4735`
- Figma сущность: `COMPONENT_SET | InlineNotification`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `icon container#579:109` | boolean | default `true` |
| `colseButton#579:110` | boolean | default `true` |
| `title#579:111` | boolean | default `true` |
| `title text#579:112` | text | default `Title` |
| `subtitle#579:113` | boolean | default `true` |
| `subtitle text#579:114` | text | default `Subtitle` |
| `button right#579:115` | boolean | default `true` |
| `button left#579:116` | boolean | default `true` |
| `actionButtons#579:117` | boolean | default `true` |
| `colorScheme` | variant | `info`, `warning`, `succes`, `error`; default `info` |

Примечание по реализации (Implementation note):

- Название варианта Figma `succes` нормализовано во фронтенде в `colorScheme="success"`.

### Визуальный маппинг (Visual Mapping)

| Часть / схема | Визуальные значения | Маппинг кода (Code mapping) |
|---|---|---|
| Встроенный контейнер | ширина `375px`, мин. высота `110px`, радиус `6px`, рамка `2px`, без теней | `.a3-inline-notification` |
| Область контента | ширина `327px`, внутренние отступы `12px 16px`, зазор тела/кнопок `16px` | `.a3-inline-notification__content` |
| Контейнер иконки | ширина `48px`, полная высота компонента, иконка `24px` по центру | `.a3-inline-notification__icon-container` |
| Схема Info | border `--info-200`, фон иконки `rgba(25, 152, 255, 0.1)`, иконка `--base-info` | `colorScheme="info"` |
| Схема Success | border `--success-200`, фон иконки `rgba(43, 182, 115, 0.1)`, иконка `--base-success` | `colorScheme="success"` |
| Схема Warning | border `--warning-200`, фон иконки `rgba(255, 180, 91, 0.2)`, иконка `--base-warning` | `colorScheme="warning"` |
| Схема Error | border `--error-200`, фон иконки `rgba(244, 89, 89, 0.1)`, иконка `--base-error` | `colorScheme="error"` |
| Заголовок (Title) | Mont `14/20`, вес `700`, `--neutral-1000` | свойство `title` |
| Подзаголовок | Mont `14/20`, вес `600`, `--neutral-700` | свойство `subtitle` |
| Кнопка закрытия | `24x24`, радиус `6px`, bg `rgba(124, 138, 158, 0.1)`, иконка `--base-neutral` | `closeButton` / `onClose` |
| Действия (Actions) | две кнопки действий Figma, каждая `76x24`, зазор `16px` | свойство `actions` с использованием `FunctionButton` |

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `InlineNotification` | `apps/frontend/src/components/ui/inline-notification.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-inline-notification*` |
| Цветовые схемы | `colorScheme="info"`, `success`, `warning`, `error` |
| Тоггл контейнера иконки | свойство `icon` управляет содержимым иконки; сам контейнер является частью верстки |
| Заголовок/подзаголовок | свойства `title` и `subtitle` |
| Кнопка закрытия | свойства `closeButton` и `onClose` |
| Кнопки действий | массив `actions`, рендерится с помощью `FunctionButton`; поддерживает ведущую иконку и иконку действия |
| Доступность (A11y) | `role="status"` по умолчанию; `role="alert"` для схемы ошибок `error` |

---

## Select (Выпадающий список)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=644-2504&m=dev
- Figma нода: `644:2504`
- Figma сущность: `COMPONENT_SET | Select`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `hint#492:6` | boolean | default `false` |
| `iconLeft#492:8` | boolean | default `false` |
| `iconLeft variant#492:10` | instance swap | дефолтная иконка поиска |
| `DropdownMenu#989:0` | boolean | default `false` |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `state` | variant | `default`, `hover`, `focus`, `error`, `disabled`; default `default` |
| `label` | variant | `true`; default `true` |
| `value` | variant | `none`, `placeholder`, `filled`; default `none` |

### Визуальный маппинг (Visual Mapping)

| Состояние | Контейнер триггера | Лейбл / Значение | Выпадающее меню |
|---|---|---|---|
| `default` | в стиле input bg `--neutral-0`, border `rgba(124, 138, 158, 0.15)` | лейбл `--neutral-700`, placeholder `--neutral-300`, значение `--neutral-1000` | закрыто |
| `hover` | border `rgba(124, 138, 158, 0.5)` | те же цвета текста | закрыто |
| `focus` | border `--accent-400`, фокус-кольцо `rgba(83, 151, 235, 0.1)` | лейбл `--base-accent`, шеврон вверх | `DropdownMenu` появляется под триггером |
| `error` | bg `rgba(244, 89, 89, 0.03)`, border `--error-400` | лейбл/подсказка `--base-error` | закрыто |
| `disabled` | bg `rgba(124, 138, 158, 0.15)`, прозрачная рамка | лейбл/значение `rgba(124, 138, 158, 0.8)` | закрыто |

| Размер | Высота триггера | Текст (Text) | Иконка (Icon) | Класс кода (Code class) |
|---|---:|---|---:|---|
| `l` | `48px` | `16/24`, вес `600` | `24px` | `.a3-select--l` |
| `m` | `36px` | `14/20`, вес `600` | `20px` | `.a3-select--m` |
| `s` | `24px` | `12/16`, вес `600` | `16px` | `.a3-select--s` |

Общие визуальные значения:

- Ширина в примерах Figma: `280px`.
- Радиус скругления: `6px` / `--border-radius-inputs`.
- Ширина обводки рамки: `2px`.
- Текст подсказки: `12/16`, вес `600`.
- Состояние фокуса/открытия повторно использует контракты извлеченных `DropdownMenu` и `Elements / Item`.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Select` | `apps/frontend/src/components/ui/select.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-select*` |
| Токены триггера | Повторно использует `--input-*` переменные размеров, цветов, скруглений, рамки и фокуса |
| Слот DropdownMenu | Повторно использует `Dropdown`, `DropdownItem` из `apps/frontend/src/components/ui/dropdown.tsx` |
| Размеры | `size="l"`, `m`, `s` |
| Состояние ошибки | свойство `invalid` и `aria-invalid` |
| Состояние отключения | нативный `disabled` плюс `data-disabled` |
| Открытый/фокусный статус | `open` / `defaultOpen` и `aria-expanded` |
| Лейбл | свойство `label` |
| Подсказка | свойство `hint` с `aria-describedby` |
| Левая иконка | свойство `leftIcon` |
| Варианты опций | массив `options` с ключами `label`, `value`, опциональными `hint`, `icon`, `disabled` |
| Значение формы | опциональный скрытый инпут через свойство `name` |

---

## Dropdown (Контекстное меню)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=396-1320&m=dev
- Figma нода: `396:1320`
- Figma сущность: `COMPONENT | DropdownMenu`
- Нода внутреннего элемента: `387:1282`
- Сущность внутреннего элемента: `COMPONENT_SET | Elements / Item`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

DropdownMenu:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `top panel#396:13` | boolean | default `false` |
| `bottom panel#396:14` | boolean | default `false` |
| `Elements / ItemsList#891:4` | slot | содержимое списка элементов |
| `scroll#891:5` | boolean | default `false` |
| `Swap top#892:0` | slot | опциональная верхняя панель |
| `Swap bottom#892:1` | slot | опциональная нижняя панель |

Elements / Item:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `prefix slot#387:5` | boolean | default `false` |
| `icon#387:6` | boolean | default `false` |
| `icon variant#387:7` | instance swap | дефолтный компонент иконки |
| `item text#387:8` | text | default `Item text` |
| `hint text#387:9` | text | default `Hint` |
| `hint#398:15` | boolean | default `false` |
| `Swap prefix#894:29` | slot | опциональный контент префикса |
| `type` | variant | `menu item`, `group title`, `group divider`; default `menu item` |
| `size` | variant | `m`, `s`; default `m` |
| `multiselect` | variant | `false`, `true`; default `false` |
| `selected` | variant | `false`, `true`; default `false` |
| `hover` | variant | `false`, `true`; default `false` |
| `disabled` | variant | `false`, `true`; default `false` |

### Визуальный маппинг (Visual Mapping)

| Часть / состояние | Размер | Визуальные значения | Маппинг кода (Code mapping) |
|---|---:|---|---|
| Контейнер Dropdown | `280x212` в примере | bg `--neutral-0`, радиус `6px`, тень `--shadow-bottom-xl` | `.a3-dropdown` |
| Элемент `m` | `280x36`, внутренний `256x36` | текст `14/20`, вес `600`, радиус `6px` | `.a3-dropdown-item--m` |
| Элемент `s` | `280x28` | текст `12/16`, вес `600`, радиус `6px` | `.a3-dropdown-item--s` |
| Элемент по умолчанию | `m/s` | bg transparent, текст `--neutral-1000`, подсказка `--neutral-300` | стандартный `DropdownItem` |
| Элемент при наведении | `m/s` | bg `rgba(124, 138, 158, 0.08)` | CSS `:hover` |
| Выбранный элемент | `m/s` | bg `rgba(83, 151, 235, 0.12)`, fg `--base-accent` | свойство `selected` |
| Выбранный + ховер | `m/s` | bg `rgba(83, 151, 235, 0.2)`, fg `--accent-700` | `selected` + `:hover` |
| Отключенный элемент | `m/s` | прозрачный bg, fg `rgba(124, 138, 158, 0.8)` | нативный `disabled` |
| Множественный выбор | `m/s` | левый слот отметки `16x16`; выбранная галочка использует текущий fg | `multiselect` + `selected` |
| Заголовок группы `m` | `280x32` | текст `12/16`, вес `600`, цвет `--neutral-300` | `DropdownGroupTitle size="m"` |
| Заголовок группы `s` | `280x28` | аналогичный стиль текста | `DropdownGroupTitle size="s"` |
| Разделитель `m` | `280x17` | линия в 1px `rgba(124, 138, 158, 0.25)` | `DropdownDivider size="m"` |
| Разделитель `s` | `280x13` | линия в 1px `rgba(124, 138, 158, 0.25)` | `DropdownDivider size="s"` |
| Прокрутка (Scroll) | дорожка `4x196`, бегунок `4x81.67` | дорожка `rgba(124, 138, 158, 0.1)`, бегунок `--neutral-200` | свойство `scroll` |

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component `DropdownMenu` | `apps/frontend/src/components/ui/dropdown.tsx` `Dropdown` |
| Component set `Elements / Item` | `DropdownItem`, `DropdownGroupTitle`, `DropdownDivider` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-dropdown*` |
| Верхняя панель (Top panel) | свойство `topPanel` |
| Нижняя панель (Bottom panel) | свойство `bottomPanel` |
| Состояние прокрутки | свойство `scroll` |
| Варианты размеров | `size="m"`, `s` |
| Состояние выбора | свойство `selected` и `aria-checked` для множественного выбора |
| Множественный выбор | свойство `multiselect` с зарезервированным слотом отметки |
| Состояние отключения | нативный `disabled` плюс `data-disabled` |
| Слоты иконки / префикса | свойства `icon` и `prefix` |
| Текст подсказки | свойство `hint` |

---

## Chips (Чипы)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=234-38&m=dev
- Figma нода: `234:38`
- Figma сущность: `COMPONENT_SET | Chips`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `label text#234:1` | text | default `Chips` |
| `Icon#777:0` | boolean | default `false` |
| `Icon#777:33` | instance swap | дефолтный компонент иконки |
| `action#1020:0` | boolean | default `false` |
| `action icon#1020:17` | instance swap | дефолтная иконка действия |
| `size` | variant | `m`; default `m` |
| `variant` | variant | `primary`, `secondary`; default `primary` |
| `state` | variant | `default`, `hover`, `pressed`, `disabled`; default `default` |
| `selected` | variant | `false`, `true`; default `false` |

### Визуальный маппинг (Visual Mapping)

| Состояние Figma (Figma state) | Вариант (Variant) | Визуальные значения | Маппинг кода (Code mapping) |
|---|---|---|---|
| default unselected | `primary` | высота `40px`, радиус `24px`, bg `rgba(124, 138, 158, 0.1)`, fg `--neutral-1000` | `variant="primary"` |
| hover unselected | `primary` | bg `rgba(124, 138, 158, 0.2)` | CSS `:hover` |
| pressed unselected | `primary` | bg `rgba(124, 138, 158, 0.3)` | CSS `:active` |
| selected | `primary` | bg `--base-accent`, fg `--neutral-0` | свойство `selected` |
| selected hover | `primary` | bg `--accent-600`, fg `--neutral-0` | `selected` + `:hover` |
| selected pressed | `primary` | bg `--accent-700`, fg `--neutral-0` | `selected` + `:active` |
| disabled | `primary` | bg `rgba(124, 138, 158, 0.15)`, fg `rgba(124, 138, 158, 0.8)` | нативный `disabled` |
| default unselected | `secondary` | bg transparent, border `rgba(124, 138, 158, 0.25)`, fg `--neutral-1000` | `variant="secondary"` |
| hover unselected | `secondary` | bg `rgba(124, 138, 158, 0.1)`, та же рамка | CSS `:hover` |
| pressed unselected | `secondary` | bg `rgba(124, 138, 158, 0.2)`, та же рамка | CSS `:active` |
| selected | `secondary` | bg `rgba(83, 151, 235, 0.12)`, прозрачная рамка | свойство `selected` |
| selected hover | `secondary` | bg `rgba(83, 151, 235, 0.2)` | `selected` + `:hover` |
| selected pressed | `secondary` | bg `rgba(83, 151, 235, 0.3)` | `selected` + `:active` |
| disabled | `secondary` | bg transparent, border `rgba(124, 138, 158, 0.15)`, fg `rgba(124, 138, 158, 0.8)` | нативный `disabled` |

Общие визуальные значения:

- Размер `m`: пример в Figma `79x40`.
- Радиус скругления: `24px` / `--border-radius-2xl`.
- Текст: Mont `16/24`, вес `600`.
- Слот иконки и иконки действия: `24x24`.
- Внутренние горизонтальные отступы: `16px`; зазор (gap): `8px`.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Chips` | `apps/frontend/src/components/ui/chip.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-chip*` |
| Варианты | `variant="primary"`, `secondary` |
| Размер | `size="m"` |
| Состояние выбора | свойство `selected` и `aria-pressed` |
| Состояние отключения | нативный `disabled` плюс `data-disabled` |
| Слот иконки | свойство `icon` |
| Слот иконки действия | свойство `actionIcon` |
| Дефолтная иконка закрытия | экспорт вспомогательного элемента `ChipDismissIcon` |

---

## Switch (Переключатель)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=608-662&m=dev
- Figma нода: `608:662`
- Figma сущность: `COMPONENT_SET | Switch`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `label#608:2` | boolean | default `true` |
| `label text#608:3` | text | default `Label` |
| `size` | variant | `s`, `xs`; default `s` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |
| `checked` | variant | `false`, `true`; default `false` |
| `label position` | variant | `right`, `left`; default `right` |

### Визуальный маппинг (Visual Mapping)

| Состояние Figma (Figma state) | Размер (Size) | Дорожка / Тоггл (Track / knob) | Лейбл (Label) | Маппинг кода (Code mapping) |
|---|---:|---|---|---|
| default unchecked | `s` | track `44x24`, bg `rgba(124, 138, 158, 0.25)`, knob `20x20`, радиус full | `16/24`, вес `600`, `--neutral-1000` | `.a3-switch--s`, неотмеченный input |
| default unchecked | `xs` | track `32x18` внутри `32x20`, bg `rgba(124, 138, 158, 0.25)`, knob `14x14` | `14/20`, вес `600`, `--neutral-1000` | `.a3-switch--xs`, неотмеченный input |
| hover unchecked | `s/xs` | track bg `rgba(124, 138, 158, 0.5)` | дефолтный лейбл | `.a3-switch:hover` |
| checked | `s/xs` | track bg `--base-accent`, белый knob сдвинут вправо | дефолтный лейбл | `input:checked` |
| checked hover | `s/xs` | track bg `--accent-600` | дефолтный лейбл | `input:checked` + hover |
| disabled unchecked | `s/xs` | track bg `rgba(124, 138, 158, 0.25)`, белый knob | `rgba(124, 138, 158, 0.8)` | `disabled` |
| disabled checked | `s/xs` | track bg `--base-accent`, белый knob | `rgba(124, 138, 158, 0.8)` | `disabled` + checked |
| label left | `s/xs` | переключатель после лейбла | так же по размеру | `labelPosition="left"` |
| label right | `s/xs` | переключатель перед лейблом | так же по размеру | `labelPosition="right"` |

Общие визуальные значения:

- Радиус скругления: `9999px` / `--border-radius-full`.
- Зазор между переключателем и лейблом: `6px`.
- Тень тоггла: `--shadow-bottom-controls`.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `Switch` | `apps/frontend/src/components/ui/switch.tsx` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-switch*` |
| Доступность (A11y) | `<input type="checkbox" role="switch">` внутри `<label>` |
| Размеры | `size="s"`, `xs` |
| Выбранный статус | нативные `checked` / `defaultChecked` |
| Статус отключения | нативный `disabled` плюс `data-disabled` |
| Лейбл | свойство `label` |
| Позиция лейбла | `labelPosition="right"` или `left` |

---

## SegmentedControl (Сегментированный переключатель)

Источник (Source):

- Figma URL: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=627-1899&m=dev
- Figma нода: `627:1899`
- Figma сущность: `COMPONENT_SET | SegmentedControl`
- Нода сегмента: `626:11`
- Сущность сегмента: `COMPONENT_SET | Elements / Segment`
- Извлечено: 27 мая 2026 года через Figma REST node API с локальным `FIGMA_API_TOKEN`

### Контракт Figma (Figma Contract)

SegmentedControl:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `size` | variant | `l`, `m`, `s`; default `m` |
| `variant` | variant | `primary`; default `primary` |
| `onlyicon` | variant | `false`, `true`; default `false` |

Elements / Segment:

| Свойство (Property) | Тип (Type) | Значения / значение по умолчанию (Values / default) |
|---|---|---|
| `icon#626:4` | boolean | default `false` |
| `icon variant#626:5` | instance swap | дефолтный компонент иконки |
| `label#626:6` | boolean | default `true` |
| `label text#626:7` | text | default `Label` |
| `variant` | variant | `primary`; default `primary` |
| `size` | variant | `l`, `m`, `s`; default `l` |
| `selected` | variant | `false`, `true`; default `false` |
| `state` | variant | `default`, `hover`, `disabled`; default `default` |

### Визуальный маппинг (Visual Mapping)

| Часть / состояние | Размер | Визуальные значения | Маппинг кода (Code mapping) |
|---|---:|---|---|
| Контейнер `l` | `48px` высота | bg `rgba(124, 138, 158, 0.1)`, радиус `24px`, внутренний отступ `6px` | `.a3-segmented-control--l` |
| Контейнер `m` | `36px` высота | bg `rgba(124, 138, 158, 0.1)`, радиус `24px`, внутренний отступ `4px` | `.a3-segmented-control--m` |
| Container `s` | `24px` высота | bg `rgba(124, 138, 158, 0.1)`, радиус `24px`, внутренний отступ `2px` | `.a3-segmented-control--s` |
| Сегмент `l` | `36px` высота | текст `16/24`, иконка `24px`, боковые отступы `16px` | `.a3-segment--l` |
| Сегмент `m` | `28px` высота | текст `14/20`, иконка `24px`, боковые отступы `12px` | `.a3-segment--m` |
| Сегмент `s` | `20px` высота | текст `12/16`, иконка `16px`, боковые отступы `8px` | `.a3-segment--s` |
| Сегмент по умолчанию | `l/m/s` | прозрачный bg, fg `--neutral-1000` | невыбранный сегмент |
| Сегмент при наведении | `l/m/s` | bg `rgba(124, 138, 158, 0.1)` | CSS `:hover` |
| Выбранный сегмент | `l/m/s` | bg `--base-accent`, fg `--neutral-0` | выбранное значение |
| Отключенный сегмент | `l/m/s` | fg `rgba(124, 138, 158, 0.8)` | нативный `disabled` |
| Отключенный выбранный | `l/m/s` | bg `rgba(124, 138, 158, 0.15)`, fg disabled | `disabled` + `selected` |
| Только иконка | `l/m/s` | лейбл скрыт, иконка выровнена по центру | свойство `iconOnly` |

Примечания по реализации (Implementation note):

- В Figma показаны собранные элементы управления с тремя видимыми сегментами, однако компонент фронтенда специально спроектирован для поддержки любого количества сегментов через массив `options` или кастомный набор дочерних элементов `SegmentedControlItem`.
- В случае, если ширина содержимого превышает доступное пространство, элемент сохраняет фиксированные размеры сегментов и плавно уходит в горизонтальный скролл вместо хаотичного сжатия надписей.

### Маппинг фронтенда (Frontend Mapping)

| Часть Figma (Figma part) | Целевой код (Code target) |
|---|---|
| Component set `SegmentedControl` | `apps/frontend/src/components/ui/segmented-control.tsx` `SegmentedControl` |
| Component set `Elements / Segment` | `SegmentedControlItem` |
| Визуальные классы | `apps/frontend/src/styles.css` `.a3-segmented-control*`, `.a3-segment*` |
| Размеры | `size="l"`, `m`, `s` |
| Режим только иконки | свойство `iconOnly` |
| Текущий выбранный элемент | `value` / `defaultValue` |
| Изменение значения | событие `onValueChange` |
| Значение в формах | опциональный скрытый инпут через свойство `name` |
| Произвольный счет | массив `options` или дочерние элементы `children`; поддерживает отображение любого количества сегментов |

---

## Правила миграции фронтенда (Frontend Migration Rule)

Не производите массовое автоматическое обновление стилей существующих компонентов фронтенда, пока для каждого компонента не будет извлечен подтвержденный контракт Figma. Используйте утвержденные токены из [token-map.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/token-map.md) в рамках контролируемой последовательной миграции, контролируя результат сборкой и визуальными автотестами QA.
