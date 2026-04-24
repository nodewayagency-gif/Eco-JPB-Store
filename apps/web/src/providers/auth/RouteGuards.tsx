import type { ReactNode } from "react";
import type { Role } from "@premium/contracts";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/auth/AuthProvider";

export const RequireCustomerAuth = ({ children }: { children: ReactNode }) => {
  const { isLoading, isCustomerAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isCustomerAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export const RequireAdminAuth = ({
  children,
  allowedRoles
}: {
  children: ReactNode;
  allowedRoles: Role[];
}) => {
  const { isLoading, isAdminAuthenticated, hasAdminRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAdminAuthenticated || !hasAdminRole(allowedRoles)) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

