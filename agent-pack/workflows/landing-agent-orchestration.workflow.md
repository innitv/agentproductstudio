# Рабочий процесс оркестрации лендинга субагентами

## Цель

Превратить один продуктовый запрос пользователя в проверенный пакет артефактов и, если разрешено пропускными воротами (gates), в готовую реализацию фронтенда.

## Оркестрация в стиле менеджера (Manager-Style)

- `orchestrator` владеет диалогом с пользователем, маршрутизацией, контролем пропускных ворот и финальным ответом.
- Специалисты — это ограниченные возможности (capabilities), которые обычно вызываются как инструменты (tools).
- Передача управления (handoff) допускается только тогда, когда специалист должен владеть отдельной веткой работы.
- Финальный ответ собирает только `orchestrator`, а не специалист.
- Любой переход между агентами оформляется как delegation packet: stage id, цель, входы, разрешенные outputs, запреты, approval state, quality gate и следующий потребитель результата.
- Оркестратор отвечает за консенсус и разрешение противоречий между research, PRD, IA, design, frontend и QA; специалист не может молча изменить scope или продуктовую трактовку.

## Три оси запуска (profile · scale · track)

Граф ниже описывает **полную** последовательность. Какая её часть обязательна в конкретном run, решают три независимые оси, зафиксированные на `00-intake` и записанные в `run-state.json`. Машинный источник — `runtime/typescript/workflow.manifest.ts`; полное описание — CLAUDE.md §0.2 (scale) и §0.3 (track).

| Ось | Значения | Что режет |
|---|---|---|
| `profile` | `standard` · `reference` | наличие `09-visual-reference` и reference-артефактов |
| `scale` | `full` (дефолт) · `increment` · `patch` | глубину: какие стадии обязательны |
| `track` | `code` (дефолт студии) · `figma` | состав Figma-специфичных секций `screens.md`/`frontend-result.md` |

Масштаб (`scale`): `increment` исключает `01-research`, `02-prd`, `03-ia`, `07-prototype`, `10-test-bench`; `patch` — то же плюс `05-copy`, `06-screens`, `12-release`. `00-intake` и `11-qa` входят во все масштабы. Исключённые стадии записываются в `stage-gate-ledger.md` как `skipped_by_scale`; молчаливый пропуск — ошибка валидатора. Не уверен — `full`.

Маршрут (`track`): дефолт студии — `code` (спецификация экранов + shadcn/ui + Storybook как витрина). Маршрут-условные Figma-**артефакты** на нём не создаются и записи в ledger **не требуют вовсе**; маршрут-условные **секции** закрываются строкой `skipped_by_track` в таблице «Секции вне маршрута». `skipped_with_reason: Figma не участвует` писать запрещено. Маршрут читается из `run-state.json`, а не выводится по наличию `figma-layout-ir.json`, и задним числом не меняется. Каноническая формулировка — `agent-pack/workflows/claude-operating-rules.md` §5, раздел «Маршрут (`track`)».

**Оси режут глубину, а не защиту.** Approval gates, run ledger, Anti-AI-Slop, Russian Publication Gate, Storybook Acceptance Gate и машинная приёмка действуют одинаково на любой комбинации.

## Граф этапов (Stage Graph)

```text
00-intake (Вводные данные)
  -> 01-research (Исследование)
  -> 02-prd (Продуктовые требования)
  -> 03-ia (Информационная архитектура)
  -> 04-design (Дизайн-бриф)
  -> 05-copy (Копирайтинг)
  -> 06-screens (Экраны)
  -> 07-prototype (Прототип)
  -> 08-frontend (Фронтенд)
  -> 09-visual-reference-review (Сверка с визуальным референсом, если задан референс)
  -> 10-test-bench (Тест-бенч)
  -> 11-qa (QA-ревью)
  -> 12-release (Релиз)
```

Опционально:

```text
02-prd -> notion-prd-export.md (Плоская публикация PRD)
```

Экспорт интерактивной Agile-доски и пользовательских историй в Notion:
На этапе `12-release`, если в окружении, файле `.env` или scaffold-файлах обнаружены `NOTION_TOKEN` и родительский ID/URL страницы, движок может подготовить plan/dry-run интерактивной Agile-доски. Внешняя запись выполняется только после exact human approval и создает базы данных Персон и связанных с ними через Relation Пользовательских историй с чек-листами Acceptance Criteria.

