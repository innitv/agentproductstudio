---
id: landing-builder
name: landing-builder
title: "Bespoke UI Landing Builder"
description: "Использовать при реализации этапа 08-frontend для landing, console или product UI из одобренных PRD/IA/design/copy/screens/prototype артефактов. Skill собирает React/Vite/Tailwind UI: для product UI по умолчанию из компонентов shadcn/ui, bespoke — для лендингов с сильным визуальным характером и нестандартных интерфейсов; выводит стиль из design-артефактов или reference-analysis, сохраняет workflow gates и пишет frontend-result evidence."
platforms:
  - open-code
  - claude
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

Стек по умолчанию: React + Vite + Tailwind CSS. Верстка целевого лендинга и калькуляторов живет в `apps/frontend/src/views/` — один экран, один файл. Заводи новый `<ProductName>View.tsx`, а не переписывай чужой экран под свою задачу. `App.tsx` держи тонким роутером; маршрут добавляй и в список корневого указателя `StudioIndexView.tsx`, иначе он не будет виден никому, кроме исходников роутера.

## 1.1. Выбор основы: shadcn по умолчанию, bespoke по характеру

Решение владельца продукта от 2026-07-27 (`CLAUDE.md` §6.1): **для product UI дефолт — компоненты shadcn/ui**, а не вёрстка примитивов с нуля. Они ставятся `yarn shadcn add <component>` в `apps/frontend/src/components/shadcn/` и после установки являются кодом проекта — править их можно и нужно.

Выбор основы делается до первой строки разметки и записывается в `frontend-result.md`:

| Поверхность | Основа | Что именно |
|---|---|---|
| `app/dashboard/console`, формы, таблицы, оверлеи | **shadcn/ui** | Примитивы из реестра; свой код — только на подтверждённый пробел (`Chip`, `SegmentedControl`, `InputCard` со сбросом, уровень `warning` у `Alert`) |
| `marketing/landing` с сильным визуальным характером | bespoke | Композиция, hero, ритм секций пишутся под задачу; служебные контролы (поля, кнопки, диалоги) всё равно берутся из shadcn, если нет причины иначе |
| Нестандартный интерфейс: редактор, канвас, плотная таблица | bespoke | Обоснование — в `design-brief.md` через Design System Strategy Gate |

Bespoke без такого обоснования — не «характер», а лишняя работа и второй непроверенный слой примитивов.

Границы правки shadcn (измерены экспериментом с разделением факторов, метод и числа — `design/tokens/shadcn/README.md`):

- **Меняй смело:** цветовые токены, гарнитуру, кольцо фокуса — через `design/tokens/shadcn/` и `yarn tokens:build`, не правкой значений в компоненте.
- **Не трогай `--spacing` и шкалу радиусов.** В Tailwind 4 от `--spacing` считаются все отступы и высоты; сжатие даёт дробные пиксели и ломает ритм.
- **Порталы** (`SelectContent`, `DropdownMenuContent`, `TooltipContent`, `sonner`) рендерятся вне контейнера темы — атрибут темы зеркалится на корень документа. Тени Tailwind впечатаны константой и токеном не управляются.

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
2. Перед кодом зафиксируй короткий frontend thesis:
   - `visual thesis`: настроение, материал, плотность, энергия;
   - `content plan`: hero/primary workspace, support/detail, conversion or task completion;
   - `interaction thesis`: 2-3 осмысленных motion/feedback решения;
   - `defaults to reject`: 3 типовых AI/default решения, которых нельзя допустить.
3. Определи тип поверхности:
   - `marketing/landing`: первый viewport работает как brand/product signal, composition-first, минимум chrome;
   - `app/dashboard/console`: primary workspace, navigation, inspector/context, плотная повторяемая работа;
   - blended projects разделяй на разные views/sections, не смешивай marketing hero с операционным dashboard.
4. Выбери основу по таблице §1.1 и зафиксируй выбор с причиной. Для shadcn-основы собери экран из компонентов реестра и вкладывай характер в тему (цвет, гарнитура, фокус) и композицию, а не в переписывание примитивов. Для bespoke-основы собирай UI на CSS Grid/Flexbox, где Tailwind — только запись значений из design/reference artifacts: не используй готовые шаблоны, дефолтные сетки и стандартный "component library look".
5. В reference-driven задаче layout, gaps, column counts, aspect ratios и section order бери только из `reference-analysis.md`; не подставляй Bootstrap-like/12-column defaults.
6. В обычной задаче стиль выводи из `design-brief.md`, `STYLE_GUIDE.md` и `figma-handoff-bundle.md` при наличии. Не навязывай glassmorphism, gradients, blur или темную тему, если они не заданы дизайном.
7. Синхронизируй tokens/components. Источник правды для значений — `design/tokens/` (DTCG, сборка `yarn tokens:build`; для shadcn-темы `design/tokens/shadcn/` и `yarn tokens:build`), а не Figma-файл: правка значения делается в токенах, иначе baseline-гейт отклонит незаявленное изменение. Если решение пришло из Figma-черновика `04-design`, оно переносится в токены один раз; обратной синхронизации нет.
   - design tokens -> CSS custom properties или Tailwind theme values;
   - Figma Auto Layout intent -> Flex/Grid, gap, padding, min/max, fixed/fill/hug equivalents;
   - component states/variants -> React props, data attributes или local state.
