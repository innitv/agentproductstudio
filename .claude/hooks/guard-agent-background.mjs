#!/usr/bin/env node
// PreToolUse (matcher: Agent|Task): запрет фонового делегирования.
//
// ПОВОД (замер 2026-08-30/31, разбор — docs/architecture/delegation-lessons.md §5).
// Процесс Claude Code в этой среде живёт ровно ОДИН ход: он завершается, как только
// оркестратор отдаёт финальный ответ человеку. Фоновый субагент умирает вместе с ним.
// Замерено: три фоновых research-агента погибли дважды подряд, одновременно, потеряв
// ~40 минут работы каждый (последние записи 14:18:03 / 14:18:35 / 14:20:49 — конец
// процесса, поднятого в 14:01). Синхронный агент той же задачи отработал 27 минут и
// вернул результат. Подтверждение механики — по одному снапшоту на запуск процесса в
// ~/.claude/shell-snapshots/: за одну логическую сессию их пять.
//
// Иллюзия непрерывности возникает потому, что транскрипт сессии один и целый: контекст
// оркестратора восстанавливается, и «агент работает в фоне» выглядит правдой. Поэтому
// правило не держится на внимании — нужна машинная проверка.
//
// ПРАВИЛО: делегировать только синхронно, `run_in_background: false`. Отсутствие поля
// блокируется наравне с `true`: по умолчанию Agent tool уходит в фон, то есть молчаливый
// вызов — это ровно тот случай, который теряет работу.
//
// ОБХОД: env CLAUDE_ALLOW_BACKGROUND_AGENT=1 — для осознанного запуска, который не жалко
// потерять (или если среда изменилась и процесс переживает ход; тогда сначала перепроверь
// факт по shell-snapshots и обнови §5, а не живи на обходе).
import { readFileSync } from "node:fs";

let raw = "";
try { raw = readFileSync(0, "utf8"); } catch {}
let data = {};
try { data = JSON.parse(raw || "{}"); } catch {}

const tool = data.tool_name ?? "";
// Matcher уже сузил вызовы, но хук обязан быть корректен и при прямом запуске.
if (tool && !/^(Agent|Task)$/i.test(tool)) process.exit(0);

if (process.env.CLAUDE_ALLOW_BACKGROUND_AGENT === "1") process.exit(0);

const input = data.tool_input ?? {};
if (input.run_in_background === false) process.exit(0);

const declared = input.run_in_background === undefined
  ? "поле run_in_background не передано (Agent tool уходит в фон по умолчанию)"
  : `run_in_background = ${JSON.stringify(input.run_in_background)}`;

const label = typeof input.description === "string" && input.description.trim()
  ? ` «${input.description.trim()}»`
  : "";

process.stderr.write(
  `[guard-agent-background] Фоновое делегирование заблокировано: ${declared}.\n` +
  `Субагент${label} не переживёт конец твоего хода — процесс Claude Code живёт один ход, ` +
  `и агент погибнет в момент, когда ты ответишь человеку (замер: docs/architecture/delegation-lessons.md §5).\n` +
  `Что делать: повтори вызов с run_in_background: false; раздроби задачу так, чтобы агент уложился ` +
  `в один ход; в Delegation Packet потребуй «пиши на диск после каждого пункта, не копи в контексте».\n` +
  `Осознанный фоновый запуск, результат которого не жалко потерять: env CLAUDE_ALLOW_BACKGROUND_AGENT=1.`,
);
process.exit(2);
