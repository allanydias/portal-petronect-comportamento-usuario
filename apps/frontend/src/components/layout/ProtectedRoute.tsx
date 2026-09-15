import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";

export function ProtectedRoute() {
  const { session } = useSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
