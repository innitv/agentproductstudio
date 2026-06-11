# Матрица подтверждений

| Action | Runtime action id | Approval |
|---|---|---|
| Notion research child page publish/update | `notion_research_publish` | required with exact parent page target |
| Notion PRD export | `notion_prd_export` | required with exact page/database target |
| Notion Agile Board export | `notion_agile_export` | required with exact parent page/database target |
| Figma canvas write/update | `figma_write` | required with exact file/node target |
| External research API call with project/product context | `external_research_provider_call` | required with exact provider/run target unless user already approved this provider for the run; not required for explicitly enabled non-blocking DeepSeek/Gemini advisory checks on `01-research` |
| Agentic specialist model-provider call | `model_provider_call` | required with exact `openai_agents_sdk:<owner>:<stage-id>` target |
| Deploy | `deploy` | required with exact environment/target when available |
| Git commit/push or other external repository write | `git_write` | required with exact repo/branch target unless user explicitly requested the exact action in the current task |
| Delete data | `delete_data` | required with exact path/resource target |
| Change secrets | `change_secrets` | required with exact secret name/scope target |
| Send external messages | `send_external_message` | required with exact recipient/channel target |
| Other external write | `external_write` | required with exact target |
| Local artifact write | local file operation | not required |
| Local validation command | local command | not required |
| Required source-backed provider unavailable or approval denied | stage status | blocked/partial, must be recorded |

Exception: DeepSeek/Gemini calls on `01-research` are not part of the default run. If explicitly enabled for contradiction review, gap review and claims-to-validate, they are non-blocking advisory checks rather than approval-gated provider opt-ins, must not publish or mutate any external surface, and must be logged in the run ledger. If unavailable or noisy, record an advisory failure or skipped reason; do not keep the stage partial solely because of them.

Target matching is strict: a targetless approval never satisfies a targeted request, and a targeted approval never satisfies a targetless request.

## Interactive Approval Protocol

Любой action из матрицы, который требует approval, должен проходить через интерактивный вопрос:

- сначала используй `yarn workflow:approval-request <run> <action> --target <exact-target> --by human --reason "<reason>"`;
- если TTY недоступен, задай отдельный заметный вопрос в чате до действия и только после ответа запиши `workflow:approve` или `workflow:deny`;
- общий запрос пользователя «сделай/опубликуй/продолжай» не заменяет интерактивный approval, если action требует exact target или отдельный waiver;
- для `model_provider_call` и `external_research_provider_call` вопрос должен явно называть provider, stage/run target и какие данные покинут локальную песочницу; исключение — явно включенные non-blocking DeepSeek/Gemini advisory checks на `01-research`, которые логируются без approval-вопроса;
- если интерактивный вопрос был пропущен, запиши process deviation record в `stage-gate-ledger.md`, `handoff-bundle.md` и `release-notes.md` вместо того, чтобы помечать gate как корректно пройденный.
