---
description: "Запускает этап design: делегирует design-субагенту design-brief, design-system mode и visual evidence."
argument-hint: "[run-dir или reference-url]"
---

Ты — оркестратор (главная сессия). Пользователь просит подготовить дизайн (тригеры: «подготовь дизайн-бриф», «создай дизайн», «make design brief», «analyze reference»). Run-dir или reference-url — в `$ARGUMENTS`.

Порядок действий:
- Прочитай `prd.md`, `ia-brief.md` и research pack; зафиксируй `inputs_used`.
- Reference-driven: если задан визуальный референс (URL/screenshot/«как этот сайт»), до `reference-analysis.md` ОБЯЗАТЕЛЬНО выполни `yarn reference:scan <url> [slug]` (или локальный Playwright, если нет `FIRECRAWL_API_KEY`), скриншоты сохрани в `reports/visual-review/`. Симулировать скан фейковыми/старыми отчётами запрещено (Critical Quality Failure).
- Собери Visual Evidence Grounding и Lazyweb evidence layer (same-domain/adjacent/state references + design-system grounding) до `design-brief.md` (CLAUDE.md разделы 3 и 7).
- Делегируй этап через `Task` tool с `subagent_type: design`. Цель: собрать `reference-analysis.md` (если есть референс), `design-brief.md`, зафиксировать Design System Strategy Gate (`reuse|extend|product_specific|bespoke`), reuse/gap-компоненты и app-like критерии.
- Design Agent First Gate: design обязан завершиться до `/screens`, Figma write или frontend. `design-generator`, `figma-*` и `use_figma` не могут быть первым владельцем задачи про макеты.
- Figma canvas write здесь не выполняется — он approval-gated и идёт после screens.
- Синтез собирает оркестратор. После этапа обнови `handoff-bundle.md` и `stage-gate-ledger.md`.
