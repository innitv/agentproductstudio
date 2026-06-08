# Lazyweb MCP

Lazyweb используется как evidence layer для продуктового дизайна: реальные product screenshots, UI references, product flows, паттерны экранов и design critique до генерации `design-brief.md`, `screens.md`, Figma handoff или frontend UI.

## Когда использовать

- UI-heavy или high-visual-risk задачи.
- Reference-driven workflow, где пользователь дал URL, screenshot, Figma/Dribbble/reference или просит «как этот сайт».
- Benchmark экранов: onboarding, pricing, paywall, dashboard, checkout, settings, forms, empty/loading/error states.
- Design critique существующего интерфейса.
- Поиск нестандартных cross-category идей.
- Monetization/A/B test research только при явном запросе и понимании, что `lazyweb-ab-test-research` может быть paid feature.

## Режимы skills

- `lazyweb-design-research`: глубокий benchmark, best practices, competitive design research.
- `lazyweb-quick-references`: быстрые примеры и screenshots без полного отчета.
- `lazyweb-design-improve`: critique или сравнение текущего UI с сильными примерами.
- `lazyweb-design-brainstorm`: нестандартные идеи из соседних категорий.
- `lazyweb-ab-test-research`: paywall/pricing/onboarding/monetization experiments при явном запросе.

## Ожидаемые MCP tools

После установки и reload клиента live MCP tool list обычно должен содержать:

- `lazyweb_health`
- `lazyweb_search`
- `lazyweb_find_similar`
- `lazyweb_compare_image`
- `lazyweb_list_categories`
- `lazyweb_list_collections`
- `lazyweb_get_workflows`
- `lazyweb_get_flows`
- `lazyweb_ab_test_research`

Перед использованием optional filters или backend aliases агент обязан проверить live tool schema. Не предполагай наличие `high_design_bar`, `lazyweb_find_experiments`, `lazyweb_recent_experiments` или `list_companies_by_categories`, пока они не видны в текущем MCP tool list.

## Правила безопасности

- Lazyweb MCP является внешним сервисом. Не отправляй приватные screenshots, Figma frames, локальный код, customer data, секреты или внутренние документы в `lazyweb_compare_image` без отдельного human approval.
- Lazyweb screenshots можно использовать как evidence для patterns, hierarchy, density, controls, flows и states.
- Lazyweb не считается источником market/legal/pricing facts и не заменяет Tavily/официальные источники для research findings.
- Запрещено копировать чужой trade dress, брендинг, композицию один-в-один или proprietary visual identity.

## Установка и проверка

Официальная установка:

```bash
curl -fsSL https://www.lazyweb.com/install.sh | bash
```

В Windows-среде Codex может потребоваться заменить `command = "sh"` на абсолютный путь к Git Bash:

```toml
[mcp_servers.lazyweb]
command = "C:\\Program Files\\Git\\bin\\bash.exe"
args = ["-lc", "TOKEN=\"${LAZYWEB_MCP_TOKEN:-}\"; if [ -z \"$TOKEN\" ] && [ -f \"$HOME/.lazyweb/lazyweb_mcp_token\" ]; then TOKEN=\"$(cat \"$HOME/.lazyweb/lazyweb_mcp_token\")\"; fi; exec yarn dlx mcp-remote https://www.lazyweb.com/mcp --header \"Authorization: Bearer $TOKEN\" --transport http-first"]
```

После установки нужен reload/restart Codex-клиента, чтобы новые `lazyweb_*` tools появились в текущей сессии.

First-run проверка после reload:

1. Проверить `codex mcp list`.
2. Убедиться, что `lazyweb` включен.
3. Убедиться, что `lazyweb_get_workflows` появился в live tool list.
4. Вызвать `lazyweb_get_workflows` с `operation=list` и `task_context="first run Lazyweb capabilities"`.
