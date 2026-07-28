# Источник: shadcn/ui components with variables (Community Copy)

## Файл

- **Название в Figma:** `shadcn ui components with variables - Tailwind classes - Updated January 2026 (Community) (Copy)`
- **file_key:** `pCDj1p7ItjKJcXPJZDqXi6`
- **URL:** https://www.figma.com/design/pCDj1p7ItjKJcXPJZDqXi6/shadcn-ui-components-with-variables---Tailwind-classes---Updated-January-2026--Community---Copy-
- **Тип источника:** `community_copy` — копия community-файла в аккаунте пользователя.
- **Дата ингеста:** 2026-07-28
- **Кем передан:** пользователь, явным запросом «даю дизайн-систему, инжектишь, потом строишь по ней макеты».

## Scope ингеста

Проиндексировано:

- перепись всех 88 страниц документа;
- компоненты и component set на 55 компонентных страницах (Accordion … Tooltip) — Node ID **и component key**;
- 16 коллекций переменных (счётчики и modes), полное содержимое двух ключевых: `tokens` и `mode`;
- счётчики пяти иконочных наборов (поимённо не индексировались — 14 125 компонентов);
- верхнеуровневые фреймы страниц Blocks / Examples / Charts.

Не индексировалось:

- вложенная анатомия компонентов (deep profiles) — создаются под конкретную задачу сборки, см. `_scan/manifest.md`;
- 14 125 иконок поимённо — искать точечно по имени через `figma.root` при необходимости;
- коллекции `tw/*` и `rdx/colors` (примитивы Tailwind и Radix, 1484 переменных) — зафиксированы счётчиками, значения читаются по требованию.

## Как читался файл (важно для повторного ингеста)

**`get_metadata` по этому файлу непригоден для переписи.** Без `nodeId` он вернул **1 страницу из 88** (только `Cover`) — это крайняя форма известной граблиы, записанной в `/figma-ds:build` → `use-figma-pitfalls.md#читающие-инструменты-врут` (прежний зафиксированный случай был «2 из 4»). Вывод «в файле ничего нет» на основании этого листинга был бы ложным.

Рабочий способ — Plugin API через `use_figma`:

```js
const pages = figma.root.children.map(p => ({ id: p.id, name: p.name }));   // все 88
const page = await figma.getNodeByIdAsync(pid);
await page.loadAsync();                                                      // без setCurrentPageAsync
const matches = page.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] });
```

`page.loadAsync()` грузит страницу **без переключения текущей** — благодаря этому 55 страниц сняты пятью вызовами, а не пятьюдесятью пятью (правило skill «одно `setCurrentPageAsync` на вызов» обходится законно).

Дополнительно: `use_figma` — write-канал, а он **освобождён от лимитов чтения**. Через read-инструменты (`get_metadata`, `get_screenshot`) такая перепись стоила бы месячный лимит View-seat.

## Права и лимиты

`whoami` на 2026-07-28: Ivan Ignatov (`ignatov@a-3.ru`). Планы: **A-3 — Full seat (pro)**, остальные три (`ignatov's team`, `trubachev's team`, `A3 Update`) — View/starter, где read-инструменты ограничены 6 вызовами в месяц. Этот файл — копия в личном пространстве; перепись сделана write-каналом и лимит не тратила.

## Статус библиотеки

Файл **не опубликован как Figma-библиотека** в аккаунте: `search_design_system` по запросу `button` вернул компоненты чужих подключённых библиотек (Andromeda UI Kit, Lib Gemini, Library_МосПлатежи, App Ui-kit) и ни одного из этого файла.

**Проверено экспериментом 2026-07-28:** импорт по component key снаружи файла не работает (`not found`), при этом на опубликованной библиотеке тот же механизм в том же тестовом файле отрабатывает штатно. Полный протокол с негативным контролем — `foundation.md` → «Эксперимент: импорт по ключу». Практическое следствие: макеты собираются либо внутри этого файла по Node ID, либо после публикации копии в команде с платным планом.
