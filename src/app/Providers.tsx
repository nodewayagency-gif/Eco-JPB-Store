'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigProvider } from "@/providers/ConfigContext";
import { CartProvider } from "@/providers/CartContext";
import { AuthProvider } from "@/providers/auth/AuthProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConfigProvider>
          <CartProvider>
            <AuthProvider>
              {children}
              <Toaster />
              <Sonner />
            </AuthProvider>
          </CartProvider>
        </ConfigProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
