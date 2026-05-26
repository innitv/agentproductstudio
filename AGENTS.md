# AGENTS.md — правила проекта для Codex

## Роль Codex в проекте

Ты работаешь как инженерно-продуктовый агент, который помогает собирать продуктовые лендинги и прототипы через оркестр субагентов. Главная цель — превращать один продуктовый запрос в проверяемый набор артефактов: recursive brief, research summary, PRD, IA brief, design brief, screens, copy deck, prototype report, frontend implementation, visual reference review при наличии референса, test bench result, QA report и release notes.

## Рабочий язык

- Основной язык артефактов: русский.
- Названия файлов, переменных, компонентов и коммитов: английский, если это часть кода.
- Не смешивай языки внутри одного документа без причины.

## Архитектурный принцип

Используй manager-style оркестрацию по умолчанию:

1. `orchestrator` сохраняет ответственность за финальный результат.
2. Специалисты вызываются как ограниченные capabilities / agents-as-tools.
3. Handoff допустим только когда специалист должен сам владеть дальнейшим диалогом или отдельной веткой работы.
4. Каждый агент обязан возвращать структурированный результат по контракту из `agent-pack/templates/agent-output-contract.schema.md`.
5. Для продуктового pipeline не отдавай финальный результат напрямую от специалиста: финал собирает только `orchestrator`.
6. Форматы файлов и нейминг смотри в `agent-pack/templates/file-format-conventions.md`.

## Artifact-driven принцип

Работай по `agent-pack/workflows/artifact-driven-pipeline.md`.

