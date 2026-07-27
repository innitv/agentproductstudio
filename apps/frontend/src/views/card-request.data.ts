/**
 * Данные пилотного экрана «Заявка на выпуск корпоративной карты».
 *
 * Это ШОВ РАЗВЯЗКИ между витриной и приложением. `CardRequestShadcnView` —
 * презентационный компонент: он не знает, откуда пришли справочники и куда
 * уходит заявка. Здесь лежит всё, что в проде отдавал бы бэкенд (справочники,
 * черновик, список согласующих) плюс чистая валидация, которая обязана быть
 * одинаковой в истории и в роуте.
 *
 * Кто чем пользуется:
 *   • story  — берёт фикстуры напрямую и подаёт статус/ошибки как пропсы,
 *              поэтому каждое состояние детерминировано и снимается скриншотом;
 *   • роут   — берёт те же справочники через `loadCardRequestCatalog()` и
 *              вычисляет статус сам, обработчиками.
 *
 * Файл намеренно `.ts`, а не `.tsx`: в справочниках нет React-узлов, иначе
 * фикстуры перестали бы быть данными и превратились бы во вторую вёрстку.
 */

/** Тип носителя: виртуальная карта выпускается сразу, пластик едет курьером. */
export type CardKind = "virtual" | "plastic";

/** Цель заявки. `reissue` включает в форме блок с номером старой карты. */
export type CardRequestPurpose = "new" | "reissue";

/** Состояние отправки. Живёт снаружи вида — им управляет роут или story. */
export type CardRequestStatus = "idle" | "submitting" | "success" | "error";

export interface CardRequestValues {
  cardKind: CardKind;
  /** Идентификаторы разрешённых категорий расходов. */
  categories: string[];
  currency: string;
  employeeEmail: string;
  employeeName: string;
  /** Строка, а не число: поле ввода хранит то, что набрал человек. */
  monthlyLimit: string;
  notifyEmployee: boolean;
  purpose: CardRequestPurpose;
  reasoning: string;
  reissueCardNumber: string;
  requireConfirmation: boolean;
  rulesAccepted: boolean;
  unit: string;
}

export type CardRequestField = keyof CardRequestValues;

export type CardRequestErrors = Partial<Record<CardRequestField, string>>;

export interface CardRequestOption {
  hint?: string;
  label: string;
  value: string;
}

export interface CardRequestReviewer {
  id: string;
  name: string;
  role: string;
  /** `passed` — согласование уже пройдено на прошлой заявке сотрудника. */
  state: "passed" | "waiting";
}

export interface CardRequestCatalog {
  /** Лимит, выше которого заявку дополнительно смотрит финансовый директор. */
  approvalThresholdRub: number;
  categories: CardRequestOption[];
  currencies: CardRequestOption[];
  /** Номер заявки: приходит с бэкенда вместе с черновиком. */
  requestNumber: string;
  reviewers: CardRequestReviewer[];
  units: CardRequestOption[];
}

/** Максимальная длина обоснования — совпадает с ограничением поля в бэкенде. */
export const REASONING_MAX_LENGTH = 400;

/** Минимальная длина обоснования: короче регламент согласования не принимает. */
export const REASONING_MIN_LENGTH = 30;

export const cardRequestCatalog: CardRequestCatalog = {
  approvalThresholdRub: 150_000,
  categories: [
    { label: "Такси и каршеринг", value: "taxi" },
    { label: "Командировки", value: "travel" },
    { label: "Реклама и продвижение", value: "ads" },
    { label: "Софт и подписки", value: "software" },
    { label: "Представительские", value: "hospitality" },
    { label: "Обучение", value: "education" },
  ],
  currencies: [
    { hint: "Основной счёт", label: "Рубль, RUB", value: "rub" },
    { hint: "Счёт 40702 · USD", label: "Доллар США, USD", value: "usd" },
    { hint: "Счёт 40702 · EUR", label: "Евро, EUR", value: "eur" },
  ],
  requestNumber: "CR-2418",
  reviewers: [
    { id: "head", name: "Марина Ковалёва", role: "Руководитель подразделения", state: "waiting" },
    { id: "finance", name: "Отдел финансового контроля", role: "Проверка лимитов", state: "waiting" },
    { id: "security", name: "Служба безопасности", role: "Проверка сотрудника", state: "passed" },
  ],
  units: [
    { hint: "12 активных карт", label: "Коммерческий департамент", value: "sales" },
    { hint: "4 активные карты", label: "Маркетинг", value: "marketing" },
    { hint: "27 активных карт", label: "Инженерия", value: "engineering" },
    { hint: "Выпуск карт приостановлен", label: "Логистика", value: "logistics" },
  ],
};

