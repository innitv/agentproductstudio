# Карта токенов Figma

## Источник

- Файл Figma: https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System?node-id=16-203&m=dev
- Область действия: Токены дизайн-системы A3
- Дата: 2026-05-26
- Режим доступа: Figma REST file node API с использованием локального `FIGMA_API_TOKEN`

## Использованные исходные данные (Inputs Used)

- Нода Figma `16:203`
- Нода Figma `16:292`
- Пользовательские экспорты из Figma для токенов типографики, эффектов, скруглений, отступов и размеров компонентов
- [apps/frontend/src/styles.css](apps/frontend/src/styles.css)

## Примечания (Notes)

- Figma Variables API был недоступен для текущих токенов, так как он требует область действия `file_variables:read`.
- Значения токенов цвета были извлечены из структуры видимых фреймов: названий токенов, строк таблиц и образцов цвета.
- Значения типографики, эффектов, скруглений, отступов и размеров компонентов были извлечены из предоставленных пользователем CSS/токен экспортов Figma.

## Базовые токены цвета (Color Base Tokens)

| Токен (Token) | RGBA | CSS-переменная |
|---|---|---|
| `base.accent` | `rgba(83, 151, 235, 1)` | `--base-accent` |
| `base.neutral` | `rgba(112, 124, 142, 1)` | `--base-neutral` |
| `base.success` | `rgba(43, 182, 115, 1)` | `--base-success` |
| `base.warning` | `rgba(255, 180, 91, 1)` | `--base-warning` |
| `base.error` | `rgba(244, 89, 89, 1)` | `--base-error` |
| `base.info` | `rgba(25, 152, 255, 1)` | `--base-info` |
| `base.status-01` | `rgba(0, 178, 136, 1)` | `--base-status-01` |
| `base.status-02` | `rgba(17, 146, 187, 1)` | `--base-status-02` |
| `base.status-03` | `rgba(105, 82, 245, 1)` | `--base-status-03` |
| `base.status-04` | `rgba(153, 36, 255, 1)` | `--base-status-04` |
| `base.status-05` | `rgba(227, 58, 130, 1)` | `--base-status-05` |
| `base.status-06` | `rgba(250, 83, 0, 1)` | `--base-status-06` |

## Маппинг фронтенда (Frontend Mapping)

| Токен Figma | Текущий семантический алиас | Использование (Usage) |
|---|---|---|
| `base.accent` | `--a3-brand-surface` -> `--base-accent` | Синяя поверхность страницы |
| `base.info` | `--a3-brand-action` -> `--base-info` | Синий цвет для CTA/действий |
| `base.neutral` | `--base-neutral` | Нейтральная основа для будущих шкал текста/границ |
| `base.success` | `--base-success` | Состояния успеха |
| `base.warning` | `--base-warning` | Состояния предупреждения |
| `base.error` | `--base-error` | Состояния ошибки |
| `base.status-*` | `--base-status-*` | Дополнительные палитры статусов |

## Токены палитры цветов (Color Palette Tokens)

Исходная нода: `16:292`

### Основные палитры (Core Palettes)

| Шаг (Step) | Accent | Neutral | Success | Warning | Error | Info |
|---:|---|---|---|---|---|---|
| 0 | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| 10 | `#F4F7FC` | `#F8F9FA` | `#EAF8F1` | `#FFF8EF` | `#FEEEEE` | `#F8FCFF` |
| 25 | `#E4EDFA` | `#EBEDF0` | `#D5F0E3` | `#FFF0DE` | `#FDDEDE` | `#F4FAFF` |
| 50 | `#D4E3F8` | `#D1D6DD` | `#BFE9D5` | `#FFE9CE` | `#FCCDCD` | `#E8F5FF` |
| 100 | `#C4D9F6` | `#C4CAD3` | `#95DBB9` | `#FFE1BD` | `#FBBDBD` | `#C6E5FF` |
| 200 | `#A5C4F1` | `#AAB3C0` | `#80D3AB` | `#FFDAAD` | `#F89B9B` | `#8CCBFF` |
| 300 | `#86AFEC` | `#8996A8` | `#6BCC9D` | `#FFCB8C` | `#F67A7A` | `#6ABCFF` |
| 400 | `#679AEA` | `#7C8A9E` | `#55C58F` | `#FFBC6B` | `#F56A6A` | `#47ADFF` |
| 500 | `#5397EB` | `#707C8E` | `#2BB673` | `#FFB45B` | `#F45959` | `#1998FF` |
| 600 | `#4179C4` | `#5D6877` | `#22925C` | `#E6A252` | `#DC5050` | `#1581D9` |
| 700 | `#3A679F` | `#4A535F` | `#1A6D45` | `#CC9049` | `#AB3E3E` | `#116AB3` |
| 800 | `#294B7A` | `#383E47` | `#165B3A` | `#996C37` | `#923535` | `#0F5B99` |
| 900 | `#203B61` | `#32373F` | `#11492E` | `#805A2E` | `#7A2D2D` | `#0C4C80` |
| 925 | `#1B334F` | `#25292F` | `#0D3722` | `#664824` | `#622424` | `#0B416E` |
| 950 | `#162A40` | `#191C20` | `#092417` | `#4C361B` | `#491B1B` | `#093559` |
| 990 | `#0F1D2D` | `#0C0E10` | `#04120B` | `#332412` | `#180909` | `#051E33` |
| 1000 | `#0A151F` | `#2C2E2B` | `#000000` | `#000000` | `#000000` | `#000000` |

