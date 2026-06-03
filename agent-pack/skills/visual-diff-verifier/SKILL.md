---
id: visual-diff-verifier
title: "Visual Reference Screenshot Verifier"
description: "Поблочная и скриншот-сверка готового интерфейса с визуальным референсом (desktop и mobile) для выявления любых композиционных расхождений"
platforms:
  - codex
  - open-code
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 09-visual-reference
  - 11-qa
required_inputs:
  - reference_analysis
  - design_brief
  - screens
  - frontend_result
required_outputs:
  - visual_reference_review
approval_actions: []
validation_commands:
  - yarn reference:scan
  - yarn reference:diff
  - yarn reference:section-diff
contract_schema: agent-pack/templates/skill.template.md
---

# Навык: Visual Reference Screenshot Verifier

## 1. Context (Контекст)
Если пользователь предоставил скриншоты или URL визуального референса (просит сделать "как этот сайт"), финальная сдача проекта категорически заблокирована до проведения глубокой визуальной сверки. Этот навык описывает пошаговую процедуру проведения сравнения "пиксель-в-пиксель" для десктопной и мобильной версий, а также составление отчета `visual-reference-review.md`.

## 2. Triggers (Триггеры)
Агент применяет этот навык на этапе:
- **Стадия воркфлоу**: `11-qa` (контроль качества).
- **Событие**: Наличие в репозитории файла `reference-analysis.md` или флага `visual-reference` в воркфлоу.
- **Инструмент**: Запущенный локальный сервер разработки `apps/frontend` и Playwright MCP.

## 3. Action Step-by-Step (Алгоритм выполнения)

### Шаг 1: Подготовка скриншотов референса
1. Запустить команду `yarn reference:scan <reference-url> [slug]` для захвата скриншотов референсного сайта (desktop и mobile) во всех viewport.
2. Сохранить полученные скриншоты в папку `reports/visual-review/reference/`.

### Шаг 2: Снятие скриншотов текущей реализации
1. Убедиться, что локальный dev-сервер запущен: `npm run dev` или `yarn build` + локальный хостинг.
2. Сделать полные скриншоты страниц (full-page screenshots) нашей реализации с помощью Playwright для Desktop (1280x800) и Mobile (375x812).
3. Сохранить их в `reports/visual-review/implementation/`.

### Шаг 3: Проведение поблочного сравнения
1. Для каждой видимой секции снять пары reference/local с одинаковыми именами:
   - `reference-desktop-section-<name>.png` + `local-desktop-section-<name>.png`.
   - `reference-mobile-section-<name>.png` + `local-mobile-section-<name>.png`.
2. Для каждой пары запустить пиксельное сравнение:
   - Использовать встроенные утилиты `yarn reference:diff` и `yarn reference:section-diff`.
   - Сохранить `visual-diff-result.json` и `visual-diff-summary.md`.
3. Зафиксировать расхождения в сетке, отступах (margin/padding), размерах шрифтов, контрастности кнопок и CTA-элементов.

### Шаг 4: Формирование отчета `visual-reference-review.md`
Записать отчет в текущую run-папку, заполнив следующие разделы:
- **Status**: `pass` (если расхождения < 5%), `partial` или `blocked` (если есть явные визуальные баги).
- **Section-by-section comparison**: подробная таблица сравнения с указанием ссылок на скриншоты.
- **Specific corrections needed**: список правок, которые необходимо внести во фронтенд-код, если проверка не пройдена.

## 4. Validation / Quality Gates (Критерии качества)
- [ ] Скриншоты сняты как для desktop-версии, так и для mobile.
- [ ] Для каждой видимой секции существуют пары reference/local desktop и mobile.
- [ ] `visual-diff-result.json` создан через `yarn reference:diff` и прочитан перед вердиктом.
- [ ] Ошибки верстки, такие как наложение текста, вылезание блоков за рамки экрана (horizontal overflow) или битые картинки, полностью отсутствуют.
- [ ] Разница (pixel-diff percentage) на первом экране (Hero) составляет менее 3%.
