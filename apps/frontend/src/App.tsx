import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Landmark,
  Monitor,
  Puzzle,
  ReceiptText,
  ShieldCheck,
  Zap,
} from "lucide-react";

const bankLogos = [
  "Альфа Банк",
  "Т-Банк",
  "ПСБ",
  "ozon банк",
  "Уралсиб",
  "Газпромбанк",
  "РСХБ",
];

const routeRows = [
  {
    title: "Подключаем к крупнейшим банкам",
    text: "Один договор позволяет организовать оперативное подключение к приёму платежей организаций во всех топ-банках страны",
    Icon: CircleDollarSign,
  },
  {
    title: "Формируем единый реестр платежей",
    text: "Платежи от всех банков собираем в одном платёжном поручении, что экономит трудозатраты на обработку всех входящих платежей в десятки раз",
    Icon: ReceiptText,
  },
  {
    title: "Реализуем готовое платёжное решение",
    text: "Заменяет эквайринг при онлайн-оплате и даёт больше возможностей для роста дохода",
    Icon: Landmark,
  },
  {
    title: "Отображаем всю историю платежей",
    text: "В личном кабинете отображаются все транзакции, принятые через Платежный сервис А3, каналы оплаты, информация о пользователе и прочие данные, которые указывает пользователь при платеже",
    Icon: FileText,
  },
  {
    title: "Отправляем уведомления в банковских приложениях",
    text: "Плательщик получает уведомление о выставленном счёте, своевременно совершает оплату, благодаря чему сокращается дебиторская задолженность",
    Icon: Monitor,
  },
];

const modules = [
  {
    title: "Платежи",
    subtitle: "Документооборот и чеки",
    items: ["Прием онлайн-платежей", "Базовая аналитика платежей", "Техподдержка в рабочие часы"],
  },
  {
    title: "Аналитика",
    subtitle: "Отчеты по продажам и платежам",
    items: ["Реестры платежей", "Отчет о продажах", "Визуальный дешборд"],
  },
  {
    title: "CRM",
    subtitle: "Управление клиентами и сделками",
    items: ["База клиентов", "Воронка продаж", "Автоматизация"],
  },
  {
    title: "Документооборот",
    subtitle: "Электронный документооборот",
    items: ["Создание документов", "Подписание ЭЦП", "Архивирование"],
  },
  {
    title: "Уведомления",
    subtitle: "Информирование клиентов",
    items: ["Email-уведомления", "SMS-рассылки", "Push-уведомления"],
  },
  {
    title: "Интеграции",
    subtitle: "Подключение сервисов",
    items: ["API для разработчиков", "Вебхуки", "Интеграция с системами"],
  },
];

const steps = [
  "Заполнить анкету",
  "Пройти проверку со стороны платежного сервиса",
  "Подписать договор",
  "Получить первый платёж",
];

const advantages = [
  {
    title: "Быстрый старт",
    text: "За пару дней начните принимать платежи",
    Icon: Zap,
  },
  {
    title: "Все сервисы в одном",
    text: "Одна интеграция закрывает платежи, продажи и процессы",
    Icon: Puzzle,
  },
  {
    title: "Надежность",
    text: "Партнерства с крупными банками-эквайерами, PCI DSS",
    Icon: ShieldCheck,
  },
  {
    title: "Масштабируемость",
    text: "Модульная архитектура растет вместе с вашим бизнесом",
    Icon: BarChart3,
  },
];

const tariffs = [
  {
    name: "Базовый",
    price: "2,3%",
    note: "с оборота",
    description: "Лёгкий старт для команд из 2-10 сотрудников",
    items: [
      "Прием онлайн-платежей",
      "Базовая аналитика платежей",
      "Техподдержка в рабочие часы",
      "API для интеграций",
      "Экспорт отчетов для биллинга",
    ],
  },
  {
    name: "Расширенный",
    badge: "Выгодно",
    price: "1,8%",
    note: "с оборота + модули",
    description: "Растущим компаниям из 10-50 сотрудников",
    items: [
      "Все возможности Базового",
      "Продвинутая аналитика и BI",
      "Индивидуальные интеграции",
      "Модули автоматизации",
      "Приоритетная поддержка",
    ],
    featured: true,
  },
  {
    name: "Продвинутый",
    price: "0,5%",
    note: "с оборота + модули",
    description: "Оптимально для компаний из 50-250 сотрудников",
    items: [
      "Прием онлайн-платежей",
      "Базовая аналитика платежей",
      "Техподдержка в рабочие часы",
      "API для интеграций",
      "Экспорт отчетов для биллинга",
    ],
  },
];

