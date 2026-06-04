import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { artifactNames } from "./route.config";
import { artifactStatusToStageStatus, canReleaseFromQaStatus, detectStageStatusFromMarkdown, summarizeRunStatus } from "./status-resolver";
import { artifactFiles, getRequiredArtifactsForStage, getWorkflowStagesForProfile, type WorkflowProfile } from "./workflow-stages";
import { validateWorkflowRun } from "./validate-workflow-run";

type Payload = Record<string, unknown>;

const baseSections: Record<string, readonly string[]> = {
  [artifactNames.runPlan]: ["## Запрос", "## План этапов", "## Ограничения"],
  [artifactNames.handoffBundle]: ["## Goal", "## Completed Artifacts", "## Next Required Artifact"],
  [artifactNames.stageGateLedger]: ["## Run", "## Rule", "## Stage Status", "## Validation Runs"],
  [artifactNames.recursiveBrief]: ["## Expansion", "## Deepening", "## Consolidation", "## Assumptions", "## Open Questions"],
  [artifactNames.researchSummary]: [
    "## Research Questions",
    "## Audience",
    "## Jobs To Be Done",
    "## Proto Personas",
    "## Synthetic Interviews",
    "## Research Validation Plan",
    "## Findings",
    "## Sources",
  ],
  [artifactNames.competitiveAnalysis]: ["## Competitor Set", "## Comparison Matrix", "## Takeaways"],
  [artifactNames.protoPersonas]: ["## Proto Personas", "## Decision Context", "## Validation Plan"],
  [artifactNames.syntheticInterviews]: ["## Guardrail", "## Simulated Interviews", "## Patterns To Validate"],
  [artifactNames.swot]: ["## SWOT", "## Strategic Notes"],
  [artifactNames.prd]: ["## Problem", "## Goals", "## Non-Goals", "## Requirements", "## MoSCoW", "## Acceptance Criteria", "## Analytics"],
  [artifactNames.iaBrief]: ["## Primary Screen", "## Primary Action", "## Sitemap", "## Primary User Flow"],
  [artifactNames.referenceAnalysis]: ["## Inputs Used", "## References", "## Allowed Patterns", "## Disallowed Copying", "## Design Implications"],
  [artifactNames.designBrief]: ["## Visual Direction", "## Sections", "## Components", "## Responsive Notes", "## Accessibility Notes"],
  [artifactNames.copyDeck]: ["## Hero", "## Service Cards", "## FAQ", "## SEO", "## Claims To Validate"],
  [artifactNames.screens]: ["## Inputs Used", "## Screen", "## Mobile"],
  [artifactNames.prototypeReport]: ["## Prototype Type", "## Start Screen", "## Transition Map", "## Missing Interactions"],
  [artifactNames.frontendResult]: ["## Changed Files", "## Implementation Notes", "## Commands Run", "## Known Limitations"],
  [artifactNames.visualReferenceReview]: [
    "## Inputs Used",
    "## Screenshot Set",
    "## Full-Site Comparison",
    "## Gaps Found",
    "## Corrections Made",
    "## Gate Result",
  ],
  [artifactNames.testBenchResult]: ["## Main Funnel", "## Analytics Spec", "## Executable Checks", "## Result"],
  [artifactNames.qaReport]: ["## Status", "## PRD Fit", "## Accessibility", "## Responsive", "## Validation"],
  [artifactNames.releaseNotes]: ["## Status", "## Changed Files", "## What Changed", "## Validation", "## Rollback Notes"],
};

