/**
 * Мобильная приёмка приложения (Mobile Device Acceptance Gate).
 *
 * Каркас из `agent-pack/templates/mobile-acceptance.template.mjs` с CONFIG под
 * маршрут #card-request-shadcn — единственный продуктовый экран
 * приложения. Запуск — `yarn qa:mobile`.
 *
 * Норма живёт в `agent-pack/skills/design-engineering/SKILL.md`
 * (раздел «Mobile Device Acceptance Gate»). Этот файл — её исполняемый каркас:
 * механика переносима между продуктами, продуктовыми остаются только селекторы,
 * маршруты и ожидания. Копируется в продукт (обычно `tests/mobile-acceptance.check.mjs`),
 * заполняется блок `CONFIG` — и запускается.
 *
 * ─── ЗАЧЕМ ОН ЕСТЬ ──────────────────────────────────────────────────────────
 * Пять сценариев ниже выведены не из теории: каждый закрывает баг, который
 * прошёл все desktop-проверки и всплыл у пользователя на живом iPhone
 * (run `contractor-payment-demo`, 2026-07-23…25). Общая причина всех пяти —
 * приёмка велась узким desktop-вьюпортом (`setViewportSize`), а он не
 * воспроизводит ни touch-события, ни safe-area, ни `visualViewport`. Поэтому
 * контекст здесь берётся ИЗ ПРОФИЛЯ УСТРОЙСТВА (`isMobile`, `hasTouch`,
 * `deviceScaleFactor`), а жесты подаются настоящими тач-событиями через CDP.
 *
 * ─── ЧТО ЗДЕСЬ ПЕРЕНОСИМО (не трогай при копировании) ───────────────────────
 *   • контекст из `devices[...]` и запрет узкого вьюпорта как приёмки;
 *   • свайп настоящими touchStart/touchMove/touchEnd через CDP;
 *   • замер `scrollTop`/`scrollLeft` до и после жеста;
 *   • метка узла скролл-контейнера (ловит подмену узла, а не только сдвиг);
 *   • чтение цвета ОТРИСОВАННОГО пикселя в системной зоне (не CSS-переменной);
 *   • перебор реальных ширин и высот устройств;
 *   • генерация `mobile-acceptance.json` и строки `engine_limitation`.
 *
 * ─── ЧТО ПРОДУКТОВОЕ (заполняется в CONFIG) ─────────────────────────────────
 *   маршруты, селекторы (`data-testid`), prelude-шаги до нужного состояния,
 *   ожидаемые цвета и пороги, список ширин/высот.
 *
 * ─── ЗАПУСК ─────────────────────────────────────────────────────────────────
 *   node tests/mobile-acceptance.check.mjs --base=http://127.0.0.1:4173
 *   node tests/mobile-acceptance.check.mjs --base=https://<деплой> --out=test-results/mobile
 *
 *   Требования: Node >= 20, установленный `playwright` с браузером chromium
 *   (`yarn playwright install chromium`). Внешних зависимостей больше нет:
 *   декодер PNG для чтения пикселя встроен ниже.
 *
 *   Коды выхода: 0 — приёмка пройдена; 1 — есть провалившийся сценарий;
 *   2 — CONFIG не заполнен или заполнен противоречиво (приёмка не запускалась).
 *
 * ─── СТРУКТУРА `mobile-acceptance.json` (машиночитаемый результат) ──────────
 * Это будущая опора валидатора, поэтому ключи и `id` сценариев менять нельзя —
 * меняются только значения. Формат:
 *
 * {
 *   "schema": "mobile-acceptance/v1",
 *   "generated_at": "2026-07-25T10:00:00.000Z",   // ISO 8601
 *   "base_url": "https://…",
 *   "device_profile": {                            // чем именно проверяли
 *     "name": "iPhone 15",                         // имя из playwright devices
 *     "viewport": { "width": 393, "height": 852 },
 *     "device_scale_factor": 3,
 *     "is_mobile": true,                           // обязан быть true
 *     "has_touch": true,                           // обязан быть true
 *     "user_agent": "…"
 *   },
 *   "engine": {
 *     "browser": "chromium",
 *     "version": "…",
 *     "unverified": ["…"]                          // что движок не воспроизводит
 *   },
 *   "engine_limitation": "engine_limitation: приёмка в Chromium device profile …",
 *   "scenarios": [                                 // ровно 5, порядок и id стабильны
 *     {
 *       "id": "touch_scroll_from_content",         // см. SCENARIO_IDS ниже
 *       "title": "…",                              // человекочитаемое имя сценария
 *       "status": "pass" | "fail" | "not_applicable",
 *       "reason": "…",                             // обязателен при not_applicable
 *       "detail": "…",                             // одна строка для отчёта человеку
 *       "measurements": { … }                      // сырые числа замера, формат свободный
 *     }
 *   ],
 *   "summary": {
 *     "pass": 4, "fail": 0, "not_applicable": 1,
 *     "verdict": "pass" | "fail"                   // fail, если есть fail или нет ни одного pass
 *   }
 * }
 *
 * Строка `engine_limitation` копируется в `frontend-result.md` и в секцию
 * `Responsive` файла `qa-report.md` дословно — без неё статус не выше
 * `pass_with_known_limitations`.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";

import { chromium, devices } from "playwright";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG — ЕДИНСТВЕННОЕ МЕСТО, КОТОРОЕ ЗАПОЛНЯЕТ ПРОДУКТ
// ═══════════════════════════════════════════════════════════════════════════
/*
 * Правила заполнения:
 *   • строка вида "<ЗАПОЛНИ: …>" — незаполненное поле. Пока хоть одна такая
 *     строка жива, скрипт НЕ запускает браузер и падает с кодом 2 и списком
 *     полей. Это намеренно: молча проходящая незаполненная приёмка хуже, чем
 *     её отсутствие — она создаёт ложную запись «гейт пройден».
 *   • сценарий, неприменимый к продукту, помечается `skip: "причина"`. Тогда
 *     его незаполненные поля игнорируются, а в отчёт идёт
 *     `status: "not_applicable"` с этой причиной. Причина обязана быть
 *     продуктовой («в интерфейсе нет оверлеев»), а не «не успели».
 *   • селектор `":root"` в поле скроллера означает «скроллит сама страница»
 *     (используется `document.scrollingElement`).
 */
