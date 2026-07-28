# Карта компонентов: shadcn-ui-community

Снято 2026-07-28. **55 компонентных страниц, 172 верхнеуровневых компонента/сета.** Node ID адресует компонент внутри этого файла; `key` — для `importComponentByKeyAsync` из другого файла (см. `foundation.md` → «Как вставлять компоненты»).

Колонка «в коде» — есть ли парный компонент в `apps/frontend/src/components/shadcn/`. Машиночитаемая версия связи — `component-contracts.json`.

## Обозначения

- **SET** — `COMPONENT_SET` (есть матрица вариантов), **C** — одиночный `COMPONENT`.
- Вложенные варианты сетов в таблицы не выносятся — они адресуются через свойства инстанса.

---

## Формы и ввод

### Input (страница 73:1977)

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Default | SET | `520:3062` | `f535b9ae606f9c82894fb2d1884d7329aa7e23a4` | State: default, active | `input.tsx` |
| With Label | SET | `588:108` | `5ba1faf49ac375aa81a8e5fb0a0fb0a8a9e59128` | State: default, active | — |
| With Button | SET | `588:141` | `b5627843beeb874fdfb9476015d6074cf4be687a` | State: default, active | — |
| File | C | `76:8594` | `611d06c9918ee7428c1ed29070148328c1b9b71a` | — | — |

### Textarea (страница 73:2900)

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Default | SET | `623:3553` | `34a3c675142be32fc902d7b4cda3705f7c8bfd6e` | State: default, active | `textarea.tsx` |
| With_label | SET | `623:3605` | `77bee492f3ec00e88a12c9c9d63c02528a7cba94` | State: default, active | — |
| With_text | SET | `623:3651` | `76a41de5a268461ef30465a07c650b3ec2068e2e` | State: default, active | — |
| With_button | SET | `623:3719` | `733166e5760f75f83bca7c9aa75d9926b8aa64ca` | State: default, active | — |
| Disabled | C | `623:3552` | `7afd96f924ab1983bc03553c811bbc54eae82433` | — | — |

### Checkbox (страница 72:2723)

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Default | C | `511:809` | `337a5b68a4e7e03eac27ab5d10ca231ead937341` | — | `checkbox.tsx` |
| Subtext | C | `511:808` | `cc6e2e66602515c675a8aa631ff43902c8b89781` | — | — |
| Disabledd | C | `511:806` | `70a2bb8e67bc241f2810e4a9b7ef5078409a0c8b` | — | — |
| Checkbox_card | SET | `511:817` | `31d332be5428d9423564f40a5bc6f2a36e2e4cf0` | Type: checked, card | — |

> Имя `Disabledd` — опечатка в исходном файле, не наша. При обращении по имени учитывать.

### Radio Group (73:1984), Label (73:1978), Switch (73:2897), Slider (73:2895)

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Radio_group | C | `76:8953` | `851f5fbda63bc99f49c910a8afa1e9cecbc74163` | — | `radio-group.tsx` |
| Label | SET | `76:8617` | `50011d8836915d230368023454b8aa8e86a8c3f0` | State: default, checked | `label.tsx` |
| Switch | SET | `76:10618` | `a2735752d9469efefe3a8ebdf448270a4d3601f7` | State: Off, On | `switch.tsx` |
| Slider | C | `76:10520` | `9f3fd03dfc65d1c4dd0055b6e86f6f067cfead11` | — | — |

### Select (73:1986) и Native Select (1254:65)

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Select | SET | `614:1543` | `217e5ca1c71d0171e4ec1476930306c1a9583844` | State: default, open | `select.tsx` |
| Scrollable | SET | `614:2466` | `97042556e0cf03190898a80b52e0ed8cb4057236` | State: default, open | — |
| Native Select | SET | `1256:373` | `793684e6d2fca518e6aa0407ca917ac31d20f074` | State: default, open | — |
| With Groups | SET | `1264:743` | `0cf6160968e4dcef738b420a90683d8d305d5974` | State: default, open | — |
| Invalid State | SET | `1264:758` | `143e6c5a6e89d124e709da3b92ae08bf0cada79e` | State: default, open | — |
| Disabled | C | `1264:757` | `58e21c2025745c451f58b2cd8d57f04a391654e9` | — | — |

