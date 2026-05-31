---
schema_payload:
  status: "ready"
  inputs_used:
    - "prd.md"
    - "ia-brief.md"
    - "reference-analysis.md"
  visual_direction: "Премиальный B2B минимализм: кристально белый фон, контрастная типографика, корпоративный синий акцентный цвет #005FFC, тонкие рамки карточек #E1E5EB, скругления углов 12px/16px и мягкие парящие тени. Плавные микроанимации при наведении."
  sections:
    - name: "Header"
      layout: "Flexbox row, sticky"
    - name: "Hero"
      layout: "Grid 2 columns (Text left, Graphic right)"
    - name: "Trust Badges"
      layout: "Flexbox row, wrapped cards"
    - name: "Tariff Grid"
      layout: "Vertical tabs + Grid 3 columns"
    - name: "Use Cases"
      layout: "Grid 3 columns with hover scale cards"
    - name: "FAQ"
      layout: "Accordion vertical list"
    - name: "Footer"
      layout: "Grid 4 columns, light grey background"
  components:
    - "Navigation Header"
    - "CTO Button (#005FFC)"
    - "Trust Badge Card"
    - "Tab Controller"
    - "Tariff Card (vCPU, RAM, SSD, Price)"
    - "B2B Lead Modal with Form Inputs"
    - "Accordion FAQ Item"
  responsive_notes:
    - "На мобильных экранах (360px-480px) трехколоночная сетка тарифов перестраивается в вертикальный стек в одну колонку"
    - "Форма сбора лидов в модальном окне занимает 90% ширины экрана, шрифты масштабируются для удобного клика пальцем"
  accessibility_notes:
    - "Уровень контрастности текста и кнопок соответствует стандарту AAA (минимально 4.5:1)"
    - "Все поля формы имеют явные метки <label> и плейсхолдеры"
    - "Клавиатурная навигация (focus states) четко выражена синим контуром"
---

# Design Brief

## Inputs Used

- `prd.md`
- `ia-brief.md`
- `reference-analysis.md`

## Visual Direction
Строгий светлый премиальный дизайн. Токены извлечены непосредственно из светлой версии референса VK Cloud.

## Sections
Секции структурированы для последовательного убеждения технического B2B-клиента.

## Components
Основные UI-компоненты спроектированы в едином стиле с использованием скруглений `12px`/`16px`.

## Responsive Notes
100% адаптивность. Элементы не сжимаются и не ломают сетку.

## Accessibility Notes
Высокая читаемость и доступность для клавиатуры и экранных дикторов.
