import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  artifactNames,
  coreBundleArtifacts,
  fullBundleArtifacts,
  getCoreBundleArtifactsForProfile,
  getRoutePlanForProfile,
  optionalBundleArtifacts,
  referenceBundleArtifacts,
  routeTools,
  routeStepToStageId,
  standardRoutePlan,
  referenceRoutePlan,
  type RouteStepName,
} from "./route.config";
import {
  artifactFiles,
  artifactSchemas,
  getRequiredArtifactsForStage,
  getWorkflowStagesForProfile,
  workflowStages,
  type WorkflowProfile,
} from "./workflow-stages";
import { approvalActions } from "./approval-gate";
import { validateAgentMetadata } from "./agent-metadata";
import { validateSkillMetadata } from "./skill-metadata";

export function validateConfigSemantics(root = process.cwd()): string[] {
  const errors: string[] = [];
  const artifactValues = Object.values(artifactNames);
  const artifactNameSet = new Set<string>(artifactValues);

  if (artifactNameSet.size !== artifactValues.length) {
    errors.push("route.config.ts: artifactNames values must be unique.");
  }

  for (const artifact of artifactValues) {
    if (!artifactFiles[artifact]) {
      errors.push(`workflow-stages.ts: artifactFiles is missing artifact '${artifact}'.`);
    }
  }

  for (const [artifact, file] of Object.entries(artifactFiles)) {
    if (!artifactNameSet.has(artifact)) {
      errors.push(`workflow-stages.ts: artifactFiles contains unknown artifact '${artifact}' -> ${file}.`);
    }
  }

  for (const [artifact, schemaPath] of Object.entries(artifactSchemas)) {
    if (!artifactFiles[artifact]) {
      errors.push(`workflow-stages.ts: artifactSchemas contains unknown artifact '${artifact}'.`);
    }

    if (!existsSync(join(root, schemaPath))) {
      errors.push(`workflow-stages.ts: schema file for '${artifact}' does not exist: ${schemaPath}.`);
    }
  }

  for (const [stepName, route] of Object.entries(routeTools) as Array<[RouteStepName, (typeof routeTools)[RouteStepName]]>) {
    for (const output of route.outputs) {
      if (!artifactFiles[output]) {
        errors.push(`route.config.ts: route '${stepName}' outputs unknown artifact '${output}'.`);
      }
    }

    for (const dependency of route.dependsOn) {
      if (!artifactNameSet.has(dependency)) {
        errors.push(`route.config.ts: route '${stepName}' depends on unknown artifact '${dependency}'.`);
      }
    }

    const stageId = routeStepToStageId[stepName];
    if (!stageId) {
      continue;
    }

    const standardStage = getWorkflowStagesForProfile("standard").find((stage) => stage.id === stageId);
    const referenceStage = getWorkflowStagesForProfile("reference").find((stage) => stage.id === stageId);
    const stage = referenceStage ?? standardStage;
    if (!stage) {
      errors.push(`route.config.ts: route '${stepName}' maps to missing workflow stage '${stageId}'.`);
      continue;
    }

    const profile: WorkflowProfile = stage.profile === "reference" ? "reference" : "standard";
    const stageArtifacts = new Set(getRequiredArtifactsForStage(stage, profile));
    for (const output of route.outputs) {
      if (!stageArtifacts.has(output)) {
        errors.push(`route.config.ts: route '${stepName}' output '${output}' is not required by workflow stage '${stageId}'.`);
      }
    }
  }

  validateRoutePlan("standard", standardRoutePlan, errors);
  validateRoutePlan("reference", referenceRoutePlan, errors);
  validateBundleArtifacts(errors);
  validateWorkflowStages(errors);
  validatePackageScripts(root, errors);
  validateApprovalMatrix(root, errors);
  errors.push(...validateAgentMetadata(root));
  errors.push(...validateSkillMetadata(root));

  return errors;
}

function validateRoutePlan(profile: WorkflowProfile, routePlan: readonly RouteStepName[], errors: string[]): void {
  const plannedStages = routePlan
    .map((step) => routeStepToStageId[step])
    .filter((stageId): stageId is string => Boolean(stageId));
  const workflowStageIds = getWorkflowStagesForProfile(profile).map((stage) => stage.id);

  for (const step of routePlan) {
    if (!routeTools[step]) {
      errors.push(`route.config.ts: ${profile} route plan contains unknown step '${step}'.`);
    }
  }

  for (const stageId of workflowStageIds) {
    if (!plannedStages.includes(stageId)) {
      errors.push(`route.config.ts: ${profile} route plan does not cover workflow stage '${stageId}'.`);
    }
  }

  if (profile === "standard" && routePlan.includes("visualReferenceReview")) {
    errors.push("route.config.ts: standardRoutePlan must not include visualReferenceReview.");
  }

  if (profile === "reference" && !routePlan.includes("visualReferenceReview")) {
    errors.push("route.config.ts: referenceRoutePlan must include visualReferenceReview.");
  }

  const resolved = getRoutePlanForProfile(profile);
  if (resolved.join("|") !== routePlan.join("|")) {
    errors.push(`route.config.ts: getRoutePlanForProfile('${profile}') does not match exported ${profile}RoutePlan.`);
  }
}

