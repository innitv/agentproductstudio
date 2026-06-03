# Чек-лист ревью трассировки

## Route

- Выбранный маршрут соответствует запросу.
- Ненужные специалисты не вызывались.
- Handoff использован только при необходимости передачи диалога или отдельной ветки.

## Outputs

- Каждый specialist вернул результат по контракту.
- Артефакты соответствуют шаблонам.
- `partial` и `blocked` имеют понятную причину.

## Guardrails

- Input guardrail проверил исходный запрос.
- Tool guardrails применены к рискованным tools.
- Output guardrail проверил финальный ответ.
- Approval decisions зафиксированы.

## Quality

- Research claims имеют источники или `needs validation`.
- Copy claims не содержат недоказанных обещаний.
- QA verdict согласован с найденными проблемами.
- Release notes содержат validation и rollback notes.

## Чувствительные данные

- Secrets не попали в artifacts.
- Secrets не попали в logs.
- Sensitive data в traces отключена или отредактирована.
