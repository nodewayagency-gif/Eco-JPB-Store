'use client';

import { useEffect, useState, useMemo } from "react";
import { Mail, TrendingUp, Users, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

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

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) =>
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Captação de Leads</h1>
        <p className="text-sm text-muted-foreground">Monitore clientes interessados em produtos sem estoque ou lançamentos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total de Leads</span>
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{leads.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Aguardando Notificação</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">68%</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar e-mail ou produto..." 
              className="pl-9 bg-card" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Leads de Interesse
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6">E-mail</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Data de Captura</TableHead>
                  <TableHead className="text-center pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Carregando leads...
                    </TableCell>
                  </TableRow>
                ) : paginatedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead, idx) => (
                    <TableRow key={`${lead.email}-${idx}`} className="border-border hover:bg-muted/30">
                      <TableCell className="pl-6 font-medium">{lead.email}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.product}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.date}</TableCell>
                      <TableCell className="text-center pr-6">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold uppercase text-[10px]",
                            lead.notified
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}
                        >
                          {lead.notified ? "Notificado" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={cn("cursor-pointer", page === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={cn("cursor-pointer", page === totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
