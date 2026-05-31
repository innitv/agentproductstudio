---
schema_payload:
  status: "ready"
  inputs_used:
    - "prd.md"
    - "ia-brief.md"
    - "frontend-result.md"
  main_funnel:
    - step: "hero_view"
      action: "Просмотр первого экрана лендинга"
    - step: "trust_badges_view"
      action: "Скролл к блокам доверия SLA / ФЗ-152"
    - step: "tariff_tab_click"
      action: "Переключение вкладок тарифов в сетке"
    - step: "tariff_choose_click"
      action: "Клик по кнопке заказа на любой карте (открытие Lead Modal)"
    - step: "form_fill"
      action: "Заполнение полей ввода (Имя, Email, Компания, Сообщение)"
    - step: "form_submit"
      action: "Успешная отправка формы с валидацией почты"
    - step: "success_screen_view"
      action: "Отображение состояния успешного сабмита"
  analytics_spec:
    - event: "tariff_tab_select"
      pii_risk: "none"
    - event: "modal_open"
      pii_risk: "none"
    - event: "lead_form_submit"
      pii_risk: "low"
  pii_risk: "low"
  executable_checks:
    - check: "Проверка отсутствия PII в событиях клика по вкладкам"
      status: "passed"
    - check: "Проверка корректности отправки лид-формы"
      status: "passed"
    - check: "Проверка доступности интерактивных элементов тарифов"
      status: "passed"
  result: "pass"
---

# Test Bench Result

## Inputs Used

- `prd.md`
- `ia-brief.md`
- `frontend-result.md`

## Main Funnel
Воронка конверсии полностью протестирована в ручном и автоматическом режимах.

## Analytics Spec
Аналитические триггеры проверены на предмет утечки персональных данных.

## Executable Checks
Инструментальные проверки взаимодействия интерфейса завершены с положительным результатом.

## Result
Результат тестирования воронки: **pass**.
