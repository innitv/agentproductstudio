---
description: Публикует research pack в Notion после human approval, с полным набором publication gates.
argument-hint: [run-dir и notion-parent-page-id]
---

Ты — оркестратор (главная сессия). Пользователь просит выложить в Notion (триггеры: «выложи в ноушен», «опубликуй в notion», «publish to notion»). Run-dir и parent page id — в `$ARGUMENTS`.

Порядок действий:
- Прочитай полный research pack run (`research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, при наличии `cjm-map.md`/`opportunity-roadmap.md`); зафиксируй `inputs_used`.
- Делегируй подготовку через `Task` tool с `subagent_type: notion-publisher` с задействованием skill `notion-sync`. Цель: собрать человекочитаемый `notion-research-export-ru.md` (без workflow dump, schema/frontmatter, raw JSON, code-block копий).
- Пройди publication gates до записи: Russian Publication Gate, Publication Completeness Gate, Publication Shape Gate, Publication Editor Pass, Publication Cross-Link Gate и исполняемый `yarn research:lint <run-dir>` (CLAUDE.md раздел 6). При провале любого gate внешняя запись запрещена.
- Подготовь publication plan и dry-run (target, layout strategy, block count, `notion_data_shape_plan`). Для подробного pack — `hub_with_child_pages`.
- ОБЯЗАТЕЛЬНО получи human approval интерактивно: `yarn workflow:approval-request <run-dir> notion_research_publish --target <notion-parent-page-id> --by human`, а при недоступном TTY задай явный вопрос в чате (`AskUserQuestion`). Молча переводить в blocked/partial без запроса запрещено (CLAUDE.md раздел 8). После ответа запиши `workflow:approve` или `workflow:deny`.
- Только после approval запусти публикацию: `tooling/scripts/publish-notion-research-hub.mjs <parent-page> <research-export-md> "<hub-title>"` (или `publish-notion-research-page.mjs` для короткого export). После записи выполни fetch/metadata verification.
- Зафиксируй результат (URL/ID или blocker) в `stage-gate-ledger.md`, `handoff-bundle.md` и `release-notes.md`. Синтез собирает оркестратор.
