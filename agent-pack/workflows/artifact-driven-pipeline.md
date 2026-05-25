# Artifact-Driven Pipeline

## Source Of Truth

Источник истины: файлы в `outputs/<project-slug>/<YYYY-MM-DD>/`.

## Required Sequence

```text
raw request
  -> run-plan.md + handoff-bundle.md + stage-gate-ledger.md
  -> recursive-brief.md
  -> research-summary.md + competitive-analysis.md + proto-personas.md + synthetic-interviews.md + swot.md
  -> prd.md
  -> ia-brief.md
  -> reference-analysis.md + design-brief.md
  -> copy-deck.md
  -> screens.md
  -> prototype-report.md
  -> frontend-result.md
  -> visual-reference-review.md, если был visual reference
  -> test-bench-result.md
  -> qa-report.md
  -> release-notes.md
  -> Notion research page publication record (mandatory for full workflow)
  -> notion-prd-export.md, если нужен отдельный PRD export
```

## Hard Stage Enforcement

Каждый stage обязан:

1. Проверить required inputs.
2. Убедиться, что previous stage имеет статус complete.
3. Создать required artifacts.
4. Обновить `handoff-bundle.md`.
5. Обновить `stage-gate-ledger.md`.
6. Пройти validation.

Failure означает статус `blocked`; next stage не может начаться.

## Stage State Machine

```text
NOT_STARTED -> IN_PROGRESS -> GENERATED -> VALIDATED -> HANDED_OFF -> COMPLETE
```

Запрещенные transitions:

- GENERATED -> COMPLETE
- GENERATED -> NEXT_STAGE
- IN_PROGRESS -> COMPLETE

## Research Lock

PRD и downstream stages запрещены, пока эти artifacts не существуют и не проходят validation:

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

Structured research output должен включать:

- `proto_personas`
- `simulated_interviews`
- `skipped_with_reason`, когда required research невозможно подготовить
- `evidence_status: synthetic` для каждого simulated interview

## Research Gate

Research должен включать:

- research questions;
- sources/evidence log;
- audience segments;
- JTBD;
- `proto_personas`: 2-4 proto personas, or `skipped_with_reason`;
- `simulated_interviews`: 3-5 synthetic interviews, or `skipped_with_reason`;
- each persona has `Evidence status`;
- each synthetic interview has `evidence_status: synthetic`;
- competitive analysis;
- SWOT;
- validation plan;
- unknowns и claims to validate.

Research получает fail, если:

- proto personas отсутствуют без `skipped_with_reason`;
- simulated interviews отсутствуют без `skipped_with_reason`;
- synthetic interviews используются как real evidence;
- claims из synthetic interviews появляются в PRD/copy без `needs validation`.

## Handoff Enforcement

Каждый stage должен обновлять `handoff-bundle.md`, фиксируя:

- outputs;
- decisions;
- assumptions;
- risks;
- unresolved questions;
- next required artifact.

## Ledger Enforcement

Каждый stage должен обновлять `stage-gate-ledger.md`, фиксируя:

- stage;
- owner;
- status;
- timestamp;
- artifacts;
- validation;
- `handoff_updated=true`.

Next stage требует:

- `status=complete`;
- `validation=passed`;
- `handoff_updated=true`.

## Frontend Lock

Frontend не может начаться до completion PRD, IA, design, copy, screens и prototype artifacts, кроме явного режима `quick draft`.

Если пользователь дает visual references или просит соответствовать известному site, `reference-analysis.md` обязателен до `design-brief.md`.
Reference analysis должен разделять allowed patterns, disallowed copying, trade dress и IP risks.

## Reference-Driven Visual Spec Gate

Для задач с visual reference frontend не может начаться, пока `reference-analysis.md` не содержит section-by-section visual spec:

- hero/nav;
- background and color system;
- typography scale and font weight rhythm;
- spacing, max-width and layout grid;
- section order and scroll rhythm;
- cards/list rows/tables;
- CTA style, forms and controls;
- media/illustration treatment;
- footer;
- mobile behavior;
- explicit allowed/disallowed patterns.

`design-brief.md` и `screens.md` обязаны читать этот spec и переводить его в конкретные layout decisions. Нельзя использовать reference только как "inspiration" без structural mapping.

## Visual Reference Screenshot Gate

Если пользователь дает visual reference, URL референса или просит "как этот сайт", workflow не может завершиться без `visual-reference-review.md`.

`visual-reference-review.md` обязан включать:

- `inputs_used`;
- ссылки/пути на full-page desktop и mobile screenshots референса;
- ссылки/пути на full-page desktop и mobile screenshots текущей реализации;
- ссылки/пути на scroll-through или section screenshots, если lazy loading / scroll animations могут скрывать блоки в full-page capture;
- сравнение первого экрана как high-priority зоны;
- сравнение всех видимых блоков/секций, компонентов, стилей, сетки, типографики, визуальной плотности, CTA, карточек, форм/контролов, media, footer и mobile layout;
- список concrete gaps;
- список corrections или `skipped_with_reason`;
- section-by-section mapping: reference block -> local block -> status -> correction;
- explicit check that implementation did not fall back to generic/default template style;
- gate result: `passed`, `passed_with_notes` или `blocked`.

QA/release не могут получить финальный `success`, если visual reference был задан, но screenshot-сверка не выполнена или не зафиксирована в `stage-gate-ledger.md`.

## Completion Gate

Workflow завершается только когда все mandatory artifacts существуют и final validation проходит.

## Notion Research Publication Gate

Для полного workflow публикация research в Notion обязательна перед финальным ответом.

Требования:

- публикуется только research-only human-readable pack: `research-summary.md`, `competitive-analysis.md`, `proto-personas.md`, `synthetic-interviews.md`, `swot.md`, `reference-analysis.md` если есть;
- публикация выполняется в отдельную child page внутри Notion parent page, а не append всего workflow в одну страницу;
- запрещено публиковать machine-readable schema/frontmatter, raw JSON payloads, full workflow dump, frontend/result/release artifacts и code-block копии всех файлов;
- если `NOTION_TOKEN` и parent page доступны, orchestrator запрашивает human approval на внешнюю запись и запускает `tooling/scripts/publish-notion-research-page.mjs <parent-page> <research-export-md> "<page-title>"`;
- `stage-gate-ledger.md` фиксирует команду research-page публикации, result, child page id/url и количество human-readable blocks;
- `release-notes.md` фиксирует Notion research child page URL или explicit blocker;
- если Notion target, token, permissions или approval недоступны, workflow получает `partial`/`blocked`, а причина фиксируется в `run-plan.md`, `handoff-bundle.md`, `stage-gate-ledger.md` и `release-notes.md`;
- нельзя давать финальный статус `success`, если Notion research page publication была пропущена молча.

## Runtime Validation

```bash
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD> --through <stage-id>
yarn workflow:validate outputs/<project-slug>/<YYYY-MM-DD>
```

Любая validation error блокирует финальный `success`.

## Evidence References

- Atlassian product discovery подчеркивает continuous, evidence-oriented discovery: https://www.atlassian.com/agile/product-management/discovery
- Материал Intercom по JTBD формулирует product work вокруг customer job/progress: https://www.intercom.com/books/jobs-to-be-done
- Synthetic users/interviews рискованны как replacement evidence и должны явно маркироваться/ограничиваться hypothesis work:
  - https://www.uxatlas.io/articles/synthetic-users-evidence
  - https://uxarmy.com/blog/synthetic-participants-ux-research/
