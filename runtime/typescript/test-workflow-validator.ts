import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { artifactNames } from "./route.config";
import { artifactStatusToStageStatus, canReleaseFromQaStatus, detectStageStatusFromMarkdown, summarizeRunStatus } from "./status-resolver";
import {
  artifactFiles,
  getRequiredArtifactsForStage,
  getRequiredSectionsForStage,
  getWorkflowStagesForProfile,
  workflowScales,
  workflowStages,
  type WorkflowProfile,
  type WorkflowScale,
} from "./workflow-stages";
import { getCoreBundleArtifactsForProfile } from "./workflow.manifest";
import { validateWorkflowRun } from "./validate-workflow-run";

type Payload = Record<string, unknown>;

const baseSections: Record<string, readonly string[]> = {
  [artifactNames.runPlan]: ["## Запрос", "## Ответы на вопросы intake", "## План этапов", "## Ограничения"],
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
  // Набор маршрута `code`: канонический список стадии 06-screens минус Figma-условные
  // `## Layout Compiler Contract` и `## Figma Readiness`. Записан литералом намеренно —
  // фикстура, выведенная из манифеста, проверяла бы манифест сам собой.
  [artifactNames.screens]: [
    "## Inputs Used",
    "## Input Readiness Pass",
    "## Design System Strategy",
    "## Design-System Grounding",
    "## Screen List",
    "## Screen Traceability",
    "## Component Inventory",
    "## Component Contract Matrix",
    "## Frame / State Implementation Map",
    "## State Inventory",
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

function writeArtifactsThrough(
  runDir: string,
  stageId: string,
  profile: WorkflowProfile,
  payloads: Record<string, Payload> = {},
  scale: WorkflowScale = "full",
): void {
  const stages = getWorkflowStagesForProfile(profile, scale);
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

// Один факт — одно сообщение. Для артефактов, где `## Inputs Used` объявлена обязательной,
// её отсутствие отчитывается ошибкой; мягкое напоминание о том же факте не дублируется.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "04-design", "reference");
  writeFileSync(
    join(runDir, artifactFiles[artifactNames.referenceAnalysis]),
    ["## References", "- фикстура без раздела Inputs Used", "", "Длинный абзац, чтобы артефакт прошёл порог размера и дошёл до проверки секций."].join("\n"),
    "utf8",
  );

  const findings = validateWorkflowRun(runDir, "04-design", "reference");
  assertError(findings, /reference-analysis\.md is missing section ## Inputs Used/);
  assert.deepEqual(
    findings.filter((finding) => finding.level === "warning" && /reference-analysis\.md should record ## Inputs Used/.test(finding.message)),
    [],
    "обязательная секция не должна отчитываться дважды — ошибкой и предупреждением",
  );
});

// --- Ось масштаба (scale) ---

// Дефолт обязан совпадать с поведением до появления оси, иначе старые run сломаются.
assert.deepEqual(
  getWorkflowStagesForProfile("standard").map((stage) => stage.id),
  getWorkflowStagesForProfile("standard", "full").map((stage) => stage.id),
  "вызов без scale должен вести себя как full",
);

// Масштаб сужает pipeline монотонно: patch ⊆ increment ⊆ full.
{
  const ids = (scale: WorkflowScale) => getWorkflowStagesForProfile("standard", scale).map((stage) => stage.id);
  const full = new Set(ids("full"));
  const increment = new Set(ids("increment"));
  for (const id of ids("patch")) assert.ok(increment.has(id), `patch-стадия ${id} должна входить в increment`);
  for (const id of increment) assert.ok(full.has(id), `increment-стадия ${id} должна входить в full`);
  assert.ok(ids("patch").length < ids("increment").length);
  assert.ok(ids("increment").length < ids("full").length);
}

// Гейты, которые не режутся ни на каком масштабе.
for (const scale of workflowScales) {
  const ids = getWorkflowStagesForProfile("standard", scale).map((stage) => stage.id);
  assert.ok(ids.includes("00-intake"), `${scale}: intake обязателен`);
  assert.ok(ids.includes("11-qa"), `${scale}: qa обязателен`);
  const ledger = getCoreBundleArtifactsForProfile("standard", scale);
  for (const artifact of [artifactNames.runPlan, artifactNames.handoffBundle, artifactNames.stageGateLedger]) {
    assert.ok(ledger.includes(artifact), `${scale}: ledger-артефакт ${artifact} обязателен`);
  }
}

// Оси независимы: масштаб не должен выкидывать стадию, включённую профилем.
assert.ok(
  getWorkflowStagesForProfile("reference", "patch").map((stage) => stage.id).includes("09-visual-reference"),
  "reference+patch обязан сохранять visual-reference: profile и scale — разные оси",
);

// Run масштаба increment валиден без research/PRD/IA, которых full бы требовал.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ run_id: "fixture", goal: "fixture", profile: "standard", scale: "increment", status: "completed", output_dir: runDir, created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );
  const findings = validateWorkflowRun(runDir, "11-qa", "standard", "increment");
  assert.equal(
    findings.filter((f) => f.level === "error" && /missing required artifact/.test(f.message)).length,
    0,
    "increment не должен требовать артефакты стадий вне масштаба",
  );
});

// Занижение масштаба задним числом ловится: стадия вне масштаба уже отработала.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({
      run_id: "fixture",
      goal: "fixture",
      profile: "standard",
      scale: "patch",
      status: "completed",
      output_dir: runDir,
      created_at: "",
      updated_at: "",
      stages: { "06-screens": { status: "completed" } },
    }),
    "utf8",
  );
  const findings = validateWorkflowRun(runDir, "11-qa", "standard", "patch");
  assertError(findings, /Scale cannot be lowered after stages have run/);
});