### Input OTP (страница 101:698, в файле названа «Input OPT»)

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Input_OPT | SET | `101:1013` | `3092f7b50547b178a92a5ef17008ea7c9b89502b` | State: default, active |
| Pattern | SET | `597:584` | `8d097a717d8e192e83ed304aab8b00ba567d8115` | State: default, active |
| Separator | SET | `597:640` | `22dab7b1e34d272c8f4bcedde3bd7a059a108e92` | State: default, active |
| Controlled | SET | `597:721` | `d8d9ce02ada57cc0ce7a8700e9f31fdd91579e11` | State: default, active |
| Form | SET | `597:816` | `7edac1841d94e8e6e39d73916cdd2c1dfbe7f562` | State: default, active |

### Field (страница 1188:4205) — 12 компонентов, обёртки поля формы

| Компонент | Тип | Node ID | key |
|---|---|---|---|
| Field | C | `1188:5362` | `cbe7caa25e30eea10b49470ad39a2a3b2997a1e1` |
| Field Group | C | `1188:5361` | `5a1e0df8229595abb4b6fd4fbd91fc41dc9e584c` |
| Fieldset | C | `1188:5353` | `df6c06805ff92b12ba52b58b9ccfb47b3f3afc7a` |
| Input | C | `1188:5358` | `586ff5f9fc5cdffa8f2692755109cc9a4c1b866f` |
| Textarea | C | `1188:5360` | `73246d1dd627ae5d578dd0daa24f0d4202ab1574` |
| Select | C | `1188:5357` | `6ad46c419aca955a2667ee00b3056ed26f7e6242` |
| Slider | C | `1188:5355` | `a5445842398f1b1f263985a35dcdf48ba0efa3d5` |
| Checkbox | C | `1188:5352` | `c224d601badb84ad9a53d23091601f18d248a517` |
| Radio | C | `1188:5359` | `0ff2a28fc0217fe5b19d1c481271606f92b1eaaf` |
| Switch | C | `1188:5354` | `789c64fcab0fdb45485fe29a08371a2280b5a50d` |
| Choice Card | C | `1188:5356` | `9a7d05a4251fbe7b630e8ba0341cc9a490be0bd8` |
| Responsive Layout | C | `1188:5351` | `75680d40827f2e1b1c40e3e35e7acb33917b995b` |

### Input Group (страница 1188:5363) — 11 верхнеуровневых из 35

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Input Group | SET | `1188:5536` | `5b1fd1fc7a432b139f4069f076ba23e6a4a47495` | Type: 1, 2, 3, 4 |
| Icon | SET | `1188:5600` | `fd0317fb319af7c98ef46e5b93ebb19717597a24` | Type: 1, 2, 3, 4 |
| Text | SET | `1188:5707` | `14f04f95d48942878bb33bb0b715f5059416341e` | Type: 1, 2, 3, 4 |
| Button | SET | `1188:5741` | `1c89493d7f3c3ca63a8611def0561f3bfc326773` | Type: 1, 2, 3 |
| Tooltip | SET | `1196:225` | `30a2d66ecd6dc229b63412d00ec6dff83c5b14e8` | Type: 1, 2, 3 |
| Spinner | SET | `1196:486` | `654927bb4b4a909503811fb216510242076cdd1d` | Type: 1, 2, 3, 4 |
| Dropdown | SET | `1196:781` | `af4903087f7da5005ce9add932caae4c02da2d14` | Type: 1, 2 |
| Textarea | C | `1196:412` | `8950f47768f84b5f9a7dce13ba5cde83a01d7f69` | — |
| Textarea | C | `1196:840` | `85cdc0de03e578cfeaebaeb9d8102f309a47fb6b` | — |
| Label | C | `1196:530` | `868088addf9b1da0e14a684d184ebd41a70501e3` | — |
| Button Group | C | `1196:821` | `393eece512473cd7cb465c9feebc16d416e1c902` | — |

