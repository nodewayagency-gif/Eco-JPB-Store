import type { AuthSession, LoginRequest, RefreshSessionRequest, Role, SessionScope } from "@premium/contracts";
import { mockAuthUsers, type MockAuthUser } from "@/mocks/auth";

const SESSION_DURATION_CUSTOMER_MS = 1000 * 60 * 60 * 24; // 24 hours
const SESSION_DURATION_ADMIN_MS = 1000 * 60 * 60 * 8; // 8 hours

const allowedAdminRoles: Role[] = ["ADMIN", "OPERATOR"];

const randomToken = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const buildSession = (user: MockAuthUser, scope: SessionScope, duration: number): AuthSession => ({
  tokenId: randomToken("tid"),
  scope,
  user,
  tokens: {
    accessToken: randomToken(`access_${scope}_${user.id}`),
    refreshToken: `refresh_${scope}_${user.id}_${Math.random().toString(36).slice(2)}`
  },
  expiresAt: new Date(Date.now() + duration).toISOString()
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
  registerCustomer: (payload: any) => Promise<AuthSession>;
}

export const demoCredentials = {
  customer: { email: "cliente@jpb.com", password: "Cliente@123" },
  admin: { email: "admin@jpb.com", password: "Admin@123" },
  operator: { email: "operador@jpb.com", password: "Operador@123" }
};

import { api } from "../api";

export const authRepository: AuthRepository = {
  async loginCustomer(payload) {
    try {
      const { data } = await api.post("/auth/login", {
        email: payload.email,
        password: payload.password
      });

      return {
        tokenId: data.token,
        scope: "CUSTOMER",
        user: data.user,
        tokens: {
          accessToken: data.token,
          refreshToken: data.token // Por enquanto usando o mesmo
        },
        expiresAt: new Date(Date.now() + SESSION_DURATION_CUSTOMER_MS).toISOString()
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro na autenticação do cliente.");
    }
  },

  async loginAdmin(payload) {
    try {
      const { data } = await api.post("/auth/login", {
        email: payload.email,
        password: payload.password
      });

      if (!allowedAdminRoles.includes(data.user.role)) {
        throw new Error("Você não tem permissão para acessar o painel administrativo.");
      }

      return {
        tokenId: data.token,
        scope: "ADMIN",
        user: data.user,
        tokens: {
          accessToken: data.token,
          refreshToken: data.token
        },
        expiresAt: new Date(Date.now() + SESSION_DURATION_ADMIN_MS).toISOString()
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro na autenticação administrativa.");
    }
  },

  async refreshSession(payload) {
    // Para um MVP, podemos retornar a sessão atual se o token ainda for válido
    // Em um sistema real, teríamos uma rota de /auth/refresh
    throw new Error("Sessão expirada. Por favor, faça login novamente.");
  },

  async logout() {
    return;
  },

  async registerCustomer(payload) {
    try {
      const { data } = await api.post("/auth/register", payload);

      return {
        tokenId: data.token,
        scope: "CUSTOMER",
        user: data.user,
        tokens: {
          accessToken: data.token,
          refreshToken: data.token
        },
        expiresAt: new Date(Date.now() + SESSION_DURATION_CUSTOMER_MS).toISOString()
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao realizar o cadastro.");
    }
  }
};

