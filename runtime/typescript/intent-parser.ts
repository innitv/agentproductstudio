export type ExecutableCommand = "start" | "resume" | "status" | "run-stage";

export interface ParsedIntent {
  command: ExecutableCommand;
  args: string[];
  stageId?: string;
  confidence: "high" | "medium" | "low";
}

// Семантические паттерны для глобальных команд движка
const commandPatterns = {
  start: [
    /начать\s+воркфлоу/i,
    /новый\s+проект/i,
    /новый\s+лендинг/i,
    /создай\s+лендинг/i,
    /start\s+landing/i,
    /start\s+workflow/i,
    /create\s+project/i,
  ],
  resume: [
    /продолжить\s+запуск/i,
    /продолжи\s+воркфлоу/i,
    /resume\s+workflow/i,
    /поехали\s+дальше/i,
    /погнали\s+дальше/i,
    /следующий\s+шаг/i,
    /continue/i,
    /resume/i,
  ],
  status: [
    /покажи\s+статус/i,
    /workflow\s+status/i,
    /что\s+готово/i,
    /статус\s+проекта/i,
    /status\s+check/i,
    /show\s+status/i,
  ],
};

// Семантические паттерны для сопоставления с этапами (stages)
const stagePatterns: Record<string, RegExp[]> = {
  "01-research": [
    /сделай\s+ресерч/i,
    /проведи\s+исследование/i,
    /исследуй\s+конкурентов/i,
    /запусти\s+исследование/i,
    /обнови\s+исследование/i,
    /run\s+research/i,
    /start\s+research/i,
    /deep\s+research/i,
  ],
  "02-prd": [
    /напиши\s+prd/i,
    /сформируй\s+требования/i,
    /подготовь\s+тз/i,
    /обнови\s+prd/i,
    /перепиши\s+требования/i,
    /generate\s+prd/i,
    /create\s+prd/i,
    /product\s+requirements/i,
  ],
  "03-ia": [
    /спроектируй\s+структуру/i,
    /сделай\s+карту\s+сайта/i,
    /нарисуй\s+user\s+flow/i,
    /сделай\s+sitemap/i,
    /обнови\s+архитектуру/i,
    /переделай\s+sitemap/i,
    /make\s+sitemap/i,
    /design\s+architecture/i,
    /create\s+sitemap/i,
  ],
  "04-design": [
    /подготовь\s+дизайн-бриф/i,
    /создай\s+дизайн/i,
    /сделай\s+дизайн-спеку/i,
    /создай\s+визуальную\s+концепцию/i,
    /собери\s+макет/i,
    /собери\s+макеты/i,
    /собери\s+use\s*cases/i,
    /собери\s+(?:app\s*)?flow/i,
    /собери\s+мобильн(?:ое|ые)\s+(?:приложение|макеты|экраны)/i,
    /макеты\s+в\s+figma/i,
    /интерфейс\s+приложения/i,
    /мобильн(?:ое|ые)\s+(?:приложение|макеты|экраны)/i,
    /mobile\s+app\s+screens/i,
    /app\s+ui\s+flow/i,
    /проанализируй\s+референс/i,
    /обнови\s+дизайн/i,
    /make\s+design\s+brief/i,
    /create\s+design\s+brief/i,
    /analyze\s+reference/i,
  ],
  "05-copy": [
    /напиши\s+тексты/i,
    /сделай\s+copy\s+deck/i,
    /подготовь\s+тексты/i,
    /напиши\s+копирайт/i,
    /обнови\s+тексты/i,
    /перепиши\s+копирайт/i,
    /write\s+copywriting/i,
    /generate\s+copy/i,
    /copy\s+deck/i,
  ],
  "06-screens": [
    /сгенерируй\s+спецификацию\s+экранов/i,
    /создай\s+экраны/i,
    /опиши\s+экраны/i,
    /обнови\s+спецификацию\s+экранов/i,
    /обнови\s+экраны/i,
    /generate\s+screens/i,
    /create\s+screens/i,
  ],
  "07-prototype": [
    /создай\s+прототип/i,
    /сделай\s+transition\s+map/i,
    /разработай\s+карту\s+переходов/i,
    /обнови\s+прототип/i,
    /переделай\s+карту\s+переходов/i,
    /make\s+transition\s+map/i,
    /create\s+prototype/i,
  ],
  "08-frontend": [
    /напиши\s+код/i,
    /сверстай\s+лендинг/i,
    /реализуй\s+фронтенд/i,
    /собери\s+интерфейс/i,
    /обнови\s+верстку/i,
    /поправь\s+стили/i,
    /исправь\s+фронтенд/i,
    /implement\s+frontend/i,
    /create\s+ui\s+code/i,
    /build\s+frontend/i,
    /update\s+ui/i,
  ],
  "09-visual-reference": [
    /сравни\s+с\s+референсом/i,
    /провери\s+скриншоты/i,
    /запусти\s+visual\s+diff/i,
    /сравни\s+скрины/i,
    /visual\s+diff/i,
    /compare\s+screens/i,
    /screenshot\s+comparison/i,
  ],
  "10-test-bench": [
    /запусти\s+тест-бенч/i,
    /протестируй\s+воронку/i,
    /проверь\s+аналитику/i,
    /обнови\s+тесты/i,
    /перезапусти\s+тест-бенч/i,
    /run\s+test\s+bench/i,
    /test\s+funnel/i,
    /rerun\s+test\s+bench/i,
  ],
  "11-qa": [
    /проверь\s+качество/i,
    /запусти\s+qa/i,
    /проведи\s+аудит\s+качества/i,
    /сделай\s+ревью/i,
    /обнови\s+qa/i,
    /перепроверь\s+качество/i,
    /run\s+qa\s+review/i,
    /check\s+quality/i,
    /rerun\s+qa/i,
  ],
  "12-release": [
    /выкатывай\s+релиз/i,
    /подготовь\s+релиз/i,
    /сделай\s+релиз-ноутс/i,
    /выкати\s+релиз/i,
    /обнови\s+релиз/i,
    /release\s+now/i,
    /create\s+release\s+notes/i,
    /update\s+release/i,
  ],
};

