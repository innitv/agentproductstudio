import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  assertHumanReviewGate,
  formatHumanReviewLine,
  humanReviewGates,
  recordHumanReview,
} from "./human-review-gate";
import { artifactFiles } from "./workflow.manifest";

/**
 * Тест механизма записи гейта показа человеку.
 *
 * 🔴 Главное, что здесь сторожится, — СОВПАДЕНИЕ ФОРМАТА записи с регуляркой
 * валидатора (`validateHumanReviewGates` ищет `human_review:\s*<точка>`). Формат
 * задан в двух местах, и это единственная связь, которая может молча разъехаться:
 * поменяешь строку в `formatHumanReviewLine` — валидатор перестанет её видеть, а
 * прогон будет выглядеть незакрытым при выполненном показе.
 */

interface TestCase {
  name: string;
  run: () => Promise<void>;
}

let tempDir = "";

/** Та же регулярка, что в `validate-workflow-run.ts` — сознательная копия для сверки. */
function validatorSees(ledger: string, point: string): boolean {
  return new RegExp(`human_review:\\s*${point.replace(".", "\\.")}(?![0-9])`).test(ledger);
}

async function ledgerWith(body: string): Promise<string> {
  const path = join(tempDir, artifactFiles.stage_gate_ledger);
  await writeFile(path, body, "utf8");
  return path;
}

const testCases: TestCase[] = [
  {
    name: "запись видна регуляркой валидатора по всем точкам",
    run: async () => {
      for (const gate of humanReviewGates) {
        await ledgerWith("# Stage Gate Ledger\n");
        recordHumanReview(tempDir, { gate, notes: "замечаний нет" });
        const ledger = await readFile(join(tempDir, artifactFiles.stage_gate_ledger), "utf8");
        if (!validatorSees(ledger, gate)) {
          throw new Error(`валидатор не увидит запись точки ${gate}: ${ledger}`);
        }
      }
    },
  },
  {
    name: "пустые замечания отклоняются: молчание выходом не является",
    run: async () => {
      await ledgerWith("# Stage Gate Ledger\n");
      let failed = false;
      try {
        recordHumanReview(tempDir, { gate: "8.5a", notes: "   " });
      } catch {
        failed = true;
      }
      if (!failed) throw new Error("пустые замечания приняты, а не должны");
    },
  },
  {
    name: "повторный показ добавляет строку, а не заменяет прежнюю",
    run: async () => {
      await ledgerWith("# Stage Gate Ledger\n");
      recordHumanReview(tempDir, { gate: "8.5b", notes: "ритм секций сбит", date: "2026-08-17" });
      recordHumanReview(tempDir, { gate: "8.5b", notes: "принято", date: "2026-08-18" });
      const ledger = await readFile(join(tempDir, artifactFiles.stage_gate_ledger), "utf8");
      const lines = ledger.split("\n").filter((line) => line.includes("human_review: 8.5b"));
      if (lines.length !== 2) {
        throw new Error(`ожидались две записи истории, найдено ${lines.length}`);
      }
      if (!ledger.includes("ритм секций сбит")) {
        throw new Error("первый заход перезаписан — история заходов потеряна");
      }
    },
  },
  {
    name: "отсутствие ledger — внятная ошибка, а не молчаливая запись",
    run: async () => {
      const empty = await mkdtemp(join(tmpdir(), "human-review-"));
      let message = "";
      try {
        recordHumanReview(empty, { gate: "7.5", notes: "показано" });
      } catch (error) {
        message = error instanceof Error ? error.message : String(error);
      } finally {
        await rm(empty, { force: true, recursive: true });
      }
      if (!message.includes(artifactFiles.stage_gate_ledger)) {
        throw new Error(`ошибка не называет отсутствующий файл: ${message}`);
      }
    },
  },
  {
    name: "неизвестная точка показа отклоняется",
    run: async () => {
      let failed = false;
      try {
        assertHumanReviewGate("9.9");
      } catch {
        failed = true;
      }
      if (!failed) throw new Error("принята точка, которой нет в списке");
    },
  },
  {
    name: "строка несёт дату, автора и предмет показа",
    run: async () => {
      const line = formatHumanReviewLine({
        by: "Иван Игнатов",
        date: "2026-08-17",
        gate: "8.5a",
        notes: "тени на кнопках",
        shown: "Storybook, история vr-page",
      });
      for (const part of ["2026-08-17", "Иван Игнатов", "Storybook", "тени на кнопках"]) {
        if (!line.includes(part)) throw new Error(`в строке нет «${part}»: ${line}`);
      }
    },
  },
];

async function main(): Promise<void> {
  let failures = 0;
  tempDir = await mkdtemp(join(tmpdir(), "human-review-gate-"));

  try {
    for (const testCase of testCases) {
      try {
        await testCase.run();
        console.log(`ok - ${testCase.name}`);
      } catch (error) {
        failures += 1;
        console.error(`FAIL - ${testCase.name}`);
        console.error(error instanceof Error ? error.message : String(error));
      }
    }
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }

  if (failures > 0) {
    console.error(`human review gate tests failed: ${failures}`);
    process.exit(1);
  }

  console.log(`human review gate tests passed (${testCases.length})`);
}

void main();
