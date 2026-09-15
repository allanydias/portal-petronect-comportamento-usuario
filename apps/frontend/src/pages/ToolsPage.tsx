import { useTranslation } from "react-i18next";
import { SearchBox } from "@/components/common/SearchBox";
import { ToolCard } from "@/components/tools/ToolCard";
import { Card, CardContent } from "@/components/ui/card";
import { useTracking } from "@/hooks/useTracking";
import type { EventName } from "@/schemas/event";

const tools: Array<{
  title: string;
  description: string;
  category: string;
  eventName: EventName;
  interest: string;
}> = [
  {
    title: "Mapas",
    description: "Consulta de informações geográficas.",
    category: "Consulta",
    eventName: "tool_open",
    interest: "Mapas"
  },
  {
    title: "Calculadora de preço líquido",
    description: "Simule valores e composição de preços.",
    category: "Financeiro",
    eventName: "calculator_use",
    interest: "Financeiro"
  },
  {
    title: "Consulta NCM",
    description: "Pesquise classificações fiscais.",
    category: "Fiscal",
    eventName: "ncm_query",
    interest: "NCM"
  },
  {
    title: "Certidões",
    description: "Acesse documentos e regularização.",
    category: "Regularização",
    eventName: "certificate_click",
    interest: "Certidões"
  },
  {
    title: "Macro de carga de cotação",
    description: "Apoio ao envio estruturado de cotações.",
    category: "Cotação",
    eventName: "tool_open",
    interest: "Cotação"
  },
  {
    title: "Macro de carga de catálogo",
    description: "Atualize catálogos com maior agilidade.",
    category: "Catálogo",
    eventName: "tool_open",
    interest: "Catálogo"
  }
];

export function ToolsPage() {
  const { t } = useTranslation();
  const { track } = useTracking("tools");

  return (
    <main className="page-shell space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{t("tools.title")}</h1>
        <p className="mt-2 text-slate-500">{t("tools.description")}</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <SearchBox
            onSearch={async (keyword) => {
              const normalized = keyword.toLowerCase();
              const interest = normalized.includes("ncm")
                ? "NCM"
                : normalized.includes("cert")
                  ? "Certidões"
                  : normalized.includes("preço") || normalized.includes("preco")
                    ? "Financeiro"
                    : "Outros";

              await track({
                eventName: "search_keyword",
                section: "busca",
                itemId: "busca-ferramentas",
                keyword,
                interest
              });
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={tool.title}
            {...tool}
            itemId={tool.title.toLowerCase().replaceAll(" ", "-")}
            onTrack={track}
          />
        ))}
      </div>
    </main>
  );
}