function validateBundleArtifacts(errors: string[]): void {
  const artifactNameSet = new Set<string>(Object.values(artifactNames));
  const bundles = [
    ["coreBundleArtifacts", coreBundleArtifacts],
    ["referenceBundleArtifacts", referenceBundleArtifacts],
    ["optionalBundleArtifacts", optionalBundleArtifacts],
    ["fullBundleArtifacts", fullBundleArtifacts],
    ["getCoreBundleArtifactsForProfile(reference)", getCoreBundleArtifactsForProfile("reference")],
  ] as const;

  for (const [bundleName, artifacts] of bundles) {
    for (const artifact of artifacts) {
      if (!artifactNameSet.has(artifact)) {
        errors.push(`route.config.ts: ${bundleName} contains unknown artifact '${artifact}'.`);
      }
    }
  }

  const fullBundleArtifactSet = new Set<string>(fullBundleArtifacts);
  for (const artifact of [...coreBundleArtifacts, ...optionalBundleArtifacts]) {
    if (!fullBundleArtifactSet.has(artifact)) {
      errors.push(`route.config.ts: fullBundleArtifacts is missing '${artifact}'.`);
    }
  }
}

function validateWorkflowStages(errors: string[]): void {
  const stageIds = workflowStages.map((stage) => stage.id);
  if (new Set(stageIds).size !== stageIds.length) {
    errors.push("workflow-stages.ts: stage ids must be unique.");
  }

  for (const stage of workflowStages) {
    const requiredArtifacts = getRequiredArtifactsForStage(stage, stage.profile ?? "standard");
    if (!requiredArtifacts.length) {
      errors.push(`workflow-stages.ts: stage '${stage.id}' must require at least one artifact.`);
    }

    for (const artifact of requiredArtifacts) {
      if (!artifactFiles[artifact]) {
        errors.push(`workflow-stages.ts: stage '${stage.id}' requires unknown artifact '${artifact}'.`);
      }

      const requiredSections = stage.requiredSectionsByArtifact[artifact];
      if (!requiredSections?.length) {
        errors.push(`workflow-stages.ts: stage '${stage.id}' artifact '${artifact}' has no required sections.`);
      }
    }
  }
}

function validatePackageScripts(root: string, errors: string[]): void {
  const packagePath = join(root, "package.json");
  if (!existsSync(packagePath)) {
    errors.push("package.json: missing.");
    return;
  }

  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { scripts?: Record<string, string> };
  const scripts = packageJson.scripts ?? {};
  const expectedScripts: Record<string, string> = {
    "workflow:validate": "runtime/typescript/validate-workflow-run.ts",
    "workflow:sync": "runtime/typescript/sync-run-state.ts",
    "workflow:skills": "runtime/typescript/run-workflow-engine.ts",
    "reference:scan": "runtime/typescript/reference-scan.ts",
    "reference:diff": "runtime/typescript/visual-diff.ts",
    "reference:section-diff": "runtime/typescript/visual-section-diff.ts",
    "reference:review": "runtime/typescript/visual-reference-review.ts",
  };

  for (const [scriptName, expectedTarget] of Object.entries(expectedScripts)) {
    const script = scripts[scriptName];
    if (!script) {
      errors.push(`package.json: missing script '${scriptName}'.`);
      continue;
    }

    if (!script.includes(expectedTarget)) {
      errors.push(`package.json: script '${scriptName}' must point to ${expectedTarget}.`);
    }
  }
}

function validateApprovalMatrix(root: string, errors: string[]): void {
  const matrixPath = join(root, "agent-pack/guardrails/approval-matrix.md");
  if (!existsSync(matrixPath)) {
    errors.push("approval-matrix.md: missing.");
    return;
  }

  const content = readFileSync(matrixPath, "utf8");
  const documentedActions = new Set(
    [...content.matchAll(/`([a-z_]+)`/g)]
      .map((match) => match[1])
      .filter((value) => value !== "local"),
  );
  const runtimeActions = new Set<string>(approvalActions);

  for (const action of approvalActions) {
    if (!documentedActions.has(action)) {
      errors.push(`approval-matrix.md: missing runtime approval action '${action}'.`);
    }
  }

  for (const action of documentedActions) {
    if (!runtimeActions.has(action)) {
      errors.push(`approval-matrix.md: documents unknown approval action '${action}'.`);
    }
  }
}

async function main(): Promise<void> {
  const errors = validateConfigSemantics();
  if (errors.length) {
    console.error("Semantic config validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Semantic config validation passed.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
