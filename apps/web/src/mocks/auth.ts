import type { AuthUser } from "@premium/contracts";

export type MockAuthUser = AuthUser & {
  passwordHash: string;
  plainPassword: string;
};

export const mockAuthUsers: MockAuthUser[] = [
  {
    id: "usr_admin_001",
    email: "admin@jpb.com",
    role: "ADMIN",
    displayName: "Administrador JPB",
    status: "ACTIVE",
    passwordHash: "hash_admin_123",
    plainPassword: "Admin@123"
  },
  {
    id: "usr_operator_001",
    email: "operador@jpb.com",
    role: "OPERATOR",
    displayName: "Operador JPB",
    status: "ACTIVE",
    passwordHash: "hash_operator_123",
    plainPassword: "Operador@123"
  },
  {
    id: "usr_customer_001",
    email: "cliente@jpb.com",
    role: "CUSTOMER",
    displayName: "Carlos Silva",
    status: "ACTIVE",
    passwordHash: "hash_customer_123",
    plainPassword: "Cliente@123"
  }
];
