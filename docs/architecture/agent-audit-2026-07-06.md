# Аудит агентной системы — 2026-07-06

Полный разбор всех 13 агентов проекта (12 специалистов + оркестратор): роль, сильные стороны, пробелы, лучшие практики похожих open-source агентов с GitHub/веба и приоритизированные предложения. Метод: чтение детальных контрактов `agent-pack/agent-contracts/*.agent.md` + нативных обёрток `.claude/agents/*.md`, сверка с `runtime/typescript/workflow.manifest.ts`, целевой web-поиск (Tavily) по каждому агенту. Сбор — 4 параллельных агента-исследователя по группам + анализ оркестратора главной сессией; синтез и верификация находок — оркестратор.

> Часть находок субагентов была **отсеяна при верификации** (см. раздел «Верификация»), поэтому этот документ — согласованный источник, а не сырые выводы.

---

## 1. Executive summary

Система **зрелая**: слабых по логике агентов нет. Основные проблемы — не в содержании ролей, а в **согласованности** трёх слоёв (контракт ↔ обёртка ↔ manifest) и в **недоспецифицированных форматах**.

### Сквозные системные паттерны

- **A. Output Contract ⟷ `workflow.manifest.ts` рассинхрон (P0, подтверждён).** Section-gate валидатора требует секции, которых нет в YAML-скелетах агентов. Подтверждено для **frontend** (manifest 9 секций vs контракт 4) и **prototype** (нет `## Input Readiness Pass` и `## Frontend Handoff Contract`). Корректно работающий агент формально проваливал бы валидацию. → **Исправлено** (см. раздел 3).
- **B. Frontmatter обёрток ⟷ контракты рассинхрон (P1, подтверждён).** Обёртки `.claude/agents/*.md` объявляли по 1 skill, контракты — 5-6 (design, design-generator, frontend, qa-review). У notion-publisher `approval_actions` есть в контракте, нет в обёртке. → skills **исправлено**; approval_actions — см. «Открытые вопросы».
- **C. Устаревшие пути `product-agent-studio` (P1, подтверждён — 12 вхождений в 4 файлах:** orchestrator, qa-review, design, frontend). Битые `file:///c:/Project/product-agent-studio/...` после переименования репо. → **Исправлено** (заменены на относительные repo-пути).
- **D. Дублирование логики между агентами (P1-P2).** user-flow (research↔ia), funnel-analytics+PII (test-bench↔qa-review), `Universal Execution Discipline` (design/design-generator/copywriting/orchestrator дословно), Figma-gates (design↔design-generator), Notion-gates (research↔notion-publisher). → рекомендация: shared includes + явные границы в `stage-handoff-contract.md`.
- **E. Недоспецифицированные форматы (P1).** acceptance criteria без Given-When-Then; a11y без WCAG 2.2/axe; AI-slop без именованного (особенно русского) чеклиста; E2E без запрета флаки-локаторов.
- **F. tools-allowlist асимметрия (P1).** research и frontend наследуют `All tools`; prd/ia/prototype/copywriting/release строго ограничены.

---

## 2. Что исправлено в этой сессии (P0 changelog)

| Правка | Файлы |
|---|---|
| Output Contract frontend: +5 секций под manifest (9 всего) + правило not_applicable | `agent-pack/agent-contracts/frontend.agent.md` |
| Output Contract prototype: +`Input Readiness Pass`, +`Frontend Handoff Contract`, порядок под manifest | `agent-pack/agent-contracts/prototype.agent.md` |
| Устаревшие пути `product-agent-studio` → относительные (12 вхождений) | orchestrator, qa-review, design, frontend `.agent.md` |
| skills frontmatter обёрток синхронизированы с контрактами | `.claude/agents/{design,design-generator,frontend,qa-review}.md` |
| Notion API: обработка `529` + size-limits (2000 симв., 1000 blocks/500KB, вложенность 2, relation/people/multiselect 100) + create/append split + сериализация | `agent-pack/agent-contracts/notion-publisher.agent.md` |
| Опечатка «путого» → «пустого» | `agent-pack/agent-contracts/copywriting.agent.md` |
| Inputs оркестратора: `AGENTS.md` → `CLAUDE.md` (source of truth) | `agent-pack/agent-contracts/orchestrator.agent.md` |

Проверка: `yarn workflow:test-agent-capabilities` — passed.

