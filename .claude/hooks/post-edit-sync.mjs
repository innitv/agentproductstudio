#!/usr/bin/env node
// PostToolUse (Write|Edit|MultiEdit): напоминает синхронизировать run ledger после правок артефактов.
import { readFileSync } from "node:fs";

let raw = "";
try { raw = readFileSync(0, "utf8"); } catch {}
let data = {};
try { data = JSON.parse(raw || "{}"); } catch {}

const ti = data.tool_input || {};
const fp = (ti.file_path || ti.path || "").replaceAll("\\", "/");
if (!fp) process.exit(0);

const m = fp.match(/(outputs\/[^/]+\/\d{4}-\d{2}-\d{2}|research\/projects\/[^/]+\/\d{4}-\d{2}-\d{2})/);
if (m && !fp.includes("/temp/")) {
  process.stdout.write(
    `[workflow] Изменён артефакт в run-каталоге ${m[1]}. ` +
    `После правок синхронизируй состояние: \`yarn workflow:sync ${m[1]}\` ` +
    `и обнови handoff-bundle.md / stage-gate-ledger.md.`
  );
}
process.exit(0);