const faqItems = [
  {
    question: "В течение какого времени рассматривается заявка?",
    answer: "В среднем заявка рассматривается в течение 3-х рабочих дней.",
  },
  {
    question: "Как узнаем, что Договор находится на подписании?",
    answer: "После подачи заявки ваш курирующий менеджер свяжется с вами и сообщит о статусе договора.",
  },
  {
    question: "Какие наши действия после подачи заявки?",
    answer:
      "После подачи заявки необходимо будет подписать договор, предоставить лицевой счет для тестового платежа и загрузить в вашу биллинговую систему реестр платежей.\n\nНа любом из этих этапов с вами на связи будет ваш курирующий менеджер.",
    open: true,
  },
];

export function App() {
  return (
    <main className="a3like-shell">
      <section className="hero-blue" id="top">
        <header className="topbar" aria-label="Главная навигация">
          <a className="brand a3-brand" href="#top" aria-label="Платежный сервис А3">
            <span>а3</span>
          </a>
          <nav className="nav" aria-label="Разделы">
            <a href="#how">Как это работает</a>
            <a href="#solutions">Решения</a>
            <a href="#tariffs">Тарифы</a>
          </nav>
          <a className="pill-cta" href="#contact-form" data-analytics="lead_open_click">
            Оставить заявку
          </a>
        </header>

        <div className="hero-content">
          <h1>Приём платежей в топ-банках страны</h1>
          <p>
            Бесплатное подключение организаций к приёму платежей в крупнейших банковских приложениях
            и платёжных сервисах без интеграции
          </p>
          <a className="white-button" href="#contact-form" data-analytics="trial_click">
            Попробовать бесплатно
          </a>
        </div>
      </section>

      <section className="operator-strip" aria-label="Банки и платежные сервисы">
        <div className="operator-row bank-row">
          {bankLogos.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="white-panel how-panel" id="how" aria-labelledby="how-title">
        <div className="center-heading">
          <h2 id="how-title">
            От лица до оплаты
            <span>без проблем</span>
          </h2>
          <p>Закрываем весь путь клиента и автоматизируем рутину</p>
        </div>

        <div className="route-list">
          {routeRows.map(({ title, text, Icon }) => (
            <article className="route-row" key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="blue-section" id="solutions" aria-labelledby="solutions-title">
        <div className="center-heading inverse">
          <h2 id="solutions-title">Соберите платформу под себя</h2>
          <p>Начните с базовых функций и добавляйте модули по мере роста бизнеса</p>
          <div className="segment-control" aria-label="Периоды развития">
            <span>Старт</span>
            <span>Рост</span>
            <span>Масштаб</span>
          </div>
        </div>

        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.subtitle}</p>
              <ul>
                {module.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="blue-steps" aria-labelledby="steps-title">
        <h2 id="steps-title">4 простых шага для оперативного подключения без сложной интеграции</h2>
        <ol className="step-line">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <a className="white-button compact" href="#contact-form" data-analytics="trial_click">
          Попробовать бесплатно
        </a>
      </section>

      <section className="white-panel advantages" aria-labelledby="advantages-title">
        <div className="center-heading">
          <h2 id="advantages-title">Почему нас выбирают</h2>
          <p>
            Мы объединили лучшее от финтеха и SaaS инструментов, чтобы создать подходящий
            продукт для вашего бизнеса
          </p>
        </div>
        <div className="advantage-grid">
          {advantages.map(({ title, text, Icon }) => (
            <article className="advantage-card" key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tariff-section" id="tariffs" aria-labelledby="tariffs-title">
        <div className="center-heading inverse">
          <h2 id="tariffs-title">Выберите свой план</h2>
          <p>
            Прозрачные тарифы без скрытых комиссий.
            <br />
            Первый месяц бесплатно для всех новых клиентов
          </p>
        </div>
        <div className="tariff-grid">
          {tariffs.map((tariff) => (
            <article className={`tariff-card${tariff.featured ? " featured" : ""}`} key={tariff.name}>
              <h3>
                {tariff.name}
                {tariff.badge ? <span>{tariff.badge}</span> : null}
              </h3>
              <strong>{tariff.price}</strong>
              <p>{tariff.note}</p>
              <p>{tariff.description}</p>
              <a href="#contact-form">Подключить</a>
              <ul>
                {tariff.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="white-panel faq-panel" aria-labelledby="faq-title">
        <div className="center-heading">
          <h2 id="faq-title">Часто задаваемые вопросы</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <article className="faq-item" key={item.question}>
              <header>
                <h3>{item.question}</h3>
                <span aria-hidden="true">{item.open ? "--" : "+"}</span>
              </header>
              {item.open ? (
                <p>
                  {item.answer.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="question-section" id="contact-form" aria-labelledby="request-title">
        <div className="question-panel">
          <div className="center-heading inverse compact-heading">
            <h2 id="request-title">Остались вопросы?</h2>
            <p>Оставьте свои контакты и наш менеджер свяжется с вами в течение двух рабочих дней</p>
          </div>
          <form className="request-form a3-form" aria-label="Форма заявки">
            <div className="form-grid">
              <input aria-label="Имя" placeholder="Имя*" />
              <input aria-label="Телефон" placeholder="Телефон*" />
              <input aria-label="Email" placeholder="Email*" />
              <input aria-label="Компания" placeholder="Компания*" />
            </div>
            <select aria-label="Сфера деятельности" defaultValue="">
              <option value="" disabled>
                Сфера деятельности*
              </option>
              <option>ЖКХ</option>
              <option>Образование</option>
              <option>Сервисы</option>
            </select>
            <select aria-label="Ваш оборот в месяц" defaultValue="">
              <option value="" disabled>
                Ваш оборот в месяц*
              </option>
              <option>До 1 млн ₽</option>
              <option>1-10 млн ₽</option>
              <option>Более 10 млн ₽</option>
            </select>
            <textarea aria-label="Расскажите о задаче" placeholder="Расскажите о задаче" />
            <p className="legal-note">
              Нажимая кнопку «Отправить заявку» вы подтверждаете, что согласны на обработку
              персональных данных и соглашаетесь получать информацию о предложениях в соответствии с
              Правилами рассылок ООО «Платёжный сервис А3»
            </p>
            <button type="button" data-analytics="lead_submit_mock">
              Отправить заявку
              <ArrowRight aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <footer className="footer a3-footer">
        <div>
          <h2>Платёжный сервис с уникальной и умной технологией</h2>
          <p>Компания</p>
          <nav aria-label="Ссылки компании">
            <a href="#top">Работа у нас</a>
            <a href="#top">Документы</a>
            <a href="#contact-form">Контакты</a>
          </nav>
        </div>
        <div className="footer-legal">
          <p>© 2026 ООО «Платёжный сервис А3»</p>
          <a href="tel:+78001003900">8 800 100 39 00</a>
          <p>
            ООО «Платёжный сервис А3» аккредитовано в качестве организации, осуществляющей
            деятельность в области информационных технологий, в марте 2022 г. Компания оказывает
            услуги информационного и технологического обслуживания участникам расчётов (кредитным
            организациям, банковским платежным агентам, получателям платежей и плательщикам) — код
            вида деятельности в области информационных технологий 20.01. Посредством программного
            обеспечения, созданного Компанией, осуществляется сбор, обработка и рассылка участникам
            расчётов информации по операциям, приём электронных платёжных документов, сформированных
            плательщиками, проверка целостности таких документов, их маршрутизация на оплату, приём
            ответов о проведении или отказе в проведении платежей, направление получателям платежей
            информации о результатах проведения платежей.
          </p>
          <p>
            Стоимость услуг согласовывается индивидуально, в зависимости от объема, модели интеграции
            и сценария взаимодействия.
          </p>
        </div>
        <span className="footer-mark">
          <ClipboardCheck aria-hidden="true" />
          Reference scan: Firecrawl + Playwright
        </span>
      </footer>
    </main>
  );
}
