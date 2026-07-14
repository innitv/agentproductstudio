---
name: research-pack
description: Использовать на этапе 01-research и для standalone research/CJM, когда нужна source-backed исследовательская база: Tavily-first source policy, шесть обязательных артефактов, source quality pass, contradiction review и claims-to-validate. DeepSeek/Gemini — только non-blocking advisory, research pack не получает success без source-backed evidence и Research Content Lint.
---

# Research Pack (Глубокое Исследование)

Skill собирает исследовательскую базу для решений по PRD, IA, дизайну, copy, прототипу и test bench — на этапе `01-research` или в standalone research/CJM run. Защищает три gate: source-backed evidence вместо правдоподобной генерации, non-blocking роль advisory-провайдеров и Anti-AI-Slop качество выводов.

**Полная процедура, source policy, evidence contract и failure modes — в [`agent-pack/skills/research-pack/SKILL.md`](../../../agent-pack/skills/research-pack/SKILL.md). Следуй ей.** Нормативный pipeline — [`agent-pack/workflows/deep-research.workflow.md`](../../../agent-pack/workflows/deep-research.workflow.md).

## Когда использовать
- Этап `01-research` продуктового workflow.
- Standalone research/CJM в `research/projects/<research-slug>/<YYYY-MM-DD>/`.
- Нужен конкурентный анализ, персоны, JTBD, user flows или SWOT с проверяемыми источниками.

Не использовать для: публикации research в Notion (`notion-sync`), лечения качества уже написанного текста (`anti-ai-slop`).

## Ключевые шаги
- Artifact context inventory по run directory до первого поиска; `inputs_used` — реально прочитанные файлы.
- Research plan (questions, assumptions, decision needs, source classes) пишется до поиска.
- Source-backed run через Tavily/primary provider; одиночный LLM-provider не является research gate.
- DeepSeek/Gemini — только при явном opt-in, только для contradiction review и claims-to-validate; их synthesis не идёт в факты и не считается источником.
- Source quality pass, gap loop, contradiction review; пустоты помечаются `needs_validation`, а не заполняются «разумными» фактами.
- Шесть обязательных артефактов: `research-summary.md`, `scenario-user-flows.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`.

## Обязательные проверки
- `yarn research:lint <run-dir>`
- `yarn workflow:validate <run-dir> --profile standard` (для продуктового run)
