---
schema_payload:
  status: ready
  inputs_used:
    - recursive-brief.md
    - run-plan.md
    - reference screenshots
  provider_coverage:
    - provider: tavily
      requested: true
      used: true
      sources_count: 8
      validation_state: pass
      notes: "Live API call executed on 2026-05-25; usable sources returned for market, competitor and activation-flow context."
    - provider: deepseek
      requested: true
      used: true
      sources_count: 0
      validation_state: pass
      notes: "Required cross-check/check provider; not treated as source-backed evidence."
  provider_failures: []
  research_questions:
    - "Как объяснить выбор SIM/eSIM без перегруза?"
    - "Какие риски доверия важны до заявки?"
  audience:
    - segment: "Покупатель новой SIM/eSIM"
      context: "Нужна связь без посещения салона"
      motivation: "Быстро подключиться"
      barrier: "Совместимость, доставка, доверие"
      evidence_status: source-backed
  jobs_to_be_done:
    - segment: "Покупатель новой SIM/eSIM"
      job: "Подобрать рабочую SIM/eSIM под устройство и сценарий"
      trigger: "Новый телефон, поездка, второй номер, замена оператора"
      pain: "Неясные условия и риск ошибиться"
      desired_outcome: "Понятный выбор, быстрый заказ, прозрачная активация"
      evidence_status: source-backed
  proto_personas:
    - name: "Илья"
      segment: "Новый смартфон"
      jtbd: "Подключить eSIM без похода в салон"
      pain: "Не уверен, поддерживает ли устройство eSIM"
      desired_outcome: "Получить QR и инструкцию"
      evidence_status: proto
    - name: "Марина"
      segment: "Второй номер"
      jtbd: "Купить отдельную SIM для объявлений и сервисов"
      pain: "Не хочет оставлять основной номер"
      desired_outcome: "Быстро заказать физическую SIM"
      evidence_status: proto
  simulated_interviews:
    - persona: "Илья"
      scenario: "Выбор eSIM"
      summary: "Просит сначала проверить устройство, потом показывать тарифы."
      evidence_status: synthetic
      needs_validation: true
  findings:
    - finding: "Лендинг должен сначала снимать риск совместимости и доверия, затем вести к тарифам."
      evidence: "Reference structure + GSMA eSIM explanation + SIM swap risk sources"
      confidence: medium
    - finding: "eSIM online purchase flow should emphasize pre-purchase selection, digital QR/app delivery, activation instructions and fallback support."
      evidence: "Tavily/Telna/Telwel sources"
      confidence: medium
    - finding: "Russian-speaking market copy must avoid instant/fully remote promises until KYC, legal seller and operator flow are verified."
      evidence: "Tavily/TAdviser/Klerk sources + DeepSeek contradiction cross-check"
      confidence: medium
  sources:
    - title: "A3 reference landing"
      provider: browser
      url_or_path: "https://a3lab-ten.vercel.app/"
      type: "visual reference"
      used_for: "layout and visual density analysis"
      retrieved_at: "2026-05-25"
      confidence: high
    - title: "GSMA eSIM"
      provider: web_search
      url_or_path: "https://www.gsma.com/solutions-and-impact/technologies/esim/"
      type: "industry source"
      used_for: "eSIM remote provisioning context"
      retrieved_at: "2026-05-25"
      confidence: high
    - title: "Ofcom mobile switching"
      provider: web_search
      url_or_path: "https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-mobile"
      type: "regulatory guidance"
      used_for: "number switching and porting risk context"
      retrieved_at: "2026-05-25"
      confidence: high
    - title: "FTC SIM swap scams"
      provider: web_search
      url_or_path: "https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself"
      type: "consumer safety"
      used_for: "trust and security copy constraints"
      retrieved_at: "2026-05-25"
      confidence: high
    - title: "E-Sim Market - Global Market Size, Share, and Trends Analysis Report"
      provider: tavily
      url_or_path: "https://www.databridgemarketresearch.com/reports/global-esim-market"
      type: "market report"
      used_for: "market context; quantitative claims require primary validation"
      retrieved_at: "2026-05-25"
      confidence: medium
    - title: "ESIM (Embedded SIM) Электронная сим-карта"
      provider: tavily
      url_or_path: "https://www.tadviser.ru/index.php/%D0%A1%D1%82%D0%B0%D1%82%D1%8C%D1%8F:ESIM_(Embedded_SIM)_%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%BD%D0%B0%D1%8F_%D1%81%D0%B8%D0%BC-%D0%BA%D0%B0%D1%80%D1%82%D0%B0"
      type: "industry/news aggregator"
      used_for: "Russian eSIM/KYC context"
      retrieved_at: "2026-05-25"
      confidence: medium
    - title: "How to Sell eSIMs for Travelling"
      provider: tavily
      url_or_path: "https://www.telna.com/how-to-sell-esims-for-travelling"
      type: "vendor guide"
      used_for: "eSIM purchase, QR/app delivery and activation-flow pattern"
      retrieved_at: "2026-05-25"
      confidence: medium
    - title: "Купить eSIM онлайн"
      provider: tavily
      url_or_path: "https://telwel.io"
      type: "competitor/product site"
      used_for: "competitor UX and travel eSIM positioning"
      retrieved_at: "2026-05-25"
      confidence: medium
    - title: "Case Study: Scaling Sim Local's eSIM Sales Platform"
      provider: tavily
      url_or_path: "https://sonalake.com/case-studies/enabling-growth-through-engineering-scaling-sim-local%E2%80%99s-esim-sales-platform"
      type: "case study"
      used_for: "B2C/B2B eSIM sales platform and partner onboarding angle"
      retrieved_at: "2026-05-25"
      confidence: low
    - title: "Как купить еСИМ в 2026"
      provider: tavily
      url_or_path: "https://www.klerk.ru/blogs/exnode/692349"
      type: "guide"
      used_for: "Russian online eSIM purchase and identity-check caveats"
      retrieved_at: "2026-05-25"
      confidence: low
    - title: "Valid - eSIM for Consumers, IoT Connectivity & M2M projects"
      provider: tavily
      url_or_path: "https://trustedconnectivity.valid.com/solutions/esims"
      type: "vendor/product source"
      used_for: "eSIM security and provisioning context"
      retrieved_at: "2026-05-25"
      confidence: medium
    - title: "Купить eSIM для путешествий"
      provider: tavily
      url_or_path: "https://every.ru/esim"
      type: "competitor/product site"
      used_for: "travel eSIM competitor positioning"
      retrieved_at: "2026-05-25"
      confidence: medium
  validation_plan:
    - hypothesis: "Проверка eSIM до тарифов повышает конверсию в заявку"
      method: "5 usability interviews + analytics on compatibility check clicks"
      minimum_evidence: "70% users understand next step without support"
      status: open
  unknowns:
    - "Реальные тарифы, операторы, регионы доставки and KYC requirements."