Публикация в Notion — это внешняя запись, которая требует целевой страницы/базы данных и явного подтверждения человека (human approval).

## Возможности (Capabilities)

| Этап | Агент | Обязательные артефакты |
|---|---|---|
| 00-intake | orchestrator | `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md`, `recursive-brief.md` |
| 01-research | research | `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md` |
| 02-prd | prd | `prd.md` |
| 03-ia | ia | `ia-brief.md` |
| 04-design | design | `design-brief.md`; плюс `reference-analysis.md` только для профиля референса |
| 05-copy | copywriting | `copy-deck.md` |
| 06-screens | design-generator | `screens.md` |
| 07-prototype | prototype | `prototype-report.md` |
| 08-frontend | frontend | `frontend-result.md` |
| 09-visual-reference-review | qa-review | `visual-reference-review.md` только для профиля референса |
| 10-test-bench | test-bench | `test-bench-result.md` |
| 11-qa | qa-review | `qa-report.md` |
| 12-release | release | `release-notes.md` |

## Правила параллельного выполнения

`orchestrator` может запускать специалистов параллельно только тогда, когда их входные данные уже готовы и их области записи не конфликтуют.

Разрешенный параллелизм:

- Тест-бенч может стартовать после `recursive-brief.md` как сопутствующая работа, но финальный `test-bench-result.md` обязан обновиться после завершения PRD, IA, прототипа, фронтенда и сверки с референсом.
- Работа над исследованием может разделяться параллельно на поиск источников, конкурентный анализ, составление персон, синтетические интервью и SWOT, но этап исследования не считается завершенным, пока не созданы все обязательные артефакты исследования.
- IA и раннее исследование дизайна могут готовиться параллельно только после готовности PRD и результатов исследования, но последующие этапы `screens`, `prototype` и `frontend` должны использовать финальные переданные артефакты.

Запрещенный параллелизм:

- Фронтенд не может начаться до завершения этапов PRD, IA, дизайна, копирайта, экранов и прототипа — **кроме стадий, легитимно исключённых текущим `scale`** (они записаны как `skipped_by_scale` до старта) и кроме явного режима быстрого наброска (`quick draft`). Отсутствие артефакта по масштабу и отсутствие по забывчивости — разные вещи: первое зафиксировано в ledger заранее, второе блокирует frontend.
- `quick draft` допустим только по явному запросу пользователя, обязан фиксировать skipped/partial upstream artifacts и не может завершаться как финальный `success`. Для reference-driven задач режим `quick draft` запрещен.
- QA не может начаться до завершения фронтенда, сверки с референсом (если применимо) и финального тест-бенча.
- Релиз не может начаться, пока QA не пройдет успешно или не зафиксирует блокировку.
- Специалисты не формируют финальный ответ пользователю; `orchestrator` обобщает статус.

## Delegation Packet (Контракт передачи специалисту)

Перед запуском stage Оркестратор фиксирует в `handoff-bundle.md` или stage notes:

| Поле | Смысл |
|---|---|
| `stage_id` | Какой этап выполняется |
| `owner_agent` | Какой специалист владеет результатом |
| `objective` | Один проверяемый результат stage |
| `required_inputs` | Конкретные артефакты и секции, которые нужно прочитать |
| `allowed_outputs` | Какие файлы можно создать или обновить |
| `forbidden_actions` | Что нельзя делать без approval или отдельного stage |
| `quality_gate` | Какие проверки должны пройти перед handoff |
| `expected_envelope` | Какой `outputs.<artifact_name>` обязан вернуть специалист |
| `handoff_consumer` | Какой следующий агент использует результат |

Если delegation packet неполный, stage не должен стартовать.

## Consensus & Conflict Pass

Если результаты специалистов, источники или пользовательские вводные конфликтуют, Оркестратор обязан:

