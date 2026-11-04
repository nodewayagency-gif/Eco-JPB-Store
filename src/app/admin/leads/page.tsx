'use client';

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Users, Search, MessageCircle, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import type { AdminLead } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { cn, maskPhone } from "@/lib/utils";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await adminRepository.listLeads();
        setLeads(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const pending = leads.filter((lead) => !lead.notified).length;
  const notifiedCount = leads.filter((lead) => lead.notified).length;

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredLeads, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleNotify = async (lead: AdminLead) => {
    try {
      await adminRepository.updateLeadStatus(lead.id, "NOTIFIED");
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, notified: true } : l)));

      let phoneOnlyNumbers = lead.phone.replace(/\D/g, '');
      if (phoneOnlyNumbers.length <= 11) {
        phoneOnlyNumbers = `55${phoneOnlyNumbers}`;
      }

      const message = `Olá ${lead.name}, o produto ${lead.product} que você estava aguardando acabou de chegar no estoque da jpbstorex.com.br!`;
      const url = `https://wa.me/${phoneOnlyNumbers}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error("Erro ao notificar lead:", error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Leads & Lista de Espera</h1>
            <p className="text-xs text-zinc-400">Monitore potenciais compradores de produtos fora de estoque ou futuros lançamentos.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar nome, fone ou produto..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Total de Leads</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{leads.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Aguardando Aviso</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{pending}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-400">Já Notificados</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{notifiedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Leads */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Interessados Cadastrados</span>
          </div>
          <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-normal">
            {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/80">
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="pl-6 w-[200px] text-[11px] uppercase font-bold text-zinc-400 py-3.5">Nome</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Telefone</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Produto Desejado</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Data de Captura</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-right pr-6 w-[140px] text-[11px] uppercase font-bold text-zinc-400">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando leads...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-400 text-xs">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead, idx) => (
                  <TableRow key={`${lead.id}-${idx}`} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                    <TableCell className="pl-6 font-semibold text-xs text-zinc-200">
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs font-mono">
                      {maskPhone(lead.phone)}
                    </TableCell>
                    <TableCell className="text-zinc-200 text-xs">
                      {lead.product}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs">
                      {lead.date}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                          lead.notified
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {lead.notified ? "Notificado" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg"
                        onClick={() => handleNotify(lead)}
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Notificar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn("cursor-pointer text-zinc-300 hover:bg-zinc-800 text-xs", page === 1 && "pointer-events-none opacity-30")}
                  />
                </PaginationItem>
                <span className="text-xs text-zinc-400 px-4">
                  Página {page} de {totalPages}
                </span>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={cn("cursor-pointer text-zinc-300 hover:bg-zinc-800 text-xs", page === totalPages && "pointer-events-none opacity-30")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
