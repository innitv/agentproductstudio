# Competitive Analysis

## Inputs Used

- `research-summary.md`
- `recursive-brief.md`
- `reports/research/sim-line-multi-source-2026-05-25-v2.json`

## Competitor Set

| Competitor / alternative | Type | User expectation | Strength | Weakness | Evidence status |
|---|---|---|---|---|---|
| Официальный салон оператора | Direct/status quo | Надежная выдача SIM | Доверие и документы | Нужно идти физически | source-backed |
| Сайт оператора | Direct | Онлайн заявка/eSIM | Официальный канал | Может быть сложная навигация | source-backed |
| Реселлер SIM | Direct | Быстро купить номер | Скорость и выбор | Доверие и легальность | needs validation |
| Маркетплейс | Indirect | Быстрая доставка | Привычный checkout | Слабая консультация | hypothesis |
| Telwel | Direct | Купить eSIM онлайн для поездок | География, пошаговая активация, приложение | Нужно проверить условия, KYC и платежи для целевого рынка | tavily source-backed |
| EVERY | Direct | Купить travel eSIM без роуминга | Простое позиционирование по странам | Не закрывает physical SIM сценарий | tavily source-backed |
| Telna / white-label eSIM providers | Indirect/B2B | Быстро запустить eSIM-продажи | Platform, QR/app activation, partner tooling | Vendor perspective, not customer research | tavily source-backed |
| Sim Local platform case | Indirect/B2B | Масштабируемая eSIM sales platform | B2C/B2B workflow and partner onboarding angle | Case study is indirect evidence | tavily source-backed, low confidence |

## Comparison Matrix

| Criteria | SIM Line prototype | Operator site | Physical salon | Travel eSIM marketplace | Marketplace/reseller |
|---|---|---|---|---|---|
| eSIM compatibility check | High priority | Often present | Consultant-led | Often explicit | Rare |
| Physical SIM delivery | Core flow | Sometimes | In-store | Not core | Strong |
| Trust/security explanation | Explicit | Official trust | Official trust | Variable | Variable |
| Tariff comparison | Curated | Operator-only | Consultant-led | Destination/GB-led | Fragmented |
| QR/app activation explanation | Explicit | Operator-specific | Consultant-led | Core pattern | Rare |
| B2B packets | Secondary CTA | Separate products | Manual | Partner/B2B variants exist | Weak |

## Takeaways

- Лендинг должен конкурировать не "самой дешевой ценой", а ясностью: SIM/eSIM, совместимость, доставка, документы, поддержка.
- A3 reference показывает сильный паттерн для сложного сервиса: один крупный promise, затем последовательное снятие операционных возражений.
- Для production нельзя заявлять тарифное преимущество без реального каталога и условий операторов.
- Tavily-поиск подтвердил, что travel eSIM competitors часто продают через destination/plan selection, QR/app delivery и пошаговую активацию; это усиливает приоритет checker + activation steps.
- DeepSeek использован только как cross-check: он подсветил риски KYC, MNP, instant delivery и compatibility claims, но не является доказательной базой.
- Обновленный default research gate использует Tavily + DeepSeek. Оба провайдера вернули результаты без failures; конкурентный анализ готов для прототипа, при этом количественные и юридические claims остаются `needs_validation` до primary validation.

## Agent Output

```yaml
agent_name: research
status: success
inputs_used:
  - research-summary.md
outputs:
  competitive_analysis: competitive-analysis.md
assumptions:
  - Competitor details are category-level, not audited pricing.
  - Tavily sources are usable for discovery, but market-size and legal claims need primary validation.
risks:
  - Real reseller legality and KYC requirements need validation.
  - Quantitative market-size and legal/KYC claims still need primary validation before public copy.
open_questions:
  - Which operators and regions are actually supported?
recommended_next_step: Create proto personas and PRD.
```
