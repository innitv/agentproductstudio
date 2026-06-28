# Chunk Manifest: shadcn-ui-components-2026

## Статус

`partial`

## Правило обновления

Готовые chunks не перечитывать без refresh-запроса. Для deep profile сначала выбирать конкретную категорию или компонент, затем читать точечный page/frame node.

| Chunk | Scope | Status | Source ids | Notes |
|---|---|---|---|---|
| `root-census` | Root pages, counts, Variables, styles | `done` | file `NUoNEuTJ3OZOGH2c780Z55` | Сохранено в `_scan/census.md`. |
| `button-context` | Representative Button context | `done` | page `72:2719`, frame `402:654` | Есть metadata + `get_design_context` screenshot/code. |
| `foundation-summary` | Variable collections and modes | `done` | local variables | Сохранено в `foundation.md`; значения переменных не выгружались полностью. |
| `variable-audit` | Variable scopes, code syntax, aliases, mode coverage | `done_with_risks` | all 16 local variable collections | Сохранено в `_scan/variable-audit.md`; найдены `ALL_SCOPES` и почти полное отсутствие WEB code syntax. |
| `core-components-map` | Component page list and primary frame ids | `done` | component pages | Сохранено в `components.md`. |
| `actions-profile` | Button, Button Group, Toggle, Toggle Group | `done_with_risks` | `402:654`, `1185:1980`, `79:10987`, `79:11264` | Сохранено в `components/actions.md`; `Button` property definitions blocked by Figma-side component set error, axes reconstructed from child names. |
| `forms-profile` | Input, Field, Select, Checkbox, Radio, Textarea, OTP | `done` | `76:8518`, `1188:5364`, `1188:4206`, `76:10807`, `73:4564`, `76:8893`, `76:9053`, `1254:66`, `101:745`, `73:5866`, `73:3711`, `73:4708`, `76:10513`, `76:10548`, `76:8597` | Сохранено в `components/forms.md`. |
| `overlays-profile` | Dialog, Alert Dialog, Drawer, Sheet, Popover, Tooltip, Hover Card | `done` | `74:7828`, `402:419`, `74:7968`, `76:10203`, `76:8822`, `76:8466`, `79:11350`, `74:8113`, `73:5633`, `76:8618`, `73:3341`, `73:4665`, `73:5422` | Сохранено в `components/overlays.md`. |
| `navigation-profile` | Breadcrumb, Navigation Menu, Pagination, Menubar, Sidebar | `done` | `101:424`, `76:8691`, `76:8794`, `269:47`, `76:10755` | Сохранено в `components/navigation.md`. |
| `feedback-profile` | Alert, Sonner, Skeleton, Progress, Spinner, Empty | `done` | `73:3398`, `76:10521`, `76:8886`, `76:10492`, `1196:1175`, `1186:3810` | Сохранено в `components/feedback.md`. |
| `data-display-profile` | Table, Data Table, Card, Chart, chart pages | `done` | `73:4333`, `76:10620`, `73:5727`, `296:98`, `73:3473`, `73:3479`, `73:4464`, `1098:925`, `1196:924`, `1196:1098`, `76:8955`, `76:10176` | Сохранено в `components/data-display.md`. |
| `blocks-profile` | Featured, Login, Signup, OTP, Blocks Sidebar, Blocks Calendar | `pending` | block pages | Использовать как screen references, не как primitive components. |
| `icons-profile` | Lucide, Tabler, HugeIcons, Phosphor, Remix | `blocked` | icon pages | Массовое чтение запрещено из-за размера; нужны точные icon queries. |
