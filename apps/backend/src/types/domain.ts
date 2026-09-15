export const ROLES = [
  "Comprador",
  "Comercial",
  "Administrativo",
  "Financeiro",
  "Operador de licitação",
  "Gestor"
] as const;

export type UserRole = (typeof ROLES)[number];

export const EVENT_NAMES = [
  "page_view",
  "section_view",
  "first_click",
  "content_click",
  "guide_open",
  "video_start",
  "video_complete",
  "live_signup_click",
  "auction_simulator_click",
  "tool_open",
  "calculator_use",
  "ncm_query",
  "certificate_click",
  "search_keyword",
  "session_start",
  "session_end",
  "heartbeat"
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export interface User {
  userId: string;
  supplierId: string;
  cnpjMasked: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  supplierId: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
}

export interface BehaviorEvent {
  eventId: string;
  sessionId: string;
  userId: string;
  supplierId: string;
  eventName: EventName;
  page?: string | null;
  section?: string | null;
  itemId?: string | null;
  keyword?: string | null;
  timestamp: string;
  durationMs?: number | null;
  metadata: Record<string, unknown>;
}

export interface SupplierProfile {
  supplierId: string;
  cnpjMasked: string;
  role: UserRole;
  mainInterest: string;
  interestScore: number;
  interestRanking: Array<{ topic: string; score: number; percentage: number }>;
  frequency: "Alta" | "Média" | "Baixa" | "Inativo";
  sessionsLast7Days: number;
  sessionsLast30Days: number;
  totalSessions: number;
  totalEvents: number;
  totalDurationMs: number;
  sectionAccess: Record<string, number>;
  timeBySectionMs: Record<string, number>;
  mostAccessedTool: string | null;
  mostAccessedTraining: string | null;
  lastAccess: string | null;
  lastPage: string | null;
  lastSection: string | null;
  lastContent: string | null;
  lastAction: string | null;
  searchedKeywords: string[];
  recommendedAction: string;
}
