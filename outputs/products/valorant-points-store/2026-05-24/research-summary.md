---
schema_payload:
  status: ready
  inputs_used:
    - recursive-brief.md
  research_questions:
    - "Как сделать коммерческий лендинг VP codes без копирования Riot?"
    - "Какие redemption risks критичны для пользователя?"
    - "Какие trust signals нужны перед покупкой?"
  audience:
    - segment: "Competitive player"
      context: "Хочет быстро купить VP для скина/баттлпасса"
      motivation: "Скорость и понятная цена"
      barrier: "Страх wrong region или scam"
      evidence_status: "proto"
    - segment: "Gift buyer"
      context: "Покупает код другому игроку"
      motivation: "Подарок без доступа к аккаунту"
      barrier: "Не знает регион аккаунта получателя"
      evidence_status: "proto"
  jobs_to_be_done:
    - segment: "Competitive player"
      job: "Купить подходящий по региону код без передачи логина"
      trigger: "Появился нужный скин или bundle"
      pain: "Не хочу потерять деньги из-за региона"
      desired_outcome: "Получить код и redeem самостоятельно"
      evidence_status: "proto"
    - segment: "Gift buyer"
      job: "Подарить игровой баланс без риска аккаунта"
      trigger: "День рождения или общий подарок"
      pain: "Не знаю, какой регион нужен"
      desired_outcome: "Проверить совместимость до оплаты"
      evidence_status: "proto"
  proto_personas:
    - name: "Region-Safe Buyer"
      segment: "Competitive player"
      jtbd: "Купить VP code, который подойдет аккаунту"
      pain: "Region lock и недоверие к reseller"
      desired_outcome: "Проверенный region-ready код"
      evidence_status: "proto"
    - name: "Gift Buyer"
      segment: "Gift buyer"
      jtbd: "Подарить VP без входа в чужой Riot account"
      pain: "Боится ошибиться с регионом"
      desired_outcome: "Понятный выбор региона и receipt"
      evidence_status: "proto"
  simulated_interviews:
    - persona: "Region-Safe Buyer"
      scenario: "Покупка перед ночным маркетом"
      summary: "Synthetic hypothesis: user checks region and refund terms before price."
      evidence_status: "synthetic"
      needs_validation: true
    - persona: "Gift Buyer"
      scenario: "Подарок другу"
      summary: "Synthetic hypothesis: buyer needs simple region explanation."
      evidence_status: "synthetic"
      needs_validation: true
  findings:
    - finding: "Riot states cash/prepaid codes can be region/currency locked."
      evidence: "VALORANT Support prepaid/cash code articles"
      confidence: "high"
    - finding: "Riot legal policy limits commercial use of Riot IP without written license."
      evidence: "Riot Legal Jibber Jabber and Terms snippets"
      confidence: "high"
  sources:
    - title: "Prepaid Gift Cards - VALORANT Support"
      url_or_path: "https://support-valorant.riotgames.com/hc/en-us/articles/360049090894-Prepaid-Gift-Cards"
      type: "official"
      used_for: "region lock and prepaid card behavior"
    - title: "Prepaid Cards, Cash Codes, & Content Codes - VALORANT Support"
      url_or_path: "https://support-valorant.riotgames.com/hc/en-us/articles/48753809137171-Prepaid-Cards-Cash-Codes-Content-Codes"
      type: "official"
      used_for: "redeem flow and region error"
    - title: "Riot Games Legal"
      url_or_path: "https://www.riotgames.com/en/legal"
      type: "official"
      used_for: "commercial IP restriction"
  validation_plan:
    - hypothesis: "Region checker is the most important trust step"
      method: "Interview 5 VP buyers and review support tickets/questions"
      minimum_evidence: "3/5 users mention region before price"
      status: "open"
  unknowns:
    - "Authorized reseller status"
    - "Real stock/prices/regions"
    - "Refund policy"
---
# Research Summary

## Inputs Used

- `recursive-brief.md`
- Riot Support prepaid/cash code docs
- Riot legal docs

## Source Policy

- Allowed: official Riot docs, support pages, competitor research.
- Denied: copying Riot visual assets или hidden website code.
- External write: denied.

## Research Questions