### P1-улучшения (та же сессия, качество/согласованность)

| Улучшение | Файл |
|---|---|
| copywriting: разрешён tools-конфликт — убраны `WebSearch/WebFetch` (claim-проверка идёт через upstream research + `needs_validation`, Tavily намеренно disallowed) | `.claude/agents/copywriting.md` |
| copywriting: AI-Pattern Sweep → именованный чеклист AI-slop (русская + английская секции) + slop-score | `agent-pack/agent-contracts/copywriting.agent.md` |
| prd: acceptance criteria в формате Given-When-Then + evals для AI/LLM-фич | `agent-pack/agent-contracts/prd.agent.md` |
| qa-review: a11y-findings привязаны к WCAG 2.2 AA success criteria + axe-core/Lighthouse | `agent-pack/agent-contracts/qa-review.agent.md` |
| test-bench: web-first assertions + запрет флаки-локаторов + trace-on-failure + consent gate | `agent-pack/agent-contracts/test-bench.agent.md` |
| release: явное разделение «планирует external actions vs исполняет оркестратор» | `agent-pack/agent-contracts/release.agent.md` |
| research + frontend: `disallowedTools` на write-MCP (сужение write-поверхности) | `.claude/agents/{research,frontend}.md` |
| ia ↔ research: развод дублирования user-flow (IA накладывает структуру, не переписывает сценарии) | `agent-pack/agent-contracts/ia.agent.md` |
| design: Token Precedence Rule + эскалация при конфликте источников токенов | `agent-pack/agent-contracts/design.agent.md` |
| prototype: Alternate & Recovery Paths → named edge-case map (trigger→expected→recovery) | `agent-pack/agent-contracts/prototype.agent.md` |

### P1/P2-улучшения (батч №3, та же сессия)

| Улучшение | Файл |
|---|---|
| qa-review: проверка hallucinated/slopsquatted зависимостей vs lockfile в Security Pass | `qa-review.agent.md` |
| release: semantic-version bump (Conventional Commits) + technical/product release notes | `release.agent.md` |
| release: post-release anomaly thresholds (console/4xx/5xx/error rate) как rollback trigger | `release.agent.md` |
| ia: labels/taxonomy привязаны к research language patterns + `needs_validation` | `ia.agent.md` |
| ia: findability gate (≤3 клика до primary action) | `ia.agent.md` |
| design-generator: явный text-only fallback (какие Figma-gate отпадают) + приоритизация pipeline | `design-generator.agent.md` |
| prd: Readiness Review + Self-Verification Pass (gap-check must↔story↔AC↔analytics) | `prd.agent.md` |
| notion-publisher: зафиксирован двойной вызов (`01`/`12`) в обёртке | `.claude/agents/notion-publisher.md` |

### P0-задачи из «отложенного» — выполнены (батч №4)

Оба ранее отложенных пункта реализованы безопасным способом (после изучения механики валидатора):

| Улучшение | Как сделано безопасно | Файлы |
|---|---|---|
| **research traceability ledger** | Вместо отдельного файла-артефакта (риск ужесточить file-gate + рассинхрон template/schema) — обязательная **секция `## Evidence Ledger`** в research-summary: `evidence_id → claim → source → evidence_status → confidence → used_for`. Downstream ссылается на `EV-XXX`. | `workflow.manifest.ts` (required section), `research-summary.template.md` (таблица), `research.agent.md` (Правило Evidence Ledger) |
| **Рефакторинг дублирования Universal Execution Discipline** | Все 13 копий были **идентичны** (md5 совпал). Полный текст вынесен в канон `claude-operating-rules.md` §7; в 13 контрактах — компактный стаб (суть в контексте + ссылка на канон, правки в одном месте). | `claude-operating-rules.md` (§7 канон) + 13 × `*.agent.md` (стаб) |

Проверки: `yarn workflow:doctor`, `yarn workflow:test-agent-capabilities`, `yarn workflow:list` — все passed; manifest компилируется.

### Батч №5 (финальный) — остальные дубли и AI-first блоки

**Важный вывод по «остальным дублям»:** проверка md5 показала, что Figma-gates (`Правило Figma-макетов`), `Primary App Flow Gate` и `Surface Output Contract Pass` **текстово различаются** между design/design-generator/frontend (разные md5) — это **роль-специфичные версии** одного правила, а НЕ дословные копии как Universal Execution Discipline. Механическая дедупликация здесь **противопоказана** (потеря роль-специфики). Правильное действие — связать роль-версии с каноном:

