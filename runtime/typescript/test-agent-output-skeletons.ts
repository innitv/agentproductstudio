// Тест согласованности: скелеты Output Contract в промптах агентов против манифеста.
//
// Зачем. `requiredSectionsByArtifact` в `workflow.manifest.ts` — единственный источник
// правды о том, какие секции обязан содержать артефакт стадии; его исполняет
// `validate-workflow-run.ts`. Но субагент видит не манифест, а скелет из своего
// системного промпта (`.claude/agents/<имя>.md`) и контракта
// (`agent-pack/agent-contracts/<имя>.agent.md`). Пока эту связь никто не проверял,
// скелеты молча отставали от манифеста, и агент, выполнивший скелет буквально,
// отдавал артефакт, падающий на `yarn workflow:validate`.
//
// Что именно проверяется. В любом fenced yaml-блоке этих файлов ищутся ключи вида
// `  <artifact_name>: |`, где `<artifact_name>` — значение из `artifactNames`. Если
// под ключом развёрнут скелет (есть хотя бы одна строка `    ## ...`), список его
// секций должен совпадать с манифестом ПОЛНОСТЬЮ и В ТОМ ЖЕ ПОРЯДКЕ.
//
// Чего тест намеренно НЕ требует. Свёрнутый скелет (`screens: |` + `...` без секций)
// ошибкой не считается: файл в этом случае не претендует быть шаблоном и не может
// ввести агента в заблуждение. Ловим расхождение, а не отсутствие.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { artifactFiles, artifactNames, workflowStages } from "./workflow.manifest";

// Как и остальные runtime-проверки, тест запускается из корня репозитория.
const repoRoot = process.cwd();

const scannedDirs = [
  path.join(repoRoot, ".claude", "agents"),
  path.join(repoRoot, "agent-pack", "agent-contracts"),
];

// artifact -> { stageId, sections }
const requiredByArtifact = new Map<string, { stageId: string; sections: readonly string[] }>();
for (const stage of workflowStages) {
  for (const [artifact, sections] of Object.entries(stage.requiredSectionsByArtifact)) {
    if (sections.length === 0) continue;
    requiredByArtifact.set(artifact, { stageId: stage.id, sections });
  }
}

const knownArtifacts = new Set<string>(Object.values(artifactNames));

interface Skeleton {
  file: string;
  artifact: string;
  line: number;
  sections: string[];
}

const yamlBlockStart = /^\s*```ya?ml\s*$/;
const fenceEnd = /^\s*```\s*$/;
const artifactKey = /^ {2}([a-z][a-z0-9_]*):\s*\|.*$/;
const anyKey = /^ {0,2}[a-z][a-z0-9_]*:/;
const sectionLine = /^ {4}(## .+?)\s*$/;

function extractSkeletons(file: string, content: string): Skeleton[] {
  const lines = content.split(/\r?\n/);
  const found: Skeleton[] = [];
  let inYaml = false;
  let current: Skeleton | null = null;

  const closeCurrent = () => {
    if (current) {
      found.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!inYaml) {
      if (yamlBlockStart.test(line)) inYaml = true;
      continue;
    }

    if (fenceEnd.test(line)) {
      closeCurrent();
      inYaml = false;
      continue;
    }

    const keyMatch = line.match(artifactKey);
    if (keyMatch) {
      closeCurrent();
      const artifact = keyMatch[1];
      if (knownArtifacts.has(artifact)) {
        current = { file, artifact, line: i + 1, sections: [] };
      }
      continue;
    }

    if (current) {
      const section = line.match(sectionLine);
      if (section) {
        current.sections.push(section[1]);
        continue;
      }
      // Новый ключ того же или более высокого уровня закрывает скелет.
      if (line.trim().length > 0 && anyKey.test(line)) {
        closeCurrent();
      }
    }
  }

  closeCurrent();
  return found;
}

const errors: string[] = [];
let checkedSkeletons = 0;
let collapsedSkeletons = 0;

for (const dir of scannedDirs) {
  const files = readdirSync(dir).filter((name) => name.endsWith(".md"));
  for (const name of files) {
    const filePath = path.join(dir, name);
    const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
    const skeletons = extractSkeletons(relPath, readFileSync(filePath, "utf8"));

    for (const skeleton of skeletons) {
      const required = requiredByArtifact.get(skeleton.artifact);
      if (!required) continue;

      if (skeleton.sections.length === 0) {
        collapsedSkeletons += 1;
        continue;
      }

      checkedSkeletons += 1;
      const expected = [...required.sections];
      const actual = skeleton.sections;
      if (expected.length === actual.length && expected.every((value, index) => value === actual[index])) {
        continue;
      }

      const missing = expected.filter((section) => !actual.includes(section));
      const extra = actual.filter((section) => !expected.includes(section));
      const details: string[] = [];
      if (missing.length > 0) details.push(`отсутствуют: ${missing.join(", ")}`);
      if (extra.length > 0) details.push(`лишние: ${extra.join(", ")}`);
      if (details.length === 0) details.push(`порядок секций не совпадает с манифестом (ожидается: ${expected.join(" -> ")})`);

      errors.push(
        `${skeleton.file}:${skeleton.line} — скелет ${artifactFiles[skeleton.artifact] ?? skeleton.artifact} ` +
          `(стадия ${required.stageId}) разошёлся с requiredSectionsByArtifact: ${details.join("; ")}`
      );
    }
  }
}

if (errors.length > 0) {
  console.error("Скелеты Output Contract разошлись с runtime/typescript/workflow.manifest.ts:\n");
  for (const error of errors) console.error(`  ERROR: ${error}`);
  console.error(
    "\nПочини скелет в промпте агента (или манифест, если изменение секций намеренное). " +
      "Обёртка — системный промпт, который субагент видит всегда: устаревший скелет напрямую ведёт к падению yarn workflow:validate."
  );
}

assert.deepEqual(errors, []);
// Защита от «тест ничего не нашёл и потому зелёный»: скелеты должны реально парситься.
assert.ok(checkedSkeletons >= 10, `ожидалось минимум 10 развёрнутых скелетов, найдено ${checkedSkeletons}`);

console.log(
  `agent output skeleton tests passed (проверено развёрнутых скелетов: ${checkedSkeletons}, свёрнутых пропущено: ${collapsedSkeletons})`
);
