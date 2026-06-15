import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_RESEARCH_FILES = [
  "research-summary.md",
  "scenario-user-flows.md",
  "competitive-analysis.md",
  "proto-personas.md",
  "synthetic-interviews.md",
  "swot.md",
  "cjm-map.md",
  "opportunity-roadmap.md",
  "notion-research-export-ru.md",
];

const LEGACY_AI_SLOP_PATTERNS = [
  { label: "old orchestration/trust-layer framing", pattern: /orchestration\s*\+\s*trust layer|trust layer поверх|ux and trust layer/iu },
  { label: "old rail framing", pattern: /конкурировать отдельным rail|best rail selection|national payment rails|собственных rails/iu },
  { label: "old wedge framing", pattern: /стартов(?:ый|ого)\s+wedge|wedge-сценар/iu },
  { label: "old companion/status handoff wording", pattern: /companion\/status|partner handoff|legal\/partner readiness/iu },
  { label: "untranslated validation placeholders", pattern: /willingness-to-connect|repeat intent|source-backed market facts/iu },
];

const GENERIC_CLAIM_PATTERNS = [
  /повыс(?:ит|ить|ает)\s+(?:доверие|конверси|retention|лояльность)/iu,
  /улучш(?:ит|ить|ает)\s+(?:ux|опыт|пользовательский опыт|качество)/iu,
  /сниз(?:ит|ить|ает)\s+(?:friction|трение|барьер|барьеры)/iu,
  /ускор(?:ит|ить|яет)\s+(?:рост|принятие|масштабирование)/iu,
  /созда(?:ст|ть|ет)\s+(?:ценность|единый контур|доверенный слой)/iu,
  /\b(?:seamless|unlock|flywheel|wedge|trust layer|orchestration|rails|companion)\b/iu,
];

const MECHANISM_MARKERS = /через|за счет|за счёт|потому|так как|в момент|когда|если|чтобы|поэтому|измер|провер|метрик|событи|канал|документ|чек|счет|счёт|статус|возврат|подтвержд|валидац/iu;
const DOMAIN_MARKERS = /пользователь|клиент|продав|мастер|банк|счет|счёт|платеж|платёж|чек|возврат|предоплат|задаток|эскроу|аккредитив|жкх|сбп|bnpl|документ|квитанц|сделк|услуг|интервью|метрик|источник|cjm|персона|канал|регулятор/iu;
const STRUCTURAL_DEPTH_MARKERS = /кто|ситуаци|трени|решени|почему сработает|как проверяем|цепочка решений|подробные кейсы|ключевые кейсы|user flow под cjm|сквозной user flow|пользовательские флоу|реальные пользовательские флоу|связь возможностей с cjm/iu;

export function lintResearchMarkdown(markdown, options = {}) {
  const sourceName = options.sourceName ?? "markdown";
  const normalized = markdown.toLowerCase();
  const lines = markdown.split(/\r?\n/);
  const sections = extractHeadings(markdown);
  const strictSummary = options.strictSummary ?? /research-summary|scenario-user-flows|notion|export|combined|cjm-map|opportunity-roadmap/iu.test(sourceName);
  const strictCjm = options.strictCjm ?? /research-summary|scenario-user-flows|notion|export|combined|cjm-map/iu.test(sourceName);
  const strictRoadmap = options.strictRoadmap ?? /research-summary|notion|export|combined|opportunity-roadmap/iu.test(sourceName);
  const checks = [
    checkNoShallowSummary(markdown, normalized, sections, { strictSummary }),
    checkCjmDepthRequired(markdown, normalized, sections, { strictCjm }),
    checkRoadmapTraceRequired(markdown, { strictRoadmap }),
    checkGenericClaimDetector(lines),
    checkPortableSentenceDetector(lines),
    checkRepetitiveTableRows(markdown),
  ];

  const failed = checks.filter((check) => check.status === "fail");
  const warnings = checks.filter((check) => check.status === "warn");
  return {
    source: sourceName,
    pass: failed.length === 0,
    status: failed.length === 0 ? "pass" : "fail",
    summary: {
      checks: checks.length,
      failed: failed.length,
      warnings: warnings.length,
    },
    checks,
  };
}

