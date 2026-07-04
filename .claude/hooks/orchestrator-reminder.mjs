#!/usr/bin/env node
// UserPromptSubmit: инъекция краткого напоминания о manager-style дисциплине в контекст каждого хода.
process.stdout.write(
  "[Оркестрация] Главная сессия = оркестратор. Сначала классифицируй тип работы " +
  "(full product / reference-driven / quick draft / limited engineering / cleanup / external write / siteportfolio). " +
  "Продуктовые этапы делегируй субагентам через Task tool; финальный ответ pipeline собирает ТОЛЬКО оркестратор — " +
  "не выдавай сырой вывод субагента как финал. Внешние записи (Notion/Figma/deploy/git commit/push) — только после явного approval. " +
  "Правила: CLAUDE.md; детальные gates: agent-pack/workflows/claude-operating-rules.md."
);
process.exit(0);
