# GitHub, GitLab And Browser MCP

## Назначение

Этот проект использует GitHub/GitLab MCP как внешний repo layer для issues, pull requests, merge requests, code review и release handoff. Browser MCP используется для UX-проверок, конкурентного анализа, screenshot review и QA.

Эти MCP не являются обязательной частью роли агента. Они подключаются как заменяемые tools/capabilities после проверки прав, scope и approval.

## Approval

Перед живым подключением требуется human approval согласно `agent-pack/guardrails/approval-matrix.md`, потому что:

- GitHub/GitLab MCP может читать приватные репозитории и выполнять write-действия.
- Browser MCP может открывать внешние сайты и выполнять действия от имени пользователя.
- Токены и OAuth-сессии не должны попадать в репозиторий, traces или outputs.

Минимальный безопасный режим по умолчанию:

- GitHub: read-only mode, отдельный PAT с минимальными repo scopes.
- GitLab: OAuth через официальный GitLab MCP endpoint, без сохранения токенов в проекте.
- Browser: Playwright MCP без `browser_run_code_unsafe` для недоверенных страниц.

## Codex Config Example

Фрагмент для пользовательского `~/.codex/config.toml` или клиентского MCP config. Не коммить реальные токены.

```toml
[features]
"rmcp_client" = true

[mcp_servers.playwright]
command = "yarn"
args = ["dlx", "@playwright/mcp@latest"]

[mcp_servers.github]
command = "docker"
args = [
  "run",
  "-i",
  "--rm",
  "-e",
  "GITHUB_PERSONAL_ACCESS_TOKEN",
  "-e",
  "GITHUB_READ_ONLY=1",
  "ghcr.io/github/github-mcp-server"
]

[mcp_servers.github.env]
GITHUB_PERSONAL_ACCESS_TOKEN = "${GITHUB_PERSONAL_ACCESS_TOKEN}"
GITHUB_READ_ONLY = "1"

[mcp_servers.GitLab]
url = "https://gitlab.com/api/v4/mcp"
```

## CLI Flow

```powershell
codex mcp add playwright yarn dlx @playwright/mcp@latest
codex mcp add --url "https://gitlab.com/api/v4/mcp" GitLab
codex mcp login GitLab
```

GitHub официальный MCP server обычно запускается через Docker image `ghcr.io/github/github-mcp-server`; токен передается через env.

## Operational Rules

- Не включай write-tools без отдельного approval: issue comments, PR/MR creation, branch writes, commits, merge, CI/CD actions.
- Для review сначала используй read-only GitHub/GitLab tools и локальный code review из `agent-pack/quality/code_review.md`.
- Для browser QA фиксируй только очищенные выводы: URL, цель проверки, результат, screenshots/artifacts без sensitive data.
- Если MCP недоступен, используй локальные git/shell операции и markdown fallback.