export function lintResearchTargets(targets, options = {}) {
  const files = resolveMarkdownTargets(targets);
  const results = files.map((file) => lintResearchMarkdown(readFileSync(file, "utf8"), {
    ...options,
    sourceName: file,
  }));
  const combined = files.length > 1
    ? lintResearchMarkdown(files.map((file) => `# ${basename(file)}\n\n${readFileSync(file, "utf8")}`).join("\n\n"), {
      ...options,
      sourceName: "combined research pack",
    })
    : null;
  const allResults = combined ? [...results, combined] : results;
  return {
    pass: allResults.every((result) => result.pass),
    files,
    results: allResults,
  };
}

export function formatResearchLintReport(report) {
  const lines = [
    `Research content lint: ${report.pass ? "pass" : "fail"}`,
    `Targets: ${report.files.length ? report.files.join(", ") : "none"}`,
    "",
    "| Source | Rule | Status | Value | Hint |",
    "|---|---|---|---|---|",
  ];

  for (const result of report.results) {
    for (const check of result.checks) {
      lines.push(`| ${escapeTable(result.source)} | ${escapeTable(check.id)} | ${check.status} | ${escapeTable(formatValue(check.value))} | ${escapeTable(check.hint)} |`);
    }
  }

  return lines.join("\n");
}

export function resolveMarkdownTargets(targets) {
  const explicitTargets = targets.length ? targets : ["."];
  const files = [];

  for (const target of explicitTargets) {
    const resolved = resolve(process.cwd(), target);
    if (!existsSync(resolved)) {
      throw new Error(`Research lint target not found: ${resolved}`);
    }

    const stat = statSync(resolved);
    if (stat.isDirectory()) {
      for (const file of DEFAULT_RESEARCH_FILES) {
        const candidate = join(resolved, file);
        if (existsSync(candidate)) {
          files.push(candidate);
        }
      }
      if (!files.length) {
        for (const file of readdirSync(resolved)) {
          const candidate = join(resolved, file);
          if (statSync(candidate).isFile() && extname(candidate).toLowerCase() === ".md") {
            files.push(candidate);
          }
        }
      }
      continue;
    }

    if (stat.isFile() && extname(resolved).toLowerCase() === ".md") {
      files.push(resolved);
      continue;
    }

    throw new Error(`Research lint target must be a directory or Markdown file: ${resolved}`);
  }

  return [...new Set(files)];
}

function checkNoShallowSummary(markdown, normalized, sections, options = {}) {
  const hasRequiredChain = /кто\s*[-→>]+|кто\s+.*ситуаци|ситуаци.*трени|трени.*решени|решени.*почему|почему.*как проверяем|цепочка решений/iu.test(markdown);
  const hasScenarioDepth = /подробные кейсы|ключевые кейсы|user flow под cjm|сквозной user flow|пользовательские флоу|реальные пользовательские флоу|связь возможностей с cjm|жизненная ситуация|что происходит в жизни/iu.test(markdown);
  const hasMostlyBullets = countBulletLines(markdown) > countParagraphLines(markdown) * 1.8;
  const isResearchLike = options.strictSummary && /research|исследован|cjm|персон|конкурент|swot|roadmap|бэклог|backlog/iu.test(markdown);
  const passes = !isResearchLike || (hasRequiredChain && hasScenarioDepth && !hasMostlyBullets);

  return {
    id: "no_shallow_summary",
    label: "Research output is not only a thesis digest",
    status: passes ? "pass" : "fail",
    value: {
      has_required_chain: hasRequiredChain,
      has_scenario_depth: hasScenarioDepth,
      bullet_lines: countBulletLines(markdown),
      paragraph_lines: countParagraphLines(markdown),
      sections: sections.length,
    },
    hint: "Добавь связку кто -> ситуация -> трение -> решение -> почему сработает -> как проверяем, подробные кейсы и user flow/CJM вместо одной тезисной выжимки.",
  };
}

