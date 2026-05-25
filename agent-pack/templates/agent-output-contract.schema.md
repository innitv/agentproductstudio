# Agent Output Contract

Каждый specialist возвращает структурированный результат:

```yaml
agent_name:
status: success|partial|blocked
summary:
inputs_used:
outputs:
assumptions:
risks:
open_questions:
recommended_next_step:
```

Правила:

- `inputs_used` обязан ссылаться на файлы из `outputs/<project-slug>/<YYYY-MM-DD>/`.
- `outputs` обязан содержать созданный артефакт stage.
- `partial` допустим только с risks/open_questions.
- `blocked` требует конкретного blocker и next required action.
