# План аудита Figma ↔ frontend

Дата: `2026-06-22`

## Цель

Восстановить фактический процесс создания и переноса макетов между Figma и кодом, найти причины визуального и компонентного дрейфа и предложить исполняемый процесс, в котором Figma components, variables, React props, states и проверочные screenshots связаны одним контрактом.

## Этапы

| Этап | Статус | Результат |
|---|---|---|
| Проверить Git-историю и run artifacts A3/A3Pay | completed | Восстановлена цепочка Figma v1 → v2 → v3 → v4 и серия frontend-правок |
| Проверить текущие Figma/workflow rules | completed | Найдены сильные новые gates и конфликтующее устаревшее руководство записи |
| Проверить component/token mapping | completed | Подтверждено отсутствие Code Connect, Storybook и исполняемой parity-проверки |
| Изучить похожие agent-driven решения на GitHub | completed | Сопоставлены Code Connect, Framelink MCP, TalkToFigma MCP, Tokens Studio и screenshot-to-code loop |
| Сформировать целевой процесс и roadmap | completed | Подготовлен аудит с приоритетами P0–P2 и acceptance criteria |

## Non-goals

- Не изменять Figma-файлы.
- Не переписывать frontend.
- Не внедрять инструменты до отдельного решения пользователя.
