import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { artifactFiles, artifactNames, artifactSchemas } from "./workflow.manifest";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

assert.equal(artifactNames.figmaLayoutIr, "figma_layout_ir");
assert.equal(artifactNames.figmaVisualQa, "figma_visual_qa");
assert.equal(artifactFiles[artifactNames.figmaLayoutIr], "figma-layout-ir.json");
assert.equal(artifactFiles[artifactNames.figmaVisualQa], "figma-visual-qa.json");
assert.equal(artifactSchemas[artifactNames.figmaLayoutIr], "agent-pack/schemas/figma-layout-ir.schema.json");
assert.equal(artifactSchemas[artifactNames.figmaVisualQa], "agent-pack/schemas/figma-visual-qa.schema.json");

for (const schemaPath of [
  artifactSchemas[artifactNames.figmaLayoutIr],
  artifactSchemas[artifactNames.figmaVisualQa],
]) {
  assert.ok(existsSync(schemaPath), `schema should exist: ${schemaPath}`);
  const schema = readJson(schemaPath) as { title?: unknown; required?: unknown };
  assert.equal(typeof schema.title, "string", `${schemaPath} should have a title`);
  assert.ok(Array.isArray(schema.required), `${schemaPath} should have required fields`);
}

const layoutIrSample = {
  status: "ready",
  surface: "figma_board",
  design_system: {
    mode: "reuse",
    selected_slug: "shadcn-ui-components-2026",
    reuse_honesty: "ds_instances_required",
  },
  viewport: { width: 390, height: 844, safe_area_top: 34, safe_area_bottom: 18 },
  route: [
    {
      step: 1,
      screen_id: "home",
      primary_action: "pay_all",
      next_state: "bill_detail",
      completion_evidence: "Bill detail screen is visible",
    },
  ],
  screens: [
    {
      id: "home",
      title: "Дом",
      zones: [
        {
          id: "header",
          role: "entry context",
          priority: "primary",
          copy_fit: { max_lines: 2, overflow_behavior: "wrap" },
        },
      ],
      layout_constraints: {
        no_clip: true,
        no_overlap: true,
        min_touch_target: 44,
        bottom_nav_pinned: true,
        min_row_height: 64,
      },
      components: [
        {
          stable_id: "primary_button",
          source: "ds:Button",
          resize_contract: "fill",
          required_states: ["default", "pressed", "disabled"],
        },
      ],
    },
  ],
  component_sources: [
    {
      stable_id: "primary_button",
      source_type: "design_system_component",
      source_ref: "shadcn/Button",
      instance_required: true,
    },
  ],
  verification_contract: {
    screenshots_required: ["board", "home"],
    object_inventory_required: true,
    route_walkthrough_required: true,
    visual_qa_required: true,
  },
};

const visualQaSample = {
  status: "passed",
  target: {
    file_key: "NUoNEuTJ3OZOGH2c780Z55",
    page: "for flow",
    board_node_id: "3013:2",
  },
  inputs_used: ["figma-layout-ir.json", "figma-handoff-bundle.md"],
  screenshot_evidence: [
    {
      screen_or_board: "home",
      node_id: "3013:28",
      asset_id: "asset-id",
      review_status: "passed",
    },
  ],
  checks: [
    { check: "text_height", result: "passed", evidence: "No suspicious 10px text nodes" },
    { check: "route_coherence", result: "passed", evidence: "Primary action leads to next screen" },
  ],
  repair_actions: [
    { action: "Increase safe area top padding", status: "applied", node_ids: ["3013:28"] },
  ],
  gate_result: { verdict: "passed", ready_allowed: true, known_deviations: [] },
};

assert.equal(layoutIrSample.verification_contract.visual_qa_required, true);
assert.equal(layoutIrSample.screens[0].layout_constraints.no_clip, true);
assert.equal(layoutIrSample.component_sources[0].instance_required, true);
assert.equal(visualQaSample.gate_result.ready_allowed, true);
assert.ok(visualQaSample.checks.some((check) => check.check === "text_height"));
assert.ok(visualQaSample.checks.some((check) => check.check === "route_coherence"));

console.log("figma layout contract tests passed");
