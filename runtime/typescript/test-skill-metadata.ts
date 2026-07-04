import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseSkillInstructionDocument, validateSkillMetadata } from "./skill-metadata";

function withSkillFixture(assertion: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "skill-metadata-"));
  try {
    mkdirSync(join(root, "agent-pack"), { recursive: true });
    cpSync("agent-pack/skills", join(root, "agent-pack/skills"), { recursive: true });
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function overwriteSkill(root: string, skillId: string, transform: (content: string) => string): void {
  const path = join(root, "agent-pack/skills", skillId, "SKILL.md");
  writeFileSync(path, transform(readFileSync(path, "utf8")), "utf8");
}

function assertMetadataError(errors: string[], pattern: RegExp): void {
  assert.ok(
    errors.some((error) => pattern.test(error)),
    `Expected skill metadata error matching ${pattern}, got:\n${errors.join("\n")}`,
  );
}

const parsed = parseSkillInstructionDocument([
  "---",
  "id: fixture-skill",
  "name: fixture-skill",
  "title: Fixture",
  "description: Fixture skill",
  "platforms:",
  "  - claude",
  "mcp_servers: []",
  "strictness_profile: strict",
  "owner_stage_ids: []",
  "required_inputs: []",
  "required_outputs: []",
  "approval_actions: []",
  "validation_commands: []",
  "contract_schema: agent-pack/templates/skill.template.md",
  "---",
  "",
  "# Fixture Skill",
].join("\n"));
assert.equal(parsed.metadata?.id, "fixture-skill");
assert.equal(parsed.body.trim(), "# Fixture Skill");

assert.deepEqual(validateSkillMetadata(), []);

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ""));
  assertMetadataError(validateSkillMetadata(root), /landing-builder\/SKILL\.md: missing YAML frontmatter skill metadata/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace("  - 08-frontend", "  - 99-unknown"));
  assertMetadataError(validateSkillMetadata(root), /owner_stage_ids contains unknown stage '99-unknown'/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "notion-sync", (content) => content.replace(
    "approval_actions:\n  - notion_research_publish\n  - notion_prd_export\n  - notion_agile_export",
    "approval_actions:\n  - notion_research_publish\n  - unknown_external_write\n  - notion_agile_export",
  ));
  assertMetadataError(validateSkillMetadata(root), /approval_actions contains unknown action 'unknown_external_write'/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace("  - frontend_result", "  - unknown_artifact"));
  assertMetadataError(validateSkillMetadata(root), /required_outputs contains unknown artifact\/output 'unknown_artifact'/);
});

withSkillFixture((root) => {
  overwriteSkill(root, "landing-builder", (content) => content.replace("name: landing-builder", "name: wrong-name"));
  assertMetadataError(validateSkillMetadata(root), /name 'wrong-name' must match id 'landing-builder'/);
});

console.log("skill metadata regression tests passed");
