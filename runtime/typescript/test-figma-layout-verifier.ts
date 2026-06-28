import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runFigmaLayoutVerifier } from "./figma-layout-verifier";

const baseIr = {
  status: "ready",
  surface: "figma_board",
  design_system: {
    mode: "reuse",
    selected_slug: "shadcn-ui-components-2026",
    reuse_honesty: "ds_instances_required",
    notes: "Fixture requires selected DS instances.",
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
          source: "design_system_component:Button 73:3681",
          resize_contract: "fill",
          required_states: ["default"],
        },
      ],
    },
  ],
  component_sources: [
    {
      stable_id: "primary_button",
      source_type: "design_system_component",
      source_ref: "Buttons component set 73:3681",
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

const passingInventory = {
  target: {
    file_key: "fixture",
    page: "for flow",
    board_node_id: "board",
  },
  screenshots: [
    { screen_or_board: "board", node_id: "board", asset_id: "board-shot", review_status: "passed" },
    { screen_or_board: "home", node_id: "screen-home", asset_id: "home-shot", review_status: "passed" },
  ],
  screens: [
    { id: "screen-home", screen_id: "home", name: "screen / home", x: 0, y: 0, width: 390, height: 844 },
  ],
  nodes: [
    { id: "screen-home", screen_id: "home", name: "screen / home", type: "FRAME", x: 0, y: 0, width: 390, height: 844 },
    { id: "header", screen_id: "home", parent_id: "screen-home", name: "screen header", type: "FRAME", x: 18, y: 38, width: 354, height: 60 },
    { id: "title", screen_id: "home", parent_id: "header", name: "title", type: "TEXT", x: 18, y: 38, width: 220, height: 30, font_size: 24, line_height_px: 29 },
    { id: "button", screen_id: "home", parent_id: "screen-home", name: "button / primary", type: "INSTANCE", x: 18, y: 120, width: 354, height: 44, main_component_id: "73:3681", main_component_name: "Buttons / Type=primary, State=default", component_source: "design_system_component:Buttons component set 73:3681" },
  ],
};

const localOnlyIr = {
  ...baseIr,
  design_system: {
    mode: "extend",
    selected_slug: "shadcn-ui-components-2026",
    reuse_honesty: "local_components_with_deviation",
    notes: "This reproduces a broken shortcut: local wrappers replace selected DS instances.",
  },
  screens: [
    {
      ...baseIr.screens[0],
      components: [
        {
          stable_id: "primary_button",
          source: "local:Button",
          resize_contract: "fill",
          required_states: ["default"],
          deviation: "Local wrapper incorrectly replaces selected DS Button.",
        },
      ],
    },
  ],
  component_sources: [
    {
      stable_id: "primary_button",
      source_type: "local_component",
      source_ref: "local/Button",
      instance_required: false,
      deviation: "Local component should not satisfy extend mode by itself.",
    },
  ],
};

const localOnlyInventory = {
  ...passingInventory,
  nodes: [
    { id: "screen-home", screen_id: "home", name: "screen / home", type: "FRAME", x: 0, y: 0, width: 390, height: 844 },
    { id: "header", screen_id: "home", parent_id: "screen-home", name: "screen header", type: "FRAME", x: 18, y: 38, width: 354, height: 60 },
    { id: "title", screen_id: "home", parent_id: "header", name: "title", type: "TEXT", x: 18, y: 38, width: 220, height: 30, font_size: 24, line_height_px: 29 },
    { id: "button", screen_id: "home", parent_id: "screen-home", name: "A3 Button / primary", type: "INSTANCE", x: 18, y: 120, width: 354, height: 44, main_component_id: "3029:3", main_component_name: "A3 Button / Intent=primary, State=default", component_source: "local_component:A3 Button 3029:9" },
  ],
};

const failingInventory = {
  ...passingInventory,
  nodes: [
    { id: "screen-home", screen_id: "home", name: "screen / home", type: "FRAME", x: 0, y: 0, width: 390, height: 844 },
    { id: "header", screen_id: "home", parent_id: "screen-home", name: "screen header", type: "FRAME", x: 18, y: 8, width: 354, height: 60 },
    { id: "title", screen_id: "home", parent_id: "header", name: "title", type: "TEXT", x: 18, y: 8, width: 220, height: 10, font_size: 24, line_height_px: 29 },
  ],
};

async function withFixture<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = mkdtempSync(join(tmpdir(), "figma-layout-verifier-"));
  try {
    mkdirSync(root, { recursive: true });
    return await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

await withFixture(async (root) => {
  const irPath = join(root, "figma-layout-ir.json");
  const inventoryPath = join(root, "inventory-pass.json");
  const outputPath = join(root, "figma-visual-qa.json");
  writeFileSync(irPath, JSON.stringify(baseIr, null, 2), "utf8");
  writeFileSync(inventoryPath, JSON.stringify(passingInventory, null, 2), "utf8");

  const result = await runFigmaLayoutVerifier({ irPath, inventoryPath, outputPath });
  assert.equal(result.gate_result.ready_allowed, true);
  assert.equal(result.status, "passed");
  assert.equal(result.ds_instance_summary.design_system_sources, 1);
  assert.equal(result.ds_instance_summary.local_component_sources, 0);
  assert.equal(result.ds_instance_summary.visible_selected_ds_instances, 1);
  assert.ok(result.checks.some((check) => check.check === "text_height" && check.result === "passed"));
  assert.ok(readFileSync(outputPath, "utf8").includes("\"ready_allowed\": true"));
});

await withFixture(async (root) => {
  const irPath = join(root, "figma-layout-ir.json");
  const inventoryPath = join(root, "inventory-local-only.json");
  const outputPath = join(root, "figma-visual-qa.json");
  writeFileSync(irPath, JSON.stringify(localOnlyIr, null, 2), "utf8");
  writeFileSync(inventoryPath, JSON.stringify(localOnlyInventory, null, 2), "utf8");

  const result = await runFigmaLayoutVerifier({ irPath, inventoryPath, outputPath });
  assert.equal(result.gate_result.ready_allowed, false);
  assert.equal(result.gate_result.verdict, "blocked");
  assert.equal(result.ds_instance_summary.design_system_sources, 0);
  assert.equal(result.ds_instance_summary.local_component_sources, 1);
  assert.equal(result.ds_instance_summary.visible_selected_ds_instances, 0);
  assert.ok(result.checks.some((check) => check.check === "ds_instance_honesty" && check.result === "blocked"));
  assert.ok(readFileSync(outputPath, "utf8").includes("no design_system_component sources"));
});

await withFixture(async (root) => {
  const irPath = join(root, "figma-layout-ir.json");
  const inventoryPath = join(root, "inventory-fail.json");
  const outputPath = join(root, "figma-visual-qa.json");
  writeFileSync(irPath, JSON.stringify(baseIr, null, 2), "utf8");
  writeFileSync(inventoryPath, JSON.stringify(failingInventory, null, 2), "utf8");

  const result = await runFigmaLayoutVerifier({ irPath, inventoryPath, outputPath });
  assert.equal(result.gate_result.ready_allowed, false);
  assert.equal(result.gate_result.verdict, "blocked");
  assert.ok(result.checks.some((check) => check.check === "text_height" && check.result === "blocked"));
  assert.ok(result.checks.some((check) => check.check === "safe_area" && check.result === "blocked"));
});

console.log("figma layout verifier tests passed");
