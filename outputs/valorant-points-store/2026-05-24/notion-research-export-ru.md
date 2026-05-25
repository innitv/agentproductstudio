# Исследовательский пакет: VP Nexus

## Краткое резюме

VP Nexus — концепт независимого лендинга для продажи prepaid/cash codes для Valorant Points. Пользователь просил полностью скопировать дизайн официального сайта VALORANT, но такой подход заблокирован из-за риска нарушения прав Riot, trade dress и ложного впечатления об официальной аффилиации.

Решение: использовать официальный сайт VALORANT только как референс категории и энергии, но не копировать логотипы, персонажей, карты, key art, интерфейс, структуру и визуальную идентичность. Для сайта выбран оригинальный marketplace-подход: проверка региона перед выбором пакета, видимый дисклеймер, отсутствие запроса Riot-логина и акцент на самостоятельном redeem кода.

## Ключевые выводы

| Вывод | Основание | Уверенность | Влияние на продукт |
|---|---|---|---|
| Prepaid/cash codes могут быть ограничены регионом или валютой | Официальные статьи Riot Support | высокая | Проверка региона должна быть перед выбором пакета |
| Коммерческое использование IP Riot без разрешения рискованно | Riot legal materials | высокая | Нельзя копировать дизайн VALORANT и использовать official assets |
| Пользовательский страх передачи аккаунта критичен | Гипотеза из JTBD и synthetic interviews | средняя | Нужен блок "без Riot-пароля" |
| Цены, stock и скидки нельзя обещать без данных поставщика | Нет подтвержденных источников | высокая | В прототипе цены помечены как placeholder |

## Вопросы исследования

| Вопрос | Зачем нужен | Статус |
|---|---|---|
| Как продавать VP codes без копирования Riot? | Снизить юридический и брендовый риск | подтверждено официальными источниками |
| Какие redemption risks критичны? | Определить структуру лендинга | подтверждено support-документацией |
| Какие trust signals нужны перед покупкой? | Повысить доверие к независимому продавцу | требует валидации |

## Аудитории

| Сегмент | Контекст | Мотивация | Барьер | Evidence status |
|---|---|---|---|---|
| Competitive player | Покупает VP под skin bundle или night market | Быстро получить код | Боится wrong-region кода или scam | proto |
| Gift buyer | Покупает код другому игроку | Сделать подарок без доступа к аккаунту | Не знает регион аккаунта получателя | proto |
| Skeptical first-timer | Первый раз покупает неофициально | Хочет проверить безопасность | Не доверяет reseller-сайтам | proto |

## Jobs To Be Done

| Сегмент | JTBD | Триггер | Боль | Желаемый результат | Evidence status |
|---|---|---|---|---|---|
| Competitive player | Купить подходящий по региону VP code без передачи логина | Появился нужный скин или bundle | Ошибка региона, потеря денег | Получить код и redeem самостоятельно | proto |
| Gift buyer | Подарить VP без входа в чужой Riot account | Подарок другу | Неизвестен регион аккаунта | Понятный выбор региона и receipt | proto |
| Skeptical first-timer | Проверить, что магазин не просит пароль | Первый заказ | Страх account scam | Ясное правило: no account handoff | proto |

## Прото-персоны

| Персона | Сегмент | JTBD | Боль | Желаемый результат | Evidence status |
|---|---|---|---|---|---|
| Region-Safe Buyer | Competitive player | Купить VP code, который подойдет аккаунту | Region mismatch и недоверие к reseller | Проверенный region-ready код | proto |
| Gift Buyer | Gift buyer | Подарить VP без входа в аккаунт друга | Боится ошибиться с регионом | Правильный код и receipt | proto |
| Skeptical First-Timer | New buyer | Убедиться, что покупка безопасна | Боится передачи Riot credentials | No-login flow и понятная policy | proto |

## Synthetic interviews

Важно: synthetic interviews не являются доказательством поведения реальных пользователей. Они используются только для генерации гипотез и вопросов для проверки.

| Интервью | Персона | Сценарий | Гипотеза | Что проверить |
|---|---|---|---|---|
| S1 | Region-Safe Buyer | Покупка перед bundle | "Если регион не подойдет, скидка бесполезна" | Действительно ли регион важнее цены |
| S2 | Gift Buyer | Покупка другу | "Мне нужно знать, что спросить у получателя до оплаты" | Нужен ли gift guide |
| S3 | Skeptical First-Timer | Первый reseller purchase | "Я уйду, если попросят Riot login" | Насколько no-login блок влияет на доверие |

