# Handoff Bundle

> Сжатая передача между стадиями. Обновляется **после каждого этапа** — это то, что читает
> следующий специалист вместо всей переписки (State Truncation Gate, `CLAUDE.md` §3).
>
> Обычно файл создаёт скаффолд `yarn workflow:start`; шаблон нужен, когда запуск собирается
> вручную. Заголовки `## Goal`, `## Completed Artifacts` и `## Next Required Artifact`
> обязательны — их проверяет `yarn workflow:validate`, порядок и формулировки остальных
> свободны. Процедура ведения — навык `run-ledger`.

## Goal

<одна фраза: что делаем и для кого>

## Workflow Profile

standard | reference

## Workflow Scale

full | increment | patch

## Visual Reference Required

true | false — при `true` в конце обязательна попиксельная сверка (`09-visual-reference`)

## Inputs Used

- <что реально прочитано на последнем этапе: файл, раздел, ссылка>

## Completed Artifacts

- `run-plan.md`
- `handoff-bundle.md`
- `stage-gate-ledger.md`
- <дальше по мере готовности стадий>

## Current Decisions

- <решение, которое downstream обязан соблюдать, а не пересматривать>

## Assumptions

- <допущение, принятое из-за отсутствия данных; помечается как допущение, а не факт>

## Risks

- <риск с последствием, а не «возможны проблемы»>

## Open Questions

- <вопрос, ответ на который меняет работу следующей стадии>

## Next Required Artifact

<имя файла следующего артефакта и что должно в нём появиться>