/**
 * Распознает намерение пользователя и возвращает структурированный результат
 */
export function parseUserIntent(prompt: string): ParsedIntent | null {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Проверяем локальные триггеры конкретных стадий (run-stage)
  // Мы ищем совпадения с паттернами стадий, так как это наиболее частые точечные запросы
  for (const [stageId, patterns] of Object.entries(stagePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        return {
          command: "run-stage",
          stageId,
          args: [],
          confidence: "high",
        };
      }
    }
  }

  // 2. Проверяем глобальные триггеры команд
  for (const [cmd, patterns] of Object.entries(commandPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        return {
          command: cmd as ExecutableCommand,
          args: [],
          confidence: "high",
        };
      }
    }
  }

  // 3. Нечеткий эвристический поиск
  // Если в тексте упоминается ключевое слово стадии, но нет явного глагола действия
  if (/ресерч|исследов|конкурент|research/i.test(trimmed)) {
    return { command: "run-stage", stageId: "01-research", args: [], confidence: "medium" };
  }
  if (/prd|требован|тз|requirements/i.test(trimmed)) {
    return { command: "run-stage", stageId: "02-prd", args: [], confidence: "medium" };
  }
  if (/sitemap|user\s*flow|карту\s+сайта|структур|архитектур/i.test(trimmed)) {
    return { command: "run-stage", stageId: "03-ia", args: [], confidence: "medium" };
  }
  if (/макет|use\s*cases|app\s*flow|мобильн(?:ое|ые)\s+(?:приложение|макеты|экраны)|интерфейс\s+приложения|дизайн|оформлен|стиль|визуаль|design/i.test(trimmed)) {
    return { command: "run-stage", stageId: "04-design", args: [], confidence: "medium" };
  }
  if (/текст|копирайт|copy|deck/i.test(trimmed)) {
    return { command: "run-stage", stageId: "05-copy", args: [], confidence: "medium" };
  }
  if (/экран|screens/i.test(trimmed)) {
    return { command: "run-stage", stageId: "06-screens", args: [], confidence: "medium" };
  }
  if (/прототип|prototype|переход/i.test(trimmed)) {
    return { command: "run-stage", stageId: "07-prototype", args: [], confidence: "medium" };
  }
  if (/верстк|код|фронтенд|frontend|ui/i.test(trimmed)) {
    return { command: "run-stage", stageId: "08-frontend", args: [], confidence: "medium" };
  }
  if (/скрин|diff|референс/i.test(trimmed)) {
    return { command: "run-stage", stageId: "09-visual-reference", args: [], confidence: "medium" };
  }
  if (/тест|аналитик|воронк|bench/i.test(trimmed)) {
    return { command: "run-stage", stageId: "10-test-bench", args: [], confidence: "medium" };
  }
  if (/qa|качество|аудит/i.test(trimmed)) {
    return { command: "run-stage", stageId: "11-qa", args: [], confidence: "medium" };
  }
  if (/релиз|release|выкатить/i.test(trimmed)) {
    return { command: "run-stage", stageId: "12-release", args: [], confidence: "medium" };
  }

  // 4. Если ничего не подошло, считаем это стартом нового воркфлоу с переданной целью
  return {
    command: "start",
    args: [trimmed],
    confidence: "low",
  };
}
