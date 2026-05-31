---
schema_payload:
  status: "ready"
  inputs_used:
    - "ia-brief.md"
    - "screens.md"
  prototype_type: "Manual Clickable HTML/JS Prototype integrated directly in Frontend App"
  start_screen: "Лендинг виртуальных серверов (Главный экран)"
  transition_map:
    - from: "Кнопка 'Выбрать' на карте тарифа General"
      trigger: "click"
      to: "B2B Lead Modal с предустановленным полем нагрузки 'General Purpose'"
    - from: "Кнопка 'Выбрать' на карте тарифа Compute"
      trigger: "click"
      to: "B2B Lead Modal с предустановленным полем нагрузки 'Compute Optimized'"
    - from: "Кнопка 'Выбрать' на карте тарифа Memory"
      trigger: "click"
      to: "B2B Lead Modal с предустановленным полем нагрузки 'Memory Optimized'"
    - from: "Кнопка 'Отправить' в B2B Lead Modal"
      trigger: "submit valid form"
      to: "Success Screen внутри модального окна с подтверждением звонка за 15 минут"
    - from: "Кнопка 'Закрыть' (крестик или оверлей)"
      trigger: "click"
      to: "Возврат к экрану Лендинга"
  completion_step: "Показ красивой зеленой галочки успеха с текстом 'Заявка отправлена. Специалист свяжется с вами в течение 15 минут для расчета конфигурации.'"
  missing_interactions:
    - "Прямая отправка данных в CRM (симулируется успешным AJAX сабмитом с логированием в консоль)"
    - "Реальная онлайн-оплата (сознательно исключена из скоупа)"
---

# Prototype Clickable Flow Report

## Inputs Used

- `ia-brief.md`
- `screens.md`

## Prototype Type
Clickable HTML/CSS/JS интерактивный прототип, встроенный прямо в клиентское приложение.

## Start Screen
Начальный экран лендинга.

## Transition Map
Таблица переходов и логика работы форм.

## Missing Interactions
Список ограничений прототипа.