---
# Research Summary

## Inputs Used

- `recursive-brief.md`
- `run-plan.md`
- Reference screenshots: `reports/visual-review/sim-cards-a3lab-reference/reference-desktop-full.png`, `reference-mobile-full.png`
- Public sources: GSMA eSIM, Ofcom mobile switching, FTC SIM swap guidance

## Source Policy

- Allowed sources: reference browser scan, public official/industry sources, user request.
- Denied sources: exact copying of A3 brand, private data, unsupported market claims.
- Citation requirement: every market/safety claim must reference source or be `needs validation`.
- External write: denied unless approval exists.

## Provider Coverage

Required for `deep_research`: `tavily` must return usable sources and `deepseek` must return usable cross-check/check output for `ready`. On 2026-05-25 the updated multi-source run requested `tavily` and `deepseek`. Both providers returned results. Status: `ready`.

| Provider | Requested | Used | Sources count | Validation state | Notes |
|---|---:|---:|---:|---|---|
| tavily | yes | yes | 8 | pass | Sources returned for market, competitor and activation-flow context |
| deepseek | yes | yes | 0 | pass | Required contradiction/check provider; synthesis is not source-backed evidence |

## Provider Failures

| Provider | Error / blocker | Impact | Follow-up |
|---|---|---|---|
| none | none | Tavily + DeepSeek default provider gate passed | Keep validating quantitative and legal claims against primary sources |

