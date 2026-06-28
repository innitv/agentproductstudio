# Handoff Bundle

## Goal

Собрать source-backed deep research pack по A3 Home Services для раздела "Дом" в банковских приложениях: адрес/дом/помещение, лицевой счет, УК/ТСЖ/ЖСК, начисления ЖКУ, показания счетчиков, поверка, аварийные контакты, обращения жильцов и семейная оплата жилья.

## Current State

- Stage: `01-research`
- Status: `ready`
- Owner: `research.agent`
- Updated at: 2026-06-26
- Next Required Stage: PRD/IA only after validation of A3 endpoints and bank-specific scope.

## Inputs Used

- `recursive-brief.md`
- `run-plan.md`
- `stage-gate-ledger.md`
- current research artifacts in run directory
- source-backed pages: Google Play Госуслуги Дом, App Store Госуслуги.Дом, ГИС ЖКХ/Gosuslugi context, secondary source for лицевые счета as low-confidence signal

## Completed Artifacts

- `research-summary.md`
- `scenario-user-flows.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Provider Coverage

| Provider | Status | Notes |
|---|---|---|
| tavily | used_from_previous_run_as_URL_inventory | Предыдущий output был частично шумным; сохранены только источники, относящиеся к "Дом"/ЖКХ. |
| web_search | used | Повторно проверены публичные источники и app-store evidence на 2026-06-26. |
| deepseek | skipped_without_opt_in | Не использован как источник фактов. |
| gemini | skipped_without_opt_in | Не использован как источник фактов. |

## Primary User Paths

1. Добавить объект "Дом" по адресу, помещению или лицевому счету.
2. Оплатить начисления ЖКУ и понять разницу между банковским статусом и квитированием поставщика.
3. Передать показания счетчиков и исправить ошибку прибора/периода/значения.
4. Подать заявку в УК/РСО или быстро найти аварийную диспетчерскую.
5. Оплатить жилье за родителя, второй адрес или нежилое помещение с ограниченной ролью плательщика.

## Trust Requirements

- Источник данных для адреса, счета, прибора, контакта и статуса.
- Роль пользователя: собственник, гость, плательщик.
- Consent scope по целям: счета, показания, заявки, история.
- Раздельные статусы: банк принял платеж, деньги доставлены, поставщик/ГИС ЖКХ учел, долг обновлен.
- Граница ответственности: банк/A3 показывает маршрут, УК/РСО отвечает за начисления, приборы и исполнение заявки.

## Decision Moments

| Moment | User doubt | Required product answer |
|---|---|---|
| Добавление объекта | "Это точно мой адрес и зачем доступ?" | роль, источник, минимальный доступ |
| Проверка счета | "За что сумма и кто получатель?" | период, услуга, получатель, дата данных |
| После оплаты | "Почему долг еще виден?" | статус банка отдельно от квитирования |
| Ошибка показаний | "Куда исправлять счетчик?" | причина отказа и заявка в нужную организацию |
| Авария | "Кому звонить сейчас?" | аварийный контакт и заявка как отдельные действия |
| Семейная оплата | "Как не перепутать адрес родителей?" | список объектов, роль, подтверждение адреса перед оплатой |

## Content Risks

- Не утверждать, что точные функции уже есть в Т-Банке или Альфа-Банке, пока нет product walkthrough/source-backed подтверждения.
- Не утверждать существующие A3 Home Services endpoint names без API discovery.
- Не обещать мгновенное исчезновение долга после банковской операции.
- Не называть синтетические интервью пользовательскими доказательствами.

## Visual Evidence Needs

- Реальные экраны Госуслуги.Дом: объект, счета, показания, заявка, аварийный контакт, гостевой доступ.
- Реальные экраны раздела "Дом" в Т-Банке и Альфа-Банке: получить от пользователя, через device walkthrough или разрешенный capture.
- Состояния: нет объекта, счет найден, оплата принята банком, ожидается квитирование, показания отклонены, заявка создана, аварийный контакт.

## Validation Priority

1. Статус оплаты/квитирования.
2. Object matching по адресу/лицевому счету.
3. Показания счетчиков и error states.
4. Семейный доступ и несколько объектов.
5. Заявки/аварийный контакт с юридической границей ответственности.

## Candidate Quality / Write Gate

| Gate | Result |
|---|---|
| Strict topic boundary | pass |
| Source-backed facts separated from hypotheses | pass |
| Provider coverage recorded | pass |
| Contradiction Review exists | pass |
| Claims to validate exists | pass |
| Scenario-user-flows has index, detailed P0/P1 flows and state map | pass |
| Anti-AI-Slop Gate | pass after rewrite |

## Risks

- Exact Т-Банк/Альфа "Дом" feature scope remains `needs_validation`.
- Exact A3 API/protocol surface remains `needs_validation`.
- ГИС ЖКХ/поставщик может обновлять статус позже банка; это должно стать частью продукта, а не скрытой ошибкой.

## Next Required Artifact

- `prd.md` or `ia-brief.md` only after stakeholder/API validation of `claims_to_validate`.

## Notion Publication

| Field | Value |
|---|---|
| Status | `success` |
| Approval | `notion_research_publish` approved by human for parent `3696473174e58006af5fd367ef89d978` |
| Hub title | `A3 Home Services: исследование раздела Дом в банковских приложениях` |
| Hub ID | `38b64731-74e5-81d3-98d1-ca3190a5a898` |
| Hub URL | https://www.notion.so/38b6473174e581d398d1ca3190a5a898 |
| Child pages | `8` |
| Published blocks | `413` |
| Publication record | `notion-publication-result.md` |

## Applied Conclusions Page

| Field | Value |
|---|---|
| Status | `ready` |
| Artifact | `applied-home-services-page-ru.md` |
| Audience | Stakeholders who need practical use cases and product/data pipeline without reading full research pack |
| Scope | Use cases for bank app section `Дом`, possible UI blocks, potential A3 protocols/data sources, MVP priorities and validation questions |
| Notion status | `published` |
| Notion page | https://www.notion.so/38b6473174e581d4a6fdc00de30f186e |

## Figma Use Case Mockups

| Field | Value |
|---|---|
| Status | `superseded_needs_revision` |
| Artifact | `figma-home-usecase-mockups.md` |
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/dL70YFBGi981ETZX2hcxBp |
| Scope | Mobile concept frames for A3-powered Alfa `Дом`: overview, payment status, meters error, provider sources, УК/аварийная, multiple objects |
| Visual evidence | user-provided Alfa screenshots embedded in Figma |
| Skills/tools | `figma-create-new-file`, `figma-use`, `figma-generate-design`; Lazyweb attempted and blocked by outdated skill-pack |
| Verification | Superseded after user review: this was a thematic screen set, not a usable app route |

## Figma P0 App Flow Correction

| Field | Value |
|---|---|
| Status | `ready` |
| Artifact | `figma-app-flow-correction-2026-06-27.md` |
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/dL70YFBGi981ETZX2hcxBp |
| Figma page | `A3 Home Services / P0 app flow 2026-06-27` |
| Board node | `12:3` |
| Screen nodes | `12:38`, `12:71`, `12:99`, `12:134`, `12:162` |
| Scope | One P0 app route: `Дом -> объект -> счет ЖКУ -> оплата -> статус поставщика -> исправление проблемы`; secondary scenarios are entry points from the object screen |
| Visual evidence | user-provided Alfa screenshots already embedded in the Figma file; Lazyweb attempted but locked due outdated skill-pack |
| Verification | Figma metadata inspection and board screenshot QA; screenshot asset `5e44817e-5a6e-4127-823f-65e8d947110b` generated by Figma MCP |
| Acceptance test | Reviewer must understand the start point, primary action, post-payment status split, error path and A3 value in 60 seconds |

## Figma App Flow v2 / Lazyweb

| Field | Value |
|---|---|
| Status | `ready_for_review` |
| Artifact | `figma-app-flow-v2-lazyweb-2026-06-28.md` |
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/dL70YFBGi981ETZX2hcxBp |
| Figma page | `A3 Home Services / App flow v2 Lazyweb 2026-06-28` |
| Board node | `16:3` |
| Screen nodes | `17:2`, `17:51`, `17:93`, `17:133`, `17:177`, `17:213` |
| Scope | Six mobile app screens: object/home, bill details, payment confirmation, status split, debt recovery, secondary entry points |
| Primary App Flow Gate | pass: each screen has user question, primary action, next state and error/recovery path |
| Lazyweb evidence | Applied banking dashboard, utility billing/status, maintenance request and adjacent consent/access patterns; weak meter/family results treated as adjacent only |
| Verification | Figma metadata inspection and board screenshot QA; final screenshot asset `79e85e57-0bca-40b9-bebd-565bd342cc43` |

## Figma App Flow v3 / shadcn DS

| Field | Value |
|---|---|
| Status | `ready_for_review_verified` |
| Artifact | `figma-app-flow-v3-shadcn-ds-2026-06-28.md` |
| Surface | `figma_board` |
| Figma file | https://www.figma.com/design/NUoNEuTJ3OZOGH2c780Z55/shadcn-ui-components-with-variables---Tailwind-classes---Updated-January-2026--Community-?node-id=3011-3 |
| Figma page | `for flow` |
| Board node | `3013:2` |
| Screen nodes | `3013:28`, `3013:90`, `3013:152`, `3013:205`, `3013:259`, `3013:311` |
| Scope | Same P0 route as v2, rebuilt inside the shadcn/Tailwind variables community file with Auto Layout and clearer text behavior |
| Design system grounding | Existing shadcn file pages, Tailwind variable collections, Inter text styles and box-shadow styles; local primitives strip documents `button`, `card`, `badge`, `tabs`, `input row`, `bottom nav` |
| Verification | Figma metadata/inline screenshot QA; fixed board positioning and clipped text; executable verifier `figma-visual-qa.json` passed with notes; final board screenshot asset `03286ce3-48d5-458d-b9f0-80fc9d9b6343` |
| Layout QA | `figma-layout-ir.json`, `figma-inventory-v3-shadcn-ds-2026-06-28.json`, `figma-visual-qa.json`; 342 nodes and 176 text nodes checked; first pass found checkbox overflow `3013:183` outside `3013:182`, repaired in Figma and rerun |
