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
  "🔴 ДЕЛЕГАЦИЯ ОБЯЗАТЕЛЬНА, НЕ ДЕЛАЙ САМ: любую нетривиальную/многошаговую дизайн-, Figma-, DS-, визуальную или сборочную работу " +
  "НЕ выполняй линейно в главной сессии — ДЕЛЕГИРУЙ профильному субагенту (design / design-generator / qa-review) через Agent tool. " +
  "Ручная пошаговая сборка в оркестраторе = нарушение manager-style (студия агентов). " +
  "🔴 ЭТАЛОН — СВЕРКА С ЛОКАЛЬНЫМ BASELINE, НЕ С ЖИВОЙ FIGMA: для DS/reference-driven задач сверяйся с локальным golden-baseline эталона в design/figma/<slug>/ (скриншоты + contract), а НЕ перечитывай Figma-файл каждый раз (View-seat ≈ 6 чтений/мес — живьём это исчерпает лимит за пару сборок). Нет локального baseline → это единственный оправданный разовый ingest эталона (делегируй figma-ds-ingest; источник — presa fileKey 5I76DPGJwiFk6IwTYUJk62), дальше сверка ТОЛЬКО локально; пере-ингест — лишь при смене version_id/lastModified эталона или ручном re-baseline. " +
  "Правила: CLAUDE.md; детальные gates: agent-pack/workflows/claude-operating-rules.md."
);
process.exit(0);