1. Зафиксировать конфликт в `stage-gate-ledger.md`.
2. Определить владельца решения: research, PRD, IA, design, frontend, QA или пользователь.
3. Выбрать решение по иерархии: project rules -> approval gates -> source-backed evidence -> user constraints -> quality gates -> downstream impact -> expert synthesis.
4. Записать rejected alternatives и причину отказа.
5. Пометить downstream artifacts как invalid/needs update, если конфликт меняет scope, claims, user flow или visual direction.

## Контроль во время выполнения (Runtime Enforcement)

- Источник определений этапов: `runtime/typescript/workflow-stages.ts`.
- Частичная валидация: `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through <stage-id>`.
- Полная валидация стандартного профиля: `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard`.
- Полная валидация профиля референса: `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile reference`.
- Ошибки блокируют завершение последующих этапов.
- Предупреждения (warnings) должны переноситься в риски/TODO.

## Исследовательская блокировка (Research Lock)

PRD и последующие этапы заблокированы, пока результаты исследования не будут включать JTBD, персон (proto personas), симулированные интервью (simulated interviews), конкурентный анализ, SWOT, статус источников/доказательств и план валидации.

## Блокировка фронтенда (Frontend Lock)

Фронтенд заблокирован до тех пор, пока артефакты PRD, IA, дизайна, копирайта, экранов и прототипа не будут полностью готовы. Два исключения, и только они:

1. **Стадия исключена текущим масштабом** (`increment`/`patch`, CLAUDE.md §0.2) и записана в `stage-gate-ledger.md` как `skipped_by_scale` **до** старта стадии. Это не обход блокировки, а объявленный заранее объём: на `patch` `05-copy`, `06-screens` и `07-prototype` не производятся вовсе, и требовать их — ошибка. Занижать масштаб задним числом нельзя, валидатор отклонит.
2. **Режим `quick draft`**, явно запрошенный пользователем и помеченный как draft/partial.

Ничем другим блокировка не снимается. Frontend Lock без этой оговорки запрещал бы то, что манифест разрешает.

## Витрина и машинная приёмка (Storybook Acceptance Gate)

Для surface `product_ui|frontend|prototype` `08-frontend` не может закрыться как `success` без витрины и машинного вердикта — на **обоих** маршрутах:

- история Storybook на каждый реализованный компонент с покрытием применимых состояний; composition story с тегом `vr-page` на каждый экран. Экран = composition story = роут приложения: две расходящиеся сборки одного экрана — `process_deviation`;
- компоненты по умолчанию из shadcn/ui (`apps/frontend/src/components/shadcn/`, `yarn shadcn add <component>`), токены — DTCG в `design/tokens/` (`yarn tokens:build`);
- три оси вердикта с результатом в `stage-gate-ledger.md`: `yarn vr:test` → `reports/visual-regression/summary.json`, `yarn test-storybook` → exit code, `yarn qa:mobile` → `test-results/mobile-acceptance/mobile-acceptance.json`;
- `yarn vr:test`/`yarn vr:update` исполняются только внутри пиннутого Docker-образа Playwright: эталон с Windows-хоста на Linux не сравнивается, а молча создаёт новый файл. Недоступность оси не понижает требование до «посмотрел глазами» — `skipped_with_reason` и статус surface не выше `partial`.

Полный текст — `agent-pack/workflows/artifact-driven-pipeline.md`, раздел «Обязательный слой витрины и машинной приёмки».

## Блокировка референса (Visual Reference Lock)

Если пользователь предоставляет визуальный референс или просит соответствовать сайту, сверка с визуальным референсом блокируется до создания фронтенда и должна завершиться до финализации тест-бенча, QA и релиза.

## Обработка ошибок (Failure Handling)

- `partial`: продолжение работы возможно только тогда, когда риски явно зафиксированы, а последующие утверждения сохраняют пометку `needs validation` (требует валидации).
- `blocked`: остановка работы и запрос недостающих данных, подтверждения или источника.
- `qa fail`: возврат к соответствующему этапу с последующим повторным запуском валидации.
- `upstream change`: если пользователь меняет вводные после PRD/IA/design, Оркестратор запускает re-orchestration loop: affected artifacts, downstream invalidation, reusable artifacts, required rerun stages.
- `specialist drift`: если специалист добавил неподтвержденный scope, claims или visual direction, результат возвращается на stage review и не передается downstream как `success`.