8. Реализуй component architecture: компоненты сфокусированы на одной задаче, без over-configured props, без prop drilling глубже 3 уровней. Состояние выбирай минимально достаточное: local state, lifted state, URL state, context или store только по необходимости.
9. Реализуй состояния: loading/empty/error/success для форм и ключевых интерактивных элементов, selected/active для навигации и списков, hover/focus/disabled для controls.
10. Подключи analytics hooks из PRD без отправки PII в event payload.
11. Проведи frontend QA inventory до финального ответа: пользовательские claims, важные controls, state changes, viewport requirements, визуально критичные зоны.
12. Обнови `frontend-result.md` в run directory: changed files, inputs read, implemented screens/sections, tokens/components mapping, analytics hooks, accessibility/responsive notes, validation commands и known deviations.

## 4. Component Architecture

- Держи view-level композицию отдельно от переиспользуемых компонентов.
- Компонент должен иметь одну ответственность; если файл компонента разрастается и смешивает layout, data mapping и behavior, выдели подкомпоненты или hook.
- Избегай "config-object UI", где компонент пытается принять все варианты через огромный набор props. Предпочитай composition: `Card`, `CardHeader`, `CardBody`, `ActionRow`.
- Для repeated UI опиши стабильные размеры и responsive constraints, чтобы длинный текст, hover/focus state или loading label не меняли layout.
- Не добавляй новую UI-библиотеку ради одного компонента. Используй существующий стек проекта: shadcn/ui уже в нём, добавление ещё одного набора примитивов рядом с ним — регресс, а не ускорение.
- Не переписывай примитив shadcn целиком, чтобы поменять внешний вид: сначала проверь, закрывается ли задача темой в `design/tokens/shadcn/`.

## 5. Anti-Patterns

- Generic AI aesthetic: фиолетово-синие градиенты, одинаковые карточки, чрезмерный `rounded-2xl`, декоративные shadows, "hero card" без связи с продуктом.
- Placeholder copy, который прячет реальные переносы текста.
- Uniform card mosaics вместо purpose-driven hierarchy.
- Сырые hex/pixel values, если есть tokens.
- Цвет как единственный индикатор статуса.
- Hover-only UX без keyboard/focus equivalent.
- Full-bleed hero, который теряет brand/product signal в первом viewport.
- Dashboard, где все панели равны и пользователь не видит primary workspace/action.

## 6. Evidence и failure modes

`frontend-result.md` обязан содержать:
- список измененных файлов;
- какие inputs прочитаны;
- какие acceptance criteria закрыты;
- какие tokens/components из design/Figma handoff использованы;
- какие команды проверки запущены и их результат;
- какие screenshots/viewport checks выполнены или почему они skipped;
- известные ограничения, deviations или blockers.

Блокируй stage как `blocked`/`partial`, если нет обязательных upstream artifacts, задача reference-driven без `reference-analysis.md`, frontend просит Figma write/deploy без approval, build/typecheck не проходит или визуально критичный viewport невозможно проверить.

## 7. Validation gates

- [ ] `yarn typecheck` проходит.
- [ ] `yarn build` проходит.
- [ ] Первый viewport не ломается на desktop/mobile.
- [ ] Нет horizontal overflow, перекрытия текста, битых изображений.
- [ ] Keyboard focus видим на интерактивных элементах.
- [ ] Loading/empty/error/success states проверены.
- [ ] Длинный текст не ломает кнопки, cards, table rows и nav.
- [ ] Motion не использует `transition: all`, поддерживает reduced motion и hover gated для fine pointer.
- [ ] Значения взяты из `design/tokens/`; сырых hex/px без токена нет, `yarn tokens:build` проходит baseline-гейт.
- [ ] Выбор основы (shadcn или bespoke) записан с причиной; bespoke для product UI имеет обоснование по Design System Strategy Gate.
- [ ] Analytics hooks соответствуют PRD и не содержат PII.
- [ ] Для визуально значимой UI-задачи есть Playwright/browser screenshot evidence на desktop и mobile или явный blocker.
- [ ] Экран имеет composition story в витрине (`ds-to-storybook`), и она рендерит тот же компонент, что и роут.
