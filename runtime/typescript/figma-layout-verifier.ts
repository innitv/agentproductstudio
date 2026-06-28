import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type CheckName =
  | "text_height"
  | "text_overflow"
  | "overlap"
  | "clipping"
  | "safe_area"
  | "density"
  | "hierarchy"
  | "route_coherence"
  | "ds_instance_honesty"
  | "systemization_regression";

type CheckResult = "passed" | "needs_repair" | "blocked" | "not_applicable";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutIr {
  status: "draft" | "partial" | "blocked" | "ready";
  surface: "figma_board" | "product_ui" | "prototype" | "handoff";
  design_system: {
    mode: "reuse" | "extend" | "product_specific" | "bespoke";
    selected_slug: string;
    reuse_honesty: "ds_instances_required" | "local_components_with_deviation" | "bespoke_allowed" | "blocked";
    notes?: string;
  };
  viewport: {
    width: number;
    height: number;
    safe_area_top: number;
    safe_area_bottom: number;
  };
  route: Array<{
    step: number;
    screen_id: string;
    primary_action: string;
    next_state: string;
    completion_evidence: string;
    error_or_recovery_path?: string;
  }>;
  screens: Array<{
    id: string;
    title: string;
    zones: Array<{ id: string; role: string; priority: string; copy_fit: { max_lines: number; overflow_behavior: string } }>;
    layout_constraints: {
      no_clip: boolean;
      no_overlap: boolean;
      min_touch_target: number;
      bottom_nav_pinned: boolean;
      min_row_height?: number;
    };
    components: Array<{
      stable_id: string;
      source: string;
      resize_contract: string;
      required_states: string[];
      deviation?: string;
    }>;
  }>;
  component_sources: Array<{
    stable_id: string;
    source_type: "design_system_component" | "local_component" | "bespoke_frame";
    source_ref: string;
    instance_required: boolean;
    deviation?: string;
  }>;
  verification_contract: {
    screenshots_required: string[];
    object_inventory_required: boolean;
    route_walkthrough_required: boolean;
    visual_qa_required: boolean;
  };
}

interface InventoryNode extends Bounds {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
  screen_id?: string;
  visible?: boolean;
  characters?: string;
  font_size?: number;
  line_height_px?: number;
  text_auto_resize?: string;
  layout_mode?: string;
  layout_positioning?: string;
  main_component_id?: string;
  main_component_name?: string;
  component_source?: string;
}

interface InventoryScreen extends Bounds {
  id: string;
  screen_id: string;
  name: string;
}

interface FigmaInventory {
  target: {
    file_key: string;
    page: string;
    board_node_id: string;
  };
  screenshots?: Array<{
    screen_or_board: string;
    node_id: string;
    asset_id: string;
    review_status?: "passed" | "needs_repair" | "blocked";
    notes?: string;
  }>;
  screens: InventoryScreen[];
  nodes: InventoryNode[];
  precomputed_checks?: VisualQaCheck[];
}

interface VisualQaCheck {
  check: CheckName;
  result: CheckResult;
  evidence: string;
  repair?: string;
}

interface VisualQaResult {
  status: "draft" | "partial" | "blocked" | "passed";
  target: FigmaInventory["target"];
  inputs_used: string[];
  screenshot_evidence: Array<{
    screen_or_board: string;
    node_id: string;
    asset_id: string;
    review_status: "passed" | "needs_repair" | "blocked";
    notes?: string;
  }>;
  checks: VisualQaCheck[];
  repair_actions: Array<{
    action: string;
    status: "applied" | "deferred" | "blocked";
    node_ids?: string[];
  }>;
  gate_result: {
    verdict: "passed" | "passed_with_notes" | "blocked";
    ready_allowed: boolean;
    known_deviations: string[];
  };
}

const tolerance = 1;