> Варианты названы числами (`Type: 1,2,3,4`) — из имени не видно, что означает вариант. Перед использованием снять скриншот сета.

---

## Действия

### Button (страница 72:2719) — ⚠ дефект в файле

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Buttons | SET | `73:3681` | `19ba4c5948fd33906ec78e7db8ba280a70408029` | **не читаются** | `button.tsx` |

Figma отдаёт `in get_variantGroupProperties: Component set has existing errors` — **дефект самого component set в исходном файле** (типовая причина: дубли комбинаций вариантов или сломанные имена). Node ID и key валидны, инстанс создать можно, но матрица вариантов недоступна через API. Всего на странице 27 компонентов (26 внутри сета).

Обходной путь — перебрать детей сета напрямую:

```js
const set = await figma.getNodeByIdAsync("73:3681");
return set.children.map(c => ({ name: c.name, id: c.id }));   // имена вида "Variant=..., Size=..."
```

Это единственный компонент из 172, где чтение вариантов упирается в дефект файла. При выборе основы для кнопки помнить, что в коде у нас `button.tsx` из штатного реестра — он не дефектный, и в спорном случае прав он.

### Button Group (страница 1185:1979)

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Button | SET | `1185:3073` | `c30d827743ee91a0d2063341ad7d678a2d5e3c38` | Size: default, small, large |
| Dropdown Menu | SET | `1186:3685` | `344bb1434816a9606c028f8d1815575ade92a467` | State: default, open |
| Select | SET | `1186:3770` | `228fba2efb9ef4a5b129509ce12df8d8cc31a56e` | State: default, open |
| Popover | SET | `1186:3808` | `db917ca87c918db8d14f25ebe9a46288a129538c` | State: default, open |
| Button group | C | `1185:2953` | `b761efc8fc9d02bb8dd8237b911ad7eab53e15c5` | — |
| Orientation | C | `1185:3010` | `bfa2b0436ba966fe955e208f8870c1caaf7268d5` | — |
| Nested | C | `1186:3137` | `3f37baaa8aa4b368080ffe4e7febe869a5b6ad12` | — |
| Separator | C | `1186:3146` | `3def9e51d68d1d4c422632c8c0db645be32b1617` | — |
| Split | C | `1186:3165` | `63cfdfe3f63c368d76a698547b4bf51951a838cd` | — |
| Input | C | `1186:3177` | `11cb6f76a0e8b531dd1404b9160e59c28ee5044b` | — |
| Input Group | C | `1186:3210` | `07075c074f8625392513afc14cbfc3660ee61158` | — |

### Toggle (73:2902) и Toggle Group (73:2903)

| Компонент | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|
| Toggle / Default | SET | `79:11038` | `082091a2e00f6fdd08d3cf168502a1b99d1bdc62` | State: default, active | `toggle.tsx` |
| Toggle / Outline | SET | `79:11048` | `02a7be1498b4437bc79ea222ea3ad8fe91c0f124` | State: default, active | — |
| Toggle / With_text | SET | `79:11049` | `b39c17aecf7603848c364225efc608594ea6f8c8` | State: default, active | — |
| Toggle / Small | SET | `79:11050` | `d9eefe8d0b5a85eff7df99e7d48be2bf78c97396` | State: default, active | — |
| Toggle / Large | SET | `79:11051` | `c0157a634e5d7583a33670a76be5415f95239e79` | State: default, active | — |
| Toggle / Disabled | C | `79:11045` | `822e49ae4a779fa019748581c31f0a65a71f67bc` | — | — |
| Toggle Group / Default | SET | `624:124` | `57f8896ed40832460405c74595871beeeefb4a12` | State: default, active | `toggle-group.tsx` |
| Toggle Group / Outline | SET | `624:135` | `6953a841ad40578dc042c811fde0594d634ac8b5` | State: default, active | — |
| Toggle Group / Outline | SET | `624:168` | `d8c90a2b829d077250b82ac1b109e90ef337cd6c` | State: default, active | — |
| Toggle Group / Outline | SET | `624:236` | `54cd7d6ab71f23a0a0c343d8e31035b23659f67c` | State: default, active | — |
| Toggle Group / Small | SET | `624:191` | `35983a8b945485bd230d4c3cac678a5118866560` | State: default, active | — |
| Toggle Group / Examples/Disabled | C | `79:11343` | `e897b984e32acd3d71b17ed37f3eeca3dac97e65` | — | — |