function checkCjmDepthRequired(markdown, normalized, sections, options = {}) {
  const cjmMentioned = /cjm|customer journey|user flow|путь пользователя|сценари/iu.test(markdown);
  if (!cjmMentioned || !options.strictCjm) {
    return {
      id: "cjm_depth_required",
      label: "CJM depth is required when CJM/scenarios are present",
      status: "pass",
      value: !cjmMentioned ? "not_applicable" : "checked_in_combined_pack",
      hint: !cjmMentioned ? "CJM не найден в тексте." : "Для отдельных supporting artifacts полный CJM-depth проверяется на combined pack/export.",
    };
  }

  const requirements = [
    { id: "key_cases", pattern: /ключевые кейсы|подробные кейсы|жизненная ситуация|что происходит в жизни/iu },
    { id: "user_flow", pattern: /user flow под cjm|сквозной user flow|путь пользователя|шаг \d|этап \d/iu },
    { id: "user_question", pattern: /вопрос пользователя|сомневается|что пользователь пытается понять|что должен понять/iu },
    { id: "validation_metric", pattern: /метрик|как проверяем|способ проверки|validation method|minimum evidence|событие аналитики/iu },
  ];
  const missing = requirements.filter((item) => !item.pattern.test(markdown)).map((item) => item.id);

  return {
    id: "cjm_depth_required",
    label: "CJM has cases, user flow, user question and validation",
    status: missing.length ? "fail" : "pass",
    value: missing.length ? `missing: ${missing.join(", ")}` : "complete",
    hint: "Для CJM нужны ключевые кейсы, пошаговый user flow, вопрос/сомнение пользователя и метрика проверки.",
  };
}

function checkRoadmapTraceRequired(markdown, options = {}) {
  const roadmapMentioned = /roadmap|дорожн|ice\/rice|rice|бэклог|backlog|инициатив|приоритет/iu.test(markdown);
  if (!roadmapMentioned || !options.strictRoadmap) {
    return {
      id: "roadmap_trace_required",
      label: "Roadmap order has reason and validation",
      status: "pass",
      value: !roadmapMentioned ? "not_applicable" : "checked_in_combined_pack",
      hint: !roadmapMentioned ? "Roadmap/backlog не найден в тексте." : "Для отдельных supporting artifacts roadmap trace проверяется на combined pack/export.",
    };
  }

  const hasCjmLink = /cjm friction|конкретное трение|связь возможностей с cjm|связь p\d с cjm|этап cjm|боль cjm|сценарий/iu.test(markdown);
  const hasOrderReason = /почему.*поряд|почему.*сначала|порядок.*потому|зависимост|после проверки|сначала.*затем|trade-?off|ограничени/iu.test(markdown);
  const hasValidation = /как проверяем|validation method|метрик|minimum evidence|гипотез|проверить|критерий успеха/iu.test(markdown);

  return {
    id: "roadmap_trace_required",
    label: "Roadmap explains CJM link, order reason and validation",
    status: hasCjmLink && hasOrderReason && hasValidation ? "pass" : "fail",
    value: { has_cjm_link: hasCjmLink, has_order_reason: hasOrderReason, has_validation: hasValidation },
    hint: "Roadmap/backlog должен объяснять связь с CJM, почему порядок именно такой и чем проверяется решение.",
  };
}

function checkGenericClaimDetector(lines) {
  const hits = [];
  for (const [index, line] of lines.entries()) {
    const trimmed = cleanLine(line);
    if (!trimmed || isMarkdownStructureLine(trimmed)) {
      continue;
    }
    const hasGenericClaim = GENERIC_CLAIM_PATTERNS.some((pattern) => pattern.test(trimmed))
      || LEGACY_AI_SLOP_PATTERNS.some((item) => item.pattern.test(trimmed));
    if (hasGenericClaim && !MECHANISM_MARKERS.test(trimmed)) {
      hits.push({ line: index + 1, text: trimmed.slice(0, 180) });
    }
  }

  return {
    id: "generic_claim_detector",
    label: "Generic claims include mechanism and verification",
    status: hits.length ? "fail" : "pass",
    value: hits.slice(0, 8),
    hint: "Фразы про доверие, UX, friction, rails/wedge/orchestration и похожие claims должны объяснять механизм, момент CJM и способ проверки.",
  };
}

