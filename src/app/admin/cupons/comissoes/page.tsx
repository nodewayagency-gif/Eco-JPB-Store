'use client';

import { useEffect, useState } from "react";
import { Wallet, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  const filteredCommissions = commissions.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCommissionToPay = filteredCommissions.reduce((acc, curr) => acc + curr.commissionTotal, 0);
  const totalRevenue = filteredCommissions.reduce((acc, curr) => acc + curr.revenueTotal, 0);

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
    { value: "12", label: "Dezembro" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Comissões & Parcerias</h1>
            <p className="text-xs text-zinc-400">Apure faturamento e comissões geradas por cupons de parceiros e influenciadores.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[130px] bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-9 rounded-lg">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[95px] bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-9 rounded-lg">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Total a Repassar (Período)</p>
              <h2 className="text-2xl font-bold text-emerald-400 mt-1">
                {totalCommissionToPay.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </h2>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Faturamento Via Cupons</p>
              <h2 className="text-2xl font-bold text-amber-400 mt-1">
                {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </h2>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Comissões */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/60">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar por cupom..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={loadCommissions}
            size="sm"
            className="gap-2 bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs h-9 rounded-lg"
          >
            <Filter className="w-3.5 h-3.5" /> Atualizar Tabela
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/80">
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="pl-6 text-[11px] uppercase font-bold text-zinc-400 py-3.5">Cupom Parceiro</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Usos Pagos</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">% Comissão</TableHead>
                <TableHead className="text-right text-[11px] uppercase font-bold text-zinc-400">Faturamento Gerado</TableHead>
                <TableHead className="text-right pr-6 text-[11px] uppercase font-bold text-zinc-400">Comissão Devida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Calculando comissões...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCommissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-zinc-400 text-xs">
                    Nenhum pedido pago utilizou cupons com comissão neste período.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommissions.map((coupon) => (
                  <TableRow key={coupon.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                    <TableCell className="pl-6 font-mono font-bold text-xs text-amber-400">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold text-zinc-200">
                      {coupon.usageCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs">
                        {coupon.commissionPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-zinc-300">
                      {coupon.revenueTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-bold text-xs text-emerald-400">
                      {coupon.commissionTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
