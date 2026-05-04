'use client';

import { useEffect, useState } from "react";
import { 
  Search, 
  MessageSquare, 
  User, 
  Image as ImageIcon, 
  X, 
  Package, 
  ChevronRight,
  Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";
import type { SupportTicketView, TicketStatus } from "@premium/contracts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth/AuthProvider";
import { cn } from "@/lib/utils";

export default function AdminSupportPage() {
  const { adminSession } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketView[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketView | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyImages, setReplyImages] = useState<{file: File, preview: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const safeDateFormat = (date: any) => {
    try {
      if (!date) return "Data n/a";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Data n/a";
      return d.toLocaleString("pt-BR");
    } catch {
      return "Data n/a";
    }
  };

  useEffect(() => {
    loadTickets();

    const interval = setInterval(() => {
      loadTickets();
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  const loadTickets = async () => {
    try {
      const data = await adminRepository.listTickets();
      if (Array.isArray(data)) {
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find(t => t.id === selectedTicket.id);
          if (updated) {
            setSelectedTicket(prev => {
              if (!prev) return updated;
              const messages = (updated.messages && updated.messages.length > 0) 
                ? updated.messages 
                : prev.messages;
              return { ...prev, ...updated, messages };
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar chamados:", error);
    }
  };

  const handleStatusUpdate = async (id: string, status: TicketStatus) => {
    try {
      const updated = await adminRepository.updateTicketStatus(id, status);
      toast.success("Status atualizado!");
      
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
      
      if (selectedTicket?.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, ...updated } : updated);
      }
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setReplyImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setReplyImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleReply = async () => {
    if (!selectedTicket || (!replyContent && replyImages.length === 0)) return;
    try {
      setIsUploading(true);
      const imageUrls: string[] = [];

      const adminId = adminSession?.user.id || 'admin';
      for (const item of replyImages) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${adminId}-${Math.random()}.${fileExt}`;
        const filePath = `tickets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('jpb_tickets')
          .upload(filePath, item.file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('jpb_tickets')
            .getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      await adminRepository.replyTicket(selectedTicket.id, { 
        content: replyContent,
        images: imageUrls
      });
      
      setReplyContent("");
      setReplyImages([]);
      await loadTickets();
      toast.success("Resposta enviada!");
    } catch (error) {
      toast.error("Erro ao responder");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch = (t.customerName || "").toLowerCase().includes(search.toLowerCase()) || 
                         (t.subject || "").toLowerCase().includes(search.toLowerCase()) ||
                         (t.id || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Central de Atendimento
          </h1>
          <p className="text-xs text-muted-foreground">Gerencie chamados e suporte aos clientes.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar chamado..." 
              className="pl-9 h-10 bg-background/50 border-border/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px] h-10 bg-background/50 border-border/50">
              <Filter className="w-4 h-4 mr-2 opacity-50" />
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

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-4 overflow-hidden">
          <Card className="flex-1 flex flex-col bg-card border-border overflow-hidden">
            <div className="p-3 border-b border-border bg-secondary/10 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fila de Chamados</span>
              <Badge variant="outline" className="text-[10px] bg-primary/5">{filteredTickets.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {paginatedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-30">
                  <MessageSquare className="w-10 h-10 mb-2" />
                  <p className="text-sm">Nenhum chamado</p>
                </div>
              ) : (
                paginatedTickets.map(ticket => (
                  <button 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group",
                      selectedTicket?.id === ticket.id 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                        : "bg-background/50 border-border/50 hover:border-primary/30"
                    )}
                  >
                    {selectedTicket?.id === ticket.id && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm truncate pr-2 flex-1">{ticket.subject || "Sem Assunto"}</h4>
                      <Badge className={cn(
                        "text-[9px] h-5 font-bold uppercase tracking-tighter",
                        ticket.status === "OPEN" ? "bg-destructive/20 text-destructive border-destructive/30" :
                        ticket.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                        "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                      )} variant="outline">
                        {ticket.status === "OPEN" ? "Aberto" : ticket.status === "IN_PROGRESS" ? "Em Atend." : "Resolvido"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="truncate">{ticket.customerName || "Desconhecido"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                      <span className="text-[10px] font-mono opacity-50">#{ticket.id.slice(-6)}</span>
                      <span className="text-[10px] opacity-50">{safeDateFormat(ticket.updatedAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="p-2 border-t border-border bg-secondary/5">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={cn("h-8 w-8 p-0 cursor-pointer", page === 1 && "pointer-events-none opacity-20")}
                      />
                    </PaginationItem>
                    <span className="text-[10px] font-bold px-2">{page}/{totalPages}</span>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={cn("h-8 w-8 p-0 cursor-pointer", page === totalPages && "pointer-events-none opacity-20")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 overflow-hidden h-full">
          <Card className="h-full flex flex-col bg-card border-border overflow-hidden">
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-border bg-secondary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-none mb-1">{selectedTicket.customerName || "Cliente"}</h3>
                      <p className="text-xs text-muted-foreground">{selectedTicket.customerEmail || ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {selectedTicket.orderId && (
                      <Badge variant="outline" className="hidden sm:flex h-8 gap-2 bg-amber-500/5 border-amber-500/20 text-amber-500">
                        <Package className="w-3 h-3" />
                        <span className="font-mono text-[10px]">{selectedTicket.orderId}</span>
                      </Badge>
                    )}
                    <Select 
                      value={selectedTicket.status || "OPEN"} 
                      onValueChange={(v: TicketStatus) => handleStatusUpdate(selectedTicket.id, v)}
                    >
                      <SelectTrigger className={cn(
                        "h-9 w-[160px] font-bold text-xs",
                        selectedTicket.status === "OPEN" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        selectedTicket.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Aberto</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em Atendimento</SelectItem>
                        <SelectItem value="CLOSED">Resolvido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0a0a0a]/30">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="max-w-[85%] bg-secondary/50 border border-border/50 rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2 block">Abertura do Chamado</span>
                      {selectedTicket.images && selectedTicket.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                          {selectedTicket.images.map((img, i) => (
                            <img key={i} src={img} alt="Anexo" className="rounded-lg w-full aspect-square object-cover border border-white/5 cursor-pointer hover:scale-[1.02] transition-transform" />
                          ))}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.description || "Sem descrição"}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-2">{safeDateFormat(selectedTicket.createdAt)}</span>
                  </div>

                  {selectedTicket?.messages?.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col space-y-1", msg.senderRole === "CUSTOMER" ? "items-start" : "items-end")}>
                      <div className={cn(
                        "max-w-[85%] p-4 rounded-2xl shadow-sm",
                        msg.senderRole === "CUSTOMER" 
                          ? "bg-secondary/50 border border-border/50 rounded-tl-none" 
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      )}>
                        {msg.images && msg.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {msg.images.map((img, i) => (
                              <img key={i} src={img} alt="Anexo" className="rounded-lg w-full aspect-square object-cover border border-white/5" />
                            ))}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className={cn("text-[10px] text-muted-foreground", msg.senderRole === "CUSTOMER" ? "ml-2" : "mr-2")}>
                        {msg.senderName} • {safeDateFormat(msg.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== "CLOSED" && (
                  <div className="p-4 bg-card border-t border-border space-y-4">
                    {replyImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {replyImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        <Input 
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          placeholder="Digite sua resposta..."
                          className="h-12 pr-12 bg-background/50 border-border/50 focus:border-primary/50"
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                        />
                        <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                          <ImageIcon className="w-5 h-5" />
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
                        </label>
                      </div>
                      <Button 
                        onClick={handleReply}
                        disabled={(!replyContent && replyImages.length === 0) || isUploading}
                        className="h-12 px-6 font-bold"
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Enviar <ChevronRight className="w-4 h-4 ml-2" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-30">
                <MessageSquare className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-bold">Selecione um chamado</h3>
                <p className="text-sm">Escolha um ticket na lista ao lado para ver os detalhes.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
