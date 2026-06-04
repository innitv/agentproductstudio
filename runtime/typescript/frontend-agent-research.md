# GitHub Research: Frontend Agents И Landing Builder

Дата: 2026-06-04

## Цель

Найти в GitHub практики для усиления `frontend.agent.md`, `landing-builder/SKILL.md` и связанных frontend/design skills. Фокус: качество сборки лендингов, dashboard/console UI, компонентная архитектура, accessibility, responsive QA, Playwright/browser evidence и защита от generic AI UI.

## Источники

| Source | Что полезно | Как адаптировано |
| --- | --- | --- |
| `addyosmani/agent-skills`, `frontend-ui-engineering` | Production-quality UI, composition over configuration, separation of container/presentation, обязательные loading/error/empty states, WCAG/keyboard checks, red flags для AI look. | Усилены `landing-builder` и `frontend.agent.md`: frontend thesis до кода, component architecture, состояния, a11y и visual QA inventory. |
| `joshuadavidthomas/agent-skills`, `frontend-design-principles` | Роутинг между `app.md` и `marketing.md`: dashboards/admin/internal tools требуют другой плотности и композиции, чем landing/marketing surfaces. | Добавлено правило surface type: `marketing/landing`, `app/dashboard/console`, blended projects как отдельные views/sections. |
| `anthropics/skills`, `web-artifacts-builder` | Frontend skill должен явно избегать AI slop: чрезмерные centered layouts, purple gradients, uniform rounded corners, generic artifact look. | Расширен список anti-patterns в `landing-builder`: generic AI aesthetic, равные карточные мозаики, dashboard без primary workspace. |
| `lackeyjb/playwright-skill` | Skill для browser automation загружает минимальный контекст под задачу и поддерживает selectors, mobile emulation, visual regression, debugging. | Усилена evidence-модель: для визуально значимого UI нужны desktop/mobile screenshots или явный blocker. |
| `wilwaldon/Claude-Code-Frontend-Design-Toolkit` | Frontend quality растет от связки design skills, Figma/design-to-code, browser automation, accessibility, responsive specialists. | Подтвержден текущий порядок: design handoff -> frontend token/component sync -> screenshot QA -> Storybook optional export. |
| `shinpr/claude-code-workflows` | Frontend workflow полезнее, когда код привязан к design docs и tests, а не генерируется как одиночная страница. | Поддержано правило: frontend стартует только после upstream artifacts, результат фиксирует inputs, checks и deviations. |

## Выводы Для Нашего Pipeline

1. `landing-builder` должен начинаться не с кода, а с короткого `frontend thesis`: визуальная гипотеза, план контента, интеракции и rejected defaults.
2. Frontend agent обязан сначала классифицировать поверхность: landing/marketing, app/dashboard/console или blended. Это защищает dashboards от маркетинговой композиции, а лендинги от сухого operational UI.
3. Компоненты должны строиться через composition и single responsibility. Большие config-object компоненты ухудшают поддержку и часто дают generic layout.
4. Handoff из Figma должен превращаться в кодовые эквиваленты: variables -> CSS/Tailwind tokens, Auto Layout -> Flex/Grid/min/max/fill/hug constraints, variants -> props/state.
5. Evidence должен быть обязательной частью stage: typecheck/build плюс browser/Playwright screenshots на desktop/mobile для визуально значимого UI.
6. Storybook export полезен не как отдельная “витрина”, а как проверка, что Figma component inventory реально превращается в повторяемые компоненты и states.

## Примененные Изменения

- `agent-pack/skills/landing-builder/SKILL.md`: расширены procedure, component architecture, anti-patterns, evidence и validation gates.
- `agent-pack/agents/frontend.agent.md`: синхронизирован порядок frontend build с thesis/surface/tokens/component QA.
- `agent-pack/skills/design-engineering/SKILL.md`: усилены проверки interaction polish, responsive states и evidence.

## Sources

- https://github.com/addyosmani/agent-skills/blob/main/skills/frontend-ui-engineering/SKILL.md
- https://github.com/joshuadavidthomas/agent-skills/blob/main/frontend-design-principles/SKILL.md
- https://github.com/anthropics/skills/blob/main/skills/web-artifacts-builder/SKILL.md
- https://github.com/lackeyjb/playwright-skill
- https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit
- https://github.com/shinpr/claude-code-workflows
