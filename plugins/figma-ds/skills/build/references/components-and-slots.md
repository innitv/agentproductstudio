# Компоненты и слоты (механика Plugin API)

Что правильно по канону — выбор property, матрица состояний, анатомия, слоты — `/figma-ds:standard` §2. Здесь только **как это сделать** в Plugin API и на какие грабли не наступить.

## Выбор типа property
- **Сначала выбери ТИП property, потом строй** (канон выбора — `/figma-ds:standard` §2): VARIANT — реально разный вид/структура (`style × size × state`); BOOLEAN — видимость слоя; TEXT — редактируемый контент; INSTANCE_SWAP — сменный вложенный инстанс; **SLOT — гибкий контейнер** (add/edit/rearrange произвольного содержимого).
- ⚠️ **Подделывать слот вариантами — анти-паттерн.** Связка `text`+`icon` через свойства — частный случай для лейбла, а НЕ универсальная замена слоту. Нужен контейнер под произвольный контент — делай настоящий slot (`Convert to slot` / `Wrap in new slot`).
- **Ограничения слотов** (канон — `/figma-ds:standard` §2; знать ДО, а не после): нельзя применять properties к слоям ВНУТРИ слота; нельзя сделать slot из top-level слоя; два слота в варианте не делят одно slot property.

## Механизмы Plugin API (не забыть документирующие и exposed)
Легко упустить, собрав только variant/text.

- `addComponentProperty(name, type, default, options?)` принимает и `'VARIANT'` (добавить ось к существующему сету), и `'TEXT'|'BOOLEAN'|'INSTANCE_SWAP'|'SLOT'`; для СОЗДАНИЯ сета из отдельных компонентов — `combineAsVariants` (не «только combineAsVariants»). `editComponentProperty(key,{preferredValues,defaultValue,name,description,slotSettings})`; `deleteComponentProperty` — **не работает для VARIANT** (офиц. дока).
- Читать свойства сета — `componentPropertyDefinitions` (`variantGroupProperties` — **deprecated**). Инстансы компонента — `getInstancesAsync()` (`instances` — **deprecated**). `.key` есть только у ОПУБЛИКОВАННЫХ компонентов (нужен для `importComponentByKeyAsync` в другом файле); у локальных `.key` годится как `preferredValue`, но не для импорта.
- **`preferredValues` обязательны у КАЖДОГО `INSTANCE_SWAP`** — иначе swap в UI предлагает ВСЕ компоненты файла, а не нужный набор (`icon/*`). Формат: `set.editComponentProperty(swapKey,{preferredValues:[{type:"COMPONENT",key:c.key}, …]})` (для локальных иконок — их `.key`).
- **`node.description` / `descriptionMarkdown`** — документация компонента, видна в Assets/Dev Mode. Задавать КАЖДОМУ компоненту (purpose + usage). Без неё компонент документирован только в панели-витрине, но не в самой Figma (при handoff в код description доступен, витрина — нет).
- **`instance.isExposedInstance = true`** — экспонировать вложенный инстанс: его свойства становятся настраиваемыми с уровня родителя (без deep-override; читается через `parentInstance.exposedInstances`). Применять ИЗБИРАТЕЛЬНО: Modal footer-кнопки — да; галерея из 10+ инстансов — раздует API родителя, нет.
- `documentationLinks` / `annotations` / `reactions`+`setReactionsAsync` — ссылки на доки / dev-заметки / прототип-взаимодействия; в DS-файле обычно не нужны.

## INSTANCE_SWAP: default = node id, preferredValues = key
🔴 **`default` у `INSTANCE_SWAP` — это NODE ID строкой (`"152:28"`), а НЕ `.key` компонента.**

- **API:** `addComponentProperty(name,"INSTANCE_SWAP", "152:28", {preferredValues:[{type:"COMPONENT",key}]})`.
- **Грабля:** 40-символьный `.key` в позиции default кидает «Property value is incompatible with component property type» — это НЕ про локальные/неопубликованные компоненты и НЕ API-лимит, а неверный формат.
- **Итого:** default по node id, preferredValues по key. Слинковать инстанс со свойством: `iconInstance.componentPropertyReferences={mainComponent: swapPropId}`.

## Импорт по ключу работает ТОЛЬКО для опубликованных библиотек
🔴 **`importComponentByKeyAsync` / `importComponentSetByKeyAsync` из НЕопубликованного файла падает `Component with key "…" not found`** — даже когда ключ снят из этого же файла через `node.key` и синтаксически верен.

