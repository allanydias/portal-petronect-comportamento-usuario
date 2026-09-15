import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { api } from "@/lib/api";
import type { LoginFormValues } from "@/schemas/auth";
import type { SessionState } from "@/types/session";

type SessionContextValue = {
  session: SessionState | null;
  loading: boolean;
  login: (values: LoginFormValues) => Promise<SessionState>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const STORAGE_KEY = "petronect-demo-session";

function loadSavedSession(): SessionState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(() => loadSavedSession());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const user = await api.login(values);
      const apiSession = await api.startSession({
        userId: user.userId,
        supplierId: user.supplierId
      });

      const nextSession: SessionState = {
        userId: user.userId,
        supplierId: user.supplierId,
        sessionId: apiSession.sessionId,
        cnpjMasked: user.cnpjMasked,
        role: user.role
      };

      setSession(nextSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return nextSession;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const current = session;
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);

    if (current) {
      try {
        await api.endSession(current.sessionId);
      } catch (error) {
        console.error("Falha ao encerrar sessão:", error);
      }
    }
  }, [session]);

  const value = useMemo(
    () => ({ session, loading, login, logout }),
    [session, loading, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }
  return context;
}
