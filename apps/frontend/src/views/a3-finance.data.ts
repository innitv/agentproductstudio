/**
 * Данные информационной страницы ООО РНКО «А3 Финанс».
 *
 * Один объект на всю страницу — требование `screens.md` (узел 4 «Строка
 * реквизита»): значение ИНН подставляется и в строку таблицы, и в текст
 * согласия формы. Держать их двумя литералами значило бы забыть одно из двух
 * мест в день, когда заказчик подтвердит набор.
 *
 * Тексты сняты с образца и адресуемы по Node ID (`copy-deck.md`); поле
 * `sourceNode` рядом с каждой группой — чтобы правка текста начиналась со
 * сверки с макетом, а не с догадки.
 *
 * ─── ЧТО ЗДЕСЬ НЕ ПРАВДА ────────────────────────────────────────────────────
 * Двадцать позиций `copy-deck.md → Claims To Validate` заказчиком НЕ
 * подтверждены; пять из них (`unsupported`) внутренним признаком выдают себя
 * как заглушки макета: телефон-маска, одинаковые размеры файлов, одна дата на
 * лицензию и все публикации, слово «уточняется» прямо в значении, ссылка
 * «Тарифы» без раздела. Они помечены `unverified: true` и блокируют публикацию,
 * а не вёрстку.
 */

/**
 * Начертание значения.
 *
 * `data` — машиночитаемое: цифры, коды, счета, адрес почты. Моноширинное здесь
 * работает (одинаковая ширина знака помогает сверять и диктовать номер).
 * `prose` — обычная фраза: наименование, адрес, «Совпадает с юридическим».
 * Она набирается Sans, как в образце.
 *
 * Признак живёт у значения, а не у колонки: до 2026-07-29 mono стоял на всей
 * колонке, и шесть прозаических строк из шестнадцати набирались моноширинным.
 * Доля mono на странице выросла вдвое против правила `STYLE_GUIDE.md` («mono
 * несёт ровно три роли», ≈10 %), а строки на mobile выросли до 213 px против
 * 126–178 в образце.
 */
export type ValueKind = "data" | "prose"

/** Строка таблицы реквизитов. */
export interface RequisiteEntry {
  /** Уточнение под подписью — второй уровень, а не скобка (решение 1.7). */
  hint?: string
  /** Начертание значения; по умолчанию `data`. */
  kind?: ValueKind
  label: string
  /** Стабильный ключ: уходит в аналитику вместо значения. */
  slug: string
  /** Значение не подтверждено заказчиком (`Claims To Validate`). */
  unverified?: boolean
  value: string
}

/** Строка списка документов раскрытия. */
export interface DocumentEntry {
  /** `null` означает «файла ещё нет» — строка показывает «Файл готовится». */
  href: string | null
  meta: string
  slug: string
  title: string
}

export interface DocumentGroup {
  heading: string
  items: DocumentEntry[]
}

/** ИНН объявлен отдельной константой: он живёт в двух местах страницы. */
const INN = "9704273233"

/** Реквизиты лицензии: повторяются в hero, деятельности, надзоре и футере. */
export const licence = {
  /** Форма для мета-строк и таблицы: `17.06.2026`. */
  numeric: "№ 3573-К от 17.06.2026",
  number: "№ 3573-К",
  /** Форма для текста: «17 июня 2026 года». */
  verbose: "№ 3573-К · 17 июня 2026 года",
} as const

export const company = {
  address: "125009, г. Москва, Большой Кисловский пер., дом 6, этаж 3",
  email: "info@a3-finance.ru",
  hours: "Пн–Пт, 09:00–18:00 (МСК)",
  inn: INN,
  ogrn: "1267700191703",
  /** Маска из макета: рабочего номера заказчик не дал. */
  phone: "+7 (495) 000-00-00",
  shortName: "ООО РНКО «А3 Финанс»",
} as const

export const hero = {
  callout: {
    label: "ЛИЦЕНЗИЯ БАНКА РОССИИ",
    value: licence.verbose,
  },
  cta: "Задать вопрос",
  lead:
    "Расчётно-финансовое подразделение Группы компаний А3. Управляем движением денежных средств " +
    "в расчётах между банками и поставщиками услуг.",
  /** `41:16` — одна нода с U+2028; в разметке это h1 и следующий абзац. */
  subtitle: "Специализируемся в проведении регулярных транзакций",
  title: "Решения для бизнеса",
} as const

