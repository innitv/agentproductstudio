# Переработка исследования под новые правила публикации

## Статус

| Поле | Значение |
|---|---|
| Run | `outputs/a3pay-cjm-new/2026-06-07` |
| Дата проверки | 2026-06-09 |
| Статус | `dry_run_pass` |
| Внешняя запись | не выполнялась |
| Текущий public export | `notion-research-export-ru.md` |
| Рекомендуемый Notion layout | `integrated_hybrid` |

## Что было проверено

Проверка выполнялась не как правка старой опубликованной страницы, а как приведение последнего локального research run к новым исходным правилам:

- public export не содержит служебные блоки `Artifact Metadata`, `Inputs Used`, `Surface Output Contract`, dry-run gates, provider/debug policy и raw workflow dump;
- полный research pack покрыт в export: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, `cjm-map.md`, `opportunity-roadmap.md`, `source-log.md`;
- Notion dry-run выбирает `integrated_hybrid`: narrative child pages плюс рабочие базы как linked views внутри смысловых страниц;
- personas, CJM, конкурентная матрица и ICE/RICE распознаны как таблицы или схемы;
- roadmap связан с CJM friction и validation method;
- Anti-AI-Slop lint не нашел generic claims, переносимых фраз и повторяющихся строк таблиц.

## Исправление последней версии 2026-06-09

После повторной синхронизации правил последняя локальная версия исследования дополнительно исправлена:

- в `research-summary.md`, `opportunity-roadmap.md` и `notion-research-export-ru.md` русифицированы видимые table headers (`Факт`, `Основание`, `Продуктовый вывод`, `Охват`, `Влияние`, `Уверенность`, `Усилие`, `Приоритет`);
- из public research export убраны provider/debug open questions: DeepSeek/Gemini не фигурируют как product-readiness blocker или публичное условие готовности;
- PRD export очищен от advisory provider rows: готовность PRD теперь зависит от legal/rails review, партнеров, интервью и прототипных тестов;
- публичный Notion layout переименован с `08 План валидации, провайдеры и источники` на `08 План валидации и источники`;
- `notion-research-export-ru.md` пересобран из исходных research artifacts, а не отредактирован вручную как отдельная копия.

## Public / Internal Split

| Тип содержания | Где живет | Публиковать в Notion public hub |
|---|---|---|
| Сводка, карта связей, цепочка решений, CJM, конкурентный анализ, персоны, интервью, SWOT, roadmap, источники | `notion-research-export-ru.md` | да |
| Approval records, старые publication history, block counts, dry-run details, deviations | `notion-publication-result.md`, `stage-gate-ledger.md`, `release-notes.md` | нет |
| PRD как продуктовый артефакт | `prd.md`, `notion-prd-export.md` | только как отдельная PRD child page после approval |
| Рабочие базы | Notion database layer + embedded linked views | да, но внутри `integrated_hybrid`, не как detached-only слой |

## Entity Ownership Map

| Сущность | Owner page для публикации | Рабочая форма |
|---|---|---|
| Personas | `03 Прото-персоны` | narrative + database linked view |
| CJM frictions | `05 CJM и сценарии` | narrative + database linked view |
| Opportunities / ICE-RICE backlog | `06 ICE/RICE бэклог и инициативы` | narrative + database linked view |
| Requirements / user stories | `10 PRD для MVP` | PRD page + database linked view |
| Validation claims | `08 План валидации и источники` | narrative + database linked view |
| Sources | `08 План валидации и источники` | source table/database linked view |

## Validation

| Проверка | Команда / evidence | Результат |
|---|---|---|
| Research Content Lint для всего research pack | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07` | pass |
| Research Content Lint для public export | `yarn research:lint outputs\a3pay-cjm-new\2026-06-07\notion-research-export-ru.md` | pass |
| Notion hub dry-run | `node tooling/scripts/publish-notion-research-hub.mjs ... --dry-run` | pass |
| Publication allowed | dry-run JSON | `true` |
| Publication blockers | dry-run JSON | none |
| Layout strategy | dry-run JSON | `integrated_hybrid` |
| Planned child pages | dry-run JSON | 8 |
| Estimated blocks | dry-run JSON | 453 |
| Publication Shape Gate | dry-run JSON | pass |
| Publication Completeness Gate | dry-run JSON | pass, export/source ratio `0.959` |
| Publication Editor Pass | dry-run JSON | pass |

## Что не делалось

- Не выполнялась новая публикация в Notion.
- Не удалялись и не переписывались исторические publication records старых Notion-версий.
- Не закрывались product-readiness риски: legal/rails review и реальные пользовательские интервью остаются нужны для статуса `ready`. DeepSeek/Gemini больше не являются product-readiness blocker и не входят в default-run.
- DeepSeek/Gemini advisory check на `01-research` не входит в default-run. В этом pass старый auto-run был выполнен штатным runner: DeepSeek прошёл, Gemini вернул `503 Service Unavailable`; это записано как historical advisory failure и не блокирует readiness само по себе. Run остается `partial` из-за legal/rails и custdev gaps.

## Следующее действие

Если нужно обновить внешнюю Notion-страницу, следующий шаг: запросить отдельное approval на exact target и запустить `publish-notion-research-hub.mjs` уже без `--dry-run`.
