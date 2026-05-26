# Reference Section Diff Work Plan

Дата: 2026-05-26

## Цель

Развить visual diff от сравнения полной страницы к section-aware проверке. Агент должен видеть, какая именно зона расходится с референсом: hero, logo strip, how, modules, steps, advantages, tariffs, FAQ, form/footer.

## План выполнения

1. Сохранить план section-aware visual diff.
   - Статус: completed
   - Выход: `REFERENCE_SECTION_DIFF_WORK_PLAN.md`

2. Добавить секционную модель и CLI для section diff.
   - Статус: completed
   - Выход: `reference:section-diff`.

3. Снимать или использовать section screenshots для reference и local.
   - Статус: completed
   - Подход: Playwright screenshots по CSS selectors, если секция найдена.

4. Интегрировать section diff в review artifact.
   - Статус: completed
   - `visual-reference-review.md` должен показывать таблицу section metrics.

5. Обновить документацию и выполнить QA.
   - Статус: completed
   - Команды: `yarn typecheck`, `yarn reference:section-diff`, `yarn reference:review`, `yarn qa:quick`, `yarn qa:playwright`.

## Начальный набор секций

| Label | Selector |
|---|---|
| hero | `.hero-blue` |
| logo-strip | `.operator-strip` |
| how | `#how` |
| modules | `#solutions` |
| steps | `.blue-steps` |
| advantages | `.advantages` |
| tariffs | `#tariffs` |
| faq | `.faq-panel` |
| form | `#contact-form` |
| footer | `.a3-footer` |

## Ограничения

- Section screenshots работают только если локальная и reference страницы имеют совместимые selectors.
- Для внешнего референса без совпадающих selectors нужен fallback на full-page diff и manual review.
- Первый этап использует screenshots, не DOM geometry matching по содержанию.