/**
 * Якоря страницы. В шапке — «Документы», как в образце (`41:2`, x=1044).
 *
 * Переименование в «Раскрытие информации» (решение 2 на `06-screens`, довод —
 * «два термина для одного места») откатано 2026-07-29 по замечанию
 * пользователя: стадия поправила образец, не спросив. Довод сам по себе
 * разумный, но он относится к содержанию макета, а значит и решать его
 * заказчику. Если термин надо унифицировать — это отдельная правка образца,
 * а не молчаливое расхождение вёрстки с ним.
 */
export const navigation = [
  { href: "#disclosure", label: "Документы" },
  { href: "#requisites", label: "Реквизиты" },
  { href: "#contacts", label: "Контакты" },
] as const

export const activity = {
  eyebrow: "ДЕЯТЕЛЬНОСТЬ",
  items: [
    "переводы денежных средств без открытия банковских счетов",
    "открытие и ведение банковских счетов юридических лиц",
    "инкассация денежных средств",
  ],
  lead:
    "ООО РНКО «А3 Финанс» — расчётно-финансовое подразделение Группы компаний А3. Компания " +
    "управляет движением денежных средств в расчётах между банками и поставщиками услуг на " +
    "основании лицензии Банка России № 3573-К от 17 июня 2026 года.",
  title: "Деятельность",
} as const

export const disclosure = {
  eyebrow: "РАСКРЫТИЕ ИНФОРМАЦИИ",
  /**
   * Полная десктопная редакция на обеих точках (решение 1.3): нормативная
   * ссылка сама является раскрытием, сокращать её нельзя.
   */
  lead:
    "На этой странице собраны документы и сведения, которые ООО РНКО «А3 Финанс» раскрывает в " +
    "соответствии со ст. 8 Федерального закона № 395-1 «О банках и банковской деятельности», " +
    "Указанием Банка России от 27.11.2018 № 4983-У и требованиями Банка России к сайтам " +
    "финансовых организаций.",
  title: "Раскрытие информации",
} as const

/**
 * Шесть документов. Ссылки проставлены на `/docs/<slug>.pdf` — как в образце,
 * где строки документов активны. Самих PDF пока нет (`Asset Notes` → `blocked`,
 * ждём от заказчика), поэтому до их выкладки ссылка ведёт в 404.
 *
 * Прежнее решение — `href: null` и подпись «Файл готовится» — откатано
 * 2026-07-29 по замечанию пользователя: состояния «готовится» в образце нет,
 * стадии придумали его сами, и отход от макета оказался незамеченным всеми
 * тремя машинными приёмками. Отсутствие файла — вопрос заказчика, а не повод
 * менять дизайн строки.
 */
export const documentGroups: DocumentGroup[] = [
  {
    heading: "Учредительные документы и лицензия",
    items: [
      {
        href: "/docs/charter.pdf",
        meta: "PDF · 480 КБ · 17.06.2026",
        slug: "charter",
        title: "Устав ООО РНКО «А3 Финанс»",
      },
      {
        href: "/docs/licence.pdf",
        meta: "PDF · 480 КБ · 17.06.2026",
        slug: "licence",
        title: "Лицензия Банка России № 3573-К от 17.06.2026",
      },
      {
        href: "/docs/registration.pdf",
        meta: "PDF · 480 КБ · 17.06.2026",
        slug: "registration",
        title: "Свидетельство о государственной регистрации",
      },
    ],
  },
  {
    heading: "Политики",
    items: [
      {
        href: "/docs/privacy-policy.pdf",
        meta: "PDF · 210 КБ · 17.06.2026",
        slug: "privacy-policy",
        title: "Политика обработки персональных данных",
      },
      {
        href: "/docs/privacy-requirements.pdf",
        meta: "PDF · 210 КБ · 17.06.2026",
        slug: "privacy-requirements",
        title: "Сведения о реализуемых требованиях к защите персональных данных",
      },
      {
        href: "/docs/cookie-policy.pdf",
        meta: "PDF · 210 КБ · 17.06.2026",
        slug: "cookie-policy",
        title: "Политика использования файлов cookie",
      },
    ],
  },
]

