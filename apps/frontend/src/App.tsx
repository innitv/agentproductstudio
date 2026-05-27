import * as React from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  DollarSign,
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  User,
  X,
  Zap,
  ClipboardCheck,
  Info,
  Settings,
  ChevronRight,
} from "lucide-react";

import { ComponentsPlayground } from "./components-playground";
import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import { IconButton } from "./components/ui/icon-button";
import { Select } from "./components/ui/select";
import { Switch } from "./components/ui/switch";
import { Textarea } from "./components/ui/textarea";
import { Toast } from "./components/ui/toast";
import { Breadcrumbs } from "./components/ui/breadcrumbs";
import { Chip } from "./components/ui/chip";
import { Dropdown, DropdownDivider, DropdownGroupTitle, DropdownItem } from "./components/ui/dropdown";
import { InlineNotification } from "./components/ui/inline-notification";
import { Radio } from "./components/ui/radio";
import { SegmentedControl } from "./components/ui/segmented-control";
import { Tooltip } from "./components/ui/tooltip";
import { FunctionButton } from "./components/ui/function-button";

interface AIAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  active: boolean;
  dialogsCount: number;
  type: "public" | "private";
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export function App() {
  if (window.location.pathname === "/components") {
    return <ComponentsPlayground />;
  }

  // Вкладка/раздел: "dashboard" | "create" | "billing" | "faq"
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "create" | "billing" | "faq">("dashboard");

  // Состояние списка ИИ-агентов
  const [agents, setAgents] = React.useState<AIAgent[]>([
    {
      id: "agent-1",
      name: "ИИ-Продавец",
      role: "Продавец (Автоматизация лидогенерации)",
      model: "GPT-4o",
      active: true,
      dialogsCount: 842,
      type: "public",
    },
    {
      id: "agent-2",
      name: "ИИ-Саппорт",
      role: "Поддержка (Круглосуточный саппорт)",
      model: "Gemini 1.5 Pro",
      active: false,
      dialogsCount: 410,
      type: "public",
    },
    {
      id: "agent-3",
      name: "ИИ-Рекрутер",
      role: "Рекрутер (Автоматизация найма)",
      model: "Claude 3.5 Sonnet",
      active: true,
      dialogsCount: 168,
      type: "private",
    },
  ]);

  // Выбранный агент в чат-симуляторе
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("agent-1");
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // История диалогов для каждого агента
  const [chatHistory, setChatHistory] = React.useState<Record<string, Message[]>>({
    "agent-1": [
      { sender: "bot", text: "Здравствуйте! Я ИИ-Продавец платформы AgentFlow. Готов помочь вашему бизнесу вырасти и квалифицировать входящие лиды." },
    ],
    "agent-2": [
      { sender: "bot", text: "Привет! Я ИИ-Поддержка первой линии. Готов круглосуточно отвечать на частые вопросы по вашей базе знаний." },
    ],
    "agent-3": [
      { sender: "bot", text: "Приветствую! Я ИИ-Рекрутер. Могу провести первичное скрининг-интервью для кандидатов в вашу компанию." },
    ],
  });

  // Ввод сообщения пользователем
  const [messageInput, setMessageInput] = React.useState<string>("");
  // Статус "Бот печатает..."
  const [isBotTyping, setIsBotTyping] = React.useState<boolean>(false);

  // Поля формы создания агента
  const [newAgentName, setNewAgentName] = React.useState<string>("");
  const [newAgentRole, setNewAgentRole] = React.useState<string>("sales");
  const [newAgentModel, setNewAgentModel] = React.useState<string>("GPT-4o");
  const [newAgentKnowledge, setNewAgentKnowledge] = React.useState<string>("");
  const [newAgentType, setNewAgentType] = React.useState<"public" | "private">("public");
  const [selectedChannels, setSelectedChannels] = React.useState<Record<string, boolean>>({
    telegram: true,
    whatsapp: false,
    amocrm: false,
    n8n: false,
  });

  // Всплывающие Тосты (Toast)
  const [toastMessage, setToastMessage] = React.useState<{ title: string; subtitle: string; scheme: "success" | "info" | "error" } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = React.useState<boolean>(false);

  // Показать Тост
  const triggerToast = (title: string, subtitle: string, scheme: "success" | "info" | "error" = "success") => {
    setToastMessage({ title, subtitle, scheme });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Переключение статуса агента (активен/неактивен)
  const toggleAgentActive = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === id) {
          const newStatus = !agent.active;
          triggerToast(
            agent.name,
            newStatus ? "Агент успешно запущен в работу" : "Агент приостановлен",
            newStatus ? "success" : "info"
          );
          return { ...agent, active: newStatus };
        }
        return agent;
      })
    );
  };

  // Удаление агента
  const deleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgents((prev) => prev.filter((a) => a.id !== id));
    triggerToast("Удаление агента", "Агент успешно удален из консоли", "error");
    if (selectedAgentId === id) {
      const remaining = agents.filter((a) => a.id !== id);
      if (remaining.length > 0) {
        setSelectedAgentId(remaining[0].id);
      }
    }
  };

  // Отправка сообщения в симулятор
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isBotTyping) return;

    const userText = messageInput;
    setMessageInput("");

    // 1. Добавляем сообщение пользователя в историю
    setChatHistory((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), { sender: "user", text: userText }],
    }));

    setIsBotTyping(true);

    // 2. Симулируем задержку ответа бота
    setTimeout(() => {
      let botResponse = "Я получил ваше сообщение и обрабатываю его на основе загруженного регламента.";

      // Контекстные ответы в зависимости от выбранного агента и его роли
      if (selectedAgentId === "agent-1") {
        if (userText.toLowerCase().includes("цена") || userText.toLowerCase().includes("стоимость") || userText.toLowerCase().includes("тариф")) {
          botResponse = "У нас три прозрачных тарифа: 'Старт' за $49/мес (для тестов), 'Рост' за $149/мес (до 5 агентов, интеграция с amoCRM) и 'Масштаб' за $499/мес. Какой объем диалогов в месяц вы ожидаете, чтобы я подобрал оптимальный тариф?";
        } else {
          botResponse = "Отличный вопрос! Наша SaaS-платформа позволяет полностью автоматизировать квалификацию входящих лидов и поднять вашу конверсию в демо-звонок до 20%. Хотите, я запишу вас на демо-презентацию?";
        }
      } else if (selectedAgentId === "agent-2") {
        if (userText.toLowerCase().includes("галлюцинац") || userText.toLowerCase().includes("ошибк") || userText.toLowerCase().includes("выдум")) {
          botResponse = "Я строго следую вашей базе знаний (инструкции, регламенты). Если клиент задает вопрос, на который в базе нет точного ответа, я не выдумываю факты, а мягко перевожу диалог на человека-оператора, присылая вам уведомление в CRM.";
        } else {
          botResponse = "Я анализирую базу знаний компании 24/7 и готов отвечать клиентам мгновенно. Моя интеграция с вашим хелпдеском позволяет разгрузить поддержку на 90%.";
        }
      } else if (selectedAgentId === "agent-3") {
        botResponse = "Я могу автоматически провести первичное скоринг-интервью с кандидатом, оценить его навыки по вашему списку вопросов и записать подходящего соискателя прямо в ваш календарь HR.";
      } else {
        botResponse = `Я ваш новый умный ассистент. Я изучил предоставленную базу знаний и готов общаться по каналам интеграции!`;
      }

      setChatHistory((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), { sender: "bot", text: botResponse }],
      }));

      setIsBotTyping(false);
    }, 1200);
  };

  // Создание нового агента
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) {
      triggerToast("Ошибка создания", "Заполните имя ИИ-агента", "error");
      return;
    }

    const roleMap: Record<string, string> = {
      sales: "Продавец (Автоматизация лидогенерации)",
      support: "Поддержка (Круглосуточный саппорт)",
      marketing: "Маркетолог (Управление воронками)",
      hr: "Рекрутер (Автоматизация найма)",
    };

    const newAgent: AIAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      role: roleMap[newAgentRole] || "Умный помощник",
      model: newAgentModel,
      active: true,
      dialogsCount: 0,
      type: newAgentType,
    };

    setAgents((prev) => [...prev, newAgent]);
    setSelectedAgentId(newAgent.id);

    // Добавляем приветственное сообщение для нового агента
    setChatHistory((prev) => ({
      ...prev,
      [newAgent.id]: [
        { sender: "bot", text: `Здравствуйте! Я ваш новый ИИ-агент "${newAgent.name}". Моя роль: ${newAgent.role}. Я запущен по No-code сценарию и готов к работе с базой знаний!` },
      ],
    }));

    // Сброс полей формы
    setNewAgentName("");
    setNewAgentKnowledge("");
    setActiveTab("dashboard");

    triggerToast("Агент создан", `ИИ-агент "${newAgent.name}" успешно добавлен в систему`, "success");
  };

  // Расчет общих метрик дашборда
  const totalDialogs = agents.reduce((sum, a) => sum + a.dialogsCount, 0);

  return (
    <main className="console-shell">
      {/* Тост уведомление */}
      {toastMessage && (
        <div className="console-toast-container">
          <Toast
            colorScheme={toastMessage.scheme}
            title={toastMessage.title}
            subtitle={toastMessage.subtitle}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Двухколоночный макет */}
      <div className="console-container">
        
        {/* Левая панель - Сайдбар */}
        <aside className="console-sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">а3</div>
            <div className="brand-text">
              <span>AgentFlow</span>
              <span className="brand-subtext">Console v1.4</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Навигация по консоли">
            <button
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Activity className="nav-icon" />
              <span>Панель управления</span>
            </button>

            <button
              className={`nav-item ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              <Plus className="nav-icon" />
              <span>Создать ИИ-агента</span>
            </button>

            <button
              className={`nav-item ${activeTab === "billing" ? "active" : ""}`}
              onClick={() => setActiveTab("billing")}
            >
              <DollarSign className="nav-icon" />
              <span>Тарифы и биллинг</span>
            </button>

            <button
              className={`nav-item ${activeTab === "faq" ? "active" : ""}`}
              onClick={() => setActiveTab("faq")}
            >
              <HelpCircle className="nav-icon" />
              <span>Частые вопросы</span>
            </button>
          </nav>

          <div className="sidebar-action">
            <Button
              className="w-full"
              variant="secondary"
              leadingIcon={<Plus aria-hidden="true" />}
              onClick={() => setActiveTab("create")}
            >
              Быстрый агент
            </Button>
          </div>

          <div className="sidebar-footer">
            <div className="footer-status">
              <span className="status-dot"></span>
              <span>Платформа: Активна</span>
            </div>
            <div className="footer-copyright">© 2026 AgentFlow</div>
          </div>
        </aside>

        {/* Правая панель - Контент */}
        <div className="console-main">
          
          {/* Верхний Топбар */}
          <header className="console-topbar">
            <div className="topbar-left">
              <h1 className="topbar-title">SaaS-платформа для создания и продажи ИИ-агентов</h1>
            </div>

            <div className="topbar-right">
              {/* Tooltip для справочной информации */}
              <Tooltip title="Справка по платформе" subtitle="Консоль управления ИИ-агентами A3">
                <IconButton
                  aria-label="Справка"
                  icon={<HelpCircle aria-hidden="true" />}
                  variant="ghost"
                  colorScheme="neutral"
                  size="m"
                />
              </Tooltip>

              <div className="profile-selector-container">
                <button
                  className="profile-trigger"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Профиль пользователя"
                >
                  <User className="profile-avatar" />
                  <span className="profile-name">Администратор</span>
                </button>

                {showProfileMenu && (
                  <div className="profile-dropdown-wrapper">
                    <Dropdown
                      bottomPanel={
                        <FunctionButton
                          icon={<Settings aria-hidden="true" />}
                          onClick={() => {
                            triggerToast("Настройки", "Раздел настроек в разработке", "info");
                            setShowProfileMenu(false);
                          }}
                        >
                          Настройки системы
                        </FunctionButton>
                      }
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <DropdownGroupTitle>Доступные аккаунты</DropdownGroupTitle>
                      <DropdownItem icon={<User aria-hidden="true" />} selected>
                        Иван Иванов (Админ)
                      </DropdownItem>
                      <DropdownItem icon={<Bot aria-hidden="true" />} hint="Разработчик">
                        Девелопер аккаунт
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem
                        onClick={() => {
                          triggerToast("Выход", "Вы успешно вышли из консоли (симуляция)", "info");
                        }}
                      >
                        Выйти из системы
                      </DropdownItem>
                    </Dropdown>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Внутреннее содержимое по вкладкам */}
          <div className="console-content">
            
            {activeTab === "dashboard" && (
              <div className="tab-dashboard animate-fade-in">
                {/* Хлебные крошки */}
                <div className="content-breadcrumbs">
                  <Breadcrumbs
                    items={[
                      { href: "#", label: "Главная", onClick: () => setActiveTab("dashboard") },
                      { href: "#", label: "Консоль" },
                      { current: true, label: "Панель управления" },
                    ]}
                  />
                </div>

                <div className="dashboard-header-row">
                  <div>
                    <h2>Аналитика эффективности</h2>
                    <p className="subtitle">Сводные показатели по всем вашим активным ИИ-агентам</p>
                  </div>
                  
                  {/* Segmented Control для фильтрации времени */}
                  <SegmentedControl
                    defaultValue="week"
                    options={[
                      { label: "Сегодня", value: "today" },
                      { label: "Неделя", value: "week" },
                      { label: "Месяц", value: "month" },
                    ]}
                    size="m"
                    onValueChange={(val: string) => triggerToast("Фильтр обновлен", `Показаны данные за период: ${val}`, "info")}
                  />
                </div>

                {/* Карточки Метрик */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon-wrapper success">
                      <MessageSquare className="metric-icon" />
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">Лидов обработано</span>
                      <h3 className="metric-value">{totalDialogs} диалогов</h3>
                      <span className="metric-trend text-success">
                        <Check className="trend-icon" /> +14.2% за неделю
                      </span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon-wrapper info">
                      <Zap className="metric-icon" />
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">Конверсия в Демо</span>
                      <h3 className="metric-value">14.8 %</h3>
                      <span className="metric-trend text-info">
                        <ArrowRight className="trend-icon" /> Стабильный рост
                      </span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon-wrapper status-03">
                      <DollarSign className="metric-icon" />
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">Сэкономлено костов</span>
                      <h3 className="metric-value">{(totalDialogs * 350).toLocaleString("ru-RU")} ₽</h3>
                      <span className="metric-trend text-status-03">
                        <Bot className="trend-icon" /> 350 ₽ за один диалог
                      </span>
                    </div>
                  </div>
                </div>

                {/* Основная сетка дашборда */}
                <div className="dashboard-grid">
                  
                  {/* Левая колонка: Список агентов */}
                  <div className="grid-agents-list">
                    <div className="section-card">
                      <div className="card-header">
                        <h3>Список активных ИИ-агентов</h3>
                        <Chip variant="secondary">Всего: {agents.length}</Chip>
                      </div>

                      <div className="agents-table-container">
                        <table className="agents-table">
                          <thead>
                            <tr>
                              <th>Имя агента</th>
                              <th>Модель LLM</th>
                              <th>Диалоги</th>
                              <th>Тип</th>
                              <th>Статус</th>
                              <th style={{ width: "60px" }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {agents.map((agent) => (
                              <tr
                                key={agent.id}
                                className={`agent-row ${selectedAgentId === agent.id ? "selected" : ""}`}
                                onClick={() => setSelectedAgentId(agent.id)}
                              >
                                <td>
                                  <div className="agent-meta">
                                    <div className={`agent-avatar-indicator ${agent.active ? "active" : "paused"}`}>
                                      <Bot />
                                    </div>
                                    <div>
                                      <span className="agent-name">{agent.name}</span>
                                      <span className="agent-role">{agent.role}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="model-badge">{agent.model}</span>
                                </td>
                                <td>{agent.dialogsCount}</td>
                                <td>
                                  <span className={`type-badge ${agent.type}`}>
                                    {agent.type === "public" ? "Публичный" : "Приватный"}
                                  </span>
                                </td>
                                <td>
                                  {/* Компонент Switch для переключения статуса */}
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                      checked={agent.active}
                                      onChange={() => toggleAgentActive(agent.id)}
                                      aria-label={`Статус агента ${agent.name}`}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <IconButton
                                    aria-label="Удалить агента"
                                    colorScheme="neutral"
                                    icon={<Trash2 aria-hidden="true" />}
                                    variant="ghost"
                                    size="s"
                                    onClick={(e) => deleteAgent(agent.id, e)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="card-actions">
                        <Button
                          variant="outline"
                          leadingIcon={<Plus aria-hidden="true" />}
                          onClick={() => setActiveTab("create")}
                        >
                          Добавить нового агента
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Правая колонка: Чат-симулятор */}
                  <div className="grid-chat-simulator">
                    <div className="section-card chat-card">
                      <div className="card-header chat-header">
                        <div className="chat-agent-info">
                          <Bot className="chat-agent-icon" />
                          <div>
                            <h4>Чат-симулятор с {selectedAgent.name}</h4>
                            <span className="chat-agent-status">
                              {selectedAgent.active ? "● Активен" : "○ Приостановлен (симуляция всё равно доступна)"}
                            </span>
                          </div>
                        </div>
                        <Chip variant={selectedAgent.active ? "primary" : "secondary"}>
                          {selectedAgent.model}
                        </Chip>
                      </div>

                      {/* Окно сообщений */}
                      <div className="chat-messages-box">
                        {(chatHistory[selectedAgentId] || []).map((msg, idx) => (
                          <div key={idx} className={`chat-message ${msg.sender}`}>
                            <div className="message-bubble">
                              <p>{msg.text}</p>
                            </div>
                            <span className="message-time">
                              {msg.sender === "bot" ? selectedAgent.name : "Вы"}
                            </span>
                          </div>
                        ))}

                        {isBotTyping && (
                          <div className="chat-message bot typing">
                            <div className="message-bubble">
                              <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Форма ввода сообщений */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage(e);
                        }}
                        className="chat-input-form"
                        aria-label="Чат-симулятор"
                      >
                        <Input
                          aria-label="Сообщение"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Спросите агента про тарифы, ошибки или регламент..."
                          size="m"
                          disabled={isBotTyping}
                          rightIcon={
                            <button
                              type="submit"
                              className="chat-submit-btn"
                              disabled={!messageInput.trim() || isBotTyping}
                              aria-label="Отправить сообщение"
                            >
                              <Send className="send-icon" />
                            </button>
                          }
                        />
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div className="tab-create animate-fade-in">
                {/* Хлебные крошки */}
                <div className="content-breadcrumbs">
                  <Breadcrumbs
                    items={[
                      { href: "#", label: "Главная", onClick: () => setActiveTab("dashboard") },
                      { href: "#", label: "Консоль" },
                      { current: true, label: "Создание ИИ-агента" },
                    ]}
                  />
                </div>

                <div className="section-card form-card">
                  <h2>No-code конструктор нового ИИ-агента</h2>
                  <p className="subtitle">
                    Задайте регламент и каналы дистрибуции для мгновенного развертывания интеллектуального помощника.
                  </p>

                  {/* InlineNotification - уведомление об интеграциях */}
                  <div className="form-notification">
                    <InlineNotification
                      colorScheme="info"
                      title="Публикация в реальном времени"
                      subtitle="Все настройки ИИ-агента вступают в силу мгновенно. Вы можете сразу протестировать его в симуляторе."
                    />
                  </div>

                  <form onSubmit={handleCreateAgent} className="create-agent-form">
                    <div className="form-group-row">
                      {/* Имя агента */}
                      <Input
                        label="Имя ИИ-агента"
                        placeholder="Например, ИИ-Консультант или ИИ-Продавец"
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        required
                        size="l"
                        hint="Используется для идентификации агента в списке и чате"
                      />

                      {/* Роль агента */}
                      <Select
                        label="Роль ИИ-агента"
                        defaultValue={newAgentRole}
                        options={[
                          { label: "Продавец (Автоматизация продаж)", value: "sales" },
                          { label: "Поддержка (Круглосуточный саппорт)", value: "support" },
                          { label: "Маркетолог (Лидогенерация)", value: "marketing" },
                          { label: "Рекрутер (Автоматизация найма)", value: "hr" },
                        ]}
                        onValueChange={(val: string) => setNewAgentRole(val)}
                      />
                    </div>

                    <div className="form-group-row">
                      {/* Выбор LLM модели через Segmented Control */}
                      <div className="form-control-block">
                        <label className="form-field-label">Базовая LLM Модель</label>
                        <SegmentedControl
                          defaultValue={newAgentModel}
                          options={[
                            { label: "GPT-4o (Рекомендуется)", value: "GPT-4o" },
                            { label: "Gemini 1.5 Pro", value: "Gemini 1.5 Pro" },
                            { label: "Claude 3.5", value: "Claude 3.5 Sonnet" },
                          ]}
                          size="m"
                          onValueChange={(val: string) => setNewAgentModel(val)}
                        />
                      </div>

                      {/* Доступность агента через Radio кнопки */}
                      <div className="form-control-block">
                        <label className="form-field-label">Тип доступности</label>
                        <div className="radio-group-row">
                          <Radio
                            label="Публичный (доступен по API)"
                            name="agent-type"
                            checked={newAgentType === "public"}
                            onChange={() => setNewAgentType("public")}
                          />
                          <Radio
                            label="Приватный (только для тестов)"
                            name="agent-type"
                            checked={newAgentType === "private"}
                            onChange={() => setNewAgentType("private")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Текстовая база знаний (Регламент) */}
                    <Textarea
                      label="Регламент ИИ-агента и база знаний"
                      placeholder="Впишите правила общения агента. Например: 'Ты — ИИ-продавец. Будь вежлив. Предлагай тарифы: Старт за $49. Отвечай кратко.'"
                      value={newAgentKnowledge}
                      onChange={(e) => setNewAgentKnowledge(e.target.value)}
                      size="m"
                      counter={`${newAgentKnowledge.length}/1000`}
                      hint="Задайте ключевые правила, ограничения и сценарии для ответов ИИ-агента"
                    />

                    {/* Каналы интеграции */}
                    <div className="form-control-block">
                      <label className="form-field-label">Каналы интеграции (дистрибуция)</label>
                      <div className="checkbox-grid">
                        <Checkbox
                          label="Telegram-бот"
                          checked={selectedChannels.telegram}
                          onChange={(e) =>
                            setSelectedChannels((prev) => ({ ...prev, telegram: e.target.checked }))
                          }
                        />
                        <Checkbox
                          label="WhatsApp Бизнес"
                          checked={selectedChannels.whatsapp}
                          onChange={(e) =>
                            setSelectedChannels((prev) => ({ ...prev, whatsapp: e.target.checked }))
                          }
                        />
                        <Checkbox
                          label="amoCRM коннектор"
                          checked={selectedChannels.amocrm}
                          onChange={(e) =>
                            setSelectedChannels((prev) => ({ ...prev, amocrm: e.target.checked }))
                          }
                        />
                        <Checkbox
                          label="Вебхуки и n8n"
                          checked={selectedChannels.n8n}
                          onChange={(e) =>
                            setSelectedChannels((prev) => ({ ...prev, n8n: e.target.checked }))
                          }
                        />
                      </div>
                    </div>

                    {/* Кнопки формы */}
                    <div className="form-actions-row">
                      <Button
                        type="submit"
                        leadingIcon={<Plus aria-hidden="true" />}
                        size="xl"
                      >
                        Создать и активировать
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        onClick={() => setActiveTab("dashboard")}
                      >
                        Отменить
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="tab-billing animate-fade-in">
                {/* Хлебные крошки */}
                <div className="content-breadcrumbs">
                  <Breadcrumbs
                    items={[
                      { href: "#", label: "Главная", onClick: () => setActiveTab("dashboard") },
                      { href: "#", label: "Консоль" },
                      { current: true, label: "Тарифы и биллинг" },
                    ]}
                  />
                </div>

                <div className="billing-heading text-center">
                  <h2>Гибкие SaaS тарифы под любой масштаб</h2>
                  <p className="subtitle">Платите только за то количество диалогов, которое реально потребляют ваши агенты</p>
                </div>

                <div className="tariffs-grid">
                  <div className="tariff-card">
                    <span className="tariff-badge">Старт</span>
                    <h3 className="tariff-title">Для малого бизнеса</h3>
                    <div className="tariff-price">
                      <span className="currency">$</span>
                      <span className="amount">49</span>
                      <span className="period">/мес</span>
                    </div>
                    <ul className="tariff-features" aria-label="Возможности тарифа Старт">
                      <li><Check className="feature-icon" /> 1 ИИ-агент</li>
                      <li><Check className="feature-icon" /> 1,000 диалогов в месяц</li>
                      <li><Check className="feature-icon" /> Интеграция с Telegram</li>
                      <li className="disabled"><X className="feature-icon" /> amoCRM и вебхуки</li>
                      <li className="disabled"><X className="feature-icon" /> Собственная база знаний</li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => triggerToast("Тариф Старт", "Вы выбрали тариф 'Старт'. Для оплаты свяжитесь с поддержкой.", "success")}
                    >
                      Выбрать тариф
                    </Button>
                  </div>

                  <div className="tariff-card popular">
                    <span className="tariff-badge popular">Популярный</span>
                    <h3 className="tariff-title">Для роста бизнеса</h3>
                    <div className="tariff-price">
                      <span className="currency">$</span>
                      <span className="amount">149</span>
                      <span className="period">/мес</span>
                    </div>
                    <ul className="tariff-features" aria-label="Возможности тарифа Рост">
                      <li><Check className="feature-icon" /> До 5 ИИ-агентов</li>
                      <li><Check className="feature-icon" /> 10,000 диалогов в месяц</li>
                      <li><Check className="feature-icon" /> Telegram, WhatsApp и Web</li>
                      <li><Check className="feature-icon" /> Интеграция с amoCRM</li>
                      <li><Check className="feature-icon" /> Загрузка базы знаний (TXT, PDF)</li>
                    </ul>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => triggerToast("Тариф Рост", "Вы выбрали тариф 'Рост'. Подключаем платежный шлюз...", "success")}
                    >
                      Попробовать бесплатно
                    </Button>
                  </div>

                  <div className="tariff-card">
                    <span className="tariff-badge">Масштаб</span>
                    <h3 className="tariff-title">Для корпораций</h3>
                    <div className="tariff-price">
                      <span className="currency">$</span>
                      <span className="amount">499</span>
                      <span className="period">/мес</span>
                    </div>
                    <ul className="tariff-features" aria-label="Возможности тарифа Масштаб">
                      <li><Check className="feature-icon" /> Безлимитные ИИ-агенты</li>
                      <li><Check className="feature-icon" /> 100,000 диалогов в месяц</li>
                      <li><Check className="feature-icon" /> Все каналы интеграции и API</li>
                      <li><Check className="feature-icon" /> Персональный менеджер 24/7</li>
                      <li><Check className="feature-icon" /> SLA и кастомные LLM-модели</li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => triggerToast("Тариф Масштаб", "Вы выбрали тариф 'Масштаб'. Заявка отправлена менеджеру.", "success")}
                    >
                      Связаться с отделом продаж
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="tab-faq animate-fade-in">
                {/* Хлебные крошки */}
                <div className="content-breadcrumbs">
                  <Breadcrumbs
                    items={[
                      { href: "#", label: "Главная", onClick: () => setActiveTab("dashboard") },
                      { href: "#", label: "Консоль" },
                      { current: true, label: "Частые вопросы" },
                    ]}
                  />
                </div>

                <div className="faq-heading text-center">
                  <h2>Часто задаваемые вопросы</h2>
                  <p className="subtitle">Всё, что вы хотели знать о создании ИИ-агентов на платформе AgentFlow</p>
                </div>

                <div className="faq-list">
                  <div className="faq-item">
                    <h3>Как ИИ-агент отвечает на сложные вопросы клиентов?</h3>
                    <p>
                      Агент обучается по предоставленной базе знаний. Если клиент задает вопрос, на который нет ответа в регламенте, агент не галлюцинирует, а мягко переводит диалог на оператора-человека, отправляя уведомление в CRM.
                    </p>
                  </div>

                  <div className="faq-item">
                    <h3>Какую LLM модель лучше выбрать при создании?</h3>
                    <p>
                      Для большинства задач продаж и квалификации лидов рекомендуется **GPT-4o**, так как она показывает наилучшее понимание намерений на русском языке. Для простых сервисных сценариев отлично подойдет **Gemini 1.5 Pro**.
                    </p>
                  </div>

                  <div className="faq-item">
                    <h3>Как происходит интеграция с моими мессенджерами?</h3>
                    <p>
                      Достаточно указать API-токен Telegram-бота или подключить бизнес-номер WhatsApp. Платформа AgentFlow берет на себя всю логику маршрутизации диалогов и сохранение истории переписки.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Подвал консоли */}
          <footer className="console-footer">
            <div className="footer-left">
              <span>© 2026 SaaS Платформа AgentFlow. Все права защищены.</span>
            </div>
            <div className="footer-right flex items-center gap-2">
              <ClipboardCheck aria-hidden="true" />
              <span>Powered by A3 Design System & AI Agents</span>
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}
