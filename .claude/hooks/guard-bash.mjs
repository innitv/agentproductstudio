#!/usr/bin/env node
// PreToolUse (Bash): зеркалит selective-commit policy и блокирует опасные git-операции.
// Не мешает обычным командам (yarn, ls, git status/diff/log).
import { readFileSync } from "node:fs";

let raw = "";
try { raw = readFileSync(0, "utf8"); } catch {}
let data = {};
try { data = JSON.parse(raw || "{}"); } catch {}

const cmd = (data.tool_input && data.tool_input.command) || "";
if (!cmd) process.exit(0);

const block = (msg) => { process.stderr.write(`[guard-bash] ${msg}`); process.exit(2); };

// 1. Force push требует явного намерения.
if (/\bgit\s+push\b/.test(cmd) && /(--force\b|--force-with-lease\b|(^|\s)-f(\s|$))/.test(cmd)
    && process.env.CLAUDE_ALLOW_FORCE_PUSH !== "1") {
  block("git push --force заблокирован. Force-push перезаписывает удалённую историю. " +
        "Для осознанного действия повтори с env CLAUDE_ALLOW_FORCE_PUSH=1.");
}

// 2. Стейджинг/коммит frozen ledger путей — только через selective-commit-sop.
const ledger = /(outputs\/|research\/projects\/|research\/archive\/|siteportfolio\/runs\/|\.lazyweb\/)/;
if (/\bgit\s+(add|commit)\b/.test(cmd) && ledger.test(cmd)
    && process.env.CLAUDE_ALLOW_LEDGER_COMMIT !== "1") {
  block("Стейджинг/коммит frozen ledger путей (outputs/**, research/projects/**, research/archive/**, " +
        "siteportfolio/runs/**, .lazyweb/**) заблокирован. Следуй agent-pack/templates/selective-commit-sop.md, " +
        "проверь `yarn git:check-staged`. Для осознанного коммита повтори с env CLAUDE_ALLOW_LEDGER_COMMIT=1.");
}

process.exit(0);