## Конкуренты и альтернативы

| Альтернатива | Тип | Сильная сторона | Слабость | Возможность для VP Nexus |
|---|---|---|---|---|
| Официальная покупка через Riot/client | status quo | Максимальное доверие | Не всегда gift-friendly | Объяснять, что independent store не заменяет official path |
| Gift card marketplaces | direct | Удобство и возможные скидки | Region mismatch, доверие, refund | Сделать region checker и receipt policy |
| Peer-to-peer код/подарок | indirect | Личное доверие | Нет поддержки, риск scam | Прозрачная policy и no-login flow |

## SWOT

| Квадрант | Item | Обоснование | Evidence / status | Implication |
|---|---|---|---|---|
| Strength | No-login code flow | Пользователь redeem делает сам | source-backed redeem flow | Сделать это центральным trust message |
| Weakness | Неофициальный магазин | Ниже доверие, выше legal risk | source-backed legal risk | Видимый disclaimer |
| Opportunity | Region safety education | Region lock documented by support | source-backed | Region checker как главный сценарий |
| Threat | Wrong-region codes/refunds | Может сломать основной сценарий | source-backed | Нужны policy и support |

## Анализ референса VALORANT

| Референс | Что пользователь хотел взять | Риск | Решение |
|---|---|---|---|
| Официальный сайт VALORANT | Узнаваемость, gaming energy, premium feel | Высокий риск копирования trade dress и official affiliation | Использовать только общую категорийную энергию, не копировать layout/assets |
| Riot support docs | Факты по region/redeem | Низкий риск при корректной ссылке | Использовать как evidence для safety/FAQ |

## Что можно брать из референса

| Паттерн | Почему можно | Как адаптировать оригинально |
|---|---|---|
| Высокий контраст | Общий gaming-паттерн | Собственная палитра VP Nexus |
| Сильный первый экран | Общий landing-паттерн | Hero вокруг region safety, не official game marketing |
| Энергичная tactical-эстетика | Общая категория | Абстрактные code cards, без персонажей/карт/оружия |

## Что нельзя копировать

| Элемент | Почему нельзя | Замена |
|---|---|---|
| VALORANT/Riot logos | Trademark и affiliation risk | Бренд VP Nexus |
| Agent art, maps, screenshots | Copyright/game assets | Сгенерированный абстрактный hero asset |
| Official website layout/trade dress | Lookalike confusion | Оригинальная marketplace-структура |
| Exact typography/color system | Brand identity risk | System font и собственная палитра |

## Product implications

- Главный CTA: "Проверить регион".
- Пакеты показываются после объяснения region compatibility.
- Safety block обязателен: "Без Riot-пароля".
- Disclaimer должен быть виден на первом экране.
- Цены, скидки, stock и delivery speed нельзя утверждать без supplier data.

## Design implications

- Сайт должен выглядеть как independent marketplace, а не как official VALORANT page.
- Можно использовать dark tactical mood, но нельзя использовать official Riot visuals.
- Hero image должен быть оригинальным.
- Карточки пакетов должны показывать регион, а не только VP amount.

## Validation plan

| Гипотеза | Как проверить | Минимальный evidence | Решение, которое разблокируется |
|---|---|---|---|
| Region checker важнее цены | 5 интервью с покупателями VP/gift cards | 3 из 5 упоминают region до цены | Оставить region-first IA |
| No-login trust повышает доверие | A/B trust block или 5 интервью | 3 из 5 отмечают account safety | Усилить safety section |
| Gift buyer нуждается в guide | Интервью gift buyers | 3 подтверждения | Добавить gift flow |

## Открытые вопросы

- Есть ли у продавца официальная авторизация или лицензия?
- Какие регионы реально поддерживаются?
- Какие реальные цены, stock и поставщик?
- Какая refund/replacement policy?
- Какой checkout и fulfillment flow?

## Источники

| Источник | Тип | Использовано для |
|---|---|---|
| Riot Support: Prepaid Gift Cards | official | region lock / prepaid behavior |
| Riot Support: Prepaid Cards, Cash Codes, Content Codes | official | redeem flow / region errors |
| Riot Games Legal | official | commercial IP and trademark risk |