export const requisites = {
  copyAll: "Скопировать все реквизиты",
  /**
   * Кнопка активна — как в образце. Самого PDF пока нет (ждём от заказчика),
   * до выкладки ссылка ведёт в 404.
   *
   * Прежнее `downloadCardAvailable: false` с подписью «Карточка готовится»
   * откатано 2026-07-29: этого состояния в образце нет, его придумали стадии.
   */
  downloadCard: "Скачать карточку компании (PDF)",
  downloadCardAvailable: true,
  downloadCardHref: "/docs/company-card.pdf",
  eyebrow: "РЕКВИЗИТЫ",
  lead:
    "Реквизиты ООО РНКО «А3 Финанс» для договоров и платежей. Значение каждого поля можно " +
    "скопировать по кнопке или скачать карточку компании целиком.",
  title: "Реквизиты",
} as const

export const requisiteRows: RequisiteEntry[] = [
  {
    kind: "prose",
    label: "Полное наименование",
    slug: "full-name",
    unverified: true,
    value:
      "Общество с ограниченной ответственностью Расчётная небанковская кредитная организация " +
      "«А3 Финанс»",
  },
  {
    kind: "prose",
    label: "Сокращённое наименование",
    slug: "short-name",
    value: company.shortName,
  },
  {
    kind: "prose",
    label: "Наименование на английском языке",
    slug: "name-en",
    unverified: true,
    value: "A3 Finance RNCO LLC",
  },
  { kind: "prose", label: "Юридический адрес", slug: "legal-address", value: company.address },
  {
    kind: "prose",
    label: "Адрес для корреспонденции",
    slug: "postal-address",
    unverified: true,
    value: "Совпадает с юридическим адресом",
  },
  { label: "ОГРН", slug: "ogrn", unverified: true, value: company.ogrn },
  { label: "Дата внесения в ЕГРЮЛ", slug: "egrul-date", unverified: true, value: "17.06.2026" },
  { label: "ИНН", slug: "inn", unverified: true, value: INN },
  { label: "КПП", slug: "kpp", unverified: true, value: "770401001" },
  { label: "ОКПО", slug: "okpo", unverified: true, value: "80245678" },
  { label: "ОКВЭД", slug: "okved", unverified: true, value: "64.19" },
  { label: "Лицензия Банка России", slug: "licence", unverified: true, value: licence.numeric },
  {
    hint: "корреспондентский счёт открыт в",
    kind: "prose",
    label: "Наименование банка",
    slug: "bank-name",
    unverified: true,
    value: "Банк России (уточняется)",
  },
  { label: "БИК", slug: "bik", unverified: true, value: "044525000" },
  {
    label: "Корреспондентский счёт",
    slug: "corr-account",
    unverified: true,
    value: "30101810400000000000",
  },
  { label: "E-mail", slug: "email", value: company.email },
]

export const contacts = {
  eyebrow: "КОНТАКТЫ И ОБРАЩЕНИЯ",
  /*
   * Тот же признак начертания, что и в таблице реквизитов: номер и почта —
   * машиночитаемые, адрес и часы работы — обычная фраза. В образце (`41:312`)
   * последние две набраны Sans 16/26, а не моноширинным.
   */
  items: [
    { kind: "data", label: "ТЕЛЕФОН", value: company.phone },
    { kind: "data", label: "E-MAIL", value: company.email },
    { kind: "prose", label: "АДРЕС", value: company.address },
    { kind: "prose", label: "ЧАСЫ РАБОТЫ", value: company.hours },
  ] satisfies { kind: ValueKind; label: string; value: string }[],
  lead:
    "Если у вас есть вопрос по обслуживанию, договору или обращение в порядке, предусмотренном " +
    "законодательством, заполните форму — ответим на указанный e-mail.",
  title: "Контакты и обращения",
} as const

/**
 * Форма обращения. Подсказка поля «Имя» стоит в описании, а не в плейсхолдере
 * (`Accessibility Notes`: плейсхолдер образца давал 2.58:1 и исчезал при вводе).
 */
