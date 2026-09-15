import type { BehaviorEvent, Session } from "../types/domain";

export function recommendationFor(
  events: BehaviorEvent[],
  sessions: Session[],
  lastAccess: string | null
): string {
  const count = (name: BehaviorEvent["eventName"]) =>
    events.filter((event) => event.eventName === name).length;

  const auctionInterest = events.filter((event) => {
    const text = `${event.section ?? ""} ${event.itemId ?? ""} ${event.keyword ?? ""}`.toLowerCase();
    return text.includes("leil");
  }).length;

  if (auctionInterest >= 3 && count("auction_simulator_click") === 0) {
    return "Convidar para simulado de leilão.";
  }

  const trainingViews = events.filter((event) =>
    ["guide_open", "video_start", "video_complete", "content_click"].includes(event.eventName)
  ).length;

  if (trainingViews >= 3 && count("live_signup_click") === 0) {
    return "Convidar para treinamento ao vivo.";
  }

  if (count("ncm_query") >= 3) {
    return "Oferecer acesso rápido ao guia de NCM.";
  }

  if (count("certificate_click") >= 3) {
    return "Exibir checklist de regularização e certidões.";
  }

  if (lastAccess) {
    const daysSinceLastAccess = (Date.now() - new Date(lastAccess).getTime()) / 86_400_000;
    const historicalFrequencyHigh = sessions.length >= 4;
    if (daysSinceLastAccess > 7 && historicalFrequencyHigh) {
      return "Executar campanha de reengajamento.";
    }
  }

  return "Continuar monitorando e personalizar conteúdos conforme novos sinais.";
}
