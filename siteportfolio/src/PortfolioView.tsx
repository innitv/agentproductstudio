import * as React from "react";
import "./styles.css";

type CompanyId = "a3" | "rtk" | "smlt";

type CaseDetailSection = {
  title: string;
  body?: string[];
  items?: string[];
  quote?: string;
  image?: {
    alt: string;
    caption: string;
    src: string;
  };
  images?: {
    alt: string;
    caption: string;
    src: string;
  }[];
};

type CaseStudy = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  type: string;
  year: string;
  duration: string;
  impact: string;
  summary: string;
  context: string;
  problem: string;
  solution: string[];
  result: string[];
  detailSections?: CaseDetailSection[];
  preview: "dashboard" | "flow" | "mobile" | "table" | "map";
};

type Company = {
  id: CompanyId;
  index: string;
  name: string;
  industry: string;
  years: string;
  role: string;
  team: string;
  description: string;
  cases: CaseStudy[];
};

const companies: Company[] = [
  {
    id: "a3",
    index: "I",
    name: "А3",
    industry: "B2B-платежи",
    years: "2022—2024",
    role: "Ведущий продуктовый дизайнер",
    team: "Продукт, разработка, поддержка",
    description:
      "Платежные сценарии для бизнеса: главный экран кабинета, регистрация, дизайн-система, токены и AI-эксперименты для landing/research.",
    cases: [
      {
        id: "dashboard-redesign",
        index: "I",
        title: "Редизайн главной",
        subtitle: "Из промо-блока в рабочий B2B-dashboard",
        type: "UX Research · Redesign",
        year: "2023",
        duration: "5 месяцев",
        impact: "быстрее путь к действиям",
        summary:
          "Главная страница кабинета перестала быть витриной и стала рабочей панелью со статусами, KPI, событиями и быстрыми действиями.",
        context:
          "В кабинете А3 бизнес работает с платежами, реестрами, начислениями, заявками и подключенными банками. До редизайна первый экран занимал промо-блок, а операционный статус приходилось искать глубже.",
        problem:
          "Пользователь не видел, что требует внимания прямо сейчас: платежи, импорт, экспорт реестра, подключение банка или заявки. Ключевые действия были спрятаны и часто приводили к обращению в поддержку.",
        solution: [
          "Собрать первый экран вокруг статусов бизнеса, а не вокруг промо-сообщения.",
          "Вывести быстрые действия: создать платеж, импортировать оплату, выгрузить реестр, подключить банк.",
          "Добавить событийный блок и KPI, чтобы пользователь понимал, что произошло с деньгами и документами.",
        ],
        result: [
          "Главный экран стал рабочей точкой входа в ежедневные операции.",
          "Ключевые сценарии стали видны без поиска по меню.",
          "У поддержки меньше поводов объяснять пользователю, где находится нужное действие.",
        ],
        preview: "dashboard",
      },
      {
        id: "flow",
        index: "II",
        title: "Оптимизация флоу",
        subtitle: "Регистрация поставщика без заявки менеджеру в самостоятельном digital-флоу",
        type: "UX · Conversion",
        year: "2023",
        duration: "3 месяца",
        impact: "Self-service onboarding",
        summary:
          "Редизайн разделил вход и регистрацию, убрал ожидание менеджера и собрал получение доступа в один понятный сценарий.",
        context:
          "В старой версии вход и регистрация в ЛК поставщика были объединены в сценарий «Вход или регистрация»: пользователь вводил email, но не понимал, что произойдет дальше — вход, регистрация или заявка на подключение. Для нового пользователя путь фактически становился не регистрацией, а заявкой: нужно было заполнить информацию о платеже и контакты, после чего система сообщала, что менеджер свяжется в течение одного рабочего дня.",
        problem:
          "Главный барьер был в потере контроля: новый пользователь не получал мгновенный доступ к кабинету и не понимал статус процесса. Это создавало риск низкой конверсии в регистрацию, высокого drop на первом шаге, роста обращений в поддержку и чат, отложенной активации и потери пользователей, которые ожидали самостоятельную регистрацию.",
        solution: [
          "Разделить логику входа и регистрации, чтобы пользователь понимал, какой сценарий запускает после ввода email.",
          "Перевести подключение нового пользователя из заявки через менеджера в самостоятельный digital-сценарий.",
          "Сократить путь входа для существующего пользователя и убрать неопределенность на первом шаге.",
          "Сделать получение доступа частью регистрации, без ожидания ответа операционной команды.",
        ],
        result: [
          "Вход существующего пользователя сократился с примерно 45-70 секунд до примерно 20-35 секунд.",
          "Регистрация нового пользователя стала занимать примерно 2.5-3.5 минуты без ожидания менеджера до одного рабочего дня.",
          "Сценарий стал понятнее: вход короче, регистрация самостоятельная, а получение доступа происходит в рамках digital-флоу.",
          "Редизайн снизил зависимость от операционной команды и уменьшил нагрузку на поддержку за счет перехода от заявки к self-service onboarding.",
        ],
        detailSections: [
          {
            title: "Цель проекта",
            body: [
              "Упростить вход и регистрацию в ЛК поставщика, сократить время прохождения сценария и перевести регистрацию из заявки через менеджера в самостоятельный digital-флоу.",
            ],
            image: {
              alt: "Форма входа после редизайна",
              caption: "Форма входа",
              src: "https://ivan-ignatov.online/assets/a3-flow-figma-hero-CsT6xTUU.png",
            },
          },
          {
            title: "До редизайна",
            body: [
              "В старой версии вход и регистрация были объединены в сценарий «Вход или регистрация». Пользователь вводил email, но не понимал, что произойдет дальше: вход, регистрация или заявка на подключение.",
              "Для нового пользователя сценарий фактически становился не регистрацией, а заявкой: нужно было заполнить информацию о платеже и контактные данные, после чего система показывала сообщение, что менеджер свяжется в течение одного рабочего дня.",
              "Главный барьер заключался в том, что пользователь не получал мгновенный доступ к кабинету и терял контроль над процессом.",
            ],
            images: [
              {
                alt: "Старая форма входа",
                caption: "Форма входа до редизайна",
                src: "https://ivan-ignatov.online/assets/a3-flow-old-login-CMMyur3R.png",
              },
              {
                alt: "Старая регистрация пользователя",
                caption: "Регистрация пользователя до редизайна",
                src: "https://ivan-ignatov.online/assets/a3-flow-old-registration-Ba-PShoo.png",
              },
            ],
          },
          {
            title: "Проблемы и гипотезы",
            items: [
              "В старой версии вход и регистрация были объединены в сценарий «Вход или регистрация». Пользователь вводил email, но не понимал, что произойдет дальше: вход, регистрация или заявка на подключение.",
              "Для нового пользователя сценарий фактически становился не регистрацией, а заявкой: нужно было заполнить информацию о платеже и контактные данные, после чего система показывала сообщение, что менеджер свяжется в течение одного рабочего дня.",
              "Главный барьер заключался в том, что пользователь не получал мгновенный доступ к кабинету и терял контроль над процессом.",
            ],
          },
          {
            title: "Исследования и метрики до редизайна",
            items: [
              "Вход существующего пользователя: примерно 45-70 секунд.",
              "Вход с ошибкой email или пароля: примерно 1.5-3 минуты.",
              "Регистрация / подключение нового пользователя: 2-4 минуты на заполнение формы плюс ожидание до 1 рабочего дня.",
              "При ошибке отправки заявки сценарий ломался, и пользователь должен был идти в чат.",
            ],
          },
          {
            title: "Основные риски",
            items: [
              "Низкая конверсия в регистрацию.",
              "Высокий drop на первом шаге из-за неопределенности.",
              "Рост обращений в поддержку и чат.",
              "Отложенная активация пользователя.",
              "Потеря пользователей, которые ожидали регистрацию.",
            ],
          },
          {
            title: "Решение",
            body: [
              "Сценарий разделили на два понятных пути: вход существующего пользователя и регистрацию нового поставщика. Регистрация перестала быть заявкой менеджеру и стала самостоятельным digital-флоу.",
            ],
            items: [
              "Разделить логику входа и регистрации, чтобы после ввода email пользователь понимал, какой сценарий запускает.",
              "Сократить путь входа для существующего пользователя и убрать неопределенность на первом шаге.",
              "Встроить получение доступа в регистрацию без ожидания ответа операционной команды.",
            ],
            images: [
              {
                alt: "Упрощенная форма регистрации",
                caption: "Упрощенная форма",
                src: "https://ivan-ignatov.online/assets/a3-flow-new-simplified-form-SVANcMpZ.png",
              },
              {
                alt: "Форма входа после редизайна",
                caption: "Форма входа после редизайна",
                src: "https://ivan-ignatov.online/assets/a3-flow-figma-hero-CsT6xTUU.png",
              },
            ],
          },
          {
            title: "После редизайна",
            items: [
              "Вход существующего пользователя: примерно 20-35 секунд.",
              "Регистрация нового пользователя: примерно 2.5-3.5 минуты.",
              "Получение доступа: в рамках одного digital-сценария, без ожидания менеджера.",
            ],
          },
          {
            title: "Итоги",
            body: [
              "Редизайн переводит регистрацию из ручного процесса с менеджером в самостоятельный digital-сценарий. Это снижает зависимость от операционной команды, ускоряет активацию новых пользователей и уменьшает нагрузку на поддержку.",
              "Сценарий стал понятнее, короче для входа и самостоятельным для регистрации. Основной результат — переход от заявки и ожидания менеджера к self-service onboarding.",
            ],
          },
        ],
        preview: "flow",
      },
      {
        id: "design-system",
        index: "III",
        title: "Дизайн-система",
        subtitle: "Компоненты, состояния, токены и правила handoff",
        type: "Design System",
        year: "2023",
        duration: "12 месяцев",
        impact: "меньше расхождений",
        summary:
          "Дизайн-система собрала компоненты, варианты, состояния, токены и правила передачи макетов в разработку.",
        context:
          "Команда развивала несколько платежных сценариев параллельно. Без общей системы одинаковые элементы расходились в поведении, размерах и описании состояний.",
        problem:
          "Макеты становились дорогими в поддержке: таблицы, формы, статусы, пустые состояния и ошибки каждый раз собирались заново.",
        solution: [
          "Описать компоненты через свойства и варианты.",
          "Зафиксировать состояния, слоты, размеры и токены.",
          "Сделать правила handoff понятными для дизайнеров и разработки.",
        ],
        result: [
          "Команда быстрее собирает новые сценарии.",
          "Состояния интерфейса стали предсказуемыми.",
          "Разработка получает меньше неоднозначных макетов.",
        ],
        preview: "table",
      },
    ],
  },
  {
    id: "rtk",
    index: "II",
    name: "РТК",
    industry: "B2C-сервисы",
    years: "2020—2022",
    role: "Продуктовый дизайнер",
    team: "Web, iOS, Android, продукт",
    description:
      "Подписки, управление услугами, web-сценарии и onboarding: интерфейсы для массового пользователя, где важно быстро понять состояние услуги.",
    cases: [
      {
        id: "subscriptions",
        index: "I",
        title: "Подписки",
        subtitle: "Управление подпиской без обращения в поддержку",
        type: "Product Design",
        year: "2021",
        duration: "4 месяца",
        impact: "поддержка −30%",
        summary:
          "Новая иерархия и понятные CTA помогли пользователям управлять подпиской без лишнего текста и поддержки.",
        context:
          "Пользователь хотел понять, что подключено, сколько это стоит и как изменить подписку. Старый экран перегружал текстом и слабо выделял действия.",
        problem:
          "Не было ясной визуальной иерархии: управление подпиской терялось среди описаний, а вопросы уходили в поддержку.",
        solution: [
          "Разделить статус, выгоды, стоимость и действия.",
          "Сделать CTA заметным и привязанным к конкретному состоянию подписки.",
          "Сократить текст до того, что помогает принять решение.",
        ],
        result: [
          "CTA вырос на 18 п.п.",
          "Оценка пользователей поднялась до 4.6/5.",
          "Обращения в поддержку по теме подписок снизились на 30%.",
        ],
        preview: "mobile",
      },
      {
        id: "web-services",
        index: "II",
        title: "Услуги Web",
        subtitle: "Понятный выбор опций и подключение услуги",
        type: "UX · Web",
        year: "2021",
        duration: "3 месяца",
        impact: "конверсия 3% -> 7%",
        summary:
          "Раздел услуг стал понятнее: пользователь видит пакет, условия и действие подключения без чтения длинной страницы.",
        context:
          "Опции выглядели разрозненно и не объясняли, чем пакет полезен. Пользователь часто покидал раздел до выбора.",
        problem:
          "Слабая структура страницы мешала понять, какая услуга нужна и что произойдет после подключения.",
        solution: [
          "Переупаковать услуги в сравнимые блоки.",
          "Показать главное действие рядом с условиями.",
          "Убрать визуальные разрывы между описанием, ценой и подключением.",
        ],
        result: [
          "Конверсия выросла с 3% до 7%.",
          "CTA пакета вырос с 5% до 25%.",
          "Время в разделе увеличилось до 2.5 минут.",
        ],
        preview: "dashboard",
      },
      {
        id: "onboarding",
        index: "III",
        title: "Онбординг",
        subtitle: "Первый запуск сервиса без базовых вопросов",
        type: "Onboarding",
        year: "2022",
        duration: "2 месяца",
        impact: "NPS 51 -> 63",
        summary:
          "Первый опыт объясняет ключевые функции сервиса и снижает количество обращений по базовым действиям.",
        context:
          "Большая часть обращений в поддержку была связана не с ошибками, а с непониманием первых функций сервиса.",
        problem:
          "Только 38% пользователей завершали onboarding, а 52% обращений касались базовых функций.",
        solution: [
          "Сократить onboarding до ключевых пользовательских действий.",
          "Привязать подсказки к моменту, когда они действительно нужны.",
          "Дать пользователю быстрый первый успех внутри продукта.",
        ],
        result: [
          "Обращения в поддержку снизились на 29%.",
          "NPS вырос с 51 до 63.",
          "Пользователь быстрее понимал, зачем нужен сервис.",
        ],
        preview: "flow",
      },
    ],
  },
  {
    id: "smlt",
    index: "III",
    name: "Самолет",
    industry: "Proptech",
    years: "2018—2020",
    role: "UX/UI дизайнер",
    team: "Стройка, продажи, продукт",
    description:
      "B2B/B2E-инструменты для стройки и недвижимости: планирование, цифровые двойники, карта опций и контроль соответствия.",
    cases: [
      {
        id: "mdg",
        index: "I",
        title: "МСГ",
        subtitle: "Месячно-суточный график для строительных работ",
        type: "B2B · Planning",
        year: "2019",
        duration: "6 месяцев",
        impact: "планирование −60%",
        summary:
          "Инструмент автоматизирует месячно-суточное планирование и связывает график с проектной экосистемой.",
        context:
          "Строительным командам нужно быстро понимать, какие работы запланированы, какая техника занята и где появляется риск простоя.",
        problem:
          "Планирование занимало до 8 часов в неделю, а ручная сверка данных приводила к простоям техники и ошибкам.",
        solution: [
          "Собрать график в единый интерфейс для планирования и контроля.",
          "Показать зависимости между работами, техникой и объектами.",
          "Снизить ручную сверку между участниками процесса.",
        ],
        result: [
          "Время планирования снизилось с 8 до 3 часов в неделю.",
          "Простой техники снизился на 25%.",
          "90% пользователей оценили инструмент как удобный.",
        ],
        preview: "table",
      },
      {
        id: "options-map",
        index: "II",
        title: "Карта опций",
        subtitle: "Контроль проданных опций и соответствия строительству",
        type: "Proptech · Map",
        year: "2020",
        duration: "4 месяца",
        impact: "меньше ошибок на объекте",
        summary:
          "Платформа показывает проданные квартирные опции и помогает контролировать, что строительство соответствует обещанному клиенту.",
        context:
          "Проданные опции должны доходить до стройки без искажений: материалы, планировки, отделка, дополнительные решения.",
        problem:
          "Ошибки между продажей и строительством могли приводить к переделкам, судебным и финансовым рискам.",
        solution: [
          "Сделать карту опций видимой для участников процесса.",
          "Связать объект, квартиру, проданную опцию и статус исполнения.",
          "Выделить расхождения до того, как они превратятся в дорогую ошибку.",
        ],
        result: [
          "Команды видят проданные опции в одном месте.",
          "Контроль соответствия стал частью рабочего процесса.",
          "Риски переделок и спорных ситуаций снизились.",
        ],
        preview: "map",
      },
    ],
  },
];

