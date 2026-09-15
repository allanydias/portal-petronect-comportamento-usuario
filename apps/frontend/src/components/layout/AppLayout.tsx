import { Outlet, useNavigate } from "react-router-dom";
import { Languages, LayoutDashboard, LogOut, Wrench, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import i18n from "@/i18n";

export function AppLayout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, logout } = useSession();

  const toggleLanguage = async () => {
    const next = i18n.language === "pt-BR" ? "en-US" : "pt-BR";
    await i18n.changeLanguage(next);
    localStorage.setItem("petronect-language", next);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => navigate("/training")}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-black text-white">
              P
            </div>
            <div>
              <div className="font-bold">Petronect</div>
              <div className="text-xs text-slate-500">{t("brand.subtitle")}</div>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/training")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              {t("nav.training")}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/tools")}>
              <Wrench className="mr-2 h-4 w-4" />
              {t("nav.tools")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {t("nav.dashboard")}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Idioma">
              <Languages className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>

        {session && (
          <div className="border-t bg-slate-50">
            <div className="mx-auto flex max-w-7xl flex-wrap gap-x-5 gap-y-1 px-4 py-2 text-xs text-slate-500 md:px-6">
              <span>{session.cnpjMasked}</span>
              <span>{session.role}</span>
              <span className="font-mono">supplier: {session.supplierId.slice(0, 16)}…</span>
            </div>
          </div>
        )}
      </header>

      <Outlet />
    </div>
  );
}