> Три разных сета с одинаковым именем `Outline` на странице Toggle Group — различать по Node ID, не по имени.

---

## Навигация

| Компонент | Страница | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|---|
| Breadcrumb | 101:2 | SET | `665:2036` | `1799da983af2e31b25ea96066f31f20881c09b44` | Type: collapsed, custom_seperator, dropdown, link_component, responsive | `breadcrumb.tsx` |
| Tabs | 73:2899 | C | `76:10806` | `07579f33d36ccba28a6738ed593d4810bd26f5df` | — | `tabs.tsx` |
| Navigation_menu | 73:1980 | SET | `601:467` | `934d9b094b732e7b78b8d1d611466083f798d5d1` | State: default, open | — |
| Menubar | 73:1979 | SET | `600:228` | `ec7a50ca6502630144ae32ddd57be91a36428d09` | State: default, hover | — |
| Pagination | 73:1981 | C | `76:8821` | `85b6eecf196bee7b97d910b7d8ee78fc38f03b3f` | — | — |
| Sidebar | 269:32 | SET | `616:3399` | `1562a2a236f9f5918693e3cc26ba29725dd31824` | State: Closed, Open | — |

---

## Оверлеи и меню

| Компонент | Страница | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|---|
| Dialog | 73:227 | SET | `594:105` | `67371386ade6e17e61a089ffccca005a7234fb0a` | State: default, open | — |
| Custom_close_button | 73:227 | SET | `594:108` | `b0b36418facb3bc6ab034fe8961109652ca4af94` | State: default, open | — |
| Alert dialog | 72:2675 | SET | `73:5720` | `34cc968d2f6eb019ce5ae7e24c2bdc8a323a8217` | State: Button, open | — |
| Alert dialog / Dark mode / Prototype | 72:2675 | SET | `340:372` | `2ea1c7d06288e498674988daec1ec565e83875dc` | State: Default, Alert dialog | — |
| Drawer | 73:228 | SET | `594:255` | `5958151c0a5f80e809bf84e62a7cd9bb408f9e3d` | State: Button, Drawer | — |
| Responsive Dialog | 73:228 | SET | `594:375` | `157bdf07cddd117c47b1e2d73d9f61806176169f` | State: Button, Dialog | — |
| Sheet | 73:1988 | SET | `615:3344` | `6b8f6afba92d0aef1b03c92761c4d670fad990bb` | State: default, open | — |
| Popover | 73:1982 | SET | `605:1287` | `fafc720267b3a3e2620f6f7ee8f0aa26a5867e65` | State: default, open | — |
| Hover_card | 73:231 | SET | `597:458` | `470b7d484886a84b905852aefd34b9b44f7fa600` | State: Button, Hover | — |
| Tooltip | 73:2904 | SET | `624:291` | `5bef9bb34b20e35a551323199178fc999f617e1c` | State: default, hover | `tooltip.tsx` |
| Dropdown_menu | 73:229 | SET | `597:279` | `2c60a70681f764c1f2babae66a70614b0aa8f733` | State: default, open | `dropdown-menu.tsx` |
| Dropdown / Checkboxes | 73:229 | SET | `597:331` | `c0bcef87ea9ad9332cb3665831eafd7b264dff97` | State: default, open | — |
| Dropdown / Radio_group | 73:229 | SET | `597:383` | `560d8a05fd5b00d4b2d20ff8c7c19355b25a3372` | State: default, open | — |
| Context menu | 73:224 | SET | `73:5726` | `4034a4c5e98d6696361378c1c4127df7d3c4b9a2` | State: default, open | — |
| Command / Examples | 73:223 | SET | `73:5632` | `29651d179c3662442ee8278df60931fdcb39f5f1` | State: default, open | — |

