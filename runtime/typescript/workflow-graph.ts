/**
 * Проверка графа стадий: вход стадии обязан производиться РАНЬШЕ по маршруту.
 *
 * Зачем отдельно от `agent-metadata.ts`. Там проверка достижимости отвечает на вопрос
 * «упомянут ли артефакт хоть где-нибудь среди входов этого агента» (`routeTools never
 * provide metadata required_input`). Этого мало: требование удовлетворяется само собой,
 * если артефакт вписать в `dependsOn` той же стадии, которая его требует. Именно так
 * `figma_layout_ir` и `figma_visual_qa` оказались в `qaReview.dependsOn`, не производясь
 * НИ ОДНИМ шагом маршрута (`docs/architecture/studio-audit-2026-07-28.md` §1, «Аномалия»);
 * зависимость снята вместе с осью маршрута 2026-07-28.
 *
 * Прообраз — `validate_context_no_future_tasks` у crewAI: задача не может ссылаться на
 * задачу, идущую позже. Здесь то же самое на уровне артефактов, плюс более сильное
 * требование: у входа вообще обязан быть производитель.
 *
 * Проверяются оба профиля (`standard`, `reference`) на полном масштабе: масштаб режет
 * глубину, а не связность, и урезанный план по определению не создаёт новых рёбер.
 */

import {
  artifactNames,
  getRoutePlanForProfile,
  optionalRoutePlan,
  routeTools,
  workflowProfiles,
  type WorkflowProfile,
} from "./workflow.manifest";

export type GraphViolationKind = "never_produced" | "produced_later";

export interface GraphViolation {
  kind: GraphViolationKind;
  profile: WorkflowProfile;
  step: string;
  artifact: string;
  producedBy: readonly string[];
  message: string;
}

export interface KnownGraphDeviation {
  step: string;
  artifact: string;
  kind: GraphViolationKind;
  /** Почему нарушение записано как известное, а не починено. */
  reason: string;
  /** Первоисточник решения: без него запись превращается в вечное «потом разберёмся». */
  source: string;
}

/**
 * Известные отклонения графа. Не «выключенная проверка»: каждая запись обязана
 * соответствовать РЕАЛЬНОМУ нарушению (протухшая запись — ошибка, см. `validateWorkflowGraph`),
 * печатается предупреждением на каждом прогоне `yarn validate:config` и требует
 * первоисточника. Список должен уменьшаться, а не расти.
 */
export const knownGraphDeviations: readonly KnownGraphDeviation[] = [];

const knownArtifacts = new Set<string>(Object.values(artifactNames));

/** Форма шага маршрута, достаточная для проверки связности (позволяет подменить граф в тесте). */
export interface RouteLike {
  outputs: readonly string[];
  inputs: readonly string[];
  dependsOn: readonly string[];
  referenceOutputs?: readonly string[];
  referenceInputs?: readonly string[];
  referenceDependsOn?: readonly string[];
}

/**
 * Находит входы стадий, которые не производятся вовсе или производятся позже по плану.
 * Возвращает нарушения без учёта списка известных отклонений — фильтрует уже вызывающий.
 *
 * `routes` подменяется только в тестах: проверка обязана уметь ловить дефект, которого в
 * текущем манифесте нет (ссылка на будущий выход), иначе её зелёный цвет ничего не значит.
 */
