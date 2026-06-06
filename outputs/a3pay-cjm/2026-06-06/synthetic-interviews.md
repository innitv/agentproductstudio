# Synthetic Interviews

## Guardrail

Synthetic interviews are not evidence of real user behavior. They are only for hypothesis generation, language exploration, edge-case discovery and interview guide preparation.

## Inputs Used

- `research-summary.md`
- `proto-personas.md`

## Interview Metadata

- Goal: stress-test buyer objections and interview guide.
- Personas / segments: primary buyer, operational coordinator, hesitant visitor.
- Script version: generated from research stage runner.
- Evidence status: `synthetic`

## Simulated Interviews

| Interview | Persona | Scenario | Key quotes/paraphrases | Objections | Opportunity | Evidence status | Needs validation |
|---|---|---|---|---|---|---|---|
| 1 | Регулярный плательщик | ЖКХ, налоги, штрафы и регулярные услуги | Проверить, понимает ли пользователь цель "Оплатить обязательство без ручного ввода реквизитов и проверить, что поставщик принял платеж.", доверяет ли роли продукта и где возникают возражения: Начисления разбросаны по приложениям, реквизиты и статусы расходятся. | Claims need proof | Convert objections into validation questions | synthetic | yes |
| 2 | Контролирующий подписки | Подписки и повторные списания | Проверить, понимает ли пользователь цель "Разрешить регулярный платеж и контролировать будущие списания.", доверяет ли роли продукта и где возникают возражения: Пользователь боится скрытых списаний, а продавец теряет платежи из-за ошибок и отказов. | Claims need proof | Convert objections into validation questions | synthetic | yes |
| 3 | Организатор поездки | Путешествия | Проверить, понимает ли пользователь цель "Оплатить поездку, доплаты, страховку и возвраты в одном понятном маршруте.", доверяет ли роли продукта и где возникают возражения: Несколько поставщиков, предоплаты, изменения, возвраты и групповые платежи. | Claims need proof | Convert objections into validation questions | synthetic | yes |

## Patterns To Validate

| Pattern | Why it matters | How to validate with real evidence | Priority |
|---|---|---|---|
| Need for proof before CTA | Prevents misleading copy and drop-off | User interviews and analytics on CTA flow | high |
| Process clarity | Reduces uncertainty in high-intent flows | Usability test with first-time visitors | high |
