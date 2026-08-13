'use client';

import { useEffect, useState } from "react";
import { Wallet, Search, Filter, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";

interface CommissionData {
  id: string;
  code: string;
  commissionPercent: number;
  usageCount: number;
  revenueTotal: number;
  commissionTotal: number;
}

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const data = await adminRepository.listCouponCommissions(parseInt(month), parseInt(year));
      setCommissions(data);
    } catch (error) {
      toast.error("Erro ao carregar comissões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [month, year]);

  const filteredCommissions = commissions.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCommissionToPay = filteredCommissions.reduce((acc, curr) => acc + curr.commissionTotal, 0);

  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comissões de Parceiros</h1>
          <p className="text-sm text-muted-foreground">Calcule os pagamentos referentes a vendas utilizando cupons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">Total a Pagar (Mês)</p>
              <h2 className="text-3xl font-bold text-emerald-500">
                {totalCommissionToPay.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </h2>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <Wallet className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Período de Apuração
            </CardTitle>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[140px] bg-background border-border">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px] bg-background border-border">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cupom..."
                className="pl-9 bg-card border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadCommissions} className="gap-2">
              <Filter className="w-4 h-4" /> Recarregar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6">Cupom</TableHead>
                  <TableHead className="text-center">Usos Pagos</TableHead>
                  <TableHead className="text-center">% Comissão</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right pr-6">Comissão a Pagar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={5} className="h-40 text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-muted-foreground text-sm">Calculando comissões...</p>
                        </div>
                     </TableCell>
                   </TableRow>
                ) : filteredCommissions.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Nenhum pedido pago utilizou cupons neste período.
                     </TableCell>
                  </TableRow>
                ) : (
                  filteredCommissions.map((coupon) => (
                    <TableRow key={coupon.id} className="border-border hover:bg-muted/30">
                      <TableCell className="pl-6 font-mono font-bold text-primary">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {coupon.usageCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-border bg-secondary/50">
                            {coupon.commissionPercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {coupon.revenueTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-bold text-emerald-500">
                        {coupon.commissionTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
