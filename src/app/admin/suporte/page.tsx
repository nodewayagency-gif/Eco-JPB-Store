'use client';

import { useEffect, useState, useRef } from "react";
import {
  Search,
  MessageSquare,
  User,
  Image as ImageIcon,
  X,
  Package,
  ChevronRight,
  ChevronLeft,
  Filter,
  Send,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
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
  PaginationLink,
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
  const [replyImages, setReplyImages] = useState<{ file: File; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedTicket) {
      scrollToBottom();
    }
  }, [selectedTicket?.messages, selectedTicket?.id]);

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
      loadTickets(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  const loadTickets = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminRepository.listTickets();
      if (Array.isArray(data)) {
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t) => t.id === selectedTicket.id);
          if (updated) {
            setSelectedTicket((prev) => {
              if (!prev) return updated;
              const messages =
                updated.messages && updated.messages.length > 0
                  ? updated.messages
                  : prev.messages;
              return { ...prev, ...updated, messages };
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar chamados:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: TicketStatus) => {
    try {
      const updated = await adminRepository.updateTicketStatus(id, status);
      toast.success("Status atualizado!");

      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));

      if (selectedTicket?.id === id) {
        setSelectedTicket((prev) => (prev ? { ...prev, ...updated } : updated));
      }
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setReplyImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setReplyImages((prev) => {
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
          const {
            data: { publicUrl }
          } = supabase.storage.from('jpb_tickets').getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      await adminRepository.replyTicket(selectedTicket.id, {
        content: replyContent,
        images: imageUrls
      });

      if (selectedTicket.status === "OPEN") {
        await adminRepository.updateTicketStatus(selectedTicket.id, "IN_PROGRESS");
      }

      setReplyContent("");
      setReplyImages([]);
      await loadTickets();
      toast.success("Resposta enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar resposta");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      (t.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.id || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col space-y-4 pb-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Central de Atendimento</h1>
            <p className="text-xs text-zinc-400">Atenda dúvidas, solicitações e suporte pós-venda dos clientes.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar chamado ou cliente..."
              className="pl-9 h-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs rounded-lg focus:ring-1 focus:ring-amber-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px] h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-xs rounded-lg">
              <Filter className="w-3.5 h-3.5 mr-2 text-zinc-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="OPEN">Novo</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Atendimento</SelectItem>
              <SelectItem value="CLOSED">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left: Ticket List */}
        <div className={cn("lg:col-span-4 flex-col space-y-3 overflow-hidden h-full", selectedTicket ? "hidden lg:flex" : "flex")}>
          <div className="flex-1 flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-950/60 flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Fila de Chamados</span>
              <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-normal">
                {filteredTickets.length}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-zinc-400 text-xs">Carregando chamados...</p>
                  </div>
                ) : paginatedTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-xs">Nenhum chamado pendente</p>
                  </div>
                ) : (
                  paginatedTickets.map((ticket, idx) => (
                    <motion.button
                      key={ticket.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group",
                        selectedTicket?.id === ticket.id
                          ? "bg-amber-400/10 border-amber-400/40 text-zinc-100 shadow-sm"
                          : "bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-800/40 text-zinc-300"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <h4
                          className={cn(
                            "font-semibold text-xs truncate flex-1",
                            selectedTicket?.id === ticket.id ? "text-amber-400 font-bold" : "text-zinc-200"
                          )}
                        >
                          {ticket.subject || "Sem Assunto"}
                        </h4>
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 mt-1",
                            ticket.status === "OPEN"
                              ? "bg-rose-500 animate-pulse"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-2">
                        <User className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{ticket.customerName || "Desconhecido"}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50 text-[10px]">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-semibold px-2 py-0 border-none rounded-full",
                            ticket.status === "OPEN"
                              ? "bg-rose-500/15 text-rose-400"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          )}
                        >
                          {ticket.status === "OPEN" ? "Novo" : ticket.status === "IN_PROGRESS" ? "Em Atend." : "Finalizado"}
                        </Badge>
                        <span className="font-mono text-zinc-400">#{ticket.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </motion.button>
                  ))
                )}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/60 flex justify-center">
                <Pagination>
                  <PaginationContent className="scale-90">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={cn("h-7 w-7 p-0 cursor-pointer text-zinc-300", page === 1 && "pointer-events-none opacity-30")}
                      />
                    </PaginationItem>
                    <span className="text-[11px] text-zinc-400 px-2 font-medium">
                      {page} / {totalPages}
                    </span>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={cn("h-7 w-7 p-0 cursor-pointer text-zinc-300", page === totalPages && "pointer-events-none opacity-30")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Right: Ticket Conversation Panel */}
        <div className={cn("lg:col-span-8 overflow-hidden h-full flex flex-col", selectedTicket ? "flex" : "hidden lg:flex")}>
          <div className="h-full flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
            {selectedTicket ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 px-4 border-b border-zinc-800/80 bg-zinc-950/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden shrink-0 -ml-2 text-zinc-400 hover:text-zinc-200"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs">
                      {selectedTicket.customerName?.substring(0, 2).toUpperCase() || "CL"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs text-zinc-100 truncate">{selectedTicket.customerName || "Cliente"}</h3>
                      <p className="text-[11px] text-zinc-400 truncate">{selectedTicket.customerEmail || ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedTicket.orderId && (
                      <Badge variant="outline" className="h-7 text-[10px] gap-1.5 bg-zinc-900 border-zinc-700 text-zinc-300 font-mono">
                        <Package className="w-3 h-3 text-amber-400" />
                        <span>Pedido #{selectedTicket.orderId.slice(-6).toUpperCase()}</span>
                      </Badge>
                    )}
                    <Select
                      value={selectedTicket.status || "OPEN"}
                      onValueChange={(v: TicketStatus) => handleStatusUpdate(selectedTicket.id, v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 w-[150px] font-semibold text-xs rounded-lg border",
                          selectedTicket.status === "OPEN"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : selectedTicket.status === "IN_PROGRESS"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                        <SelectItem value="OPEN">Novo</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em Atendimento</SelectItem>
                        <SelectItem value="CLOSED">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0b10]/60">
                  {/* First message / Ticket description */}
                  <div className="flex flex-col items-start space-y-1">
                    <div className="max-w-[85%] bg-zinc-900 border border-zinc-800/80 rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {selectedTicket.subject || "Chamado"}
                        </span>
                      </div>
                      {selectedTicket.images && selectedTicket.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {selectedTicket.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Anexo"
                              className="rounded-lg w-full aspect-square object-cover border border-zinc-700/50 cursor-pointer hover:opacity-90"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap">{selectedTicket.description || "Sem descrição informada."}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 ml-2">{safeDateFormat(selectedTicket.createdAt)}</span>
                  </div>

                  {/* Reply messages */}
                  <AnimatePresence initial={false}>
                    {selectedTicket?.messages?.map((msg, mIdx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: mIdx * 0.03 }}
                        className={cn("flex flex-col space-y-1", msg.senderRole === "CUSTOMER" ? "items-start" : "items-end")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed",
                            msg.senderRole === "CUSTOMER"
                              ? "bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-tl-none"
                              : "bg-amber-400 text-zinc-950 font-medium rounded-tr-none shadow-sm"
                          )}
                        >
                          {msg.images && msg.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {msg.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="Anexo"
                                  className="rounded-lg w-full aspect-square object-cover border border-black/10 cursor-pointer"
                                  onClick={() => window.open(img, '_blank')}
                                />
                              ))}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className={cn("text-[10px] text-zinc-400", msg.senderRole === "CUSTOMER" ? "ml-2" : "mr-2")}>
                          {msg.senderName} • {safeDateFormat(msg.createdAt)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input Bar */}
                {selectedTicket.status !== "CLOSED" ? (
                  <div className="p-3 bg-zinc-950/80 border-t border-zinc-800/80 space-y-2 shrink-0">
                    {replyImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pb-1">
                        {replyImages.map((img, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 group">
                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-90 hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 items-center">
                      <div className="flex-1 relative">
                        <Input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Digite a resposta ao cliente..."
                          className="h-10 pr-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs rounded-xl focus:ring-1 focus:ring-amber-400"
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                        />
                        <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-amber-400 transition-colors">
                          <ImageIcon className="w-4 h-4" />
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
                        </label>
                      </div>
                      <Button
                        onClick={handleReply}
                        disabled={(!replyContent && replyImages.length === 0) || isUploading}
                        className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl gap-1.5 transition-colors shrink-0"
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Responder</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-center text-xs text-zinc-400">
                    Este chamado foi finalizado. Altere o status acima para reabri-lo.
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <h3 className="text-sm font-semibold text-zinc-300">Nenhum chamado em foco</h3>
                <p className="text-xs text-zinc-400 mt-1">Selecione uma solicitação na lista à esquerda para conversar com o comprador.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
