'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, CheckCircle2, Percent, ArrowRight, PlusCircle, Settings, Store, Eye, Clock, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminMetric, AdminOrderSummary } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";

const iconMap = [Package, DollarSign, CheckCircle2, TrendingUp, Users, Percent];

const statusColor: Record<string, string> = {
  Entregue: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Enviado: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Processando: "bg-amber-500/10 text-amber-500 border-amber-500/20"
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetric[]>([]);
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [metricRows, recentOrders] = await Promise.all([
          adminRepository.getMetrics(),
          adminRepository.getRecentOrders()
        ]);

        setMetrics(metricRows);
        setOrders(recentOrders);
      } catch (error) {
        console.error("Erro ao carregar métricas do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-background">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground mt-4 text-xs font-black uppercase tracking-widest">
          Sincronizando dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = iconMap[index % iconMap.length];

          return (
            <Card key={metric.title} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{metric.title}</span>
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <span className="text-xs text-emerald-400 font-medium">{metric.change} vs mês anterior</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">Pedidos Recentes</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Últimas vendas aprovadas na loja</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-border bg-background" asChild>
                  <Link href="/admin/pedidos">
                    Ver todos <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6">Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">Nenhum pedido recente.</TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const initials = order.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      return (
                        <TableRow key={order.id} className="border-border/50 hover:bg-secondary/20 transition-colors">
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">{initials}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm leading-none">{order.customerName}</span>
                                <span className="font-mono text-[10px] text-muted-foreground mt-1">#{order.id.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Box className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">{order.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground">
                            {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-center pr-6">
                            <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider min-w-[90px] justify-center", statusColor[order.status] || "bg-secondary text-muted-foreground border-border")}>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-4">
              <CardTitle className="text-lg font-bold text-foreground">Ações Rápidas</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Atalhos para gestão da loja</p>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-secondary/50 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                <Link href="/admin/produtos">
                  <PlusCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-semibold">Novo Produto</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-secondary/50 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                <Link href="/admin/pedidos">
                  <ShoppingCart className="w-5 h-5 text-sky-500" />
                  <span className="text-xs font-semibold">Ver Vendas</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-secondary/50 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                <Link href="/admin/clientes">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-semibold">Clientes</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-secondary/50 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                <Link href="/admin/configuracoes/empresa">
                  <Settings className="w-5 h-5 text-violet-500" />
                  <span className="text-xs font-semibold">Ajustes</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Store className="w-24 h-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="font-bold text-lg mb-2 text-foreground">Sua loja está online!</h3>
              <p className="text-sm text-muted-foreground mb-4">Acompanhe seus acessos e conversões na aba de analytics.</p>
              <Button className="w-full gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/" target="_blank">
                  <Eye className="w-4 h-4" /> Visitar Loja
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