export function findGraphInputViolations(
  routes: Readonly<Record<string, RouteLike>> = routeTools as unknown as Readonly<Record<string, RouteLike>>,
): GraphViolation[] {
  const violations: GraphViolation[] = [];
  const seen = new Set<string>();

  for (const profile of workflowProfiles) {
    const plan = getRoutePlanForProfile(profile);
    const positions = new Map<string, number>(plan.map((step, index) => [step, index]));
    // Опциональные шаги (публикация в Notion) не входят в план стадий: они идут после
    // основного маршрута, поэтому их вход обязан иметь производителя, но «раньше» для них
    // означает «где угодно в плане».
    for (const step of optionalRoutePlan) {
      positions.set(step, plan.length);
    }

    const producers = new Map<string, string[]>();
    for (const step of plan) {
      const route = routes[step];
      if (!route) continue;
      const outputs = [
        ...route.outputs,
        ...(profile === "reference" ? route.referenceOutputs ?? [] : []),
      ];
      for (const artifact of outputs) {
        producers.set(artifact, [...(producers.get(artifact) ?? []), step]);
      }
    }

    for (const [step, position] of positions) {
      const route = routes[step];
      if (!route) continue;

      const inputs = [
        ...route.inputs,
        ...route.dependsOn,
        ...(profile === "reference" ? route.referenceInputs ?? [] : []),
        ...(profile === "reference" ? route.referenceDependsOn ?? [] : []),
      ].filter((input) => knownArtifacts.has(input));

      for (const artifact of new Set(inputs)) {
        const producedBy = producers.get(artifact) ?? [];
        const key = `${step}|${artifact}`;

        if (producedBy.length === 0) {
          if (seen.has(key)) continue;
          seen.add(key);
          violations.push({
            kind: "never_produced",
            profile,
            step,
            artifact,
            producedBy,
            message:
              `workflow.manifest.ts: шаг '${step}' требует артефакт '${artifact}', который не ` +
              `производит ни один шаг маршрута '${profile}'. Вход, у которого нет производителя, ` +
              "проходит проверку достижимости и при этом никогда не появится на диске.",
          });
          continue;
        }

        const earliest = Math.min(...producedBy.map((producer) => positions.get(producer) ?? Number.POSITIVE_INFINITY));
        if (earliest >= position) {
          if (seen.has(key)) continue;
          seen.add(key);
          violations.push({
            kind: "produced_later",
            profile,
            step,
            artifact,
            producedBy,
            message:
              `workflow.manifest.ts: шаг '${step}' требует артефакт '${artifact}', который ` +
              `производится не раньше него самого (производитель: ${producedBy.join(", ")}) ` +
              `в маршруте '${profile}'. Ссылка на будущий выход — это скрытая недоставка, а не зависимость.`,
          });
        }
      }
    }
  }

  return violations;
}

/**
 * Ошибки графа для `validate:config`: новые нарушения и протухшие записи об известных.
 * Проверка двусторонняя намеренно — односторонняя превращает список исключений в
 * бессрочную амнистию (тот же принцип, что у `skipped_by_scale` в валидаторе запуска).
 */
export function validateWorkflowGraph(
  known: readonly KnownGraphDeviation[] = knownGraphDeviations,
  routes?: Readonly<Record<string, RouteLike>>,
): string[] {
  const errors: string[] = [];
  const violations = findGraphInputViolations(routes);
  const knownKeys = new Map(known.map((item) => [`${item.step}|${item.artifact}|${item.kind}`, item]));
  const seenKnown = new Set<string>();

  for (const violation of violations) {
    const key = `${violation.step}|${violation.artifact}|${violation.kind}`;
    if (knownKeys.has(key)) {
      seenKnown.add(key);
      continue;
    }

    errors.push(violation.message);
  }

  for (const [key, deviation] of knownKeys) {
    if (!seenKnown.has(key)) {
      errors.push(
        `workflow-graph.ts: запись об известном отклонении '${deviation.step}' -> '${deviation.artifact}' ` +
          `(${deviation.kind}) больше не соответствует реальности. Нарушения нет — удали запись, ` +
          "иначе список исключений начнёт прикрывать будущие дефекты.",
      );
    }
  }

  return errors;
}

/** Строки-предупреждения для вывода прогона: известное отклонение обязано быть видимым. */
export function describeKnownGraphDeviations(): string[] {
  return knownGraphDeviations.map(
    (deviation) =>
      `известное отклонение графа: '${deviation.step}' требует '${deviation.artifact}' ` +
      `(${deviation.kind}). ${deviation.reason} Источник: ${deviation.source}`,
  );
}