/** Пустая заявка: с неё начинается работа в роуте. */
export const emptyCardRequestValues: CardRequestValues = {
  cardKind: "virtual",
  categories: [],
  currency: "rub",
  employeeEmail: "",
  employeeName: "",
  monthlyLimit: "",
  notifyEmployee: true,
  purpose: "new",
  reasoning: "",
  reissueCardNumber: "",
  requireConfirmation: false,
  rulesAccepted: false,
  unit: "",
};

/**
 * Черновик, который в проде вернул бы бэкенд для уже начатой заявки.
 * Используется историями как «нормальное заполненное состояние экрана».
 */
export const draftCardRequestValues: CardRequestValues = {
  cardKind: "virtual",
  categories: ["taxi", "travel", "software"],
  currency: "rub",
  employeeEmail: "d.orlov@a3.example",
  employeeName: "Орлов Денис Игоревич",
  monthlyLimit: "80000",
  notifyEmployee: true,
  purpose: "new",
  reasoning:
    "Сотрудник ведёт четыре региональных проекта и оплачивает такси и проживание из личных средств. " +
    "Корпоративная карта убирает авансовые отчёты и ускоряет закрытие месяца.",
  reissueCardNumber: "",
  requireConfirmation: false,
  rulesAccepted: true,
  unit: "sales",
};

/** Заявка с лимитом выше порога: включает предупреждение о доп. согласовании. */
export const highLimitCardRequestValues: CardRequestValues = {
  ...draftCardRequestValues,
  monthlyLimit: "260000",
  requireConfirmation: true,
};

/** Заявка на перевыпуск: раскрывает блок с номером старой карты. */
export const reissueCardRequestValues: CardRequestValues = {
  ...draftCardRequestValues,
  cardKind: "plastic",
  purpose: "reissue",
  reasoning:
    "Пластиковая карта размагничена после поездки, терминалы её не читают. " +
    "Нужен перевыпуск с сохранением лимитов и категорий.",
  reissueCardNumber: "5486 •••• •••• 2043",
};

/** Заявка, которую валидация не пропускает: источник состояния `error`. */
export const invalidCardRequestValues: CardRequestValues = {
  ...emptyCardRequestValues,
  categories: [],
  employeeEmail: "d.orlov",
  employeeName: "Орлов",
  monthlyLimit: "0",
  reasoning: "Нужна карта.",
  unit: "logistics",
};

/** Разбирает введённый лимит: пробелы и неразрывные пробелы — не цифры. */
export function parseMonthlyLimit(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length > 0 ? Number(digits) : Number.NaN;
}

/** Формат суммы для подписей интерфейса. */
export function formatRub(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

/**
 * Валидация заявки. Одна функция на историю и на роут: если бы правила
 * дублировались, история показывала бы ошибки, которых в приложении нет.
 */
export function validateCardRequest(
  values: CardRequestValues,
  catalog: CardRequestCatalog = cardRequestCatalog,
): CardRequestErrors {
  const errors: CardRequestErrors = {};

  if (values.employeeName.trim().split(/\s+/).length < 2) {
    errors.employeeName = "Укажите фамилию и имя сотрудника полностью";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.employeeEmail)) {
    errors.employeeEmail = "Нужна рабочая почта в домене компании";
  }

  if (!values.unit) {
    errors.unit = "Выберите подразделение";
  } else if (catalog.units.find((unit) => unit.value === values.unit)?.value === "logistics") {
    errors.unit = "В этом подразделении выпуск карт приостановлен";
  }

  const limit = parseMonthlyLimit(values.monthlyLimit);

  if (!Number.isFinite(limit) || limit <= 0) {
    errors.monthlyLimit = "Укажите месячный лимит числом";
  }

  if (values.purpose === "reissue" && values.reissueCardNumber.trim().length === 0) {
    errors.reissueCardNumber = "Укажите номер карты, которую перевыпускаем";
  }

  if (values.categories.length === 0) {
    errors.categories = "Выберите хотя бы одну категорию расходов";
  }

  if (values.reasoning.trim().length < REASONING_MIN_LENGTH) {
    errors.reasoning = `Обоснование короче ${REASONING_MIN_LENGTH} символов не проходит согласование`;
  }

  if (!values.rulesAccepted) {
    errors.rulesAccepted = "Без подтверждения регламента заявку не примут";
  }

  return errors;
}

/**
 * Точка загрузки справочников. Сегодня отдаёт локальную фикстуру синхронно;
 * когда появится API, меняется только эта функция — вид и истории не трогаются.
 */
export function loadCardRequestCatalog(): CardRequestCatalog {
  return cardRequestCatalog;
}
