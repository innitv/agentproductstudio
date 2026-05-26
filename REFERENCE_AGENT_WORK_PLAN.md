# Reference Agent Work Plan

Дата: 2026-05-26

## Цель

Довести reference-driven часть агента до проверяемого цикла:

1. Сканировать референс через Firecrawl и Playwright.
2. Снимать локальную реализацию в тех же viewport.
3. Генерировать человекочитаемый `visual-reference-review.md`.
4. Фиксировать отличия, остаточные риски и пути к evidence-файлам.
5. Поддерживать QA-команды, которые проверяют именно текущий reference-flow.

## План выполнения

1. Зафиксировать план в репозитории.
   - Статус: completed
   - Выход: `REFERENCE_AGENT_WORK_PLAN.md`

2. Изучить текущие entrypoints.
   - Статус: completed
   - Проверить: `runtime/typescript/reference-scan.ts`, Firecrawl helper, Playwright config, `COMMANDS.md`, frontend tests.

3. Добавить visual review generator.
   - Статус: completed
   - Выход: CLI-команда, которая берёт папку `reports/visual-review/<slug>` и пишет `visual-reference-review.md`.
   - Минимум: paths, viewport evidence, Firecrawl markdown summary, checklist по секциям, known gaps.

4. Интегрировать команду в package scripts и документацию.
   - Статус: completed
   - Выход: `package.json`, `COMMANDS.md`, runtime README при необходимости.

5. Прогнать проверку.
   - Статус: completed
   - Команды: `yarn build`, `yarn qa:playwright`, smoke для visual review generator.

## Критерии готовности

- Есть сохранённый план.
- Есть CLI для создания review artifact без ручного копирования.
- Review artifact ссылается на Firecrawl и Playwright evidence.
- Playwright QA проходит.
- Ограничения честно зафиксированы: без оригинальных ассетов и автоматического pixel diff результат не считается pixel-perfect.
