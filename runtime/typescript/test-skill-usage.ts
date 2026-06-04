import assert from "node:assert/strict";
import { formatSkillUsageInspection, inspectSkillUsage } from "./skill-usage";

const rows = inspectSkillUsage();
const frontend = rows.find((row) => row.stageId === "08-frontend");
const qa = rows.find((row) => row.stageId === "11-qa");
const testBench = rows.find((row) => row.stageId === "10-test-bench");

assert.ok(frontend, "frontend stage should be present");
assert.ok(frontend.skills.some((skill) => skill.id === "landing-builder"), "frontend should use landing-builder");
assert.ok(frontend.skills.some((skill) => skill.id === "figma-token-extractor"), "frontend should use figma-token-extractor");
assert.ok(frontend.skills.some((skill) => skill.id === "design-engineering"), "frontend should use design-engineering");
assert.ok(frontend.skills.some((skill) => skill.id === "ds-to-storybook"), "frontend should use ds-to-storybook");

assert.ok(testBench, "test-bench stage should be present");
assert.ok(testBench.skills.some((skill) => skill.id === "funnel-analytics-verifier"), "test-bench should use funnel analytics verifier");

assert.ok(qa, "qa stage should be present");
assert.ok(qa.skills.some((skill) => skill.id === "visual-diff-verifier"), "qa should use visual diff verifier");
assert.ok(qa.skills.some((skill) => skill.id === "seo-copy-validator"), "qa should use SEO copy validator");

const output = formatSkillUsageInspection(rows);
assert.ok(output.includes("# Agent Skill Usage"));
assert.ok(output.includes("| 08-frontend | frontend |"));
assert.ok(output.includes("`landing-builder`"));
assert.ok(output.includes("`design-engineering`"));
assert.ok(output.includes("`ds-to-storybook`"));

console.log("skill usage inspection tests passed");