// --- Записи `skipped_by_scale` проверяются в три стороны ---

function writeScaleRunState(runDir: string, scale: WorkflowScale): void {
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "standard", scale, track: "code", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );
}

function appendScaleRows(runDir: string, rows: string[]): void {
  const path = join(runDir, artifactFiles[artifactNames.stageGateLedger]);
  const header = ["", "| Этап | Владелец | Артефакты | Статус | Заметки |", "|---|---|---|---|---|"];
  writeFileSync(path, [readFileSync(path, "utf8"), ...header, ...rows, ""].join("\n"), "utf8");
}

const incrementSkippedStages = ["01-research", "02-prd", "03-ia"];

// Ложная запись: стадия входит в масштаб, но помечена как пропущенная по масштабу.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeScaleRunState(runDir, "increment");
  appendScaleRows(runDir, [
    ...incrementSkippedStages.map((stageId) => `| ${stageId} | owner | artifacts | \`skipped_by_scale\` | Scale \`increment\` |`),
    "| 04-design | design | `design-brief.md` | `skipped_by_scale` | стадия ВХОДИТ в increment |",
  ]);

  const findings = validateWorkflowRun(runDir, undefined, "standard", "increment");
  assertError(findings, /04-design Design Brief is recorded as skipped_by_scale, but scale 'increment' includes it/);
});

// Протухшая запись: такой стадии нет в манифесте вообще.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeScaleRunState(runDir, "increment");
  appendScaleRows(runDir, [
    ...incrementSkippedStages.map((stageId) => `| ${stageId} | owner | artifacts | \`skipped_by_scale\` | Scale \`increment\` |`),
    "| 99-nonexistent | owner | artifacts | `skipped_by_scale` | такой стадии нет |",
  ]);

  const findings = validateWorkflowRun(runDir, undefined, "standard", "increment");
  assertError(findings, /skipped_by_scale record names unknown stage '99-nonexistent'/);
});

// Запись без stage id неотличима от записи про другую стадию.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeScaleRunState(runDir, "increment");
  appendScaleRows(runDir, [
    ...incrementSkippedStages.map((stageId) => `| ${stageId} | owner | artifacts | \`skipped_by_scale\` | Scale \`increment\` |`),
    "| research | owner | artifacts | `skipped_by_scale` | без id стадии |",
  ]);

  const findings = validateWorkflowRun(runDir, undefined, "standard", "increment");
  assertError(findings, /skipped_by_scale record does not name a stage id/);
});

