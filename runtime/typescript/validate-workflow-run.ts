import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "js-yaml";
import { artifactManifestFileName, runIndexFileName, runMetaFileName } from "./output-metadata";
import {
  artifactFiles,
  artifactSchemas,
  defaultWorkflowScale,
  getRequiredArtifactsForStage,
  getRequiredSectionsForStage,
  getStagesSkippedByScale,
  getWorkflowStagesForProfile,
  intakeSurveyIntroducedOn,
  intakeSurveySection,
  intakeSurveyUnrecordedMarker,
  isStageInScale,
  workflowProfiles,
  workflowScales,
  workflowStages,
  type WorkflowProfile,
  type WorkflowScale,
} from "./workflow-stages";
import { canReleaseFromQaStatus, isIncompleteArtifactStatus, isStageIncomplete } from "./status-resolver";

interface Finding {
  level: "error" | "warning";
  message: string;
}

type JsonObject = Record<string, unknown>;

const minimumArtifactBytes = 160;
const inputsUsedSection = "## Inputs Used";
const runStateFileName = "run-state.json";
const stageResultsDirName = "stage-results";

type StageStateStatus = "pending" | "running" | "completed" | "partial" | "blocked" | "failed" | "skipped";

interface RunStateLike {
  status?: StageStateStatus;
  profile?: WorkflowProfile;
  scale?: WorkflowScale;
  created_at?: string;
  stages?: Record<string, { status?: StageStateStatus; artifacts?: string[] }>;
}

interface RunMetaLike {
  workflow_profile?: WorkflowProfile;
}

interface StageResultLike {
  status?: StageStateStatus;
}