function withRun(assertion: (runDir: string) => void): void {
  const runDir = mkdtempSync(join(tmpdir(), "workflow-validator-"));
  try {
    assertion(runDir);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

function writeArtifact(runDir: string, artifact: string, payload?: Payload): void {
  const fileName = artifactFiles[artifact];
  const sections = baseSections[artifact] ?? ["## Inputs Used"];
  const frontmatter = payload
    ? `---\nschema_payload:\n${toYaml(payload, 2)}---\n\n`
    : "";
  const body = sections
    .map((section) => `${section}\n- ${artifact} regression fixture content with enough detail to pass minimum size.`)
    .join("\n\n");
  writeFileSync(join(runDir, fileName), `${frontmatter}${body}\n\nFixture paragraph keeps this artifact above the validator byte threshold and names its source.\n`, "utf8");
}

function writeArtifactsThrough(runDir: string, stageId: string, profile: WorkflowProfile, payloads: Record<string, Payload> = {}): void {
  const stages = getWorkflowStagesForProfile(profile);
  const limit = stages.findIndex((stage) => stage.id === stageId);
  assert.notEqual(limit, -1, `Unknown fixture stage ${stageId}`);

  for (const stage of stages.slice(0, limit + 1)) {
    for (const artifact of getRequiredArtifactsForStage(stage, profile)) {
      writeArtifact(runDir, artifact, payloads[artifact]);
    }
  }
}

function toYaml(value: unknown, indent = 0): string {
  const padding = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${padding}[]\n`;
    }

    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return `${padding}-\n${toYaml(item, indent + 2)}`;
        }

        return `${padding}- ${JSON.stringify(item)}\n`;
      })
      .join("");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        if (Array.isArray(item) || (typeof item === "object" && item !== null)) {
          return `${padding}${key}:\n${toYaml(item, indent + 2)}`;
        }

        return `${padding}${key}: ${JSON.stringify(item)}\n`;
      })
      .join("");
  }

  return `${padding}${JSON.stringify(value)}\n`;
}

function assertError(findings: ReturnType<typeof validateWorkflowRun>, pattern: RegExp): void {
  assert.ok(
    findings.some((finding) => finding.level === "error" && pattern.test(finding.message)),
    `Expected error matching ${pattern}, got:\n${findings.map((finding) => `${finding.level}: ${finding.message}`).join("\n")}`,
  );
}

assert.equal(artifactStatusToStageStatus("ready"), "completed");
assert.equal(artifactStatusToStageStatus("ready_for_approval"), "partial");
assert.equal(detectStageStatusFromMarkdown("| Status | blocked |\n", "completed"), "blocked");
assert.equal(summarizeRunStatus(["completed", "partial", "pending"]), "partial");
assert.equal(canReleaseFromQaStatus("pass_with_known_limitations"), true);
assert.equal(canReleaseFromQaStatus("blocked"), false);

withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(join(runDir, "run-state.json"), JSON.stringify({ status: "blocked", profile: "standard", stages: {} }), "utf8");

  const findings = validateWorkflowRun(runDir, undefined, "standard");
  assertError(findings, /run-state\.json status is 'blocked'/);
  assertError(findings, /persisted workflow run is missing run-meta\.json/);
  assertError(findings, /persisted workflow run is missing artifact-manifest\.json/);
  assertError(findings, /persisted workflow run is missing run-index\.md/);
});

withRun((runDir) => {
  writeArtifactsThrough(runDir, "12-release", "standard", {
    [artifactNames.frontendResult]: {
      status: "success",
      inputs_used: ["fixture"],
      changed_files: ["apps/frontend/src/App.tsx"],
      implementation_notes: ["fixture"],
      commands_run: [{ command: "yarn typecheck", status: "passed" }],
      known_limitations: [],
    },
    [artifactNames.qaReport]: {
      status: "blocked",
      inputs_used: ["fixture"],
      research_integrity: {},
      prd_fit: "blocked",
      accessibility: "blocked",
      responsive: "blocked",
      validation: [],
      blockers: ["fixture blocker"],
    },
    [artifactNames.releaseNotes]: {
      status: "ready",
      inputs_used: ["fixture"],
      changed_files: ["apps/frontend/src/App.tsx"],
      what_changed: ["fixture"],
      validation: [{ command: "yarn workflow:validate", status: "failed" }],
      rollback_notes: ["revert fixture"],
    },
  });

  const findings = validateWorkflowRun(runDir, undefined, "standard");
  assertError(findings, /qa-report\.md payload status is 'blocked'/);
  assertError(findings, /release-notes\.md status is 'ready', but qa-report\.md status is 'blocked'/);
});

withRun((runDir) => {
  writeArtifactsThrough(runDir, "09-visual-reference", "reference", {
    [artifactNames.frontendResult]: {
      status: "success",
      inputs_used: ["fixture"],
      changed_files: ["apps/frontend/src/App.tsx"],
      implementation_notes: ["fixture"],
      commands_run: [{ command: "yarn typecheck", status: "passed" }],
      known_limitations: [],
    },
    [artifactNames.visualReferenceReview]: {
      status: "passed",
      inputs_used: ["fixture"],
      reference_url: "https://example.com",
      local_url: "http://127.0.0.1:5173",
      screenshots: [
        { label: "reference desktop", path: "reports/visual-review/reference-desktop-home.png", viewport: "desktop", capture_type: "section" },
        { label: "reference mobile", path: "reports/visual-review/reference-mobile-home.png", viewport: "mobile", capture_type: "section" },
        { label: "local desktop", path: "reports/visual-review/local-desktop-home.png", viewport: "desktop", capture_type: "section" },
        { label: "local mobile", path: "reports/visual-review/local-mobile-home.png", viewport: "mobile", capture_type: "section" },
      ],
      comparison_areas: [{ area: "hero", reference_pattern: "fixture", local_result: "fixture", status: "passed" }],
      gaps_found: [],
      corrections_made: [],
      gate_result: "passed",
    },
  });

  const findings = validateWorkflowRun(runDir, "09-visual-reference", "reference");
  assertError(findings, /missing required visual-diff-result\.json evidence/);
});

console.log("workflow validator regression tests passed");
