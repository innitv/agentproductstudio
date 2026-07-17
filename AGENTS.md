# AGENTS.md — указатель

Этот проект переведён на **Claude Code**. Канонические правила проекта, маршрутизация, язык, approvals, gates и source-of-truth находятся в [CLAUDE.md](CLAUDE.md).

Этот файл сохранён как совместимость для сторонних агентов (Codex, OpenCode и т.д.), которые по умолчанию читают `AGENTS.md`: все они должны следовать `CLAUDE.md`.

- Полные правила: `CLAUDE.md`
- Нативные субагенты Claude Code: `.claude/agents/*.md`
- Навыки: `.claude/skills/*/SKILL.md`
- Плагин Figma-знания: `plugins/figma-ds/` (`/figma-ds:build`, `/figma-ds:standard`)
- Slash-команды: `.claude/commands/*.md`
- Конфигурация: `.claude/settings.json` и `.mcp.json`
- Детальные контракты специалистов: `agent-pack/agent-contracts/*.agent.md`
- Полный product pipeline: `agent-pack/workflows/artifact-driven-pipeline.md`
