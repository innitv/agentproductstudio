// Placeholder for Zod schemas that mirror files in ../../schemas.
// Keep schema names aligned with artifact names and agent output contracts.

export type AgentStatus = "success" | "partial" | "blocked";

export interface AgentOutput<TArtifactName extends string, TArtifact> {
  agent_name: string;
  status: AgentStatus;
  summary: string;
  inputs_used: string[];
  outputs: Record<TArtifactName, TArtifact>;
  assumptions: string[];
  risks: string[];
  open_questions: string[];
  recommended_next_step: string;
}

export interface LandingWorkflowInput {
  goal: string;
  // Слаг каталога прогона, названный человеком. Нужен там, где из цели он не выводится:
  // на русской цели латиницы почти нет, и слаг вырождается в отдельные цифры.
  slug?: string;
  context?: string;
  constraints?: string[];
  sources?: string[];
  required_artifacts?: string[];
  research_mode?: string;
  source_policy?: unknown;
  notion_target?: string;
  profile?: "standard" | "reference";
  // Оси запуска, зафиксированные на `00-intake`. Скаффолд обязан их знать: без них
  // `run-plan.md` перечисляет все 13 стадий независимо от масштаба, а `stage-gate-ledger.md`
  // не содержит ни строк `skipped_by_scale`, ни таблицы секций вне маршрута.
  scale?: "full" | "increment" | "patch";
  // Какие оси названы явно на старте, а какие взяты умолчанием. Нужно, чтобы скаффолд
  // записал ответ там, где он есть, и пометил незаписанным там, где его не было: иначе
  // скаффолд закрывал бы гейт опроса сам за себя.
  axes_recorded?: {
    profile?: boolean;
    scale?: boolean;
  };
}

export interface HandoffBundle {
  goal: string;
  constraints: string[];
  visual_reference_required?: boolean;
  assumptions: string[];
  recursive_brief?: unknown;
  research_summary?: unknown;
  scenario_user_flows?: unknown;
  prd?: unknown;
  notion_prd_export?: unknown;
  ia_brief?: unknown;
  design_brief?: unknown;
  screens?: unknown;
  copy_deck?: unknown;
  frontend_result?: unknown;
  visual_reference_review?: unknown;
  qa_report?: unknown;
  release_notes?: unknown;
  risks: string[];
  open_questions: string[];
}
