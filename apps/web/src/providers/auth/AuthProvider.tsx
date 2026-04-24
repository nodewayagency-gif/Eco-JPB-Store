import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthSession, LoginRequest, Role, SessionScope } from "@premium/contracts";
import { authRepository } from "@/services/api/authRepository";

const CUSTOMER_SESSION_KEY = "premium_auth_customer_session";
const ADMIN_SESSION_KEY = "premium_auth_admin_session";

interface AuthContextValue {
  isLoading: boolean;
  customerSession: AuthSession | null;
  adminSession: AuthSession | null;
  loginCustomer: (payload: LoginRequest) => Promise<void>;
  loginAdmin: (payload: LoginRequest) => Promise<void>;
  logoutCustomer: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
  isCustomerAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  hasAdminRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const safeParseSession = (value: string | null): AuthSession | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    return null;
  }
};

const isExpired = (session: AuthSession) => {
  return new Date(session.expiresAt).getTime() <= Date.now();
};

const saveSession = (scope: SessionScope, session: AuthSession | null) => {
  const storageKey = scope === "CUSTOMER" ? CUSTOMER_SESSION_KEY : ADMIN_SESSION_KEY;

  if (!session) {
    localStorage.removeItem(storageKey);
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(session));
};

const refreshSessionIfNeeded = async (scope: SessionScope, session: AuthSession | null) => {
  if (!session) return null;
  if (!isExpired(session)) return session;

  try {
    const refreshed = await authRepository.refreshSession({
      refreshToken: session.tokens.refreshToken,
      scope
    });
    saveSession(scope, refreshed);
    return refreshed;
  } catch {
    saveSession(scope, null);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [customerSession, setCustomerSession] = useState<AuthSession | null>(null);
  const [adminSession, setAdminSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const restore = async () => {
      const customerStored = safeParseSession(localStorage.getItem(CUSTOMER_SESSION_KEY));
      const adminStored = safeParseSession(localStorage.getItem(ADMIN_SESSION_KEY));

      const [restoredCustomer, restoredAdmin] = await Promise.all([
        refreshSessionIfNeeded("CUSTOMER", customerStored),
        refreshSessionIfNeeded("ADMIN", adminStored)
      ]);

      setCustomerSession(restoredCustomer);
      setAdminSession(restoredAdmin);
      setIsLoading(false);
    };

    restore();
  }, []);

  const loginCustomer = async (payload: LoginRequest) => {
    const session = await authRepository.loginCustomer(payload);
    setCustomerSession(session);
    saveSession("CUSTOMER", session);
  };

  const loginAdmin = async (payload: LoginRequest) => {
    const session = await authRepository.loginAdmin(payload);
    setAdminSession(session);
    saveSession("ADMIN", session);
  };

  const logoutCustomer = async () => {
    if (customerSession) {
      await authRepository.logout(customerSession.tokenId, "CUSTOMER");
    }
    setCustomerSession(null);
    saveSession("CUSTOMER", null);
  };

  const logoutAdmin = async () => {
    if (adminSession) {
      await authRepository.logout(adminSession.tokenId, "ADMIN");
    }
    setAdminSession(null);
    saveSession("ADMIN", null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      customerSession,
      adminSession,
      loginCustomer,
      loginAdmin,
      logoutCustomer,
      logoutAdmin,
      isCustomerAuthenticated: Boolean(customerSession && !isExpired(customerSession)),
      isAdminAuthenticated: Boolean(adminSession && !isExpired(adminSession)),
      hasAdminRole: (roles) => Boolean(adminSession && roles.includes(adminSession.user.role))
    }),
    [isLoading, customerSession, adminSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

