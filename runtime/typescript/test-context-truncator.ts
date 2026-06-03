import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { truncateContextForSpecialist } from "./context-truncator";

async function withRun(assertion: (runDir: string) => Promise<void>): Promise<void> {
  const runDir = mkdtempSync(join(tmpdir(), "context-truncator-"));
  try {
    mkdirSync(runDir, { recursive: true });
    await assertion(runDir);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

function writeRunState(runDir: string, artifact: string): void {
  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({
      run_id: "run-context-test",
      goal: "Проверить context truncation",
      profile: "standard",
      execution_mode: "agentic",
      status: "running",
      output_dir: runDir,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      stages: {
        "02-prd": {
          id: "02-prd",
          title: "Product Requirements",
          status: "completed",
          attempts: 1,
          artifacts: [artifact],
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      },
    }),
    "utf8",
  );
}

function writeBaseFiles(runDir: string): void {
  writeFileSync(join(runDir, "run-plan.md"), "## Запрос\nПроверить context truncation\n\n## План этапов\n- test\n", "utf8");
  writeFileSync(join(runDir, "handoff-bundle.md"), "# Full Handoff\n\nLong original handoff.\n", "utf8");
}

await withRun(async (runDir) => {
  writeBaseFiles(runDir);
  writeRunState(runDir, "prd.md");
  writeFileSync(join(runDir, "prd.md"), "# PRD\n\n## Problem\nNo payload here.\n", "utf8");

  await assert.rejects(
    () => truncateContextForSpecialist(runDir, "08-frontend"),
    /missing structured payloads/,
  );
});

await withRun(async (runDir) => {
  writeBaseFiles(runDir);
  writeRunState(runDir, "prd.md");
  writeFileSync(
    join(runDir, "prd.md"),
    [
      "---",
      "schema_payload:",
      "  status: ready",
      "  inputs_used:",
      "    - recursive-brief.md",
      "---",
      "",
      "# PRD",
      "",
      "## Inputs Used",
      "- recursive-brief.md",
    ].join("\n"),
    "utf8",
  );

  const compressed = await truncateContextForSpecialist(runDir, "08-frontend");
  assert.match(compressed, /## Goal/);
  assert.match(compressed, /Target stage: `08-frontend`/);
  assert.match(compressed, /schema_payload:/);
  assert.equal(existsSync(join(runDir, "handoff-bundle-full.md")), true);
  const backupNames = readdirSync(join(runDir, "handoff-backups"));
  assert.equal(backupNames.length, 1);

  const written = await readFile(join(runDir, "handoff-bundle.md"), "utf8");
  assert.equal(written, compressed);
});

console.log("context truncator tests passed");
