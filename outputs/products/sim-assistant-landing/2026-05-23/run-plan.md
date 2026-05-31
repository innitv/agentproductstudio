# Run Plan: sim-assistant-landing

Дата: 2026-05-23

Цель: выполнить задачу по `AGENTS.md` для лендинга компании, которая продает SIM/eSIM и использует виртуального помощника для подбора, оформления и поддержки.

## Статус

- Overall: completed
- Orchestrator: отвечает за финальную сборку и качество.
- Notion: published to target page as child PRD page.

## План работ

- [x] Intake: recursive brief.
- [x] Research: market notes, evidence, competitors, unknowns.
- [x] Competitive analysis: A3 как визуальный reference, telecom/eSIM competitors как продуктовый контекст.
- [x] PRD: goals, scope, requirements, MoSCoW, acceptance criteria, analytics.
- [x] IA: hero, main action, sitemap, primary user flow.
- [x] Design: секции, компоненты, responsive, accessibility.
- [x] Screens: спецификация экранов для текущего frontend.
- [x] Prototype: transition map и manual prototype notes.
- [x] Copywriting: hero, CTA, секции, FAQ, SEO, claims to validate.
- [x] Frontend: текущая реализация в `apps/frontend`.
- [x] Test Bench: funnel analytics и ожидаемые события.
- [x] QA Review: PRD fit, UX, accessibility, responsive, secrets, checks.
- [x] Release: changed files, validation, deployment notes, rollback notes.
- [x] Notion export: Notion-ready Markdown.
- [x] Notion publish: создана дочерняя PRD page.

## Quality Gates

- [x] Есть recursive brief с expansion/deepening/consolidation.
- [x] Есть MoSCoW.
- [x] Research содержит источники.
- [x] IA/design/screens/prototype согласованы.
- [x] Funnel analytics описана.
- [x] Секреты не записаны в артефакты.
- [x] Проверки `yarn typecheck`, `yarn validate:config`, `yarn build`, `yarn qa:playwright` выполнены после frontend-изменений.
- [x] Notion token проверен локально; read-only search не вернул доступных страниц.
- [x] Повторная публикация в target page `36964731-74e5-8006-af5f-d367ef89d978` прошла успешно.
