/**
 * Кастомные хуки Style Dictionary для дизайн-системы A3.
 *
 * Зачем не встроенные:
 * - `name/kebab` разрушает сегменты вида `status-01`, `0-5x`, `2xs`; нам нужно
 *   точное соответствие пути токена имени CSS-переменной.
 * - `color/css` выводит hex/`rgb(% % % / a)`; baseline фронтенда написан в
 *   `rgba(r, g, b, a)`, и мы сохраняем этот формат, чтобы diff со styles.css
 *   был текстовым, а не только смысловым.
 * - `shadow/css/shorthand` дописывает `spread` (`0px`) и меняет формат цвета;
 *   baseline теней записан из Figma без spread.
 */

/** DTCG color object -> `rgba(r, g, b, a)` */
function formatColor(value) {
  if (typeof value === 'string') return value;
  const [r, g, b] = value.components.map((c) => Math.round(c * 255));
  const alpha = value.alpha === undefined ? 1 : value.alpha;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** DTCG dimension object -> `16px` */
function formatDimension(value) {
  if (typeof value === 'string') return value;
  return `${value.value}${value.unit}`;
}

/** DTCG shadow (объект или массив слоёв) -> CSS box-shadow без spread */
function formatShadow(value) {
  const layers = Array.isArray(value) ? value : [value];
  return layers
    .map((l) => {
      const parts = [formatDimension(l.offsetX), formatDimension(l.offsetY), formatDimension(l.blur)];
      if (l.spread && l.spread.value !== 0) parts.push(formatDimension(l.spread));
      parts.push(formatColor(l.color));
      return (l.inset ? 'inset ' : '') + parts.join(' ');
    })
    .join(', ');
}

/**
 * DTCG fontFamily (массив) -> CSS-список.
 * Встроенный `fontFamily/css` квотит одинарными кавычками и снимает кавычки
 * с односложных имён; baseline записан двойными — сохраняем его форму.
 */
function formatFontFamily(value) {
  const list = Array.isArray(value) ? value : [value];
  return list.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
}

export const hooks = {
  transforms: {
    'fontFamily/a3-css': {
      type: 'value',
      transitive: true,
      filter: (token) => token.$type === 'fontFamily',
      transform: (token) => formatFontFamily(token.$value),
    },
    'name/a3-path': {
      type: 'name',
      transform: (token) => token.path.join('-'),
    },
    'color/a3-rgba': {
      type: 'value',
      transitive: true,
      filter: (token) => token.$type === 'color',
      transform: (token) => formatColor(token.$value),
    },
    'dimension/a3-px': {
      type: 'value',
      transitive: true,
      filter: (token) => token.$type === 'dimension',
      transform: (token) => formatDimension(token.$value),
    },
    'shadow/a3-css': {
      type: 'value',
      transitive: true,
      filter: (token) => token.$type === 'shadow',
      transform: (token) => formatShadow(token.$value),
    },
  },
};

export const A3_CSS_TRANSFORMS = [
  'name/a3-path',
  'color/a3-rgba',
  'dimension/a3-px',
  'shadow/a3-css',
  'fontFamily/a3-css',
];

export { formatColor, formatDimension, formatShadow, formatFontFamily };
