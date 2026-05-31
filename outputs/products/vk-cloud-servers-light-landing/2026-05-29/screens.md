---
schema_payload:
  status: "ready"
  inputs_used:
    - "ia-brief.md"
    - "design-brief.md"
    - "copy-deck.md"
  screen_list:
    - name: "VK Cloud Servers Light Landing"
      sections:
        - "Header (Sticky Navigation)"
        - "Hero Section (H1, Lead, Two Buttons, Graphic Asset)"
        - "Trust Plaquettes Row (SLA, FZ-152, ISO, DDoS)"
        - "Tariff Segment (Tab Panel: General / Compute / Memory, 3 Pricing Cards)"
        - "B2B Lead Dialog Modal (Modal Overlay with form fields)"
        - "Accordion FAQ Section (3 Items)"
        - "Footer Block (Legal data, copyright)"
  desktop_specification: "Контент выровнен по центру с максимальной шириной контейнера 1200px. Сетка тарифов отображает 3 карточки в один ряд с плавным hover-эффектом (приподнятие на 4px, увеличение тени)."
  mobile_specification: "Ширина контейнера 100%. Навигационное меню скрывается в бургер. Тарифные карточки выстраиваются в вертикальную колонку. Поля формы модального окна занимают всю доступную ширину."
  states:
    - "Default View (Основной лендинг)"
    - "Modal Open View (Открытая форма лидогенерации)"
    - "Form Error State (Ошибки валидации email/пустых полей)"
    - "Success Feedback State (Показ сообщения об успешной отправке заявки)"
---

# Screens Specification

## Inputs Used

- `ia-brief.md`
- `design-brief.md`
- `copy-deck.md`

## Screen
Единый высококонверсионный экран-лендинг со встроенным модальным окном заказа.

## Mobile
Спецификация для отображения на экранах телефонов с сохранением высокой читаемости и юзабилити.
