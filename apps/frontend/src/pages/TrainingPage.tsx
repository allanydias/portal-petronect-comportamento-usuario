import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "@/components/common/SearchBox";
import { TrainingCard } from "@/components/training/TrainingCard";
import { VideoTutorialCard } from "@/components/training/VideoTutorialCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTracking } from "@/hooks/useTracking";

const quickGuides = [
  ["Acesso ao Portal", "Primeiro acesso, senha e navegação.", "Acesso", "Acesso"],
  ["Minha Conta", "Atualize dados do usuário e preferências.", "Conta", "Conta"],
  ["Cadastro Petrobras", "Orientações cadastrais e documentos.", "Cadastro", "Licitações"],
  ["Compras e Contratações", "Entenda os processos de compras.", "Compras", "Compras"],
  ["Licitações", "Etapas e participação em licitações.", "Licitações", "Licitações"],
  ["Envio de Proposta", "Como preparar e enviar propostas.", "Propostas", "Propostas"],
  ["Leilão", "Como funcionam os leilões no portal.", "Leilões", "Leilões"],
  ["Sala de Colaboração", "Comunicação e documentos compartilhados.", "Colaboração", "Colaboração"]
] as const;

const videos = [
  ["Como participar de um leilão", "Fluxo de participação e lances.", "Leilões · 6 min", "Leilões"],
  ["Envio de proposta", "Tutorial completo de envio.", "Propostas · 8 min", "Propostas"],
  ["Cadastro e documentos", "Mantenha sua empresa regularizada.", "Cadastro · 5 min", "Certidões"]
] as const;

export function TrainingPage() {
  const { t } = useTranslation();
  const { track } = useTracking("training");
  const navigate = useNavigate();

  const search = async (keyword: string) => {
    const normalized = keyword.toLowerCase();
    const interest = normalized.includes("leil")
      ? "Leilões"
      : normalized.includes("ncm")
        ? "NCM"
        : normalized.includes("cert")
          ? "Certidões"
          : normalized.includes("proposta")
            ? "Propostas"
            : normalized.includes("licita")
              ? "Licitações"
              : "Outros";

    await track({
      eventName: "search_keyword",
      section: "busca",
      itemId: "busca-treinamentos",
      keyword,
      interest
    });
  };

  const handleLiveSignup = async () => {
    await track({
      eventName: "live_signup_click",
      section: "treinamentos-ao-vivo",
      itemId: "treinamento-fornecedores",
      interest: "Treinamentos"
    });
    navigate("/tools");
  };

  const handleAuctionSimulator = async () => {
    await track({
      eventName: "auction_simulator_click",
      section: "Leilões",
      itemId: "simulado-leilao-reverso",
      interest: "Leilões"
    });
    navigate("/tools");
  };

  return (
    <main className="page-shell space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{t("training.title")}</h1>
        <p className="mt-2 text-slate-500">{t("training.description")}</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <SearchBox onSearch={search} />
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-xl font-bold">Guias rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickGuides.map(([title, description, category, interest]) => (
            <TrainingCard
              key={title}
              title={title}
              description={description}
              category={category}
              buttonLabel="Abrir guia"
              eventName="guide_open"
              interest={interest}
              itemId={title.toLowerCase().replaceAll(" ", "-")}
              onTrack={track}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Tutoriais em vídeo</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {videos.map(([title, description, meta, interest]) => (
            <VideoTutorialCard
              key={title}
              title={title}
              description={description}
              category={meta.split(" · ")[0]}
              durationLabel={meta.split(" · ")[1]}
              interest={interest}
              itemId={title.toLowerCase().replaceAll(" ", "-")}
              onTrack={track}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Treinamento ao vivo — Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              22/09/2026 · 14:00 · Sessão demonstrativa sobre participação em processos.
            </p>
            <Button className="mt-4" onClick={handleLiveSignup}>
              Inscrever-se
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulado de Leilão Reverso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Demonstre intenção real antes de um processo de compra.
            </p>
            <Button className="mt-4" onClick={handleAuctionSimulator}>
              Participar do simulado
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}