'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  CheckCircle2,
  Percent,
  ArrowRight,
  PlusCircle,
  Settings,
  Store,
  ExternalLink,
  Clock,
  Box,
  Layers,
  Sparkles
} from "lucide-react";
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

const iconMap = [
  { icon: Package, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: CheckCircle2, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: Users, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  { icon: Percent, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" }
];

const statusColor: Record<string, string> = {
  Entregue: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Enviado: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Processando: "bg-amber-500/15 text-amber-400 border-amber-500/30"
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
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 mt-4 text-xs font-semibold uppercase tracking-wider">
          Carregando indicadores...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/50 border border-zinc-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Painel de Desempenho</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">Tempo Real</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Visão Geral do Seu E-commerce</h2>
          <p className="text-xs text-zinc-400 mt-1">Acompanhe métricas de faturamento, pedidos e clientes da JPB Store.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200 text-xs gap-2" asChild>
            <Link href="/admin/produtos">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Novo Produto
            </Link>
          </Button>
          <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs gap-2 shadow-sm shadow-amber-500/20" asChild>
            <Link href="/admin/pedidos">
              <ShoppingCart className="w-4 h-4" />
              Ver Pedidos
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const config = iconMap[index % iconMap.length];
          const Icon = config.icon;

          return (
            <Card key={metric.title} className="bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700 transition-all shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{metric.title}</span>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-100 tracking-tight tabular-nums">{metric.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-emerald-400 font-semibold">{metric.change}</span>
                  <span className="text-[11px] text-zinc-500 font-medium">vs período anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Orders & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/70 border-zinc-800/80 overflow-hidden shadow-sm">
            <CardHeader className="bg-zinc-950/40 border-b border-zinc-800/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    Vendas Recentes
                  </CardTitle>
                  <p className="text-xs text-zinc-400 mt-0.5">Últimos pedidos realizados na loja</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" asChild>
                  <Link href="/admin/pedidos">
                    Ver todos <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/80 hover:bg-transparent bg-zinc-950/20">
                    <TableHead className="text-zinc-400 text-xs font-semibold pl-6">Cliente</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-semibold">Item Principal</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-semibold text-right">Valor</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-semibold text-center pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-36 text-center text-zinc-500 italic text-sm">
                        Nenhum pedido recente registrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const initials = order.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <TableRow key={order.id} className="border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                          <TableCell className="pl-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-bold text-zinc-200">{initials}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs text-zinc-200">{order.customerName}</span>
                                <span className="font-mono text-[10px] text-zinc-500">#{order.id.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Box className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="text-xs text-zinc-300 truncate max-w-[180px]">{order.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs text-zinc-100 tabular-nums">
                            {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                          <TableCell className="text-center pr-6">
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider min-w-[85px] justify-center",
                                statusColor[order.status] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}
                            >
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

        {/* Quick Actions & Store Info (1 col) */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/70 border-zinc-800/80 overflow-hidden shadow-sm">
            <CardHeader className="bg-zinc-950/40 border-b border-zinc-800/60 p-5">
              <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Atalhos Rápidos
              </CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">Operações mais frequentes</p>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-zinc-950/50 border-zinc-800 hover:border-amber-400/40 hover:bg-zinc-800/60 transition-all rounded-xl"
                asChild
              >
                <Link href="/admin/produtos">
                  <Package className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-200">Produtos</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-zinc-950/50 border-zinc-800 hover:border-amber-400/40 hover:bg-zinc-800/60 transition-all rounded-xl"
                asChild
              >
                <Link href="/admin/pedidos">
                  <ShoppingCart className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-semibold text-zinc-200">Vendas</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-zinc-950/50 border-zinc-800 hover:border-amber-400/40 hover:bg-zinc-800/60 transition-all rounded-xl"
                asChild
              >
                <Link href="/admin/clientes">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-semibold text-zinc-200">Clientes</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-zinc-950/50 border-zinc-800 hover:border-amber-400/40 hover:bg-zinc-800/60 transition-all rounded-xl"
                asChild
              >
                <Link href="/admin/configuracoes/empresa">
                  <Settings className="w-5 h-5 text-violet-400" />
                  <span className="text-xs font-semibold text-zinc-200">Ajustes</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Visit Store Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/20 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Loja em Operação</span>
            </div>
            <h3 className="font-bold text-base text-zinc-100 mb-1">JPB Store Oficial</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Sua vitrine pública está ativa com checkout Mercado Pago e cotação de frete automática.
            </p>
            <Button
              className="w-full gap-2 font-bold text-xs bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl shadow-md shadow-amber-500/15"
              asChild
            >
              <Link href="/" target="_blank">
                <ExternalLink className="w-3.5 h-3.5" /> Acessar Vitrine da Loja
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
