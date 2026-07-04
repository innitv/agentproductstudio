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

## Claude Code CLI

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

- `design/figma/registry.json`.
- `design/figma/<design-system-slug>/ds.config.json`.
- `design/figma/<design-system-slug>/source.md`.
- `design/figma/<design-system-slug>/_scan/census.md`.
- `design/figma/<design-system-slug>/_scan/manifest.md`.
- `design/figma/<design-system-slug>/foundation.md`.
- `design/figma/<design-system-slug>/components.md`.
- `design/figma/<design-system-slug>/components/<category>.md`.
- `design/figma/<design-system-slug>/design-system-audit.md`.
- `design/figma/<design-system-slug>/token-map.md` и `component-map.md` допустимы как legacy/human-readable aliases.

Рекомендуемые workflow-specific результаты:

- `agent-pack/artifacts/design/design-brief.template.md` или `outputs/<slug>/<date>/design-brief.md`.
- `outputs/<slug>/<date>/figma-design-system-audit.md`.
- `outputs/<slug>/<date>/figma-token-map.md` только для task-specific Figma frames, не для общей библиотеки.
- `outputs/<slug>/<date>/figma-component-map.md` только для task-specific Figma frames, не для общей библиотеки.

Если Figma library является общей дизайн-системой, не дублируй её в каждом `outputs/` run. Сохраняй её в `design/figma/`, а workflow artifacts должны ссылаться на эти файлы в `Inputs Used`.

## Large DS Ingest

Для больших библиотек используй `agent-pack/workflows/figma-ds-ingest.workflow.md` и skill `figma-ds-ingest`.

Порядок:

1. Census-first: страницы, counts, Variable collections.
2. Chunk manifest: порции `pending|done|blocked`.
3. Foundation: Variables по коллекциям и modes.
4. Components: compact map с Node ID и variant matrix.
5. Deep profiles: только нужные категории.
6. Contract: `component-contracts.json` и Code Connect/fallback.

После ingest агент обязан читать локальный индекс до обращения в Figma.

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

Для создания и редактирования макетов на холсте Figma используется официальный plugin-context **`use_figma`** или эквивалентный доступный write tool. Нормативный процесс выбора дизайн-системы, двухпроходной сборки, component contracts и roundtrip описан здесь:

- [figma-canvas-write-guide.md](file:///c:/Project/product-agent-studio/integrations/mcp/figma-canvas-write-guide.md)

При использовании записи на холст:

1. Сначала выбрать `design_system_mode`: `reuse|extend|product_specific|bespoke`. A3 не является обязательным foundation.
2. Сначала выполнить visual calibration на 2-3 экранах, затем systemization без visual regression.
3. Перед write получить exact approval на target/scope и `write_allowed=true`.
4. Выполнять небольшие plugin-context patches и проверять inventory/screenshots после логических блоков.
5. Для повторяемых компонентов вести Component Contract Matrix и Code Connect/fallback mapping.

## Guardrails

- Read-only по умолчанию.
- Активация режима записи требует `write_allowed: true` во входном контракте и явного подтверждения от пользователя перед каждым MCP-запросом.
- `write to canvas`, `create file`, `update components`, редактирование переменных и добавление комментариев требуют отдельной `figma_write` авторизации (human approval).
- Запрещается несанкционированно перезаписывать или удалять существующие элементы дизайна вне области макета, предоставленной пользователем.
- При записи строго следовать руководству [figma-canvas-write-guide.md](file:///c:/Project/product-agent-studio/integrations/mcp/figma-canvas-write-guide.md); pseudo-REST `action/create_node/payload` не использовать.
- Не прогоняй весь тяжелый файл целиком, если достаточно frame/node link.
- Не сохраняй private file dumps в публичные artifacts.
- Claims из Figma не считаются research evidence без отдельной проверки.
