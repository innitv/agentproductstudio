#!/usr/bin/env node
// PreToolUse (Bash): защита selective-commit policy + опасных git-операций.
//
// Три проверки, и они РАЗНОЙ природы — знать до отладки ложных срабатываний:
//   1. force push  — по ТЕКСТУ команды (это флаг, иначе его не увидеть);
//   2. git add с явными frozen-путями — по ТЕКСТУ аргументов (ранняя защита до стейджинга);
//   3. git commit  — по ФАКТИЧЕСКИ застейдженным файлам (`git diff --cached`), поэтому путь,
//      упомянутый лишь в commit-сообщении, здесь ложных срабатываний не даёт.
//
// Следствие проверок 1-2: строка вида `git add outputs/...` или `git push --force`
// заблокирует команду, даже если она стоит внутри `echo` или grep-паттерна. Это осознанный
// fail-closed: защита важнее удобства цитирования. Нужен такой текст в команде — используй
// env-обход (CLAUDE_ALLOW_LEDGER_COMMIT / _FORCE_PUSH) или не пиши команду целиком в аргументе.
//
// ИСКЛЮЧЕНИЕ — текст сообщения коммита (исправлено 2026-07-25). Сообщение коммита это ДАННЫЕ,
// а не команда: оно уходит в stdin/аргумент git и никогда не исполняется. Раньше проверки 1-2
// читали его наравне с командой, поэтому нельзя было написать в сообщении пример пути к
// run-артефакту или упомянуть `git push --force` — коммит блокировался, и изменения нельзя
// было честно задокументировать. Теперь перед текстовыми проверками из команды вырезаются:
//   - тела heredoc, объявленных в строке с `git commit` (`git commit -F - <<'EOF' … EOF`);
//   - значения `-m`/`--message`, если в команде есть `git commit`.
// Тела heredoc, НЕ принадлежащих `git commit` (например `bash <<'EOF' … EOF`), не вырезаются:
// там содержимое исполняется, и ослабление проверки было бы дырой. Проверка 3 не затронута —
// она и раньше смотрела на реально застейдженные файлы, а не на текст.
//
// Удаления frozen-путей (статус D) НЕ блокируются — опасность selective-commit это
// случайное ДОБАВЛЕНИЕ ledger/evidence, а не чистка.
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

/**
 * Вырезает тела heredoc, объявленных в строке с `git commit`.
 * Сама строка команды сохраняется (без маркера `<<DELIM`), поэтому `git add` или `--force`,
 * стоящие рядом с heredoc в той же строке, по-прежнему видны проверкам 1-2.
 * Heredoc любой другой команды (`bash <<EOF`, `sh <<EOF`) остаётся нетронутым: его содержимое
 * исполняется, и прятать в нём `git add outputs/...` нельзя.
 */
const stripCommitHeredocBodies = (text) => {
  const lines = text.split(/\r?\n/);
  const kept = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const marker = line.match(/<<-?\s*(["']?)([A-Za-z_][A-Za-z0-9_]*)\1/);
    if (!marker || !/\bgit\s+commit\b/.test(line)) {
      kept.push(line);
      continue;
    }

    kept.push(line.slice(0, marker.index) + line.slice(marker.index + marker[0].length));
    const delimiter = marker[2];
    i += 1;
    while (i < lines.length && lines[i].trim() !== delimiter) i += 1; // тело сообщения — данные
  }
  return kept.join("\n");
};

/** Вырезает значение `-m`/`--message`, если в команде есть `git commit`. */
const stripCommitMessageArgs = (text) => (
  /\bgit\s+commit\b/.test(text)
    ? text.replace(/(^|\s)(-m|--message)(=|\s+)("(?:[^"\\]|\\.)*"|'[^']*')/g, '$1$2$3""')
    : text
);

// Текст для проверок 1-2: команда без сообщения коммита.
const scanned = stripCommitMessageArgs(stripCommitHeredocBodies(cmd));

// Префикс frozen ledger путей (проверяем НАЧАЛО реального пути к файлу).
//
// Для `outputs/` блокируем ТОЛЬКО вложенные каталоги (`outputs/<slug>/...`) — это run-артефакты,
// они в .gitignore и версионироваться не должны. Файлы В КОРНЕ `outputs/` — наоборот,
// инфраструктура индекса: `registry.json` (навигационный индекс, с 2026-07-25 ведётся runtime,
// см. runtime/typescript/outputs-registry.ts), `README.md`, `.gitkeep`. Они отслеживаются git,
// то есть их изменения ОБЯЗАНЫ попадать в коммит; блокировать их — ложное срабатывание.
// Паттерны research/* изначально указывают на подкаталоги и этой проблемы не имели.
const FROZEN = /^(outputs\/[^/]+\/|research\/projects\/|research\/archive\/|siteportfolio\/runs\/|\.lazyweb\/)/;
const allowLedger = process.env.CLAUDE_ALLOW_LEDGER_COMMIT === "1";

// 1. Force push требует явного намерения (это флаг команды, проверка текста тут корректна).
if (/\bgit\s+push\b/.test(scanned) && /(--force\b|--force-with-lease\b|(^|\s)-f(\s|$))/.test(scanned)
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
  const add = scanned.match(/\bgit\s+add\b([^&|;]*)/);
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
if (!allowLedger && /\bgit\s+commit\b/.test(scanned) && !/--amend\b/.test(scanned)) {
  const staged = addedOrModified(gitLines("diff --cached --name-status"));
  const withAll = /(\s-{1,2}[a-z]*a[a-z]*\b|--all\b)/.test(scanned)
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
