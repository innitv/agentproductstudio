/**
 * Регрессия проверки графа стадий.
 *
 * Требование к тесту: он обязан ВОСПРОИЗВЕСТИ уже случившийся дефект, а не только
 * зафиксировать текущее зелёное состояние. Дефект: `figma_layout_ir` и `figma_visual_qa`
 * стоят в `qaReview.dependsOn`, не производясь ни одним шагом маршрута
 * (`docs/architecture/studio-audit-2026-07-28.md` §1). Проверка достижимости в
 * `agent-metadata.ts` его пропускает — именно поэтому существует эта.
 */

import assert from "node:assert/strict";
import { artifactNames } from "./route.config";
import {
  findGraphInputViolations,
  knownGraphDeviations,
  validateWorkflowGraph,
  type RouteLike,
} from "./workflow-graph";

function assertError(errors: string[], pattern: RegExp): void {
  assert.ok(
    errors.some((error) => pattern.test(error)),
    `Expected graph error matching ${pattern}, got:\n${errors.join("\n") || "(пусто)"}`,
  );
}

// 1. Текущее состояние: ошибок нет, потому что оба нарушения записаны как известные.
assert.deepEqual(validateWorkflowGraph(), []);

// 2. Воспроизведение исторического дефекта: без записи об исключении проверка обязана
//    назвать оба артефакта поимённо.
const withoutKnownDeviations = validateWorkflowGraph([]);
assertError(withoutKnownDeviations, /'qaReview' требует артефакт 'figma_layout_ir'.*не производит ни один шаг/s);
assertError(withoutKnownDeviations, /'qaReview' требует артефакт 'figma_visual_qa'.*не производит ни один шаг/s);
assert.equal(
  withoutKnownDeviations.length,
  2,
  `Ожидались ровно два нарушения графа, получено:\n${withoutKnownDeviations.join("\n")}`,
);

// 3. Список исключений двусторонний: запись, которой не соответствует нарушение, — ошибка.
assertError(
  validateWorkflowGraph([
    ...knownGraphDeviations,
    { step: "release", artifact: artifactNames.prd, kind: "never_produced", reason: "фикстура", source: "тест" },
  ]),
  /запись об известном отклонении 'release' -> 'prd'.*больше не соответствует реальности/s,
);

// 4. Ссылка на будущий выход (прообраз — `validate_context_no_future_tasks` у crewAI).
//    В текущем манифесте такого нет, поэтому дефект вносится подменой графа: проверка,
//    которая зелена при любом входе, бесполезна.
const routes = Object.fromEntries(
  Object.entries(
    (await import("./workflow.manifest")).routeTools as unknown as Record<string, RouteLike>,
  ).map(([step, route]) => [step, { ...route }]),
) as Record<string, RouteLike>;
routes.prd = { ...routes.prd, dependsOn: [...routes.prd.dependsOn, artifactNames.qaReport] };

const futureInput = validateWorkflowGraph(knownGraphDeviations, routes);
assertError(futureInput, /'prd' требует артефакт 'qa_report', который производится не раньше него самого/s);

// 5. Здоровый граф подменой не ломается: без внесённого дефекта копия даёт тот же результат.
const untouched = Object.fromEntries(
  Object.entries(
    (await import("./workflow.manifest")).routeTools as unknown as Record<string, RouteLike>,
  ).map(([step, route]) => [step, { ...route }]),
) as Record<string, RouteLike>;
assert.deepEqual(validateWorkflowGraph(knownGraphDeviations, untouched), []);

// 6. Само перечисление нарушений остаётся стабильным (защита от «сканер сломался, всё зелено»).
assert.equal(findGraphInputViolations().length, 2);

console.log("workflow graph regression tests passed");
