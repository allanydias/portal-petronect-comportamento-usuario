import type { BehaviorEvent, Session, SupplierProfile } from "../types/domain";
import type { Repository } from "../repositories/repository";
import { recommendationFor } from "./recommendationEngine";

const EVENT_SCORE: Partial<Record<BehaviorEvent["eventName"], number>> = {
  page_view: 1,
  content_click: 2,
  guide_open: 3,
  video_start: 4,
  video_complete: 6,
  live_signup_click: 8,
  auction_simulator_click: 10,
  ncm_query: 4,
  certificate_click: 4,
  calculator_use: 4,
  tool_open: 2,
  search_keyword: 2
};

function inferTopic(event: BehaviorEvent): string {
  const explicit = event.metadata?.interest;
  if (typeof explicit === "string" && explicit.trim()) return explicit;

  const text = [
    event.section,
    event.itemId,
    event.keyword,
    event.page
  ].filter(Boolean).join(" ").toLowerCase();

  if (text.includes("leil") || text.includes("pregão") || text.includes("pregao")) return "Leilões";
  if (text.includes("licita")) return "Licitações";
  if (text.includes("ncm")) return "NCM";
  if (text.includes("certid")) return "Certidões";
  if (text.includes("proposta")) return "Propostas";
  if (text.includes("treina") || text.includes("video") || text.includes("guia")) return "Treinamentos";
  if (text.includes("calcul") || text.includes("preço") || text.includes("preco")) return "Financeiro";
  if (text.includes("mapa")) return "Mapas";
  if (text.includes("catálogo") || text.includes("catalogo")) return "Catálogo";
  if (text.includes("cotação") || text.includes("cotacao")) return "Cotação";
  return "Outros";
}

function countBy<T>(items: T[], key: (item: T) => string | null | undefined): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const value = key(item);
    if (!value) continue;
    result[value] = (result[value] ?? 0) + 1;
  }
  return result;
}

