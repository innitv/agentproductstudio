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
  "🔴 ЭТАЛОН — ЛОКАЛЬНЫЙ BASELINE, НЕ ЖИВАЯ FIGMA (View-seat ≈ 6 чтений/мес — живьём исчерпает лимит за пару сборок). Две роли индексов design/figma/<slug>/, не путать (полностью — design/figma/README.md): working DS = на чём строить/reuse (ТОЛЬКО это = selected_design_system_slug) · reference (M3) = как правильно устроить И оформить DS (структура + подача), compare-only, рабочей DS НЕ выбирается. reference учит «как правильно сделать/подать», НЕ «сделай похоже на Material» — бренд-вид продукта берётся из его референсов, не из эталона. Сверка локально (golden-скриншоты + contract); Figma живьём — только разовый ingest при отсутствии baseline или пере-ингест по изменению version_id/lastModified. " +
  "Правила: CLAUDE.md; детальные gates: agent-pack/workflows/claude-operating-rules.md."
);
process.exit(0);