// --- Ось профиля читается из состояния run, а не угадывается по тексту ---

// Дефект с реального прогона `contractor-payment-demo`: три источника говорили `reference`,
// а валидатор угадывал `standard` по тексту run-plan и скрывал 7 ошибок, включая
// невыполненный гейт `09-visual-reference`.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "04-design", "reference");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "reference", scale: "full", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );

  // Ни одного текстового признака reference в артефактах — эвристика дала бы `standard`.
  const findings = validateWorkflowRun(runDir, "04-design");
  assert.deepEqual(
    findings.filter((finding) => /profile is 'reference', but validation profile is 'standard'/.test(finding.message)),
    [],
    "профиль обязан читаться из run-state.json, а не угадываться",
  );

  // На профиле `standard` артефакт reference-стадии не требуется вовсе — значит, факт
  // чтения профиля виден по требованию `reference-analysis.md`.
  writeFileSync(join(runDir, artifactFiles[artifactNames.referenceAnalysis]), "", "utf8");
  assertError(
    validateWorkflowRun(runDir, "04-design"),
    /reference-analysis\.md is too small to be a real stage output/,
  );
});

// Профиль из `run-meta.json`, если `run-state.json` его не содержит.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(join(runDir, "run-meta.json"), JSON.stringify({ workflow_profile: "reference" }), "utf8");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ scale: "full", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );

  const findings = validateWorkflowRun(runDir, "00-intake");
  assert.ok(
    findings.every((finding) => !/validation profile is 'standard'/.test(finding.message)),
    "профиль обязан читаться и из run-meta.json",
  );
});

// Явный флаг сильнее записанного состояния: им перепроверяют чужой run.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "reference", scale: "full", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );

  const findings = validateWorkflowRun(runDir, "00-intake", "standard");
  assert.ok(
    findings.some((finding) => finding.level === "warning" && /profile is 'reference', but validation profile is 'standard'/.test(finding.message)),
    "расхождение флага и состояния обязано оставаться видимым",
  );
});

// Минимальное состояние run для гейтов, не связанных с осями.
function writeRunStateFixture(runDir: string): void {
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "standard", scale: "full", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );
}

// --- Косвенный гейт опроса на intake ---

// Раздел с ответами обязателен: валидатор не видит самого вопроса, только запись о нём.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(
    join(runDir, artifactFiles[artifactNames.runPlan]),
    ["# Run Plan", "", "## Запрос", "", "фикстура", "", "## План этапов", "", "- 00-intake", "", "## Ограничения", "", "- фикстура без записи опроса, длинная строка для порога размера артефакта."].join("\n"),
    "utf8",
  );
  writeRunStateFixture(runDir);

  const findings = validateWorkflowRun(runDir, "00-intake", "standard", "full");
  assertError(findings, /does not record the intake survey/);
  // Сообщение обязано называть три легитимных случая «не спрашивали», иначе агент решит,
  // что гейт требует задать вопрос задним числом.
  assertError(findings, /already given in the request/);
  assertError(findings, /not a product workflow/);
  assertError(findings, /quick draft/);
});

// Запись «не спрашивали, потому что ответ был в запросе» — валидная запись.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(
    join(runDir, artifactFiles[artifactNames.runPlan]),
    [
      "# Run Plan",
      "",
      "## Запрос",
      "",
      "фикстура",
      "",
      "## Ответы на вопросы intake",
      "",
      "- Вопросы не задавались: маршрут и профиль названы пользователем в самом запросе.",
      "",
      "## План этапов",
      "",
      "- 00-intake",
      "",
      "## Ограничения",
      "",
      "- фикстура с записью опроса, длинная строка для порога размера артефакта.",
    ].join("\n"),
    "utf8",
  );
  writeRunStateFixture(runDir);

  const findings = validateWorkflowRun(runDir, "00-intake", "standard", "full");
  assert.deepEqual(
    findings.filter((finding) => /intake survey/.test(finding.message)),
    [],
    "запись о том, почему опрос не проводился, закрывает гейт",
  );
});

