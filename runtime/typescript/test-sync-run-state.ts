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

console.log("sync-run-state tests passed");
