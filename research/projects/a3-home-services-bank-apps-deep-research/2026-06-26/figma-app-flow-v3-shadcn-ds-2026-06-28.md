# Figma App Flow v3 / shadcn DS

## Status

`ready_for_review`

## Target

| Field | Value |
|---|---|
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/NUoNEuTJ3OZOGH2c780Z55/shadcn-ui-components-with-variables---Tailwind-classes---Updated-January-2026--Community-?node-id=3011-3 |
| Figma page | `for flow` |
| Board node | `3013:2` |
| Screen nodes | `3013:28`, `3013:90`, `3013:152`, `3013:205`, `3013:259`, `3013:311` |
| Screenshot QA asset | `03286ce3-48d5-458d-b9f0-80fc9d9b6343` |

## Why This Version Exists

Предыдущая v2 уже исправила главный продуктовый провал: экраны стали app flow, а не набором тематических страниц. Но она была собрана в отдельном A3 mockup-файле и оставляла риск нечетких переносов текста, потому что не была заземлена в shadcn/Tailwind DS-файле.

v3 собрана в указанном пользователем shadcn community file, на странице `for flow`, с опорой на локальные Tailwind variables, text styles, shadow styles и shadcn primitives pages: `Button`, `Card`, `Badge`, `Tabs`, `Input`, `Textarea`.

## Screen Flow

| Step | Screen | User question | Primary action | Next state |
|---|---|---|---|---|
| 01 | Home dashboard | Что по дому требует действия сейчас? | `Оплатить все` | Переход к счету ЖКУ |
| 02 | Bill detail | За что сумма и почему она изменилась? | `Перейти к оплате` | Payment review |
| 03 | Payment review | Кому, сколько и с какой карты я плачу? | `Оплатить 6 180 ₽` | Payment status |
| 04 | Payment status | Деньги ушли, когда исчезнет долг? | `Вернуться домой` / открыть чек | Status monitoring |
| 05 | Debt still visible | Что делать, если долг остался после оплаты? | `Отправить обращение` | Supplier dispute path |
| 06 | Services hub | Какие еще домашние сценарии есть рядом? | `Создать заявку` / семейный доступ | Secondary flows |

## Design System Grounding

| Layer | Applied |
|---|---|
| File context | Built inside `NUoNEuTJ3OZOGH2c780Z55`, page `for flow` |
| Variables | Existing collections detected: `tw/colors`, `tw/space`, `tw/gap`, `tw/border-radius`, `tokens`, `mode`, `rdx/colors` |
| Text styles | Existing Inter/Tailwind text styles detected and used as grounding; visible text uses Inter |
| Effects | Existing `Box Shadow/shadow-xs` and `Box Shadow/shadow-sm` used for card/button rhythm |
| Primitives | Local strip documents `button`, `card`, `badge`, `tabs`, `input row`, `bottom nav` |
| Layout | Screen frames, cards, rows, tabs and nav use Auto Layout |

## Visual Evidence

Lazyweb evidence from v2 was carried forward:

- banking home/dashboard patterns;
- utility bill payment/status patterns;
- maintenance request/service patterns;
- adjacent family access and consent patterns.

Weak Lazyweb matches for meter readings and family access were treated as adjacent evidence only, not as direct screen copies.

## QA Notes

Initial v3 write exposed a layout bug: the board was Auto Layout, so screens stacked vertically despite x/y coordinates. Fixed by setting screen frames, arrows and notes to absolute positioning inside the board.

Initial screenshot QA also found clipped text: several text nodes stayed at 10px height because the first script resized after setting `textAutoResize = HEIGHT`. Fixed by recalculating all text nodes, then increasing screen top padding, row spacing and card spacing.

Executable layout verification was added after user review:

- IR: `figma-layout-ir.json`
- Inventory: `figma-inventory-v3-shadcn-ds-2026-06-28.json`
- Visual QA: `figma-visual-qa.json`
- CLI: `yarn figma:verify-layout --ir ... --inventory ... --out ...`

The first full-tree Figma check found one concrete overflow: payment review checkbox text node `3013:183` exceeded parent `3013:182`. The checkbox slot was resized to 24px in Figma and the verifier was rerun. Final gate: `passed_with_notes`, `ready_allowed=true`.

Final machine checks:

| Check | Result | Evidence |
|---|---|---|
| `route_coherence` | `passed` | all 6 route screens exist |
| `text_height` | `passed` | 176 text nodes checked |
| `text_overflow` | `passed` | 176 text nodes fit parent bounds |
| `overlap` | `passed` | no significant sibling overlaps |
| `clipping` | `passed` | 342 nodes fit screen bounds |
| `safe_area` | `passed` | all screens respect 34px safe area |
| `ds_instance_honesty` | `passed_with_deviation` | local shadcn-like primitives are recorded honestly; published DS instances are not claimed |

Verified screenshots:

- Board screenshot: `03286ce3-48d5-458d-b9f0-80fc9d9b6343`
- Screen 01 after fix: readable header, amount card, list rows, insight card and bottom nav.
- Screen 05 after fix: readable problem state, action rows, textarea and primary CTA.

## Acceptance

Reviewer should be able to understand the route in 60 seconds:

1. where the user starts;
2. what the main payment action is;
3. why the amount changed;
4. what happens after payment;
5. what to do if the supplier still shows debt;
6. how secondary home-service scenarios connect back to the main route.