export function validateWorkflowRun(
  outputDirInput: string,
  throughStageId?: string,
  profileInput?: WorkflowProfile | "auto",
  scaleInput?: WorkflowScale,
): Finding[] {
  const outputDir = resolve(process.cwd(), outputDirInput);
  const findings: Finding[] = [];

  if (!existsSync(outputDir)) {
    return [{ level: "error", message: `Output directory does not exist: ${outputDir}` }];
  }

  const handoffPath = join(outputDir, artifactFiles.handoff_bundle);
  const handoff = existsSync(handoffPath) ? readFileSync(handoffPath, "utf8") : "";
  const persistedState = readJsonIfExists<RunStateLike>(join(outputDir, runStateFileName));
  const persistedMeta = readJsonIfExists<RunMetaLike>(join(outputDir, runMetaFileName));
  // Профиль читается в том же порядке, что и две другие оси: флаг -> состояние run ->
  // эвристика как последний резерв. Угадывание по тексту стоит ПОСЛЕ состояния намеренно:
  // на реальном run `contractor-payment-demo` эвристика дала `standard` при
  // `profile: reference` в состоянии и скрыла 7 ошибок, включая невыполненный гейт
  // `09-visual-reference`. Эвристика остаётся только для run без записанного состояния.
  const profile = profileInput && profileInput !== "auto"
    ? profileInput
    : readPersistedProfile(persistedState, persistedMeta) ?? detectWorkflowProfile(outputDir, handoff);
  // Масштаб берётся из run-state, а не угадывается по содержимому: иначе неполный run
  // выглядел бы как честный маленький.
  const persistedScale = persistedState?.scale;
  const scale = scaleInput ?? persistedScale ?? defaultWorkflowScale;
  const stages = getWorkflowStagesForProfile(profile, scale);
  const predatesIntakeSurvey = runPredatesIntakeSurvey(persistedState?.created_at);

  const stageLimit = throughStageId
    ? stages.findIndex((stage) => stage.id === throughStageId)
    : stages.length - 1;

  if (stageLimit < 0) {
    return [{ level: "error", message: `Unknown stage id for '${profile}' profile: ${throughStageId}` }];
  }

  const artifactPayloads = new Map<string, unknown>();
  const artifactContents = new Map<string, string>();

  for (const stage of stages.slice(0, stageLimit + 1)) {
    const requiredArtifacts = getRequiredArtifactsForStage(stage, profile);

    for (const artifact of requiredArtifacts) {
      const fileName = artifactFiles[artifact];
      const filePath = join(outputDir, fileName);

      if (!existsSync(filePath)) {
        findings.push({
          level: "error",
          message: `${stage.id} ${stage.title}: missing required artifact ${fileName}`,
        });
        continue;
      }

      const size = statSync(filePath).size;
      const content = readFileSync(filePath, "utf8");
      artifactContents.set(artifact, content);

      if (size < minimumArtifactBytes) {
        findings.push({
          level: "error",
          message: `${stage.id} ${stage.title}: artifact ${fileName} is too small to be a real stage output`,
        });
      }

      const requiredSections = getRequiredSectionsForStage(stage, artifact);
      for (const section of requiredSections) {
        // Раздел опроса проверяется не по наличию заголовка, а по существу: скаффолд ставит
        // метку `intakeSurveyUnrecordedMarker` для оси, ответ на которую ему не передали, и
        // раздел с меткой считается незаписанным. Иначе скаффолд закрывал бы гейт сам.
        const recorded = section === intakeSurveySection
          ? content.includes(section) && !content.includes(intakeSurveyUnrecordedMarker)
          : content.includes(section);

        if (!recorded) {
          findings.push(describeMissingSection(stage, fileName, section, {
            predatesIntakeSurvey,
            runCreatedAt: persistedState?.created_at,
            unrecordedMarkerPresent: content.includes(intakeSurveyUnrecordedMarker),
          }));
        }
      }

      if (/\bTODO\b|заполнить|\bTBD\b/i.test(content)) {
        findings.push({
          level: "warning",
          message: `${stage.id} ${stage.title}: artifact ${fileName} contains placeholder-like text`,
        });
      }

      // Мягкое напоминание про `## Inputs Used` — только для артефактов, у которых эта
      // секция НЕ объявлена обязательной. Там, где она обязательна (`reference-analysis.md`,
      // `screens.md`, `visual-reference-review.md`), тот же факт уже отчитан ошибкой выше, и
      // второе сообщение о нём делает вывод валидатора шумнее, а не строже.
      if (
        !content.includes(inputsUsedSection)
        && !["run_plan", "handoff_bundle", "stage_gate_ledger"].includes(artifact)
        && !requiredSections.includes(inputsUsedSection)
      ) {
        findings.push({
          level: "warning",
          message: `${stage.id} ${stage.title}: artifact ${fileName} should record ${inputsUsedSection}`,
        });
      }

      const schemaPath = artifactSchemas[artifact];
      if (schemaPath) {
        const structured = extractStructuredPayload(content);
        if (!structured) {
          findings.push({
            level: "warning",
            message: `${stage.id} ${stage.title}: artifact ${fileName} has no schema payload. Add YAML frontmatter with schema_payload or a JSON code block labeled artifact-json.`,
          });
        } else {
          const absoluteSchemaPath = join(process.cwd(), schemaPath);
          if (!existsSync(absoluteSchemaPath)) {
            findings.push({
              level: "error",
              message: `${stage.id} ${stage.title}: schema file is missing for ${fileName}: ${schemaPath}`,
            });
          } else {
            const schema = JSON.parse(readFileSync(absoluteSchemaPath, "utf8")) as JsonObject;
            for (const error of validateSchemaSubset(structured, schema)) {
              findings.push({
                level: "error",
                message: `${stage.id} ${stage.title}: artifact ${fileName} schema validation failed: ${error}`,
              });
            }
          }
          artifactPayloads.set(artifact, structured);
        }
      }
    }

    if (stage.mustUpdateHandoff && handoff) {
      for (const artifact of requiredArtifacts) {
        if (["run_plan", "handoff_bundle", "stage_gate_ledger"].includes(artifact)) {
          continue;
        }

        const fileName = artifactFiles[artifact];
        if (!handoff.includes(fileName) && !handoff.includes(artifact)) {
          findings.push({
            level: "warning",
            message: `${stage.id} ${stage.title}: handoff-bundle.md does not mention ${fileName}`,
          });
        }
      }
    }
  }

  findings.push(...validateGateSemantics({
    outputDir,
    stages,
    stageLimit,
    profile,
    scale,
    throughStageId,
    artifactPayloads,
    artifactContents,
  }));

  return findings;
}