- **Что означает ошибка:** не «ключ неверный» и не «не хватает прав», а «Figma не индексирует ключи файла, не опубликованного как библиотека». Ключ остаётся валидным идентификатором ВНУТРИ файла и станет рабочим для импорта, как только файл опубликуют.
- **Следствие для сборки:** по неопубликованному киту макеты собираются только внутри него самого, компоненты берутся `getNodeByIdAsync(nodeId).createInstance()`. Чтобы собирать в отдельном файле — кит надо перенести в команду с платным планом и опубликовать (действие человека в интерфейсе, не через MCP).
- 🟢 **Диагностический приём — негативный контроль:** прежде чем объявить «импорт по ключу сломан», импортируй в тот же тестовый файл компонент из заведомо ОПУБЛИКОВАННОЙ библиотеки (найти её `componentKey` через `search_design_system`). Если контрольный импорт проходит, а целевой нет — причина именно в публикации, и это доказано, а не предположено. Проверено 2026-07-28: контрольный сет импортировался с 24 вариантами на том же View-seat, где целевой давал `not found`.
- **`search_design_system` ищет по подключённым к аккаунту библиотекам, а не по `fileKey`.** Параметр `fileKey` там — контекст, а не фильтр: по файлу-киту он вернёт компоненты чужих библиотек и ни одного своего. Пустой результат по своему файлу = файл не опубликован, а не «в файле нет компонентов».

## SLOT в Plugin API
«Convert to slot» звучит как чисто-UI, но API это умеет.

- **API:** `component.createSlot()` → нода type `SLOT` + авто SLOT-свойство. НЕТ `figma.createSlot` (даже `typeof figma.createSlot` кидает — Figma proxy).
- **Как строить:** поповер / меню / любой контейнер произвольного контента = контейнер + `createSlot()`, дефолт-контент перенести внутрь через `slot.appendChild`, затем `slot.layoutSizingHorizontal="FILL"`.
- **Анти-паттерн:** жёстко зашитый контент (divider, фикс-строки) в контейнере — divider вылезает там, где в конкретном использовании не нужен; должен быть контентом slot.

## Ширина dropdown
**Сначала реши ТИП, потом ширину** (частая ошибка — применить content-width к select).

- **SELECT** (выбор значения, есть триггер) → ширина ФИКСИРОВАННАЯ под набор ИЛИ = ширине триггера (match-trigger — канон Radix `--radix-select-trigger-width` / Material / shadcn). `max-content`/content-based для select ПЛОХО: дёргается при смене значения, галочка липнет к тексту без воздуха.
- **MENU действий** (kebab, разной длины пункты) → content-based (hug) уместен. Галочка selected — справа с воздухом (`SPACE_BETWEEN`), опции ровной ширины (FILL до контейнера, не HUG — иначе фоны рваные).
- **Figma НЕ умеет `max-content`** — «HUG-контейнер по самой широкой опции + все опции одной ширины» через auto-layout невозможно (HUG-родитель + FILL-дети схлопывается; HUG-дети едут по тексту). Для content-меню — ручной расчёт: измерить `max(opt.width)` → `container.counterAxisSizingMode="FIXED"`+`resize` → опции `layoutSizingHorizontal="FILL"`. Для select — просто задать FIXED ширину под набор.
- **В CSS проще:** select — `.dropdown{width:<fix>px}` + опция `justify-content:space-between`; menu — `width:max-content` + опция `width:100%`.

## Контент в slot инстанса — МОЖНО создавать/клонировать; нельзя только ПЕРЕМЕЩАТЬ (issue #351)
🔴 **Проверено 2026-07: в slot ИНСТАНСА МОЖНО добавлять НОВЫЕ и КЛОНИРОВАННЫЕ ноды.** `figma.createText()` / `node.clone()` (нода БЕЗ родителя) + `slot.appendChild(...)` — работает. Так наполняют слоты инстансов из плагина (напр. разный контент модалок).

- **Что #351 реально блокирует:** ПЕРЕМЕЩЕНИЕ уже-парентованной ноды (особенно лежащей внутри другого инстанса) в slot инстанса → «Cannot move node. New parent is an instance or is inside of an instance» ([figma/plugin-typings#351](https://github.com/figma/plugin-typings/issues/351)). Обход: не перемещать существующую — **СОЗДАТЬ/КЛОНИРОВАТЬ** и `appendChild`.
- 🔴 **Грабля раскладки слота (почему «контент есть, а пусто»):** `createSlot()` даёт slot с `layoutMode=NONE` + фикс-высота + `clipsContent=true`. Добавленный контент садится на абсолютную позицию донора и ОБРЕЗАЕТСЯ. Фикс: перевести master-slot в auto-layout — `layoutMode='VERTICAL'`, `primaryAxisSizingMode='AUTO'` (HUG высота), `layoutSizingHorizontal='FILL'`, `clipsContent=false`, padding 0. Тогда контент течёт и виден; пропагируется в инстансы.
- **Замена контента в инстансе:** очистить slot (см. ниже) → `appendChild` новый/клон.
- 🔴 **Клон в слоте инстанса ЗАМОРОЖЕН — не отслеживает мастер.** `master.clone()` + appendChild даёт НЕЗАВИСИМУЮ копию: поменял дефолт-контент в мастере → клоны в инстансах НЕ обновятся (визуально не отличить, ловится только интроспекцией). Живое наследование = **ПУСТОЙ слот** (инстанс показывает дефолт мастера, обновляется). Итого: контент фиксирован → клон ок; мастер будет меняться → либо пустой слот (инерит live), либо переклонировать ПОСЛЕ правок мастера. (Реальный случай: doc-строки модалки склонировали в сцены ДО конвертации в Function button; после конвертации мастера сцены остались с bespoke-клоном — пришлось переклонировать.)
- Помни: любая ошибка write откатывает ВЕСЬ скрипт — дробить на мелкие.

