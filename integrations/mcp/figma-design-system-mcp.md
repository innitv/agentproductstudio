# Figma Design System MCP

## Назначение

Figma MCP используется как design source layer для извлечения design context: variables, tokens, components, component usage, layout rules, screen frames и Code Connect mappings. Итогом работы проекта остается локальный артефакт, а не состояние внешнего Figma-файла.

## Recommended Server

Основной вариант:

```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
```

Локальный desktop fallback:

```toml
[mcp_servers.figmaDesktop]
url = "http://127.0.0.1:3845/mcp"
```

Desktop fallback требует:

- Figma Desktop app.
- Открытый Figma Design file.
- Dev Mode.
- Включенный desktop MCP server в inspect panel.

## Codex CLI

```powershell
codex mcp add figma --url https://mcp.figma.com/mcp
```

После команды нужен OAuth flow в Figma. Не сохраняй OAuth-секреты или session data в репозитории.

## Intake Contract

Для прогона design system по ссылке нужны:

- `figma_url`: ссылка на file/frame/layer.
- `scope`: design system, конкретный frame, screen set или component library.
- `target`: что нужно получить: design brief, screens, tokens, frontend mapping или QA checklist.
- `write_allowed`: по умолчанию `false`.

## Output Artifacts

Рекомендуемые долгоживущие design-source результаты:

- `design/figma/<design-system-slug>/design-system-audit.md`.
- `design/figma/<design-system-slug>/token-map.md`.
- `design/figma/<design-system-slug>/component-map.md`.

Рекомендуемые workflow-specific результаты:

- `agent-pack/artifacts/design/design-brief.template.md` или `outputs/<slug>/<date>/design-brief.md`.
- `outputs/<slug>/<date>/figma-design-system-audit.md`.
- `outputs/<slug>/<date>/figma-token-map.md` только для task-specific Figma frames, не для общей библиотеки.
- `outputs/<slug>/<date>/figma-component-map.md` только для task-specific Figma frames, не для общей библиотеки.

Если Figma library является общей дизайн-системой, не дублируй её в каждом `outputs/` run. Сохраняй её в `design/figma/`, а workflow artifacts должны ссылаться на эти файлы в `Inputs Used`.

## Design System Audit Template

```md
# Figma Design System Audit

## Source

- Figma URL:
- Scope:
- Date:
- MCP mode: remote | desktop

## Variables And Tokens

- Color:
- Type:
- Spacing:
- Radius:
- Effects:
- Breakpoints:

## Components

| Component | Variants | States | Notes |
|---|---|---|---|

## Layout Rules

- Grid:
- Auto layout:
- Responsive behavior:
- Density:

## Assets

- Icons:
- Illustrations:
- Images:

## Frontend Mapping

| Figma entity | Code target | Status |
|---|---|---|

## Risks

- Missing tokens:
- Inconsistent components:
- Unknown states:
- Accessibility gaps:

## Next Actions

- 
```

## Write to Canvas (Запись на холст)

Для создания и редактирования макетов на холсте Figma используется универсальный инструмент **`use_figma`**. Подробное описание формата запросов, структуры нод и привязки к дизайн-токенам системы A3 изложено в документе:

- [figma-canvas-write-guide.md](file:///c:/Project/product-agent-studio/integrations/mcp/figma-canvas-write-guide.md)

При использовании записи на холст:
1. Агент обязан скомпилировать JSON-структуру элементов в соответствии с дизайн-системой A3.
2. Перед выполнением запроса в Figma MCP агент должен вывести payload в чат и запросить явное текстовое подтверждение пользователя.
3. Инструмент `use_figma` выполняет операции создания фреймов (`FRAME`), текстовых полей (`TEXT`) и Auto Layout групп.

## Guardrails

- Read-only по умолчанию.
- Активация режима записи требует `write_allowed: true` во входном контракте и явного подтверждения от пользователя перед каждым MCP-запросом.
- `write to canvas`, `create file`, `update components`, редактирование переменных и добавление комментариев требуют отдельной `figma_write` авторизации (human approval).
- Запрещается несанкционированно перезаписывать или удалять существующие элементы дизайна вне области макета, предоставленной пользователем.
- При записи строго следовать руководству [figma-canvas-write-guide.md](file:///c:/Project/product-agent-studio/integrations/mcp/figma-canvas-write-guide.md).
- Не прогоняй весь тяжелый файл целиком, если достаточно frame/node link.
- Не сохраняй private file dumps в публичные artifacts.
- Claims из Figma не считаются research evidence без отдельной проверки.