export const contactForm = {
  consents: [
    {
      id: "privacy",
      /** Ссылка ведёт на строку документа в секции раскрытия. */
      link: { href: "#disclosure", text: "Политикой обработки персональных данных" },
      required: true,
      text: "Подтверждаю, что ознакомлен с Политикой обработки персональных данных ООО РНКО «А3 Финанс».",
    },
    {
      id: "processing",
      required: true,
      text:
        `Даю согласие ООО РНКО «А3 Финанс» (ИНН ${INN}) на обработку указанных в этой форме ` +
        "персональных данных в целях рассмотрения обращения и ответа на него.",
    },
    {
      id: "newsletter",
      required: false,
      text: "Хочу получать информационные рассылки от ООО РНКО «А3 Финанс» (необязательно).",
    },
  ],
  fields: {
    email: {
      description: "На него придёт ответ",
      label: "E-mail",
      placeholder: "you@example.com",
    },
    message: {
      description: "Опишите вопрос или обращение",
      label: "Сообщение",
      placeholder: "Опишите ваш вопрос или обращение",
    },
    name: {
      /** Подсказка образца из плейсхолдера переехала сюда. */
      description: "Как к вам обращаться",
      label: "Имя",
      placeholder: "",
    },
  },
  requiredNote: "* Обязательный пункт",
  submit: "Отправить обращение",
  /** Подпись кнопки во время отправки (`proposal · требует утверждения`). */
  submitting: "Отправляем…",
  title: "Форма обращения",
} as const

export const supervision = {
  callout:
    "ООО РНКО «А3 Финанс» — небанковская кредитная организация и не участвует в системе " +
    "обязательного страхования вкладов, так как не привлекает вклады физических лиц.",
  columns: [
    {
      label: "ОБРАЩЕНИЕ В БАНК РОССИИ",
      values: [
        { href: "https://cbr.ru/reception", text: "Интернет-приёмная: cbr.ru/reception" },
        { href: "tel:88003003000", text: "Контактный центр: 8 800 300-30-00 (звонок бесплатный)" },
      ],
    },
    {
      label: "ФИНАНСОВЫЙ УПОЛНОМОЧЕННЫЙ",
      values: [
        { href: "tel:88002000010", text: "8 800 200-00-10" },
        { href: "https://finombudsman.ru", text: "finombudsman.ru" },
      ],
    },
  ],
  eyebrow: "НАДЗОР И ЗАЩИТА ПРАВ ПОТРЕБИТЕЛЕЙ",
  footnote:
    "Обращения и претензии рассматриваются ООО РНКО «А3 Финанс» в порядке и сроки, установленные " +
    "законодательством Российской Федерации, включая ч. 12 ст. 5 Федерального закона № 161-ФЗ " +
    "«О национальной платёжной системе».",
  lead:
    "Деятельность ООО РНКО «А3 Финанс» осуществляется на основании лицензии Банка России " +
    "№ 3573-К от 17 июня 2026 года. Банк России осуществляет надзор за деятельностью компании.",
  title: "Надзор и защита прав потребителей",
} as const