### Combobox (страница 73:187)

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Combobox | SET | `517:566` | `50288d14e1898a2ce29419a31dd824afeb40cfa7` | State: default, open |
| Popover | SET | `515:481` | `4603837354036bfe51bf1cb63c01f29ddf87139f` | State: default, open |
| Dropdown menu | SET | `516:117` | `742f7ca08771f5aa6aad175659950bc16e7c8f04` | State: default, open |
| Responsive | SET | `1418:2011` | `d980c7d36a4c9092af0145ff5924c7e20a92a221` | State: default, open |

---

## Отображение данных

| Компонент | Страница | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|---|
| Card | 72:2721 | C | `73:4454` | `53c1f4cdbdf1a27bfb62add6a30794a096b9d593` | — | `card.tsx` |
| Table | 73:2898 | C | `76:10754` | `af230fd0a968a2bdd44477033ade0854307c740e` | — | — |
| Data table | 73:225 | C | `73:5865` | `557ea3796b884fd1c7e1a95eb8141df39aac3c1b` | — | — |
| Badge | 72:2718 | SET | `665:2024` | `799e543cd4678cd5cc25484c0177bdbe48373b3c` | Type: default, default_number, destructive, destructive_number, outline, secondary, secondary_icon, secondary_number | `badge.tsx` |
| Separator | 73:1987 | C | `76:10202` | `89e16c56a3c19df26e1fc5d3a3a6407c7191dfb7` | — | `separator.tsx` |
| Progressbar | 73:1983 | C | `76:8892` | `7563b8e3ec07db0111c22d6d1a99488f08c647a6` | — | — |
| Scroll_area | 73:1985 | C | `76:9051` | `0f9924d576c77877df221f79b5c367af2364c576` | — | — |
| Horizontal_scrolling | 73:1985 | C | `76:9052` | `e3850a99b7cfa09f1878427926de2e4d1fa68016` | — | — |

### Avatar (72:2717), Skeleton (73:1989)

| Компонент | Тип | Node ID | key |
|---|---|---|---|
| Circle | C | `455:365` | `c4139d0971c99556b46ca4ce106115c00b3628d9` |
| Square | C | `455:364` | `b56306b3b31889db212d242a8ce570b0cace0bd2` |
| Avatar_group | C | `455:363` | `8d016500c5c2a467dae0849dca4fd36d0ba409e9` |
| Skeleton | C | `76:10511` | `082f11d6fd5dab700b78ef2986c07136f83a0098` |
| Skeleton / Card | C | `76:10512` | `1a22fd5cb9315283b31fd30ea816914c01647bbf` |

### Accordion (72:2591), Collapsible (72:2724), Carousel (72:2722)

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Accordion | SET | `73:3394` | `6d85e754fbde9c4ac196486b217b93ee741dce77` | State: default, open |
| Accordion (демо) | SET | `308:659` | `ab91399a7d0548528a2ae0dcf91a88e2f1ee901e` | State: Default, Question#1, Question#2, Question#3 |
| Wrapper | SET | `308:76` | `c32c6c315bad70a83aa3361cd2c91bba902c9bad` | State: Hover, Default |
| Collapsible | SET | `73:4707` | `5088cabdf250aee80be009b29fc6bfe4501009bf` | State: default, open |
| Carousel | C | `479:736` | `b1bc79d78b125d90674b448972a1a117b4f41da4` | — |
| Carousel / Sizes | C | `73:4562` | `41e6d699e04cefeb9af43128b6b5cf21496e2a90` | — |
| Carousel / Orientation | C | `73:4561` | `f7e9ca6b19b4b3dc2534af77176a0e1bbf10966f` | — |
| Carousel / API | C | `73:4560` | `9a2f4ff162262e5c16f4233b085629910b3b4838` | — |