// Запуск создан до того, как опрос intake появился? Тогда записать его результат было
// физически невозможно. Дата берётся из `run-state.json` (пишется скаффолдом), неизвестная
// дата трактуется строго — как «не легаси».
function runPredatesIntakeSurvey(createdAt: string | undefined): boolean {
  if (!createdAt) {
    return false;
  }

  const created = Date.parse(createdAt);
  const introduced = Date.parse(`${intakeSurveyIntroducedOn}T00:00:00.000Z`);
  return Number.isFinite(created) && created < introduced;
}

// Общий формат сообщения об отсутствующей секции плюс специальный случай раздела с
// ответами на вопросы intake: общее «is missing section» не говорит, ЧТО именно не
// записано, а здесь важно назвать все три легитимных случая — иначе агент, который
// законно не задавал вопрос, решит, что гейт требует задать его задним числом.
function describeMissingSection(
  stage: ReturnType<typeof getWorkflowStagesForProfile>[number],
  fileName: string,
  section: string,
  context: { predatesIntakeSurvey: boolean; runCreatedAt?: string; unrecordedMarkerPresent?: boolean },
): Finding {
  if (section !== intakeSurveySection) {
    return {
      level: "error",
      message: `${stage.id} ${stage.title}: artifact ${fileName} is missing section ${section}`,
    };
  }

  // Заголовок есть, но скаффолд отметил ось как незаписанную: гейт не закрыт, и сказать об
  // этом надо иначе, чем про полностью отсутствующий раздел — иначе агент будет искать
  // отсутствующий заголовок, который на месте.
  if (context.unrecordedMarkerPresent) {
    return {
      level: "error",
      message:
        `${stage.id} ${stage.title}: ${fileName} still carries '${intakeSurveyUnrecordedMarker}', ` +
        `so section '${intakeSurveySection}' is not fully recorded. The scaffold fills in only the axes passed on ` +
        "start (`--profile`, `--scale`); every remaining line must be closed by the orchestrator with the " +
        "answer and how it was obtained, or with the reason the question was legitimately not asked.",
    };
  }

  if (context.predatesIntakeSurvey) {
    return {
      level: "warning",
      message:
        `${stage.id} ${stage.title}: ${fileName} has no '${intakeSurveySection}' section, but the run was created ` +
        `${context.runCreatedAt} — before the intake survey existed (${intakeSurveyIntroducedOn}). Reported as a warning, not an error.`,
    };
  }

  return {
    level: "error",
    message:
      `${stage.id} ${stage.title}: ${fileName} does not record the intake survey (section '${intakeSurveySection}'). ` +
      "Record the answer — 'Есть конкретный образец, с которым сверять результат?' (profile) — " +
      "together with how it was obtained. If the survey was legitimately not run (the answer was already given in the request, " +
      "the task is not a product workflow, or the mode is quick draft), record that reason in the same section: " +
      "the gate checks the record, not the question, and silence is none of the three.",
  };
}

