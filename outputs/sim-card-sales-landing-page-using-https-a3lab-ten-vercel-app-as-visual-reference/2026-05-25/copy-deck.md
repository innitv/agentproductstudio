---
schema_payload:
  status: ready
  inputs_used:
    - prd.md
    - design-brief.md
  hero:
    eyebrow: "SIM Line"
    h1: "SIM и eSIM без лишних походов"
    lead: "Подберем формат, тариф и способ получения."
    primary_cta: "Подобрать SIM"
    secondary_cta: "Сравнить тарифы"
  sections:
    - name: "Solutions"
      headline: "Закрываем весь путь от выбора формата до активации"
  service_cards:
    - "eSIM за один сценарий"
    - "Физическая SIM доставкой"
  faq:
    - question: "Как проверить eSIM?"
      answer: "Проверить модель устройства и регион."
  seo:
    title: "SIM Line — подбор SIM и eSIM"
  claims_to_validate:
    - claim: "activation time"
      validation_method: "operator/catalog validation"
---
# Copy Deck

## Inputs Used

- `prd.md`
- `design-brief.md`
- `research-summary.md`

## Hero

- Eyebrow: `SIM Line`
- H1: `SIM и eSIM без лишних походов`
- Supporting copy: `Подберем формат, тариф и способ получения: eSIM с QR-активацией, физическая SIM доставкой или пакет номеров для команды.`
- Primary CTA: `Подобрать SIM`
- Secondary CTA: `Сравнить тарифы`

## Service Cards

- `Проверка eSIM`: сначала устройство и регион, потом тариф.
- `SIM доставкой`: физическая карта с понятным статусом заказа.
- `Перенос или новый номер`: сценарий выбирается до заявки.
- `Поддержка активации`: инструкция и контакт после выдачи.
- `Для команды`: несколько SIM в одной заявке.
- `Без скрытых шагов`: все ограничения вынесены до CTA.

## FAQ

| Question | Answer |
|---|---|
| Как понять, подойдет ли eSIM? | Проверьте модель устройства и регион. Финальную совместимость нужно подтвердить перед оплатой. |
| Можно заказать физическую SIM? | Да, прототип предусматривает доставку SIM. Реальные сроки зависят от региона. |
| Можно оставить старый номер? | Перенос номера зависит от оператора и правил оформления. Этот claim требует проверки. |
| Это официальный оператор? | Прототип не заявляет официальную аффилиацию. Production должен указать юридического продавца. |

## SEO

- Title: `SIM Line — подбор SIM и eSIM онлайн`
- Description: `Лендинг для выбора SIM/eSIM, проверки совместимости, сравнения тарифов и заявки на подключение.`
- H1 includes SIM/eSIM terms.

## Claims To Validate

- Сроки доставки.
- Время eSIM activation.
- Возможность переноса номера.
- Доступные тарифы и регионы.

## Agent Output

```yaml
agent_name: copywriting
status: success
inputs_used:
  - prd.md
outputs:
  copy_deck: copy-deck.md
assumptions:
  - Copy avoids unsupported operational guarantees.
risks:
  - Real legal seller must be named before launch.
open_questions:
  - Final tariffs and price copy.
recommended_next_step: Create screens.
```
