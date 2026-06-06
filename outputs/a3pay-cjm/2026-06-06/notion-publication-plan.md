# Notion publication plan: A3 Pay CJM research pack

| Поле | Значение |
|---|---|
| Action | `notion_research_publish` |
| Target | `3696473174e58006af5fd367ef89d978` |
| Mode | `notion_api` via `tooling/scripts/publish-notion-research-hub.mjs` |
| Child page title | `A3 Pay CJM: исследование платежных сценариев России` |
| Source export | `outputs/a3pay-cjm/2026-06-06/notion-research-export-ru.md` |
| Layout strategy | `hub_with_grouped_child_pages_and_selective_toggles` |
| Approval | User approved publication in current chat; target inferred from previous A3Pay Notion publication plan and recorded via runtime approval gate before write. |
| Dry-run | passed: 8 child pages, estimated 278 blocks |
| Publication result | published |
| Published hub id | `37764731-74e5-8109-b359-f7a4ba80d6e7` |
| Published hub URL | `https://www.notion.so/3776473174e58109b359f7a4ba80d6e7` |
| Child pages | 8 |
| Blocks published | 292 |

## Source artifacts

- `research-summary.md`
- `competitive-analysis.md`
- `proto-personas.md`
- `synthetic-interviews.md`
- `swot.md`
- `cjm-map.md`
- `opportunity-roadmap.md`
- `source-log.md`

## Russian Publication Gate

- Visible text is Russian.
- English is retained only for technical terms: `A3 Pay`, `CJM`, `JTBD`, `ICE`, `RICE`, `BNPL`, `P0`, `P1`, `P2`, `source-backed`, `provider`, `checkout`, `roadmap`.
- Raw workflow dumps, schema payloads and secrets are excluded.

## External writes

1. Create research hub under parent page `3696473174e58006af5fd367ef89d978`.
2. Create grouped child pages.
3. Append converted Markdown blocks in Notion chunks.
4. Record hub id, child pages and block counts in `stage-gate-ledger.md`.

## Publication evidence

| Page | Notion page id | Blocks |
|---|---|---:|
| Hub | `37764731-74e5-8109-b359-f7a4ba80d6e7` | 14 |
| `00 Обзор, выводы и рамка исследования` | `37764731-74e5-810b-a289-e1b0fafa6faa` | 56 |
| `02 Конкуренты, активы A3 и стратегия` | `37764731-74e5-814a-885c-ea23869c6e59` | 34 |
| `03 Прото-персоны` | `37764731-74e5-816d-b3a1-e113ebd8275a` | 31 |
| `04 Синтетические интервью и вопросы для интервью` | `37764731-74e5-8106-9b71-d9df83dcee7f` | 22 |
| `05 CJM и сценарии` | `37764731-74e5-8149-8a44-f4eb3a7e6c1b` | 29 |
| `06 ICE/RICE бэклог и инициативы` | `37764731-74e5-81de-95cb-ee45e5767f78` | 36 |
| `07 Roadmap и SWOT` | `37764731-74e5-8176-9446-ef62356f3cf3` | 28 |
| `08 План валидации, провайдеры и источники` | `37764731-74e5-812b-9a3b-f77f2e870909` | 42 |

## Idempotency strategy

This publication creates a new dated hub for the `2026-06-06` refreshed research pass. Previous `2026-06-05` hubs remain historical/superseded evidence.

## Post-publication local sync

После публикации локальный `notion-research-export-ru.md` был исправлен под новый `Publication Shape Gate`: `Прото-персоны`, `CJM`, competitive matrix и `ICE/RICE` представлены таблицами/схемами. Dry-run `publish-notion-research-hub.mjs --dry-run` проходит с `publication_shape_gate.pass=true`, 8 child pages и estimated 272 blocks.

Эта правка пока не опубликована в Notion. Для внешнего обновления нужен новый интерактивный approval:

```bash
yarn workflow:approval-request outputs/a3pay-cjm/2026-06-06 notion_research_publish --target 3696473174e58006af5fd367ef89d978 --by human --reason "Обновить Notion hub табличными personas/CJM после Publication Shape Gate"
```
