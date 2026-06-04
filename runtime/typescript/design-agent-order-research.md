# Research: Порядок Design Agents И Skills

Дата: 2026-06-04

## Цель

Зафиксировать, как должен работать дизайн-блок `product-agent-studio`: в каком порядке включать design skills, какие gates ставить перед Figma write, и какие практики из похожих agent/design workflow стоит адаптировать в наши инструкции.

## Использованные Внешние Реализации

| Источник | Что изучено | Что адаптируем |
|---|---|---|
| `figma/mcp-server-guide` | Remote Figma MCP, `use_figma`, skills для Figma canvas, правила структуры Figma файла | Figma write только через `use_figma`, после inspect/search design system, approval и screenshot verification |
| `figma-generate-design/SKILL.md` | Границы skill, prerequisites, hard gates перед canvas mutation, split между design-system components и pixel capture | В `figma-handoff` добавлен порядок: inspect -> handoff bundle -> approval -> write -> screenshot -> polish |
| `OpenCoworkAI/open-codesign` | Design как долгоживущий workspace, `DESIGN.md`/design artifacts как source of truth, локальная проверяемость | Не держать дизайн как один prompt; хранить style/design artifacts и canvas evidence |
| `lst97/claude-code-sub-agents` | Специализированные subagents, orchestration flow, UX/UI отдельными компетенциями | Явно разделять `design`, `design-generator`, frontend/QA design-engineering и Storybook evidence |
| `VoltAgent/awesome-design-md` | Markdown design system documents как контекст для AI UI generation | `STYLE_GUIDE.md` должен быть machine-readable enough для downstream agents, но человекочитаемым на русском |

## Итоговый Порядок

1. `reference-analysis.md`: создается после технического scan референса.
2. `style-decompose`: превращает референс в `STYLE_GUIDE.md`.
3. `design.agent`: создает `design-brief.md` на основе PRD, IA, research, reference/style guide.
4. `copywriting.agent`: создает `copy-deck.md`.
5. `design-generator.agent`: создает `design-generator-prompt.md`, затем `screens.md`.
6. `design-loop`: проверяет первые 2-3 экрана и пишет `design-loop-report.md`.
7. `figma-handoff`: готовит `figma-handoff-bundle.md`, canvas strategy, approval gate.
8. Figma MCP `use_figma`: пишет frames/components/screens, если есть approval и `write_allowed=true`.
9. `design-engineering`: проверяет motion/interaction на frontend/QA.
10. `ds-to-storybook`: создает `storybook-result.md`, если нужен component library export.

## Решения

- Anchor frame из Figma ссылки не обязан быть контейнером для всего результата. Если дизайн-доска читается лучше отдельными frames на canvas, агент должен создавать отдельные frames рядом.
- `figma-handoff-bundle.md` создается после `screens.md`, а не на раннем design этапе, потому что ему нужен полный component/screen inventory.
- Для reference-driven задач `STYLE_GUIDE.md` должен появляться до финального `design-brief.md`, чтобы дизайн не скатывался в generic UI.
- `design-loop-report.md` не является красивым отчетом ради отчета: если там unresolved style drift, frontend получает `partial`/`blocked`.
- Figma write нельзя имитировать текстовым JSON. В текущем MCP write выполняется через `use_figma`, после чего нужен screenshot/polish.

## Проверки После Изменений

- `yarn validate:config`
- `yarn docs:audit`
- `yarn workflow:test-skill-metadata`
- `git diff --check`
