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

// === TYPES & INTERFACES ===
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
  sender: "bot" | "user";
  text: string;
}

// === MAIN ROUTER ===
export function App() {
  if (window.location.pathname === "/components") {
    return <ComponentsPlayground />;
  }

  const [view, setView] = React.useState<"landing" | "console">(() => {
    if (window.location.hash === "#console" || window.location.pathname === "/console") {
      return "console";
    }
    return "landing";
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#console") {
        setView("console");
      } else {
        setView("landing");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSwitchToConsole = () => {
    window.location.hash = "console";
    setView("console");
  };

  const handleSwitchToLanding = () => {
    window.location.hash = "";
    setView("landing");
  };

  if (view === "console") {
    return <ConsoleView onBack={handleSwitchToLanding} />;
  }

  return <LandingView onConsole={handleSwitchToConsole} />;
}

// === LANDING VIEW (VK CLOUD PRICING CONFIGURATOR REPLICA) ===
function LandingView({ onConsole }: { onConsole: () => void }) {
  // 1. ACTIVE SERVICE CONFIGURATOR TAB
  const [activeConfigTab, setActiveConfigTab] = React.useState<
    "servers" | "storage" | "containers" | "databases" | "gpu" | "voice" | "vision" | "backup" | "ml"
  >("servers");
  const [billingPeriod, setBillingPeriod] = React.useState<"hour" | "month">("month");

  // --- SERVICE ACTIVE STATES (CHECKBOXES) ---
  const [calcServers, setCalcServers] = React.useState(true);
  const [calcStorage, setCalcStorage] = React.useState(false);
  const [calcContainers, setCalcContainers] = React.useState(false);
  const [calcDatabases, setCalcDatabases] = React.useState(false);
  const [calcGpu, setCalcGpu] = React.useState(false);
  const [calcVoice, setCalcVoice] = React.useState(false);
  const [calcVision, setCalcVision] = React.useState(false);
  const [calcBackup, setCalcBackup] = React.useState(false);
  const [calcMl, setCalcMl] = React.useState(false);

  // --- 1. Cloud Servers (Виртуальные машины) States ---
  const [serversOs, setServersOs] = React.useState<"ubuntu" | "centos" | "debian" | "windows">("ubuntu");
  const [serversDiskType, setServersDiskType] = React.useState<"ssd" | "fast_hdd" | "hdd">("ssd");
  const [vCpu, setVCpu] = React.useState<number>(4);
  const [ram, setRam] = React.useState<number>(16);
  const [ssd, setSsd] = React.useState<number>(160);

  // --- 2. Cloud Storage (Объектное хранилище S3) States ---
  const [storageClass, setStorageClass] = React.useState<"hot" | "cold" | "ice">("hot");
  const [storageGb, setStorageGb] = React.useState<number>(500);
  const [trafficGb, setTrafficGb] = React.useState<number>(100);

  // --- 3. Cloud Containers (Kubernetes) States ---
  const [containersHa, setContainersHa] = React.useState<boolean>(false); // false = 1 Master, true = 3 Masters
  const [workersCount, setWorkersCount] = React.useState<number>(3);
  const [workerCpu, setWorkerCpu] = React.useState<number>(4);
  const [workerRam, setWorkerRam] = React.useState<number>(8);

  // --- 4. Cloud Databases (Управляемые БД) States ---
  const [dbType, setDbType] = React.useState<"postgres" | "redis" | "mysql" | "clickhouse">("postgres");
  const [dbHa, setDbHa] = React.useState<boolean>(false); // Single vs Replica
  const [dbCpu, setDbCpu] = React.useState<number>(4);
  const [dbRam, setDbRam] = React.useState<number>(16);

  // --- 5. Cloud GPU (Вычисления с GPU) States ---
  const [gpuType, setGpuType] = React.useState<"a100" | "v100" | "t4">("t4");
  const [gpuCount, setGpuCount] = React.useState<number>(1);
  const [gpuCpu, setGpuCpu] = React.useState<number>(8);
  const [gpuRam, setGpuRam] = React.useState<number>(32);

  // --- 6. Cloud Voice (Речевые технологии) States ---
  const [voiceAsr, setVoiceAsr] = React.useState<number>(1000); // распознавание, мин
  const [voiceTts, setVoiceTts] = React.useState<number>(1000); // синтез, мин

  // --- 7. Vision (Компьютерное зрение) States ---
  const [visionImages, setVisionImages] = React.useState<number>(5000); // транзакций
  const [visionStreams, setVisionStreams] = React.useState<number>(5); // камер

  // --- 8. Cloud Backup (Резервное копирование) States ---
  const [backupGb, setBackupGb] = React.useState<number>(200);
  const [backupRetention, setBackupRetention] = React.useState<number>(30); // 7, 30, 90 дней

  // --- 9. Cloud ML Platform States ---
  const [mlEnv, setMlEnv] = React.useState<"jupyter" | "mlflow" | "training">("jupyter");
  const [mlCpu, setMlCpu] = React.useState<number>(4);
  const [mlRam, setMlRam] = React.useState<number>(16);

  // --- 2. Lead Form States ---
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // --- 3. FAQ Accordions ---
  const [faqOpen, setFaqOpen] = React.useState<Record<number, boolean>>({
    0: true
  });

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // --- 4. REALISTIC BILLING FORMULAS (HOURLY) ---
  const getServersPrice = () => {
    if (!calcServers) return 0;
    const osCoeff = serversOs === "windows" ? 0.35 : 0;
    const diskCoeff = serversDiskType === "ssd" ? 0.006 : serversDiskType === "fast_hdd" ? 0.003 : 0.0015;
    return (vCpu * 0.48) + (ram * 0.12) + (ssd * diskCoeff) + osCoeff;
  };

  const getStoragePrice = () => {
    if (!calcStorage) return 0;
    const classCoeff = storageClass === "hot" ? 0.0028 : storageClass === "cold" ? 0.0016 : 0.0008;
    return (storageGb * classCoeff) + (trafficGb * 1.15 / 720);
  };

  const getContainersPrice = () => {
    if (!calcContainers) return 0;
    const masterNodePrice = containersHa ? 3 * 0.50 : 1 * 0.50;
    const workerNodesPrice = workersCount * ((workerCpu * 0.48) + (workerRam * 0.12) + 80 * 0.006);
    return masterNodePrice + workerNodesPrice;
  };

  const getDatabasesPrice = () => {
    if (!calcDatabases) return 0;
    const instanceCoeff = dbHa ? 2 : 1;
    const dbCoeff = dbType === "clickhouse" ? 1.2 : 1.0;
    return instanceCoeff * dbCoeff * ((dbCpu * 0.55) + (dbRam * 0.16) + 120 * 0.006);
  };

  const getGpuPrice = () => {
    if (!calcGpu) return 0;
    const gpuCoeff = gpuType === "a100" ? 14.5 : gpuType === "v100" ? 7.8 : 2.9;
    return (gpuCount * gpuCoeff) + (gpuCpu * 0.48) + (gpuRam * 0.12);
  };

  const getVoicePrice = () => {
    if (!calcVoice) return 0;
    // 1000 мин ASR = ~800 ₽/мес, 1000 мин TTS = ~600 ₽/мес
    return ((voiceAsr * 0.80) + (voiceTts * 0.60)) / 720;
  };

  const getVisionPrice = () => {
    if (!calcVision) return 0;
    // 1000 транзакций = ~100 ₽, 1 камера = ~900 ₽/мес
    return ((visionImages * 0.10) + (visionStreams * 900)) / 720;
  };

  const getBackupPrice = () => {
    if (!calcBackup) return 0;
    const retentionCoeff = backupRetention === 90 ? 1.4 : backupRetention === 30 ? 1.1 : 1.0;
    return (backupGb * 0.0035) * retentionCoeff;
  };

  const getMlPrice = () => {
    if (!calcMl) return 0;
    const envCoeff = mlEnv === "training" ? 1.6 : mlEnv === "mlflow" ? 1.2 : 1.0;
    return envCoeff * ((mlCpu * 0.60) + (mlRam * 0.18));
  };

  // --- SUB TOTALS ---
  const getSubtotalHourly = () => {
    return (
      getServersPrice() +
      getStoragePrice() +
      getContainersPrice() +
      getDatabasesPrice() +
      getGpuPrice() +
      getVoicePrice() +
      getVisionPrice() +
      getBackupPrice() +
      getMlPrice()
    );
  };

  const getSubtotalMonthly = () => {
    return getSubtotalHourly() * 720; // standard 30-day month in hours
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₽";
  };

  // --- MODAL ACTION ---
  const handleOpenModal = () => {
    setName("");
    setEmail("");
    setCompany("");
    setErrors({});
    setIsSuccess(false);

    let configText = "Прошу выслать B2B-предложение на облачную конфигурацию:\n";
    if (calcServers) {
      configText += `- Cloud Servers: ОС: ${serversOs.toUpperCase()}, Диск: ${serversDiskType.toUpperCase()}, vCPU: ${vCpu} ядер, RAM: ${ram} ГБ, SSD: ${ssd} ГБ\n`;
    }
    if (calcStorage) {
      configText += `- Cloud Storage (S3): Класс: ${storageClass.toUpperCase()}, Объем: ${storageGb} ГБ, Исх. Трафик: ${trafficGb} ГБ\n`;
    }
    if (calcContainers) {
      configText += `- Cloud Containers (Kubernetes): Схема: ${containersHa ? "HA (3 Masters)" : "Single (1 Master)"}, Ноды: ${workersCount}x (vCPU: ${workerCpu}, RAM: ${workerRam} ГБ)\n`;
    }
    if (calcDatabases) {
      configText += `- Cloud Databases: СУБД: ${dbType.toUpperCase()}, Схема: ${dbHa ? "Cluster" : "Single"}, vCPU: ${dbCpu}, RAM: ${dbRam} ГБ\n`;
    }
    if (calcGpu) {
      configText += `- Cloud GPU: Ускоритель: ${gpuType.toUpperCase()}, Кол-во GPU: ${gpuCount}, vCPU: ${gpuCpu}, RAM: ${gpuRam} ГБ\n`;
    }
    if (calcVoice) {
      configText += `- Cloud Voice: Распознавание (ASR): ${voiceAsr} мин, Синтез (TTS): ${voiceTts} мин\n`;
    }
    if (calcVision) {
      configText += `- Vision (Компьютерное зрение): Транзакции: ${visionImages} шт, Видеопотоки: ${visionStreams} камер\n`;
    }
    if (calcBackup) {
      configText += `- Cloud Backup: Резервные копии: ${backupGb} ГБ, Период: ${backupRetention} дней\n`;
    }
    if (calcMl) {
      configText += `- Cloud ML Platform: Среда: ${mlEnv.toUpperCase()}, Ресурсы: vCPU: ${mlCpu}, RAM: ${mlRam} ГБ\n`;
    }

    configText += `\nОриентировочная сумма просчета: ${formatPrice(billingPeriod === "hour" ? getSubtotalHourly() : getSubtotalMonthly())} в ${billingPeriod === "hour" ? "час" : "месяц"}`;

    setMessage(configText);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Пожалуйста, введите ваше имя";
    if (!company.trim()) newErrors.company = "Укажите название вашей компании";
    
    if (!email.trim()) {
      newErrors.email = "Введите рабочий Email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Введите корректный Email";
    } else {
      const personalDomains = ["gmail.com", "yandex.ru", "mail.ru", "list.ru", "bk.ru", "inbox.ru", "outlook.com", "hotmail.com"];
      const domain = email.split("@")[1]?.toLowerCase();
      if (personalDomains.includes(domain)) {
        newErrors.email = "Пожалуйста, укажите корпоративный Email вашей компании";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      console.log("B2B Lead Submitted successfully:", { name, email, company, message });
    }, 1000);
  };

  // --- SYNC INPUT SLIDER HELPER ---
  const renderSliderWithInput = (
    id: string,
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    unit: string,
    onChange: (val: number) => void,
    marks: number[]
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor={id} className="text-xs font-black text-slate-700 uppercase tracking-wider">{label}</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={min}
              max={max}
              value={value}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val > max) val = max;
                onChange(val);
              }}
              onBlur={() => {
                if (value < min) onChange(min);
              }}
              className="w-16 px-2 py-1 text-center text-xs font-black text-[#005FFC] bg-[#005FFC]/5 border border-[#005FFC]/20 rounded-md outline-none focus:border-[#005FFC] transition-all"
            />
            <span className="text-xs font-bold text-slate-500">{unit}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#005FFC] outline-none"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5">
          {marks.map((m, idx) => (
            <span key={idx} className="cursor-pointer hover:text-[#005FFC]" onClick={() => onChange(m)}>
              {m} {unit}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // --- SERVICE BUTTON LIST (FOR GRID AND SWITCHING) ---
  const servicesList = [
    { id: "servers", title: "Cloud Servers", desc: "Виртуальные серверы", active: calcServers, toggle: () => setCalcServers(!calcServers) },
    { id: "storage", title: "Cloud Storage", desc: "Объектное хранилище S3", active: calcStorage, toggle: () => setCalcStorage(!calcStorage) },
    { id: "containers", title: "Cloud Containers", desc: "Кластеры Kubernetes", active: calcContainers, toggle: () => setCalcContainers(!calcContainers) },
    { id: "databases", title: "Cloud Databases", desc: "Базы данных Managed", active: calcDatabases, toggle: () => setCalcDatabases(!calcDatabases) },
    { id: "gpu", title: "Cloud GPU", desc: "Вычисления с GPU", active: calcGpu, toggle: () => setCalcGpu(!calcGpu) },
    { id: "voice", title: "Cloud Voice", desc: "Речевые технологии", active: calcVoice, toggle: () => setCalcVoice(!calcVoice) },
    { id: "vision", title: "Vision", desc: "Компьютерное зрение", active: calcVision, toggle: () => setCalcVision(!calcVision) },
    { id: "backup", title: "Cloud Backup", desc: "Бэкапы серверов", active: calcBackup, toggle: () => setCalcBackup(!calcBackup) },
    { id: "ml", title: "Cloud ML Platform", desc: "Машинное обучение", active: calcMl, toggle: () => setCalcMl(!calcMl) },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0B1F35] font-sans antialiased overflow-x-hidden selection:bg-[#005FFC]/20">
      
      {/* 1. БРЕНДОВЫЙ STICKY HEADER В СТИЛЕ VK CLOUD */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E1E5EB] transition-all">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#005FFC] flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
                vk
              </div>
              <span className="font-bold text-[#0B1F35] text-lg tracking-tight group-hover:text-[#005FFC] transition-colors">
                cloud
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#benefits" className="hover:text-[#005FFC] transition-colors">Преимущества</a>
              <a href="#configurator" className="text-[#005FFC] border-b-2 border-[#005FFC] pb-1 font-bold">Калькулятор цен</a>
              <a href="#free-services" className="hover:text-[#005FFC] transition-colors">Бесплатные сервисы</a>
              <a href="#clients" className="hover:text-[#005FFC] transition-colors">Наши клиенты</a>
              <a href="#faq" className="hover:text-[#005FFC] transition-colors">Вопросы и ответы</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onConsole}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#005FFC] bg-[#005FFC]/10 hover:bg-[#005FFC]/20 rounded-lg transition-colors border border-[#005FFC]/20"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Консоль AgentFlow</span>
            </button>

            <a
              href="https://cloud.vk.com/app/signin/"
              className="text-xs font-bold text-slate-600 hover:text-[#005FFC] transition-colors px-2.5 py-1.5 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Вход</span>
            </a>

            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#005FFC] hover:bg-[#005FFC]/95 rounded-lg shadow-sm hover:shadow transition-all"
            >
              Получить консультацию
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#005FFC]/5 to-transparent pt-12 pb-16 md:py-20 border-b border-slate-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#005FFC]/10 text-[#005FFC] rounded-full text-xs font-bold uppercase tracking-wider">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Pay-as-you-go тарификация</span>
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1F35] leading-tight">
              Калькулятор цен
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
              Мы работаем по системе pay-as-you-go. Вы платите только за реальные потребляемые ресурсы и с точностью до секунды. Без переплат за нерабочее время и простои.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <a
                href="#configurator"
                className="w-full sm:w-auto text-center px-6 py-3.5 text-sm font-bold text-white bg-[#005FFC] hover:bg-[#005FFC]/95 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Создать конфигурацию
              </a>
              <button
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
              >
                Получить консультацию
              </button>
            </div>
          </div>

          {/* Иллюстрация конфигуратора */}
          <div className="flex justify-center">
            <div className="w-full max-w-[440px] bg-white border border-[#E1E5EB] rounded-2xl shadow-xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-black text-[#0B1F35] tracking-wider uppercase">ОБЗОР РАСЧЕТА</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Cloud Servers (активно)</span>
                  <span className="text-[#0B1F35] font-bold">{calcServers ? `${vCpu} ядра / ${ram} ГБ` : "выключено"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Объектное хранилище (S3)</span>
                  <span className="text-[#0B1F35] font-bold">{calcStorage ? `${storageGb} ГБ (${storageClass.toUpperCase()})` : "выключено"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Managed Kubernetes</span>
                  <span className="text-[#0B1F35] font-bold">{calcContainers ? `${workersCount} нод(ы) (${workerCpu}vCPU / ${workerRam}ГБ)` : "выключено"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Managed Базы Данных</span>
                  <span className="text-[#0B1F35] font-bold">{calcDatabases ? `${dbType.toUpperCase()} (${dbCpu}vCPU / ${dbRam}ГБ)` : "выключено"}</span>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-baseline">
                  <span className="text-sm font-black text-[#0B1F35]">Итого в месяц:</span>
                  <span className="text-2xl font-black text-[#005FFC]">{formatPrice(getSubtotalMonthly())}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. БЛОК ДОВЕРИЯ (TRUST BADGES) */}
      <section id="benefits" className="py-12 max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: <ShieldCheck className="w-5 h-5" />, title: "Юридический SLA 99.95%", desc: "Зафиксированный в договоре уровень доступности серверов и сетей." },
          { icon: <Lock className="w-5 h-5" />, title: "ФЗ-152 (УЗ-1 - УЗ-3)", desc: "Размещение персональных данных на аттестованной в РФ платформе." },
          { icon: <Shield className="w-5 h-5" />, title: "Безопасность ISO 27001", desc: "Сертифицированный международный менеджмент инфобезопасности." },
          { icon: <Layers className="w-5 h-5" />, title: "Встроенный Anti-DDoS", desc: "Защита сетевых ресурсов от DDoS-атак на уровнях L3-L4." },
        ].map((item, idx) => (
          <div key={idx} className="p-5 bg-white border border-[#E1E5EB] rounded-2xl shadow-sm hover:shadow transition-all">
            <div className="text-[#005FFC] w-10 h-10 rounded-xl bg-[#005FFC]/10 flex items-center justify-center mb-3">
              {item.icon}
            </div>
            <h3 className="text-sm font-black text-[#0B1F35] mb-1">{item.title}</h3>
            <p className="text-xs leading-relaxed text-slate-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* 4. ИНТЕРАКТИВНЫЙ КОНФИГУРАТОР РЕСУРСОВ */}
      <section id="configurator" className="py-16 bg-white border-y border-[#E1E5EB]">
        <div className="max-w-[1200px] mx-auto px-4 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F35]">
              Создайте свою конфигурацию
            </h2>
            <p className="text-sm text-slate-500 font-semibold max-w-xl mx-auto">
              Чтобы рассчитать ориентировочную стоимость услуг, добавьте в конфигуратор необходимые облачные сервисы и настройте их параметры.
            </p>
          </div>

          {/* Двухколоночный макет конфигуратора */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Левая колонка - Карточки выбора сервисов + детальные слайдеры */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* СЕТКА ИЗ 9 СЕРВИСОВ (ДИЗАЙН-КОМПОНЕНТЫ ПО РЕФЕРЕНСУ) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {servicesList.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setActiveConfigTab(srv.id as any)}
                    className={`relative p-4 bg-white border rounded-2xl shadow-xs transition-all duration-200 cursor-pointer select-none ${
                      activeConfigTab === srv.id
                        ? "border-[#005FFC] ring-4 ring-[#005FFC]/5 shadow-sm"
                        : "border-[#E1E5EB] hover:border-slate-300"
                    }`}
                  >
                    {/* Синий Чекбокс в верхнем правом углу карточки */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        srv.toggle();
                      }}
                      className={`absolute top-3 right-3 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        srv.active
                          ? "bg-[#005FFC] border-[#005FFC] text-white"
                          : "border-slate-300 bg-slate-50 hover:border-slate-400"
                      }`}
                    >
                      {srv.active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B1F35]">
                        {srv.id === "servers" && <Cpu className="w-5 h-5" />}
                        {srv.id === "storage" && <HardDrive className="w-5 h-5" />}
                        {srv.id === "containers" && <Layers className="w-5 h-5" />}
                        {srv.id === "databases" && <Database className="w-5 h-5" />}
                        {srv.id === "gpu" && <Zap className="w-5 h-5" />}
                        {srv.id === "voice" && <MessageSquare className="w-5 h-5" />}
                        {srv.id === "vision" && <Sparkles className="w-5 h-5" />}
                        {srv.id === "backup" && <ClipboardCheck className="w-5 h-5" />}
                        {srv.id === "ml" && <Bot className="w-5 h-5" />}
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-[#0B1F35] tracking-tight">{srv.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">{srv.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ТЕЛО КОНФИГУРАТОРА (АКТИВНАЯ ВКЛАДКА) */}
              <div className="bg-slate-50 border border-[#E1E5EB] rounded-2xl p-6 space-y-6">
                
                {/* 1. CLOUD SERVERS */}
                {activeConfigTab === "servers" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud Servers</h3>
                        <p className="text-xs text-slate-500">Виртуальные серверы с быстрыми SSD-накопителями и широким выбором ОС.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcServers ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcServers ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Выбор Операционной Системы */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Операционная система</label>
                        <div className="relative">
                          <select
                            value={serversOs}
                            onChange={(e) => setServersOs(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none appearance-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                          >
                            <option value="ubuntu">Ubuntu Server LTS (рекомендуется)</option>
                            <option value="centos">CentOS Server</option>
                            <option value="debian">Debian GNU/Linux</option>
                            <option value="windows">Windows Server Core 2022 (+ лиц.)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Выбор Типа Диска */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Тип накопителя</label>
                        <div className="relative">
                          <select
                            value={serversDiskType}
                            onChange={(e) => setServersDiskType(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none appearance-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                          >
                            <option value="ssd">High-Speed SSD (быстрый доступ)</option>
                            <option value="fast_hdd">Fast HDD (сбалансированный)</option>
                            <option value="hdd">Low-Cost HDD (архивный)</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {renderSliderWithInput("srv-vcpu", "Вычислительные ядра vCPU", 2, 64, 2, vCpu, "ядер", setVCpu, [2, 16, 32, 64])}
                    {renderSliderWithInput("srv-ram", "Оперативная память RAM", 4, 256, 4, ram, "ГБ", setRam, [4, 64, 128, 256])}
                    {renderSliderWithInput("srv-ssd", "Размер диска", 40, 1000, 20, ssd, "ГБ", setSsd, [40, 300, 600, 1000])}
                  </div>
                )}

                {/* 2. CLOUD STORAGE */}
                {activeConfigTab === "storage" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud Storage S3</h3>
                        <p className="text-xs text-slate-500">S3-совместимое хранилище для бэкапов, медиафайлов и статических сайтов.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcStorage ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcStorage ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    {/* Класс хранилища */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Класс хранения S3</label>
                      <div className="relative">
                        <select
                          value={storageClass}
                          onChange={(e) => setStorageClass(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none appearance-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                        >
                          <option value="hot">Hot Storage (активная работа, высокая скорость)</option>
                          <option value="cold">Cold Storage (бэкапы, средняя скорость)</option>
                          <option value="ice">Ice Storage (архив, низкая цена, медленный доступ)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {renderSliderWithInput("stg-gb", "Объем S3-хранилища", 50, 5000, 50, storageGb, "ГБ", setStorageGb, [50, 1000, 3000, 5000])}
                    {renderSliderWithInput("stg-traffic", "Исходящий интернет-трафик", 0, 1000, 10, trafficGb, "ГБ", setTrafficGb, [0, 250, 500, 1000])}
                  </div>
                )}

                {/* 3. CLOUD CONTAINERS */}
                {activeConfigTab === "containers" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud Containers (Kubernetes)</h3>
                        <p className="text-xs text-slate-500">Готовые к продакшену кластеры Kubernetes с автоматическим масштабированием.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcContainers ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcContainers ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    {/* Отказоустойчивость Мастер-нод */}
                    <div className="flex items-center justify-between p-4 bg-white border border-[#E1E5EB] rounded-xl">
                      <div>
                        <h4 className="text-xs font-black text-[#0B1F35] uppercase tracking-wider">Отказоустойчивый Master-кластер (High Availability)</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Резервирование управляющей ноды (3 независимых мастера в разных зонах SLA 99.99%)</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={containersHa}
                        onChange={(e) => setContainersHa(e.target.checked)}
                        className="w-5 h-5 accent-[#005FFC] cursor-pointer"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* workerCpu */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Ядра на одну Worker-ноду</label>
                        <select
                          value={workerCpu}
                          onChange={(e) => setWorkerCpu(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                        >
                          <option value={2}>2 ядра vCPU</option>
                          <option value={4}>4 ядра vCPU</option>
                          <option value={8}>8 ядер vCPU</option>
                          <option value={16}>16 ядер vCPU</option>
                        </select>
                      </div>

                      {/* workerRam */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">RAM на одну Worker-ноду</label>
                        <select
                          value={workerRam}
                          onChange={(e) => setWorkerRam(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                        >
                          <option value={4}>4 ГБ RAM</option>
                          <option value={8}>8 ГБ RAM</option>
                          <option value={16}>16 ГБ RAM</option>
                          <option value={32}>32 ГБ RAM</option>
                          <option value={64}>64 ГБ RAM</option>
                        </select>
                      </div>
                    </div>

                    {renderSliderWithInput("k8s-workers", "Количество рабочих нод (Worker-nodes)", 1, 50, 1, workersCount, "нод", setWorkersCount, [1, 5, 10, 20, 50])}
                  </div>
                )}

                {/* 4. CLOUD DATABASES */}
                {activeConfigTab === "databases" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud Databases</h3>
                        <p className="text-xs text-slate-500">Готовые отказоустойчивые базы данных PostgreSQL, Redis, MySQL с бэкапами.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcDatabases ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcDatabases ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Тип СУБД */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Тип базы данных</label>
                        <select
                          value={dbType}
                          onChange={(e) => setDbType(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                        >
                          <option value="postgres">PostgreSQL Enterprise</option>
                          <option value="redis">Redis In-Memory DB</option>
                          <option value="mysql">MySQL Community Edition</option>
                          <option value="clickhouse">ClickHouse OLAP Analytics</option>
                        </select>
                      </div>

                      {/* Репликация */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Отказоустойчивость</label>
                        <select
                          value={dbHa ? "ha" : "single"}
                          onChange={(e) => setDbHa(e.target.value === "ha")}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                        >
                          <option value="single">Single Node (один инстанс)</option>
                          <option value="ha">High Availability (1 Master + 1 Replica)</option>
                        </select>
                      </div>
                    </div>

                    {renderSliderWithInput("db-cpu", "Ядра СУБД vCPU", 2, 32, 2, dbCpu, "ядер", setDbCpu, [2, 8, 16, 32])}
                    {renderSliderWithInput("db-ram", "Память СУБД RAM", 4, 128, 4, dbRam, "ГБ", setDbRam, [4, 32, 64, 128])}
                  </div>
                )}

                {/* 5. CLOUD GPU */}
                {activeConfigTab === "gpu" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud GPU</h3>
                        <p className="text-xs text-slate-500">Высокопроизводительные серверы с графическими процессорами NVIDIA для рендеринга и ИИ.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcGpu ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcGpu ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Модель ускорителя GPU</label>
                      <select
                        value={gpuType}
                        onChange={(e) => setGpuType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                      >
                        <option value="t4">NVIDIA Tesla T4 (универсальный, 16ГБ видеопамяти)</option>
                        <option value="v100">NVIDIA Tesla V100 (обучение ML, 32ГБ видеопамяти)</option>
                        <option value="a100">NVIDIA Tesla A100 (сверхмощный ML/LLM, 80ГБ видеопамяти)</option>
                      </select>
                    </div>

                    {renderSliderWithInput("gpu-count", "Количество графических ядер GPU", 1, 8, 1, gpuCount, "GPU", setGpuCount, [1, 2, 4, 8])}
                    {renderSliderWithInput("gpu-cpu", "Сопутствующие ядра vCPU", 4, 32, 2, gpuCpu, "ядер", setGpuCpu, [4, 16, 24, 32])}
                    {renderSliderWithInput("gpu-ram", "Оперативная память RAM", 16, 256, 16, gpuRam, "ГБ", setGpuRam, [16, 64, 128, 256])}
                  </div>
                )}

                {/* 6. CLOUD VOICE */}
                {activeConfigTab === "voice" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud Voice (Речевые технологии)</h3>
                        <p className="text-xs text-slate-500">Автоматический синтез (TTS) и распознавание (ASR) русской речи с точностью более 98%.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcVoice ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcVoice ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    {renderSliderWithInput("voice-asr", "Распознавание речи (ASR)", 0, 50000, 1000, voiceAsr, "мин", setVoiceAsr, [0, 10000, 30000, 50000])}
                    {renderSliderWithInput("voice-tts", "Синтез речи (TTS)", 0, 50000, 1000, voiceTts, "мин", setVoiceTts, [0, 10000, 30000, 50000])}
                  </div>
                )}

                {/* 7. VISION */}
                {activeConfigTab === "vision" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Vision (Компьютерное зрение)</h3>
                        <p className="text-xs text-slate-500">Анализ изображений, распознавание лиц, автомобильных номеров и документов.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcVision ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcVision ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    {renderSliderWithInput("vision-img", "Анализ изображений (транзакции)", 0, 100000, 5000, visionImages, "транз", setVisionImages, [0, 25000, 50000, 100000])}
                    {renderSliderWithInput("vision-streams", "Количество видеопотоков (камеры)", 0, 50, 1, visionStreams, "камер", setVisionStreams, [0, 10, 25, 50])}
                  </div>
                )}

                {/* 8. CLOUD BACKUP */}
                {activeConfigTab === "backup" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud Backup (Бэкапы серверов)</h3>
                        <p className="text-xs text-slate-500">Автоматическое резервное копирование серверов и баз данных по расписанию.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcBackup ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcBackup ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    {/* Глубина хранения */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Период хранения бэкапов</label>
                      <select
                        value={backupRetention}
                        onChange={(e) => setBackupRetention(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                      >
                        <option value={7}>7 дней хранения (стандартно)</option>
                        <option value={30}>30 дней хранения (рекомендуется для B2B)</option>
                        <option value={90}>90 дней хранения (повышенная безопасность)</option>
                      </select>
                    </div>

                    {renderSliderWithInput("bkp-gb", "Объем бэкап-хранилища", 50, 2000, 50, backupGb, "ГБ", setBackupGb, [50, 500, 1000, 2000])}
                  </div>
                )}

                {/* 9. CLOUD ML PLATFORM */}
                {activeConfigTab === "ml" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F35] uppercase tracking-wider">Cloud ML Platform</h3>
                        <p className="text-xs text-slate-500">Окружение для Data Science с готовыми блокнотами JupyterHub и отслеживанием моделей в MLflow.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${calcMl ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {calcMl ? "В расчете" : "Исключен из расчета"}
                      </span>
                    </div>

                    {/* Среда */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Инфраструктурная среда</label>
                      <select
                        value={mlEnv}
                        onChange={(e) => setMlEnv(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E1E5EB] rounded-lg outline-none font-bold text-slate-700 cursor-pointer focus:border-[#005FFC]"
                      >
                        <option value="jupyter">JupyterHub Collaborative IDE (разработка)</option>
                        <option value="mlflow">MLflow Tracking Server (управление версиями)</option>
                        <option value="training">Distributed Training GPU Cluster (обучение моделей)</option>
                      </select>
                    </div>

                    {renderSliderWithInput("ml-cpu", "Ядра vCPU инференса", 2, 16, 2, mlCpu, "ядер", setMlCpu, [2, 4, 8, 16])}
                    {renderSliderWithInput("ml-ram", "Память RAM инференса", 8, 64, 8, mlRam, "ГБ", setMlRam, [8, 16, 32, 64])}
                  </div>
                )}

              </div>
            </div>

            {/* Правая колонка - ИТОГ РАСЧЕТА (STICKY BILLING SUMMARY) */}
            <div className="lg:col-span-1 bg-white border border-[#E1E5EB] rounded-2xl shadow-md p-6 space-y-6 sticky top-20">
              <div className="space-y-2">
                <h3 className="text-sm font-black text-[#0B1F35] tracking-wider uppercase">Итог расчета</h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Почасовая детализация для pay-as-you-go биллинга:
                </p>
              </div>

              {/* Переключатель биллинга */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                <button
                  onClick={() => setBillingPeriod("hour")}
                  className={`flex-1 text-center py-1.5 text-[10px] font-black rounded-md transition-all ${billingPeriod === "hour" ? "bg-white text-[#005FFC] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  В час
                </button>
                <button
                  onClick={() => setBillingPeriod("month")}
                  className={`flex-1 text-center py-1.5 text-[10px] font-black rounded-md transition-all ${billingPeriod === "month" ? "bg-white text-[#005FFC] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  В месяц
                </button>
              </div>

              {/* Спецификация цен по элементам */}
              <div className="space-y-3 text-xs border-y border-slate-100 py-4 font-semibold text-slate-500 max-h-[300px] overflow-y-auto">
                
                {calcServers && (
                  <div className="flex justify-between">
                    <span>Cloud Servers</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getServersPrice().toFixed(2)} ₽/ч` 
                        : `${(getServersPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcStorage && (
                  <div className="flex justify-between">
                    <span>Cloud Storage</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getStoragePrice().toFixed(2)} ₽/ч` 
                        : `${(getStoragePrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcContainers && (
                  <div className="flex justify-between">
                    <span>Cloud Containers</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getContainersPrice().toFixed(2)} ₽/ч` 
                        : `${(getContainersPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcDatabases && (
                  <div className="flex justify-between">
                    <span>Cloud Databases</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getDatabasesPrice().toFixed(2)} ₽/ч` 
                        : `${(getDatabasesPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcGpu && (
                  <div className="flex justify-between">
                    <span>Cloud GPU</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getGpuPrice().toFixed(2)} ₽/ч` 
                        : `${(getGpuPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcVoice && (
                  <div className="flex justify-between">
                    <span>Cloud Voice</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getVoicePrice().toFixed(2)} ₽/ч` 
                        : `${(getVoicePrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcVision && (
                  <div className="flex justify-between">
                    <span>Vision AI</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getVisionPrice().toFixed(2)} ₽/ч` 
                        : `${(getVisionPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcBackup && (
                  <div className="flex justify-between">
                    <span>Cloud Backup</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getBackupPrice().toFixed(2)} ₽/ч` 
                        : `${(getBackupPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {calcMl && (
                  <div className="flex justify-between">
                    <span>Cloud ML Platform</span>
                    <span className="text-slate-800">
                      {billingPeriod === "hour" 
                        ? `${getMlPrice().toFixed(2)} ₽/ч` 
                        : `${(getMlPrice() * 720).toLocaleString("ru-RU")} ₽/м`}
                    </span>
                  </div>
                )}

                {(!calcServers && !calcStorage && !calcContainers && !calcDatabases && !calcGpu && !calcVoice && !calcVision && !calcBackup && !calcMl) && (
                  <div className="text-center text-slate-400 py-2">
                    Ни один сервис не выбран в расчет
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-[#0B1F35]">Итоговая сумма:</span>
                  <span className="text-2xl font-black text-[#005FFC]">
                    {formatPrice(billingPeriod === "hour" ? getSubtotalHourly() : getSubtotalMonthly())}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-bold block text-right">
                  *Включая НДС 20%. Тарификация с точностью до секунды.
                </span>
              </div>

              {/* Заказать конфигурацию */}
              <button
                onClick={handleOpenModal}
                disabled={!calcServers && !calcStorage && !calcContainers && !calcDatabases && !calcGpu && !calcVoice && !calcVision && !calcBackup && !calcMl}
                className="w-full py-3.5 text-xs font-bold text-white bg-[#005FFC] hover:bg-[#005FFC]/95 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Заказать конфигурацию
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 5. ИНТЕРАКТИВНЫЙ БАННЕР «ПОПРОБУЙТЕ НАШИ СЕРВИСЫ» (БОНУС 5000) */}
      <section className="py-16 max-w-[1200px] mx-auto px-4">
        <div className="bg-gradient-to-r from-[#005FFC] to-[#0d57f2] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white animate-bounce" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black">
              Попробуйте наши сервисы
            </h2>
            
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-semibold">
              После активации аккаунта мы свяжемся с вами и начислим 5000 рублей на ваш счет VK Cloud, чтобы вы смогли протестировать облачные серверы в течение 60 дней.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-10">
            <a
              href="https://cloud.vk.com/app/"
              className="px-6 py-3.5 text-center text-sm font-bold text-[#005FFC] bg-white hover:bg-slate-50 rounded-xl shadow-md transition-all active:scale-95"
            >
              Тестировать бесплатно
            </a>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3.5 text-center text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
            >
              Получить консультацию
            </button>
          </div>
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
      </section>

      {/* 6. БЕСПЛАТНЫЕ СЕРВИСЫ (FREE SERVICES) */}
      <section id="free-services" className="py-16 border-t border-[#E1E5EB] bg-[#F8F9FA]">
        <div className="max-w-[1200px] mx-auto px-4 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-[#0B1F35]">Бесплатные сервисы</h2>
            <p className="text-xs text-slate-400 font-semibold">Опции, которые включены в любой выбранный вами тарифный план</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Безлимитный трафик 1 Гбит/с",
                desc: "Высокоскоростная сетевая связность и неограниченный входящий и исходящий трафик без переплат."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Сети и безопасность",
                desc: "Маршрутизация и фильтрация трафика, легкое развертывание VPN-соединений и приватный DNS."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Круглосуточная поддержка",
                desc: "Профессиональная B2B техническая поддержка в облаке доступна 24 часа в сутки, 7 дней в неделю."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E1E5EB] rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[#005FFC] w-12 h-12 rounded-xl bg-[#005FFC]/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-sm font-black text-[#0B1F35]">{item.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. НАШИ КЛИЕНТЫ (B2B CLIENT LOGOS) */}
      <section id="clients" className="py-16 border-t border-[#E1E5EB] max-w-[1200px] mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[#0B1F35]">Наши клиенты</h2>
          <p className="text-xs text-slate-400 font-semibold">Как облачные сервисы VK Cloud помогают крупным компаниям решать ИТ-задачи</p>
        </div>

        {/* Client cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
          {[
            { name: "DNS", spec: "Миграция аналитики" },
            { name: "amocrm", spec: "Защита API от DDoS" },
            { name: "danone", spec: "Хранилище S3" },
            { name: "invitro", spec: "Аттестованное 152-ФЗ" },
            { name: "rosatom", spec: "Гибридное облако" },
            { name: "Ingosstrah", spec: "Kubernetes кластеры" }
          ].map((client, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-[#E1E5EB] rounded-xl text-center space-y-1 select-none hover:border-[#005FFC]/20 transition-all duration-200"
            >
              <div className="font-extrabold text-[#0B1F35] text-sm tracking-tight">{client.name}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{client.spec}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Accordion FAQ Section */}
      <section id="faq" className="py-16 border-t border-[#E1E5EB] bg-white">
        <div className="max-w-[800px] mx-auto px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-[#0B1F35]">Вопросы и ответы</h2>
            <p className="text-xs text-slate-400 font-semibold">Ответы на ключевые вопросы B2B-клиентов перед миграцией в облако.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Какое SLA предоставляется на виртуальные серверы?",
                a: "Мы предоставляем юридический SLA 99.95% с компенсациями в случае простоя инфраструктуры. Метрики фиксируются внешними независимыми мониторингами.",
              },
              {
                q: "Подходят ли серверы под требования 152-ФЗ?",
                a: "Да, наши дата-центры и физические серверы сертифицированы на соответствие 152-ФЗ по наивысшим уровням защищенности УЗ-1, УЗ-2 и УЗ-3. Мы предоставляем все необходимые акты и шаблоны документов для ваших регуляторов.",
              },
              {
                q: "Как списываются средства?",
                a: "Мы используем модель Pay-as-you-go. Списание средств происходит каждый час на основе активных ресурсов (процессор, оперативная память, размер дисков, IP-адреса). Вы платите только за то, что реально работает.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#F8F9FA] border border-[#E1E5EB] rounded-xl overflow-hidden shadow-xs transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm text-[#0B1F35] hover:bg-slate-100/50 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${faqOpen[idx] ? "rotate-90" : ""}`} />
                </button>
                
                {faqOpen[idx] && (
                  <div className="px-6 pb-5 pt-1 border-t border-slate-200/60 text-xs leading-relaxed text-slate-500 font-medium">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ПОЛНЫЙ КОРПОРАТИВНЫЙ ФУТЕР В СТИЛЕ VK TECH */}
      <footer className="bg-[#0B1F35] text-slate-300 border-t border-slate-800 py-16">
        <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-4 gap-8">
          
          <div className="space-y-4 col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#005FFC] flex items-center justify-center text-white font-extrabold text-sm">
                vk
              </div>
              <span className="font-extrabold text-white text-base tracking-wider uppercase">VK Cloud</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-semibold">
              Профессиональная облачная инфраструктура от лидера рынка РФ. Безопасность ИТ-нагрузок, высокая масштабируемость и юридические финансовые гарантии.
            </p>
            <div className="text-[10px] text-slate-500 space-y-1 font-bold">
              <div>ООО «ВК Облачные Решения»</div>
              <div>ИНН: 9714002672 • ОГРН: 1197746400329</div>
              <div>125167, г. Москва, Ленинградский проспект, д. 39, стр. 79, VK Tech</div>
            </div>
          </div>

          <div>
            <span className="font-extrabold text-white text-[10px] tracking-wider uppercase block mb-4">Калькулятор</span>
            <ul className="text-xs space-y-3 font-semibold text-slate-400">
              <li><a href="#configurator" className="hover:text-[#005FFC] transition-colors">Облачные серверы (VM)</a></li>
              <li><a href="#configurator" className="hover:text-[#005FFC] transition-colors">Хранилище S3</a></li>
              <li><a href="#configurator" className="hover:text-[#005FFC] transition-colors">Managed Базы Данных</a></li>
              <li><a href="#free-services" className="hover:text-[#005FFC] transition-colors">Бесплатный VPN и трафик</a></li>
            </ul>
          </div>

          <div>
            <span className="font-extrabold text-white text-[10px] tracking-wider uppercase block mb-4">Демо-зона</span>
            <ul className="text-xs space-y-3 font-semibold text-slate-400">
              <li>
                <button onClick={onConsole} className="hover:text-[#005FFC] transition-colors flex items-center gap-1">
                  <span>Консоль AgentFlow</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
              <li><a href="/components" className="hover:text-[#005FFC] transition-colors">Спецификация (Playground)</a></li>
              <li><a href="https://cloud.vk.com/docs" className="hover:text-[#005FFC] transition-colors">Официальная документация</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-[1200px] mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold">
          <span>© 2026 VK Cloud. Все права защищены. Разработано строго по референсу в соответствии с AGENTS.md.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#005FFC] transition-colors">Условия использования</a>
            <a href="#" className="hover:text-[#005FFC] transition-colors">Политика конфиденциальности</a>
          </div>
        </div>
      </footer>

      {/* 10. B2B LEAD DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => { if (!isSubmitting) setIsModalOpen(false); }}
            className="absolute inset-0 bg-[#071f3d]/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl border border-[#E1E5EB] overflow-hidden z-10 transition-all duration-300 animate-fade-in p-6">
            
            {!isSubmitting && (
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 outline-none"
                aria-label="Закрыть модальное окно"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {!isSuccess ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#0B1F35]">Оставить B2B-заявку на расчет</h3>
                  <p className="text-xs text-slate-500">Заполните форму, чтобы получить детальный B2B-расчет миграции в облако.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="modal-name" className="block text-[11px] font-bold text-slate-600 mb-1">Ваше имя *</label>
                    <input
                      id="modal-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван Иванов"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.name ? "border-red-400 focus:border-red-400" : "border-[#E1E5EB] focus:border-[#005FFC]"}`}
                      disabled={isSubmitting}
                    />
                    {errors.name && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.name}</span>}
                  </div>

                  <div>
                    <label htmlFor="modal-email" className="block text-[11px] font-bold text-slate-600 mb-1">Рабочий Email *</label>
                    <input
                      id="modal-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ivan@company.ru"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.email ? "border-red-400 focus:border-red-400" : "border-[#E1E5EB] focus:border-[#005FFC]"}`}
                      disabled={isSubmitting}
                    />
                    {errors.email && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.email}</span>}
                  </div>

                  <div>
                    <label htmlFor="modal-company" className="block text-[11px] font-bold text-slate-600 mb-1">Название компании *</label>
                    <input
                      id="modal-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="ООО Ромашка"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.company ? "border-red-400 focus:border-red-400" : "border-[#E1E5EB] focus:border-[#005FFC]"}`}
                      disabled={isSubmitting}
                    />
                    {errors.company && <span className="text-[10px] text-red-500 font-semibold mt-1 block">{errors.company}</span>}
                  </div>

                  <div>
                    <label htmlFor="modal-message" className="block text-[11px] font-bold text-slate-600 mb-1">Конфигурация ресурсов</label>
                    <textarea
                      id="modal-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Детали расчетного листа..."
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E1E5EB] focus:border-[#005FFC] rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 mt-4 text-xs font-bold text-white bg-[#005FFC] hover:bg-[#005FFC]/95 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Отправить заявку</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#0B1F35]">Заявка успешно принята!</h3>
                  <p className="text-xs leading-relaxed text-slate-500 font-medium max-w-sm mx-auto">
                    Спасибо! Данные вашей конфигурации зафиксированы. Наш облачный B2B-архитектор свяжется с вами по почте <strong className="text-slate-700">{email}</strong> в течение 15 минут для подготовки индивидуального коммерческого предложения.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-xs font-bold text-[#0B1F35] bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
                >
                  Закрыть окно
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// === ORIGINAL CONSOLE VIEW (AGENTFLOW CONSOLE) ===
function ConsoleView({ onBack }: { onBack: () => void }) {
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
                          {selectedStage === "04-design" && "Дизайн-концепцияBespoe UI готова. Выявлены HEX-цвета референса, шрифты и адаптивная сетка. Готово к утверждению."}
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