| Правка | Файл |
|---|---|
| design-generator `Правило Figma-макетов` досвязано с каноном `figma-canvas-write-guide.md` (design уже ссылался) | `design-generator.agent.md` |
| ia: условный блок **AI-first IA** (conversational entry, constrained search, thinking/streaming states) | `ia.agent.md` |
| design: условный блок **AI-first UI** (streaming, citation, editable output, honesty о неопределённости) | `design.agent.md` |

Проверки: `yarn workflow:doctor`, `yarn workflow:test-agent-capabilities` — passed.

**Полностью закрыто.** Все находки аудита либо реализованы, либо (для роль-специфичных «дублей») признаны не требующими дедупликации с обоснованием.

---

## 3. Per-agent разбор

### orchestrator
**Роль:** главная сессия Claude Code. Владеет запросом, маршрутизацией, gates, финальным синтезом.
**Сильные стороны:** Delegation Packet, Consensus & Conflict иерархия, Re-Orchestration Loop, State Truncation Gate (сжатие контекста с 08-frontend), 3-фазный recursive briefing, Parallelism Policy.
**Пробелы:** устаревшие пути (исправлено); в Inputs был `AGENTS.md` вместо `CLAUDE.md` (исправлено); контракт написан абстрактно («направить субагенту»), без явной привязки к Task tool/subagent_type (описано в CLAUDE.md — дублировать не обязательно).
**Предложения:** P2 — вынести дословный `Universal Execution Discipline` в shared include, подключаемый ссылкой во всех контрактах.

