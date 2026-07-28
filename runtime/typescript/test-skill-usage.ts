import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { formatSkillUsageInspection, inspectSkillUsage } from "./skill-usage";

const rows = inspectSkillUsage();
const frontend = rows.find((row) => row.stageId === "08-frontend");
const qa = rows.find((row) => row.stageId === "11-qa");

assert.ok(frontend, "frontend stage should be present");
assert.ok(frontend.skills.some((skill) => skill.id === "landing-builder"), "frontend should use landing-builder");
assert.ok(frontend.skills.some((skill) => skill.id === "figma-token-extractor"), "frontend should use figma-token-extractor");
assert.ok(frontend.skills.some((skill) => skill.id === "figma-roundtrip"), "frontend should use figma-roundtrip");
assert.ok(frontend.skills.some((skill) => skill.id === "visual-layout-verifier"), "frontend should use visual-layout-verifier");
assert.ok(frontend.skills.some((skill) => skill.id === "design-engineering"), "frontend should use design-engineering");
assert.ok(frontend.skills.some((skill) => skill.id === "ds-to-storybook"), "frontend should use ds-to-storybook");


assert.ok(qa, "qa stage should be present");
assert.ok(qa.skills.some((skill) => skill.id === "visual-diff-verifier"), "qa should use visual diff verifier");
assert.ok(qa.skills.some((skill) => skill.id === "figma-roundtrip"), "qa should use figma-roundtrip");
assert.ok(qa.skills.some((skill) => skill.id === "visual-layout-verifier"), "qa should use visual-layout-verifier");
assert.ok(qa.skills.some((skill) => skill.id === "seo-copy-validator"), "qa should use SEO copy validator");

// --- Mobile Device Acceptance Gate ------------------------------------------
//
// Гейт мобильной приёмки не имеет собственного валидатора: он держится на том, что
// агенты `frontend` и `qa-review` читают skill `design-engineering`. Значит его можно
// обесточить МОЛЧА тремя разными способами, и ни один не поймается остальными тестами:
//
//   1. убрать `design-engineering` из `skills:` контракта агента;
//   2. убрать его из `skills:` ОБЁРТКИ `.claude/agents/<имя>.md` — а именно её Claude Code
//      преднагружает субагенту, контракт он читает только по ссылке;
//   3. убрать стадию из `owner_stage_ids` skill — `inspectSkillUsage` фильтрует навыки
//      по владению стадией, и skill исчезнет из стадии, оставшись в списке агента;
//   4. вырезать саму норму из тела SKILL.md, оставив ссылку на неё в списке.
//
// Проверяются все четыре. Способ 2 частично закрыт `agent-metadata.ts` (сверка обёртки с
// контрактом в `yarn validate:config`), но проверяется и здесь: сообщение об обесточенном
// гейте должно называть гейт, а не «списки разошлись» — иначе причину правки не понять.
//
// Норма выведена из пяти багов, которые прошли desktop-проверки и всплыли на живом iPhone
// (`contractor-payment-demo`, 2026-07-23…25) — цена молчаливого отключения известна.

const mobileGateStages = ["08-frontend", "11-qa"] as const;

for (const stageId of mobileGateStages) {
  const row = rows.find((item) => item.stageId === stageId);
  assert.ok(row, `stage ${stageId} should be present`);
  assert.ok(
    row.skills.some((skill) => skill.id === "design-engineering"),
    `${stageId} (${row.agentName}) обязана использовать design-engineering: в нём живёт Mobile Device ` +
      "Acceptance Gate, у гейта нет отдельного валидатора. Проверь skills: в " +
      `agent-pack/agent-contracts/${row.agentName}.agent.md и owner_stage_ids в ` +
      ".claude/skills/design-engineering/SKILL.md.",
  );

  // Обёртка — то, что реально преднагружается субагенту. `inspectSkillUsage` читает
  // контракты (`agents.registry.ts`), поэтому удаление из обёртки этой проверкой не
  // ловится: смотрим на неё напрямую.
  const wrapper = readFileSync(join(process.cwd(), ".claude", "agents", `${row.agentName}.md`), "utf8");
  const wrapperSkills = wrapper.match(/^skills:\s*\[(.*)\]\s*$/m)?.[1] ?? "";
  assert.ok(
    wrapperSkills.split(",").map((skill) => skill.trim()).includes("design-engineering"),
    `.claude/agents/${row.agentName}.md: design-engineering исчез из skills: обёртки. Обёртка — ` +
      "системный промпт, который субагент видит всегда; без неё Mobile Device Acceptance Gate " +
      "перестаёт доезжать до агента, даже если контракт его объявляет.",
  );
}

const designEngineeringFiles = [
  join(process.cwd(), ".claude", "skills", "design-engineering", "SKILL.md"),
];

for (const file of designEngineeringFiles) {
  const content = readFileSync(file, "utf8");
  assert.ok(
    /^##\s+Mobile Device Acceptance Gate/m.test(content),
    `${file}: секция «Mobile Device Acceptance Gate» исчезла — норма мобильной приёмки обесточена.`,
  );
  assert.ok(
    /isMobile|hasTouch|device profile/i.test(content),
    `${file}: гейт перестал требовать профиль устройства — узкий desktop-вьюпорт снова сойдёт за приёмку.`,
  );
}

// Пять сценариев — минимальный набор, каждый выведен из реального бага. Усыхание
// набора до «проверил на мобильном» не должно проходить молча.
const fullGate = readFileSync(designEngineeringFiles[0], "utf8");
const gateBody = fullGate.slice(fullGate.indexOf("## Mobile Device Acceptance Gate"));
const scenarioCount = (gateBody.match(/^\d\.\s+\*\*/gm) ?? []).length;
assert.ok(
  scenarioCount >= 5,
  `.claude/skills/design-engineering/SKILL.md: в Mobile Device Acceptance Gate осталось ${scenarioCount} ` +
    "сценариев из пяти обязательных (скролл от касания, safe-area, оверлей, две ширины, позиция прокрутки).",
);

const output = formatSkillUsageInspection(rows);
assert.ok(output.includes("# Agent Skill Usage"));
assert.ok(output.includes("| 08-frontend | frontend |"));
assert.ok(output.includes("`landing-builder`"));
assert.ok(output.includes("`design-engineering`"));
assert.ok(output.includes("`figma-roundtrip`"));
assert.ok(output.includes("`visual-layout-verifier`"));
assert.ok(output.includes("`ds-to-storybook`"));

console.log("skill usage inspection tests passed");
