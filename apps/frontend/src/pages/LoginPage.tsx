import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Server, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/contexts/SessionContext";
import { api, API_URL } from "@/lib/api";
import { loginFormSchema, roles, type LoginFormValues } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, login, loading } = useSession();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema as any),
    defaultValues: {
      cnpj: "12.345.678/0001-95",
      role: "Comprador",
    },
  });

  useEffect(() => {
    if (session) navigate("/training", { replace: true });
  }, [navigate, session]);

  useEffect(() => {
    api
      .health()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
    navigate("/training");
  };

  return (
    <main className="page-shell">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary font-black text-white">
          P
        </div>
        <div>
          <div className="font-bold">Petronect</div>
          <div className="text-xs text-slate-500">Behavior MVP</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <Card>
          <CardHeader>
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("login.eyebrow")}
            </div>
            <CardTitle className="text-3xl leading-tight">{t("login.title")}</CardTitle>
            <p className="text-sm text-slate-500">{t("login.description")}</p>
          </CardHeader>

          <CardContent>
            <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="grid gap-2 text-sm font-medium">
                {t("login.cnpj")}
                <Input {...register("cnpj")} />
                {errors.cnpj && (
                  <span className="text-xs text-red-600">{errors.cnpj.message}</span>
                )}
              </label>

              <label className="grid gap-2 text-sm font-medium">
                {t("login.role")}
                <Select
                  value={watch("role")}
                  onValueChange={(value) =>
                    setValue("role", value as LoginFormValues["role"], {
                      shouldValidate: true
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={String(role)}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <Button size="lg" disabled={loading || backendStatus === "offline"}>
                {loading ? t("login.loading") : t("login.submit")}
              </Button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    backendStatus === "online"
                      ? "bg-emerald-500"
                      : backendStatus === "offline"
                        ? "bg-red-500"
                        : "bg-slate-300"
                  }`}
                />
                {backendStatus === "online"
                  ? `Backend conectado em ${API_URL}`
                  : backendStatus === "offline"
                    ? "Backend offline. Inicie a API antes do frontend."
                    : "Verificando backend..."}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo demonstrado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              [Server, "Eventos enviados para a API", "Os cliques deixam de existir apenas no navegador."],
              [ShieldCheck, "Identificação pseudonimizada", "O frontend usa supplierId e CNPJ mascarado após o login."],
              [CheckCircle2, "Dashboard atualizado", "Interesse, frequência e recomendação vêm do backend."]
            ].map(([Icon, title, description]) => {
              const IconComponent = Icon as typeof Server;
              return (
                <div key={String(title)} className="flex gap-3 rounded-lg border p-4">
                  <IconComponent className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{String(title)}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {String(description)}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}