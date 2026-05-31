# SWOT

## Inputs Used

- `research-summary.md`
- `competitive-analysis.md`

## Context

Концепт лендинга independent marketplace для VP prepaid/cash codes.

## SWOT

| Quadrant | Item | Обоснование | Evidence / status | Implication |
|---|---|---|---|---|
| Strength | Clear no-login code flow | Безопаснее, чем account handoff | source-backed via redeem docs | Сделать центральным сообщением |
| Weakness | Not official Riot | Ниже доверие, есть legal constraints | source-backed via Riot legal | Добавить disclaimer и не копировать IP |
| Opportunity | Region safety education | Region lock documented как пользовательская боль | source-backed | Сделать region checker |
| Threat | Wrong-region codes/refunds | Может сломать пользовательский сценарий | source-backed | Нужны policy и support |

## Strategic Notes

- Positioning implication: "region-ready prepaid codes, no Riot password".
- PRD implication: region compatibility является Must.
- Design/copy implication: оригинальная визуальная система, видимый disclaimer, без official-looking UI.