export async function runFigmaLayoutVerifier(options: {
  irPath: string;
  inventoryPath: string;
  outputPath: string;
}): Promise<VisualQaResult> {
  const ir = JSON.parse(await readFile(resolve(options.irPath), "utf8")) as LayoutIr;
  const inventory = JSON.parse(await readFile(resolve(options.inventoryPath), "utf8")) as FigmaInventory;
  const checks = runChecks(ir, inventory);
  const repairActions = checks
    .filter((check) => check.result === "needs_repair" || check.result === "blocked")
    .map((check) => ({
      action: check.repair ?? `Resolve ${check.check}`,
      status: check.result === "blocked" ? "blocked" as const : "deferred" as const,
    }));
  const blocked = checks.some((check) => check.result === "blocked");
  const needsRepair = checks.some((check) => check.result === "needs_repair");
  const knownDeviations = [
    ...ir.component_sources.flatMap((source) => source.deviation ? [`${source.stable_id}: ${source.deviation}`] : []),
    ...(ir.design_system.notes ? [`design_system: ${ir.design_system.notes}`] : []),
  ];
  const verdict = blocked ? "blocked" : needsRepair || knownDeviations.length ? "passed_with_notes" : "passed";

  const result: VisualQaResult = {
    status: blocked ? "blocked" : needsRepair ? "partial" : "passed",
    target: inventory.target,
    inputs_used: [normalizeDisplayPath(options.irPath), normalizeDisplayPath(options.inventoryPath)],
    screenshot_evidence: normalizeScreenshotEvidence(ir, inventory),
    checks,
    repair_actions: repairActions,
    gate_result: {
      verdict,
      ready_allowed: !blocked && !needsRepair,
      known_deviations: knownDeviations,
    },
  };

  const outputPath = resolve(options.outputPath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  return result;
}

function runChecks(ir: LayoutIr, inventory: FigmaInventory): VisualQaCheck[] {
  const computed: VisualQaCheck[] = [
    checkRouteCoherence(ir, inventory),
    checkTextHeight(inventory),
    checkTextOverflow(inventory),
    checkOverlap(ir, inventory),
    checkClipping(ir, inventory),
    checkSafeArea(ir, inventory),
    checkDsInstanceHonesty(ir, inventory),
    {
      check: "density",
      result: "not_applicable",
      evidence: "Density is not quantified in verifier v1.",
    },
    {
      check: "hierarchy",
      result: "not_applicable",
      evidence: "Hierarchy is reviewed by screenshot/manual QA in verifier v1.",
    },
    {
      check: "systemization_regression",
      result: "not_applicable",
      evidence: "No before/after systemization inventory was provided.",
    },
  ];
  const byName = new Map(computed.map((check) => [check.check, check]));
  for (const precomputed of inventory.precomputed_checks ?? []) {
    byName.set(precomputed.check, precomputed);
  }
  return [...byName.values()];
}

function checkRouteCoherence(ir: LayoutIr, inventory: FigmaInventory): VisualQaCheck {
  const inventoryScreens = new Set(inventory.screens.map((screen) => screen.screen_id));
  const missing = ir.route.map((step) => step.screen_id).filter((screenId) => !inventoryScreens.has(screenId));

  if (missing.length) {
    return {
      check: "route_coherence",
      result: "blocked",
      evidence: `Missing route screens in inventory: ${missing.join(", ")}`,
      repair: "Export or create missing screen frames before Figma readiness.",
    };
  }

  return {
    check: "route_coherence",
    result: "passed",
    evidence: `All ${ir.route.length} route steps have matching inventory screens.`,
  };
}

function checkTextHeight(inventory: FigmaInventory): VisualQaCheck {
  const suspicious = visibleNodes(inventory.nodes)
    .filter((node) => node.type === "TEXT")
    .filter((node) => {
      const expected = expectedLineHeight(node);
      return node.height < expected * 0.8;
    });

  if (suspicious.length) {
    return {
      check: "text_height",
      result: "blocked",
      evidence: suspicious.map((node) => `${node.name} (${node.id}) h=${node.height}`).slice(0, 8).join("; "),
      repair: "Recalculate text node height and verify textAutoResize=HEIGHT after final width is set.",
    };
  }

  return {
    check: "text_height",
    result: "passed",
    evidence: "No visible text nodes below 80% of expected line height.",
  };
}

function checkTextOverflow(inventory: FigmaInventory): VisualQaCheck {
  const byId = new Map(inventory.nodes.map((node) => [node.id, node]));
  const overflowing = visibleNodes(inventory.nodes)
    .filter((node) => node.type === "TEXT" && node.parent_id)
    .filter((node) => {
      const parent = byId.get(node.parent_id ?? "");
      return parent ? !contains(parent, node, tolerance) : false;
    });

  if (overflowing.length) {
    return {
      check: "text_overflow",
      result: "blocked",
      evidence: overflowing.map((node) => `${node.name} (${node.id}) outside parent ${node.parent_id}`).slice(0, 8).join("; "),
      repair: "Increase parent Auto Layout size, reduce copy, or move overflow copy to detail state.",
    };
  }

  return {
    check: "text_overflow",
    result: "passed",
    evidence: "All visible text nodes fit within parent bounds.",
  };
}

function checkOverlap(ir: LayoutIr, inventory: FigmaInventory): VisualQaCheck {
  if (!ir.screens.some((screen) => screen.layout_constraints.no_overlap)) {
    return { check: "overlap", result: "not_applicable", evidence: "IR does not require no-overlap checks." };
  }

  const overlaps: string[] = [];
  const nodesByScreen = groupVisibleNodesByScreen(inventory);

  for (const [screenId, nodes] of nodesByScreen) {
    const grouped = groupBy(nodes.filter((node) => node.parent_id), (node) => node.parent_id ?? "");
    for (const siblings of grouped.values()) {
      for (let leftIndex = 0; leftIndex < siblings.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < siblings.length; rightIndex += 1) {
          const left = siblings[leftIndex];
          const right = siblings[rightIndex];
          const area = intersectionArea(left, right);
          const smallArea = Math.max(1, Math.min(left.width * left.height, right.width * right.height));
          if (area > 24 && area / smallArea > 0.18) {
            overlaps.push(`${screenId}: ${left.name} (${left.id}) overlaps ${right.name} (${right.id})`);
          }
        }
      }
    }
  }

  if (overlaps.length) {
    return {
      check: "overlap",
      result: "blocked",
      evidence: overlaps.slice(0, 8).join("; "),
      repair: "Fix Auto Layout gaps/sizing for overlapping siblings.",
    };
  }

  return {
    check: "overlap",
    result: "passed",
    evidence: "No significant visible sibling overlaps found.",
  };
}

