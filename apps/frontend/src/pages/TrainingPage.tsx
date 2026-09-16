import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
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

type ModalType = "live" | "simulator" | null;

export function TrainingPage() {
  const { t } = useTranslation();
  const { track } = useTracking("training");
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const filterItems = (keyword: string) => {
    const normalized = keyword.toLowerCase();
    return {
      guides: quickGuides.filter(([title, description]) => 
        title.toLowerCase().includes(normalized) || 
        description.toLowerCase().includes(normalized)
      ),
      videos: videos.filter(([title, description]) =>
        title.toLowerCase().includes(normalized) ||
        description.toLowerCase().includes(normalized)
      )
    };
  };

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    
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
    setModalOpen("live");
    await track({
      eventName: "live_signup_click",
      section: "treinamentos-ao-vivo",
      itemId: "treinamento-fornecedores",
      interest: "Treinamentos"
    });
  };

  const handleAuctionSimulator = async () => {
    setModalOpen("simulator");
    await track({
      eventName: "auction_simulator_click",
      section: "Leilões",
      itemId: "simulado-leilao-reverso",
      interest: "Leilões"
    });
  };

  const { guides, videos: filteredVideos } = filterItems(searchKeyword);

  const liveModal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Treinamento ao vivo — Fornecedores</h2>
          <button
            onClick={() => setModalOpen(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Sessão demonstrativa sobre participação em processos.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            <strong>Data:</strong> 22/09/2026
          </p>
          <p className="text-sm text-slate-700">
            <strong>Horário:</strong> 14:00
          </p>
          <p className="text-sm text-slate-700">
            <strong>Duração:</strong> ~2 horas
          </p>
        </div>
        <Button className="mt-6 w-full" onClick={() => setModalOpen(null)}>
          Fechar
        </Button>
      </div>
    </div>
  );

  const simulatorModal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Simulado de Leilão Reverso</h2>
          <button
            onClick={() => setModalOpen(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Demonstre intenção real antes de um processo de compra.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Participar do simulado permite que você:
          </p>
          <ul className="ml-4 list-disc space-y-2 text-sm text-slate-600">
            <li>Entenda o fluxo de leilões</li>
            <li>Pratique com um ambiente seguro</li>
            <li>Conheça as regras e funcionamento</li>
          </ul>
        </div>
        <Button className="mt-6 w-full" onClick={() => setModalOpen(null)}>
          Fechar
        </Button>
      </div>
    </div>
  );

  return (
    <main className="page-shell space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{t("training.title")}</h1>
        <p className="mt-2 text-slate-500">{t("training.description")}</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <SearchBox onSearch={handleSearch} />
        </CardContent>
      </Card>

      {searchKeyword && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            Resultados para: <strong>"{searchKeyword}"</strong>
          </span>
          <button
            onClick={() => setSearchKeyword("")}
            className="text-xs text-blue-600 hover:underline"
          >
            Limpar busca
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">Guias rápidos</h2>
        {guides.length === 0 && searchKeyword ? (
          <p className="text-slate-500">Nenhum guia encontrado para "{searchKeyword}"</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map(([title, description, category, interest]) => (
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
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Tutoriais em vídeo</h2>
        {filteredVideos.length === 0 && searchKeyword ? (
          <p className="text-slate-500">Nenhum vídeo encontrado para "{searchKeyword}"</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {filteredVideos.map(([title, description, meta, interest]) => (
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
        )}
      </section>

      {!searchKeyword && (
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
      )}

      {modalOpen === "live" && liveModal}
      {modalOpen === "simulator" && simulatorModal}
    </main>
  );
}