## Multi-source API Research Update - 2026-05-25

| Area | Finding | Evidence | Confidence | Product implication |
|---|---|---|---|---|
| eSIM purchase flow | Strong eSIM sales pages explain destination/plan selection, QR or app delivery, activation steps and support before checkout. | Tavily sources: Telna, Telwel, EVERY | medium | Keep activation steps and compatibility checker above tariff/request blocks |
| Travel and second-line demand | Travel eSIM and quick second-line scenarios are visible competitor patterns. | Tavily sources: Telwel, EVERY, Telna | medium | Preserve B2C flow: "поездка", "второй номер", "без салона" |
| Trust/KYC constraints | Russian-speaking copy must avoid "instant without documents" promises until legal seller, operator and identity flow are verified. | Tavily sources: TAdviser, Klerk; DeepSeek cross-check | medium | Claims about activation speed, MNP and remote onboarding stay `needs_validation` |
| B2B/partners | eSIM sales platforms can require B2C and B2B flows plus partner onboarding. | Tavily source: Sonalake/Sim Local case study | low | B2B CTA should remain secondary until demand is validated |
| Market-size claims | Tavily surfaced quantitative eSIM market claims, but they need primary-source validation before use in copy. | Tavily sources: Data Bridge, TAdviser | low | Do not put market-size numbers on the landing yet |

## Research Questions

| Question | Why it matters | Evidence needed | Status |
|---|---|---|---|
| Как объяснить выбор SIM/eSIM без перегруза? | Первый экран должен быстро объяснить продукт | Usability test | needs validation |
| Какие риски доверия важны до заявки? | SIM/eSIM связаны с идентификацией, номером, безопасностью | Public safety/regulatory sources | source-backed |
| Как адаптировать A3 reference без копирования? | Нужно сохранить визуальный уровень и избежать trade dress risk | Reference review | source-backed |

## Audience

| Segment | Context | Motivation | Barrier | Evidence status |
|---|---|---|---|---|
| Покупатель новой eSIM | Новый телефон или нужен быстрый второй номер | Подключиться без салона | Совместимость устройства | source-backed |
| Покупатель физической SIM | Нужна SIM для работы, объявлений или поездки | Получить карту доставкой | Доверие к продавцу и условиям | hypothesis |
| Малый бизнес | Нужны номера для сотрудников/точек | Быстро выдать связь команде | Документы, контроль, счета | hypothesis |

## Jobs To Be Done

| Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|
| eSIM buyer | Подобрать eSIM под устройство | Новый смартфон | Боязнь несовместимости | QR и инструкция | source-backed |
| Physical SIM buyer | Заказать SIM без похода в салон | Нужен второй номер | Неясная доставка | SIM с понятной активацией | hypothesis |
| Team buyer | Подключить несколько номеров | Рост команды | Нужна заявка и контроль | Пакет SIM и единый контакт | hypothesis |

## Proto Personas

Required: 2-4 proto personas or `skipped_with_reason`.

| Persona | Segment | JTBD | Trigger | Pain | Desired outcome | Evidence status |
|---|---|---|---|---|---|---|
| Илья | eSIM buyer | Подключить eSIM | Новый телефон | Не уверен в совместимости | Проверка до оплаты | proto |
| Марина | Physical SIM buyer | Купить второй номер | Авито/маркетплейсы/поездки | Не хочет светить основной номер | SIM доставкой | proto |
| Сергей | Team buyer | Подключить сотрудников | Новая смена/точка | Нужно быстро и с документами | Заявка на пакет SIM | proto |