function checkClipping(ir: LayoutIr, inventory: FigmaInventory): VisualQaCheck {
  if (!ir.screens.some((screen) => screen.layout_constraints.no_clip)) {
    return { check: "clipping", result: "not_applicable", evidence: "IR does not require no-clip checks." };
  }

  const screenById = new Map(inventory.screens.map((screen) => [screen.screen_id, screen]));
  const clipped = visibleNodes(inventory.nodes)
    .filter((node) => node.screen_id && node.id !== screenById.get(node.screen_id)?.id)
    .filter((node) => {
      const screen = screenById.get(node.screen_id ?? "");
      return screen ? !contains(screen, node, tolerance) : false;
    });

  if (clipped.length) {
    return {
      check: "clipping",
      result: "blocked",
      evidence: clipped.map((node) => `${node.screen_id}: ${node.name} (${node.id}) outside screen`).slice(0, 8).join("; "),
      repair: "Resize screen/container or move overflowing content to another state.",
    };
  }

  return {
    check: "clipping",
    result: "passed",
    evidence: "All visible screen descendants fit within screen bounds.",
  };
}

function checkSafeArea(ir: LayoutIr, inventory: FigmaInventory): VisualQaCheck {
  const failures: string[] = [];
  const byParent = groupBy(visibleNodes(inventory.nodes), (node) => node.parent_id ?? "");
  const screenById = new Map(inventory.screens.map((screen) => [screen.screen_id, screen]));

  for (const screen of ir.screens) {
    const inventoryScreen = screenById.get(screen.id);
    if (!inventoryScreen) continue;

    const topLevelChildren = (byParent.get(inventoryScreen.id) ?? [])
      .filter((node) => node.name.toLowerCase() !== "background")
      .filter((node) => !node.name.toLowerCase().includes("bottom nav"));
    const topMost = Math.min(...topLevelChildren.map((node) => node.y - inventoryScreen.y));
    if (Number.isFinite(topMost) && topMost < ir.viewport.safe_area_top - tolerance) {
      failures.push(`${screen.id}: top content starts at ${topMost}px, safe area ${ir.viewport.safe_area_top}px`);
    }
  }

  if (failures.length) {
    return {
      check: "safe_area",
      result: "blocked",
      evidence: failures.join("; "),
      repair: "Increase screen top padding or move header below safe area.",
    };
  }

  return {
    check: "safe_area",
    result: "passed",
    evidence: "Top-level content respects configured safe area.",
  };
}

