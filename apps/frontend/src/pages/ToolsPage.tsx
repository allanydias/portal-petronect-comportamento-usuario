import { useState } from "react";
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
  const [searchKeyword, setSearchKeyword] = useState("");

  const filterTools = (keyword: string) => {
    const normalized = keyword.toLowerCase();
    return tools.filter((tool) =>
      tool.title.toLowerCase().includes(normalized) ||
      tool.description.toLowerCase().includes(normalized) ||
      tool.category.toLowerCase().includes(normalized)
    );
  };

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);

    if (!keyword.trim()) return;

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
  };

  const filteredTools = filterTools(searchKeyword);

  return (
    <main className="page-shell space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{t("tools.title")}</h1>
        <p className="mt-2 text-slate-500">{t("tools.description")}</p>
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

      {filteredTools.length === 0 && searchKeyword ? (
        <p className="text-slate-500">Nenhuma ferramenta encontrada para "{searchKeyword}"</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.title}
              {...tool}
              itemId={tool.title.toLowerCase().replaceAll(" ", "-")}
              onTrack={track}
            />
          ))}
        </div>
      )}
    </main>
  );
}