#!/usr/bin/env node
// UserPromptSubmit: инъекция краткого напоминания о manager-style дисциплине в контекст каждого хода.
// Список типов работы обязан совпадать с CLAUDE.md §0.1 — это его краткая инъекция,
// а не второй источник правды. `siteportfolio` убран 2026-07-17: портфолио вынесено
// в отдельный репозиторий, и хук предлагал классификацию, которой в правилах уже нет.
process.stdout.write(
  "[Оркестрация] Главная сессия = оркестратор. Сначала классифицируй тип работы " +
  "(full product / reference-driven / quick draft / limited engineering / cleanup / external write) " +
  "и для продуктового run — масштаб (full / increment / patch, CLAUDE.md §0.2; не уверен → full). " +
  "Продуктовые этапы делегируй субагентам через Task tool; финальный ответ pipeline собирает ТОЛЬКО оркестратор — " +
  "не выдавай сырой вывод субагента как финал. Внешние записи (Notion/Figma/deploy/git commit/push) — только после явного approval. " +
  "Правила: CLAUDE.md; детальные gates: agent-pack/workflows/claude-operating-rules.md."
);
process.exit(0);
