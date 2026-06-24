import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const registryArg = process.argv.indexOf("--registry");
const outputArg = process.argv.indexOf("--out");

function readDesignSystemRegistry() {
  const registryPath = join(root, "design/figma/registry.json");
  if (!existsSync(registryPath)) return undefined;
  return JSON.parse(readFileSync(registryPath, "utf8"));
}

function resolveDefaultRegistryPath() {
  const registry = readDesignSystemRegistry();
  const defaultSlug = registry?.default_system;
  const systems = Array.isArray(registry?.systems) ? registry.systems : [];
  const selected = (defaultSlug && systems.find((system) => system.slug === defaultSlug))
    || (systems.length === 1 ? systems[0] : undefined);
  const path = selected?.paths?.component_contracts;
  if (!path) {
    throw new Error("Укажите --registry <path>. В design/figma/registry.json нет однозначного default_system/component_contracts.");
  }
  return path;
}

const registryPath = resolve(root, registryArg >= 0 ? process.argv[registryArg + 1] : resolveDefaultRegistryPath());

function readToken() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) throw new Error("Не найден .env с FIGMA_API_TOKEN.");
  const env = readFileSync(envPath, "utf8");
  const match = env.match(/^FIGMA_(?:API|ACCESS)_TOKEN=(.+)$/m);
  if (!match?.[1]?.trim()) throw new Error("FIGMA_API_TOKEN/FIGMA_ACCESS_TOKEN отсутствует в .env.");
  return match[1].trim().replace(/^['\"]|['\"]$/g, "");
}

function walk(node, visit) {
  visit(node);
  for (const child of node?.children ?? []) walk(child, visit);
}

function variantInventory(rootNode) {
  const axes = new Map();
  let variants = 0;
  walk(rootNode, (node) => {
    if (node.type !== "COMPONENT") return;
    variants += 1;
    for (const part of String(node.name).split(",")) {
      const separator = part.indexOf("=");
      if (separator < 1) continue;
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      if (!axes.has(key)) axes.set(key, new Set());
      axes.get(key).add(value);
    }
  });
  return {
    variants,
    axes: Object.fromEntries([...axes].map(([key, values]) => [key, [...values].sort()])),
  };
}

function compareContract(contract, nodeRecord) {
  const issues = [];
  if (!nodeRecord?.document) {
    return { status: "blocked", issues: ["Figma node не найден или недоступен."], variants: 0, axes: {} };
  }
  const inventory = variantInventory(nodeRecord.document);
  for (const [axis, expectedValues] of Object.entries(contract.expectedVariants)) {
    const actualValues = inventory.axes[axis];
    if (!actualValues) {
      issues.push(`Отсутствует ось \`${axis}\`.`);
      continue;
    }
    const missing = expectedValues.filter((value) => !actualValues.includes(value));
    const unexpected = actualValues.filter((value) => !expectedValues.includes(value));
    if (missing.length) issues.push(`Ось \`${axis}\`: отсутствуют ${missing.map((v) => `\`${v}\``).join(", ")}.`);
    if (unexpected.length) issues.push(`Ось \`${axis}\`: неожиданные значения ${unexpected.map((v) => `\`${v}\``).join(", ")}.`);
  }
  const sourcePath = resolve(root, contract.codeSource);
  if (!existsSync(sourcePath)) {
    issues.push(`Не найден code source \`${contract.codeSource}\`.`);
  } else {
    const source = readFileSync(sourcePath, "utf8");
    const exportPattern = new RegExp(`(?:export\\s+(?:const|function|class)|export\\s*\\{[^}]*\\b)\\s*${contract.codeExport}\\b`);
    if (!exportPattern.test(source)) issues.push(`В code source не найден экспорт \`${contract.codeExport}\`.`);
  }
  return { status: issues.length ? "needs_revision" : "pass", issues, ...inventory };
}

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const outputPath = resolve(
  root,
  outputArg >= 0
    ? process.argv[outputArg + 1]
    : join(dirname(registryPath), "live-audit.latest.md"),
);
const token = readToken();
const nodeIds = registry.components.map((component) => component.nodeId);
const url = `https://api.figma.com/v1/files/${registry.fileKey}/nodes?ids=${encodeURIComponent(nodeIds.join(","))}`;
const response = await fetch(url, { headers: { "X-Figma-Token": token } });
if (!response.ok) throw new Error(`Figma API вернул ${response.status}: ${await response.text()}`);
const payload = await response.json();
const results = registry.components.map((contract) => ({
  ...contract,
  ...compareContract(contract, payload.nodes?.[contract.nodeId]),
}));
const issueCount = results.reduce((sum, item) => sum + item.issues.length, 0);
const status = results.some((item) => item.status === "blocked")
  ? "blocked"
  : issueCount
    ? "needs_revision"
    : "pass";
const generatedAt = new Date().toISOString();

const lines = [
  "# Live-аудит Figma component contracts",
  "",
  `- Статус: \`${status}\``,
  `- Файл: \`${payload.name ?? registry.fileName ?? registry.fileKey}\` (\`${registry.fileKey}\`)`,
  `- Версия: \`${payload.version ?? "unknown"}\``,
  `- Последнее изменение Figma: \`${payload.lastModified ?? "unknown"}\``,
  `- Проверено: \`${generatedAt}\``,
  `- Code Connect: \`${registry.codeConnectStatus}\` (проверено ${registry.codeConnectCheckedAt ?? "unknown"})`,
  `- Охват: ${results.length} pilot-компонентов; найдено проблем: ${issueCount}`,
  "",
  "## Результаты",
  "",
  "| Component | Node | Variants | Status | Code source |",
  "|---|---:|---:|---|---|",
  ...results.map((item) => `| ${item.name} | \`${item.nodeId}\` | ${item.variants} | \`${item.status}\` | \`${item.codeSource}\` |`),
  "",
  "## Найденные расхождения",
  "",
];
for (const item of results) {
  if (!item.issues.length) continue;
  lines.push(`### ${item.name}`, "", ...item.issues.map((issue) => `- ${issue}`), "");
}
if (!issueCount) lines.push("Расхождений в проверяемом pilot-наборе не найдено.", "");
lines.push(
  "## Ограничения проверки",
  "",
  "- Аудит проверяет live Figma node inventory, variant axes/values и наличие React export.",
  "- Визуальная точность, variable bindings, Auto Layout/resizing, accessibility и browser parity требуют отдельных screenshot/plugin-context проверок.",
  "- `unavailable_plan` означает, что Code Connect не был опубликован: Figma требует Dev/Full seat в Organization/Enterprise.",
);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
writeFileSync(outputPath.replace(/\.md$/i, ".json"), `${JSON.stringify({ generatedAt, status, issueCount, file: { key: registry.fileKey, name: payload.name, version: payload.version, lastModified: payload.lastModified }, codeConnectStatus: registry.codeConnectStatus, results }, null, 2)}\n`, "utf8");
console.log(`Figma audit: ${status}; components=${results.length}; issues=${issueCount}`);
console.log(`Report: ${outputPath}`);
if (status !== "pass") process.exitCode = 2;
