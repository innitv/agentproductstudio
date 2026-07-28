# Census: shadcn-ui-community

Снят 2026-07-28 через Plugin API (`use_figma`, read-only). Итог: **88 страниц, 16 коллекций переменных (~1620 переменных), 117 текстовых стилей, 27 effect-стилей, 0 paint-стилей**.

## Структура документа

| Блок | Страниц | Что внутри |
|---|---|---|
| Служебные | 3 | `Cover` (0:1), `About the libarary` (663:1166), `shadcn/ui create plugin` (1425:29329) |
| **Компоненты** | **55** | Accordion … Tooltip — основной предмет ингеста, карта в `../components.md` |
| Examples | 5 | заголовок `Examples` (138:1158) + Dashboard, Tasks, Playground, Authentication |
| Blocks | 7 | заголовок `Blocks` (1088:8215) + Featured, Sidebar, Login, Signup, OTP, Calendar |
| Charts | 8 | заголовок `Charts` (201:18) + Area, Bar, Line, Pie, Radar, Radial, Tooltip |
| Иконки | 5 | Lucide, Tabler, HugeIcons, Phosphor, Remix |
| Разделители | 5 | страницы-сепараторы с именами `---` / `------` |

## Коллекции переменных

| Коллекция | Переменных | Modes | Роль |
|---|---|---|---|
| `mode` | 47 | **light mode, dark mode** | **семантический слой** — единственная, что нужна для сборки |
| `tokens` | 89 | Mode 1 | сырые числа (0…9999), база для алиасов radius/stroke |
| `rdx/colors` | 396 | light mode, dark mode | палитра Radix |
| `tw/colors` | 244 | Mode 1 | палитра Tailwind |
| `tw/padding` | 245 | Mode 1 | примитивы отступов |
| `tw/margin` | 245 | Mode 1 | примитивы отступов |
| `tw/border-radius` | 149 | Mode 1 | примитивы радиусов |
| `tw/gap` | 102 | Mode 1 | примитивы зазоров |
| `tw/space` | 68 | Mode 1 | примитивы |
| `tw/max-width` | 51 | Mode 1 | примитивы |
| `tw/font` | 47 | Mode 1 | примитивы типографики |
| `tw/border-width` | 45 | Mode 1 | примитивы |
| `tw/max-height` | 35 | Mode 1 | примитивы |
| `tw/height` | 24 | Mode 1 | примитивы |
| `tw/opacity` | 21 | Mode 1 | примитивы |
| `tw/stroke-width` | 11 | Mode 1 | примитивы |

Тиеринг фактический: **примитивы** (`tw/*`, `rdx/colors`) → **семантика** (`mode`) → компонентного слоя нет. Разбор — `../foundation.md`.

## Иконки (поимённо не индексированы)

| Набор | Страница | Компонентов | Префикс имён |
|---|---|---|---|
| Tabler Icons | 642:97 | 4963 | `tabler/*` |
| HugeIcons | 1361:5869 | 4527 | `hugeicons/*` |
| Remix Icons | 1603:3 | 1654 | `remix/*` |
| Phosphor Icons | 1528:9 | 1512 | `phosphor/*` |
| Lucide Icons | 135:2 | 1469 | `lucide/*` |

**Итого 14 125 иконочных компонентов.** Индексировать поимённо намеренно не стали: список такого размера не помещается в рабочий контекст и устареет раньше, чем понадобится. Искать точечно по имени:

```js
const page = await figma.getNodeByIdAsync("135:2");   // Lucide
await page.loadAsync();
return page.findAllWithCriteria({ types: ["COMPONENT"] })
  .filter(n => n.name.includes("calendar"))
  .map(n => ({ name: n.name, id: n.id, key: n.key }));
```

Для нашего кода профильный набор — **Lucide**: `lucide-react` и есть иконочная зависимость shadcn/ui.

## Готовые экраны (композиции, не компоненты)

Компонентов на этих страницах нет (`componentCount: 0`) — это собранные макеты из инстансов.

| Страница | Node ID корневого фрейма | Размер |
|---|---|---|
| Blocks/Calendar | 1099:1041 | 1445 × 33129 |
| Blocks/Sidebar | 1092:355 | 1436 × 16669 |
| Blocks/Featured | 1088:8221 | 1446 × 5745 |
| Blocks/Login | 1097:2023 | 1445 × 5256 |
| Blocks/Signup | 1196:1300 | 1445 × 5287 |
| Blocks/OTP | 1196:1596 | 1445 × 5246 |
| Examples/Dashboard | 135:7587 | 1445 × 1605 |
| Examples/Playground | 165:2697 | 1446 × 3126 |
| Examples/Authentication | 163:2272 | 1446 × 992 |
| Examples/Tasks | 153:7623 | 1446 × 980 |
| Charts/Area | 260:3742 | 1448 × 2096 |
| Charts/Bar | 846:33161 | 1448 × 2096 |
| Charts/Line | 859:3434 | 1448 × 2096 |
| Charts/Pie | 859:5251 | 1449 × 2204 |
| Charts/Radar | 867:9838 | 1449 × 2332 |
| Charts/Radial | 867:10759 | 1449 × 1178 |
| Charts/Tooltip | 869:1301 | 1449 × 1400 |

Ценность — как **референс композиции** (как автор собирает из этих же компонентов страницу), а не как источник компонентов. На каждой странице дополнительно висит инстанс `Be in the loop` (578 × 432) — рекламный блок автора файла, к системе отношения не имеет.
