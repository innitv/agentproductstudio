import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "js-yaml";
import { artifactManifestFileName, runIndexFileName, runMetaFileName } from "./output-metadata";
import {
  artifactFiles,
  artifactSchemas,
  getRequiredArtifactsForStage,
  getWorkflowStagesForProfile,
  type WorkflowProfile,
} from "./workflow-stages";
import { canReleaseFromQaStatus, isIncompleteArtifactStatus, isStageIncomplete } from "./status-resolver";

interface Finding {
  level: "error" | "warning";
  message: string;
}

type JsonObject = Record<string, unknown>;

const minimumArtifactBytes = 160;
const runStateFileName = "run-state.json";
const stageResultsDirName = "stage-results";

type StageStateStatus = "pending" | "running" | "completed" | "partial" | "blocked" | "failed" | "skipped";

interface RunStateLike {
  status?: StageStateStatus;
  profile?: WorkflowProfile;
  stages?: Record<string, { status?: StageStateStatus; artifacts?: string[] }>;
}

interface StageResultLike {
  status?: StageStateStatus;
}

export function validateWorkflowRun(
  outputDirInput: string,
  throughStageId?: string,
  profileInput?: WorkflowProfile | "auto",
): Finding[] {
  const outputDir = resolve(process.cwd(), outputDirInput);
  const findings: Finding[] = [];

  if (!existsSync(outputDir)) {
    return [{ level: "error", message: `Output directory does not exist: ${outputDir}` }];
  }

  const handoffPath = join(outputDir, artifactFiles.handoff_bundle);
  const handoff = existsSync(handoffPath) ? readFileSync(handoffPath, "utf8") : "";
  const profile = profileInput && profileInput !== "auto"
    ? profileInput
    : detectWorkflowProfile(outputDir, handoff);
  const stages = getWorkflowStagesForProfile(profile);

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

      const requiredSections = stage.requiredSectionsByArtifact[artifact] ?? [];
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          findings.push({
            level: "error",
            message: `${stage.id} ${stage.title}: artifact ${fileName} is missing section ${section}`,
          });
        }
      }

      if (/\bTODO\b|заполнить|\bTBD\b/i.test(content)) {
        findings.push({
          level: "warning",
          message: `${stage.id} ${stage.title}: artifact ${fileName} contains placeholder-like text`,
        });
      }

      if (!content.includes("## Inputs Used") && !["run_plan", "handoff_bundle", "stage_gate_ledger"].includes(artifact)) {
        findings.push({
          level: "warning",
          message: `${stage.id} ${stage.title}: artifact ${fileName} should record ## Inputs Used`,
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
    throughStageId,
    artifactPayloads,
    artifactContents,
  }));

  return findings;
}

function validateGateSemantics(options: {
  outputDir: string;
  stages: ReturnType<typeof getWorkflowStagesForProfile>;
  stageLimit: number;
  profile: WorkflowProfile;
  throughStageId?: string;
  artifactPayloads: Map<string, unknown>;
  artifactContents: Map<string, string>;
}): Finding[] {
  const findings: Finding[] = [];
  const checkedStages = options.stages.slice(0, options.stageLimit + 1);
  const runState = readJsonIfExists<RunStateLike>(join(options.outputDir, runStateFileName));

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
    throw new Error("Usage: yarn workflow:validate <outputs/project-slug/YYYY-MM-DD> [--through <stage-id>]");
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

  const findings = validateWorkflowRun(outputDir, throughStageId, profile as WorkflowProfile | "auto");
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
