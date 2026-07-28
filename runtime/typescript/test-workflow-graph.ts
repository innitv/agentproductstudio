/**
 * Регрессия проверки графа стадий.
 *
 * Требование к тесту: он обязан ВОСПРОИЗВЕСТИ уже случившийся дефект, а не только
 * зафиксировать текущее зелёное состояние. Дефект: `figma_layout_ir` и `figma_visual_qa`
 * стояли в `qaReview.dependsOn`, не производясь ни одним шагом маршрута
 * (`docs/architecture/studio-audit-2026-07-28.md` §1). Зависимость снята 2026-07-28 вместе
 * с осью маршрута, поэтому дефект воспроизводится подменой графа: проверка, зелёная при
 * любом входе, бесполезна. Проверка достижимости в `agent-metadata.ts` такой случай
 * пропускает — именно поэтому существует эта.
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

// 1. Текущее состояние: нарушений нет, и списка известных отклонений тоже нет.
assert.deepEqual(validateWorkflowGraph(), []);
assert.deepEqual(knownGraphDeviations, []);

// 2. Воспроизведение исторического дефекта на подменённом графе: вход без производителя
//    обязан быть назван поимённо. В самом манифесте такого больше нет — зависимость QA от
//    Figma-артефактов снята 2026-07-28 вместе с осью маршрута.
const routesWithOrphanInput = Object.fromEntries(
  Object.entries(
    (await import("./workflow.manifest")).routeTools as unknown as Record<string, RouteLike>,
  ).map(([step, route]) => [step, { ...route }]),
) as Record<string, RouteLike>;
routesWithOrphanInput.qaReview = {
  ...routesWithOrphanInput.qaReview,
  dependsOn: [...routesWithOrphanInput.qaReview.dependsOn, artifactNames.figmaLayoutIr],
};

const orphanInput = validateWorkflowGraph([], routesWithOrphanInput);
assertError(orphanInput, /'qaReview' требует артефакт 'figma_layout_ir'.*не производит ни один шаг/s);
assert.equal(
  orphanInput.length,
  1,
  `Ожидалось ровно одно нарушение графа, получено:\n${orphanInput.join("\n")}`,
);

// 3. Список исключений двусторонний: запись, которой не соответствует нарушение, — ошибка.
assertError(
  validateWorkflowGraph([
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

// 6. В текущем манифесте нарушений нет; способность их находить проверена пунктом 2.
assert.equal(findGraphInputViolations().length, 0);

console.log("workflow graph regression tests passed");
