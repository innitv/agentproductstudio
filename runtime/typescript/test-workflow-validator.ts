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
  [artifactNames.scenarioUserFlows]: [
    "## Индекс флоу и покрытие сценариев",
    "## Реальные пользовательские флоу",
    "## Сквозная карта состояний продукта",
    "## Проверка флоу",
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
  [artifactNames.screens]: [
    "## Inputs Used",
    "## Input Readiness Pass",
    "## Design-System Grounding",
    "## Screen List",
    "## Screen Traceability",
    "## Component Inventory",
    "## State Inventory",
    "## Figma Readiness",
  ],
  [artifactNames.prototypeReport]: [
    "## Input Readiness Pass",
    "## Prototype Type",
    "## Flow Goal",
    "## Start Screen",
    "## Transition Map",
    "## State Inventory",
    "## Manual Test Script",
    "## Frontend Handoff Contract",
    "## Missing Interactions",
  ],
  [artifactNames.frontendResult]: ["## Changed Files", "## Implementation Notes", "## Commands Run", "## Known Limitations"],
  [artifactNames.visualReferenceReview]: [
    "## Inputs Used",
    "## Source Pair Matrix",
    "## Screenshot Set",
    "## Full-Site Comparison",
    "## Gaps Found",
    "## Corrections Made",
    "## Gate Result",
  ],
  [artifactNames.testBenchResult]: ["## Main Funnel", "## Analytics Spec", "## Executable Checks", "## Result"],
  [artifactNames.qaReport]: [
    "## Status",
    "## QA Scope & Evidence Plan",
    "## Research Integrity",
    "## Traceability Audit",
    "## PRD Fit",
    "## Accessibility",
    "## Responsive",
    "## Negative & Edge Path Pass",
    "## Validation",
    "## Evidence Matrix",
    "## Severity Matrix",
  ],
  [artifactNames.releaseNotes]: [
    "## Status",
    "## Release Scope",
    "## Run Ledger Audit",
    "## Changed Files",
    "## What Changed",
    "## Validation",
    "## Release Decision Matrix",
    "## Rollback Notes",
    "## Approval And External Records",
  ],
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
      qa_scope: ["product_pipeline", "frontend", "release"],
      evidence_plan: [
        { audit_area: "QA status", planned_check: "Confirm blocker fixture", evidence_source: "fixture", status: "blocked" },
      ],
      research_integrity: {},
      traceability_audit: [
        {
          signal: "fixture",
          prd_requirement: "REQ-FIXTURE",
          ia_node: "fixture",
          screen_or_component: "fixture",
          test_signal: "fixture",
          status: "blocked",
        },
      ],
      prd_fit: "blocked",
      ia_screens_prototype_consistency: "blocked",
      accessibility: "blocked",
      responsive: "blocked",
      negative_edge_path_pass: [
        { scenario: "fixture", result: "blocked", evidence: "fixture" },
      ],
      funnel_analytics: "blocked",
      secrets_sensitive_data: "blocked",
      validation: [],
      evidence_matrix: [
        { finding_id: "QA-FIXTURE", evidence_type: "artifact", reference: "fixture" },
      ],
      severity_matrix: [
        {
          finding_id: "QA-FIXTURE",
          severity: "blocker",
          owner_stage: "11-qa",
          affected_surface: "fixture",
          evidence: "fixture",
          recommendation: "resolve fixture",
          release_impact: "blocked",
        },
      ],
      skipped_unavailable_checks: [
        { check: "fixture", reason: "fixture", impact: "blocked" },
      ],
      blockers: ["fixture blocker"],
    },
    [artifactNames.releaseNotes]: {
      status: "ready",
      inputs_used: ["fixture"],
      release_scope: {
        release_type: "code",
        exact_target: "fixture",
        approval_required: false,
        release_owner: "release",
      },
      run_ledger_audit: [
        { item: "fixture", status: "pass", evidence: "fixture" },
      ],
      changed_files: [
        { file: "apps/frontend/src/App.tsx", change_type: "code", change: "fixture", in_release_scope: true },
      ],
      changed_artifacts: [
        { artifact: "release-notes.md", producer_stage: "12-release", status: "ready" },
      ],
      what_changed: ["fixture"],
      dependency_sensitive_delta: [
        { area: "fixture", result: "pass", evidence: "fixture" },
      ],
      validation: [
        { check: "workflow", command_or_evidence: "yarn workflow:validate", result: "fail", release_impact: "blocked" },
      ],
      release_decision_matrix: [
        { gate: "QA status", required_state: "pass", actual_state: "blocked", decision: "blocked" },
      ],
      deployment_notes: [
        { step: "fixture", action: "fixture", expected_result: "fixture", stop_condition: "fixture" },
      ],
      rollback_notes: [
        {
          surface: "fixture",
          rollback_action: "revert fixture",
          validation_after_rollback: "fixture",
          data_loss_risk: "low",
          approval_needed: false,
        },
      ],
      approval_external_records: [
        { action: "fixture", target: "fixture", status: "not_required" },
      ],
      remaining_risks: [
        { risk: "fixture", severity: "blocker", owner: "release" },
      ],
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
      source_pairs: [
        {
          pair: "reference_to_frontend",
          required: true,
          evidence: ["fixture"],
          status: "passed",
          notes: "fixture",
        },
      ],
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
