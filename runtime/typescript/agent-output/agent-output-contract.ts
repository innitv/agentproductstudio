import YAML from "js-yaml";
import { validateAgenticOutputEnvelope } from "./schema-validator";

export interface AgenticOutputEnvelope {
  agent_name: string;
  status: "success" | "partial" | "blocked";
  summary: string;
  inputs_used: string[];
  outputs: Record<string, unknown>;
  assumptions: string[];
  risks: string[];
  open_questions: string[];
  recommended_next_step: string;
}

export interface ParsedAgenticOutput {
  envelope?: AgenticOutputEnvelope;
  warnings: string[];
}

export function parseAgenticOutputEnvelope(raw: string): ParsedAgenticOutput {
  const source = extractStructuredAgenticBlock(raw);
  if (!source) {
    return {
      warnings: ["agentic output did not include structured agent output contract; Markdown fallback was used"],
    };
  }

  let parsed: unknown;
  try {
    parsed = source.format === "json" ? JSON.parse(source.content) : YAML.load(source.content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { warnings: [`agent output contract parse failed: ${message}`] };
  }

  const errors = validateAgenticOutputEnvelope(parsed);
  if (errors.length) {
    return { warnings: errors.map((error) => `agent output contract invalid: ${error}`) };
  }

  return { envelope: parsed as AgenticOutputEnvelope, warnings: [] };
}

export function hasArtifactOutput(envelope: AgenticOutputEnvelope, artifactName: string, fileName: string): boolean {
  return Boolean(envelope.outputs[artifactName] ?? envelope.outputs[fileName]);
}

export function resolveArtifactContent(
  raw: string,
  envelope: AgenticOutputEnvelope | undefined,
  artifactName: string,
  fileName: string,
): string {
  if (!envelope) {
    return raw;
  }

  const direct = envelope.outputs[artifactName] ?? envelope.outputs[fileName];
  if (typeof direct === "string") {
    return direct;
  }

  if (direct) {
    return [
      `# ${fileName}`,
      "",
      "## Inputs Used",
      "",
      ...envelope.inputs_used.map((input) => `- \`${input}\``),
      "",
      "## Agent Output",
      "",
      "```json",
      JSON.stringify(direct, null, 2),
      "```",
      "",
    ].join("\n");
  }

  return [
    `# ${fileName}`,
    "",
    "## Inputs Used",
    "",
    ...envelope.inputs_used.map((input) => `- \`${input}\``),
    "",
    "## Summary",
    "",
    envelope.summary,
    "",
    "## Risks",
    "",
    ...envelope.risks.map((risk) => `- ${risk}`),
    "",
    "## Open Questions",
    "",
    ...envelope.open_questions.map((question) => `- ${question}`),
    "",
  ].join("\n");
}

function extractStructuredAgenticBlock(raw: string): { format: "json" | "yaml"; content: string } | undefined {
  const jsonBlock = raw.match(/```(?:agent-output-json|artifact-json|json)\r?\n([\s\S]*?)\r?\n```/);
  if (jsonBlock?.[1]?.trim()) {
    return { format: "json", content: jsonBlock[1].trim() };
  }

  const yamlBlock = raw.match(/```(?:agent-output-yaml|yaml|yml)\r?\n([\s\S]*?)\r?\n```/);
  if (yamlBlock?.[1]?.trim()) {
    return { format: "yaml", content: yamlBlock[1].trim() };
  }

  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (frontmatter?.[1]?.trim()) {
    return { format: "yaml", content: frontmatter[1].trim() };
  }

  return undefined;
}
