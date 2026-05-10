'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  Eye,
  LogOut,
  PackageCheck,
  Package,
  Settings,
  Truck,
  Users,
  Wallet,
  Building2,
  Tags,
  Ticket,
  Menu,
  X,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { RequireAdminAuth } from "@/providers/auth/RouteGuards";

import { adminRepository } from "@/services/api/adminRepository";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: PackageCheck },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/suporte", label: "Suporte", icon: MessageSquare, badge: true },
  { href: "/admin/usuarios", label: "Equipe", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Users }
];

const settingsItems = [
  { href: "/admin/configuracoes/empresa", label: "Informações da empresa", icon: Building2 },
  { href: "/admin/configuracoes/pagamento", label: "Gateway de pagamento", icon: Wallet },
  { href: "/admin/configuracoes/envio", label: "Integração de envio", icon: Truck }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminSession, logoutAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminLogin = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  const settingsOpen = pathname.startsWith("/admin/configuracoes");

  useEffect(() => {
    if (isAdminLogin || !adminSession) {
      setOpenTicketsCount(0);
      return;
    }
    
    const fetchCount = async () => {
      try {
        const tickets = await adminRepository.listTickets();
        const count = Array.isArray(tickets) ? tickets.filter(t => t?.status === "OPEN").length : 0;
        setOpenTicketsCount(count);
      } catch (error) {
        // Silently fail if 403 (likely logged out)
        if ((error as any)?.response?.status === 403) return;
        console.error("Erro ao buscar contagem de tickets:", error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Polling cada 30s (aumentado para economizar recursos)
    return () => clearInterval(interval);
  }, [isAdminLogin, adminSession]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/admin/login");
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = item.end ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
            {item.badge && openTicketsCount > 0 && (
              <Badge className="h-5 px-1.5 min-w-[20px] justify-center bg-destructive text-white border-none text-[10px] animate-pulse">
                {openTicketsCount}
              </Badge>
            )}
          </Link>
        );
      })}

      <Collapsible defaultOpen={settingsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm border bg-card text-muted-foreground border-border hover:text-foreground transition-colors">
            <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> Configurações</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1">
          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "w-full flex items-center gap-3 pl-8 pr-3 py-2 rounded-lg text-sm border transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </>
  );

  if (isAdminLogin) {
    return <>{children}</>;
  }

  return (
    <RequireAdminAuth allowedRoles={["ADMIN", "OPERATOR"]}>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <BarChart3 className="w-5 h-5 text-primary hidden sm:block" />
              <img src="/brand/logo-32.png" alt="JPB Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold gold-text">JPB Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{adminSession?.user.displayName}</p>
                <p className="text-xs text-muted-foreground">{adminSession?.user.email}</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary hidden sm:inline-flex">
                {adminSession?.user.role}
              </Badge>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                  <Eye className="w-4 h-4" /> Ver loja
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-b border-border bg-card absolute w-full z-30"
            >
              <div className="px-6 py-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="mb-4 sm:hidden pb-4 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{adminSession?.user.displayName}</p>
                  <p className="text-xs text-muted-foreground mb-2">{adminSession?.user.email}</p>
                  <Badge variant="outline" className="border-primary/40 text-primary mb-4">
                    {adminSession?.user.role}
                  </Badge>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2 justify-center">
                      <Eye className="w-4 h-4" /> Ver loja
                    </Button>
                  </Link>
                </div>
                <NavLinks />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
          <aside className="hidden lg:block space-y-2">
            <NavLinks />
          </aside>

          <main>
            {children}
          </main>
        </div>
      </div>
    </RequireAdminAuth>
  );
}
