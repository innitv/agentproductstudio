# Outputs

Эта папка предназначена для результатов конкретных запусков workflow.

Рекомендуемая структура:

```text
outputs/
  <project-slug>/
    <YYYY-MM-DD>/
      recursive-brief.md
      research-summary.md
      prd.md
      ia-brief.md
      design-brief.md
      screens.md
      copy-deck.md
      prototype-report.md
      frontend-result.md
      test-bench-result.md
      qa-report.md
      release-notes.md
```

Правила:

- Не сохранять секреты.
- Не сохранять приватные данные без необходимости.
- Claims без источников помечать `needs validation`.
- Prototype report должен содержать transition map и completion step.
- Test bench result не должен сохранять PII в событиях.
- Если проверка не запускалась, указывать причину в соответствующем отчёте.
