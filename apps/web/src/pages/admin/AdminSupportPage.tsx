import { useState, useEffect } from "react";
import { MessageSquare, ArrowLeft, Check, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SupportTicketView, TicketStatus } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicketView[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketView | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const data = await adminRepository.listTickets();
    setTickets(data);
    if (selectedTicket) {
      const updated = data.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyContent) return;
    try {
      await adminRepository.replyTicket(selectedTicket.id, { content: replyContent });
      setReplyContent("");
      await loadTickets();
      toast.success("Resposta enviada com sucesso");
    } catch (error) {
      toast.error("Erro ao enviar resposta");
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    try {
      await adminRepository.updateTicketStatus(selectedTicket.id, status);
      await loadTickets();
      toast.success("Status atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar chamado ou cliente..." 
              className="pl-9 bg-card" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="OPEN">Abertos</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Atendimento</SelectItem>
              <SelectItem value="CLOSED">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6 items-start h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* Lado Esquerdo: Lista de Tickets */}
        <Card className="h-full flex flex-col bg-card border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/20">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Chamados ({filteredTickets.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {paginatedTickets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Nenhum chamado encontrado.</p>
              </div>
            ) : (
              paginatedTickets.map(ticket => (
                <button 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedTicket?.id === ticket.id ? "bg-primary/10 border-primary" : "bg-background border-border hover:border-primary/50"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm line-clamp-1 flex-1 pr-2">{ticket.subject}</span>
                    <Badge variant="outline" className={`text-[9px] h-4 px-1 ${ticket.status === "CLOSED" ? "border-muted" : ticket.status === "OPEN" ? "border-destructive text-destructive" : "border-primary text-primary"}`}>
                      {ticket.status === "OPEN" ? "Aberto" : ticket.status === "IN_PROGRESS" ? "Em Atendimento" : "Fechado"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between items-center mt-2">
                    <span className="truncate">{ticket.customerName}</span>
                    <span className="shrink-0 ml-2">{new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </button>
              ))
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="p-3 border-t border-border">
              <Pagination>
                <PaginationContent className="gap-0">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50 h-8 w-8 p-0" : "cursor-pointer h-8 w-8 p-0"}
                    />
                  </PaginationItem>
                  <span className="text-[10px] text-muted-foreground px-2">
                    {page}/{totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50 h-8 w-8 p-0" : "cursor-pointer h-8 w-8 p-0"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>

        {/* Lado Direito: Detalhes do Ticket (Chat) */}
        <Card className="h-full flex flex-col bg-card border-border overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-border bg-secondary/30 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {selectedTicket.subject}
                    <span className="text-xs font-normal text-muted-foreground">#{selectedTicket.id}</span>
                  </h2>
                  <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                    <span>Cliente: <strong className="text-foreground">{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail})</span>
                    {selectedTicket.orderId && <span>Pedido: <strong className="text-primary">{selectedTicket.orderId}</strong></span>}
                  </div>
                </div>
                <Select value={selectedTicket.status} onValueChange={(v: TicketStatus) => handleStatusChange(v)}>
                  <SelectTrigger className={`w-[160px] ${selectedTicket.status === 'CLOSED' ? 'bg-muted' : selectedTicket.status === 'OPEN' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Aberto</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Atendimento</SelectItem>
                    <SelectItem value="CLOSED">Fechado (Resolvido)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                {selectedTicket.messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderRole !== "CUSTOMER" ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.senderRole !== "CUSTOMER" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{msg.senderName} • {new Date(msg.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "CLOSED" && (
                <div className="p-4 border-t border-border bg-card flex gap-2">
                  <Input 
                    value={replyContent} 
                    onChange={e => setReplyContent(e.target.value)} 
                    placeholder="Digite sua resposta para o cliente..." 
                    className="flex-1 bg-background"
                    onKeyDown={e => e.key === "Enter" && handleReply()}
                  />
                  <Button onClick={handleReply} disabled={!replyContent} className="gap-2">
                    <Check className="w-4 h-4" /> Enviar
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">Selecione um chamado</p>
              <p className="text-sm mt-1">Clique em um ticket na lista ao lado para ver os detalhes e responder ao cliente.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
