export interface NormalizedAgenticArtifact {
  content: string;
  warnings: string[];
}

export function ensureAgenticArtifactSections(options: {
  title: string;
  inputs: string[];
  sections: readonly string[];
  modelOutput: string;
}): NormalizedAgenticArtifact {
  const warnings: string[] = [];
  const missingSections = options.sections.filter((section) => !options.modelOutput.includes(section));
  if (!missingSections.length && options.modelOutput.includes("## Inputs Used")) {
    return { content: options.modelOutput.trimEnd() + "\n", warnings };
  }

  if (!options.modelOutput.includes("## Inputs Used")) {
    warnings.push("specialist output did not include ## Inputs Used");
  }

  if (missingSections.length) {
    warnings.push(`specialist output missed required sections: ${missingSections.join(", ")}`);
  }

  const content = [
    options.modelOutput.trim(),
    "",
    options.modelOutput.includes("## Inputs Used")
      ? undefined
      : ["## Inputs Used", "", ...options.inputs.map((input) => `- \`${input}\``), ""].join("\n"),
    ...missingSections.flatMap((section) => [section, "", "Agentic specialist output не включил эту обязательную секцию явно; runtime добавил её для прозрачности валидации.", ""]),
  ].filter(Boolean).join("\n");

  return { content, warnings };
}