const CONFIG = {
  /** База по умолчанию; перекрывается флагом --base=. */
  baseUrl: "http://127.0.0.1:4173",

  /**
   * Имя профиля из playwright `devices`. НЕ заменять на setViewportSize:
   * узкий desktop-вьюпорт приёмкой не считается (см. норму).
   */
  device: "iPhone 15",

  /** Куда класть `mobile-acceptance.json` и скриншоты (относительно корня продукта). */
  outDir: "test-results/mobile-acceptance",

  app: {
    /** Экран заявки прокручивает сам документ: внутренних скроллеров нет. */
    scrollContainer: ":root",
    /** Корневой узел приложения — временно прячется в сценарии 2. */
    root: "#root",
  },

  engine: {
    unverified: [
      "тонирование системных панелей Safari по theme-color и фону страницы",
      "поведение visualViewport при появлении панелей браузера и клавиатуры",
      "захват оси вложенным скроллером в WebKit",
      "resize от сворачивания адресной строки",
    ],
  },

  scenarios: {
    // ── 1. Скролл от касания контента ────────────────────────────────────
    touch_scroll_from_content: {
      route: "/#card-request-shadcn",
      /*
       * Жест подаётся в координатах вьюпорта, поэтому цель обязана быть на
       * экране. `tap` в prelude прокручивает элемент в вид и одновременно
       * выполняет обратимое действие (выбор категории расходов).
       */
      prelude: [{ tap: '[data-testid="card-request-shadcn-category-education"]' }],
      /** Свайп ОБЯЗАН начинаться на интерактивном элементе, не на пустом фоне. */
      touchTarget: '[data-testid="card-request-shadcn-category-taxi"]',
      /*
       * Горизонтального скроллера на этом экране нет: ряд категорий собран на
       * `ToggleGroup` с переносом строк (`flex-wrap`), а не на карусели.
       * Горизонтальная ось будет помечена как неприменимая.
       */
      horizontalScroller: null,
      /** Минимальный сдвиг в px, который считается «прокрутилось». */
      minDelta: 40,
    },

    // ── 2. Fixed/sticky и фон против safe-area ───────────────────────────
    safe_area_and_fixed: {
      route: "/#card-request-shadcn",
      prelude: [],
      stickyPanels: [
        '[data-testid="card-request-shadcn-topbar"]',
        '[data-testid="card-request-shadcn-actionbar"]',
      ],
      /**
       * `theme-color` в приложении не используется: под одним документом живут
       * синий лендинг и нейтральные продуктовые экраны, и единый тег красил бы
       * системные панели неверно на одном из них.
       */
      themeColor: null,
      requireViewportFitCover: true,
      /**
       * Ожидаемый цвет канвы — `--background` штатной темы реестра
       * (`oklch(1 0 0)`, то есть чистый белый). Красит его правило
       * `html[data-shadcn-theme]` из сгенерированных токенов: атрибут
       * зеркалится на корень документа именно ради этой зоны.
       *
       * Значение меняется вместе с темой: проектная тема со своим фоном
       * потребует замерить пиксель заново, иначе сценарий 2 поймает не
       * «системная зона осталась некрашеной», а собственную устаревшую цифру.
       */
      expectedCanvasColor: [255, 255, 255],
      colorTolerance: 1,
    },

    // ── 3. Появление оверлея/баннера/клавиатуры ──────────────────────────
    overlay_appearance: {
      route: "/#card-request-shadcn",
      prelude: [],
      /*
       * Триггер — «Сохранить черновик»: он показывает уведомление sonner и НЕ
       * меняет высоту страницы. Отправка сюда не годится: при ошибке она
       * дорисовывает подписи ошибок в поток, то есть меняет высоту документа
       * по существу, а не из-за оверлея.
       */
      trigger: '[data-testid="card-request-shadcn-draft"]',
      /** Уведомление sonner: собственная разметка библиотеки, портал на body. */
      overlay: "[data-sonner-toast]",
      /** Якорь композиции: нижняя панель не должна сдвинуться. */
      layoutAnchor: '[data-testid="card-request-shadcn-actionbar"]',
      settleMs: 1500,
    },

    // ── 4. Композиция на реальных ширинах устройств ──────────────────────
    composition_widths: {
      route: "/#card-request-shadcn",
      prelude: [],
      widths: [390, 430],
      heights: [664, 852],
      anchors: [
        '[data-testid="card-request-shadcn-title"]',
        '[data-testid="card-request-shadcn-actionbar"]',
        '[data-testid="card-request-shadcn-submit"]',
        '[data-testid="card-request-shadcn-draft"]',
      ],
      mustNotOverlap: [
        // Две кнопки панели: на 390px они переносятся в столбец, наезд означал
        // бы, что перенос сломан.
        [
          '[data-testid="card-request-shadcn-draft"]',
          '[data-testid="card-request-shadcn-submit"]',
        ],
        // Заголовок против панели действий: ловит экран, где панель съела шапку.
        [
          '[data-testid="card-request-shadcn-title"]',
          '[data-testid="card-request-shadcn-actionbar"]',
        ],
      ],
    },

    // ── 5. Позиция прокрутки при смене состояния ─────────────────────────
    scroll_position_on_state_change: {
      route: "/#card-request-shadcn",
      prelude: [],
      scrollTo: "third",
      /*
       * Сохранение черновика: состояние меняется (появляется уведомление),
       * поток страницы не меняется, кнопка живёт в фиксированной панели и тап
       * по ней не прокручивает страницу сам по себе.
       */
      trigger: '[data-testid="card-request-shadcn-draft"]',
      appears: "[data-sonner-toast]",
      settleMs: 1500,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Ниже — переносимая механика. При копировании в продукт менять не нужно.
// ═══════════════════════════════════════════════════════════════════════════

/** Порядок и id сценариев зафиксированы: на них будет опираться валидатор. */
const SCENARIO_IDS = [
  ["touch_scroll_from_content", "Скролл от касания контента, обе оси"],
  ["safe_area_and_fixed", "Fixed/sticky и фон против safe-area"],
  ["overlay_appearance", "Появление оверлея/баннера/клавиатуры"],
  ["composition_widths", "Композиция на реальных ширинах устройств"],
  ["scroll_position_on_state_change", "Позиция прокрутки при смене состояния"],
];

const PLACEHOLDER = "<ЗАПОЛНИ";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);

// ─── Проверка заполненности CONFIG ─────────────────────────────────────────
/*
 * Выполняется ДО запуска браузера: незаполненный шаблон обязан падать быстро и
 * говорить, что именно не заполнено, а не «проходить» на пустых селекторах.
 */
function collectPlaceholders(value, trail, found) {
  if (typeof value === "string") {
    if (value.startsWith(PLACEHOLDER)) found.push({ path: trail, hint: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPlaceholders(item, `${trail}[${index}]`, found));
    return;
  }
  if (value && typeof value === "object") {
    // Осознанно исключённый сценарий не обязан быть заполнен.
    if (typeof value.skip === "string" && value.skip.trim() && !value.skip.startsWith(PLACEHOLDER)) {
      return;
    }
    for (const [key, item] of Object.entries(value)) {
      collectPlaceholders(item, trail ? `${trail}.${key}` : key, found);
    }
  }
}

function validateConfig() {
  const problems = [];
  const unfilled = [];
  collectPlaceholders(CONFIG, "", unfilled);
  for (const item of unfilled) {
    problems.push(`не заполнено: CONFIG.${item.path} — ${item.hint}`);
  }

  if (!devices[CONFIG.device]) {
    problems.push(
      `CONFIG.device: профиль "${CONFIG.device}" не найден в playwright devices. ` +
        `Возьми любой мобильный профиль, например iPhone 15 или Pixel 7.`,
    );
  } else if (!devices[CONFIG.device].isMobile || !devices[CONFIG.device].hasTouch) {
    problems.push(
      `CONFIG.device: профиль "${CONFIG.device}" не мобильный (isMobile/hasTouch). ` +
        `Приёмка в таком профиле нормой не засчитывается.`,
    );
  }

  for (const [id] of SCENARIO_IDS) {
    const scenario = CONFIG.scenarios[id];
    if (!scenario) {
      problems.push(`CONFIG.scenarios.${id}: сценарий нормы удалён — верни его или поставь skip.`);
      continue;
    }
    if (typeof scenario.skip === "string" && !scenario.skip.trim()) {
      problems.push(`CONFIG.scenarios.${id}.skip: причина пустая, а она обязательна.`);
    }
  }

  const composition = CONFIG.scenarios.composition_widths;
  if (!composition?.skip && (composition?.widths?.length ?? 0) < 2) {
    problems.push(
      "CONFIG.scenarios.composition_widths.widths: нужно минимум две реальные ширины — " +
        "одна ширина скрывает переполнение и точки переноса.",
    );
  }

  if (!Array.isArray(CONFIG.engine?.unverified) || CONFIG.engine.unverified.length === 0) {
    problems.push(
      "CONFIG.engine.unverified: список пуст. Пустой список означал бы, что у Chromium " +
        "нет расхождений с WebKit — это неправда, и строка engine_limitation выйдет ложной.",
    );
  }

  const skipped = SCENARIO_IDS.filter(([id]) => CONFIG.scenarios[id]?.skip).length;
  if (skipped === SCENARIO_IDS.length) {
    problems.push(
      "Все пять сценариев помечены skip — это не приёмка. Хотя бы один сценарий " +
        "обязан выполняться, иначе поверхность просто не проверена.",
    );
  }

  if (problems.length > 0) {
    console.error("\nШАБЛОН НЕ ЗАПОЛНЕН — мобильная приёмка НЕ запускалась.\n");
    problems.forEach((line, index) => console.error(`  ${index + 1}. ${line}`));
    console.error(
      "\nЧто делать: заполнить поле продуктовым значением ЛИБО пометить сценарий\n" +
        '  skip: "продуктовая причина неприменимости".\n' +
        "Норма: agent-pack/skills/design-engineering/SKILL.md, Mobile Device Acceptance Gate.\n",
    );
    process.exit(2);
  }
}

validateConfig();

const BASE = (args.base ?? CONFIG.baseUrl).replace(/\/$/, "");
const OUT = path.resolve(process.cwd(), args.out ?? CONFIG.outDir);
mkdirSync(OUT, { recursive: true });

const PROFILE = devices[CONFIG.device];

// ─── Чтение пикселя отрисованного кадра ────────────────────────────────────
/*
 * Зачем пиксель, а не CSS. Требование «в системной зоне фон такой-то»
 * проверяется по отрисованному кадру: канву за боксом страницы браузер красит
 * по своим правилам распространения фона, и чтение объявленных свойств
 * пересказало бы намерение вместо результата.
 *
 * Поддержан ровно тот формат, который отдаёт Playwright: 8 бит на канал,
 * RGB или RGBA, без чересстрочности. Зависимостей не требует.
 */
const PNG_SIGNATURE = "89504e470d0a1a0a";

function decodePng(buffer) {
  if (buffer.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) {
    throw new Error("PNG: неверная сигнатура файла");
  }
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const chunks = [];

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error("PNG: чересстрочный формат не поддержан");
    } else if (type === "IDAT") {
      chunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`PNG: не поддержан формат bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);

  // Расфильтровка построчно (PNG spec §9): строка несёт код фильтра со
  // ссылками на левый (a), верхний (b) и верхне-левый (c) пиксели.
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos];
    pos += 1;
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const current = pixels.subarray(y * stride, (y + 1) * stride);
    const previous = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let i = 0; i < stride; i += 1) {
      const a = i >= channels ? current[i - channels] : 0;
      const b = previous ? previous[i] : 0;
      const c = i >= channels && previous ? previous[i - channels] : 0;
      const x = line[i];
      let value;
      switch (filter) {
        case 0:
          value = x;
          break;
        case 1:
          value = x + a;
          break;
        case 2:
          value = x + b;
          break;
        case 3:
          value = x + ((a + b) >> 1);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          value = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          throw new Error(`PNG: неизвестный код фильтра ${filter}`);
      }
      current[i] = value & 0xff;
    }
  }

  return { width, height, channels, pixels };
}

/** Средний цвет изображения — устойчив к субпиксельному сглаживанию. */
function averageColor(png) {
  const total = [0, 0, 0];
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const index = y * png.width * png.channels + x * png.channels;
      total[0] += png.pixels[index];
      total[1] += png.pixels[index + 1];
      total[2] += png.pixels[index + 2];
    }
  }
  const count = png.width * png.height;
  return total.map((sum) => Math.round(sum / count));
}

const sameColor = (left, right, tolerance) =>
  Boolean(left) && Boolean(right) && left.every((v, i) => Math.abs(v - right[i]) <= tolerance);

const formatRgb = (color) => (color ? `rgb(${color.join(", ")})` : "—");

// ─── Общая механика прогона ────────────────────────────────────────────────

const results = [];

function record(id, title, status, detail, measurements = {}, reason = "") {
  results.push({ id, title, status, reason, detail, measurements });
  const badge = status === "pass" ? "PASS" : status === "fail" ? "FAIL" : "N/A ";
  console.log(`${badge}  ${id} — ${title}\n      ${detail}`);
}

const browser = await chromium.launch();

/**
 * Открывает страницу В ПРОФИЛЕ УСТРОЙСТВА.
 *
 * Именно здесь проходит граница между приёмкой и её имитацией: контекст берёт
 * `isMobile`, `hasTouch` и `deviceScaleFactor` из профиля, поэтому браузер
 * поднимает touch-конвейер и мобильный layout. `viewport` перекрывается только
 * размерами (сценарий 4 перебирает реальные ширины и высоты) — тач и DPR
 * остаются от устройства.
 */
async function withDevice(route, fn, viewport) {
  const context = await browser.newContext({
    ...PROFILE,
    ...(viewport ? { viewport } : {}),
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  try {
    return await fn(page, cdp);
  } finally {
    await context.close();
  }
}

/**
 * Настоящий свайп пальцем: touchStart → серия touchMove → touchEnd.
 *
 * `Input.dispatchTouchEvent` идёт через тот же конвейер ввода, что и жест на
 * устройстве, поэтому уважает `touch-action`, `overflow` и вложенность
 * прокручиваемых контейнеров — ровно то, что и ломается. Эмуляция мыши
 * (`page.mouse.*`) этого не проверяет вовсе.
 */
async function swipe(page, cdp, { x, y, dx, dy, steps = 12 }) {
  const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  await send("touchStart", [{ x, y }]);
  for (let i = 1; i <= steps; i += 1) {
    await send("touchMove", [{ x: x + (dx * i) / steps, y: y + (dy * i) / steps }]);
    await page.waitForTimeout(16);
  }
  await send("touchEnd", []);
  await page.waitForTimeout(450);
}

/** Центр видимого бокса элемента — точка приложения жеста. */
async function centerOf(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`элемент не найден или невидим: ${selector}`);
  return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
}

/**
 * Prelude — шаги до нужного состояния. Держится данными, а не кодом, чтобы
 * продукт описывал свой путь в CONFIG и не правил механику.
 * Поддержано: { tap }, { fill: { selector, value } }, { waitFor }, { wait }.
 */
async function runSteps(page, steps = []) {
  for (const step of steps) {
    if (step.tap) {
      await page.locator(step.tap).first().tap();
    } else if (step.fill) {
      await page.locator(step.fill.selector).first().fill(step.fill.value);
    } else if (step.waitFor) {
      await page.waitForSelector(step.waitFor, { timeout: step.timeout ?? 8000 });
    } else if (typeof step.wait === "number") {
      await page.waitForTimeout(step.wait);
    } else {
      throw new Error(`неизвестный шаг prelude: ${JSON.stringify(step)}`);
    }
    await page.waitForTimeout(step.settleMs ?? 150);
  }
}

/**
 * Состояние скроллера + метка узла.
 *
 * `probeId` ставится один раз на узел: если после смены состояния он пропал,
 * значит узел размонтирован и пересоздан. Это отдельная причина «прыжка»
 * прокрутки, и без метки она неотличима от обычного сдвига.
 */
function scrollState(page, selector) {
  return page.evaluate((sel) => {
    const el = sel === ":root" ? document.scrollingElement : document.querySelector(sel);
    if (!el) return null;
    if (!el.dataset.probeId) el.dataset.probeId = String(Math.floor(Math.random() * 1e6));
    return {
      probeId: el.dataset.probeId,
      top: Math.round(el.scrollTop),
      left: Math.round(el.scrollLeft),
      maxTop: Math.round(el.scrollHeight - el.clientHeight),
      maxLeft: Math.round(el.scrollWidth - el.clientWidth),
    };
  }, selector);
}

const rectOf = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Number(r.top.toFixed(1)),
      bottom: Number(r.bottom.toFixed(1)),
      left: Number(r.left.toFixed(1)),
      right: Number(r.right.toFixed(1)),
      width: Number(r.width.toFixed(1)),
      height: Number(r.height.toFixed(1)),
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
    };
  }, selector);

/** Общая обёртка: skip → not_applicable, исключение → fail с текстом ошибки. */
async function runScenario(id, title, body) {
  const config = CONFIG.scenarios[id];
  if (config?.skip) {
    record(id, title, "not_applicable", `сценарий исключён: ${config.skip}`, {}, config.skip);
    return;
  }
  try {
    await body(config);
  } catch (error) {
    record(id, title, "fail", `сценарий не отработал: ${error.message}`, {
      error: String(error.message),
    });
  }
}

// ═══ 1. Скролл от касания контента, обе оси ════════════════════════════════
await runScenario(SCENARIO_IDS[0][0], SCENARIO_IDS[0][1], async (config) => {
  const container = CONFIG.app.scrollContainer;
  const data = await withDevice(config.route, async (page, cdp) => {
    await runSteps(page, config.prelude);

    // Вертикаль: жест начинается НА интерактивном элементе, а не на фоне.
    const target = await centerOf(page, config.touchTarget);
    const beforeV = await scrollState(page, container);
    await swipe(page, cdp, { x: target.x, y: target.y, dx: 0, dy: -200 });
    const afterV = await scrollState(page, container);

    // Горизонталь: ряд обязан ехать сам, и вертикальный жест с него обязан
    // листать страницу (иначе ряд захватил обе оси).
    let horizontal = null;
    if (config.horizontalScroller) {
      const row = await centerOf(page, config.horizontalScroller);
      const rowBefore = await scrollState(page, config.horizontalScroller);
      await swipe(page, cdp, { x: row.x, y: row.y, dx: -160, dy: 0 });
      const rowAfter = await scrollState(page, config.horizontalScroller);

      const pageBefore = await scrollState(page, container);
      const row2 = await centerOf(page, config.horizontalScroller);
      await swipe(page, cdp, { x: row2.x, y: row2.y, dx: 0, dy: -200 });
      const pageAfter = await scrollState(page, container);

      horizontal = { rowBefore, rowAfter, pageBefore, pageAfter };
    }

    return { beforeV, afterV, horizontal };
  });

  if (!data.beforeV) throw new Error(`скроллер не найден: ${container}`);

  const min = config.minDelta;
  // Контент помещается целиком — вертикальную ось проверять не на чем.
  const verticalApplicable = data.beforeV.maxTop > min;
  const verticalOk = !verticalApplicable || data.afterV.top - data.beforeV.top >= min;

  const rowOk =
    !data.horizontal || data.horizontal.rowAfter.left - data.horizontal.rowBefore.left >= min;
  const axisOk =
    !data.horizontal ||
    data.horizontal.pageAfter.top - data.horizontal.pageBefore.top >= min ||
    data.horizontal.pageBefore.maxTop <= min;

  const detail =
    `вертикальный свайп с ${config.touchTarget}: scrollTop ${data.beforeV.top}→${data.afterV.top} ` +
    `(ход ${data.beforeV.maxTop})` +
    (verticalApplicable ? "" : "; контейнер не прокручивается — ось неприменима") +
    (data.horizontal
      ? `; ряд scrollLeft ${data.horizontal.rowBefore.left}→${data.horizontal.rowAfter.left}; ` +
        `вертикаль с ряда: страница ${data.horizontal.pageBefore.top}→${data.horizontal.pageAfter.top}` +
        (axisOk ? "" : " — РЯД ЗАХВАТИЛ ВЕРТИКАЛЬНУЮ ОСЬ")
      : "; горизонтального скроллера в интерфейсе нет");

  record(
    SCENARIO_IDS[0][0],
    SCENARIO_IDS[0][1],
    verticalOk && rowOk && axisOk ? "pass" : "fail",
    detail,
    data,
  );
});

// ═══ 2. Fixed/sticky и фон против safe-area ════════════════════════════════
await runScenario(SCENARIO_IDS[1][0], SCENARIO_IDS[1][1], async (config) => {
  /**
   * Цвет канвы за пределами бокса страницы — тех самых зон, которые на
   * устройстве закрыты панелями браузера. Внутри вьюпорта их не видно, поэтому
   * зонд создаёт их искусственно: корень приложения прячется, бокс `html`
   * временно ужимается до 60% высоты. Всё, что ниже, — канва за пределами
   * страницы, то есть ровно нижняя системная зона.
   */
  const data = await withDevice(config.route, async (page) => {
    await runSteps(page, config.prelude);
    await page.waitForTimeout(400);

    const dom = await page.evaluate((rootSel) => {
      const tags = [...document.querySelectorAll('meta[name="theme-color"]')];
      let usesSafeAreaInsets = false;
      try {
        usesSafeAreaInsets = [...document.styleSheets].some((sheet) =>
          [...sheet.cssRules].some((rule) => /safe-area-inset/.test(rule.cssText)),
        );
      } catch {
        // Внешние стили с другого origin читать нельзя — это не ошибка теста.
        usesSafeAreaInsets = null;
      }
      return {
        themeCount: tags.length,
        themeContent: tags[0]?.content ?? null,
        viewportMeta: document.querySelector('meta[name="viewport"]')?.content ?? "",
        htmlBackground: getComputedStyle(document.documentElement).backgroundColor,
        rootFound: Boolean(document.querySelector(rootSel)),
        usesSafeAreaInsets,
      };
    }, CONFIG.app.root);

    const panels = [];
    for (const selector of config.stickyPanels) {
      panels.push({ selector, rect: await rectOf(page, selector) });
    }

    const edgePixel = async (edge) => {
      const { width, height } = page.viewportSize();
      const shot = await page.screenshot({
        clip: { x: Math.round(width / 2), y: edge === "top" ? 0 : height - 1, width: 1, height: 1 },
      });
      return averageColor(decodePng(shot));
    };

    await page.evaluate((rootSel) => {
      const root = document.querySelector(rootSel);
      if (root) root.style.display = "none";
      document.documentElement.style.height = "60vh";
    }, CONFIG.app.root);
    await page.waitForTimeout(80);
    const canvas = { top: await edgePixel("top"), bottom: await edgePixel("bottom") };
    await page.evaluate((rootSel) => {
      const root = document.querySelector(rootSel);
      if (root) root.style.display = "";
      document.documentElement.style.height = "";
    }, CONFIG.app.root);

    return { ...dom, panels, canvas };
  });

  if (!data.rootFound) throw new Error(`корень приложения не найден: ${CONFIG.app.root}`);

  const expected = config.expectedCanvasColor;
  const tolerance = config.colorTolerance ?? 1;
  const themeOk =
    config.themeColor === null ||
    (data.themeCount === 1 && data.themeContent === config.themeColor);
  const viewportOk =
    !config.requireViewportFitCover || /viewport-fit\s*=\s*cover/.test(data.viewportMeta);
  const canvasOk =
    sameColor(data.canvas.top, expected, tolerance) &&
    sameColor(data.canvas.bottom, expected, tolerance);
  const panelsOk = data.panels.every(
    (panel) =>
      panel.rect && panel.rect.top >= -0.5 && panel.rect.bottom <= panel.rect.viewportH + 0.5,
  );

  record(
    SCENARIO_IDS[1][0],
    SCENARIO_IDS[1][1],
    themeOk && viewportOk && canvasOk && panelsOk ? "pass" : "fail",
    `theme-color ${data.themeContent} ×${data.themeCount} (ожидали ${config.themeColor}); ` +
      `viewport-fit=cover=${viewportOk}; канва верх ${formatRgb(data.canvas.top)} / низ ` +
      `${formatRgb(data.canvas.bottom)} (ожидали ${formatRgb(expected)}); ` +
      `панели в границах вьюпорта=${panelsOk}; safe-area-inset в стилях=${data.usesSafeAreaInsets}`,
    data,
  );
});

// ═══ 3. Появление оверлея/баннера/клавиатуры ═══════════════════════════════
await runScenario(SCENARIO_IDS[2][0], SCENARIO_IDS[2][1], async (config) => {
  const container = CONFIG.app.scrollContainer;
  const data = await withDevice(config.route, async (page) => {
    await runSteps(page, config.prelude);
    await page.waitForTimeout(300);

    // Замер ДО: положение якоря композиции и высота содержимого.
    const anchorBefore = await rectOf(page, config.layoutAnchor);
    const scrollBefore = await scrollState(page, container);

    if (config.trigger) await page.locator(config.trigger).first().tap();
    await page.waitForSelector(config.overlay, { timeout: 8000 });
    await page.waitForTimeout(config.settleMs ?? 1500);

    const overlay = await rectOf(page, config.overlay);
    const anchorAfter = await rectOf(page, config.layoutAnchor);
    const scrollAfter = await scrollState(page, container);
    return { anchorBefore, anchorAfter, overlay, scrollBefore, scrollAfter };
  });

  if (!data.overlay) throw new Error(`оверлей не найден: ${config.overlay}`);
  if (!data.anchorBefore) throw new Error(`якорь композиции не найден: ${config.layoutAnchor}`);

  // Виден целиком: ни одна кромка не выходит за вьюпорт.
  const fullyVisible =
    data.overlay.top >= -0.5 &&
    data.overlay.bottom <= data.overlay.viewportH + 0.5 &&
    data.overlay.left >= -0.5 &&
    data.overlay.right <= data.overlay.viewportW + 0.5;
  // Перекрывает контент, а не сжимает страницу: якорь не сдвинулся, высота
  // содержимого не изменилась.
  const anchorStable = Math.abs(data.anchorBefore.top - (data.anchorAfter?.top ?? NaN)) < 1;
  const contentStable =
    !data.scrollBefore ||
    !data.scrollAfter ||
    data.scrollBefore.maxTop === data.scrollAfter.maxTop;

  record(
    SCENARIO_IDS[2][0],
    SCENARIO_IDS[2][1],
    fullyVisible && anchorStable && contentStable ? "pass" : "fail",
    `оверлей y ${data.overlay.top}…${data.overlay.bottom} при высоте вьюпорта ` +
      `${data.overlay.viewportH} (виден целиком=${fullyVisible}); якорь ` +
      `${data.anchorBefore.top}→${data.anchorAfter?.top} (не сдвинулся=${anchorStable}); ` +
      `ход прокрутки ${data.scrollBefore?.maxTop}→${data.scrollAfter?.maxTop} ` +
      `(страница не сжата=${contentStable})`,
    data,
  );
});

// ═══ 4. Композиция на реальных ширинах устройств ═══════════════════════════
await runScenario(SCENARIO_IDS[3][0], SCENARIO_IDS[3][1], async (config) => {
  const rows = [];
  const measurements = [];
  let ok = true;

  for (const width of config.widths) {
    for (const height of config.heights) {
      const size = await withDevice(
        config.route,
        async (page) => {
          await runSteps(page, config.prelude);
          await page.waitForTimeout(500);

          const overflow = await page.evaluate(() => ({
            docScrollW: document.documentElement.scrollWidth,
            docClientW: document.documentElement.clientWidth,
          }));

          const anchors = {};
          for (const selector of config.anchors) {
            anchors[selector] = await rectOf(page, selector);
          }
          const pairs = [];
          for (const [a, b] of config.mustNotOverlap ?? []) {
            pairs.push({ a, b, rectA: await rectOf(page, a), rectB: await rectOf(page, b) });
          }
          return { overflow, anchors, pairs };
        },
        { width, height },
      );

      // Горизонтальное переполнение — классическая мобильная поломка, которую
      // одна ширина скрывает.
      const noOverflow = size.overflow.docScrollW <= size.overflow.docClientW + 1;
      const anchorsOk = Object.values(size.anchors).every(
        (rect) =>
          rect &&
          rect.width > 0 &&
          rect.left >= -0.5 &&
          rect.right <= rect.viewportW + 0.5 &&
          rect.top >= -0.5 &&
          rect.bottom <= rect.viewportH + 0.5,
      );
      const missingAnchor = Object.entries(size.anchors)
        .filter(([, rect]) => !rect)
        .map(([selector]) => selector);
      const overlapping = size.pairs.filter(({ rectA, rectB }) => {
        if (!rectA || !rectB) return true; // элемент пары исчез — композиция не та
        return !(
          rectA.bottom <= rectB.top + 0.5 ||
          rectB.bottom <= rectA.top + 0.5 ||
          rectA.right <= rectB.left + 0.5 ||
          rectB.right <= rectA.left + 0.5
        );
      });

      const passed = noOverflow && anchorsOk && overlapping.length === 0;
      if (!passed) ok = false;
      measurements.push({ width, height, ...size, passed });
      if (!passed) {
        rows.push(
          `${width}×${height}: переполнение по горизонтали ${noOverflow ? "нет" : "ЕСТЬ"} ` +
            `(${size.overflow.docScrollW}/${size.overflow.docClientW})` +
            (missingAnchor.length > 0 ? `, НЕТ ЭЛЕМЕНТОВ: ${missingAnchor.join(", ")}` : "") +
            (anchorsOk ? "" : ", якоря выходят за вьюпорт") +
            (overlapping.length > 0
              ? `, НАЕЗД: ${overlapping.map((p) => `${p.a} × ${p.b}`).join("; ")}`
              : ""),
        );
      }
    }
  }

  record(
    SCENARIO_IDS[3][0],
    SCENARIO_IDS[3][1],
    ok ? "pass" : "fail",
    ok
      ? `проверено ${config.widths.length}×${config.heights.length} размеров ` +
          `(${config.widths.join("/")} × ${config.heights.join("/")}): переполнения нет, ` +
          `якоря видны целиком, наездов нет`
      : rows.join(" | "),
    { sizes: measurements },
  );
});

// ═══ 5. Позиция прокрутки при смене состояния ══════════════════════════════
await runScenario(SCENARIO_IDS[4][0], SCENARIO_IDS[4][1], async (config) => {
  const container = CONFIG.app.scrollContainer;
  const data = await withDevice(config.route, async (page) => {
    await runSteps(page, config.prelude);
    await page.waitForTimeout(300);

    const initial = await scrollState(page, container);
    if (!initial) throw new Error(`скроллер не найден: ${container}`);

    // Отматываем в произвольное место: пользователь редко стоит в нуле, а
    // именно из середины прыжок и заметен.
    const wanted =
      typeof config.scrollTo === "number"
        ? config.scrollTo
        : Math.round(initial.maxTop / 3);
    await page.evaluate(
      ({ sel, value }) => {
        const el = sel === ":root" ? document.scrollingElement : document.querySelector(sel);
        el.scrollTop = value;
      },
      { sel: container, value: wanted },
    );
    await page.waitForTimeout(250);

    const before = await scrollState(page, container);
    await page.locator(config.trigger).first().tap();
    await page.waitForSelector(config.appears, { timeout: 8000 });
    await page.waitForTimeout(config.settleMs ?? 1500);
    const after = await scrollState(page, container);

    return { initial, wanted, before, after };
  });

  const sameNode = data.before?.probeId === data.after?.probeId;
  const samePosition = data.before?.top === data.after?.top;
  // Если контейнер вообще не прокручиваем, замер бессмысленен: сообщаем честно.
  const applicable = (data.initial?.maxTop ?? 0) > 0;

  record(
    SCENARIO_IDS[4][0],
    SCENARIO_IDS[4][1],
    !applicable ? "not_applicable" : sameNode && samePosition ? "pass" : "fail",
    `scrollTop ${data.before?.top}→${data.after?.top} (ход ${data.initial?.maxTop}); ` +
      `узел контейнера ${sameNode ? "тот же" : "ПОДМЕНЁН — состояние прокрутки живёт в DOM и теряется вместе с узлом"}`,
    data,
    applicable ? "" : "контейнер не прокручивается: прыжку прокрутки взяться неоткуда",
  );
});

await browser.close();

// ═══ Отчёт ════════════════════════════════════════════════════════════════

const version = browser.version?.() ?? "";
const engineLimitation =
  `engine_limitation: приёмка в Chromium device profile ${CONFIG.device}; ` +
  `WebKit/Safari-специфика (${CONFIG.engine.unverified.join("; ")}) локально ` +
  `не воспроизводится, финальное подтверждение — живое устройство.`;

const summary = {
  pass: results.filter((r) => r.status === "pass").length,
  fail: results.filter((r) => r.status === "fail").length,
  not_applicable: results.filter((r) => r.status === "not_applicable").length,
};
summary.verdict = summary.fail === 0 && summary.pass > 0 ? "pass" : "fail";

const report = {
  schema: "mobile-acceptance/v1",
  generated_at: new Date().toISOString(),
  base_url: BASE,
  device_profile: {
    name: CONFIG.device,
    viewport: PROFILE.viewport,
    device_scale_factor: PROFILE.deviceScaleFactor,
    is_mobile: PROFILE.isMobile,
    has_touch: PROFILE.hasTouch,
    user_agent: PROFILE.userAgent,
  },
  engine: { browser: "chromium", version, unverified: CONFIG.engine.unverified },
  engine_limitation: engineLimitation,
  // Порядок сценариев — порядок нормы; сценарии не перемешивать.
  scenarios: SCENARIO_IDS.map(([id, title]) => {
    const found = results.find((r) => r.id === id);
    return (
      found ?? {
        id,
        title,
        status: "fail",
        reason: "",
        detail: "сценарий не отработал и не оставил записи",
        measurements: {},
      }
    );
  }),
  summary,
};

const reportPath = path.join(OUT, "mobile-acceptance.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log(
  `\nПрофиль: ${CONFIG.device} (${PROFILE.viewport.width}×${PROFILE.viewport.height}, ` +
    `DPR ${PROFILE.deviceScaleFactor}, hasTouch=${PROFILE.hasTouch})`,
);
console.log(engineLimitation);
console.log(
  `Итог: pass ${summary.pass} / fail ${summary.fail} / not_applicable ${summary.not_applicable} ` +
    `→ ${summary.verdict}`,
);
console.log(`Отчёт: ${path.relative(process.cwd(), reportPath)}`);

process.exit(summary.verdict === "pass" ? 0 : 1);
