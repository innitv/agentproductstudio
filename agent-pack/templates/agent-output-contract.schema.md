# Контракт выходных данных агента (Agent Output Contract)

Каждый специалист (specialist) возвращает структурированный результат в следующем формате.

Контракт используется как дисциплина результата: агент должен явно фиксировать inputs, outputs, assumptions, risks, open questions и next step.

Если результат передается через runtime parser, предпочтительный формат — fenced block `agent-output-yaml` или `agent-output-json`. Допустимы также `artifact-json` и YAML frontmatter.

```yaml
agent_name: <имя_агента>
status: success|partial|blocked
summary: <краткое_описание_выполненной_работы>
inputs_used:
  - <использованные_входные_артефакты>
outputs:
  <имя_артефакта>: <содержимое_или_метаданные>
assumptions:
  - <допущения>
risks:
  - <риски>
open_questions:
  - <открытые_вопросы>
recommended_next_step: <рекомендуемый_следующий_шаг>
```

Правила:

- `inputs_used` обязан ссылаться на файлы из каталога `outputs/<project-slug>/<YYYY-MM-DD>/`.
- `outputs` обязан содержать созданный артефакт текущего этапа (stage) по artifact name из `runtime/typescript/route.config.ts` или по file name из `runtime/typescript/workflow-stages.ts`.
- Если stage создаёт Markdown-файл, значение `outputs.<artifact>` должно быть полным Markdown-содержимым целевого файла, включая обязательные секции из `workflow-stages.ts`.
- `status: success` запрещён, если отсутствует хотя бы один обязательный artifact key текущего stage. В таком случае возвращай `partial` с warning/risk или `blocked`, если без артефакта нельзя продолжать.
- Статус `partial` (частичный успех) допустим только при наличии заполненных полей `risks` и/или `open_questions`.
- Статус `blocked` (заблокирован) требует указания конкретного блокирующего фактора (`blocker`) и следующего необходимого действия (`next required action`).
- Поясняющий контент пишется на русском языке; технические ключи, имена файлов, stage id, env vars и contract fields остаются на английском.
- Если для stage нужен внешний provider, external write или model provider call, а approval отсутствует, возвращай `status: blocked` или `status: partial`, но не `success`.

Пример:

```agent-output-yaml
agent_name: prd
status: success
summary: PRD сформирован по исследованию и брифу.
inputs_used:
  - recursive-brief.md
  - research-summary.md
outputs:
  prd: |
    # Product Requirements

    ## Inputs Used

    - `recursive-brief.md`
    - `research-summary.md`

    ## Problem

    ...
assumptions: []
risks: []
open_questions: []
recommended_next_step: Передать PRD на IA stage.
```
