// Тест ретро-разбора run.
//
// Работает на временной фикстуре `<tmpdir>/retro-run/...`, реальный `outputs/` не
// трогает — как `test-outputs-registry.ts`. Реальные run архивируются и переезжают,
// тест, привязанный к конкретному каталогу, умрёт вместе с ним.
//
// Что закрывается каждым кейсом:
//   - датированный `##` считается заходом, недатированный и внутри fenced-блока — нет
//     (ложный заход завышает главную метрику и обесценивает её);
//   - маркер `<!-- retro: found_by=... -->` перекрывает эвристику, а мусорное значение
//     маркера — не перекрывает (иначе опечатка молча даёт неверный канал);
//   - эвристика отдаёт приоритет дорогому каналу: «фидбэк с живого демо» — это
//     `user_device`, хотя в тексте есть и слово «фидбэк»;
//   - таблицы ledger читаются, даже когда разорваны пустыми строками (в живом ledger
//     `contractor-payment-demo` «Approval Records» состоит из трёх кусков);
//   - слепые зоны: пустой `inputs_used` и `attempts` меньше числа заходов.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectRunRetro, formatRunRetro } from "./run-retro";

const root = mkdtempSync(join(tmpdir(), "retro-run-"));
const runDir = join(root, "outputs", "fixture-product", "2026-07-01");

