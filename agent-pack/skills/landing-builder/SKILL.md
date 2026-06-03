---
id: landing-builder
name: landing-builder
title: "Bespoke UI Landing Builder"
description: "Use when implementing stage 08-frontend for a landing, console, or product UI from approved PRD/IA/design/copy/screens/prototype artifacts. Builds bespoke React/Vite/Tailwind UI, derives style from design artifacts or reference-analysis, preserves workflow gates, and writes frontend_result evidence."
platforms:
  - codex
  - open-code
mcp_servers:
  - playwright
strictness_profile: strict
owner_stage_ids:
  - 08-frontend
required_inputs:
  - prd
  - ia_brief
  - design_brief
  - screens
  - copy_deck
  - prototype_report
required_outputs:
  - frontend_result
approval_actions: []
validation_commands:
  - yarn typecheck
  - yarn build
contract_schema: agent-pack/templates/skill.template.md
---

# Skill: Bespoke UI Landing Builder

## 1. Назначение

Применяй skill только для `08-frontend`, когда уже есть `prd.md`, `ia-brief.md`, `design-brief.md`, `screens.md`, `copy-deck.md` и `prototype-report.md`. Frontend в полном workflow нельзя начинать раньше этих артефактов, кроме явно отмеченного `quick draft`.

Стек по умолчанию: React + Vite + Tailwind CSS. Верстка целевого лендинга и калькуляторов живет в `apps/frontend/src/views/`. Для базового лендинга используй `apps/frontend/src/views/LandingView.tsx`; для отдельного продукта допустим новый `<ProductName>View.tsx`. `ConsoleView.tsx` не смешивай с кодом лендинга. `App.tsx` держи тонким роутером.

## 2. Обязательные inputs

Перед изменением кода прочитай:
- `prd.md`: цели, acceptance criteria, analytics.
- `ia-brief.md`: sitemap, primary flow, главный экран и действие.
- `design-brief.md`: визуальные токены, компоненты, responsive, accessibility.
- `screens.md`: порядок экранов/секций и состояния.
- `copy-deck.md`: финальные тексты, CTA, SEO, claims.
- `prototype-report.md`: transition map и интерактивные сценарии.
- `reference-analysis.md`, если задача reference-driven.

## 3. Процедура

1. Извлеки implementation checklist из входных артефактов: секции, состояния, CTA, формы, analytics hooks, responsive breakpoints, accessibility notes.
2. Собери UI bespoke-стилем: CSS Grid/Flexbox и Tailwind только как запись значений из design/reference artifacts. Не используй готовые шаблоны, дефолтные сетки и стандартный "component library look".
3. В reference-driven задаче layout, gaps, column counts, aspect ratios и section order бери только из `reference-analysis.md`; не подставляй Bootstrap-like/12-column defaults.
4. В обычной задаче стиль выводи из `design-brief.md`. Не навязывай glassmorphism, gradients, blur или темную тему, если они не заданы дизайном.
5. Реализуй состояния: loading/empty/error/success для форм и ключевых интерактивных элементов, hover/focus/disabled для controls.
6. Подключи analytics hooks из PRD без отправки PII в event payload.
7. Обнови `frontend-result.md` в run directory: changed files, implemented screens/sections, analytics hooks, accessibility/responsive notes, validation commands.

## 4. Evidence и failure modes

`frontend-result.md` обязан содержать:
- список измененных файлов;
- какие inputs прочитаны;
- какие acceptance criteria закрыты;
- какие команды проверки запущены и их результат;
- известные ограничения или blockers.

Блокируй stage как `blocked`/`partial`, если нет обязательных upstream artifacts, задача reference-driven без `reference-analysis.md`, frontend просит Figma write/deploy без approval или build/typecheck не проходит.

## 5. Validation gates

- [ ] `yarn typecheck` проходит.
- [ ] `yarn build` проходит.
- [ ] Первый viewport не ломается на desktop/mobile.
- [ ] Нет horizontal overflow, перекрытия текста, битых изображений.
- [ ] Keyboard focus видим на интерактивных элементах.
- [ ] Analytics hooks соответствуют PRD и не содержат PII.