## Synthetic Interviews

Required: 3-5 simulated interviews or `skipped_with_reason`.

Guardrail: synthetic interviews are used only for hypothesis generation, interview-script stress testing and validation questions. They are not evidence of real user behavior.

| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |
|---|---|---|---|---|---|---|
| 1 | Илья | Выбирает eSIM | "А мой телефон поддерживает?" | Compatibility checker above tariffs | synthetic | Validate in usability test |
| 2 | Марина | Заказывает физическую SIM | "Когда привезут?" | Delivery promise and status | synthetic | Validate with real operations |
| 3 | Сергей | Покупает пакет номеров | "Нужны документы" | B2B request path | synthetic | Validate with B2B interviews |

## Competitors and Alternatives

| Name | Type | Category | Core offer | Source | Evidence status |
|---|---|---|---|---|---|
| Официальный салон оператора | Direct | SIM/eSIM | SIM, тариф, идентификация | Market status quo | source-backed |
| Сайт оператора | Direct | eSIM/SIM online | Онлайн заказ и активация | Market status quo | source-backed |
| Маркетплейс/реселлер | Indirect | SIM delivery | Быстрый заказ, меньше доверия | Hypothesis | needs validation |
| Telwel | Direct | Travel eSIM online | eSIM packages in many countries, app/activation flow | Tavily | source-backed |
| EVERY | Direct | Travel eSIM online | eSIM for travel destinations | Tavily | source-backed |
| Telna / white-label providers | Indirect/B2B | eSIM platform enablement | Storefront, QR/app delivery, partner infrastructure | Tavily | source-backed |
| Sim Local platform case | Indirect/B2B | eSIM sales platform scale | B2C/B2B workflow and partner onboarding pattern | Tavily | indirect evidence |

## Findings

| Finding | Impact | Evidence | Confidence | Product implication |
|---|---|---|---|---|
| Hero должен объяснять "SIM/eSIM без салона" и сразу давать CTA | Снижает когнитивную нагрузку | A3 reference uses direct benefit hero | medium | Крупный заголовок + CTA |
| eSIM needs compatibility check before checkout | Снижает риск отказа | GSMA explains eSIM ecosystem and device provisioning | high | Dedicated eSIM checker |
| Security/trust block is mandatory | SIM swap/port-out fraud context affects trust | FTC/FCC/Ofcom related sources | high | Add safety and verification copy |
| Multi-source research supports activation and compatibility as primary trust reducers | Users need to know whether eSIM works, how QR/app activation happens and what happens if provisioning fails | Tavily/Telna/Telwel + DeepSeek contradiction check | medium | Keep checker, step flow and support promise in first half of page |
| Instant remote onboarding, MNP and "no documents" claims are high-risk | Russian market sources and cross-check flag identity verification/legal uncertainty | Tavily/TAdviser/Klerk + DeepSeek | medium | Avoid these claims until operator/legal model is confirmed |

## Claims To Validate

| Claim | Current evidence | Risk | Validation method |
|---|---|---|---|
| "Доставка за 2 часа" | No real ops source | High | Replace with real SLA |
| "Лучшие тарифы" | No tariff comparison | High | Avoid claim |
| "eSIM за 5 минут" | Operationally plausible but unverified | Medium | Test activation flow |
| "Мировой рынок eSIM достиг $4 млрд+" | Tavily surfaced secondary/report sources | Medium | Validate with primary or licensed market source before publication |
| "Полностью онлайн без документов" | Contradicts KYC risk context | High | Do not use unless legal counsel/operator confirms |
| "Мгновенный перенос номера" | No confirmed MNP operator flow | High | Replace with consultation/request wording |

## Research Validation Plan