### research
**Роль:** stage `01-research`. Source-backed research base (JTBD, scenario-user-flows, proto-personas, synthetic interviews, competitive analysis, SWOT, validation plan).
**Сильные стороны:** Evidence Quality Model (`high/medium/low/synthetic`) с правилом «DeepSeek/Gemini не повышают sources_count»; обязательный Contradiction Review → claims_to_validate; жёсткая честность источников (`needs_validation`, `synthetic`); явный research-to-design handoff; fallback-дисциплина (`partial` при недоступности провайдера).
**Пробелы:** нет tools-allowlist в обёртке → `All tools` (для research частично оправдано — нужны tavily/lazyweb/browser, но список стоит зафиксировать); дублирование `scenario-user-flows.md` с IA; раздутость (21 шаг + дубли Notion-gates); `source-log` не обязателен как машиночитаемый артефакт; Anti-AI-Slop/Depth gates описаны трижды.
**Лучшие практики:** [deep-research-skill](https://skillsllm.com/skill/deep-research-skill) — evidence-ID → claim traceability + research ledger; [tonyblu331/research-proof](https://github.com/topics/research-agent) — falsifiable evidence plans, frozen verifiers, proof ledgers; [davila7/claude-code-templates fact-checker](https://github.com/davila7/claude-code-templates) — citation validation pass; [articos «Synthetic Users»](https://www.articos.com/blog/synthetic-users) — 80/20 + WEIRD-bias audit.
**Предложения:** P0 — зафиксировать tools-allowlist в обёртке; P0 — сделать `source-log.json` (claim→evidence_id→confidence) обязательным output; P1 — развести дубль user-flow с IA; P1 — вынести Notion-gates в ссылку на notion-publisher; P2 — bias/WEIRD-audit + falsification method в claims.

### prd
**Роль:** stage `02-prd`. Бриф+research → PRD (Executive Summary, North Star, OKR, MoSCoW, User Stories, REQ-ID, acceptance criteria, аналитика, roadmap, handoff).
**Сильные стороны:** traceability finding→story→requirement→AC→analytics; Requirement Quality Model (`valuable/traceable/testable/bounded`); Decision Input Audit + Evidence-To-Requirement Mapping; строгий disallowedTools (figma/notion/tavily/lazyweb); PRD-To-Design handoff с required_states.
**Пробелы:** формат acceptance criteria не стандартизирован (нет Given-When-Then/EARS); AI/LLM-специфичные требования не покрыты (недетерминированность). ⚠️ *Замечание субагента про «Output Contract беднее pipeline» отсеяно при верификации — manifest требует ровно 7 секций, совпадающих с контрактом (см. Верификация).*
**Лучшие практики:** [GitHub Spec Kit + Kiro](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) — Given-When-Then; [nurettincoban/ai-prd-workflow](https://github.com/nurettincoban/ai-prd-workflow) — PRD verification prompt + change management; [ainna.ai AI-PRD](https://ainna.ai/resources/faq/ai-prd-guide-faq) — evals per modality, failure modes; [TrueFoundry SDD](https://www.truefoundry.com/blog/spec-driven-development-ai-agents) — versioned spec.
**Предложения:** P1 — закрепить Given-When-Then для each must/should AC; P1 — PRD self-verification pass (gap-check); P1 — условная секция AI/LLM requirements; P2 — PRD versioning в handoff.

### ia
**Роль:** stage `03-ia`. sitemap, приоритеты контента, entry points, user flow, decision/friction map, state map, a11y pass, IA-To-Design handoff.
**Сильные стороны:** IA Quality Model с анти-декоративным фильтром; State Map (default/hover/focus/loading/empty/error/…) обязателен; content-before-chrome; Entry Points & Intent Map; Accessibility Pass встроен; строго ограниченный toolset (даже без WebSearch).
**Пробелы:** дубль user-flow с research; нет card-sorting/taxonomy-валидации (labels «из головы»); findability не измеряется явно. ⚠️ *«Output Contract беднее pipeline» отсеяно — manifest требует 4 секции, совпадающих с контрактом.*
**Лучшие практики:** [Yale Usability IA](https://usability.yale.edu/ux/plan/establish-structure-findability/site-mapping-and-information-architecture) — card sorting, three-click, rationale; [Figma IA](https://www.figma.com/resource-library/what-is-information-architecture); [FlowMapp User Flow vs IA](https://www.flowmapp.com/features/user-flow-vs-information-architecture); [uxforai AI-first IA](https://uxforai.com/p/modern-information-architecture-for-ai-first-applications).
**Предложения:** P1 — привязать taxonomy/labels к research-данным (card sorting/language patterns), помечать неподтверждённые `needs_validation`; P1 — findability gate (three-click); P1 — развести user-flow с research; P2 — условный AI-first IA блок.

### design
**Роль:** stage `04-design`, обязательный первый владелец product UI. Visual direction, `design_system_mode`, visual evidence, handoff к screens.
**Сильные стороны:** Universal Visual Evidence Grounding с visual_reference_card; Product UI Routing Gate + Design System Strategy Gate; Primary App Flow Gate; компактная обёртка.
**Пробелы:** битая ссылка `product-agent-studio` (исправлено); skills frontmatter=1 vs контракт=5 (исправлено); перегрузка Figma-логикой на стадии, где write запрещён; дублированный Universal Execution Discipline.
**Лучшие практики:** [VoltAgent/awesome-design-md](https://github.com/voltagent/awesome-design-md) + [Khalidabdi1/design-ai](https://github.com/Khalidabdi1/design-ai) — портативный `DESIGN.md`; [kaelig.fr agent teams](https://www.kaelig.fr/design-system-components-with-ai-agent-teams) — token source precedence + «при конфликте — спроси человека»; [Figma: Agents meet the Canvas](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents); [anti-slop-design](https://github.com/topics/ai-design) — именованная таксономия AI-slop паттернов.
**Предложения:** P1 — token-precedence rule в Design System Strategy Gate; P2 — именованный anti-AI-slop visual checklist в design-brief; P2 — сближение STYLE_GUIDE.md с машиночитаемым DESIGN.md-форматом.

### design-generator
**Роль:** stage `06-screens`. IA+design+PRD+copy → screen contract (`screens.md`), Component Contract Matrix, `figma-layout-ir.json`, `figma-visual-qa.json`.
**Сильные стороны:** сильнейшая traceability (экран→REQ-ID→JTBD→evidence→entry→completion); Source Pair Plan; Screen-To-Canvas Order + ready-gates; Component & State Contract с React target/prop/test.
**Пробелы:** skills 1 vs 5 (исправлено); 17-шаг pipeline без приоритизации «обязательное vs visual-risk»; дублирование Figma-механики с design; text-only fallback слабо оформлен; схема `figma-layout-ir.json` не в контракте (только в skill).
**Лучшие практики:** [kaelig.fr](https://www.kaelig.fr/design-system-components-with-ai-agent-teams) — адресные downstream handoff-notes; [AutonomyAI](https://autonomyai.io/business/which-ai-agents-can-handle-both-design-and-code-generation-for-web-apps) — «map to existing, not recreate»; [Figma structured JSON contract](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents); [Material 3 tokens](https://m3.material.io/foundations/design-tokens) — reference/system/component.
**Предложения:** P1 — приоритизация pipeline (обязательно всегда vs figma/visual-risk); P1 — оформить text-only fallback как явный подпуть; P2 — адресные handoff-notes + inline-схема IR; P2 — shared include общих с design блоков.

### copywriting
**Роль:** stage `05-copy`. research/PRD/design → `copy-deck.md` (messaging architecture, hero, feature copy, FAQ, UX microcopy, SEO, claims-to-validate).
**Сильные стороны:** лучшая evidence-дисциплина (Claim Verification Sweep + claims-to-validate + `[needs validation]` + запрет synthetic-as-real); messaging ladder; AI-Pattern Cleanup Sweep; Design-fit + Mobile-fit; строгий disallowedTools.
**Пробелы:** опечатка «путого» (исправлено); AI-Pattern Sweep абстрактен (нет именованного списка, особенно русского); tools-конфликт (allowed WebSearch/WebFetch, но disallowed Tavily → нет надёжного веб-канала для проверки claims); SEO-часть тонкая (нет JTBD→keyword, ad-to-page congruence).
**Лучшие практики:** [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing) — 30+ именованных AI-паттернов с before/after; [anti-slop/deslopify (tropes.fyi)](https://glaforge.dev/posts/2026/03/08/fixing-ai-slop-with-a-skill-in-gemini-cli) — scored multi-pass со slop-score; [usergrowth JTBD for SEO](https://usergrowth.io/blog/jobs-to-be-done-seo); [CXL VoC+JTBD](https://cxl.com/blog/customer-interviews).
**Предложения:** P0 — разрешить tools-конфликт (убрать WebSearch/WebFetch либо задокументировать блокировку Tavily); P1 — именованный AI-slop чеклист с русской секцией + scored sweep; P1 — привязать messaging/SEO к JTBD-формуле «When I…, I want…, so I can…»; P2 — VoC-правило для hero H1.

### prototype
**Роль:** stage `07-prototype`. Executable spec поведения: flow goal, transition map, state inventory, alternate/recovery, motion spec, test hooks, frontend handoff.
**Сильные стороны:** Input Readiness Pass (partial при неполных входах); полнота состояний (default/empty/loading/skeleton/validation/error/success/permission/offline/timeout/disabled); Microinteraction & Motion Spec с reduced-motion; copy fidelity из copy-deck; instrumentation-шаг; ограниченный toolset.
**Пробелы:** Output Contract без `Input Readiness Pass`/`Frontend Handoff Contract` (исправлено); нет явного accessibility/keyboard блока как отдельной секции; `skills: []`.
**Лучшие практики:** [IxDF Design Handoffs](https://www.interaction-design.org/literature/topics/design-handoffs) — checklist состояний/a11y; [Figr best practices](https://figr.design/blog/product-design-best-practices) — named edge-case map; [Addy Osmani spec for agents](https://addyosmani.com/blog/good-spec) — самопроверки, модульность.
**Предложения:** P1 — добавить `## Accessibility & Keyboard Path` (или Primary Flow Walkthrough) симметрично frontend; P1 — Alternate & Recovery как named edge-case map (trigger→expected); P2 — рассмотреть design-engineering skill.

### frontend
**Роль:** stage `08-frontend`. Bespoke UI + state machine на чистом Tailwind/React/TS. `frontend-result.md` с browser/mobile evidence.
**Сильные стороны:** многослойная evidence-дисциплина (Surface Output Contract, Visual Evidence Grounding, Source Pair Matrix, Primary App Flow Gate, Figma QA gates); Bespoke UI by Default + design_system_mode; Component Contract Pass с Code Connect fallback; motion hygiene; Modular Views Architecture с защищённым ConsoleView; State Truncation Gate.
**Пробелы:** Output Contract 4 секции vs manifest 9 (исправлено); skills 1 vs 6 (исправлено); битые пути (исправлено); обёртка без tools-фильтра → `All tools` (P1); длинный pipeline без non-Figma fast path.
**Лучшие практики:** [Frontman best frontend agent](https://frontman.sh/blog/best-frontend-coding-agent) — existing-DS-safety; [Kombai](https://envitab.medium.com/the-best-ai-agent-for-frontend-kombai-acac8c0e0bb1) — repo/token scan до генерации; [Vercel agent-browser / Ralph loop](https://www.pulumi.com/blog/self-verifying-ai-agents-vercels-agent-browser-in-the-ralph-wiggum-loop) + [Playwright Test Agents](https://playwright.dev/docs/test-agents) — компактные snapshot-проверки; [XState в React](https://www.ratulhasan.com/blog/react-state-machines) + [LogRocket states](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react) — finite state, исключение impossible states.
**Предложения:** P1 — явный tools/disallowedTools в обёртке (или задокументировать полный доступ + напоминание про approval); P2 — non-Figma fast path (Figma-gates одним not_applicable блоком); P2 — единый state enum/машина вместо boolean-флагов.

### test-bench
**Роль:** stage `10-test-bench`. Планы функц./визуального тестирования, E2E Playwright, схемы analytics-воронок, PII-аудит. Вердикт pass/fail/blocked.
**Сильные стороны:** связка «бизнес-метрики→шаги воронки→analytics events→E2E»; PII-guardrail с примерами; guardrail против ложных падений (эмуляция задержек/динамики).
**Пробелы:** нет требований к стабильности локаторов и web-first assertions (риск флаки); нет consent/cookie-banner прохода; нет trace/screenshot/video как evidence при падении; дублирование funnel-analytics+PII с qa-review без границы.
**Лучшие практики:** [Playwright best practices](https://playwright.dev/docs/best-practices) — web-first assertions, user-facing локаторы, auto-waiting; [BrowserStack 2026](https://www.browserstack.com/guide/playwright-best-practices) — trace-on-failure; [Playwright MCP для analytics](https://nhinternesch.medium.com/llm-agent-based-browser-automation-for-digital-analytics-using-vs-code-playwright-mcp-server-56afbfd35e2b) — consent gate + network interception.
**Предложения:** P0 — guardrail «user-facing/data-testid локаторы + web-first assertions; запрет waitForTimeout/isVisible-как-основная-проверка»; P1 — trace+screenshot on failure как evidence; P1 — consent/analytics gate (события не до согласия); P2 — зафиксировать границу с qa-review.

### qa-review
**Роль:** маршруты `09-visual-reference` и `11-qa`. Полный аудит пакета + реализации перед релизом. `qa-report.md` + `visual-reference-review.md`.
**Сильные стороны:** Severity Model, Evidence Requirements, Devil's Advocate/False Positive Pass, Traceability Audit; запрет pass без Evidence/Severity Matrix; Figma-gates, bespoke-UI audit, design-engineering.
**Пробелы:** a11y только «на словах» (нет привязки к WCAG 2.2 + axe/Lighthouse); skills 1 vs 6 (исправлено); нет slopsquatting/hallucinated-package проверки; 19 шагов без приоритизации; битые пути (исправлено).
**Лучшие практики:** [Community-Access/accessibility-agents](https://github.com/Community-Access/accessibility-agents) — привязка к WCAG 2.2 AA success criteria; [MetaCTO AI-code review 2026](https://www.metacto.com/blogs/establishing-code-review-standards-for-ai-generated-code) — slopsquatting, OWASP LLM Top 10; [GitHub review AI code](https://docs.github.com/en/copilot/tutorials/review-ai-generated-code) — functional checks first; [microsoft/hve-core RAI](https://github.com/microsoft/hve-core/discussions/480) — audit trails.
**Предложения:** P0 — a11y-findings привязать к WCAG 2.2 success criteria + axe-core/Lighthouse (experience_based только fallback); P1 — проверка hallucinated/slopsquatted зависимостей vs lockfile; P2 — minimum mandatory subset из 19 шагов для быстрых прогонов.

### release
**Роль:** stage `12-release`. Release notes, deployment/rollback планы, change/validation/approval matrices. Решение ready/blocked/released.
**Сильные стороны:** нулевая терпимость к QA=fail; evidence-backed release; запрет `git reset --hard` дефолтом; разделение unrelated dirty tree; «No silent external success»; хорошая изоляция tools; автономный rollback-план.
**Пробелы:** кажущееся противоречие approval_actions (notion/git/deploy) vs disallowedTools (mcp закрыты) — разделение «планирует, но не исполняет» не сформулировано; нет semantic versioning/conventional commits; rollback не учитывает stateful-эффекты; нет post-deploy anomaly-thresholds; skill notion-sync при disallowed mcp__notion.
**Лучшие практики:** [DeployHQ AI changelog](https://www.deployhq.com/git/generating-changelogs-with-ai) — Conventional Commits + два формата (technical/product); [Capgo conventional commits](https://capgo.app/blog/automating-ci-cd-with-conventional-commits) — auto version bump; [Versioning/Rollback AI agents](https://medium.com/@nraman.n6/versioning-rollback-lifecycle-management-of-ai-agents-treating-intelligence-as-deployable-deac757e4dea) — предыдущая версия как точка отката; [Agentuity deployment](https://agentuity.com/ai-agent-deployment) — stateful-эффекты.
**Предложения:** P1 — явно записать «release планирует external actions с approval, но исполняет оркестратор/агент»; P1 — semantic-version bump + technical/product release notes; P1 — post-release anomaly thresholds (error rate/4xx/5xx) → rollback trigger; P2 — stateful-эффекты в Rollback Plan; P2 — уточнить статус notion-sync.

### notion-publisher
**Роль:** публикация в Notion после approval (вызывается из research `01` и release `12`). Hub + child pages + linked databases.
**Сильные стороны:** обязательный dry-run/preview; набор publication gates; Research Content Lint; idempotency; micro-page gate (6-12 child pages); integrated_hybrid; security-guardrails (token не в логи, no PII); Russian Publication Gate.
**Пробелы:** обработка `529` + size-limits (исправлено); `owner_stage_ids: []` + двойной вызов не отражён в обёртке; approval_actions в контракте есть, в обёртке нет (см. Открытые вопросы); большой объём при sonnet.
**Лучшие практики:** [Notion request limits](https://developers.notion.com/reference/request-limits) — 429+529, size-limits; [Truto Notion API guide](https://truto.one/blog/how-to-integrate-with-the-notion-api-architecture-guide-for-b2b-saas) — сериализация, 2-level nesting; [Thomas Frank rate limits](https://thomasjfrank.com/how-to-handle-notion-api-request-limits) — create+append split.
**Предложения:** P1 — зафиксировать двойной вызов (research-публикация `01` / PRD/agile export `12`) в обёртке; P2 — pre-write валидация размеров (уже частично в исправлении лимитов).

---

## 4. Верификация (что подтверждено / отсеяно)

- ✅ **frontend Output Contract 4 vs manifest 9** — подтверждено чтением `workflow.manifest.ts:258`.
- ✅ **prototype без Input Readiness Pass** — подтверждено `workflow.manifest.ts:237-247`.
- ✅ **skills frontmatter 1 vs 5-6** — подтверждено сверкой обёрток и контрактов.
- ✅ **устаревшие пути** — подтверждено grep (12 вхождений в 4 файлах).
- ❌ **prd Output Contract «беднее pipeline»** — ОТСЕЯНО: `workflow.manifest.ts:165` требует ровно 7 секций (`Problem/Goals/Non-Goals/Requirements/MoSCoW/Acceptance Criteria/Analytics`), совпадающих с контрактом. Section-gate провала нет.
- ❌ **ia Output Contract «беднее pipeline»** — ОТСЕЯНО: `workflow.manifest.ts:176` требует 4 секции, совпадающих с контрактом.

Урок: manifest задаёт **минимум** обязательных секций; «pipeline генерирует больше» ≠ «контракт провалит gate». Реальный риск — только когда manifest требует секцию, которой нет в шаблоне агента (frontend, prototype).

---

## 5. Открытые вопросы / рекомендации к следующим итерациям

- **approval_actions в обёртках.** Capability registry (`agent-capability-registry.ts`) читает контракты, а не обёртки (`test-agent-capabilities` прошёл без изменения обёрток). Перед добавлением `approval_actions` в `.claude/agents/*.md` проверить, использует ли Claude Code это поле — иначе это шум. Пока не добавлено намеренно.
- **P1-форматы** (Given-When-Then для PRD, WCAG-привязка для qa, именованный AI-slop для copy, флаки-локаторы для test-bench) — это изменения поведения агентов, требуют отдельного согласования, не внесены как «механический P0».
- **Дублирование (паттерн D)** — вынести общие блоки (`Universal Execution Discipline`, Figma-gates, Surface Output Contract Pass) в shared includes и подключать ссылкой; зафиксировать границы research↔ia и test-bench↔qa-review в `stage-handoff-contract.md`.
- **tools-allowlist** для research и frontend — зафиксировать явный список вместо `All tools`.

---

## 6. Вторая волна — расширенный аудит (skills, паттернами, config)

Проверены 4 зоны за пределами агентов.

### 6.1 Устаревшие пути `product-agent-studio` — по всему репо
Из 54 файлов большинство легитимны (`package.json` name, schema `$id` namespace, имя студии в прозе, archive/reports/research ledger). **Реальные битые `file:///` пути дочищены** в 5 активных файлах: `integrations/mcp/figma-design-system-mcp.md` (пропущенное вхождение) + `design/figma/a3-design-system/*` (4). Остаток в активных доках — **0**.

### 6.2 Schemas ↔ templates ↔ manifest
Автосверка (валидатор использует строгий `content.includes`) выявила **5 шаблонов**, где отсутствовали required-секции manifest (тот же класс, что frontend/prototype) — подтверждено нестабильностью реальных run-артефактов (`## Takeaways` был в 1 из 3 прошлых competitive-analysis). **Исправлено:**
| Шаблон | Добавлено |
|---|---|
| `competitive-analysis.template.md` | `## Takeaways` |
| `swot.template.md` | `## Strategic Notes` |
| `qa-report.template.md` | `## Status` |
| `release-notes.template.md` | `## Status` |
| `recursive-brief.template.md` | Phase-заголовки → manifest-совместимые + `## Assumptions`, `## Open Questions` |
Повторная сверка: **0 рассинхронов**. (run-plan/handoff-bundle/stage-gate-ledger генерируются scaffold, не по шаблону — норма.)

### 6.3 Аудит 15 skills (3 субагента)
Скв­озные находки:
- **P0 notion-sync отставал** от обновлённого `notion-publisher.agent.md` по лимитам Notion (нет 529/size-limits). **Исправлено** — синхронизирован (skill — исполнитель записи, лимиты критичны там).
- **P0 языковой рассинхрон:** `figma-screen-compiler` и `figma-token-extractor` имели англоязычные descriptions при русских обёртках (нарушение CLAUDE.md §1). **Исправлено** — переведены.
- **Устаревших путей в skills нет** (проверено).
- **P1 (в отчёт, не внесено):** обёртки `.claude/skills/*` не валидируются runtime (`test-skill-metadata` читает только `agent-pack/skills`) — системная дыра; `mcp_servers: playwright` объявлен, но не используется у `style-decompose`/`ds-to-storybook`; `required_outputs` объявляет чужие артефакты (`figma-handoff`→`figma_layout_ir`, `figma-roundtrip`→`frontend_result`/`qa_report`); дублирование между write-навыками (compiler/handoff/roundtrip); visual-diff без diff-порога и disable-animations; hardcoded `a3-design-system` в token-extractor.

### 6.4 Config / security
- **Несогласованность найдена и исправлена:** `approval-matrix` требует approval для repo write (`git_write`/`external_write`, покрывает GitHub/GitLab), но `.claude/settings.json` не имел `mcp__github`/`mcp__gitlab` в `ask` (в отличие от notion/figma). **Добавлены в `ask`** — внешние repo-записи теперь под подтверждением.
- `.mcp.json`: 8 серверов; `figma`/`gitlab` требуют OAuth (в неинтерактивной сессии недоступны — задокументировано).

Проверки второй волны: `doctor`, `validate:config`, `test-skill-metadata` — passed; битых путей 0; рассинхронов шаблонов 0; settings.json — валидный JSON.

### Ещё не сделано (P1, отдельная задача)
- Валидация обёрток `.claude/skills/*` в `test-skill-metadata` (сверка name/description с `agent-pack/skills`).
- Skills P1: `mcp_servers` cleanup, `required_outputs` разделение «производит vs требует», разграничение write-навыков, visual-diff пороги.
