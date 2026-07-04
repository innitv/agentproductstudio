#!/usr/bin/env node
// PreToolUse (Write|Edit|MultiEdit): блокирует запись в иммутабельные/legacy зоны.
// Рабочие run-каталоги (outputs/**, research/projects/**) НЕ блокируются — workflow пишет туда артефакты.
import { readFileSync } from "node:fs";
import path from "node:path";

let raw = "";
try { raw = readFileSync(0, "utf8"); } catch {}
let data = {};
try { data = JSON.parse(raw || "{}"); } catch {}

const ti = data.tool_input || {};
const fp = ti.file_path || ti.path || "";
if (!fp) process.exit(0);

const root = process.cwd();
const rel = path.relative(root, path.resolve(root, fp)).replaceAll("\\", "/");

// Пути вне проекта не наша забота.
if (rel.startsWith("..")) process.exit(0);

const blockedPrefixes = ["archive/", ".git/", "node_modules/"];
if (process.env.CLAUDE_ALLOW_ARCHIVE_WRITE !== "1") {
  for (const b of blockedPrefixes) {
    if (rel === b.slice(0, -1) || rel.startsWith(b)) {
      process.stderr.write(
        `[guard-write] Запись в защищённую/legacy зону '${rel}' заблокирована. ` +
        `Это archive/иммутабельная область (см. миграцию Codex→Claude). ` +
        `Если правка осознанная — повтори с env CLAUDE_ALLOW_ARCHIVE_WRITE=1.`
      );
      process.exit(2);
    }
  }
}
process.exit(0);
