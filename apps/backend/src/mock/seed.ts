import type { BehaviorEvent, Session, User } from "../types/domain";

type SeedData = {
  users: User[];
  sessions: Session[];
  events: BehaviorEvent[];
};

const DAY = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number, minutes = 0): string {
  return new Date(Date.now() - days * DAY - minutes * 60_000).toISOString();
}

export function buildSeedData(): SeedData {
  const configs = [
    { n: 1, role: "Comercial", interest: "Leilões", days: 0, count: 7 },
    { n: 2, role: "Comprador", interest: "NCM", days: 1, count: 4 },
    { n: 3, role: "Administrativo", interest: "Certidões", days: 2, count: 4 },
    { n: 4, role: "Gestor", interest: "Treinamentos", days: 0, count: 5 },
    { n: 5, role: "Comercial", interest: "Licitações", days: 3, count: 5 },
    { n: 6, role: "Financeiro", interest: "Financeiro", days: 5, count: 3 },
    { n: 7, role: "Operador de licitação", interest: "Leilões", days: 1, count: 6 },
    { n: 8, role: "Comprador", interest: "Compras", days: 12, count: 8 }
  ] as const;

  const users: User[] = [];
  const sessions: Session[] = [];
  const events: BehaviorEvent[] = [];

  for (const cfg of configs) {
    const supplierId = `sup_demo_${cfg.n}`;
    const userId = `usr_demo_${cfg.n}`;
    const sessionId = `sess_demo_${cfg.n}`;

    users.push({
      userId,
      supplierId,
      cnpjMasked: `${10 + cfg.n}.***.***/0001-**`,
      role: cfg.role,
      createdAt: isoDaysAgo(20)
    });

    const startedAt = isoDaysAgo(cfg.days, 25);
    const endedAt = isoDaysAgo(cfg.days, 5);

    sessions.push({
      sessionId,
      userId,
      supplierId,
      startedAt,
      endedAt,
      durationMs: 20 * 60_000
    });

    const common = {
      sessionId,
      userId,
      supplierId,
      metadata: { interest: cfg.interest }
    };

    events.push(
      {
        eventId: `evt_demo_${cfg.n}_start`,
        ...common,
        eventName: "session_start",
        page: "training",
        section: "treinamentos",
        itemId: null,
        keyword: null,
        timestamp: startedAt,
        durationMs: null
      },
      {
        eventId: `evt_demo_${cfg.n}_page`,
        ...common,
        eventName: "page_view",
        page: "training",
        section: "treinamentos",
        itemId: cfg.interest,
        keyword: null,
        timestamp: isoDaysAgo(cfg.days, 22),
        durationMs: null
      }
    );

    for (let i = 0; i < cfg.count; i++) {
      let eventName: BehaviorEvent["eventName"] = "content_click";
      let itemId: string = cfg.interest;

      if (cfg.interest === "Leilões") {
        eventName = i % 2 === 0 ? "video_start" : "guide_open";
        itemId = i % 2 === 0 ? "video-leilao" : "guia-leilao";
      } else if (cfg.interest === "NCM") {
        eventName = "ncm_query";
        itemId = "consulta-ncm";
      } else if (cfg.interest === "Certidões") {
        eventName = "certificate_click";
        itemId = "certidoes";
      } else if (cfg.interest === "Treinamentos") {
        eventName = i % 2 === 0 ? "video_start" : "guide_open";
        itemId = "treinamento-fornecedor";
      } else if (cfg.interest === "Financeiro") {
        eventName = "calculator_use";
        itemId = "calculadora-preco-liquido";
      } else {
        eventName = "guide_open";
        itemId = cfg.interest.toLowerCase();
      }

      events.push({
        eventId: `evt_demo_${cfg.n}_${i}`,
        ...common,
        eventName,
        page: cfg.interest === "Financeiro" || cfg.interest === "NCM" || cfg.interest === "Certidões" ? "tools" : "training",
        section: cfg.interest,
        itemId,
        keyword: cfg.interest === "NCM" ? "NCM" : null,
        timestamp: isoDaysAgo(cfg.days, 20 - i),
        durationMs: i % 2 === 0 ? 60_000 : null
      });
    }

    events.push({
      eventId: `evt_demo_${cfg.n}_end`,
      ...common,
      eventName: "session_end",
      page: null,
      section: null,
      itemId: null,
      keyword: null,
      timestamp: endedAt,
      durationMs: 20 * 60_000
    });
  }

  // Fornecedor 1: alta intenção em leilão sem simulado -> recomendação de convite.
  // Fornecedor 7: já clicou no simulado -> tratamento diferente.
  events.push({
    eventId: "evt_demo_7_simulator",
    sessionId: "sess_demo_7",
    userId: "usr_demo_7",
    supplierId: "sup_demo_7",
    eventName: "auction_simulator_click",
    page: "training",
    section: "Leilões",
    itemId: "simulado-leilao-reverso",
    keyword: null,
    timestamp: isoDaysAgo(1, 2),
    durationMs: null,
    metadata: { interest: "Leilões" }
  });

  return { users, sessions, events };
}