const portfolioBasePath: string = String(import.meta.env.VITE_PORTFOLIO_BASE_PATH ?? "/portfolio").replace(/\/$/, "");

function getRouteParts() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const baseParts = portfolioBasePath.split("/").filter(Boolean);
  return baseParts.every((part, index) => parts[index] === part) ? parts.slice(baseParts.length) : parts;
}

function portfolioPath(path = "") {
  const suffix = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `${portfolioBasePath}${suffix}` || "/";
}

function getRoute() {
  const parts = getRouteParts();
  const companyId = parts[0] as CompanyId | undefined;
  const caseId = parts[2];
  return { companyId, caseId };
}

function push(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function PortfolioView() {
  const [route, setRoute] = React.useState(getRoute);

  React.useEffect(() => {
    const handleRoute = () => setRoute(getRoute());
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, []);

  const company = companies.find((item) => item.id === route.companyId);
  const caseStudy = company?.cases.find((item) => item.id === route.caseId);

  if (company && caseStudy) {
    return <CasePage company={company} caseStudy={caseStudy} />;
  }

  if (company) {
    return <CompanyPage company={company} />;
  }

  return <PortfolioHome />;
}

function PortfolioHome() {
  return (
    <main className="portfolio-shell portfolio-home-shell">
      <Header />
      <section className="portfolio-hero">
        <div>
          <p className="portfolio-kicker">Портфолио</p>
          <h1 aria-label="Дизайнер сложных продуктов">
            Дизайнер
            <br />
            <em>сложных продуктов</em>
          </h1>
        </div>
        <div className="portfolio-hero-copy">
          <p>
            Проектирую B2B-платежи, сервисные кабинеты, подписки и proptech-инструменты,
            где важны сценарии, статусы, данные и понятные действия.
          </p>
        </div>
      </section>

      <section className="portfolio-company-tiles" aria-label="Компании">
        {companies.map((company) => (
          <button
            className="portfolio-company-tile"
            key={company.id}
            aria-label={`Открыть компанию ${company.name}, ${company.cases.length} кейсов`}
            onClick={() => push(portfolioPath(company.id))}
            type="button"
          >
            <span className="portfolio-tile-top">
              <span className="portfolio-row-index">{company.index}</span>
              <span className="portfolio-row-subtitle">{company.industry}</span>
            </span>
            <span className="portfolio-tile-main">
              <span className="portfolio-row-title">{company.name}</span>
              <span className="portfolio-row-description">{company.description}</span>
            </span>
            <span className="portfolio-tile-footer">
              <span className="portfolio-tile-meta-row">
                <span className="portfolio-row-meta">{company.years}</span>
                <span className="portfolio-row-count">
                  {company.cases.length}
                  <span>кейса</span>
                </span>
              </span>
              <span className="portfolio-row-meta">{company.role}</span>
              <span className="portfolio-tile-cta">
                Смотреть кейсы <span>→</span>
              </span>
            </span>
          </button>
        ))}
      </section>
      <PortfolioFooter />
    </main>
  );
}

function CompanyPage({ company }: { company: Company }) {
  return (
    <main className="portfolio-shell portfolio-company-shell">
      <div className="portfolio-breadcrumb">
        <button onClick={() => push(portfolioPath())} type="button">
          ← Портфолио
        </button>
        <span>·</span>
        <strong>{company.name}</strong>
      </div>
      <section className="portfolio-company-hero">
        <div>
          <p className="portfolio-kicker">
            {company.industry} · {company.years}
          </p>
          <h1>{company.name}</h1>
        </div>
        <div>
          <p>{company.description}</p>
          <div className="portfolio-facts">
            <Fact label="Роль" value={company.role} />
            <Fact label="Команда" value={company.team} />
          </div>
        </div>
      </section>
      <section className="portfolio-case-tiles" aria-label={`Кейсы компании ${company.name}`}>
        {company.cases.map((caseStudy) => (
          <button
            className="portfolio-case-tile"
            key={caseStudy.id}
            aria-label={`Открыть кейс ${caseStudy.title}`}
            onClick={() => push(portfolioPath(`${company.id}/case/${caseStudy.id}`))}
            type="button"
          >
            <span className="portfolio-tile-top">
              <span className="portfolio-row-index">{caseStudy.index}</span>
              <span className="portfolio-row-subtitle">{caseStudy.type}</span>
            </span>
            <span className="portfolio-tile-main">
              <span className="portfolio-case-title">{caseStudy.title}</span>
              <span className="portfolio-row-subtitle">{caseStudy.subtitle}</span>
            </span>
            <span className="portfolio-row-description">{caseStudy.summary}</span>
            <span className="portfolio-tile-footer">
              <span className="portfolio-tile-meta-row">
                <span className="portfolio-row-meta">{caseStudy.year} · {caseStudy.duration}</span>
                <span className="portfolio-case-impact">{caseStudy.impact}</span>
              </span>
              <span className="portfolio-tile-cta">
                Читать кейс <span>→</span>
              </span>
            </span>
          </button>
        ))}
      </section>
      <PortfolioFooter suffix={company.name} />
    </main>
  );
}

function CasePage({ company, caseStudy }: { company: Company; caseStudy: CaseStudy }) {
  const sections = React.useMemo(
    () =>
      caseStudy.detailSections ?? [
        {
          title: "Контекст",
          body: [caseStudy.context],
        },
        {
          title: "Проблема",
          quote: caseStudy.problem,
        },
        {
          title: "Решение",
          items: caseStudy.solution,
        },
        {
          title: "Результат",
          items: caseStudy.result,
        },
      ],
    [caseStudy],
  );
  React.useEffect(() => {
    const sectionNodes = sections
      .map((_, index) => document.getElementById(`section-${index}`))
      .filter((node): node is HTMLElement => Boolean(node));
    const navLinks = sectionNodes
      .map((node) => document.querySelector<HTMLAnchorElement>(`.portfolio-article-layout aside a[href="#${node.id}"]`))
      .filter((node): node is HTMLAnchorElement => Boolean(node));

    if (!sectionNodes.length || !navLinks.length) {
      return;
    }

    let frame = 0;

    const updateActiveSection = () => {
      const readingLine = window.innerHeight * 0.35;
      const isNearBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      const currentSection =
        (isNearBottom && sectionNodes[sectionNodes.length - 1]) ||
        [...sectionNodes].sort(
          (a, b) =>
            Math.abs(a.getBoundingClientRect().top - readingLine) -
            Math.abs(b.getBoundingClientRect().top - readingLine),
        )[0];

      navLinks.forEach((link) => {
        const isActive = link.hash === `#${currentSection.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    const interval = window.setInterval(updateActiveSection, 250);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [caseStudy.id, sections]);

  return (
    <main className="portfolio-shell portfolio-article-shell">
      <div className="portfolio-breadcrumb">
        <button onClick={() => push(portfolioPath())} type="button">
          ← Портфолио
        </button>
        <span>·</span>
        <button onClick={() => push(portfolioPath(company.id))} type="button">
          {company.name}
        </button>
        <span>·</span>
        <strong>{caseStudy.title}</strong>
      </div>
      <section className="portfolio-article-hero">
        <div>
          <h1 aria-label={`${caseStudy.title}. ${caseStudy.subtitle}`}>
            {caseStudy.title}
            <br />
            <em>{caseStudy.subtitle}</em>
          </h1>
          <p>{caseStudy.summary}</p>
        </div>
      </section>
      <div className="portfolio-article-layout">
        <aside>
          <p>Содержание</p>
          {sections.map((section, index) => (
            <a href={`#section-${index}`} key={section.title}>
              <span>0{index + 1}</span>
              {section.title}
            </a>
          ))}
        </aside>
        <article>
          {sections.map((section, index) => (
            <ArticleSection
              id={`section-${index}`}
              index={`0${index + 1}`}
              key={section.title}
              title={section.title}
            >
              <CaseSectionContent section={section} />
              {!caseStudy.detailSections && index === 2 && <Preview variant={caseStudy.preview} />}
            </ArticleSection>
          ))}
          <nav className="portfolio-next">
            <button onClick={() => push(portfolioPath(company.id))} type="button">
              ← Все кейсы {company.name}
            </button>
          </nav>
        </article>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="portfolio-header">
      <div>
        <strong>Иван Игнатов</strong>
      </div>
      <nav>
        <span>Продуктовый дизайнер</span>
        <span>B2B/B2C продукты</span>
      </nav>
    </header>
  );
}

function PortfolioFooter({ suffix = "портфолио" }: { suffix?: string }) {
  return (
    <footer className="portfolio-footer">
      <span>© 2026 Иван Игнатов · {suffix}</span>
      <span>Telegram · LinkedIn · Email</span>
    </footer>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt>{value}</dt>
      <dd>{label}</dd>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ArticleSection({
  children,
  id,
  index,
  title,
}: {
  children: React.ReactNode;
  id: string;
  index: string;
  title: string;
}) {
  return (
    <section className="portfolio-article-section" id={id}>
      <h2>
        <span>{index}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function CaseSectionContent({ section }: { section: CaseDetailSection }) {
  return (
    <>
      {section.body?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.quote && <blockquote>{section.quote}</blockquote>}
      {section.items && <NumberedList items={section.items} />}
      {section.image && (
        <figure className="portfolio-source-image">
          <img alt={section.image.alt} src={section.image.src} />
          <figcaption>{section.image.caption}</figcaption>
        </figure>
      )}
      {section.images && (
        <div className="portfolio-source-slider" aria-label={`${section.title}: изображения`}>
          {section.images.map((image) => (
            <figure className="portfolio-source-slide" key={image.src}>
              <img alt={image.alt} src={image.src} />
              <figcaption>{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <div className="portfolio-numbered-list">
      {items.map((item, index) => (
        <div key={item}>
          <span>0{index + 1}</span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

function Preview({ compact = false, variant }: { compact?: boolean; variant: CaseStudy["preview"] }) {
  return (
    <div className={`portfolio-preview portfolio-preview-${variant} ${compact ? "is-compact" : ""}`}>
      {variant === "dashboard" && <DashboardPreview />}
      {variant === "flow" && <FlowPreview />}
      {variant === "mobile" && <MobilePreview />}
      {variant === "table" && <TablePreview />}
      {variant === "map" && <MapPreview />}
    </div>
  );
}

function DashboardPreview() {
  return (
    <>
      <div className="preview-sidebar" />
      <div className="preview-main">
        <div className="preview-kpi-row">
          <span />
          <span />
          <span />
        </div>
        <div className="preview-actions">
          <span>Платеж</span>
          <span>Реестр</span>
          <span>Банк</span>
        </div>
        <div className="preview-table">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </>
  );
}

function FlowPreview() {
  return (
    <>
      <div className="preview-flow-step">Вход</div>
      <div className="preview-flow-step">Проверка</div>
      <div className="preview-flow-step">Доступ</div>
    </>
  );
}

function MobilePreview() {
  return (
    <>
      <div className="preview-phone">
        <span />
        <span />
        <span />
      </div>
      <div className="preview-phone">
        <span />
        <span />
        <span />
      </div>
    </>
  );
}

function TablePreview() {
  return (
    <div className="preview-token-table">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function MapPreview() {
  return (
    <div className="preview-map">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