### Палитры статусов (Status Palettes)

| Шаг (Step) | Status 01 | Status 02 | Status 03 | Status 04 | Status 05 | Status 06 |
|---:|---|---|---|---|---|---|
| 0 | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| 10 | `#F7FDFB` | `#F8FCFD` | `#FAFAFF` | `#FCF8FF` | `#FEF9FB` | `#FFFAF7` |
| 25 | `#F2FBF9` | `#F3FAFC` | `#F8F6FE` | `#FAF4FF` | `#FEF5F9` | `#FFF6F2` |
| 50 | `#E6F7F3` | `#E7F4F8` | `#F0EEFE` | `#F5E9FF` | `#FCEBF3` | `#FEEEE6` |
| 100 | `#BFECE1` | `#C4E4EE` | `#DAD4FC` | `#E6C8FF` | `#F8CEE0` | `#FED4BF` |
| 200 | `#80D8C4` | `#88C8DD` | `#B4A9FA` | `#CC92FF` | `#F19DC1` | `#FCA980` |
| 300 | `#59CDB2` | `#64B8D3` | `#9E8FF9` | `#BD71FF` | `#ED7FAE` | `#FC8F59` |
| 400 | `#33C1A0` | `#41A8C9` | `#8775F7` | `#AD50FF` | `#E9619B` | `#FB7533` |
| 500 | `#00B288` | `#1192BB` | `#6952F5` | `#9924FF` | `--base-status-05` -> `rgba(227, 58, 130, 1)` | `#FA5300` |
| 600 | `#009774` | `#0E7C9F` | `#5946D0` | `#821FD9` | `#C1316E` | `#D44700` |
| 700 | `#007D5F` | `#0C6683` | `#4939AC` | `#6B19B3` | `#9F295B` | `#AF3A00` |
| 800 | `#006B52` | `#0A5870` | `#3F3193` | `#5C1699` | `#88234E` | `#963200` |
| 900 | `#005944` | `#08495E` | `#35297A` | `#4D1280` | `#711D41` | `#7D2A00` |
| 925 | `#004D3A` | `#063342` | `#251D56` | `#420F6E` | `#621938` | `#6C2400` |
| 950 | `#003E30` | `#063342` | `#251D56` | `#360D59` | `#50142D` | `#571D00` |
| 990 | `#00241B` | `#031D25` | `#151031` | `#1F0733` | `#2D0C1A` | `#321100` |
| 1000 | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` |

Каноническое именование CSS-переменных:

- Базовые токены: `--base-{accent|neutral|success|warning|error|info|status-01..06}`.
- Основные палитры: `--{accent|neutral|success|warning|error|info}-{step}`.
- Палитры статусов: `--status-{01..06}-{step}`.
- Совместимые алиасы: `--a3-base-*` и `--a3-palette-*` остаются в CSS для существующих стилей фронтенда.

## Токены типографики (Typography Tokens)

Источник: предоставленный пользователем экспорт стилей текста из Figma.

Все служебные классы типографики реализованы в [apps/frontend/src/styles.css](apps/frontend/src/styles.css) с правилами `font-family: var(--font-family-mont)`, `font-style: normal`, `text-decoration: none` и `text-transform: none`.

| Класс (Class) | Размер (Size) | Высота строки (Line height) | Насыщенность (Weight) | CSS-переменные |
|---|---:|---:|---:|---|
| `.text-style-font-display-l` | `48px` | `52px` | `400` | `--font-display-l-size`, `--font-display-l-line` |
| `.text-style-font-display-l-strong` | `48px` | `52px` | `600` | `--font-display-l-size`, `--font-display-l-line` |
| `.text-style-font-display-m` | `42px` | `44px` | `400` | `--font-display-m-size`, `--font-display-m-line` |
| `.text-style-font-display-m-strong` | `42px` | `44px` | `600` | `--font-display-m-size`, `--font-display-m-line` |
| `.text-style-font-heading-h1` | `32px` | `44px` | `600` | `--font-heading-h1-size`, `--font-heading-h1-line` |
| `.text-style-font-heading-h2` | `28px` | `32px` | `600` | `--font-heading-h2-size`, `--font-heading-h2-line` |
| `.text-style-font-heading-h3` | `24px` | `26px` | `600` | `--font-heading-h3-size`, `--font-heading-h3-line` |
| `.text-style-font-body-l` | `20px` | `26px` | `400` | `--font-body-l-size`, `--font-body-l-line` |
| `.text-style-font-body-l-strong` | `20px` | `26px` | `600` | `--font-body-l-size`, `--font-body-l-line` |
| `.text-style-font-body-m` | `18px` | `24px` | `400` | `--font-body-m-size`, `--font-body-m-line` |
| `.text-style-font-body-m-strong` | `18px` | `24px` | `600` | `--font-body-m-size`, `--font-body-m-line` |
| `.text-style-font-body-s` | `16px` | `24px` | `400` | `--font-body-s-size`, `--font-body-s-line` |
| `.text-style-font-body-s-strong` | `16px` | `24px` | `600` | `--font-body-s-size`, `--font-body-s-line` |
| `.text-style-font-description-l` | `14px` | `20px` | `400` | `--font-description-l-size`, `--font-description-l-line` |
| `.text-style-font-description-l-strong` | `14px` | `20px` | `600` | `--font-description-l-size`, `--font-description-l-line` |
| `.text-style-font-description-m` | `13px` | `18px` | `400` | `--font-description-m-size`, `--font-description-m-line` |
| `.text-style-font-description-m-strong` | `13px` | `18px` | `600` | `--font-description-m-size`, `--font-description-m-line` |
| `.text-style-font-description-s` | `12px` | `16px` | `400` | `--font-description-s-size`, `--font-description-s-line` |
| `.text-style-font-description-s-strong` | `12px` | `16px` | `600` | `--font-description-s-size`, `--font-description-s-line` |
| `.text-style-mobile-font-font` | `12px` | `16px` | `400` | `--font-mobile-font-size`, `--font-mobile-font-line` |

Общие переменные типографики:

- `--font-family-mont`: `"Mont", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- `--font-weight-regular`: `400`.
- `--font-weight-strong`: `600`.

