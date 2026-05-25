import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Headphones,
  RadioTower,
  ShieldCheck,
  Signal,
  Smartphone,
  Truck,
  Wifi,
} from "lucide-react";

const operatorLogos = ["SIM", "eSIM", "5G", "LTE", "MNP", "B2B"];

const routeRows = [
  {
    title: "Проверяем устройство и регион",
    text: "До заявки показываем, подходит ли eSIM, нужен ли физический носитель и какие ограничения важно учесть.",
    Icon: Smartphone,
  },
  {
    title: "Подбираем тариф и формат",
    text: "Сравниваем eSIM, физическую SIM и пакет номеров для команды без неподтверждённых обещаний.",
    Icon: RadioTower,
  },
  {
    title: "Оформляем заявку без лишних данных",
    text: "На прототипе собирается только базовый контакт; production-форма требует legal review.",
    Icon: ClipboardCheck,
  },
  {
    title: "Сопровождаем активацию",
    text: "QR, доставка SIM или пакет для команды получают понятный маршрут подключения и поддержки.",
    Icon: Headphones,
  },
];

const modules = [
  {
    title: "eSIM",
    subtitle: "QR-активация",
    items: ["Проверка устройства", "Инструкция по QR", "Поддержка старта"],
  },
  {
    title: "Физическая SIM",
    subtitle: "Карта с доставкой",
    items: ["Новый номер", "Статус получения", "Настройка связи"],
  },
  {
    title: "Перенос номера",
    subtitle: "MNP-сценарий",
    items: ["Проверка условий", "Заявка оператору", "Контроль статуса"],
  },
  {
    title: "Документы",
    subtitle: "Для оформления",
    items: ["Правила выдачи", "KYC notes", "Политика данных"],
  },
  {
    title: "Команда",
    subtitle: "Пакет номеров",
    items: ["Несколько SIM", "Единый контакт", "Поддержка B2B"],
  },
  {
    title: "Поддержка",
    subtitle: "После заявки",
    items: ["Проверка связи", "Инструкции", "Ответы на вопросы"],
  },
];

const steps = [
  "Заполнить короткую заявку",
  "Проверить SIM/eSIM сценарий",
  "Подтвердить тариф и документы",
  "Получить SIM или QR",
];

const advantages = [
  {
    title: "Сначала совместимость",
    text: "Пользователь не выбирает тариф вслепую: eSIM и физическая SIM разведены с первого экрана.",
    Icon: Wifi,
  },
  {
    title: "Без скрытых шагов",
    text: "Ограничения по переносу номера, документам и доставке вынесены до CTA.",
    Icon: ShieldCheck,
  },
  {
    title: "Для частных и команд",
    text: "Один лендинг закрывает личный номер, второй номер и заявку на пакет SIM.",
    Icon: Building2,
  },
  {
    title: "Понятная активация",
    text: "После заявки пользователь понимает, что будет дальше: QR, доставка или консультация.",
    Icon: BadgeCheck,
  },
];

const tariffs = [
  { name: "eSIM Start", price: "от 390 ₽", note: "QR и инструкция" },
  { name: "SIM Delivery", price: "от 290 ₽", note: "Физическая карта" },
  { name: "Team Pack", price: "по заявке", note: "Несколько номеров" },
];

export function App() {
  return (
    <main className="a3like-shell">
      <section className="hero-blue" id="top">
        <header className="topbar" aria-label="Главная навигация">
          <a className="brand" href="#top" aria-label="SIM Line">
            <Signal aria-hidden="true" />
            <span>sl</span>
          </a>
          <nav className="nav" aria-label="Разделы">
            <a href="#how">Как это работает</a>
            <a href="#solutions">Решения</a>
            <a href="#tariffs">Тарифы</a>
          </nav>
          <a className="pill-cta" href="#request" data-analytics="sim_pick_click">
            Оставить заявку
          </a>
        </header>

        <div className="hero-content">
          <h1>Подключение SIM и eSIM без похода в салон</h1>
          <p>
            Подбираем формат, тариф и способ получения: QR для eSIM, физическая
            SIM доставкой или пакет номеров для команды.
          </p>
          <a className="white-button" href="#request" data-analytics="sim_pick_click">
            Попробовать подбор
          </a>
        </div>
      </section>

      <section className="operator-strip" aria-label="Форматы подключения">
        <div className="operator-row">
          {operatorLogos.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="white-panel" id="how" aria-labelledby="how-title">
        <div className="center-heading">
          <h2 id="how-title">
            От заявки до связи
            <span>без проблем</span>
          </h2>
          <p>Закрываем весь путь клиента и убираем неопределённость до подключения</p>
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
          <h2 id="solutions-title">Соберите подключение под себя</h2>
          <p>Начните с базового сценария и добавляйте нужные модули по мере задачи</p>
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
        <a className="white-button compact" href="#request" data-analytics="sim_pick_click">
          Подобрать бесплатно
        </a>
      </section>

      <section className="white-panel advantages" aria-labelledby="advantages-title">
        <div className="center-heading">
          <h2 id="advantages-title">Почему нас выбирают</h2>
          <p>Мы объединили понятный подбор SIM/eSIM, поддержку и аккуратный сбор заявки</p>
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
        <div className="center-heading">
          <h2 id="tariffs-title">
            Тарифы для старта
            <span>и роста</span>
          </h2>
          <p>Цены демонстрационные: production требует реального каталога операторов</p>
        </div>
        <div className="tariff-grid">
          {tariffs.map((tariff) => (
            <article className="tariff-card" key={tariff.name}>
              <h3>{tariff.name}</h3>
              <strong>{tariff.price}</strong>
              <p>{tariff.note}</p>
              <a href="#request">
                Выбрать
                <ArrowRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="request-panel" id="request" aria-labelledby="request-title">
        <div>
          <h2 id="request-title">Оставьте заявку на подбор SIM</h2>
          <p>
            Укажите сценарий подключения. Мы не отправляем форму в backend:
            это прототип для проверки landing flow.
          </p>
        </div>
        <form className="request-form" aria-label="Форма заявки">
          <label>
            Сценарий
            <select defaultValue="esim">
              <option value="esim">eSIM</option>
              <option value="sim">Физическая SIM</option>
              <option value="team">Пакет для команды</option>
            </select>
          </label>
          <label>
            Город
            <input placeholder="Например, Москва" />
          </label>
          <label>
            Контакт
            <input placeholder="Телефон или Telegram" />
          </label>
          <button type="button" data-analytics="lead_submit_mock">
            Отправить заявку
            <ArrowRight aria-hidden="true" />
          </button>
        </form>
      </section>

      <footer className="footer">
        <span>SIM Line</span>
        <span>
          <FileText aria-hidden="true" />
          Тарифы, KYC и перенос номера требуют production validation
        </span>
      </footer>
    </main>
  );
}
