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
  Lock,
  Shield,
  HardDrive,
  Cpu,
  Layers,
  Globe,
  Menu,
  Clock,
  ArrowUpRight,
  Database,
  Sparkles,
  Gift,
  ArrowRightLeft,
  ChevronDown
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { IconButton } from "../components/ui/icon-button";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Toast } from "../components/ui/toast";
import { Breadcrumbs } from "../components/ui/breadcrumbs";
import { Chip } from "../components/ui/chip";
import { Dropdown, DropdownDivider, DropdownGroupTitle, DropdownItem } from "../components/ui/dropdown";
import { InlineNotification } from "../components/ui/inline-notification";
import { Radio } from "../components/ui/radio";
import { SegmentedControl } from "../components/ui/segmented-control";
import { Tooltip } from "../components/ui/tooltip";
import { FunctionButton } from "../components/ui/function-button";
import { AIAgent, Message } from "../types";

export function ConsoleView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "create" | "billing" | "faq" | "workflow">("dashboard");

  const [selectedStage, setSelectedStage] = React.useState<string>("02-prd");
  const [stageApprovals, setStageApprovals] = React.useState<Record<string, boolean>>({
    "00-intake": true,
    "01-research": true,
    "02-prd": false,
    "03-ia": false,
    "04-design": false,
    "08-frontend": false,
    "11-qa": false,
    "12-release": false,
  });

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

  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("agent-1");
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

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

  const [messageInput, setMessageInput] = React.useState<string>("");
  const [isBotTyping, setIsBotTyping] = React.useState<boolean>(false);

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

  const [toastMessage, setToastMessage] = React.useState<{ title: string; subtitle: string; scheme: "success" | "info" | "error" } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = React.useState<boolean>(false);

  const triggerToast = (title: string, subtitle: string, scheme: "success" | "info" | "error" = "success") => {
    setToastMessage({ title, subtitle, scheme });
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isBotTyping) return;

    const userText = messageInput;
    setMessageInput("");

    setChatHistory((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), { sender: "user", text: userText }],
    }));

    setIsBotTyping(true);

    setTimeout(() => {
      let botResponse = "Я получил ваше сообщение и обрабатываю его на основе загруженного регламента.";

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
        botResponse = "Я могу автоматически провести первичное скоринг-интервью с кандидатом, оценить его навыки по вашему списку вопросов и записать подходящего соискателя прямо в вашу HR-систему.";
      }

      setChatHistory((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), { sender: "bot", text: botResponse }],
      }));

      setIsBotTyping(false);
    }, 1200);
  };

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

    setChatHistory((prev) => ({
      ...prev,
      [newAgent.id]: [
        { sender: "bot", text: `Здравствуйте! Я ваш новый ИИ-агент "${newAgent.name}". Моя роль: ${newAgent.role}. Я запущен и готов к работе!` },
      ],
    }));

    setNewAgentName("");
    setNewAgentKnowledge("");
    setActiveTab("dashboard");

    triggerToast("Агент создан", `ИИ-агент "${newAgent.name}" успешно добавлен в систему`, "success");
  };

  const totalDialogs = agents.reduce((sum, a) => sum + a.dialogsCount, 0);

  return (
    <main className="console-shell">
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

      <div className="console-container">
        
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

            <button
              className={`nav-item ${activeTab === "workflow" ? "active" : ""}`}
              onClick={() => setActiveTab("workflow")}
            >
              <Cpu className="nav-icon" />
              <span>Оркестратор контекста</span>
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

          {/* Кнопка возврата на лендинг */}
          <div className="px-3 pt-2">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-755 rounded-lg transition-colors border border-slate-700/50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Вернуться на Лендинг</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="footer-status">
              <span className="status-dot"></span>
              <span>Платформа: Активна</span>
            </div>
            <div className="footer-copyright">© 2026 AgentFlow</div>
          </div>
        </aside>

        <div className="console-main">
          
          <header className="console-topbar">
            <div className="topbar-left">
              <h1 className="topbar-title">SaaS-платформа для создания и продажи ИИ-агентов</h1>
            </div>

            <div className="topbar-right">
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
                      <DropdownDivider />
                      <DropdownItem onClick={() => triggerToast("Выход", "Симуляция выхода...", "info")}>
                        Выйти из системы
                      </DropdownItem>
                    </Dropdown>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="console-content">
            
            {activeTab === "dashboard" && (
              <div className="tab-dashboard animate-fade-in">
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
                  
                  <SegmentedControl
                    defaultValue="week"
                    options={[
                      { label: "Сегодня", value: "today" },
                      { label: "Неделя", value: "week" },
                      { label: "Месяц", value: "month" },
                    ]}
                    size="m"
                    onValueChange={(val: string) => triggerToast("Фильтр обновлен", `Данные за: ${val}`, "info")}
                  />
                </div>

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
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon-wrapper status-03">
                      <DollarSign className="metric-icon" />
                    </div>
                    <div className="metric-info">
                      <span className="metric-label">Сэкономлено костов</span>
                      <h3 className="metric-value">{(totalDialogs * 350).toLocaleString("ru-RU")} ₽</h3>
                    </div>
                  </div>
                </div>

                <div className="dashboard-grid">
                  
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
                    </div>
                  </div>

                  <div className="grid-chat-simulator">
                    <div className="section-card chat-card">
                      <div className="card-header chat-header">
                        <div className="chat-agent-info">
                          <Bot className="chat-agent-icon" />
                          <div>
                            <h4>Чат-симулятор с {selectedAgent.name}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="chat-messages-box flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                        {(chatHistory[selectedAgentId] || []).map((msg, idx) => (
                          <div key={idx} className={`chat-message ${msg.sender}`}>
                            <div className="message-bubble">
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        {isBotTyping && (
                          <div className="chat-message bot">
                            <div className="message-bubble opacity-60">
                              <p>Печатает...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSendMessage} className="chat-input-form flex gap-2 p-3 border-t border-slate-200 bg-slate-50">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Спросите агента про тарифы, ошибки или регламент..."
                          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#005FFC] bg-white text-slate-800"
                        />
                        <button
                          type="submit"
                          className="chat-submit-btn px-3 py-2 text-xs font-bold text-white bg-[#005FFC] hover:bg-[#005FFC]/90 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
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


            {activeTab === "workflow" && (
              <div className="tab-workflow animate-fade-in" style={{ padding: "24px", color: "#F8F9FA" }}>
                <div className="content-breadcrumbs" style={{ marginBottom: "20px" }}>
                  <Breadcrumbs
                    items={[
                      { href: "#", label: "Главная", onClick: () => setActiveTab("dashboard") },
                      { href: "#", label: "Консоль" },
                      { current: true, label: "Оркестратор контекста" },
                    ]}
                  />
                </div>

                <div className="dashboard-header-row" style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "24px" }}>
                  <div>
                    <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#F8F9FA" }}>Управление Оркестрацией контекста</h2>
                    <p className="subtitle" style={{ fontSize: "14px", color: "#94A3B8" }}>Интерактивный трекинг стадий воркфлоу, Gate Approvals и оптимизация контекста</p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ background: "rgba(0, 95, 252, 0.1)", border: "1px solid rgba(0, 95, 252, 0.2)", borderRadius: "12px", padding: "8px 16px", fontSize: "12px", fontWeight: "bold", color: "#005FFC" }}>
                      Сэкономлено токенов: <span style={{ color: "#10B981" }}>41,200 (38%)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                  
                  {/* Левая колонка - Граф Шагов */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="section-card" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "20px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px", color: "#F8F9FA" }}>Стадии воркфлоу</h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                          { id: "00-intake", title: "Intake & Briefing", desc: "Сбор требований и recursive brief" },
                          { id: "01-research", title: "Deep Research", desc: "Анализ конкурентов, SWOT, персоны" },
                          { id: "02-prd", title: "Product PRD", desc: "Спецификация требований и MoSCoW" },
                          { id: "03-ia", title: "Information Architecture", desc: "Главный экран и Sitemap" },
                          { id: "04-design", title: "Design Discovery", desc: "Visual spec и дизайн-бриф" },
                          { id: "08-frontend", title: "Frontend Implementation", desc: "Bespoke UI кастомная верстка" },
                          { id: "11-qa", title: "QA & Visual Review", desc: "Плейрайт и скриншот-сверка" },
                          { id: "12-release", title: "Release & Publish", desc: "Notion экспорт и деплой" }
                        ].map((stage) => {
                          const isApproved = stageApprovals[stage.id];
                          const isSelected = selectedStage === stage.id;
                          return (
                            <div
                              key={stage.id}
                              onClick={() => setSelectedStage(stage.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px",
                                borderRadius: "12px",
                                background: isSelected ? "rgba(0, 95, 252, 0.15)" : "transparent",
                                border: isSelected ? "1px solid rgba(0, 95, 252, 0.3)" : "1px solid transparent",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              <div style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: isApproved ? "#10B981" : "#F59E0B",
                                color: "white",
                                fontSize: "10px",
                                fontWeight: "bold"
                              }}>
                                {isApproved ? "✓" : "!"}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", fontWeight: "bold", color: isSelected ? "#005FFC" : "#F8F9FA" }}>{stage.title}</div>
                                <div style={{ fontSize: "10px", color: "#64748B" }}>{stage.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Правая колонка - Управление Approvals и Логи */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* Gate Approval Panel */}
                    <div className="section-card" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "20px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#F8F9FA" }}>
                        Панель Согласования (Quality Gate)
                      </h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "20px" }}>
                        Каждый этап требует ручного подтверждения (Human Approval Gate) перед переходом субагентов к следующему шагу воркфлоу.
                      </p>

                      <div style={{ background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "bold" }}>Текущий шаг для согласования: </span>
                          <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: "black", textTransform: "uppercase" }}>
                            {selectedStage === "02-prd" ? "02-PRD (Product Requirements)" : selectedStage}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: "12px", color: "#94A3B8", lineHeight: "1.6", marginBottom: "16px" }}>
                          {selectedStage === "02-prd" && "Спецификация требований MVP составлена. Включены разделы MoSCoW приоритизации, критерии приемки и интеграции с аналитикой. Запуск разработки фронтенда заблокирован до утверждения требований."}
                          {selectedStage === "03-ia" && "Информационная архитектура завершена. Описан Sitemap, главное пользовательское действие и сценарии перехода. Готово к утверждению."}
                          {selectedStage === "04-design" && "Дизайн-концепцияBespoke UI готова. Выявлены HEX-цвета референса, шрифты и адаптивная сетка. Готово к утверждению."}
                          {selectedStage !== "02-prd" && selectedStage !== "03-ia" && selectedStage !== "04-design" && "Стадия проверена автоматическими тестами. Требуется финальное подтверждение для синхронизации результатов."}
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                          <button
                            onClick={() => {
                              setStageApprovals(prev => ({ ...prev, [selectedStage]: true }));
                              triggerToast("Gate Approved", `Стадия ${selectedStage} успешно согласована!`, "success");
                            }}
                            disabled={stageApprovals[selectedStage]}
                            style={{
                              padding: "10px 20px",
                              borderRadius: "8px",
                              background: stageApprovals[selectedStage] ? "#10B981" : "#005FFC",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "12px",
                              cursor: stageApprovals[selectedStage] ? "not-allowed" : "pointer",
                              border: "none",
                              transition: "all 0.2s"
                            }}
                          >
                            {stageApprovals[selectedStage] ? "✓ Согласовано" : "Утвердить и Разрешить следующий шаг"}
                          </button>
                          
                          {!stageApprovals[selectedStage] && (
                            <button
                              onClick={() => {
                                triggerToast("Gate Rejected", `Стадия ${selectedStage} отправлена на доработку субагенту`, "error");
                              }}
                              style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid #EF4444",
                                color: "#EF4444",
                                fontWeight: "bold",
                                fontSize: "12px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              Отклонить (На доработку)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* State Truncation Gate Preview */}
                    <div className="section-card" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "20px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", color: "#F8F9FA" }}>
                        Оптимизация контекста (State Truncation Gate)
                      </h3>
                      <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>
                        Агент автоматически очищает историю переписки и передает специалистам строго сжатые YAML/JSON payloads, отсекая лишние логи.
                      </p>

                      <div style={{ background: "#0F172A", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", fontFamily: "monospace", fontSize: "11px", color: "#10B981" }}>
                        <div style={{ color: "#64748B", marginBottom: "8px" }}># handoff-bundle-truncated.md (YAML Spec)</div>
                        <div>---</div>
                        <div>schema_payload:</div>
                        <div>  status: ready</div>
                        <div>  current_stage: "{selectedStage}"</div>
                        <div>  goal: "Разработка облачного конфигуратора B2B"</div>
                        <div>  moscow_must:</div>
                        <div>    - "Hero с ясным CTA"</div>
                        <div>    - "Адаптивная верстка (Tailwind)"</div>
                        <div>    - "Форма обратной связи без PII"</div>
                        <div>---</div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

          </div>

          <footer className="console-footer">
            <span>© 2026 SaaS Платформа AgentFlow. Все права защищены.</span>
          </footer>

        </div>
      </div>
    </main>
  );
}
