#!/usr/bin/env node
// PreToolUse (Bash): защита selective-commit policy + опасных git-операций.
// Проверяет ФАКТИЧЕСКИ застейдженные файлы (git diff --cached), а не текст команды,
// поэтому пути во frozen-зонах, упомянутые лишь в commit-сообщении или grep-паттерне,
// НЕ дают ложных срабатываний. Удаления frozen-путей (статус D) НЕ блокируются —
// опасность selective-commit это случайное ДОБАВЛЕНИЕ ledger/evidence, а не чистка.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

let raw = "";
try { raw = readFileSync(0, "utf8"); } catch {}
let data = {};
try { data = JSON.parse(raw || "{}"); } catch {}

const cmd = (data.tool_input && data.tool_input.command) || "";
if (!cmd) process.exit(0);
const cwd = data.cwd || process.cwd();

const block = (msg) => { process.stderr.write(`[guard-bash] ${msg}`); process.exit(2); };

// Префикс frozen ledger путей (проверяем НАЧАЛО реального пути к файлу).
const FROZEN = /^(outputs\/|research\/projects\/|research\/archive\/|siteportfolio\/runs\/|\.lazyweb\/)/;
const allowLedger = process.env.CLAUDE_ALLOW_LEDGER_COMMIT === "1";

// 1. Force push требует явного намерения (это флаг команды, проверка текста тут корректна).
if (/\bgit\s+push\b/.test(cmd) && /(--force\b|--force-with-lease\b|(^|\s)-f(\s|$))/.test(cmd)
    && process.env.CLAUDE_ALLOW_FORCE_PUSH !== "1") {
  block("git push --force заблокирован. Force-push перезаписывает удалённую историю. " +
        "Для осознанного действия повтори с env CLAUDE_ALLOW_FORCE_PUSH=1.");
}

const gitLines = (args) => {
  try {
    return execSync(`git ${args}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  } catch { return null; } // не git-репо / git недоступен → не блокируем (fail-open)
};

// Из `git diff --name-status` берём целевые пути ДОБАВЛЕНИЙ/ИЗМЕНЕНИЙ (A/M/R-target/C-target),
// игнорируя удаления (D) — удаление frozen это чистка, а не риск.
const addedOrModified = (statusLines) => {
  const out = [];
  for (const line of statusLines || []) {
    const parts = line.split(/\t+/);
    const status = parts[0] || "";
    if (status.startsWith("D")) continue;                 // удаление — пропускаем
    const target = (status.startsWith("R") || status.startsWith("C")) ? parts[parts.length - 1] : parts[1];
    if (target) out.push(target.replaceAll("\\", "/"));
  }
  return out;
};

// 2. git add с ЯВНЫМИ frozen-путями в аргументах (ранняя защита; -A/-u/. не трогаем).
if (!allowLedger) {
  const add = cmd.match(/\bgit\s+add\b([^&|;]*)/);
  if (add) {
    const args = add[1].split(/\s+/).filter(Boolean).filter((t) => !t.startsWith("-"));
    const hit = args.map((a) => a.replace(/^["']|["']$/g, "").replaceAll("\\", "/")).find((p) => FROZEN.test(p));
    if (hit) {
      block(`Стейджинг frozen ledger пути '${hit}' заблокирован. Следуй agent-pack/templates/selective-commit-sop.md; ` +
            `для осознанного действия повтори с env CLAUDE_ALLOW_LEDGER_COMMIT=1.`);
    }
  }
}

// 3. git commit: проверяем реально застейдженные ДОБАВЛЕНИЯ/ИЗМЕНЕНИЯ (и tracked при commit -a).
if (!allowLedger && /\bgit\s+commit\b/.test(cmd) && !/--amend\b/.test(cmd)) {
  const staged = addedOrModified(gitLines("diff --cached --name-status"));
  const withAll = /(\s-{1,2}[a-z]*a[a-z]*\b|--all\b)/.test(cmd)
    ? addedOrModified(gitLines("diff --name-status"))
    : [];
  const frozen = [...new Set([...staged, ...withAll])].filter((p) => FROZEN.test(p));
  if (frozen.length) {
    const list = frozen.slice(0, 8).join(", ") + (frozen.length > 8 ? `, … (+${frozen.length - 8})` : "");
    block(`Коммит ДОБАВЛЯЕТ/МЕНЯЕТ frozen ledger пути (outputs/**, research/projects/**, research/archive/**, ` +
          `siteportfolio/runs/**, .lazyweb/**): ${list}. Следуй agent-pack/templates/selective-commit-sop.md, ` +
          `проверь \`yarn git:check-staged\`. Для осознанного коммита повтори с env CLAUDE_ALLOW_LEDGER_COMMIT=1.`);
  }
}

process.exit(0);
