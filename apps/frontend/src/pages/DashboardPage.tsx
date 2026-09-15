import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { formatDateTime, formatDuration } from "@/lib/utils";
import type { SupplierProfile } from "@/schemas/dashboard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FrequencyBadge } from "@/components/dashboard/FrequencyBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type DashboardData = Awaited<ReturnType<typeof api.getDashboard>>;

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getDashboard());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="page-shell space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" className="-ml-3 mb-2" onClick={() => navigate("/training")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao portal
          </Button>
          <h1 className="text-3xl font-black tracking-tight">{t("dashboard.title")}</h1>
          <p className="mt-2 text-slate-500">{t("dashboard.description")}</p>
        </div>

        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("dashboard.refresh")}
        </Button>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <MetricCard label={t("dashboard.suppliers")} value={data.metrics.suppliersMonitored} />
            <MetricCard label={t("dashboard.active")} value={data.metrics.activeUsers} />
            <MetricCard label={t("dashboard.sessions")} value={data.metrics.sessions} />
            <MetricCard label={t("dashboard.events")} value={data.metrics.eventsCaptured} />
            <MetricCard label={t("dashboard.avgTime")} value={formatDuration(data.metrics.avgSessionDurationMs)} />
            <MetricCard label={t("dashboard.reengagement")} value={data.metrics.reengagementOpportunities} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fornecedores</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Interesse principal</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead>Última ação</TableHead>
                    <TableHead>Recomendação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.suppliers.map((supplier: SupplierProfile) => (
                    <TableRow
                      key={supplier.supplierId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/dashboard/supplier/${supplier.supplierId}`)}
                    >
                      <TableCell className="font-semibold">{supplier.cnpjMasked}</TableCell>
                      <TableCell>{supplier.role}</TableCell>
                      <TableCell>{supplier.mainInterest}</TableCell>
                      <TableCell><FrequencyBadge value={supplier.frequency} /></TableCell>
                      <TableCell>{formatDateTime(supplier.lastAccess)}</TableCell>
                      <TableCell>{supplier.lastAction ?? "—"}</TableCell>
                      <TableCell className="max-w-xs">{supplier.recommendedAction}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            Não foi possível carregar o dashboard. Confirme que o backend está em execução.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
