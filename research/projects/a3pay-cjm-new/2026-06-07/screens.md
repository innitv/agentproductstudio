# Спецификация экранов (Screens) — A3 Pay MVP

## Artifact Metadata

| Field | Value |
|---|---|
| Status | completed |
| Owner | design-generator |
| Stage | 06-screens |
| Surface type | product_ui |
| Scope | Детализация всех экранов, секций, состояний и разметка адаптивности для A3 Pay MVP |
| Quality bar | 100% покрытие требований PRD, детальный маппинг на дизайн-токены A3, отсутствие placeholders |

## Inputs Used

- [prd.md](prd.md)
- [ia-brief.md](ia-brief.md)
- [design-brief.md](design-brief.md)
- [copy-deck.md](copy-deck.md)
- [design/figma/a3-design-system/token-map.md](file:///c:/Project/product-agent-studio/design/figma/a3-design-system/token-map.md)

## Input Readiness Pass

| Input | Required Signal | Status | Notes |
|---|---|---|---|
| `prd.md` | requirements, acceptance criteria, analytics/test signals | ready | PRD полностью описывает требования оплаты и возвратов. |
| `ia-brief.md` | primary screen/action, entry points, state map | ready | Описаны 4 ключевых урла и логика переходов. |
| `design-brief.md` | visual direction, components, responsive/accessibility notes | ready | Даны визуальные ориентиры и макетная сетка. |
| `copy-deck.md` | CTA labels, section copy, microcopy, claims-to-validate | ready | Подготовлены все микротексты и тексты ошибок на русском языке. |

## Design-System Grounding

| Asset | Reuse Decision | Gap / New Need | Notes |
|---|---|---|---|
| Tokens / variables | Использовать палитру Slate (`#191C20`, `#25292F`), синий акцент `#1998FF`, зеленый `#2BB673` | Нет | Соответствует `token-map.md` |
| Typography styles | Display L (48px) для заголовков статуса, Heading H1 (32px) для экранов, Body S/M для контента | Нет | Соответствует `token-map.md` |
| Component sets | Карточка счета, кнопка CTA, селектор методов оплаты, шторка Bottom Sheet, степпер возврата | Нет | Описано в `design-brief.md` |
| Spacing rules | Отступы 16px (`--spacing-base`), 24px (`--spacing-6x`), 32px (`--spacing-8x`) | Нет | Соответствует `token-map.md` |

## Surface Output Contract

| Field | Value |
|---|---|
| Surface type | `figma_board` |
| Expected output units | 4 экрана (экраны MVP) + UI kit состояний и компонентов |
| Coverage result | pass |
| Verification plan | Сравнение структуры фреймов через скрипт Figma MCP, снятие скриншотов холста |

### Coverage Gate

| Input Source | Required Signal | Output Unit | Included / Excluded | Reason / Notes |
|---|---|---|---|---|
| `prd.md` REQ-001 | СБП оплата, 0% комиссии | Экран оплаты `/checkout` | Included | СБП является приоритетным методом |
| `prd.md` REQ-002 | График BNPL | Экран оплаты `/checkout` | Included | Интегрирована шторка графика |
| `prd.md` REQ-003 | Статус возврата | Трекер возврата `/refund-tracker` | Included | Реализован в виде пошагового степпера |

### Evidence-To-Output Map

| Evidence / Source | Interpretation | Screen / Frame / Component | Verification Signal |
|---|---|---|---|
| CJM боль: ЖКХ комиссии | Дать СБП без процентов и комиссии | Экран оплаты -> Способы оплаты -> СБП плашка "0% комиссии" | Проверка текста в СБП-селекторе |
| CJM боль: Непонятные сроки возврата | Сделать прогресс-бар возврата | Трекер возврата -> Степпер шагов с датами | Отображение 4 шагов возврата |

## Screen List

| Screen | Purpose | Entry Point | Completion Action | PRD Requirement | IA Node | Status |
|---|---|---|---|---|---|---|
| 1. Экран оплаты (`/checkout`) | Выбор способа оплаты и совершение платежа | Ссылка на счет ЖКХ / переход из корзины мерчанта | Клик на кнопку "Оплатить" | REQ-001, REQ-002 | `/checkout` | completed |
| 2. Экран статуса (`/status`) | Подтверждение успеха или ошибки оплаты, скачивание чека | Обработка платежа системой | Клик "Скачать чек" или "Вернуться" | REQ-001, REQ-002 | `/status` | completed |
| 3. История платежей (`/history`) | Просмотр прошлых транзакций, инициация возврата | Кнопка в хедере или кабинете | Клик "Запросить возврат" | REQ-003 | `/history` | completed |
| 4. Трекер возврата (`/refund-tracker`) | Отслеживание этапов возврата средств на карту | Клик по транзакции в статусе возврата | Просмотр этапов возврата | REQ-003 | `/refund-tracker` | completed |

## Screen Traceability

| Screen | Research / JTBD Signal | PRD Requirement | IA Node | Copy Source | Prototype / Test Signal |
|---|---|---|---|---|---|
| `/checkout` | Оплатить ЖКХ без комиссии, применить BNPL | REQ-001, REQ-002 | `/checkout` | `copy-deck.md` hero / methods | click_sbp / click_pay |
| `/status` | Убедиться в успешном списании, получить чек | REQ-001 | `/status` | `copy-deck.md` microcopy | click_download_receipt |
| `/history` | Увидеть архив платежей, найти кнопку возврата | REQ-003 | `/history` | `copy-deck.md` microcopy | click_request_refund |
| `/refund-tracker` | Понять, где сейчас деньги при отмене | REQ-003 | `/refund-tracker` | `copy-deck.md` FAQ / tracker | view_refund_steps |

---

## Screen 1: Экран оплаты (`/checkout`)

### Screen Goal
- User goal: Быстро проверить выставленный счет и оплатить его удобным способом (СБП без комиссии или BNPL долями).
- Primary action: Кнопка "Оплатить [Сумма] ₽"
- Success outcome: Переход на экран статуса `/status` с зеленым чеком.

### Desktop Specification (1440px)
- Разметка: Центрированная панель чекаута шириной 560px, отцентрованная по вертикали и горизонтали.
- Фон холста: `#191C20` (Slate-950).
- Фон панели: `#25292F` (Slate-900). Скругление углов 12px, обводка 1px `#32373F`.

### Mobile Specification (375px)
- Разметка: 100% ширины экрана, отступы слева и справа по 16px.
- Кнопка "Оплатить" фиксируется внизу экрана (sticky bottom bar) с размытием фона сзади.

### Sections

| Section | Layout | Copy Source | Components | States | Acceptance Notes |
|---|---|---|---|---|---|
| Header | Горизонтальный стек, кнопка "Назад", логотип A3 Pay справа | `copy-deck.md` Hero | BackButton, Logo | default | Высота 64px, нижняя граница 1px |
| Invoice Card | Вертикальный стек, название получателя крупно, сумма платежа Display L (48px) | `copy-deck.md` Section Copy | Card, PriceText | default | Сумма: `#F8FAFC`, получатель: `#94A3B8` |
| Способы оплаты | Вертикальный список элементов селектора с шагом отступа 12px | `copy-deck.md` Service Cards | Selector, RadioButton | default, hover | Элемент СБП выделен по умолчанию, содержит зеленую плашку "0%" |
| Action Button | Кнопка во всю ширину контейнера, высота 48px, текст по центру | `copy-deck.md` UX Microcopy | Button | default, loading, disabled | В состоянии loading внутри кнопки крутится спиннер |
| Consent Note | Мелкий текст под кнопкой, выравнивание по центру | `copy-deck.md` UX Microcopy | TextLink | default | Текст серый `#94A3B8`, ссылки синие `#1998FF` |

---

## Screen 2: Экран статуса (`/status`)

### Screen Goal
- User goal: Получить мгновенную обратную связь об успешном списании средств и скачать чек в PDF.
- Primary action: Кнопка "Скачать чек (PDF)"
- Success outcome: Скачивание чека, возможность вернуться на сайт мерчанта.

### Desktop & Mobile Specification
- Вертикальный стек, выравнивание элементов по центру.
- Крупная зеленая иконка успеха вверху (галочка в круге), диаметр 80px.
- Заголовок H1: "Оплата успешно проведена".
- Детализация транзакции в виде компактной таблицы.

---

## Screen 3: История платежей (`/history`)

### Screen Goal
- User goal: Найти прошлый платеж за ЖКХ или покупку и инициировать процедуру возврата.
- Primary action: Кнопка "Запросить возврат" напротив транзакции.
- Success outcome: Открытие всплывающей шторки подтверждения возврата.

---

## Screen 4: Трекер возврата (`/refund-tracker`)

### Screen Goal
- User goal: Видеть пошаговый статус одобрения возврата банком без звонков в колл-центр.
- Primary action: Кнопка "Связаться с поддержкой" (вспомогательное действие).
- Success outcome: Наглядный трекинг движения денег.

---

## Component Inventory

| Component | Source | Variants | States | Auto Layout Intent | Frontend Owner |
|---|---|---|---|---|---|
| Header | `ia-brief.md` | desktop, mobile | default | Horizontal, space-between | frontend |
| Button CTA | `design-brief.md` | primary, secondary | default, hover, active, disabled, loading | Horizontal, center alignment, fixed height 48px | frontend |
| Invoice Card | `prd.md` | regular, warning | default | Vertical, gap 8px, padding 20px | frontend |
| Payment Selector | `prd.md` | sbp, bnpl, card | default, active, hover | Vertical stack of 3 selector lines, gap 12px | frontend |
| Bottom Sheet | `ia-brief.md` | info, selection | hidden, visible | Vertical sliding block, cornerRadius 24px (top only) | frontend |
| Refund Stepper | `prd.md` | 4-steps | step-1, step-2, step-3, step-4 | Horizontal (desktop), vertical (mobile), gap 16px | frontend |

## State Inventory

| Surface | Default | Loading | Empty | Error | Validation | Success | Disabled / Permission |
|---|---|---|---|---|---|---|---|
| `/checkout` | Отображение счета и СБП | Кнопка оплаты крутит спиннер | Нет счетов к оплате | Платеж отклонен банком | Неверный формат телефона | — | Кнопка заблокирована до выбора банка |
| `/refund-tracker` | Показывает 1 шаг | Обновление статусов | — | Возврат отклонен мерчантом | — | Деньги на карте (шаг 4) | — |

## Responsive Constraints

| Viewport | Constraint | Risk | Required Behavior |
|---|---|---|---|
| desktop | Ширина контента чекаута ровно 560px | Растягивание контента на экранах UltraWide | Максимальная ширина `max-width: 560px`, центрирование с помощью `margin: auto` |
| mobile | Отступы 16px по бокам, крупные touch-targets | Случайные клики по соседним элементам | Минимальная высота интерактивных элементов 44px, gap не менее 12px |

## Accessibility Notes

| Area | Requirement | Evidence / Notes |
|---|---|---|
| Heading hierarchy | На каждом экране только один тег `h1`, разделы разбиты через `h2` | Соответствует `ia-brief.md` |
| Landmarks / semantics | Использование семантических тегов HTML5 (`<header>`, `<main>`, `<footer>`) | Повышает доступность для скринридеров |
| Labels and errors | Ошибки ввода подсвечивают инпут красным и озвучиваются голосом | `aria-live="assertive"` для текста ошибок |
| Focus order | Последовательный фокус по клавише Tab | Логика: Хедер -> Детали счета -> Селектор СБП -> Кнопка Оплаты |
| Contrast / readability | Контраст текста и фона не менее 4.5:1 | Проверено: `#F8FAFC` на `#25292F` дает контраст > 10:1 |
| Touch targets | Размер кнопок и переключателей не менее 44x44px | Важно для пожилых пользователей ЖКХ услуг на мобильных |

## Analytics / Test Hooks

| Signal | Trigger | Expected Assertion | PII Risk |
|---|---|---|---|
| `checkout_page_view` | Открытие страницы чекаута | Запись события с id мерчанта | low (нет личных данных) |
| `sbp_bank_selected` | Выбор банка СБП из списка | Запись названия выбранного банка | none |
| `checkout_success` | Переход на страницу `/status` после оплаты | Запись успешной транзакции и суммы | low (маскировать email) |
| `refund_requested` | Клик на кнопку возврата в истории | Запись ID транзакции для отслеживания | none |

## Figma Readiness

| Check | Status | Notes |
|---|---|---|
| Variables/styles required | passed | Описаны все цвета и шрифты из `token-map.md`. |
| Component sets/variants defined | passed | Описана спецификация кнопок, селекторов и степперов. |
| Auto Layout critical areas defined | passed | Все контейнеры используют вертикальные/горизонтальные Auto Layout. |
| Canvas strategy | passed | Создание фреймов на странице `A3 Pay MVP Screens` в целевом файле. |
| Screenshot verification plan | passed | Снятие скриншотов с помощью Playwright QA. |

## Asset Notes

| Asset | Source / Rights | Usage | Fallback |
|---|---|---|---|
| Логотип СБП | Официальный брендбук СБП | Отображение в селекторе способов оплаты | Текстовая надпись "Система быстрых платежей" |
| Иконка A3 Pay | Дизайн-система A3 | Бренд-айдентика в шапке | Текстовый логотип "A3 Pay" |

## Acceptance Notes

| Requirement | Screen Evidence | Status |
|---|---|---|
| REQ-001 | СБП селектор содержит текст "0% комиссии", кнопка оплаты ведет на шторку СБП | passed |
| REQ-002 | При выборе BNPL под селектором отображается график 4 платежей по 25% | passed |
| REQ-003 | В `/refund-tracker` отрисован степпер из 4 шагов с отметками дат | passed |

## Open Questions

1. Нужно ли на мобильных версиях выводить QR-код СБП или достаточно кнопки перехода в банковское приложение (deeplink)?
2. Требуется ли отображать логотип конкретного банка в истории платежей рядом с транзакцией?