/** Ссылка футера. `href: null` — цели нет, пункт не рендерится ссылкой. */
export interface FooterLink {
  /** `tariffs` управляется режимом ниже; остальные ключи — для тестов. */
  key: string
  href: string | null
  /** Подпись рядом с неактивным пунктом. */
  note?: string
  text: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export const footer = {
  columns: [
    {
      heading: "РАЗДЕЛЫ",
      links: [
        { href: "#disclosure", key: "disclosure", text: "Раскрытие информации" },
        /** Раздела «Тарифы» на странице нет — см. `TariffsMode` ниже. */
        { href: null, key: "tariffs", note: "раздел готовится", text: "Тарифы" },
        { href: "#requisites", key: "requisites", text: "Реквизиты" },
      ],
    },
    {
      heading: "ДОКУМЕНТЫ",
      links: [
        { href: "#disclosure", key: "privacy-policy", text: "Политика обработки персональных данных" },
        { href: "#disclosure", key: "cookie-policy", text: "Политика cookie" },
      ],
    },
    {
      heading: "КОНТАКТЫ",
      links: [
        { href: "#contacts", key: "contacts", text: "Контакты" },
        /** Целевой URL заказчиком не задан — пункт остаётся неактивным. */
        {
          href: null,
          key: "cbr-card",
          note: "ссылка уточняется",
          text: "Карточка в реестре ЦБ (cbr.ru)",
        },
      ],
    },
  ] satisfies FooterColumn[],
  copyright: "© ООО РНКО «А3 Финанс», 2026. Все права защищены.",
  licence: "Лицензия Банка России № 3573-К от 17 июня 2026 года · ОГРН 1267700191703",
  name: company.shortName,
  /** Строка возвращается на mobile (решение 1.10). */
  regulated: "Регулируется Банком России",
} as const

/**
 * Решение 3: раздела «Тарифы» нет ни на одной точке образца. Вариант A —
 * пункт не рендерится вовсе; вариант B — остаётся текстом с подписью
 * «раздел готовится». Дефолт первого релиза — A (ответа заказчика нет).
 */
export type TariffsMode = "disabled" | "hidden"

export const cookieBar = {
  accept: "Принять",
  decline: "Отклонить",
  link: { href: "#disclosure", text: "Политике использования файлов cookie" },
  text:
    "Мы используем файлы cookie для работы сайта и сбора статистики. Подробнее — в Политике " +
    "использования файлов cookie.",
} as const

/** Микрокопия состояний. Вся — `proposal · требует утверждения` (`screens.md`). */
export const microcopy = {
  cardUnavailable: "Карточка готовится",
  consentsError: "Отметьте обязательные пункты — без них обращение не может быть обработано",
  copied: (label: string) => `Скопировано: ${label}`,
  copiedAll: "Все реквизиты скопированы",
  copyFailed: "Не удалось скопировать. Выделите значение и нажмите Ctrl+C",
  emailFormat: "Проверьте адрес: он должен быть вида name@example.com",
  emailRequired: "Укажите e-mail — на него придёт ответ",
  fileMissing: "Файл готовится",
  menuClose: "Закрыть меню",
  menuOpen: "Открыть меню",
  messageRequired: "Опишите вопрос или обращение",
  /** Порог 20 знаков предложен на `06-screens`, образцом не задан. */
  messageShort: "Опишите обращение подробнее — не менее 20 знаков",
  nameRequired: "Укажите, как к вам обращаться",
  submitError:
    "Не удалось отправить обращение. Попробуйте ещё раз или напишите на info@a3-finance.ru",
  submitRetry: "Отправить ещё раз",
  /**
   * Срока ответа на странице нет нигде (`copy-deck.md` → «Чего в образце нет»,
   * п. 2), поэтому взята запасная формулировка, совпадающая со сноской 41:373.
   */
  submitSuccess:
    "Обращение отправлено. Ответим на указанный e-mail в порядке и сроки, установленные " +
    "законодательством.",
  submitSuccessTitle: "Обращение отправлено",
} as const

export const seo = {
  description:
    "Расчётно-финансовое подразделение Группы компаний А3. Лицензия Банка России № 3573-К. " +
    "Реквизиты, раскрытие информации, контакты и форма обращения.",
  title: "ООО РНКО «А3 Финанс» — реквизиты, документы, контакты",
} as const

// ─── Валидация формы ────────────────────────────────────────────────────────

export interface ContactFormValues {
  consents: Record<string, boolean>
  email: string
  message: string
  name: string
}

export type ContactFormErrors = Partial<Record<"consents" | "email" | "message" | "name", string>>

export const emptyContactValues: ContactFormValues = {
  consents: { newsletter: false, privacy: false, processing: false },
  email: "",
  message: "",
  name: "",
}

/** Минимальная длина сообщения; порог предложен на `06-screens`. */
export const MESSAGE_MIN_LENGTH = 20

/**
 * Валидация одной функцией на роут и на историю: состояние `Validation` в
 * витрине обязано считаться тем же кодом, что и в приложении, иначе история
 * показывает не то, что увидит пользователь.
 */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {}

  if (!values.name.trim()) errors.name = microcopy.nameRequired
  if (!values.email.trim()) {
    errors.email = microcopy.emailRequired
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = microcopy.emailFormat
  }

  if (!values.message.trim()) {
    errors.message = microcopy.messageRequired
  } else if (values.message.trim().length < MESSAGE_MIN_LENGTH) {
    errors.message = microcopy.messageShort
  }

  const requiredConsents = contactForm.consents.filter((consent) => consent.required)
  if (requiredConsents.some((consent) => !values.consents[consent.id])) {
    errors.consents = microcopy.consentsError
  }

  return errors
}

/** Текст для кнопки «Скопировать все реквизиты»: подпись + значение построчно. */
export function formatAllRequisites(rows: RequisiteEntry[] = requisiteRows): string {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n")
}
