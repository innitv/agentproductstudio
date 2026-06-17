# Figma handoff bundle: A3Pay CJM board update

| Поле | Значение |
|---|---|
| Target file | `https://www.figma.com/design/AeXnwaRn8cOKNpKb4HGyOH` |
| Target file key | `AeXnwaRn8cOKNpKb4HGyOH` |
| Human approval requested | `yes` |
| Human approval granted | `yes_by_current_user_request` |
| Write status | `completed` |
| Inputs used | `research-summary.md`, `cjm-map.md`, `notion-research-export-ru.md` |

## Canvas strategy

Обновить существующую доску, не создавать новый файл:

- сохранить текущие фреймы quick CJM как базовую структуру;
- добавить/обновить research evidence frame;
- обновить roadmap и opportunity priorities по финальному research pack;
- добавить provider coverage/status, чтобы было видно, что Tavily MCP был blocked, а source-backed web evidence использован;
- добавить Notion publication status after publish attempt.

## Foundation

Variables to represent conceptually in Figma:

- `color/bg/base`: deep navy;
- `color/surface/card`: soft white;
- `color/accent/a3-blue`: payment/action highlight;
- `color/accent/sbp-green`: rail/verified status;
- `color/accent/warning`: provider coverage warning;
- `space/card-gap`: 16-24;
- `radius/card`: 12;
- `type/title`: bold display;
- `type/body`: compact explanatory text.

## Frames to update/create

| Frame | Purpose |
|---|---|
| `00 Cover / A3Pay CJM` | Mark board as full research workflow, not quick draft. |
| `05 Research Evidence / Source-backed findings` | Source-backed facts and provider coverage. |
| `06 Scenario Priority / ICE-RICE` | Final P0/P1/P2 priorities. |
| `07 Notion + Workflow Status` | Publication and validation status after attempts. |

## Component rules

- Use Auto Layout for cards, lists and rows.
- Keep repeated rows as consistent card components visually.
- Use status chips for P0/P1/P2, source-backed, hypothesis, blocked.
- Do not pack everything into one frame.

## Evidence after write

| Frame | Node ID | Status |
|---|---|---|
| `00 Cover / A3Pay CJM` | `1:3` | Existing cover updated with full research badge. |
| `05 Research Evidence / Source-backed findings` | `5:4` | Created. |
| `06 Scenario Priority / ICE-RICE` | `5:56` | Created. |
| `07 Notion + Workflow Status` | `5:108` | Created. |

Publication language update:

- Frame names and visible publication copy translated to Russian.
- Technical terms such as `P0`, `RICE`, `API`, `BNPL`, `MCP` preserved.
- Stale frames `1:3`, `1:22`, `1:170`, `1:291`, `1:331`, `5:4`, `5:56`, `5:108` hidden after audit because they contained outdated draft framing.
- Current visible Russian board created:
  - `RU 00 Обложка / A3Pay CJM` — `17:2`
  - `RU 01 Выводы и доказательства` — `17:29`
  - `RU 02 Общая модель CJM` — `17:65`
  - `RU 03 Сценарии и точки встраивания` — `17:95`
  - `RU 04 Конкурентная карта` — `17:119`
  - `RU 05 ICE-RICE и backlog` — `17:149`
  - `RU 06 Roadmap и валидация` — `17:195`
  - `RU 07 Статус публикации` — `17:221`
  - Screenshot rendered for node `17:2`.

## V2 quality rebuild

After visual review, the previous `RU` board was considered too draft-like. A new visible V2 board was created with stronger Auto Layout, fixed text widths, explicit CJM paths, cleaner card hierarchy and contrast checks:

- `V2 00 Обложка / A3Pay CJM` — `24:2`
- `V2 01 Выводы и доказательства` — `24:32`
- `V2 02 Общая модель CJM` — `24:68`
- `V2 03 CJM пути по сценариям` — `24:107`
- `V2 04 Приоритеты и roadmap` — `24:268`
- `V2 05 Проверка качества` — `24:344`

Quality evidence:

- Stale draft and previous `RU` frames are hidden.
- Figma audit found 6 visible V2 frames and 250 visible text nodes.
- Language gate after fixes: no suspicious English/Spanish publication markers found.
- Overflow audit: no text overflow found.
- Contrast audit: low-contrast chips were fixed.
- Screenshot rendered for key CJM frame `24:107`.

## Design system reuse

Search found external library components (`Banner`, driver license document asset) but no variables/styles relevant to this research board. Decision: no component import; bespoke research-board layout used.

## Screenshot verification

`get_screenshot` completed for node `5:4`.

Known visual gaps:

- Human visual review in Figma is still needed for final polish.
- Provider coverage chip remains `partial` because Tavily MCP daily limit was hit and DeepSeek/Gemini were not called in this run.