function validateGateSemantics(options: {
  outputDir: string;
  stages: ReturnType<typeof getWorkflowStagesForProfile>;
  stageLimit: number;
  profile: WorkflowProfile;
  scale: WorkflowScale;
  throughStageId?: string;
  artifactPayloads: Map<string, unknown>;
  artifactContents: Map<string, string>;
}): Finding[] {
  const findings: Finding[] = [];
  const checkedStages = options.stages.slice(0, options.stageLimit + 1);
  const runState = readJsonIfExists<RunStateLike>(join(options.outputDir, runStateFileName));

  findings.push(...validateScaleSkipRecords(options.outputDir, options.profile, options.scale));
  findings.push(...validateExpectationClosure(options));

  if (runState) {
    const missingMetadata = [
      runMetaFileName,
      artifactManifestFileName,
      runIndexFileName,
    ].filter((fileName) => !existsSync(join(options.outputDir, fileName)));

    for (const fileName of missingMetadata) {
      findings.push({
        level: options.throughStageId ? "warning" : "error",
        message: `persisted workflow run is missing ${fileName}; run yarn workflow:sync ${options.outputDir}`,
      });
    }

    if (runState.profile && runState.profile !== options.profile) {
      findings.push({
        level: "warning",
        message: `run-state.json profile is '${runState.profile}', but validation profile is '${options.profile}'`,
      });
    }

    if (runState.scale && runState.scale !== options.scale) {
      findings.push({
        level: "warning",
        message: `run-state.json scale is '${runState.scale}', but validation scale is '${options.scale}'`,
      });
    }

    // Занижение масштаба задним числом — единственный способ превратить неполный run в
    // «успешный маленький». Ловим по факту: run, где стадии вне масштаба уже работали,
    // не является run этого масштаба.
    if (options.scale !== defaultWorkflowScale) {
      const skipped = getStagesSkippedByScale(options.profile, options.scale);
      const workedStatuses = new Set<StageStateStatus>(["running", "completed", "partial", "failed"]);
      for (const stage of skipped) {
        const state = runState.stages?.[stage.id];
        if (state?.status && workedStatuses.has(state.status)) {
          findings.push({
            level: "error",
            message:
              `scale '${options.scale}' excludes ${stage.id} ${stage.title}, but run-state.json records it as '${state.status}'. ` +
              "Scale cannot be lowered after stages have run — raise the scale or record a process_deviation.",
          });
        }
      }
    }

    if (!options.throughStageId && runState.status && isStageIncomplete(runState.status)) {
      findings.push({
        level: "error",
        message: `run-state.json status is '${runState.status}', so the full workflow gate is not complete`,
      });
    }

    for (const stage of checkedStages) {
      const stageStatus = runState.stages?.[stage.id]?.status;
      if (!stageStatus) {
        continue;
      }

      if (isStageIncomplete(stageStatus)) {
        findings.push({
          level: stageStatus === "pending" || stageStatus === "running" ? "warning" : "error",
          message: `${stage.id} ${stage.title}: run-state stage status is '${stageStatus}', not completed`,
        });
      }

      const stageResult = readJsonIfExists<StageResultLike>(join(options.outputDir, stageResultsDirName, `${stage.id}.json`));
      if (stageResult?.status && stageResult.status !== stageStatus) {
        findings.push({
          level: "error",
          message: `${stage.id} ${stage.title}: run-state status '${stageStatus}' conflicts with stage-results status '${stageResult.status}'`,
        });
      }
    }
  }

  for (const stage of checkedStages) {
    for (const artifact of getRequiredArtifactsForStage(stage, options.profile)) {
      const payloadStatus = readPayloadStatus(options.artifactPayloads.get(artifact));
      if (!payloadStatus) {
        continue;
      }

      if (isIncompleteArtifactStatus(payloadStatus)) {
        findings.push({
          level: "error",
          message: `${stage.id} ${stage.title}: artifact ${artifactFiles[artifact]} payload status is '${payloadStatus}', not release-ready`,
        });
      }
    }
  }

  const qaStatus = readPayloadStatus(options.artifactPayloads.get("qa_report"));
  const releaseStatus = readPayloadStatus(options.artifactPayloads.get("release_notes"));
  if (
    releaseStatus &&
    ["ready", "released"].includes(releaseStatus) &&
    qaStatus &&
    !canReleaseFromQaStatus(qaStatus)
  ) {
    findings.push({
      level: "error",
      message: `release-notes.md status is '${releaseStatus}', but qa-report.md status is '${qaStatus}'`,
    });
  }

  if (options.profile === "reference" && checkedStages.some((stage) => stage.id === "09-visual-reference")) {
    const visualPayload = options.artifactPayloads.get("visual_reference_review");
    const visualContent = options.artifactContents.get("visual_reference_review") ?? "";
    if (!hasVisualDiffEvidence(options.outputDir, visualPayload, visualContent)) {
      findings.push({
        level: "error",
        message: "09-visual-reference Visual Reference Review: missing required visual-diff-result.json evidence",
      });
    }
  }

  return findings;
}

