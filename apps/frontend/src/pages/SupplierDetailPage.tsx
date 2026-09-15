import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { FrequencyBadge } from "@/components/dashboard/FrequencyBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Detail = Awaited<ReturnType<typeof api.getSupplier>>;

export function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    if (!supplierId) return;
    api.getSupplier(supplierId).then(setData).catch(console.error);
  }, [supplierId]);

  if (!data) {
    return (
      <main className="page-shell">
        <Skeleton className="h-64" />
      </main>
    );
  }

  const { profile, recentJourney } = data;

  return (
    <main className="page-shell space-y-6">
      <Button variant="ghost" className="-ml-3" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao dashboard
      </Button>

      <div>
        <h1 className="text-3xl font-black tracking-tight">{profile.cnpjMasked}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{profile.role}</span>
          <FrequencyBadge value={profile.frequency} />
          <span>{profile.totalSessions} sessões</span>
          <span>{profile.totalEvents} eventos</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-slate-500">Última visita:</span> {formatDateTime(profile.lastAccess)}</div>
            <div><span className="text-slate-500">Sessões 7 dias:</span> {profile.sessionsLast7Days}</div>
            <div><span className="text-slate-500">Sessões 30 dias:</span> {profile.sessionsLast30Days}</div>
            <div><span className="text-slate-500">Tempo total:</span> {formatDuration(profile.totalDurationMs)}</div>
            <div><span className="text-slate-500">Ferramenta mais acessada:</span> {profile.mostAccessedTool ?? "—"}</div>
            <div><span className="text-slate-500">Treinamento mais acessado:</span> {profile.mostAccessedTraining ?? "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Interesse</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {profile.interestRanking.slice(0, 5).map((item) => (
              <div key={item.topic}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.topic}</span>
                  <strong>{item.percentage}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(5, item.percentage)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recomendação</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed">
              {profile.recommendedAction}
            </div>

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold">Palavras pesquisadas</div>
              <div className="flex flex-wrap gap-2">
                {profile.searchedKeywords.length ? (
                  profile.searchedKeywords.map((keyword) => (
                    <Badge key={keyword}>{keyword}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">Nenhuma pesquisa registrada.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Jornada recente</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {recentJourney.slice(0, 20).map((event) => (
            <div key={event.eventId} className="flex gap-4 border-l-2 border-blue-200 pl-4 text-sm">
              <div className="w-28 shrink-0 text-slate-500">{formatDateTime(event.timestamp)}</div>
              <div>
                <div className="font-semibold">{event.eventName}</div>
                <div className="text-slate-500">
                  {[event.page, event.section, event.itemId].filter(Boolean).join(" · ") || "Portal"}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
