/**
 * Конфигурация Style Dictionary v5 для дизайн-системы A3.
 *
 * Источник правды — DTCG-исходники в `design/tokens/` (версия формата 2025.10:
 * `color` и `dimension` — структурированные объекты, не строки).
 *
 * Платформы:
 * - `css`    -> `apps/frontend/src/styles/tokens.generated.css` (потребляет фронтенд);
 * - `figma`  -> `design/tokens/dist/figma/<mode>.json` (DTCG на mode для импорта
 *               в Figma Variables; у Style Dictionary нет встроенного формата
 *               `json/dtcg`, поэтому формат кастомный).
 */
import { hooks, A3_CSS_TRANSFORMS } from './sd-hooks.mjs';

/** Режимы (Figma modes). Пока один; semantic-слой рассчитан на расширение. */
export const MODES = ['light'];

const SOURCE = [
  'design/tokens/primitive/*.json',
  'design/tokens/semantic/*.json',
  'design/tokens/component/*.json',
  'design/tokens/compat/*.json',
];

/**
 * Кастомный формат: DTCG-дерево с сохранёнными алиасами `{group.token}`.
 * Берёт `token.original.$value`, поэтому значения остаются в DTCG-виде
 * (color/dimension как объекты), а ссылки не разворачиваются.
 */
const dtcgFormat = {
  name: 'json/dtcg-a3',
  format: ({ dictionary }) => {
    const root = {};
    for (const token of dictionary.allTokens) {
      let node = root;
      for (const seg of token.path.slice(0, -1)) {
        node[seg] ||= {};
        node = node[seg];
      }
      const leaf = { $type: token.$type ?? token.original.$type, $value: token.original.$value };
      if (token.$description) leaf.$description = token.$description;
      node[token.path[token.path.length - 1]] = leaf;
    }
    return JSON.stringify(root, null, 2) + '\n';
  },
};

/** Figma Variables не принимают композиты — они не становятся переменными. */
const FIGMA_UNSUPPORTED_TYPES = new Set(['shadow', 'fontFamily']);

export function buildConfig() {
  return {
    hooks: { ...hooks, formats: { [dtcgFormat.name]: dtcgFormat.format } },
    source: SOURCE,
    log: { verbosity: 'default', warnings: 'warn' },
    platforms: {
      css: {
        transforms: A3_CSS_TRANSFORMS,
        buildPath: 'apps/frontend/src/styles/',
        files: [
          {
            destination: 'tokens.generated.css',
            format: 'css/variables',
            options: {
              outputReferences: true,
              fileHeader: () => [
                'Сгенерировано из DTCG-исходников в design/tokens/.',
                'Не редактировать вручную: правки делаются в design/tokens/ и применяются `yarn tokens:build`.',
              ],
            },
          },
        ],
      },
      figma: {
        transforms: [],
        // Не `dist/`: этот путь исключён .gitignore, а Figma-экспорт —
        // передаваемый дизайнеру артефакт, история которого нужна в репозитории.
        buildPath: 'design/tokens/figma/',
        files: MODES.map((mode) => ({
          destination: `${mode}.json`,
          format: 'json/dtcg-a3',
          // Из Figma-экспорта исключён deprecated compat-слой (--a3-*) и типы,
          // которые Figma Variables не поддерживают.
          filter: (token) =>
            !token.$deprecated &&
            !token.original.$deprecated &&
            !FIGMA_UNSUPPORTED_TYPES.has(token.$type ?? token.original.$type),
        })),
      },
    },
  };
}