const workedStageStatuses = new Set<StageStateStatus>(["running", "completed", "partial", "failed"]);


interface TrackSkipRecord {
  line: number;
  stageId?: string;
  section?: string;
  raw: string;
}

// Ячейка статуса в ledger часто снабжена эмодзи (`⏭️ \`skipped_by_scale\``). Нормализуем
// оформление, но НЕ ослабляем распознавание до «содержит подстроку»: иначе ячейка причины
// («Scale increment, поэтому skipped_by_scale») сама стала бы записью.
function normalizeLedgerCell(cell: string): string {
  return cell.replaceAll("`", "").replaceAll("*", "").trim().replace(/^[^\p{L}]+/u, "");
}

function parseLedgerSkipRecords(ledger: string, status: "skipped_by_track" | "skipped_by_scale"): TrackSkipRecord[] {
  const records: TrackSkipRecord[] = [];
  const lines = ledger.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    // Записью считается только строка таблицы. Иначе пояснительный текст со словом
    // `skipped_by_track` («допустимые статусы: ...») сам стал бы записью.
    if (!line.trimStart().startsWith("|")) {
      continue;
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.replaceAll("`", "").replaceAll("*", "").trim());
    if (!cells.some((cell) => normalizeLedgerCell(cell) === status)) {
      continue;
    }

    const stageId = cells.find((cell) => /^\d{2}-[a-z0-9-]+$/.test(cell));
    const section = cells.find((cell) => /^##\s+\S/.test(cell));
    records.push({ line: index + 1, stageId, section, raw: line.trim() });
  }

  return records;
}

// Ключ «стадия + секция». Разделитель — символ, который не может встретиться ни в id
// стадии, ни в заголовке секции. Записан ЭКРАНИРОВАННОЙ последовательностью, а не сырым
// байтом: сырой NUL делает весь файл бинарным для ripgrep, и самый ответственный модуль
// репозитория выпадает из любого поиска без `--text`.
const skipRecordKeySeparator = "\u0000";

function skipRecordKey(stageId: string, section: string): string {
  return `${stageId}${skipRecordKeySeparator}${section}`;
}

// Записи `skipped_by_scale` проверяются в те же три стороны, что и `skipped_by_track`:
// (1) запись обязана называть стадию; (2) стадия обязана существовать в манифесте
// (протухшая запись); (3) стадия обязана быть реально исключена текущим масштабом — иначе
// запись ложная и прикрывает настоящий пропуск. Четвёртая сторона (незакрытое ожидание)
// живёт в `validateExpectationClosure`.
function validateScaleSkipRecords(outputDir: string, profile: WorkflowProfile, scale: WorkflowScale): Finding[] {
  const ledgerPath = join(outputDir, artifactFiles.stage_gate_ledger);
  if (!existsSync(ledgerPath)) {
    return [];
  }

  const findings: Finding[] = [];
  const where = `${artifactFiles.stage_gate_ledger}`;

  for (const record of parseLedgerSkipRecords(readFileSync(ledgerPath, "utf8"), "skipped_by_scale")) {
    if (!record.stageId) {
      findings.push({
        level: "error",
        message: `${where}:${record.line}: skipped_by_scale record does not name a stage id (expected a cell like '01-research'): ${record.raw}`,
      });
      continue;
    }

    const stage = workflowStages.find((item) => item.id === record.stageId);
    if (!stage) {
      findings.push({
        level: "error",
        message:
          `${where}:${record.line}: skipped_by_scale record names unknown stage '${record.stageId}'. ` +
          "Remove the stale record or fix the stage id.",
      });
      continue;
    }

    // Модель `pytest.mark.xfail(strict=True)`: помеченное как пропущенное, но фактически
    // требуемое — ошибка, иначе запись прикрывает настоящий пропуск стадии.
    if ((!stage.profile || stage.profile === profile) && isStageInScale(stage, scale)) {
      findings.push({
        level: "error",
        message:
          `${where}:${record.line}: ${record.stageId} ${stage.title} is recorded as skipped_by_scale, ` +
          `but scale '${scale}' includes it. Run the stage or fix the scale.`,
      });
    }
  }

  return findings;
}


