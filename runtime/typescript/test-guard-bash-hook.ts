// Регрессионный тест хука `.claude/hooks/guard-bash.mjs` — обе стороны защиты.
//
// Зачем. Хук ловит две вещи по ТЕКСТУ команды (force push и `git add` frozen-пути) и одну
// по факту стейджа. Текстовые проверки читали и сообщение коммита, поэтому нельзя было
// написать в сообщении пример пути к run-артефакту: коммит блокировался, и изменение
// нельзя было честно задокументировать. Исправление вырезает сообщение коммита из текста,
// который видят проверки 1-2.
//
// Ошибка тут двусторонняя, и тест обязан держать обе стороны:
//   - ослабить лишнее → вернётся ложное срабатывание (кейсы `pass`);
//   - ослабить слишком много → реальный стейджинг ledger перестанет блокироваться, а это
//     ровно тот инцидент, ради которого хук написан (кейсы `block`).
// Отдельно закреплено, что heredoc НЕ для `git commit` (`bash <<EOF`) по-прежнему проверяется:
// его содержимое исполняется, и прятать там `git add` нельзя.
//
// Изоляция: хук запускается как отдельный процесс со stdin-JSON; git-операций не выполняется.
// Frozen-пути собираются из частей, чтобы литерал не попал в аргументы запуска самого теста.

import { spawnSync } from "node:child_process";
import { join } from "node:path";

const repoRoot = process.cwd();
const hookPath = join(repoRoot, ".claude", "hooks", "guard-bash.mjs");

const frozenOutputs = ["outputs", "demo-product", "2026-07-25", "qa-report.md"].join("/");
const frozenResearch = ["research", "projects", "demo-research", "2026-07-25", "research-summary.md"].join("/");

interface HookCase {
  name: string;
  expect: "pass" | "block";
  command: string;
}

const cases: HookCase[] = [
  {
    name: "сообщение коммита в heredoc с примером frozen-пути",
    expect: "pass",
    command: `git commit -F - <<'EOF'\nПравка хука\n\nПример из документации: \`git add ${frozenOutputs}\`\nEOF`,
  },
  {
    name: "сообщение коммита в -m с примером frozen-пути",
    expect: "pass",
    command: `git commit -m "документирую пример: git add ${frozenOutputs}"`,
  },
  {
    name: "сообщение коммита упоминает git push --force",
    expect: "pass",
    command: "git commit -F - <<'EOF'\nЗапрет git push --force описан в хуке\nEOF",
  },
  {
    name: "git add frozen-пути outputs в аргументах",
    expect: "block",
    command: `git add ${frozenOutputs}`,
  },
  {
    name: "git add frozen-пути research в аргументах",
    expect: "block",
    command: `git add ${frozenResearch}`,
  },
  {
    name: "git add frozen-пути перед commit с heredoc в той же строке",
    expect: "block",
    command: `git add ${frozenOutputs} && git commit -F - <<'EOF'\nсообщение\nEOF`,
  },
  {
    name: "git push --force",
    expect: "block",
    command: "git push --force origin main",
  },
  {
    name: "heredoc не для commit (bash <<EOF) с git add frozen внутри",
    expect: "block",
    command: `bash <<'EOF'\ngit add ${frozenOutputs}\nEOF`,
  },
  {
    name: "git add по безопасному пути",
    expect: "pass",
    command: "git add docs/architecture/repo-map.md",
  },
];

const failures: string[] = [];

for (const hookCase of cases) {
  const result = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({ tool_input: { command: hookCase.command }, cwd: repoRoot }),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_ALLOW_LEDGER_COMMIT: "", CLAUDE_ALLOW_FORCE_PUSH: "" },
  });

  const actual = result.status === 2 ? "block" : "pass";
  if (actual !== hookCase.expect) {
    failures.push(
      `${hookCase.name}: ожидалось ${hookCase.expect}, получено ${actual} (exit=${result.status})` +
        `${result.stderr.trim() ? ` | stderr: ${result.stderr.trim()}` : ""}`,
    );
  }
}

if (failures.length) {
  throw new Error(`guard-bash hook regression failed:\n- ${failures.join("\n- ")}`);
}

console.log(`guard-bash hook regression tests passed (${cases.length} cases)`);
