import type { AuthSession, LoginRequest, RefreshSessionRequest, Role, SessionScope } from "@premium/contracts";
import { mockAuthUsers, type MockAuthUser } from "@/mocks/auth";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

const allowedAdminRoles: Role[] = ["ADMIN", "OPERATOR"];

const randomToken = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const buildSession = (user: MockAuthUser, scope: SessionScope): AuthSession => ({
  tokenId: randomToken("tid"),
  scope,
  user,
  tokens: {
    accessToken: randomToken(`access_${scope}_${user.id}`),
    refreshToken: `refresh_${scope}_${user.id}_${Math.random().toString(36).slice(2)}`
  },
  expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString()
});

const validateCredentials = (user: MockAuthUser, password: string) => {
  return user.plainPassword === password;
};

const findUserByEmail = (email: string) => {
  return mockAuthUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

const parseUserIdFromRefreshToken = (refreshToken: string) => {
  const parts = refreshToken.split("_");
  return parts.length >= 4 ? parts[2] : null;
};

export interface AuthRepository {
  loginCustomer: (payload: LoginRequest) => Promise<AuthSession>;
  loginAdmin: (payload: LoginRequest) => Promise<AuthSession>;
  refreshSession: (payload: RefreshSessionRequest) => Promise<AuthSession>;
  logout: (tokenId: string, scope: SessionScope) => Promise<void>;
}

export const demoCredentials = {
  customer: { email: "cliente@jpb.com", password: "Cliente@123" },
  admin: { email: "admin@jpb.com", password: "Admin@123" },
  operator: { email: "operador@jpb.com", password: "Operador@123" }
};

export const authRepository: AuthRepository = {
  async loginCustomer(payload) {
    const user = findUserByEmail(payload.email);
    if (!user || user.role !== "CUSTOMER" || !validateCredentials(user, payload.password)) {
      throw new Error("Credenciais de cliente inválidas.");
    }

    return buildSession(user, "CUSTOMER");
  },

  async loginAdmin(payload) {
    const user = findUserByEmail(payload.email);
    if (
      !user ||
      !allowedAdminRoles.includes(user.role) ||
      !validateCredentials(user, payload.password)
    ) {
      throw new Error("Credenciais administrativas inválidas.");
    }

    return buildSession(user, "ADMIN");
  },

  async refreshSession(payload) {
    const userId = parseUserIdFromRefreshToken(payload.refreshToken);
    const user = mockAuthUsers.find((candidate) => candidate.id === userId);

    if (!user) {
      throw new Error("Sessão inválida para refresh.");
    }

    if (payload.scope === "ADMIN" && !allowedAdminRoles.includes(user.role)) {
      throw new Error("Sessão administrativa inválida.");
    }

    if (payload.scope === "CUSTOMER" && user.role !== "CUSTOMER") {
      throw new Error("Sessão de cliente inválida.");
    }

    return buildSession(user, payload.scope);
  },

  async logout() {
    return;
  }
};