// Вторая фаза журнала ожиданий: незакрытое ожидание становится видимым статусом.
//
// Проверки записей идут от записи к требованию: запись `skipped_by_scale` обязана быть
// законной (`xfail(strict=True)`) и не протухшей (`warn_unused_ignores`). Здесь — обратное
// направление: run, где стадии просто нет и записи о ней тоже нет, проходил бы молча, хотя
// `CLAUDE.md` §0.2 требует явной фиксации.
//
// Момент фиксации ожидания отдельным файлом НЕ вводится намеренно: ожидание уже
// зафиксировано осью `scale` в `run-state.json` на `00-intake`, и ось защищена от смены
// задним числом. Набор ожиданий выводится из неё манифестом детерминированно, поэтому
// копия на диске была бы вторым источником правды.
//
// Секционная половина этой проверки (ось `track`) удалена 2026-07-28 вместе с самой осью.
function validateExpectationClosure(options: {
  outputDir: string;
  stages: ReturnType<typeof getWorkflowStagesForProfile>;
  stageLimit: number;
  profile: WorkflowProfile;
  scale: WorkflowScale;
  throughStageId?: string;
}): Finding[] {
  const ledgerPath = join(options.outputDir, artifactFiles.stage_gate_ledger);
  if (!existsSync(ledgerPath)) {
    // Отсутствие самого ledger уже ловится как отсутствующий обязательный артефакт
    // `00-intake`; дублировать это N раз — шум, а не сигнал.
    return [];
  }

  const ledger = readFileSync(ledgerPath, "utf8");
  const findings: Finding[] = [];

  // Стадии вне масштаба резолвятся на полном прогоне: они не «отдают артефакт», поэтому
  // момента «после стадии» у них нет — обещание закрывается к концу run (модель Dagster).
  if (!options.throughStageId && options.scale !== defaultWorkflowScale) {
    const closedStages = new Set(
      parseLedgerSkipRecords(ledger, "skipped_by_scale")
        .filter((record) => record.stageId)
        .map((record) => record.stageId as string),
    );

    for (const stage of getStagesSkippedByScale(options.profile, options.scale)) {
      if (closedStages.has(stage.id)) {
        continue;
      }

      findings.push({
        level: "error",
        message:
          `${stage.id} ${stage.title}: scale '${options.scale}' excludes this stage, but ${artifactFiles.stage_gate_ledger} has no ` +
          "`skipped_by_scale` row for it. An unclosed expectation is indistinguishable from a forgotten stage — " +
          "add a row naming the stage, the scale and the reason.",
      });
    }
  }

  return findings;
}

function readJsonIfExists<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function readPayloadStatus(payload: unknown): string | undefined {
  if (!isObject(payload) || typeof payload.status !== "string") {
    return undefined;
  }

  return payload.status;
}

