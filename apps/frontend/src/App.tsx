import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { TrainingPage } from "@/pages/TrainingPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SupplierDetailPage } from "@/pages/SupplierDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/supplier/:supplierId" element={<SupplierDetailPage />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
