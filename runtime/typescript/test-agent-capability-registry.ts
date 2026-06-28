import assert from "node:assert/strict";
import { loadAgentCapabilityRegistry, renderAgentCapabilityRegistry, validateAgentCapabilityRegistry } from "./agent-capability-registry";
import { agentInstructionFiles, agentNames } from "./agents.registry";
import { routeTools } from "./route.config";

assert.deepEqual(validateAgentCapabilityRegistry(), []);
const records = loadAgentCapabilityRegistry();
assert.equal(records.length, Object.keys(agentInstructionFiles).length);

const orchestrator = records.find((record) => record.agent_name === agentNames.orchestrator);
assert.ok(orchestrator);
assert.equal(orchestrator.enabled_as_tool, false);

const design = records.find((record) => record.agent_name === agentNames.design);
assert.ok(design);
assert.ok(design.skills.includes("figma-roundtrip"));
assert.ok(design.skills.includes("figma-screen-compiler"));

const frontend = records.find((record) => record.agent_name === agentNames.frontend);
assert.ok(frontend);
assert.ok(frontend.route_tools.includes(routeTools.frontend.tool));
assert.ok(frontend.skills.includes("figma-roundtrip"));
assert.ok(frontend.skills.includes("visual-layout-verifier"));

const qa = records.find((record) => record.agent_name === agentNames.qaReview);
assert.ok(qa);
assert.ok(qa.skills.includes("visual-layout-verifier"));

const rendered = renderAgentCapabilityRegistry(records);
assert.ok(rendered.includes("# Agent Capability Registry"));
assert.ok(rendered.includes("`figma-roundtrip`"));
assert.ok(rendered.includes("`visual-layout-verifier`"));
console.log("agent capability registry tests passed");