## Очистка inherited-детей slot
Очистка inherited-детей slot (**наблюдение канала use_figma, 2026-07**; `remove` inherited проходит; `appendChild` НОВЫХ/клонированных нод — тоже, см. секцию выше):

1. inherited children (`I`-префикс) при `remove` ПЕРЕИНДЕКСИРУЮТСЯ → удалять только `while(slot.children.length) slot.children[0].remove()`, не по снапшоту `[...slot.children]`;
2. часть inherited (FRAME-обёртки) кидают «not found» → робастный clear: try `[0]`, catch try `[last]`, счётчик «застрял → break»;
3. `findOne`/`.remove` по stale inherited id откатывает ВЕСЬ скрипт → проверку выносить в ОТДЕЛЬНЫЙ вызов.

## Не плодить компоненты — консолидация
- **Не плодить компоненты под контент.** Структурно одинаковые (лейбл, лейбл+иконка) — ОДИН компонент с properties, не 4.
- Консолидировать в component set: `type` (VARIANT) + `text` (TEXT) + `showIcon` (BOOLEAN) + `icon` (INSTANCE_SWAP).

## Паддинги и min-width
**Нормальные паддинги/min-width — не узкие контролы.** Ориентиры: кнопка md высота 40px, горизонтальный паддинг ≥16px (не 8–12), радиус 8px, min-width текстовых ≥64px.

## Иконки — vector-компоненты
- **API:** `figma.createNodeFromSvg(svg)` → `figma.createComponentFromNode(node)`; в UI только инстансы.
- **Грабля:** `createNodeFromSvg` даёт фрейм с СЫРОЙ фоновой заливкой — чистить `fills = []`, иначе инстансы потянут сырой цвет.

## Цвет иконки
**Цепочка из ТРЁХ звеньев, рвётся на любом:**

1. нода иконки → **component-токен иконки этого варианта** (`button/primary/accent/icon/color/default`), НЕ общий текстовый токен (`text/primary` / `text/ink` — как он назван в проекте). Иначе иконка на цветном фоне остаётся тёмной.
2. этот component-токен → **семантика семейства `icon/*`**, НЕ `text/*` / `status/*` / `accent/*`.
3. значит в semantic-слое нужен **полный иконочный набор**: `icon/{default|secondary|muted|subtle|accent|on-accent|danger|success}`.

**Одного лишь component-слоя МАЛО.** Реальный случай: component-токены были у всех компонентов, а иконочные слоты всё равно алиасили в `text/*` и `status/*` — просто потому, что иконочной семантики под ними не существовало и тянуться было некуда. Заводя первый `icon/*`-токен, сразу закрывай весь набор, иначе слоты разбегутся по чужим семьям.

⚠️ Имена токенов здесь и везде — **через слэши** (см. tokens-and-variables.md, правило слэш/дефис); дефисная форма — это только code syntax.

## Слот иконки
- инстанс-плейсхолдер; `showIcon` BOOLEAN → `iconInstance.componentPropertyReferences={visible:boolPropId}`;
- `icon` INSTANCE_SWAP → `{mainComponent:swapPropId}`; набор через `set.editComponentProperty(iconKey,{preferredValues:[...]})`.
- 🔴 **«Иконка невидима» после `swapComponent`+`resize` в clipsContent-обёртке.** Если иконка-инстанс лежит в фрейме-обёртке (`chevron-slot`/`icon-slot`) с `layoutMode=NONE` + `clipsContent=true`, после свапа/ресайза инстанс может сместиться на размер обёртки (напр. y+20 в 20px-фрейме) и уйти ЦЕЛИКОМ под отсечение → вектор корректный (visible, цвет, stroke), но обрезан = «пусто/несработавший свап». **Диагностика:** сравнить `absoluteBoundingBox` вектора с bbox обёртки — вектор ниже/правее фрейма. **Фикс:** обёртку перевести в auto-layout (`HORIZONTAL`, `primaryAxisAlignItems='CENTER'`, `counterAxisAlignItems='CENTER'`, `clipsContent=false`) — иконка центрируется независимо от размера, инстансы подтягиваются. Проверять bbox вектора ОТНОСИТЕЛЬНО слота, а не только его `visible`/цвет.
- **Не вращать иконку под направление** (частая ошибка вместо отдельных глифов): поворот вектора внутри clipped-компонента ненадёжно рендерится в ресайзнутых инстансах. Направленные варианты (chevron up/down/left/right) — ОТДЕЛЬНЫЕ vector-компоненты с baked-геометрией через SVG-path, не `rotation`.

## Проперти текста
- `const id=set.addComponentProperty("text","TEXT","...")` → `textNode.componentPropertyReferences={characters:id}`. Ключ для override читать с САМОГО инстанса.

## Override вложенных инстансов
- Брать `frame.children.filter(n=>n.type==="INSTANCE")`, НЕ `findAll` (иначе цепляются вложенные иконки и сдвигают индексы). Для plain-text override сперва `loadFontAsync`.
