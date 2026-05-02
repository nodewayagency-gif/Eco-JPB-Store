import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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

const navItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: PackageCheck },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: Tags },
  { to: "/admin/cupons", label: "Cupons", icon: Ticket },
  { to: "/admin/suporte", label: "Suporte", icon: MessageSquare },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/leads", label: "Leads", icon: Users }
];

const settingsItems = [
  { to: "/admin/configuracoes/empresa", label: "Informações da empresa", icon: Building2 },
  { to: "/admin/configuracoes/pagamento", label: "Gateway de pagamento", icon: Wallet },
  { to: "/admin/configuracoes/envio", label: "Integração de envio", icon: Truck }
];

const AdminLayout = () => {
  const { adminSession, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const settingsOpen = location.pathname.startsWith("/admin/configuracoes");

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )
          }
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </NavLink>
      ))}

      <Collapsible defaultOpen={settingsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm border bg-card text-muted-foreground border-border hover:text-foreground transition-colors">
            <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> Configurações</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1">
          {settingsItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center gap-3 pl-8 pr-3 py-2 rounded-lg text-sm border transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                )
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </>
  );

  return (
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
            <Link to="/">
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
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