function checkPortableSentenceDetector(lines) {
  const hits = [];
  for (const [index, line] of lines.entries()) {
    const trimmed = cleanLine(line);
    if (trimmed.length < 70 || isMarkdownStructureLine(trimmed)) {
      continue;
    }
    const hasStructuralDepth = STRUCTURAL_DEPTH_MARKERS.test(trimmed) || MECHANISM_MARKERS.test(trimmed);
    const hasDomain = DOMAIN_MARKERS.test(trimmed);
    const genericDensity = countPatternMatches(trimmed, /ценност|эффективност|стратег|масштаб|решени|платформ|контур|опыт|довер|рост|конверс|friction|seamless|unlock|layer|rails|wedge/giu);
    if (!hasDomain && !hasStructuralDepth && genericDensity >= 2) {
      hits.push({ line: index + 1, text: trimmed.slice(0, 180) });
    }
  }

  return {
    id: "portable_sentence_detector",
    label: "Sentences are specific to this product and situation",
    status: hits.length >= 3 ? "fail" : hits.length ? "warn" : "pass",
    value: hits.slice(0, 8),
    hint: "Универсальные предложения, которые можно перенести в любой продукт, нужно переписать через пользователя, ситуацию, действие, ограничение и проверку.",
  };
}

function checkRepetitiveTableRows(markdown) {
  const tables = extractTables(markdown);
  const suspectTables = [];

  for (const table of tables) {
    if (table.rows.length < 5 || isScoringTable(table.headers)) {
      continue;
    }
    const skeletonCounts = new Map();
    for (const row of table.rows) {
      const skeleton = row.map((cell) => cell
        .toLowerCase()
        .replace(/`[^`]+`/g, "code")
        .replace(/\d+([.,]\d+)?/g, "#")
        .replace(/[a-zа-яё]{4,}/giu, "w")
        .replace(/\s+/g, " ")
        .trim()).join("|");
      skeletonCounts.set(skeleton, (skeletonCounts.get(skeleton) ?? 0) + 1);
    }
    const topCount = Math.max(...skeletonCounts.values());
    if (topCount >= 4 && topCount / table.rows.length >= 0.55) {
      suspectTables.push({
        line: table.line,
        rows: table.rows.length,
        repeated_skeleton_rows: topCount,
        headers: table.headers,
      });
    }
  }

  return {
    id: "repetitive_table_rows",
    label: "Tables are not repeated row templates with swapped nouns",
    status: suspectTables.length ? "fail" : "pass",
    value: suspectTables,
    hint: "Если строки таблицы повторяют один шаблон, добавь конкретное поведение, различия сценариев, механизм влияния и проверку для каждой строки.",
  };
}

function extractHeadings(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^#{1,4}\s+/.test(line))
    .map((line) => line.replace(/^#{1,4}\s+/, "").trim());
}

function extractTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tables = [];
  let buffer = [];
  let startLine = 0;

  const flush = () => {
    if (buffer.length >= 3) {
      const rows = buffer
        .filter((line) => !/^\|\s*:?-+/.test(line))
        .map((line) => line.split("|").slice(1, -1).map((cell) => cleanLine(cell)));
      if (rows.length > 1) {
        tables.push({
          line: startLine,
          headers: rows[0],
          rows: rows.slice(1),
        });
      }
    }
    buffer = [];
    startLine = 0;
  };

  for (const [index, line] of lines.entries()) {
    if (line.trim().startsWith("|")) {
      if (!buffer.length) {
        startLine = index + 1;
      }
      buffer.push(line.trim());
    } else {
      flush();
    }
  }
  flush();
  return tables;
}

function isScoringTable(headers) {
  const joined = headers.join(" ").toLowerCase();
  return /rice|ice|reach|impact|confidence|effort|score|оценк|охват|влияни|уверенность|усили/iu.test(joined);
}

function countBulletLines(markdown) {
  return markdown.split(/\r?\n/).filter((line) => /^\s*[-*]\s+/.test(line)).length;
}

function countParagraphLines(markdown) {
  return markdown.split(/\r?\n/).filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 80 && !isMarkdownStructureLine(trimmed);
  }).length;
}

function countPatternMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function isMarkdownStructureLine(line) {
  return /^#{1,6}\s+/.test(line)
    || /^\|/.test(line)
    || /^<!--/.test(line)
    || /^[-*]\s+\[[ x]\]/i.test(line)
    || /^[-*]\s*$/.test(line);
}

function cleanLine(line) {
  return line
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.length ? JSON.stringify(value) : "none";
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value ?? "");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function parseCliArgs(argv) {
  const json = argv.includes("--json");
  const targets = argv.filter((arg) => arg !== "--json");
  return { json, targets };
}

async function main() {
  const { json, targets } = parseCliArgs(process.argv.slice(2));
  try {
    const report = lintResearchTargets(targets);
    if (json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatResearchLintReport(report));
    }
    process.exit(report.pass ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