| Hypothesis | Who to interview or observe | Minimum evidence | Decision unlocked | Status |
|---|---|---|---|---|
| Compatibility checker improves confidence | 5 eSIM buyers | 4/5 can self-select next step | Hero/flow lock | open |
| Physical SIM buyers care most about delivery and documents | 5 buyers | Top 2 concerns repeat | Trust block priority | open |
| B2B packet should be secondary | 3 small business buyers | Clear interest or rejection | Add/remove B2B CTA | open |

## Sources

| Source | Provider | Type | URL/path | Used for | Retrieved at | Confidence |
|---|---|---|---|---|---|---|
| A3 reference landing | browser | visual reference | https://a3lab-ten.vercel.app/ | Layout and density | 2026-05-25 | high |
| GSMA eSIM | web_search | industry source | https://www.gsma.com/solutions-and-impact/technologies/esim/ | eSIM context | 2026-05-25 | high |
| Ofcom mobile switching | web_search | regulator | https://www.ofcom.org.uk/phones-and-broadband/switching-provider/switching-mobile | Switching/porting context | 2026-05-25 | high |
| FTC SIM swap scams | web_search | consumer safety | https://consumer.ftc.gov/consumer-alerts/2019/10/sim-swap-scams-how-protect-yourself | Security risk | 2026-05-25 | high |
| Data Bridge eSIM market report | tavily | market report | https://www.databridgemarketresearch.com/reports/global-esim-market | Market context; quantitative claims require validation | 2026-05-25 | medium |
| TAdviser eSIM article | tavily | industry/news aggregator | https://www.tadviser.ru/index.php/%D0%A1%D1%82%D0%B0%D1%82%D1%8C%D1%8F:ESIM_(Embedded_SIM)_%D0%AD%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%BD%D0%B0%D1%8F_%D1%81%D0%B8%D0%BC-%D0%BA%D0%B0%D1%80%D1%82%D0%B0 | Russian eSIM and KYC context | 2026-05-25 | medium |
| Telna eSIM selling guide | tavily | vendor guide | https://www.telna.com/how-to-sell-esims-for-travelling | eSIM purchase and activation flow | 2026-05-25 | medium |
| Telwel | tavily | competitor site | https://telwel.io | Russian-language travel eSIM competitor UX | 2026-05-25 | medium |
| Sonalake / Sim Local case study | tavily | case study | https://sonalake.com/case-studies/enabling-growth-through-engineering-scaling-sim-local%E2%80%99s-esim-sales-platform | B2C/B2B eSIM platform angle | 2026-05-25 | low |
| Klerk eSIM guide | tavily | guide | https://www.klerk.ru/blogs/exnode/692349 | Russian eSIM purchase caveats | 2026-05-25 | low |
| Valid eSIM solutions | tavily | vendor source | https://trustedconnectivity.valid.com/solutions/esims | eSIM security/provisioning context | 2026-05-25 | medium |
| EVERY eSIM | tavily | competitor site | https://every.ru/esim | Travel eSIM competitor positioning | 2026-05-25 | medium |

## Unknowns

- Реальные операторы, тарифы, цены, KYC и delivery SLA.
- Кто юридически продает SIM/eSIM.
- Нужно ли интегрировать payment до заявки.
- Quantitative market-size claims and legal/KYC claims still need primary validation before public copy.

## Readiness Checklist

- [x] Research questions are answered or marked `needs validation`.
- [x] Provider Coverage records requested, used, unavailable/failed providers.
- [x] Tavily returned usable sources or Status is `partial`.
- [x] DeepSeek returned usable cross-check/check output.
- [x] DeepSeek output is marked as cross-check/synthesis and not treated as evidence.
- [x] Audience segments are defined.
- [x] JTBD is complete.
- [x] Proto Personas are present or `skipped_with_reason`.
- [x] Synthetic Interviews are present or `skipped_with_reason`.
- [x] Research Validation Plan is actionable.
- [x] Findings separate evidence from hypotheses.
