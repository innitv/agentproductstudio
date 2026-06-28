import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadAgentInstructions } from "./agents.sdk";
import { parseAgentInstructionDocument, validateAgentMetadata } from "./agent-metadata";

function withAgentDocFixture(assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "agent-metadata-"));
  try {
    mkdirSync(join(root, "agent-pack"), { recursive: true });
    cpSync("agent-pack/agents", join(root, "agent-pack/agents"), { recursive: true });
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function overwriteAgent(root: string, fileName: string, transform: (content: string) => string): void {
  const path = join(root, "agent-pack/agents", fileName);
  writeFileSync(path, transform(readFileSync(path, "utf8")), "utf8");
}

function assertMetadataError(errors: string[], pattern: RegExp): void {
  assert.ok(
    errors.some((error) => pattern.test(error)),
    `Expected metadata error matching ${pattern}, got:\n${errors.join("\n")}`,
  );
}

const parsed = parseAgentInstructionDocument([
  "---",
  "agent_name: fixture",
  "owner_stage_ids: []",
  "required_inputs: []",
  "required_outputs: []",
  "approval_actions: []",
  "skills: []",
  "contract_schema: agent-pack/schemas/agent-output.schema.json",
  "---",
  "",
  "# Fixture Agent",
].join("\n"));
assert.equal(parsed.metadata?.agent_name, "fixture");
assert.equal(parsed.body.trim(), "# Fixture Agent");

const currentErrors = validateAgentMetadata();
assert.deepEqual(currentErrors, []);

withAgentDocFixture((root) => {
  overwriteAgent(root, "prd.agent.md", (content) => content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ""));
  assertMetadataError(validateAgentMetadata(root), /prd\.agent\.md: missing YAML frontmatter agent metadata/);
});

withAgentDocFixture((root) => {
  overwriteAgent(root, "prd.agent.md", (content) => content.replace("  - 02-prd", "  - 99-unknown"));
  assertMetadataError(validateAgentMetadata(root), /owner_stage_ids contains unknown stage '99-unknown'/);
});

withAgentDocFixture((root) => {
  overwriteAgent(root, "prd.agent.md", (content) => content.replace("  - prd", "  - unknown_artifact"));
  const errors = validateAgentMetadata(root);
  assertMetadataError(errors, /required_outputs contains unknown artifact 'unknown_artifact'/);
  assertMetadataError(errors, /metadata required_outputs is missing stage artifact 'prd'/);
});

withAgentDocFixture((root) => {
  overwriteAgent(root, "prd.agent.md", (content) => content.replace("  - scenario_user_flows\n", ""));
  assertMetadataError(validateAgentMetadata(root), /metadata required_inputs is missing route input 'scenario_user_flows'/);
});

withAgentDocFixture((root) => {
  overwriteAgent(root, "prd.agent.md", (content) => content.replace("  - handoff_bundle\n", "  - handoff_bundle\n  - frontend_result\n"));
  assertMetadataError(validateAgentMetadata(root), /routeTools never provide metadata required_input 'frontend_result'/);
});

withAgentDocFixture((root) => {
  overwriteAgent(root, "frontend.agent.md", (content) => content.replace("  - landing-builder", "  - unknown-skill"));
  assertMetadataError(validateAgentMetadata(root), /skills contains unknown skill 'unknown-skill'/);
});

const instructions = await loadAgentInstructions();
assert.ok(instructions.prd.trimStart().startsWith("# PRD Agent"), "SDK instructions should omit YAML frontmatter.");
assert.ok(!instructions.prd.trimStart().startsWith("---"), "SDK instructions must not expose YAML frontmatter.");

console.log("agent metadata regression tests passed");