## Токены эффектов (Effect Tokens)

Источник: предоставленный пользователем экспорт стилей эффектов из Figma.

| Класс (Class) | CSS-переменная | Тень (Box shadow) |
|---|---|---|
| `.effect-style-shadow-none` | `--shadow-none` | `inset 0px 0px 0px rgba(0, 0, 0, 0)` |
| `.effect-style-shadow-bottom-s` | `--shadow-bottom-s` | `0px 2px 4px rgba(44, 46, 43, 0.05), 0px 0px 8px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-m` | `--shadow-bottom-m` | `0px 4px 8px rgba(44, 46, 43, 0.05), 0px 0px 16px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-l` | `--shadow-bottom-l` | `0px 12px 20px rgba(44, 46, 43, 0.05), 0px 0px 20px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-xl` | `--shadow-bottom-xl` | `0px 32px 32px rgba(44, 46, 43, 0.05), 0px 0px 32px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-bottom-controls` | `--shadow-bottom-controls` | `0px 2px 2px rgba(44, 46, 43, 0.2), 0px 0px 1px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-s` | `--shadow-top-s` | `0px -2px 4px rgba(44, 46, 43, 0.05), 0px 0px 8px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-m` | `--shadow-top-m` | `0px -4px 8px rgba(44, 46, 43, 0.05), 0px 0px 16px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-l` | `--shadow-top-l` | `0px -12px 20px rgba(44, 46, 43, 0.05), 0px 0px 20px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-xl` | `--shadow-top-xl` | `0px -32px 32px rgba(44, 46, 43, 0.05), 0px 0px 32px rgba(44, 46, 43, 0.1)` |
| `.effect-style-shadow-top-controls` | `--shadow-top-controls` | `0px -2px 2px rgba(44, 46, 43, 0.2), 0px 0px 1px rgba(44, 46, 43, 0.1)` |

