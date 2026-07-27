---
name: design-engineering
description: Использовать на этапах 08-frontend и 11-qa для проверки UI motion, interaction states, easing, reduced motion, focus и hover behavior, а также для обязательной мобильной приёмки в профиле устройства (тач-скролл, safe-area, оверлеи, позиция прокрутки). Skill проверяет невидимые детали интерфейса, которые не воспроизводятся узким desktop-вьюпортом.
---

# Motion И Interaction Polish

Skill проверяет невидимые детали интерфейса: feedback, motion, focus, active states и reduced-motion behavior. Применяется, когда UI уже реализован и нужно убедиться, что критичные user actions ведут себя корректно во всех состояниях. Работает поверх `design-brief.md`, `screens.md`, `prototype-report.md` и `frontend-result.md`.

**Полная процедура, входы/выходы, gates и validation-команды — в [`agent-pack/skills/design-engineering/SKILL.md`](../../../agent-pack/skills/design-engineering/SKILL.md). Следуй ей.**

## Когда использовать
- Этап 08-frontend: проверка motion, interaction states и easing после реализации UI.
- Этап 11-qa: финальная проверка focus/hover/active/reduced-motion поведения.
- Поверхность мобильная (сценарий на телефоне, мобильные макеты, деплой открывают с телефона) — обязательна мобильная приёмка, см. ниже.
- Есть `figma-handoff-bundle.md` и нужно убедиться, что motion/state rules и component variants не потерялись при переносе в код.
- Нужно проверить Component Contract Matrix: Figma properties/values имеют React prop mapping.

## Ключевые шаги
- Прочитай `design-brief.md`, `screens.md`, `prototype-report.md`, `frontend-result.md`.
- Определи критичные user actions: primary CTA, navigation, form submit, modal open/close, selected row/card, filter/sort/search.
- Проверь каждый action в состояниях default, hover, focus, active/pressed, disabled, loading, error, success.
- Проверь reduced-motion behavior и focus visibility.
- Зафиксируй результат в `frontend-result.md`.

## Mobile Device Acceptance Gate (полная норма — §Mobile Device Acceptance Gate)

Без приёмки в **профиле устройства** (`isMobile: true`, `hasTouch: true`, настоящие тач-жесты) мобильная поверхность не получает `success` на 08 (потолок `partial`) и на 11 не получает **ни `pass`, ни `pass_with_known_limitations`** — непроверенный обязательный гейт это `blocker`, вердикт `blocked`. Узкий desktop-вьюпорт (`setViewportSize`) приёмкой **не считается** — картинка похожа, touch/safe-area/`visualViewport` не воспроизводятся.

Минимум пять сценариев с `pass|fail|not_applicable`:
1. скролл от касания **интерактивного** элемента, обе оси (ассерт по `scrollTop`/`scrollLeft`);
2. fixed/sticky и фон против `env(safe-area-inset-*)`, `viewport-fit=cover`, `theme-color`;
3. появление оверлея/баннера/клавиатуры: не обрезан, не сжимает страницу;
4. композиция минимум на **двух** реальных ширинах устройств (например 390 и 430);
5. `scrollTop` не прыгает при смене состояния (частая причина — размонтирование узла).

Каркас не пишется с нуля: шаблон [`agent-pack/templates/mobile-acceptance.template.mjs`](../../../agent-pack/templates/mobile-acceptance.template.mjs) копируется в тесты продукта (`mobile-acceptance.check.mjs`), заполняется только блок `CONFIG`; незаполненный падает с кодом 2, заполненный пишет `mobile-acceptance.json` со статусами пяти сценариев и строкой `engine_limitation`. В этом репозитории запуск — `yarn qa:mobile` поверх поднятого превью сборки.

Строка `engine_limitation` (Chromium ≠ WebKit, что именно не проверено, подтверждение — живое устройство) пишется **каждый раз**; если приёмка выполнена, но строки нет, статус не выше `pass_with_known_limitations`. Результат — в `frontend-result.md` / секцию `Responsive` в `qa-report.md`.

## Обязательные проверки
- `yarn typecheck`
- `yarn build`