| Question | Почему важно | Evidence needed | Status |
|---|---|---|---|
| Как продавать VP codes без копирования Riot? | Снижает IP/legal риск | Riot legal policy | source-backed |
| Какие redemption risks критичны? | Влияет на IA и copy | Riot support docs | source-backed |
| Какие trust signals нужны? | Влияет на конверсию | User validation | needs validation |

## Audience

| Segment | Context | Motivation | Barrier | Evidence status |
|---|---|---|---|---|
| Competitive player | Покупает VP под skin/bundle | Быстро и дешевле | Region lock/scam | proto |
| Gift buyer | Покупает код другому | Подарок без доступа к аккаунту | Не знает регион | proto |

## Jobs To Be Done

| Segment | JTBD | Trigger | Pain | Желаемый результат | Evidence status |
|---|---|---|---|---|---|
| Competitive player | Купить подходящий по региону код без передачи логина | Нужный скин | Wrong region | Redeem самостоятельно | proto |
| Gift buyer | Подарить баланс без входа в аккаунт | Подарок | Ошибка региона | Проверить совместимость | proto |

## Proto Personas

Required: 2-4 proto personas.

| Persona | Segment | JTBD | Trigger | Pain | Желаемый результат | Evidence status |
|---|---|---|---|---|---|---|
| Region-Safe Buyer | Competitive player | Купить region-ready code | Skin drop | Region mismatch | Valid code | proto |
| Gift Buyer | Gift buyer | Подарить VP | Gift moment | Region uncertainty | Receipt + clear region | proto |

## Synthetic Interviews

Required: 3-5 simulated interviews or `skipped_with_reason`.

| Interview | Persona | Scenario | Objection | Opportunity | Evidence status | Validation need |
|---|---|---|---|---|---|---|
| S1 | Region-Safe Buyer | Покупка перед bundle | "Не хочу ошибиться с регионом" | Region checker | synthetic | yes |
| S2 | Gift Buyer | Покупка другу | "Я не знаю регион аккаунта" | Region guide | synthetic | yes |
| S3 | Skeptical buyer | Первый заказ | "Вдруг попросят пароль?" | No-login guarantee | synthetic | yes |

## Competitors and Alternatives

| Name | Type | Category | Core offer | Source | Evidence status |
|---|---|---|---|---|---|
| Official Riot checkout | status quo | official | Direct in-game purchase | Riot client/support | source-backed |
| Gift card marketplaces | direct | reseller | Prepaid/cash codes | needs local validation | needs validation |
| Friends/gifts | indirect | informal | Gift code handoff | hypothesis | needs validation |

## Findings

| Finding | Impact | Evidence | Confidence | Product implication |
|---|---|---|---|---|
| Codes can be region/currency locked | Must show region check | Riot Support | high | Region is first-class filter |
| Commercial Riot IP use is restricted | Нельзя копировать design/assets | Riot Legal | high | Оригинальная visual system + disclaimer |
| Support directs invalid-region issues to seller/support paths | Need receipt/refund terms | Riot Support | medium | Add policy block |

## Claims To Validate

| Claim | Current evidence | Risk | Validation method |
|---|---|---|---|
| Discount pricing | none | legal/commercial trust | Real supplier data |
| Fast delivery | none | support load | Fulfillment test |
| Region stock | none | failed redemption | Inventory integration |

## Research Validation Plan

| Hypothesis | Кого интервьюировать или наблюдать | Minimum evidence | Разблокируемое решение | Status |
|---|---|---|---|---|
| Region checker matters most | 5 buyers | 3 mention region risk | Hero/IA priority | open |
| No-login trust increases conversion | 5 buyers | 3 mention account fear | Trust section | open |

## Sources

| Source | Type | URL/path | Used for | Confidence |
|---|---|---|---|---|
| VALORANT prepaid gift cards | official | https://support-valorant.riotgames.com/hc/en-us/articles/360049090894-Prepaid-Gift-Cards | region lock | high |
| Riot cash codes support | official | https://support-valorant.riotgames.com/hc/en-us/articles/48753809137171-Prepaid-Cards-Cash-Codes-Content-Codes | redeem errors | high |
| Riot legal | official | https://www.riotgames.com/en/legal | IP/commercial use | high |

## Unknowns

- Authorized reseller status.
- Real regions/prices/stock.
- Refund policy.
