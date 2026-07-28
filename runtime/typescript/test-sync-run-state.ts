import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncWorkflowRunState } from "./sync-run-state";

async function withRun(assertion: (runDir: string) => Promise<void>): Promise<void> {
  const runDir = mkdtempSync(join(tmpdir(), "sync-run-state-"));
  try {
    mkdirSync(runDir, { recursive: true });
    await assertion(runDir);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

function writeArtifact(runDir: string, file: string, sections: string[], frontmatter = ""): void {
  const body = sections
    .map((section) => `${section}\n- Fixture content for ${file}.`)
    .join("\n\n");
  writeFileSync(join(runDir, file), `${frontmatter}${body}\n\nLong enough fixture paragraph for sync inspection.\n`, "utf8");
}

await withRun(async (runDir) => {
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({
      run_id: "existing-run",
      goal: "Existing goal",
      profile: "standard",
      execution_mode: "agentic",
      status: "blocked",
      output_dir: runDir,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      stages: {},
    }),
    "utf8",
  );
  writeArtifact(runDir, "run-plan.md", ["## Запрос", "## План этапов", "## Ограничения"]);
  writeArtifact(runDir, "handoff-bundle.md", ["## Goal", "## Completed Artifacts", "## Next Required Artifact"]);
  writeArtifact(runDir, "stage-gate-ledger.md", ["## Run", "## Rule", "## Stage Status", "## Validation Runs"]);
  writeArtifact(runDir, "recursive-brief.md", ["## Expansion", "## Deepening", "## Consolidation", "## Assumptions", "## Open Questions"]);
  writeArtifact(
    runDir,
    "research-summary.md",
    ["## Inputs Used", "## Research Questions", "## Audience"],
    "---\nschema_payload:\n  status: partial\n---\n\n",
  );

  const preview = await syncWorkflowRunState({ outputDir: runDir, preview: true });
  assert.equal(preview.nextState.run_id, "existing-run");
  assert.equal(preview.nextState.created_at, "2026-01-01T00:00:00.000Z");
  assert.equal(preview.nextState.execution_mode, "agentic");
  assert.equal(preview.nextState.stages["00-intake"].status, "completed");
  assert.equal(preview.nextState.stages["01-research"].status, "partial");
  assert.equal(preview.nextState.status, "partial");
  assert.equal(existsSync(join(runDir, "stage-results", "00-intake.json")), false);

  await syncWorkflowRunState({ outputDir: runDir, preview: false });
  assert.equal(existsSync(join(runDir, "stage-results", "00-intake.json")), true);
  const written = JSON.parse(await readFile(join(runDir, "run-state.json"), "utf8")) as { run_id: string; created_at: string; execution_mode: string; status: string };
  assert.equal(written.run_id, "existing-run");
  assert.equal(written.created_at, "2026-01-01T00:00:00.000Z");
  assert.equal(written.execution_mode, "agentic");
  assert.equal(written.status, "partial");
});

// --- Общие помощники ------------------------------------------------------------------

function writeIntakeArtifacts(runDir: string): void {
  writeArtifact(runDir, "run-plan.md", ["## Запрос", "## Ответы на вопросы intake", "## План этапов", "## Ограничения"]);
  writeArtifact(runDir, "handoff-bundle.md", ["## Goal", "## Completed Artifacts", "## Next Required Artifact"]);
  writeArtifact(runDir, "stage-gate-ledger.md", ["## Run", "## Rule", "## Stage Status", "## Validation Runs"]);
  writeArtifact(runDir, "recursive-brief.md", ["## Expansion", "## Deepening", "## Consolidation", "## Assumptions", "## Open Questions"]);
}

function writeRunState(runDir: string, state: Record<string, unknown>): void {
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({
      run_id: "sync-run",
      goal: "Sync goal",
      profile: "standard",
      scale: "full",
      status: "completed",
      output_dir: runDir,
      created_at: "2026-07-20T00:00:00.000Z",
      updated_at: "2026-07-20T00:00:00.000Z",
      stages: {},
      ...state,
    }),
    "utf8",
  );
}

// --- Тот же обход у оси масштаба: sync стирал улику ------------------------------------
//
// Anti-backdating масштаба смотрит на записи о стадиях вне масштаба («масштаб исключает
// стадию, а состояние помнит, что она отработала»). Пересобирая `stages` только по стадиям
// в масштабе, sync эти записи удалял, и `--scale patch` бесшумно снимал занижение:
// измерено 32 ошибки -> 29.
await withRun(async (runDir) => {
  writeIntakeArtifacts(runDir);
  writeRunState(runDir, {
    scale: "increment",
    stages: {
      "06-screens": { id: "06-screens", title: "Screens", status: "completed", attempts: 1, artifacts: [], updated_at: "" },
      "10-test-bench": { id: "10-test-bench", title: "Test Bench", status: "pending", attempts: 0, artifacts: [], updated_at: "" },
    },
  });

  const result = await syncWorkflowRunState({ outputDir: runDir, scale: "patch", preview: false });
  assert.equal(
    result.nextState.stages["06-screens"]?.status,
    "completed",
    "запись об отработавшей стадии вне масштаба обязана пережить sync — на неё смотрит anti-backdating",
  );
  assert.equal(
    result.nextState.stages["10-test-bench"],
    undefined,
    "`pending` вне масштаба уликой не является и не должен вечно держать run в partial",
  );
});

console.log("sync-run-state tests passed");
