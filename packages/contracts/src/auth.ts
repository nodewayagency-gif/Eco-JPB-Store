export type Role = "ADMIN" | "OPERATOR" | "CUSTOMER";

export type SessionScope = "ADMIN" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  displayName: string;
  status: UserStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  tokenId: string;
  scope: SessionScope;
  user: AuthUser;
  tokens: AuthTokens;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: AuthSession;
}

export interface RefreshSessionRequest {
  refreshToken: string;
  scope: SessionScope;
}