## Токены скругления границ (Border Radius Tokens)

Источник: предоставленный пользователем экспорт токенов радиусов из Figma.

| Токен (Token) | Значение | Назначение (Purpose) |
|---|---:|---|
| `--border-radius-base` | `6px` | Базовое скругление |
| `--border-radius-none` | `0px` | Без скругления |
| `--border-radius-2xs` | `2px` | Сверхмалое скругление |
| `--border-radius-xs` | `3px` | Малое скругление элементов управления |
| `--border-radius-s` | `4px` | Малое скругление |
| `--border-radius-m` | `var(--border-radius-base)` | Среднее/стандартное скругление |
| `--border-radius-l` | `8px` | Большое скругление |
| `--border-radius-xl` | `12px` | Сверхбольшое скругление |
| `--border-radius-2xl` | `24px` | Большое скругление контейнеров |
| `--border-radius-inputs` | `var(--border-radius-m)` | Поля ввода и компоненты на их основе |
| `--border-radius-buttons` | `var(--border-radius-m)` | Кнопки |
| `--border-radius-controls` | `var(--border-radius-xs)` | Переключатели/элементы управления |
| `--border-radius-full` | `9999px` | Полное скругление (пилюля) |

## Токены отступов (Spacing Tokens)

Источник: предоставленный пользователем экспорт токенов отступов из Figma.

| Токен (Token) | Значение |
|---|---:|
| `--spacing-base` | `16px` |
| `--spacing-none` | `0px` |
| `--spacing-px` | `1px` |
| `--spacing-0-5x` | `2px` |
| `--spacing-1x` | `4px` |
| `--spacing-1-5x` | `6px` |
| `--spacing-2x` | `8px` |
| `--spacing-3x` | `12px` |
| `--spacing-4x` | `var(--spacing-base)` |
| `--spacing-5x` | `20px` |
| `--spacing-6x` | `24px` |
| `--spacing-8x` | `32px` |
| `--spacing-10x` | `40px` |
| `--spacing-12x` | `48px` |
| `--spacing-16x` | `64px` |
| `--spacing-20x` | `80px` |
| `--spacing-24x` | `96px` |
| `--spacing-32x` | `128px` |
| `--spacing-48x` | `192px` |

## Токены размеров компонентов (Size Tokens)

Источник: предоставленный пользователем экспорт токенов размеров компонентов из Figma.

| Токен (Token) | Значение | Назначение (Purpose) |
|---|---:|---|
| `--size-base` | `16px` | Базовый размер компонента |
| `--size-2xs` | `var(--size-base)` | Высота компонента, 2xs |
| `--size-xs` | `20px` | Высота компонента, xs |
| `--size-s` | `24px` | Высота компонента, s |
| `--size-m-tag` | `28px` | Высота компонента тега (Tag), m |
| `--size-m-chip` | `32px` | Высота компонента чипа (Chip), m |
| `--size-m` | `36px` | Высота компонента, m |
| `--size-l` | `48px` | Высота компонента, l |
| `--size-xl` | `56px` | Высота компонента, xl |

## Реализация (Implementation)

- Добавлены канонические базовые переменные цвета Figma в [apps/frontend/src/styles.css](apps/frontend/src/styles.css) в формате RGBA.
- Добавлены канонические переменные палитры цветов Figma в [apps/frontend/src/styles.css](apps/frontend/src/styles.css) в формате RGBA.
- Добавлены переменные типографики и служебные классы в [apps/frontend/src/styles.css](apps/frontend/src/styles.css).
- Добавлены переменные эффектов/теней и служебные классы в [apps/frontend/src/styles.css](apps/frontend/src/styles.css).
- Добавлены переменные скругления границ в [apps/frontend/src/styles.css](apps/frontend/src/styles.css).
- Добавлены переменные отступов и размеров компонентов в [apps/frontend/src/styles.css](apps/frontend/src/styles.css).
- Сохранены совместимые алиасы `--a3-*` для существующих стилей фронтенда.
- Заменены общие жестко закодированные цвета интерфейса семантическими CSS-переменными там, где это безопасно.
- Добавлен `FIGMA_API_TOKEN` в `.env.example`.

## Дальнейшие шаги (Follow-Up)

- Повторно запросить или обновить токен Figma с областью действия `file_variables:read`, чтобы напрямую считывать канонические переменные Figma (Figma Variables).
- Сопоставить варианты и состояния компонентов с принятыми токенами цвета, типографики, эффектов, скруглений, отступов и размеров.
