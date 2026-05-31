# IA Brief

## Summary

IA закрывает задачу владельца салона: быстро понять, как AI помогает не терять заявки и перейти к заявке на демо. Главное действие находится в hero и повторяется после trust/FAQ.

## Main Screen

- Name: Landing page.
- Purpose: Сформировать доверие к AI-записи и собрать заявку на демо.
- Why this is primary: продукт не продается self-serve без настройки, поэтому демо лучше покупки.

## Main Action

- Action: Получить демо.
- Trigger: CTA click или submit формы.
- Completion signal: success state формы и analytics event `demo_form_submit`.

## Sitemap

```text
- Landing
  - Hero
  - Problem
  - How it works
  - Feature grid
  - Product preview
  - Trust/control
  - Demo form
  - FAQ
```

## Primary User Flow

| Step | User intent | Screen/Section | Action | Expected result |
|---|---|---|---|---|
| 1 | Понять предложение | Hero | Read headline | Понимает AI-запись для салона |
| 2 | Узнать, какую боль закрывает | Problem | Scroll | Видит потери от ручной обработки |
| 3 | Проверить механику | How it works | Read 3 steps | Понимает, как клиент доходит до записи |
| 4 | Снять страх ошибки | Trust/control | Read safeguards | Видит правила и handoff |
| 5 | Оставить заявку | Demo form | Submit | Получает success confirmation |

## Secondary Flows

- Visitor opens FAQ to check integrations and setup.
- Visitor clicks secondary CTA to jump to product preview.
- Visitor scans features before deciding to submit demo.

## Screen Requirements

| Screen/Section | Must-have blocks | Source | Notes |
|---|---|---|---|
| Hero | Value prop, CTA, product mockup | PRD R1 | No inflated claims |
| Problem | Missed requests, manual admin, no-shows | Research | Phrase as common pains |
| How it works | Message, slot matching, confirmation | PRD R2 | 3-step flow |
| Trust | Rules, manual override, privacy note | PRD R5 | Reduce AI risk |
| Demo | Form fields and success state | PRD R3 | No external send |
| FAQ | Integrations, setup, safety, pricing | PRD R6 | Some answers needs validation |

## Prototype Notes

- Start screen: Hero.
- Completion step: Demo form success state.
- Missing inputs: product name, pricing, integration list, legal policy.

## Risks And Open Questions

- Если пользователь ожидает готовую CRM/POS, текущий scope может показаться узким.
- Если Figma design system появится позже, нужно пересобрать visual direction и components.