function hasVisualDiffEvidence(outputDir: string, payload: unknown, content: string): boolean {
  if (/Visual diff was not found|Pixel-level image diff is not implemented yet|Run `yarn reference:diff/i.test(content)) {
    return false;
  }

  const candidatePaths = new Set<string>();
  candidatePaths.add(join(outputDir, "visual-diff-result.json"));

  if (isObject(payload)) {
    for (const key of ["visual_diff_result_path", "visual_diff_path"]) {
      const value = payload[key];
      if (typeof value === "string") {
        candidatePaths.add(resolveCandidatePath(outputDir, value));
      }
    }

    const screenshots = payload.screenshots;
    if (Array.isArray(screenshots)) {
      for (const item of screenshots) {
        if (isObject(item) && typeof item.path === "string") {
          candidatePaths.add(join(dirname(resolveCandidatePath(outputDir, item.path)), "visual-diff-result.json"));
        }
      }
    }
  }

  for (const match of content.matchAll(/`([^`]*visual-diff-result\.json)`|([^\s`|]*visual-diff-result\.json)/g)) {
    const value = match[1] ?? match[2];
    if (value) {
      candidatePaths.add(resolveCandidatePath(outputDir, value));
    }
  }

  return [...candidatePaths].some((candidate) => existsSync(candidate));
}

function resolveCandidatePath(outputDir: string, candidate: string): string {
  const normalized = candidate.replaceAll("\\", "/");
  if (/^[A-Za-z]:\//.test(normalized) || normalized.startsWith("/")) {
    return resolve(normalized);
  }

  if (normalized.startsWith("outputs/") || normalized.startsWith("reports/")) {
    return resolve(process.cwd(), normalized);
  }

  return resolve(outputDir, normalized);
}

// Записанный профиль run. Читается из обоих файлов состояния — так же, как его читает
// Agent Output Critic. Значение вне перечня трактуется как отсутствующее: битая запись не
// должна молча сузить набор обязательных артефактов.
function readPersistedProfile(
  state: RunStateLike | undefined,
  meta: RunMetaLike | undefined,
): WorkflowProfile | undefined {
  for (const candidate of [state?.profile, meta?.workflow_profile]) {
    if (candidate && (workflowProfiles as readonly string[]).includes(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function detectWorkflowProfile(outputDir: string, handoff: string): WorkflowProfile {
  const runPlan = readIfExists(join(outputDir, artifactFiles.run_plan));
  const recursiveBrief = readIfExists(join(outputDir, artifactFiles.recursive_brief));
  const haystack = `${runPlan}\n${handoff}\n${recursiveBrief}`.toLowerCase();

  if (
    /visual_reference_required\s*:\s*true/.test(haystack) ||
    /reference_url\s*:\s*https?:\/\//.test(haystack) ||
    /visual reference required/.test(haystack) ||
    /визуальн[а-я\s-]*референс обязател/.test(haystack) ||
    /как этот сайт/.test(haystack)
  ) {
    return "reference";
  }

  return "standard";
}

function readIfExists(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function extractStructuredPayload(markdown: string): unknown | undefined {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (frontmatterMatch) {
    const parsed = YAML.load(frontmatterMatch[1]) as unknown;
    if (isObject(parsed)) {
      if ("schema_payload" in parsed) {
        return parsed.schema_payload;
      }

      if ("artifact" in parsed) {
        return parsed.artifact;
      }
    }
  }

  const jsonBlockMatch = markdown.match(/```(?:artifact-json|json)\r?\n([\s\S]*?)\r?\n```/);
  if (!jsonBlockMatch) {
    return undefined;
  }

  try {
    return JSON.parse(jsonBlockMatch[1]) as unknown;
  } catch {
    return undefined;
  }
}

function validateSchemaSubset(data: unknown, schema: JsonObject, path = "$", rootSchema: JsonObject = schema): string[] {
  const resolvedSchema = resolveRef(schema, rootSchema);
  const errors: string[] = [];

  if (typeof resolvedSchema.const !== "undefined" && data !== resolvedSchema.const) {
    errors.push(`${path} must equal ${JSON.stringify(resolvedSchema.const)}`);
  }

  if (Array.isArray(resolvedSchema.enum) && !resolvedSchema.enum.includes(data)) {
    errors.push(`${path} must be one of ${resolvedSchema.enum.map((item) => JSON.stringify(item)).join(", ")}`);
  }

  if (typeof resolvedSchema.type === "string" && !matchesType(data, resolvedSchema.type)) {
    errors.push(`${path} must be ${resolvedSchema.type}`);
    return errors;
  }

  if (typeof resolvedSchema.minLength === "number" && typeof data === "string" && data.length < resolvedSchema.minLength) {
    errors.push(`${path} must have length >= ${resolvedSchema.minLength}`);
  }

  if (typeof resolvedSchema.minItems === "number" && Array.isArray(data) && data.length < resolvedSchema.minItems) {
    errors.push(`${path} must have at least ${resolvedSchema.minItems} items`);
  }

  if (Array.isArray(resolvedSchema.required)) {
    if (!isObject(data)) {
      errors.push(`${path} must be object for required properties`);
    } else {
      for (const key of resolvedSchema.required) {
        if (!(key in data)) {
          errors.push(`${path}.${key} is required`);
        }
      }
    }
  }

  if (isObject(data) && isObject(resolvedSchema.properties)) {
    for (const [key, propertySchema] of Object.entries(resolvedSchema.properties)) {
      if (key in data && isObject(propertySchema)) {
        errors.push(...validateSchemaSubset(data[key], propertySchema, `${path}.${key}`, rootSchema));
      }
    }
  }

  if (Array.isArray(data) && isObject(resolvedSchema.items)) {
    data.forEach((item, index) => {
      errors.push(...validateSchemaSubset(item, resolvedSchema.items as JsonObject, `${path}[${index}]`, rootSchema));
    });
  }

  return errors;
}

function resolveRef(schema: JsonObject, rootSchema: JsonObject): JsonObject {
  if (typeof schema.$ref !== "string") {
    return schema;
  }

  const prefix = "#/$defs/";
  if (!schema.$ref.startsWith(prefix)) {
    return schema;
  }

  const key = schema.$ref.slice(prefix.length);
  const defs = rootSchema.$defs;
  if (isObject(defs) && isObject(defs[key])) {
    return defs[key];
  }

  return schema;
}

function matchesType(data: unknown, type: string): boolean {
  switch (type) {
    case "array":
      return Array.isArray(data);
    case "object":
      return isObject(data);
    case "string":
      return typeof data === "string";
    case "boolean":
      return typeof data === "boolean";
    case "number":
      return typeof data === "number";
    case "integer":
      return Number.isInteger(data);
    case "null":
      return data === null;
    default:
      return true;
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const outputDir = args[0];
  if (!outputDir) {
    throw new Error(
      "Usage: yarn workflow:validate <run-dir> [--through <stage-id>] [--profile standard|reference] [--scale full|increment|patch]",
    );
  }

  const throughIndex = args.indexOf("--through");
  const throughStageId = throughIndex >= 0 ? args[throughIndex + 1] : undefined;
  const profileIndex = args.indexOf("--profile");
  const profile = profileIndex >= 0 ? args[profileIndex + 1] : "auto";

  if (throughIndex >= 0 && !throughStageId) {
    throw new Error("--through requires a stage id, for example --through 01-research");
  }

  if (!["auto", "standard", "reference"].includes(profile)) {
    throw new Error("--profile must be one of: auto, standard, reference");
  }

  const scaleIndex = args.indexOf("--scale");
  const scale = scaleIndex >= 0 ? args[scaleIndex + 1] : undefined;
  if (scaleIndex >= 0 && !scale) {
    throw new Error(`--scale requires a value: ${workflowScales.join(" | ")}`);
  }
  if (scale && !workflowScales.includes(scale as WorkflowScale)) {
    throw new Error(`--scale must be one of: ${workflowScales.join(", ")}`);
  }

  const findings = validateWorkflowRun(
    outputDir,
    throughStageId,
    profile as WorkflowProfile | "auto",
    scale as WorkflowScale | undefined,
  );
  for (const finding of findings) {
    const prefix = finding.level === "error" ? "ERROR" : "WARN";
    console.log(`${prefix}: ${finding.message}`);
  }

  const errorCount = findings.filter((finding) => finding.level === "error").length;
  const warningCount = findings.filter((finding) => finding.level === "warning").length;
  console.log(`Workflow validation finished: ${errorCount} errors, ${warningCount} warnings.`);

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
