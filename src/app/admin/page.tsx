'use client';

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, CheckCircle2, Percent } from "lucide-react";
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
import type { AdminMetric, AdminOrderSummary } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";

const iconMap = [Package, DollarSign, CheckCircle2, TrendingUp, Users, Percent];

const statusColor: Record<string, string> = {
  Entregue: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Enviado: "bg-primary/20 text-primary border-primary/30",
  Processando: "bg-amber-500/20 text-amber-400 border-amber-500/30"
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

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{order.productName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {order.total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={statusColor[order.status] || "bg-secondary text-muted-foreground border-border"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