- Артефакты в `outputs/<project-slug>/<YYYY-MM-DD>/` являются source of truth.
- Перед началом полноценного workflow создай `run-plan.md`, `handoff-bundle.md` и `stage-gate-ledger.md`.
- Каждый следующий этап обязан читать предыдущие артефакты и явно фиксировать `inputs_used`.
- После каждого этапа обновляй `handoff-bundle.md`: completed artifacts, decisions, assumptions, risks, open questions, next required artifact.
- После каждого этапа обновляй `stage-gate-ledger.md`: stage status, required artifacts, gate notes, validation state.
- Для каждого полноценного workflow публикация research в Notion обязательна перед финальным ответом. Публикуй только человекочитаемый research pack в отдельную child page: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, `reference-analysis.md` при наличии. Не публикуй весь workflow dump, schema/frontmatter, machine-readable payloads или code-block копии всех артефактов. Если `NOTION_TOKEN` и parent page доступны, запроси human approval на внешнюю запись и выполни research-page публикацию. Если parent page или approval недоступны, зафиксируй blocker/partial в `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `release-notes.md`; не завершай финальный статус как `success` молча без Notion research page.
- Research этап всегда создаёт отдельные `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`; если артефакт невозможен, создай его со статусом `blocked` или `skipped_with_reason`.
- Для `deep_research` обязательный multi-source default: `tavily` + `deepseek` + `gemini`. Tavily даёт source-backed web/API evidence, DeepSeek и Gemini используются обязательно для research checks, contradiction review и claims-to-validate, но их synthesis не считается source-backed evidence без внешних источников.
- Не начинай frontend до PRD, IA, design, screens, copy и prototype artifacts, кроме явного режима `quick draft`.
- Если пользователь даёт visual reference, URL референса или просит "как этот сайт", обязательно сделай full-page screenshot-сверку desktop и mobile до финального QA/release: сними скриншоты всего референса и всей текущей реализации, сравни все видимые блоки, компоненты, стили, сетку, типографику, визуальную плотность, CTA, карточки, формы/контролы, media, footer и responsive. Первый экран проверяй отдельно как high-priority, но не ограничивайся им. Если сайт использует lazy loading, scroll animations или `whileInView`, дополнительно сделай scroll-through/section screenshots, чтобы убедиться, что все блоки реально появляются. Результат фиксируй в `visual-reference-review.md`.
- Если пользователь даёт visual reference, frontend нельзя начинать с общей интерпретации "в стиле". Сначала создай section-by-section visual spec в `reference-analysis.md`: hero/nav, фон, цвета, typography scale, spacing, layout grid, section order, cards, CTA, forms/controls, media, footer, mobile behavior и конкретные allowed/disallowed patterns. Frontend заблокирован, пока этот visual spec не создан и не прочитан в `design-brief.md` и `screens.md`.
- Для reference-driven задач финальная сверка не может быть общей формулировкой "похоже". `visual-reference-review.md` обязан сравнить каждый блок reference с соответствующим блоком реализации и перечислить конкретные corrections. Если реализация заметно уходит в шаблонный стиль, вернись к frontend и исправь до финального ответа.
- Если работа была начата не по pipeline, остановись, восстанови недостающие артефакты и отметь нарушение в `run-plan.md`.
- **Правило Figma-макетов**: Подключи Figma на этапе дизайна. Если пользователь явно запрашивает отрисовку макетов в Figma (при этом параметр `write_allowed` в Figma MCP должен быть `true` и получено явное одобрение пользователя на внешнюю запись), создай фреймы/макеты непосредственно на холсте Figma перед переходом к разработке. В противном случае (по умолчанию, если явного запроса не было) веди дизайн исключительно в виде текстовых локальных спецификаций (`design-brief.md`, `screens.md`).
- Test Bench может стартовать параллельно после brief, но финальный `test-bench-result` обязан обновиться после prototype/frontend.

## Целевой продуктовый процесс

1. Intake: рекурсивный брифинг в 3 фазы — расширение, углубление, консолидация.
2. Research: факты, аудитории, JTBD, конкуренты, evidence, unknowns.
3. PRD: problem, goals, scope, requirements, MoSCoW, acceptance criteria, analytics.
4. IA: главный экран, главное действие, sitemap, primary user flow.
5. Design: user journey, секции, компоненты, responsive и accessibility notes.
6. Screens: screen specification или Figma-ready screens.
7. Prototype: transition map, clickable prototype или manual prototype instructions.
8. Copywriting: hero, CTA, секции, FAQ, SEO, claims to validate.
9. Frontend: реализация интерфейса, состояния, адаптивность, аналитика.
10. Visual Reference Review: если был visual reference, full-page и section/scroll-through screenshot-сверка всего сайта.
11. Test Bench: funnel analytics по главному сценарию и test bench result.
12. QA Review: PRD fit, UX, prototype flow, visual reference review, accessibility, responsive, secrets, проверки.
13. Release: changed files, artifacts, validation, deployment notes, rollback notes.
14. Notion Research Publication: публикация человекочитаемой research-only child page в Notion или явный blocker/partial, если публикация невозможна.

`orchestrator` сам решает фактический порядок запуска субагентов по зависимостям, доступным входам и рискам. Он может запускать независимые capability параллельно, но не должен пропускать обязательные продуктовые артефакты без явной причины в `assumptions` или `risks`.

## Субагенты

Смотри определения:

- `agent-pack/agents/orchestrator.agent.md`
- `agent-pack/agents/research.agent.md`
- `agent-pack/agents/prd.agent.md`
- `agent-pack/agents/notion-publisher.agent.md`
- `agent-pack/agents/design.agent.md`
- `agent-pack/agents/ia.agent.md`
- `agent-pack/agents/design-generator.agent.md`
- `agent-pack/agents/prototype.agent.md`
- `agent-pack/agents/copywriting.agent.md`
- `agent-pack/agents/frontend.agent.md`
- `agent-pack/agents/test-bench.agent.md`
- `agent-pack/agents/qa-review.agent.md`
- `agent-pack/agents/release.agent.md`

## Quality Gates

Перед завершением задачи проверь:

- Соответствие PRD.
- Наличие recursive brief с expansion/deepening/consolidation.
- Наличие MoSCoW приоритизации требований и фичей.
- Наличие источников для research-выводов.
- Логичность структуры продукта, IA и лендинга.
- Согласованность IA/screens/prototype flow.
- Если был visual reference: наличие `reference-analysis.md`, full-page desktop/mobile screenshots референса и реализации, `visual-reference-review.md` с конкретными отличиями и решениями по всем секциям/компонентам/стилям.
- Если был visual reference: наличие section-by-section visual spec и доказательство, что frontend не ушёл в шаблонный стиль вместо структурного соответствия референсу.
- Доступность интерфейса.
- Адаптивность.
- Корректность funnel analytics.
- Отсутствие секретов в коде.
- Успешный lint/typecheck/test/build, если команды доступны.
- Соответствие `agent-pack/quality/quality-gates.md`.
- Соответствие guardrails из `agent-pack/guardrails/guardrails.policy.md`.
- Успешный `yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --profile standard` для полного workflow без visual reference или `--profile reference` для reference-driven workflow; errors блокируют финальный статус `success`.
- Наличие Notion research page publication record в `stage-gate-ledger.md` и `release-notes.md`; отсутствие research-only child page публикации блокирует финальный статус `success`, кроме случая явного blocker/partial с причиной.
- Если задача OpenAI-related, сверку с OpenAI Docs MCP или официальной документацией.

## Ревью кода

Для ревью используй `agent-pack/quality/code_review.md`. Приоритет:

1. Ошибки, которые ломают пользовательский сценарий.
2. Безопасность и утечки секретов.
3. Архитектурные нарушения.
4. Доступность и UX.
5. Производительность.
6. Читаемость.

## Работа с неизвестностью

- Не выдумывай факты исследования.
- Помечай гипотезы как гипотезы.
- Если данных нет, укажи что именно нужно проверить.
- Не заменяй требуемый источник, API, MCP, visual reference check или Notion publication собственным предположением или более удобным инструментом. Если пользователь или workflow требует конкретный provider/tool, используй его или зафиксируй blocker/partial.
- Не обходи approval: если для нужного источника/API/Notion/внешней записи требуется human approval, запроси approval до действия. Если approval не получен, останови соответствующий stage со статусом `blocked`/`partial`, а не продолжай как будто источник выполнен.
- Не заполняй gaps "разумными" фактами. Разумные допущения допустимы только в `Assumptions`, не в Findings/PRD/copy/frontend claims, и не могут заменять evidence или required provider result.
- Не блокируй работу из-за неполных данных только там, где pipeline допускает hypothesis work; при этом downstream статус должен оставаться `partial`/`needs_validation`, если обязательный источник или проверка не выполнены.

## MCP и инструменты

Перед использованием внешнего MCP проверь:

- Какие права он получает.
- Какие данные покидают проект.
- Нужен ли human approval.
- Можно ли заменить инструмент локальной операцией.

Если workflow уже требует конкретный внешний provider/API/MCP, локальная операция не является заменой. Локальная операция допустима только как fallback с явным `needs_validation` и записью provider failure в artifacts.

Всегда используй OpenAI developer documentation MCP server, если нужно работать с OpenAI API, ChatGPT Apps SDK, Codex, Agents SDK, MCP или связанной документацией. Официальный сервер: `https://developers.openai.com/mcp`.

Для действий с риском требуй human approval: деплой, удаление данных, массовые изменения, отправка внешних сообщений, изменение секретов, подключение MCP с широкими правами.

Матрица approval: `agent-pack/guardrails/approval-matrix.md`.
Политика sensitive data: `agent-pack/guardrails/sensitive-data.policy.md`.

## Tracing и наблюдаемость

- Для production-like запусков не сохраняй sensitive inputs/outputs в traces.
- Используй `integrations/observability/tracing.policy.md`.
- Для каждого полноценного workflow можно создавать run log по `integrations/observability/run-log.template.md`.
- Результаты запусков складывай в `outputs/<project-slug>/<YYYY-MM-DD>/`.

## Финальный ответ Codex

В конце задачи дай:

- Что сделано.
- Какие файлы изменены.
- Какие проверки выполнены.
- Какие риски или TODO остались.