try {
  mkdirSync(join(runDir, "stage-results"), { recursive: true });

  writeFileSync(
    join(runDir, "run-meta.json"),
    JSON.stringify({
      project_slug: "fixture-product",
      run_date: "2026-07-01",
      workflow_profile: "reference",
      workflow_scale: "increment",
      status: "completed",
      created_at: "2026-07-01T00:00:00.000Z",
      updated_at: "2026-07-03T00:00:00.000Z",
    }),
  );

  writeFileSync(
    join(runDir, "run-state.json"),
    JSON.stringify({
      stages: {
        "08-frontend": { id: "08-frontend", status: "completed", attempts: 1 },
        "11-qa": { id: "11-qa", status: "completed", attempts: 1 },
      },
    }),
  );

  // Стадия завершена, но входы не записаны — слепая зона ledger.
  writeFileSync(
    join(runDir, "stage-results", "08-frontend.json"),
    JSON.stringify({ stage_id: "08-frontend", status: "completed", inputs_used: [] }),
  );
  writeFileSync(
    join(runDir, "stage-results", "11-qa.json"),
    JSON.stringify({ stage_id: "11-qa", status: "completed", inputs_used: ["frontend-result.md"] }),
  );

  writeFileSync(
    join(runDir, "frontend-result.md"),
    [
      "# Frontend Result",
      "",
      "## Правки по фидбэку с живого демо (2026-07-02)",
      "Пять багов, найденных на телефоне.",
      "",
      "## Правки экранов банка (2026-07-02, второй заход)",
      "<!-- retro: pass=2 found_by=qa -->",
      "Маркер обязан перекрыть эвристику.",
      "",
      "## Правка с мусорным маркером (2026-07-02)",
      "<!-- retro: found_by=telepathy -->",
      "Мусорное значение маркера игнорируется, канал берётся эвристикой.",
      "",
      "## Changed Files",
      "Заголовок без даты заходом не является.",
      "",
      "```md",
      "## Пример внутри блока (2026-07-02)",
      "```",
      "",
    ].join("\n"),
  );

  writeFileSync(
    join(runDir, "qa-report.md"),
    ["# QA Report", "", "## Summary", "Заходов нет.", ""].join("\n"),
  );

  // Хроника, которую ведут в run ledger, а не в артефакте стадии: так выглядит прогон,
  // целиком прошедший в Figma. До 2026-08-11 такие заходы метрика не видела вовсе.
  writeFileSync(
    join(runDir, "HANDOFF.md"),
    [
      "# Handoff",
      "",
      "## Состояние после сессии 2026-07-03 (первый показ)",
      "Собрано и показано.",
      "",
      "## Состояние после сессии 2026-07-04 (переделка после показа)",
      "<!-- retro: found_by=user_review -->",
      "Владелец отклонил манеру целиком.",
      "",
      "## Состав пакета",
      "Заголовок без даты заходом не является.",
      "",
    ].join("\n"),
  );

  writeFileSync(
    join(runDir, "stage-gate-ledger.md"),
    [
      "# Stage Gate Ledger",
      "",
      "## Stage Status",
      "",
      "| Stage | Owner | Required artifacts | Status | Gate notes |",
      "|---|---|---|---|---|",
      "| 01-research | research | research pack | ⏭️ `skipped_by_scale` | Scale increment |",
      "| 08-frontend | frontend | `frontend-result.md` | ✅ completed | — |",
      "",
      "## Approval Records",
      "",
      "| Время | Действие | Target | Решение | Записал |",
      "|---|---|---|---|---|",
      "| 2026-07-01 | Уточнение бренда | UI-текст | Одобрено | Пользователь |",
      "",
      "| 2026-07-03 | **deploy** | Vercel | Выполнено владельцем вне записанного approval | Release, восстановлено постфактум |",
      "",
      "## Process Deviations",
      "",
      "| # | Отклонение | Причина | Статус |",
      "|---|---|---|---|",
      "| 1 | Reference написан оркестратором | Субагент не видит картинки | Осознанное |",
      "| 2 | `deploy` без предварительной записи approval | Действие выполнял владелец | Зафиксировано постфактум |",
      "",
      "## Validation Runs",
      "",
      "| Время | Команда | Результат | Notes |",
      "|---|---|---|---|",
      "| 2026-07-01 | `workflow:start` | failed | Ожидаемо |",
      "| 2026-07-03 | `workflow:validate` | 12 errors, 3 warnings | Остаток |",
      "",
    ].join("\n"),
  );

  const report = collectRunRetro(runDir);

  // --- Метрика 1: заходы -----------------------------------------------------
  const frontendPasses = report.passes.filter((pass) => pass.stage_id === "08-frontend");
  assert.equal(
    frontendPasses.length,
    3,
    `ожидалось 3 захода в frontend-result.md, найдено ${frontendPasses.length}: ${frontendPasses
      .map((pass) => pass.heading)
      .join(" / ")}`,
  );
  assert.ok(
    !report.passes.some((pass) => pass.heading.includes("внутри блока")),
    "заголовок внутри fenced-блока не должен считаться заходом",
  );
  assert.ok(
    !report.passes.some((pass) => pass.heading.includes("Changed Files")),
    "заголовок без даты не должен считаться заходом",
  );
  // 2 сверх первого во `08-frontend` + 1 сверх первого в ledger-хронике `HANDOFF.md`.
  assert.equal(report.metrics.rework_passes, 3, "заходы ledger обязаны считаться наравне со стадийными");
  assert.equal(report.metrics.rework_by_stage["08-frontend"], 3);

  // --- Метрика 2: каналы -----------------------------------------------------
  const byHeading = (needle: string) => report.passes.find((pass) => pass.heading.includes(needle));

  const live = byHeading("живого демо");
  assert.ok(live);
  assert.equal(live.channel, "user_device", "«фидбэк с живого демо» — дорогой канал, не user_review");
  assert.equal(live.channel_source, "heuristic");

  const marked = byHeading("экранов банка");
  assert.ok(marked);
  assert.equal(marked.channel, "qa", "маркер found_by обязан перекрыть эвристику");
  assert.equal(marked.channel_source, "marker");

  const garbage = byHeading("мусорным маркером");
  assert.ok(garbage);
  assert.equal(garbage.channel_source, "heuristic", "мусорное значение маркера не должно приниматься");
  assert.equal(garbage.channel, "unknown");

  // 2 маркера (один в артефакте стадии, один в ledger-хронике) на 5 заходов.
  assert.equal(report.metrics.channel_marker_coverage, Math.round((2 / 5) * 100) / 100);

  // --- Метрики 3 и 4: ledger -------------------------------------------------
  assert.equal(report.metrics.deviations, 2, "отклонения читаются из таблицы ledger");
  assert.equal(report.metrics.deviations_backfilled_approval, 1);
  assert.equal(
    report.metrics.approvals_total,
    2,
    "таблица approval разорвана пустой строкой — обе части обязаны быть прочитаны",
  );
  assert.equal(report.metrics.approvals_backfilled, 1);
  assert.equal(report.metrics.validation_runs, 2);
  assert.equal(report.metrics.validation_failed, 2, "и `failed`, и «12 errors» — неуспешные прогоны");
  assert.equal(
    report.metrics.validation_errors_at_close,
    12,
    "долг валидатора берётся из последнего прогона с числом ошибок",
  );

  // --- Метрика 5: слепые зоны ------------------------------------------------
  assert.deepEqual(report.metrics.stages_with_empty_inputs, ["08-frontend"]);
  assert.deepEqual(report.metrics.stages_attempts_understated, ["08-frontend"]);
  assert.ok(
    report.stages.some((row) => row.stage_id === "01-research" && row.skipped_by_scale),
    "стадия, исключённая масштабом, обязана быть отличима от забытой",
  );

  // --- Прочее ----------------------------------------------------------------
  assert.equal(report.scale, "increment");
  assert.equal(report.duration_days, 2);
  assert.ok(report.blind_spots.length >= 2, "отчёт обязан всегда перечислять, чего он не видит");

  const markdown = formatRunRetro(report);
  assert.ok(markdown.includes("# Ретро run: fixture-product / 2026-07-01"));
  assert.ok(markdown.includes("Повторных заходов"));
  assert.ok(markdown.includes("Чего эти числа не видят"));

  // --- Пустой run не должен ронять разбор ------------------------------------
  const emptyDir = join(root, "outputs", "empty-product", "2026-07-05");
  mkdirSync(emptyDir, { recursive: true });
  const emptyReport = collectRunRetro(emptyDir);
  assert.equal(emptyReport.metrics.rework_passes, 0);
  assert.ok(
    emptyReport.blind_spots.some((spot) => spot.includes("stage-gate-ledger.md")),
    "отсутствующий ledger обязан быть назван слепой зоной, а не молча дать нули",
  );

  // --- Защита от самообмана --------------------------------------------------
  // Маппинг «файл артефакта → стадия» строится из манифеста. Если он сломается,
  // ни один заход не будет отнесён к стадии и тест выше упадёт на нулях — но
  // проверим явно, что стадия у заходов реальная, а не подставлена по имени файла.
  assert.ok(
    report.passes.every((pass) => /^\d{2}-/.test(pass.stage_id) || pass.stage_id === "ledger"),
    "стадия захода обязана приходить из манифеста (или быть хроникой ledger)",
  );

  // --- Заходы, ведомые в run ledger, а не в артефакте стадии -------------------
  // 🔴 Регресс, который это ловит: прогон, целиком прошедший в Figma с хроникой в
  // `HANDOFF.md`, печатал «0 заходов, 0 дорогих находок» — метрика врала в
  // благополучную сторону ровно там, где разбор нужнее всего (run
  // `a3-brand-presentation-template`, 2026-08-11).
  const ledgerPasses = report.passes.filter((pass) => pass.stage_id === "ledger");
  assert.equal(ledgerPasses.length, 2, "оба датированных захода HANDOFF.md обязаны быть найдены");
  assert.ok(
    ledgerPasses.some((pass) => pass.channel === "user_review" && pass.channel_source === "marker"),
    "маркер канала в ledger-хронике обязан читаться так же, как в артефакте стадии",
  );
  assert.equal(
    report.metrics.rework_by_stage.ledger,
    2,
    "заходы ledger обязаны попадать в разбивку по стадиям",
  );

  // Негативный контроль механизма: без ledger-хроники счёт обязан падать.
  const withoutLedger = report.metrics.rework_passes - Math.max(0, ledgerPasses.length - 1);
  assert.ok(
    withoutLedger < report.metrics.rework_passes,
    "метрика обязана расти за счёт ledger-заходов, иначе механизм ничего не добавил",
  );

  // --- Проверка маршрута -----------------------------------------------------
  // Модуль может быть корректным, а CLI — не вызывать его. Тест на функции этого не ловит.
  const cli = readFileSync(join(process.cwd(), "runtime", "typescript", "run-run-retro.ts"), "utf8");
  assert.ok(
    cli.includes("collectRunRetro(") && cli.includes("formatRunRetro("),
    "CLI yarn workflow:retro обязан вызывать collectRunRetro/formatRunRetro",
  );

  console.log(
    `run retro tests passed (заходов в фикстуре: ${report.passes.length}, ` +
      `отклонений: ${report.metrics.deviations}, слепых зон: ${report.blind_spots.length})`,
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
