# Handoff Bundle

## Completed Artifacts

- `run-plan.md`
- `source-log.md`
- `research-summary.md`
- `a3-protocol-opportunities.md`
- `scenario-user-flows.md`
- `cjm-map.md`
- `opportunity-roadmap.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`

## Key Decisions

- Work type: `limited engineering task`, not full product workflow.
- Storage: `research/projects/a3-home-services-bank-apps/2026-06-26/`.
- External write: skipped.
- Public info about exact T-Банк/Альфа "Дом" sections is weak; user input is treated as contextual source.
- A3 protocol names are product proposals, not confirmed public A3 API names.

## Main Recommendation

Prioritize not "interesting facts about a building", but actions around money and responsibility:

1. подтвердить адрес/счет/получателя;
2. объяснить начисление;
3. показать УК/аварийные контакты;
4. напомнить о показаниях/поверке;
5. маршрутизировать проблему;
6. только затем развивать паспорт дома, рейтинги, ОСС и marketplace.

## Risks

- Нужно юридически проверить consent и персональные данные для лицевых счетов, семейного доступа и обращений.
- Нужно field-level API discovery по реальным A3 источникам.
- Нужно валидировать у банков, какую роль они готовы брать в обращениях.
- Нужны реальные интервью и app-review mining, чтобы подтвердить P0/P1.

## Next Required Artifact

Если продолжать: `prd.md` для MVP "Дом в банке: платеж + объяснение + ответственные контакты" или технический `api-field-mapping.md` по реальным A3 endpoint/source capabilities.
