---
id: design-engineering
name: design-engineering
title: "Motion И Interaction Polish"
description: "Использовать на этапах 08-frontend и 11-qa для проверки UI motion, interaction states, easing, reduced motion, focus и hover behavior, а также для обязательной мобильной приёмки в профиле устройства (тач-скролл, safe-area, оверлеи, позиция прокрутки). Skill проверяет невидимые детали интерфейса, которые не воспроизводятся узким desktop-вьюпортом."
platforms:
  - claude
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 08-frontend
  - 11-qa
required_inputs:
  - design_brief
  - screens
  - prototype_report
  - frontend_result
required_outputs:
  - frontend_result
approval_actions: []
validation_commands:
  - yarn typecheck
  - yarn build
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Motion И Interaction Polish

## Назначение

Проверяет невидимые детали интерфейса: feedback, motion, focus, active states и reduced-motion behavior.

## Порядок Работы

1. Прочитай `design-brief.md`, `screens.md`, `prototype-report.md` и `frontend-result.md`.
2. Если есть `figma-handoff-bundle.md`, проверь, что motion/state rules и component variants не потерялись при переносе в код.
2a. Проверь Component Contract Matrix: Figma properties/values должны иметь React prop mapping, state story/test/locator или explicit deviation.
3. Определи критичные user actions: primary CTA, navigation, form submit, modal/open close, selected row/card, filter/sort/search.
4. Проверь каждый action в состояниях default, hover, focus, active/pressed, disabled, loading, error и success.
5. Для визуально значимой UI-задачи проверь desktop/mobile через browser/Playwright screenshots или зафиксируй blocker. Мобильную часть веди по **Mobile Device Acceptance Gate** ниже: профиль устройства, а не узкий desktop-вьюпорт.

## Checklist

- Не использовать `transition: all`.
- UI-анимации имеют цель и обычно короче 300ms.
- Entry UI motion использует responsive easing, не `ease-in`.
- Не начинать появление интерактивных элементов с `scale(0)`.
- Hover-анимации включать только через `@media (hover: hover) and (pointer: fine)`.
- Transform-based motion имеет `prefers-reduced-motion`.
- Кнопки и pressable elements имеют active feedback.
- Focus states видимы с клавиатуры.
- Disabled/loading/error/empty/success states не ломают layout.
- Частые keyboard actions не получают декоративную анимацию.
- Длинный текст не меняет высоту fixed controls, не выталкивает icons и не создает horizontal overflow.
- Figma-driven component имеет state story/route и paired screenshot для must-cover states.
- Новый bespoke primitive не дублирует существующий production contract без `gap_reason`.
- Dashboard/console interactions не превращаются в декоративный motion; priority отдается scanability, predictability и repeated-use ergonomics.
- Landing/marketing interactions поддерживают narrative flow, но не скрывают primary CTA и brand/product signal.

## Mobile Device Acceptance Gate

Норма мобильной приёмки живёт здесь; остальные документы ссылаются сюда и не повторяют её.

**Когда применяется.** Поверхность мобильная, если верно хотя бы одно: целевой сценарий заявлен на телефоне в `prd.md`/`design-brief.md`/`screens.md`; макеты сделаны в мобильной ширине; результат деплоится и открывается пользователем с телефона; в scope есть mobile web/app. Сомневаешься — считай мобильной.

**Гейт.** Без приёмки в профиле устройства мобильная поверхность не получает `success` на `08-frontend` (потолок — `partial`) и не получает на `11-qa` **ни `pass`, ни `pass_with_known_limitations`**: непроверенный обязательный гейт — это `blocker` по QA Severity Model, вердикт `blocked`. Формулировка «известное ограничение» не покрывает непроведённую проверку — ограничением можно назвать только то, что измерено. Отдельный случай: приёмка выполнена, но строка `engine_limitation` не записана — тогда потолок `pass_with_known_limitations`. Приёмка — прогон в device profile (Playwright `devices['iPhone 15']` или эквивалент: `isMobile: true`, `hasTouch: true`, `deviceScaleFactor` устройства) с настоящими тач-жестами (`page.touchscreen.*`, `touchstart/touchmove/touchend`), а не мышью. **Узкий desktop-вьюпорт (`setViewportSize`, `--window-size`) приёмкой не считается**: картинка похожа, но touch-события, safe-area и `visualViewport` не воспроизводятся. В отчёте называй использованный профиль; «проверено на мобильном разрешении» записью приёмки не является.

**Минимальный набор сценариев.** Каждый выведен из бага, который прошёл все desktop-проверки и всплыл на живом iPhone (`contractor-payment-demo`, 2026-07-23…25). Для каждого — `pass|fail|not_applicable` с причиной:

1. **Скролл от касания контента.** Свайп начинается на интерактивном элементе (карточка, строка, кнопка), а не на пустом фоне; проверяются **обе оси**. Ассерт — изменение `scrollTop`/`scrollLeft` после жеста. Типичные причины провала: pointer/drag-обработчик глушит жест; `overflow-x` делает контейнер скроллером в обеих осях и перехватывает вертикальную.
2. **Fixed/sticky и фон против safe-area.** `env(safe-area-inset-*)`, `viewport-fit=cover`, `theme-color`: закреплённые панели не заезжают под системные зоны, фон страницы не «протекает» в них чужим цветом. Ассерт — координаты элемента относительно вьюпорта плюс фактический цвет пикселя в зоне вставки.
3. **Появление оверлея/баннера/клавиатуры.** Элемент не обрезан, перекрывает контент, а не сжимает страницу (нет layout shift основной композиции).
4. **Композиция минимум на двух реальных ширинах устройств** (например 390 и 430 CSS px). Одна ширина скрывает переполнение и точки переноса.
5. **Позиция прокрутки при смене состояния.** После появления/исчезновения оверлея, смены таба или перерисовки списка `scrollTop` не прыгает. Типичная причина: узел размонтирован (смена ключа `AnimatePresence`, условный рендер) — `scrollTop` живёт в DOM, а не в состоянии React, и теряется вместе с узлом.

Новый ассерт проходит негативный контроль: на коде до исправления он обязан падать (см. `visual-diff-verifier` §3.3).

**Граница движка — записывается в отчёт каждый раз.** Chromium с профилем устройства — не WebKit. Локально не воспроизводятся: тонирование системных панелей Safari по `theme-color`/фону страницы, поведение `visualViewport` при появлении панелей и клавиатуры, захват оси вложенным скроллером, resize от сворачивания адресной строки. Формулировка для отчёта:

`engine_limitation: приёмка в Chromium device profile <profile>; WebKit/Safari-специфика (<что именно не проверено>) локально не воспроизводится, финальное подтверждение — живое устройство.`

Без этой строки статус не выше `pass_with_known_limitations`: отсутствие записи означает, что ограничение не осознано, а не что его нет.

**Куда пишется:** `frontend-result.md` (08-frontend) и секция `Responsive` в `qa-report.md` (11-qa) — профиль, таблица пяти сценариев, строка `engine_limitation`.

## Evidence

Результат проверки фиксируется в `frontend-result.md`, `qa-report.md` или `storybook-result.md` в зависимости от stage.

Минимальная evidence-запись:

- какие critical actions проверены;
- какие viewport checks выполнены; для мобильной поверхности — использованный device profile, таблица пяти сценариев Mobile Device Acceptance Gate и строка `engine_limitation`;
- где проверены keyboard focus и reduced motion;
- какие deviations от `figma-handoff-bundle.md` или `prototype-report.md` оставлены намеренно;
- какие issues требуют follow-up.
