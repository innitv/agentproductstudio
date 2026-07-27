/**
 * Сборка токенов + регрессионная сверка с baseline.
 *
 * Baseline (`design/tokens/baseline/styles-root.baseline.json`) — снимок блока
 * `:root` из `apps/frontend/src/styles.css` на момент миграции в DTCG.
 * Сборка падает, если сгенерированный CSS расходится с ним по составу
 * переменных или по вычисленным значениям. Это защита от «тихой» правки
 * значения при редактировании токенов.
 */
import fs from 'node:fs';
import path from 'node:path';
import StyleDictionary from 'style-dictionary';
import { buildConfig } from './sd-config.mjs';

const ROOT = process.cwd();
const BASELINE = path.join(ROOT, 'design/tokens/baseline/styles-root.baseline.json');
const GENERATED = path.join(ROOT, 'apps/frontend/src/styles/tokens.generated.css');

/** Парсит объявления `--x: value;` из первого блока `:root`. */
function parseRoot(css) {
  const start = css.indexOf(':root {');
  if (start < 0) throw new Error('В CSS нет блока :root');
  const end = css.indexOf('\n}', start);
  const out = new Map();
  for (const raw of css.slice(start + ':root {'.length, end).split('\n')) {
    const m = raw.trim().match(/^(--[a-z0-9-]+)\s*:\s*(.+);$/i);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

/** Разворачивает var(...) до конечного значения. */
function resolve(map, value, depth = 0) {
  if (depth > 20) throw new Error('Циклическая ссылка: ' + value);
  const m = value.match(/^var\((--[a-z0-9-]+)(?:,\s*(.+))?\)$/i);
  if (!m) return value;
  const target = map.get(m[1]);
  if (target === undefined) return m[2] ? m[2].trim() : value;
  return resolve(map, target, depth + 1);
}

const norm = (v) => v.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Приводит запись значения к канонической форме, чтобы отличить
 * СМЫСЛОВОЕ изменение (blocker) от смены ФОРМАТА записи (`#071f3d` против
 * `rgba(7, 31, 61, 1)`, кавычки в font-family). Сравнивать сырой текст нельзя:
 * генератор пишет цвета единообразно, а baseline смешивал hex и rgba.
 */
function canonical(v) {
  let s = norm(v);
  s = s.replace(/#([0-9a-f]{3,8})\b/g, (full, hex) => {
    let h = hex;
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return full;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  });
  s = s.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g,
    (_, r, g, b, a) => `rgba(${+r}, ${+g}, ${+b}, ${a === undefined ? 1 : parseFloat(a)})`);
  s = s.replace(/["']/g, '');
  return s;
}

async function main() {
  const sd = new StyleDictionary(buildConfig());
  await sd.hasInitialized;
  await sd.buildAllPlatforms();

  if (!fs.existsSync(BASELINE)) {
    console.log('\nBaseline отсутствует — сверка пропущена.');
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const baseMap = new Map(baseline.declarations.map((d) => [d.name, d.value]));
  const genMap = parseRoot(fs.readFileSync(GENERATED, 'utf8'));

  const missing = [...baseMap.keys()].filter((n) => !genMap.has(n));
  const added = [...genMap.keys()].filter((n) => !baseMap.has(n));
  const changed = [];
  const reformatted = [];
  for (const [name, baseValue] of baseMap) {
    if (!genMap.has(name)) continue;
    const was = norm(resolve(baseMap, baseValue));
    const now = norm(resolve(genMap, genMap.get(name)));
    if (was === now) continue;
    (canonical(was) === canonical(now) ? reformatted : changed).push({ name, was, now });
  }

  console.log('\n— Сверка с baseline —');
  console.log(`  переменных в baseline: ${baseMap.size}`);
  console.log(`  переменных в сборке:   ${genMap.size}`);
  console.log(`  отсутствуют:           ${missing.length}`);
  console.log(`  добавлены:             ${added.length}`);
  console.log(`  изменили значение:     ${changed.length}`);
  console.log(`  сменили только запись: ${reformatted.length}`);

  if (reformatted.length) {
    console.log('\n  Форматные (значение идентично, изменилась только запись):');
    for (const r of reformatted) console.log(`    ${r.name}: ${r.was}  ->  ${r.now}`);
  }
  if (added.length) console.log('\n  Добавленные (новые semantic-роли допустимы):\n    ' + added.join('\n    '));
  if (missing.length) console.log('\n  ОТСУТСТВУЮТ:\n    ' + missing.join('\n    '));
  if (changed.length) {
    console.log('\n  ИЗМЕНЁННЫЕ ЗНАЧЕНИЯ:');
    for (const c of changed) console.log(`    ${c.name}\n      было:  ${c.was}\n      стало: ${c.now}`);
  }

  if (missing.length || changed.length) {
    console.error('\nСборка отклонена: расхождение с baseline. Значения фронтенда менять только осознанно.');
    process.exit(1);
  }
  console.log('\nOK: значения совпадают с baseline.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