### Item (страница 1196:923) и KBD (1196:1097, в файле «KPD»)

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Item | SET | `1198:338` | `3eacdb6a3ef86493d9b0dc402eafa4337ddaacbd` | Type: default, outline, muted |
| Item / Size | SET | `1198:339` | `70059b34e8bf24e2573c8e3c57317f0f280479f9` | Size: sm, default |
| Item / Avatar | SET | `1200:509` | `c6766a3d725113328cf6a75bf83b5da061eb4234` | Type: 1, 2 |
| Item / Link | SET | `1201:1030` | `872aaefaf76693d48c27c87d49559eab802c21ec` | Type: default, outline |
| Item / Dropdown | SET | `1201:1323` | `4f9ea7d29221bd3853fe69d41d5c2016d1a2959c` | State: default, open |
| Item / Icon | C | `1198:439` | `5d33d7ee4786d4dc40c00d7a1615a45ad5c32809` | — |
| Item / Image | C | `1201:597` | `5f85a0db26dcee02b882cdf2600636bd44017d4c` | — |
| Item / Group | C | `1201:664` | `2ce64f0e17946057aac8150d6651a0b6e8d80e88` | — |
| Item / Header | C | `1201:997` | `956590c521edae7e097af92260953323350bde05` | — |
| Kbd | C | `1202:408` | `0794f2147f9e01cca08f756eddd6fb100c1c811f` | — |
| Kbd / Group | C | `1202:409` | `478f0c7d38070418906c9dd1a25029b9a79562c6` | — |
| Kbd / Button | C | `1202:410` | `187ff0cb0c5886e686d6b2c7b00d0d5824848945` | — |
| Kbd / Input Group | C | `1202:406` | `8167098c36aafa57af67209faa2aa0ad4afcd636` | — |
| Kbd / Tooltip | SET | `1468:5912` | `89d41bcf7332e79bbf1d69afead2c17303b8c934` | State: hover, default |

---

## Обратная связь

| Компонент | Страница | Тип | Node ID | key | Варианты | В коде |
|---|---|---|---|---|---|---|
| Alert / Default | 72:2633 | C | `73:3445` | `3d4bb566374a752e09abc07397648da020a76c13` | — | `alert.tsx` |
| Alert / Title only | 72:2633 | C | `381:854` | `65a88e0401ebdbcc018015e582c04e126ffab64e` | — | — |
| Alert / Destructive | 72:2633 | C | `381:855` | `749df87038a9e67d04832ad8a4412884833f28a4` | — | — |
| Sonner | 73:2896 | SET | `1468:6037` | `53d197b38c81ddded6aae870ff2c298c88fc4957` | Type: promise, default, success, info, warning, error | `sonner.tsx` |
| Sonner (одиночный) | 73:2896 | C | `76:10547` | `1b08260f05ec49aa2dad4624f52a8098cdf2008b` | — | — |

> **Alert в этой библиотеке — три отдельных компонента, а не сет с вариантом уровня.** Это совпадает с зафиксированным в `CLAUDE.md` §6.1 фактом: у `Alert` в shadcn нет уровня `warning`. У `Sonner`, наоборот, шесть уровней включая `warning` — расхождение между двумя способами показать сообщение существует и в библиотеке, и в коде.

### Empty (страница 1186:3809) — пустые состояния

| Компонент | Тип | Node ID | key |
|---|---|---|---|
| Empty | C | `1188:4199` | `a3aaf7890d40237f6f41b38f178b64ab1bfd3c39` |
| Outline | C | `1188:4200` | `2a02ca1f04fd67984c0a346f5e112783f2cc21be` |
| Background | C | `1188:4201` | `c4e314f61648b539cedf106bb468f8e8ee1b126b` |
| Avatar | C | `1188:4202` | `24044938844d4ac9bf32778423c55946e51c6725` |
| Avatar Group | C | `1188:4203` | `c954db8aa2b8b9d929da8134f2885f01d85aa58f` |
| InputGroup | C | `1188:4204` | `844132d92c2cf66d0756ab4d602c9a19e0f29323` |

