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
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: PackageCheck },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: Tags },
  { to: "/admin/cupons", label: "Cupons", icon: Ticket },
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

  const settingsOpen = location.pathname.startsWith("/admin/configuracoes");

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold gold-text">JPB Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{adminSession?.user.displayName}</p>
              <p className="text-xs text-muted-foreground">{adminSession?.user.email}</p>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              {adminSession?.user.role}
            </Badge>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" /> Ver loja
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
        <aside className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
