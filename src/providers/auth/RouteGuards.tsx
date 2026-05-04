import type { ReactNode } from "react";
import type { Role } from "@premium/contracts";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth/AuthProvider";

export const RequireCustomerAuth = ({ children }: { children: ReactNode }) => {
  const { isLoading, isCustomerAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isCustomerAuthenticated) {
      router.replace(`/login?from=${pathname}`);
    }
  }, [isLoading, isCustomerAuthenticated, router, pathname]);

  if (isLoading || !isCustomerAuthenticated) {
    return null;
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAdminAuthenticated || !hasAdminRole(allowedRoles))) {
      router.replace(`/admin/login?from=${pathname}`);
    }
  }, [isLoading, isAdminAuthenticated, hasAdminRole, allowedRoles, router, pathname]);

  if (isLoading || !isAdminAuthenticated || !hasAdminRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
};

