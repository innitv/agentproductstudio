# Анализ связности и улучшения вывода исследования A3 Pay

## Статус

`completed`

## Inputs used

- [research-summary.md](research-summary.md)
- [competitive-analysis.md](competitive-analysis.md)
- [cjm-map.md](cjm-map.md)
- [opportunity-roadmap.md](opportunity-roadmap.md)
- [proto-personas.md](proto-personas.md)
- [synthetic-interviews.md](synthetic-interviews.md)
- [swot.md](swot.md)
- [notion-research-export-ru.md](notion-research-export-ru.md)

## Что было не так

В исследовании уже была правильная структура, но часть текста звучала слишком машинно: `orchestration`, `rails`, `wedge`, `trust layer`, `flows`, `workflows`. Такие слова полезны внутри команды, но в research artifact они часто создают ощущение, что вывод собран из шаблонных продуктовых клише. Пользовательская проблема из-за этого терялась: не "человеку страшно переводить предоплату мастеру", а "нужен trust layer".

Вторая проблема: CJM был в основном таблицей. Таблица покрывала stages, боли и возможности A3 Pay, но не объясняла жизненный контекст: кто платит, что именно происходит, где человек сомневается, что он спрашивает себя в этот момент и какой следующий шаг должен подсказать продукт.

Третья проблема: roadmap выглядел как список инициатив. Не хватало явной связи `CJM friction -> P0 initiative -> prototype check -> risk`. Из-за этого инициативы казались правильными, но не до конца доказанными через пользовательский путь.

## Что исправлено локально

- В [cjm-map.md](cjm-map.md) добавлен сквозной user flow A3 Pay: от возникновения платежного обязательства до повтора.
- Каждый из 6 CJM-сценариев переписан как жизненная ситуация с персоной, ключевыми кейсами и таблицей user flow.
- В [cjm-map.md](cjm-map.md) добавлена связь CJM с приоритетами: P0/P1/P2 инициативы привязаны к конкретному трению.
- В [research-summary.md](research-summary.md) заменены AI-sounding формулировки на более приземленное объяснение: получатель, назначение, способ оплаты, чек, статус, возврат и повтор.
- В [research-summary.md](research-summary.md) раздел `Decision trail` переименован и переписан как [Цепочка решений](research-summary.md#цепочка-решений).
- В [opportunity-roadmap.md](opportunity-roadmap.md) добавлена таблица `Связь P0 с CJM`, чтобы roadmap не был отдельной тезисной выжимкой.
- В [opportunity-roadmap.md](opportunity-roadmap.md) добавлено обоснование confidence для ICE, чтобы оценки не выглядели произвольными.

## Анти-AI-slop критерии для следующих правок

| Критерий | Как проверять | Где применено |
|---|---|---|
| Сначала жизнь, потом термин | В каждом ключевом выводе должно быть понятно, что произошло с человеком или бизнесом | [cjm-map.md](cjm-map.md), [research-summary.md](research-summary.md) |
| Не оставлять абстрактные англицизмы без нужды | `orchestration`, `rails`, `wedge`, `trust layer` заменять на русское объяснение, если это не технический термин | [research-summary.md](research-summary.md), [opportunity-roadmap.md](opportunity-roadmap.md) |
| Не делать только тезисную выжимку | После краткого вывода должен быть сценарий, кейс, flow или проверка | [cjm-map.md](cjm-map.md) |
| Связывать артефакты между собой | Каждая P0-инициатива должна ссылаться на боль в CJM и способ проверки | [opportunity-roadmap.md](opportunity-roadmap.md) |
| Объяснять метрики через поведение | Метрика должна отвечать на вопрос "что пользователь сделал лучше", а не просто звучать бизнесово | [cjm-map.md](cjm-map.md), [opportunity-roadmap.md](opportunity-roadmap.md) |

## Что еще стоит сделать перед повторной внешней публикацией

| Улучшение | Почему важно | Где применить |
|---|---|---|
| Регенерировать `notion-research-export-ru.md` из обновленных артефактов | Сейчас локальные core artifacts улучшены, но опубликованный Notion export может содержать старые формулировки | [notion-research-export-ru.md](notion-research-export-ru.md), Notion hub после approval |
| Обновить Figma board текстами из новой CJM | Текущая Figma-визуализация может оставаться более сжатой, чем новая CJM-версия | [figma-visualization-result.md](figma-visualization-result.md), Figma после approval |
| Добавить отдельный `assumption register` | Открытые зоны есть, но их стоит превратить в управляемый список допущений с owner, risk и validation method | [research-summary.md](research-summary.md#неизвестные-и-открытые-зоны), [handoff-bundle.md](handoff-bundle.md) |

## Рекомендуемый следующий шаг

Если нужна повторная публикация во внешние поверхности, сначала сделать локальную регенерацию export и dry-run, затем запросить отдельное approval на Notion/Figma write. Без внешней записи текущая правка уже улучшает локальный research pack и может использоваться как новая база для последующих артефактов.
