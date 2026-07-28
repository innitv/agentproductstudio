/**
 * Регрессия карты студии.
 *
 * Главный риск такой команды — не неверный вывод, а ПУСТОЙ: источник переименовали, чтение
 * молча вернуло ничего, и карта показывает аккуратные пустые таблицы. Поэтому тест проверяет
 * не форматирование, а что каждый слой реально прочитан и сошёлся с источником.
 */

import assert from "node:assert/strict";
import { buildWorkflowMap, formatWorkflowMap } from "./workflow-map";
import { getWorkflowStagesForProfile, workflowStages } from "./workflow-stages";
import { agentInstructionFiles } from "./agents.registry";
import { loadSkillMetadataRecords } from "./skill-metadata";

const map = buildWorkflowMap();

// 1. Стадии: карта обязана покрыть весь граф, а не его часть.
const mapped = new Set([...map.stages, ...map.referenceOnlyStages].map((stage) => stage.id));
for (const stage of workflowStages) {
  assert.ok(mapped.has(stage.id), `стадия '${stage.id}' отсутствует в карте`);
}
assert.equal(
  mapped.size,
  workflowStages.length,
  `в карте ${mapped.size} стадий против ${workflowStages.length} в манифесте`,
);

// 2. Разделение по профилям: reference-стадия не должна попасть в standard-таблицу.
const standardIds = new Set(getWorkflowStagesForProfile("standard").map((stage) => stage.id));
for (const stage of map.referenceOnlyStages) {
  assert.ok(!standardIds.has(stage.id), `'${stage.id}' показана как reference-only, но входит в standard`);
}

// 3. У каждой стадии есть владелец и хотя бы один артефакт — иначе строка бессмысленна.
for (const stage of [...map.stages, ...map.referenceOnlyStages]) {
  assert.ok(stage.owner.length > 0, `'${stage.id}': пустой владелец`);
  assert.ok(stage.artifacts.length > 0, `'${stage.id}': пустой список артефактов`);
}

// 4. Агенты: все из реестра, обёртка каждого существует.
assert.equal(map.agents.length, Object.keys(agentInstructionFiles).length);
for (const agent of map.agents) {
  assert.ok(agent.wrapperExists, `${agent.name}: обёртка ${agent.wrapper} не найдена`);
}

// 5. Навыки: сумма привязанных и непривязанных равна фактическому числу навыков.
const allSkills = new Set(loadSkillMetadataRecords().map((record) => record.metadata.id));
const attached = new Set(map.agents.flatMap((agent) => agent.skills));
for (const orphan of map.orphanSkills) {
  assert.ok(allSkills.has(orphan), `навык '${orphan}' объявлен непривязанным, но его нет среди навыков`);
  assert.ok(!attached.has(orphan), `навык '${orphan}' привязан к агенту и не может быть в списке без агента`);
}

// 6. Хуки читаются из settings.json, а не выдумываются.
assert.ok(map.hooks.length >= 5, `ожидалось не меньше 5 хуков, прочитано ${map.hooks.length}`);
for (const hook of map.hooks) {
  assert.ok(hook.script.includes(".claude/hooks/"), `хук '${hook.event}' без пути к скрипту: ${hook.script}`);
  assert.ok(!hook.matcher.includes("|"), `matcher '${hook.matcher}' сломает markdown-таблицу`);
}

// 7. Плагины: три junction-плагина студии, у каждого есть навыки.
assert.ok(map.plugins.length >= 3, `ожидалось не меньше 3 плагинов, найдено ${map.plugins.length}`);
for (const plugin of map.plugins) {
  assert.ok(plugin.skills.length > 0, `плагин '${plugin.name}' без навыков`);
}

// 8. Формат: вывод не должен быть заглушкой из одних заголовков.
const text = formatWorkflowMap(map);
for (const heading of ["# Карта студии", "## Стадии", "## Агенты", "## Хуки", "## Плагины"]) {
  assert.ok(text.includes(heading), `в выводе нет раздела '${heading}'`);
}
assert.ok(text.split("\n").length > 40, "вывод карты подозрительно короткий");

console.log(
  `workflow map tests passed (стадий: ${mapped.size}, агентов: ${map.agents.length}, ` +
    `навыков без агента: ${map.orphanSkills.length}, хуков: ${map.hooks.length}, плагинов: ${map.plugins.length})`,
);
