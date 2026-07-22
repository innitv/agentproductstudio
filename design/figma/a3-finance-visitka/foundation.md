# Foundation — a3-finance-visitka (наблюдённые значения, НЕ переменные)

**Главный факт: системы токенов в файле нет.** Единственная переменная — `H2` (JetBrains Mono, Regular, 32/100, ls 0). Все цвета, радиусы, тени и отступы захардкожены в слоях. Ниже — фактические значения, извлечённые из design context; это сырьё для будущей DS, а не semantic layer.

## Цвета (наблюдённые)

| Роль (восстановлена) | Значение | Где видел |
|---|---|---|
| primary / brand blue | `#003399` | btn-cta Default (desktop и mobile) |
| primary hover | `#00256F` | btn-cta Hover |
| primary pressed / focus bg | `#0040C0` | btn-cta Pressed, Focus ⚠️ pressed светлее default |
| grey chip default | `#E6E6E6` | btn-secondary Default bg |
| grey chip alt | `#EBEBEB` | btn-secondary (стейт неоднозначен из-за дублей вариантов) |
| grey chip hover/pressed | `#CCCCCC` | btn-secondary |
| text primary | `#000000` | hero H1 |
| text/border inverse | `#FFFFFF` | текст кнопок, бордеры Inverted |
| Тёмно-синий фон секций | не снят (pending) | форма, футер |
| Error red | не снят (pending) | form-errors |

## Типографика

| Слот | Значение | Примечание |
|---|---|---|
| H1 (desktop hero) | Google Sans Regular 48, black | ⚠️ Google Sans — проприетарный шрифт Google, для стороннего продакшена лицензионно недоступен; нужна замена |
| H2 (variable) | JetBrains Mono Regular 32/100 | Единственная переменная файла; при этом видимые заголовки модалок — гротеск, т.е. переменная и фактические стили расходятся |
| Body / UI | JetBrains Mono Regular 16 (desktop) / 24 (mobile) | Весь body — моноширинный |
| Кнопки secondary | JetBrains Mono Light 16 / 24 | Light-начертание только у пилюль |

## Радиусы

- btn-cta: 8
- btn-secondary: 25 (pill)
- Карточки/модалки: не снято (визуально ~16–24)

## Тени (btn-cta, по стейтам)

- Default: `0 4 4 rgba(0,0,0,.15)`
- Hover: `0 6 6 rgba(0,0,0,.15)`
- Pressed: `0 2 2 rgba(0,0,0,.15)`
- Focus: как Pressed + dashed white border ⚠️ focus пунктиром — заменить на solid ring

## Отступы / сетка

- Паддинги btn-cta: mobile 36×28, desktop 21×17; btn-secondary: mobile 30×9, desktop 16×4. Высоты 88/55/50/29 — шкалы, кратной 4/8, нет.
- Брейкпоинты: «Mobile» = 768px (фактически планшетная ширина; классического 360–390 нет), Desktop = 1440.

## Риски foundation

1. Нет primitive/semantic слоёв вообще — при сборке DS строить двухуровневые Variables с нуля, маппя наблюдённые значения.
2. Переменная `H2` противоречит фактическим стилям заголовков — не переиспользовать её вслепую.
3. Google Sans заменить на лицензионно чистый гротеск; JetBrains Mono оставить точечно (цифры, реквизиты), не для длинного body-текста.
4. Инвертированная стейт-логика pressed/hover у primary — нормализовать при сборке DS.