function maxKey(counts: Record<string, number>): string | null {
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function frequency(
  sessions: Session[],
  sessionsLast7Days: number,
  sessionsLast30Days: number,
  lastAccess: string | null
): SupplierProfile["frequency"] {
  if (lastAccess) {
    const days = (Date.now() - new Date(lastAccess).getTime()) / 86_400_000;
    if (days > 7 && sessions.length >= 4) return "Inativo";
  }
  if (sessionsLast7Days >= 3 || sessionsLast30Days >= 8) return "Alta";
  if (sessionsLast30Days >= 3) return "Média";
  return "Baixa";
}

export async function buildSupplierProfile(
  repository: Repository,
  supplierId: string
): Promise<SupplierProfile | null> {
  const users = (await repository.listUsers()).filter((user) => user.supplierId === supplierId);
  if (!users.length) return null;

  const user = users[0];
  const sessions = await repository.listSessionsBySupplier(supplierId);
  const events = await repository.listEventsBySupplier(supplierId);

  const orderedSessions = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
  const orderedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const now = Date.now();
  const last7 = now - 7 * 86_400_000;
  const last30 = now - 30 * 86_400_000;

  const sessionsLast7Days = sessions.filter(
    (session) => new Date(session.startedAt).getTime() >= last7
  ).length;
  const sessionsLast30Days = sessions.filter(
    (session) => new Date(session.startedAt).getTime() >= last30
  ).length;

  const interestScores: Record<string, number> = {};
  for (const event of events) {
    const points = EVENT_SCORE[event.eventName] ?? 0;
    if (points <= 0) continue;
    const topic = inferTopic(event);
    interestScores[topic] = (interestScores[topic] ?? 0) + points;
  }

  const sortedInterest = Object.entries(interestScores).sort((a, b) => b[1] - a[1]);
  const totalInterest = sortedInterest.reduce((sum, [, score]) => sum + score, 0);

  const interestRanking = sortedInterest.map(([topic, score]) => ({
    topic,
    score,
    percentage: totalInterest > 0 ? Math.round((score / totalInterest) * 100) : 0
  }));

  const mainInterest = interestRanking[0]?.topic ?? "Sem dados";
  const interestScore = interestRanking[0]?.score ?? 0;

  const sectionAccess = countBy(events, (event) => event.section ?? null);
  const timeBySectionMs: Record<string, number> = {};
  for (const event of events) {
    if (!event.section || !event.durationMs) continue;
    timeBySectionMs[event.section] = (timeBySectionMs[event.section] ?? 0) + event.durationMs;
  }

  const toolEvents = events.filter((event) =>
    ["tool_open", "calculator_use", "ncm_query", "certificate_click"].includes(event.eventName)
  );
  const trainingEvents = events.filter((event) =>
    ["guide_open", "video_start", "video_complete", "auction_simulator_click"].includes(event.eventName)
  );

  const lastEvent = orderedEvents[0] ?? null;
  const lastSession = orderedSessions[0] ?? null;
  const lastAccess = lastEvent?.timestamp ?? lastSession?.startedAt ?? null;

  const profile: SupplierProfile = {
    supplierId,
    cnpjMasked: user.cnpjMasked,
    role: user.role,
    mainInterest,
    interestScore,
    interestRanking,
    frequency: frequency(sessions, sessionsLast7Days, sessionsLast30Days, lastAccess),
    sessionsLast7Days,
    sessionsLast30Days,
    totalSessions: sessions.length,
    totalEvents: events.length,
    totalDurationMs: sessions.reduce((sum, session) => sum + (session.durationMs ?? 0), 0),
    sectionAccess,
    timeBySectionMs,
    mostAccessedTool: maxKey(countBy(toolEvents, (event) => event.itemId ?? null)),
    mostAccessedTraining: maxKey(countBy(trainingEvents, (event) => event.itemId ?? null)),
    lastAccess,
    lastPage: lastEvent?.page ?? null,
    lastSection: lastEvent?.section ?? null,
    lastContent: lastEvent?.itemId ?? null,
    lastAction: lastEvent?.eventName ?? null,
    searchedKeywords: Array.from(
      new Set(
        orderedEvents
          .filter((event) => event.eventName === "search_keyword" && event.keyword)
          .map((event) => event.keyword as string)
      )
    ).slice(0, 20),
    recommendedAction: recommendationFor(events, sessions, lastAccess)
  };

  await repository.saveProfile(profile);
  return profile;
}

export async function listSupplierProfiles(repository: Repository): Promise<SupplierProfile[]> {
  const users = await repository.listUsers();
  const supplierIds = Array.from(new Set(users.map((user) => user.supplierId)));

  const profiles = await Promise.all(
    supplierIds.map((supplierId) => buildSupplierProfile(repository, supplierId))
  );

  return profiles
    .filter((profile): profile is SupplierProfile => Boolean(profile))
    .sort((a, b) => {
      const aTime = a.lastAccess ? new Date(a.lastAccess).getTime() : 0;
      const bTime = b.lastAccess ? new Date(b.lastAccess).getTime() : 0;
      return bTime - aTime;
    });
}

export async function dashboard(repository: Repository) {
  const [profiles, sessions, events] = await Promise.all([
    listSupplierProfiles(repository),
    repository.listSessions(),
    repository.listEvents()
  ]);

  const activeCutoff = Date.now() - 24 * 60 * 60 * 1000;
  const activeSupplierIds = new Set(
    events
      .filter((event) => new Date(event.timestamp).getTime() >= activeCutoff)
      .map((event) => event.supplierId)
  );

  const endedDurations = sessions
    .map((session) => session.durationMs ?? 0)
    .filter((duration) => duration > 0);

  const avgSessionDurationMs = endedDurations.length
    ? Math.round(endedDurations.reduce((sum, duration) => sum + duration, 0) / endedDurations.length)
    : 0;

  const opportunities = profiles.filter((profile) =>
    profile.recommendedAction !== "Continuar monitorando e personalizar conteúdos conforme novos sinais."
  ).length;

  return {
    metrics: {
      suppliersMonitored: profiles.length,
      activeUsers: activeSupplierIds.size,
      sessions: sessions.length,
      eventsCaptured: events.length,
      avgSessionDurationMs,
      reengagementOpportunities: opportunities
    },
    suppliers: profiles
  };
}