function checkDsInstanceHonesty(ir: LayoutIr, inventory: FigmaInventory): VisualQaCheck {
  if (ir.design_system.reuse_honesty === "bespoke_allowed") {
    return { check: "ds_instance_honesty", result: "not_applicable", evidence: "IR allows bespoke UI." };
  }

  if (ir.design_system.reuse_honesty === "local_components_with_deviation") {
    return {
      check: "ds_instance_honesty",
      result: "passed",
      evidence: "IR explicitly records local components with deviation; DS instance reuse is not claimed as passed.",
    };
  }

  const required = ir.component_sources.filter((source) => source.instance_required);
  if (!required.length) {
    return {
      check: "ds_instance_honesty",
      result: "not_applicable",
      evidence: "No component sources require DS instances.",
    };
  }

  const instances = visibleNodes(inventory.nodes).filter((node) => node.type === "INSTANCE" || node.main_component_name);
  const missing = required.filter((source) => !instances.some((node) => matchesComponentSource(node, source.source_ref)));

  if (missing.length) {
    return {
      check: "ds_instance_honesty",
      result: "blocked",
      evidence: `Missing DS instance evidence for: ${missing.map((source) => source.stable_id).join(", ")}`,
      repair: "Use real DS component instances or record a local/bespoke deviation in figma-layout-ir.json.",
    };
  }

  return {
    check: "ds_instance_honesty",
    result: "passed",
    evidence: `Found DS instance evidence for ${required.length} required component sources.`,
  };
}

function normalizeScreenshotEvidence(ir: LayoutIr, inventory: FigmaInventory): VisualQaResult["screenshot_evidence"] {
  const provided = inventory.screenshots ?? [];
  return ir.verification_contract.screenshots_required.map((label) => {
    const match = provided.find((shot) => shot.screen_or_board === label);
    return {
      screen_or_board: label,
      node_id: match?.node_id ?? "",
      asset_id: match?.asset_id ?? "",
      review_status: match?.review_status ?? (match ? "passed" : "blocked"),
      notes: match?.notes ?? (match ? undefined : "Missing screenshot evidence in inventory."),
    };
  });
}

function visibleNodes(nodes: InventoryNode[]): InventoryNode[] {
  return nodes.filter((node) => node.visible !== false && node.width > 0 && node.height > 0);
}

function expectedLineHeight(node: InventoryNode): number {
  return node.line_height_px ?? (node.font_size ? node.font_size * 1.25 : 14);
}

function contains(parent: Bounds, child: Bounds, allowedTolerance: number): boolean {
  return child.x >= parent.x - allowedTolerance
    && child.y >= parent.y - allowedTolerance
    && child.x + child.width <= parent.x + parent.width + allowedTolerance
    && child.y + child.height <= parent.y + parent.height + allowedTolerance;
}

function intersectionArea(left: Bounds, right: Bounds): number {
  const xOverlap = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
  const yOverlap = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
  return xOverlap * yOverlap;
}

function groupVisibleNodesByScreen(inventory: FigmaInventory): Map<string, InventoryNode[]> {
  const result = new Map<string, InventoryNode[]>();
  for (const node of visibleNodes(inventory.nodes)) {
    if (!node.screen_id) continue;
    const nodes = result.get(node.screen_id) ?? [];
    nodes.push(node);
    result.set(node.screen_id, nodes);
  }
  return result;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = result.get(key) ?? [];
    group.push(item);
    result.set(key, group);
  }
  return result;
}

function matchesComponentSource(node: InventoryNode, sourceRef: string): boolean {
  const haystack = [node.main_component_name, node.component_source, node.name].filter(Boolean).join(" ").toLowerCase();
  return sourceRef
    .toLowerCase()
    .split(/[/:#\s]+/)
    .filter(Boolean)
    .some((part) => haystack.includes(part));
}

function normalizeDisplayPath(path: string): string {
  return path.replaceAll("\\", "/");
}

function readStringFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const [irPath, inventoryPath, outputPath] = [
    readStringFlag(args, "--ir") ?? args[0],
    readStringFlag(args, "--inventory") ?? args[1],
    readStringFlag(args, "--out") ?? args[2],
  ];

  if (!irPath || !inventoryPath || !outputPath) {
    throw new Error("Usage: yarn figma:verify-layout --ir figma-layout-ir.json --inventory figma-inventory.json --out figma-visual-qa.json");
  }

  const result = await runFigmaLayoutVerifier({ irPath, inventoryPath, outputPath });
  console.log(`Figma layout QA ${result.gate_result.verdict}: ${outputPath}`);
  if (!result.gate_result.ready_allowed) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
