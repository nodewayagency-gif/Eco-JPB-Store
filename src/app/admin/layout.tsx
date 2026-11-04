'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ChevronDown,
  ExternalLink,
  LogOut,
  ShoppingBag,
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
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { RequireAdminAuth } from "@/providers/auth/RouteGuards";
import { adminRepository } from "@/services/api/adminRepository";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  end?: boolean;
  badgeCount?: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminSession, logoutAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminLogin = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [paidOrdersCount, setPaidOrdersCount] = useState(0);

  const settingsOpen = pathname.startsWith("/admin/configuracoes");
  const couponsOpen = pathname.startsWith("/admin/cupons");

  useEffect(() => {
    if (isAdminLogin || !adminSession) {
      setOpenTicketsCount(0);
      setPaidOrdersCount(0);
      return;
    }
    
    const fetchCounts = async () => {
      try {
        const [tickets, orders] = await Promise.all([
          adminRepository.listTickets(),
          adminRepository.listOrders()
        ]);

        const tCount = Array.isArray(tickets) ? tickets.filter(t => t?.status === "OPEN" || t?.status === "IN_PROGRESS").length : 0;
        setOpenTicketsCount(tCount);

        const pCount = Array.isArray(orders) ? orders.filter(o => o?.currentStep === "payment_confirmed" || o?.statusLabel === "Pagamento confirmado").length : 0;
        setPaidOrdersCount(pCount);
      } catch (error) {
        if ((error as any)?.response?.status === 403) return;
        console.error("Erro ao buscar contagens:", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isAdminLogin, adminSession]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/admin/login");
  };

  if (isAdminLogin) {
    return <>{children}</>;
  }

  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "Visão Geral do Negócio";
    if (pathname.startsWith("/admin/pedidos")) return "Gestão de Pedidos & Vendas";
    if (pathname.startsWith("/admin/produtos")) return "Catálogo de Produtos & Estoque";
    if (pathname.startsWith("/admin/categorias")) return "Categorias da Loja";
    if (pathname.startsWith("/admin/clientes")) return "Base de Clientes";
    if (pathname.startsWith("/admin/suporte")) return "Central de Atendimento ao Cliente";
    if (pathname.startsWith("/admin/leads")) return "Leads & Lista de Espera";
    if (pathname.startsWith("/admin/cupons")) return "Cupons & Comissões de Afiliados";
    if (pathname.startsWith("/admin/usuarios")) return "Gestão da Equipe & Permissões";
    if (pathname.startsWith("/admin/configuracoes/regras")) return "Regras de Checkout & Frete";
    if (pathname.startsWith("/admin/configuracoes")) return "Configurações & Integrações";
    return "Painel de Controle";
  };

  const navGroups = [
    {
      title: "PRINCIPAL",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
        { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, badgeCount: paidOrdersCount },
      ]
    },
    {
      title: "CATÁLOGO",
      items: [
        { href: "/admin/produtos", label: "Produtos & Estoque", icon: Package },
        { href: "/admin/categorias", label: "Categorias", icon: Tags },
      ]
    },
    {
      title: "CLIENTES & MARKETING",
      items: [
        { href: "/admin/clientes", label: "Clientes", icon: Users },
        { href: "/admin/suporte", label: "Suporte", icon: MessageSquare, badgeCount: openTicketsCount },
        { href: "/admin/leads", label: "Leads de Espera", icon: UserCheck },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950/90 border-r border-zinc-800/80">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm text-zinc-950 font-black text-sm">
            J
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-zinc-100">JPB Store</span>
            <p className="text-[11px] text-zinc-400 font-medium">Painel de Gestão</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = item.end ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group relative",
                    isActive
                      ? "bg-zinc-800 text-zinc-100 shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-amber-400" : "text-zinc-400 group-hover:text-zinc-200")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-zinc-950">
                      {item.badgeCount}
                    </span>
                  ) : null}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r bg-amber-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Collapsible: Cupons */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            CUPONS & AFILIADOS
          </p>
          <Collapsible defaultOpen={couponsOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 transition-colors">
                <span className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-zinc-400" />
                  Cupons & Parcerias
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-4 border-l border-zinc-800/80 ml-4">
              <Link
                href="/admin/cupons/geral"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-1.5 rounded-md text-xs transition-colors",
                  pathname === "/admin/cupons/geral"
                    ? "bg-zinc-800 text-amber-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                Gerenciar Cupons
              </Link>
              <Link
                href="/admin/cupons/comissoes"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-1.5 rounded-md text-xs transition-colors",
                  pathname === "/admin/cupons/comissoes"
                    ? "bg-zinc-800 text-amber-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                Relatório de Comissões
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Collapsible: Configurações */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            SISTEMA
          </p>
          <Link
            href="/admin/usuarios"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              pathname.startsWith("/admin/usuarios")
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Equipe & Permissões</span>
          </Link>
          <Collapsible defaultOpen={settingsOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 transition-colors">
                <span className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-zinc-400" />
                  Configurações
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-0.5 pl-4 border-l border-zinc-800/80 ml-4">
              <Link
                href="/admin/configuracoes/empresa"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                  pathname === "/admin/configuracoes/empresa"
                    ? "bg-zinc-800 text-amber-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <Building2 className="w-3 h-3" /> Dados da Empresa
              </Link>
              <Link
                href="/admin/configuracoes/pagamento"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                  pathname === "/admin/configuracoes/pagamento"
                    ? "bg-zinc-800 text-amber-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <Wallet className="w-3 h-3" /> Gateways de Pagamento
              </Link>
              <Link
                href="/admin/configuracoes/envio"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                  pathname === "/admin/configuracoes/envio"
                    ? "bg-zinc-800 text-amber-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <Truck className="w-3 h-3" /> Integração de Frete
              </Link>
              <Link
                href="/admin/configuracoes/regras"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                  pathname === "/admin/configuracoes/regras"
                    ? "bg-zinc-800 text-amber-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <Zap className="w-3 h-3" /> Regras de Checkout
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-100 shrink-0">
              {adminSession?.user.displayName?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{adminSession?.user.displayName || "Administrador"}</p>
              <p className="text-[10px] text-zinc-400 truncate">{adminSession?.user.role || "ADMIN"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Sair da sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <RequireAdminAuth allowedRoles={["ADMIN", "OPERATOR"]}>
      <div className="admin-theme min-h-screen bg-[#090a0f] text-zinc-100 flex antialiased">
        {/* Desktop Sidebar (Fixed) */}
        <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
          <SidebarContent />
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50"
              >
                <SidebarContent />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 px-4 lg:px-8 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm lg:text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                  {getBreadcrumbTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Loja Ativa
              </div>

              <Link href="/" target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Ver Loja Virtual</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RequireAdminAuth>
  );
}
