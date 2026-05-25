# Proto Personas

## Inputs Used

- `research-summary.md`
- `competitive-analysis.md`

## Proto Personas

| Persona | Segment | Need | Main objection | Evidence status |
|---|---|---|---|---|
| Илья, 27 | eSIM buyer | Подключить eSIM на новый смартфон | Совместимость и инструкция | proto |
| Марина, 34 | Second-number buyer | Физическая SIM для объявлений и сервисов | Доставка и безопасность данных | proto |
| Сергей, 41 | Small business owner | 5-10 SIM для сотрудников | Документы, контроль, поддержка | proto |

## Decision Context

- Илья принимает решение быстро, если видит проверку устройства и понятную активацию.
- Марине важнее прозрачность доставки и отсутствие сомнительных обещаний.
- Сергею нужна форма заявки с количеством SIM, контактом и возможностью консультации.

## Validation Plan

- Провести 5 интервью с покупателями eSIM.
- Проверить, понимают ли пользователи difference between physical SIM and eSIM.
- Проверить, не вызывает ли форма заявки недоверие из-за персональных данных.

## Agent Output

```yaml
agent_name: research
status: success
inputs_used:
  - research-summary.md
outputs:
  proto_personas: proto-personas.md
assumptions:
  - Personas are proto, not validated segments.
risks:
  - Real demand split between eSIM and physical SIM is unknown.
open_questions:
  - Which segment should be primary after traffic data?
recommended_next_step: Use personas in PRD and IA.
```
