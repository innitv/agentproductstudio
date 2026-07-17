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
    cpSync("agent-pack/agent-contracts", join(root, "agent-pack/agent-contracts"), { recursive: true });
    // Обёртки нужны в fixture: контракт сверяется с ними, и без копии каждый тест ловил бы
    // постороннюю ошибку про отсутствующую обёртку.
    mkdirSync(join(root, ".claude"), { recursive: true });
    cpSync(".claude/agents", join(root, ".claude/agents"), { recursive: true });
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function overwriteAgent(root: string, fileName: string, transform: (content: string) => string): void {
  const path = join(root, "agent-pack/agent-contracts", fileName);
  writeFileSync(path, transform(readFileSync(path, "utf8")), "utf8");
}

function overwriteWrapper(root: string, fileName: string, transform: (content: string) => string): void {
  const path = join(root, ".claude/agents", fileName);
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

// --- Обёртка `.claude/agents/*` обязана совпадать по skills с контрактом ---

// Обёртка отстала от контракта — ровно то расхождение, которое до 2026-07-17 копилось молча.
withAgentDocFixture((root) => {
  overwriteWrapper(root, "frontend.md", (content) =>
    content.replace("skills: [landing-builder, ", "skills: ["));
  assertMetadataError(
    validateAgentMetadata(root),
    /\.claude\/agents\/frontend\.md: skills is missing 'landing-builder' declared in/,
  );
});

// Обёртка объявляет skill, которого нет в контракте — дрейф в обратную сторону.
withAgentDocFixture((root) => {
  overwriteWrapper(root, "prd.md", (content) =>
    content.replace("skills: [anti-ai-slop]", "skills: [anti-ai-slop, run-ledger]"));
  assertMetadataError(
    validateAgentMetadata(root),
    /\.claude\/agents\/prd\.md: skills contains 'run-ledger' which the contract .* does not declare/,
  );
});

// Пропавшая обёртка — контракт есть, исполнять нечем.
withAgentDocFixture((root) => {
  rmSync(join(root, ".claude/agents/ia.md"), { force: true });
  assertMetadataError(
    validateAgentMetadata(root),
    /\.claude\/agents\/ia\.md: missing native agent wrapper/,
  );
});

// Оркестратор — исключение: главная сессия, а не субагент; его обёртка skills не объявляет.
withAgentDocFixture((root) => {
  const errors = validateAgentMetadata(root);
  assert.ok(
    !errors.some((error) => error.includes(".claude/agents/orchestrator.md")),
    `Оркестратор не должен требовать skills в обёртке, got:\n${errors.join("\n")}`,
  );
});

const instructions = await loadAgentInstructions();
assert.ok(instructions.prd.trimStart().startsWith("# PRD Agent"), "SDK instructions should omit YAML frontmatter.");
assert.ok(!instructions.prd.trimStart().startsWith("---"), "SDK instructions must not expose YAML frontmatter.");

console.log("agent metadata regression tests passed");
