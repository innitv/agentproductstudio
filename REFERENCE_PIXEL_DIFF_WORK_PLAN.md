# Reference Pixel Diff Work Plan

Дата: 2026-05-26

## Цель

Добавить к reference-driven агенту автоматическую численную проверку визуального отличия между reference и local screenshots.

## План выполнения

1. Сохранить план pixel-diff развития reference agent.
   - Статус: completed
   - Выход: `REFERENCE_PIXEL_DIFF_WORK_PLAN.md`

2. Добавить PNG reader и image diff runtime без новых зависимостей.
   - Статус: completed
   - Подход: читать PNG через Node `zlib`, поддержать основные Playwright PNG screenshots, считать diff по пересекающейся области.

3. Сделать CLI-команду `reference:diff`.
   - Статус: completed
   - Output: `visual-diff-result.json` и `visual-diff-summary.md`.

4. Интегрировать diff summary в `reference:review`.
   - Статус: completed
   - Review должен ссылаться на diff output и показывать gate status.

5. Обновить документацию и прогнать QA.
   - Статус: completed
   - Команды: `yarn typecheck`, `yarn reference:diff`, `yarn reference:review`, `yarn qa:quick`, `yarn qa:playwright`.

## Метрики

- `mismatchRatio`: доля пикселей, где RGB delta выше threshold.
- `meanDelta`: средняя RGB-разница по пересекающейся области.
- `maxDelta`: максимальная RGB-разница.
- `dimensionDelta`: разница ширины/высоты между reference и local screenshots.

## Ограничения

- Первый этап сравнивает только PNG screenshots.
- Сравнение выполняется по общей пересекающейся области, потому что высота страниц может отличаться.
- Это не заменяет ручной section-by-section review, но даёт объективный сигнал для gate.