// Заголовок раздела есть, но ось помечена скаффолдом как незаписанная. Это и есть решение
// «гейт не закрывается сам»: скаффолд пишет раздел всегда, но закрывает только те оси,
// значения которых ему передали на старте.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(
    join(runDir, artifactFiles[artifactNames.runPlan]),
    [
      "# Run Plan",
      "",
      "## Запрос",
      "",
      "фикстура",
      "",
      "## Ответы на вопросы intake",
      "",
      "| Вопрос | Ответ | Как получен | Ось |",
      "|---|---|---|---|",
      "| Есть конкретный образец, с которым сверять результат? | Нет | [ответ не записан] | `profile` = `standard` |",
      "",
      "## План этапов",
      "",
      "- 00-intake",
      "",
      "## Ограничения",
      "",
      "- фикстура со скаффолд-меткой, длинная строка для порога размера артефакта.",
    ].join("\n"),
    "utf8",
  );
  writeRunStateFixture(runDir);

  const findings = validateWorkflowRun(runDir, "00-intake", "standard", "full");
  assertError(findings, /still carries '\[ответ не записан\]'/);
});

// Легаси: запуск, созданный до появления опроса, физически не мог его записать.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "00-intake", "standard");
  writeFileSync(
    join(runDir, artifactFiles[artifactNames.runPlan]),
    ["# Run Plan", "", "## Запрос", "", "фикстура", "", "## План этапов", "", "- 00-intake", "", "## Ограничения", "", "- легаси-фикстура, длинная строка для порога размера артефакта."].join("\n"),
    "utf8",
  );
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "standard", scale: "full", status: "completed", created_at: "2026-07-20T10:00:00.000Z", stages: {} }),
    "utf8",
  );

  const findings = validateWorkflowRun(runDir, "00-intake", "standard", "full");
  assert.deepEqual(
    findings.filter((finding) => finding.level === "error" && /intake survey/.test(finding.message)),
    [],
    "run до 2026-07-27 не должен падать из-за отсутствия записи опроса",
  );
  assert.ok(
    findings.some((finding) => finding.level === "warning" && /before the intake survey existed/.test(finding.message)),
    "но пропуск обязан оставаться видимым как предупреждение",
  );
});

// --- Закрытие ожиданий (вторая фаза) ---

// Масштаб: стадия вне масштаба обязана быть закрыта записью `skipped_by_scale`.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "standard", scale: "increment", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );

  const findings = validateWorkflowRun(runDir, undefined, "standard", "increment");
  assertError(findings, /scale 'increment' excludes this stage, but stage-gate-ledger\.md has no `skipped_by_scale` row/);
  assert.equal(
    findings.filter((finding) => finding.level === "error" && /skipped_by_scale` row for it/.test(finding.message)).length,
    3,
    "increment исключает 01-research, 02-prd, 03-ia",
  );
});

// Те же строки в ledger — и ожидания закрыты. Эмодзи в ячейке статуса не мешает.
withRun((runDir) => {
  writeArtifactsThrough(runDir, "11-qa", "standard", {}, "increment");
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({ profile: "standard", scale: "increment", status: "completed", created_at: "", updated_at: "", stages: {} }),
    "utf8",
  );
  const ledgerPath = join(runDir, artifactFiles[artifactNames.stageGateLedger]);
  writeFileSync(
    ledgerPath,
    [
      readFileSync(ledgerPath, "utf8"),
      "",
      "| Этап | Владелец | Артефакты | Статус | Заметки |",
      "|---|---|---|---|---|",
      ...["01-research", "02-prd", "03-ia"].map(
        (stageId) => `| ${stageId} | owner | artifacts | ⏭️ \`skipped_by_scale\` | Scale \`increment\` |`,
      ),
      "",
    ].join("\n"),
    "utf8",
  );

  const findings = validateWorkflowRun(runDir, undefined, "standard", "increment");
  assert.deepEqual(
    findings.filter((finding) => /skipped_by_scale` row/.test(finding.message)),
    [],
    "положительная запись о пропуске по масштабу закрывает ожидание",
  );
});

console.log("workflow validator regression tests passed");