### Spinner (страница 1196:1174) — состояния загрузки

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Size | SET | `1202:641` | `eefff4b783124aa921982d55685c8998220597b6` | Size: 12, 16, 24, 32 |
| Color | SET | `1202:668` | `97f60b6c0b2e1b8aea829c9efa6dbcb7282e7b30` | Color: yellow, red, green, blue |
| Button | SET | `1202:699` | `8a3a9825fb2ab7f0998ba6244857e8b84b3c6aa6` | Type: default, outline, secondary |
| Badge | SET | `1202:731` | `141ce16e8f6394f5c57f8d859a7cec9a4000c050` | Type: default, secondary, outline |
| Input Group | SET | `1202:778` | `a3544cb6a3b62397b8fb01b70fb4f2bff4b6b53a` | Type: InputGroupInput, InputGroupTextarea |
| Spinner | C | `1202:642` | `9a27163121d3ae544021fbb2da5c7a3ef6cd2a29` | — |
| Loader | C | `1202:644` | `dcecae9699910b5dd84f9da40cbaa8c14d69ee97` | — |
| Empty | C | `1204:80` | `edd7cfd4886933c3e266208b369af2ae7c77f9c6` | — |
| Item | C | `1204:183` | `1bcccc338db488d0106382c5b295af1527b07043` | — |

**Empty и Spinner закрывают пустое состояние и загрузку — те самые состояния интерфейса, которые по `CLAUDE.md` §5 обязаны быть описаны на `06-screens`.** При сборке экранов брать отсюда, а не рисовать заново.

---

## Дата и время

### Calendar (72:2720) и Date Picker (73:226)

| Компонент | Тип | Node ID | key | Варианты |
|---|---|---|---|---|
| Calendar | C | `502:3312` | `fbbd69b379ae20006d85b4488ac0d18dd46145ab` | — |
| Range Calendar | C | `502:3314` | `c455e53f9a623088e855cc61f87a5e64f914f7de` | — |
| Persian / Hijri / Jalali Calendar | C | `502:3313` | `265b6b1c6ce90e4e5e8e825910dc504a25f5c753` | — |
| Custom Cell Size | C | `1463:5909` | `056564160130d67ce546390e58affe1a41665355` | — |
| Month and Year Selector | SET | `502:3321` | `171806693ae4935810293559c1b6d8bfa230cb6a` | State: default, open |
| Date of Birth Picker | SET | `502:3324` | `467947ff86509a41fbd8fe48ef2052a121e1b85b` | State: default, open |
| Date and Time Picker | SET | `502:3327` | `413062563e0c60e82bcd3b562a00b998cccb7d3a` | State: default, open |
| DP / Date of Birth Picker | SET | `626:2436` | `5453b57b583fc13b77e0ffd6bc62795c5522d896` | State: default, open |
| DP / Picker with Input | SET | `626:2709` | `eed7c177621a4b5b64ca139d1a714c07ebbdcfc2` | State: default, open |
| DP / Date and Time Picker | SET | `626:2710` | `60d78b4c959caa12c49395eb8676a46dd8eca82f` | State: default, open |
| DP / Natural Language Picker | SET | `626:2864` | `7fd725f5f951a512fba023d679d8d72e48064edf` | State: default, open |

> Date-пикеры продублированы на двух страницах (Calendar и Date Picker) с разными Node ID. Различать по странице; при сборке брать одну из версий и не смешивать.

---

## Пустые страницы

`Aspect Ratio` (1098:924) и `Chart` (296:42) — **0 компонентов**. Aspect Ratio в shadcn — служебная обёртка без визуала, а графики лежат готовыми композициями на страницах Charts (`_scan/census.md`), не компонентами.

---

## Иконки

14 125 компонентов в пяти наборах, поимённо не индексированы. Счётчики, префиксы имён и рецепт точечного поиска — `_scan/census.md` → «Иконки».

Профильный набор для нашего кода — **Lucide** (страница `135:2`, 1469 иконок, префикс `lucide/`): `lucide-react` и есть иконочная зависимость shadcn/ui, то есть имена совпадут с теми, что уходят в код.
