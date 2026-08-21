import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { artifactFiles } from "./workflow.manifest";

/**
 * ─── ЗАПИСЬ ГЕЙТА ПОКАЗА ЧЕЛОВЕКУ ────────────────────────────────────────────
 *
 * Гейты `7.5` (макеты), `8.5a` (витрина) и `8.5b` собранная страница объявлены в
 * `CLAUDE.md` §5 нерушимыми, а `validateHumanReviewGates` требует строку
 * `human_review: <точка>` в `stage-gate-ledger.md`. Проверка работала, механизма
 * записи не было — строку ставили руками.
 *
 * 🔴 Результат измерен аудитом 2026-08-17: строки не оказалось НИ В ОДНОМ из
 * десяти активных прогонов, то есть 20 ошибок валидатора из 271 — ровно этот
 * класс. Три прогона подряд дисциплина не удержалась, поэтому запись переносится
 * из привычки в команду: `yarn workflow:human-review <run-dir> <gate>`.
 *
 * Почему отдельный модуль, а не строка в CLI: запись должна быть доступна и
 * движку (когда показ выполняется внутри стадии), и тесту — как `approval-gate`.
 *
 * 🔴 Валидатор требует все три точки, но по разным условиям: `8.5a`/`8.5b` —
 * после отработавшей `08-frontend`, `7.5` — когда носитель экранов Figma, и
 * носитель определяется по факту (наличие `figma-layout-ir.json` в каталоге
 * run). Проверка 7.5 заведена 2026-08-21: до неё строки "7.5" в валидаторе не
 * было вовсе, хотя команда записи существовала с 08-17, а `CLAUDE.md` §5
 * объявлял точку нерушимой. Расхождение «правило есть, проверки нет» держалось
 * четыре дня и три Figma-прогона.
 */

/** Точки показа человеку. Совпадают с тем, что ищет валидатор. */
export const humanReviewGates = ["7.5", "8.5a", "8.5b"] as const;

export type HumanReviewGate = (typeof humanReviewGates)[number];

/** Что означает каждая точка — попадает в справку CLI и в текст ошибки. */
export const humanReviewGateTitles: Record<HumanReviewGate, string> = {
  "7.5": "макеты показаны человеку (носитель Figma)",
  "8.5a": "витрина состояний показана человеку (Storybook)",
  "8.5b": "собранная страница показана человеку (dev-сервер)",
};

export interface HumanReviewRecord {
  gate: HumanReviewGate;
  /** Что именно показали: ссылка на файл, узел, роут. */
  shown?: string;
  /** Замечания человека. Пустая строка запрещена — см. разбор ниже. */
  notes: string;
  /** Кто показывал. По умолчанию — оркестратор. */
  by?: string;
  /** Дата в формате YYYY-MM-DD. По умолчанию — сегодня. */
  date?: string;
}

export function assertHumanReviewGate(value: string): asserts value is HumanReviewGate {
  if (!(humanReviewGates as readonly string[]).includes(value)) {
    throw new Error(
      `Неизвестная точка показа: ${value}. Допустимые: ${humanReviewGates.join(", ")}.`,
    );
  }
}

/**
 * Строка записи. Формат совпадает с тем, что ищет `validateHumanReviewGates`
 * регуляркой `human_review:\s*<точка>` — при правке формата править обе стороны.
 */
export function formatHumanReviewLine(record: HumanReviewRecord): string {
  const date = record.date ?? new Date().toISOString().slice(0, 10);
  const by = record.by ?? "orchestrator";
  const shown = record.shown ? ` показано: ${record.shown};` : "";
  return `- \`human_review: ${record.gate}\` | ${date} | ${by} |${shown} замечания: ${record.notes}`;
}

/**
 * Дописывает запись о показе в `stage-gate-ledger.md`.
 *
 * 🔴 Пустые замечания не принимаются. «Молчание выходом не является» — правило
 * `claude-operating-rules.md` §6.1: если человек не сказал ничего, это не
 * «замечаний нет», а «показ не подтверждён». Хочешь записать отсутствие
 * замечаний — так и напиши словами, это осознанное утверждение.
 */
export function recordHumanReview(outputDir: string, record: HumanReviewRecord): string {
  if (!record.notes.trim()) {
    throw new Error(
      "Пустые замечания не принимаются: молчание человека выходом не является. " +
        'Напиши, что он сказал, либо явно: --notes "замечаний нет".',
    );
  }

  const ledgerPath = join(outputDir, artifactFiles.stage_gate_ledger);
  if (!existsSync(ledgerPath)) {
    throw new Error(`Нет файла ${artifactFiles.stage_gate_ledger} в ${outputDir}.`);
  }

  const ledger = readFileSync(ledgerPath, "utf8");
  const line = formatHumanReviewLine(record);

  /*
   * Повторный показ — законное событие: человек посмотрел, вернул замечания, ему
   * показали снова. Поэтому строки НЕ перезаписываются, а копятся: история
   * заходов и есть то, что читает `yarn workflow:retro`.
   */
  const heading = "## Human Review";
  const next = ledger.includes(heading)
    ? ledger.replace(heading, `${heading}\n\n${line}`)
    : `${ledger.trimEnd()}\n\n${heading}\n\n${line}\n`;

  writeFileSync(ledgerPath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  return line;
}
