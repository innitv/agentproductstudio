## Что изменилось

<!-- Одно-два предложения: что и зачем. Не «update files». -->

## Тип изменения

- [ ] Правила и контракты (`CLAUDE.md`, `agent-pack/**`, `.claude/**`)
- [ ] Runtime (`runtime/typescript/**`, `tooling/**`)
- [ ] Frontend (`apps/**`)
- [ ] Документация
- [ ] Уборка / архивация

## Проверки

<!-- Отметь то, что реально запускал, и приложи результат. -->

- [ ] `yarn qa:quick` (typecheck + validate:config + docs:audit)
- [ ] `yarn workflow:test-agentic` — при изменении агентов, skills, manifest или approval-слоя
- [ ] `yarn qa:playwright` — при изменении frontend
- [ ] `yarn git:check-staged` — scope коммита не содержит `outputs/**`, media и логов

## Согласованность контрактов

При изменении агента, маршрута, skill или approval — синхронизированы ли все слои?

- [ ] `agent-pack/agent-contracts/*.agent.md` (детальный контракт, включая `skills:`)
- [ ] `.claude/agents/*.md` (нативная обёртка)
- [ ] `runtime/typescript/workflow.manifest.ts` и `route.config.ts`
- [ ] Тесты и шаблоны

## Риски и что осталось

<!-- Известные ограничения, TODO, deviation records. Если ничего — так и напиши. -->
