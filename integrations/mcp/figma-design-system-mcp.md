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

Рекомендуемые локальные результаты:

- `agent-pack/artifacts/design/design-brief.template.md` или `outputs/<slug>/<date>/design-brief.md`.
- `outputs/<slug>/<date>/figma-design-system-audit.md`.
- `outputs/<slug>/<date>/figma-token-map.md`.
- `outputs/<slug>/<date>/figma-component-map.md`.

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

## Guardrails

- Read-only by default.
- `write to canvas`, `create file`, `update components`, variable edits and comments require separate approval.
- Не прогоняй весь тяжелый файл целиком, если достаточно frame/node link.
- Не сохраняй private file dumps в публичные artifacts.
- Claims из Figma не считаются research evidence без отдельной проверки.
