'use client';

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ListChecks,
  Search,
  Filter,
  Package,
  User,
  CreditCard,
  Truck,
  ExternalLink,
  MapPin,
  FileText,
  Box,
  Home,
  Check,
  Smartphone,
  MessagesSquare,
  Mail
} from "lucide-react";
import type { AdminOrderDetail, AdminOrderRow, AdminOrderStepKey } from "@premium/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { adminRepository } from "@/services/api/adminRepository";
import { cn, maskDocument, maskPhone, maskCEP } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusColor: Record<string, string> = {
  "Criado": "bg-zinc-800/80 text-zinc-300 border-zinc-700/80",
  "Aguardando Pagamento": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "Pagamento confirmado": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Separação": "bg-sky-500/10 text-sky-400 border-sky-500/30",
  "Pronto para Envio": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Enviado": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  "Saiu para entrega": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "Entregue": "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
};

const translatePaymentMethod = (method: string) => {
  const map: Record<string, string> = {
    CREDIT_CARD: "Cartão de Crédito",
    PIX: "Pix",
    TICKET: "Boleto",
    BOLETO: "Boleto",
  };
  return map[method] || method;
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get("id");

  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingCodeInput, setTrackingCodeInput] = useState("");

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminRepository.listOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (orderIdFromQuery) {
      openOrder(orderIdFromQuery);
    }
  }, [orderIdFromQuery]);

  const openOrder = async (id: string) => {
    try {
      setLoadingOrderId(id);
      const order = await adminRepository.getOrder(id);
      if (!order) return;
      setSelectedOrder(order);
      setTrackingCodeInput(order.trackingCode || "");
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao abrir pedido:", error);
      toast.error("Erro ao abrir detalhes do pedido.");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const nextStep = async () => {
    if (!selectedOrder || isUpdating) return;
    try {
      setIsUpdating(true);
      const updated = await adminRepository.advanceOrderStep(selectedOrder.id);
      setSelectedOrder(updated);
      toast.success("Status avançado com sucesso!");
      loadOrders(true);
    } catch (error) {
      console.error("Erro ao avançar status:", error);
      toast.error("Erro ao avançar status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const saveTrackingCode = async () => {
    if (!selectedOrder || isUpdating) return;
    try {
      setIsUpdating(true);
      const updated = await adminRepository.updateTrackingCode(selectedOrder.id, trackingCodeInput);
      setSelectedOrder(updated);
      toast.success("Código de rastreio salvo!");
      loadOrders(true);
    } catch (error) {
      console.error("Erro ao salvar rastreio:", error);
      toast.error("Erro ao salvar rastreio.");
    } finally {
      setIsUpdating(false);
    }
  };

  const setManualStep = async (step: AdminOrderStepKey) => {
    if (!selectedOrder || isUpdating) return;
    try {
      setIsUpdating(true);
      const updated = await adminRepository.setOrderStep(selectedOrder.id, step);
      setSelectedOrder(updated);
      toast.success("Status atualizado!");
      loadOrders(true);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || order.statusLabel.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredOrders, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Gestão de Pedidos</h1>
            <p className="text-xs text-zinc-400">Acompanhe vendas, despachos e status logísticos em tempo real.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="ID ou nome do cliente..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-9 rounded-lg">
              <Filter className="w-3.5 h-3.5 mr-2 text-zinc-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
              <SelectItem value="ALL">Todos os status</SelectItem>
              {Object.keys(statusColor).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-950/60 border-b border-zinc-800/80">
            <TableRow className="hover:bg-transparent border-zinc-800/80">
              <TableHead className="w-[130px] text-[11px] uppercase font-bold text-zinc-400 py-3.5 pl-5">Pedido</TableHead>
              <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Cliente</TableHead>
              <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Pagamento</TableHead>
              <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Envio</TableHead>
              <TableHead className="text-right text-[11px] uppercase font-bold text-zinc-400">Total</TableHead>
              <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Status</TableHead>
              <TableHead className="text-right w-[90px] text-[11px] uppercase font-bold text-zinc-400 pr-5">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando pedidos...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center py-10 text-zinc-400 text-xs">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => {
                  const initials = order.customerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <motion.tr
                      key={order.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-b border-zinc-800/40 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                      onClick={() => openOrder(order.id)}
                    >
                      <TableCell className="font-mono text-xs pl-5 font-semibold text-zinc-300">
                        #{order.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 text-[10px] font-bold text-amber-400">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-xs text-zinc-200 group-hover:text-amber-400 transition-colors">
                              {order.customerName}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="text-xs text-zinc-300 block">
                            {order.paymentGateway ? translatePaymentMethod(order.paymentGateway) : "-"}
                          </span>
                          {order.paidAt ? (
                            <span className="text-[10px] text-emerald-400 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-medium">Pendente</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{order.shippingProvider || "Retirada"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-zinc-100">
                        {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-semibold px-2.5 py-0.5 rounded-full", statusColor[order.statusLabel] || "bg-zinc-800 text-zinc-300 border-zinc-700")}
                        >
                          {order.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex justify-end items-center">
                          {loadingOrderId === order.id ? (
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 lg:hidden">
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-xs">Carregando pedidos...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-zinc-400 text-xs">
            Nenhum pedido encontrado.
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const initials = order.customerName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return (
              <Card
                key={order.id}
                className="bg-zinc-900/60 border-zinc-800 active:scale-[0.99] transition-transform cursor-pointer"
                onClick={() => openOrder(order.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-[10px] font-bold text-amber-400">
                        {initials}
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-zinc-400">#{order.id.slice(-6).toUpperCase()}</p>
                        <h3 className="font-medium text-xs text-zinc-200">{order.customerName}</h3>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full", statusColor[order.statusLabel])}
                    >
                      {order.statusLabel}
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      {order.paymentGateway ? translatePaymentMethod(order.paymentGateway) : "-"}
                    </span>
                    <span className="font-bold text-zinc-100">
                      {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200 text-xs h-8 gap-1.5"
                  >
                    Ver detalhes <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent className="bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn("rounded-full h-7 w-7 p-0 cursor-pointer text-zinc-300 hover:bg-zinc-800", page === 1 && "pointer-events-none opacity-30")}
                />
              </PaginationItem>
              <span className="text-xs text-zinc-400 px-3 font-medium">
                Página {page} de {totalPages}
              </span>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn("rounded-full h-7 w-7 p-0 cursor-pointer text-zinc-300 hover:bg-zinc-800", page === totalPages && "pointer-events-none opacity-30")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[92vh] overflow-y-auto bg-[#0c0d12] border-zinc-800 text-zinc-100 p-4 md:p-6 rounded-2xl">
          <DialogHeader className="pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5 mb-1.5">
              <Badge variant="outline" className="bg-amber-400/10 text-amber-400 border-amber-400/30 text-xs font-mono font-bold">
                Pedido #{selectedOrder?.id.slice(-8).toUpperCase()}
              </Badge>
              {selectedOrder?.channel === "Venda externa" && (
                <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs">Venda Externa</Badge>
              )}
            </div>
            <DialogTitle className="text-lg md:text-xl font-bold text-zinc-100">Gestão do Pedido</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Acompanhe as etapas de separação, envio e detalhes do comprador.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-6 mt-4">
              {/* Informações Gerais */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Informações Gerais
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">Data do Pedido</p>
                    <p className="font-medium text-zinc-200">{new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  {selectedOrder.paidAt && (
                    <div>
                      <p className="text-[10px] text-emerald-400 uppercase font-semibold mb-0.5">Pago em</p>
                      <p className="font-medium text-emerald-400">{new Date(selectedOrder.paidAt).toLocaleString('pt-BR')}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">Canal de Venda</p>
                    <p className="font-medium text-zinc-200">{selectedOrder.channel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">Forma de Pagamento</p>
                    <p className="font-medium text-zinc-200">{selectedOrder.paymentMethod ? translatePaymentMethod(selectedOrder.paymentMethod) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">Parcelas</p>
                    <p className="font-medium text-zinc-200">{selectedOrder.installments}x</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">Transportadora</p>
                    <p className="font-medium text-zinc-200">
                      {selectedOrder.shippingProvider || "-"}
                      {selectedOrder.shippingMethod && (
                        <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 border-zinc-700 text-zinc-400">
                          {selectedOrder.shippingMethod}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" /> Dados do Comprador
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-amber-400 text-base shrink-0">
                    {selectedOrder.customerName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">{selectedOrder.customerName}</h4>
                        {selectedOrder.customerDocument && (
                          <span className="text-xs font-mono text-zinc-400">
                            CPF: {maskDocument(selectedOrder.customerDocument)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate text-zinc-300">{selectedOrder.customerEmail || "Sem email"}</span>
                        </div>
                        {selectedOrder.customerEmail && (
                          <a href={`mailto:${selectedOrder.customerEmail}`} className="p-1 text-zinc-400 hover:text-amber-400 transition-colors" title="Enviar e-mail">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate text-zinc-300">{maskPhone(selectedOrder.customerPhone) || "Sem telefone"}</span>
                        </div>
                        {selectedOrder.customerPhone && (
                          <a
                            href={`https://wa.me/55${selectedOrder.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold text-[11px]"
                            title="Abrir WhatsApp"
                          >
                            <MessagesSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stepper de Logística */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5 overflow-x-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" /> Fluxo de Atendimento
                </h3>
                <div className="min-w-[650px] relative flex justify-between items-center px-4 pb-2">
                  <div className="absolute top-[20px] left-0 w-full h-[2px] bg-zinc-800 -translate-y-1/2 z-0 px-8" />
                  {selectedOrder.steps
                    .sort((a, b) => {
                      const orderKeys = ["created", "waiting_payment", "paid", "in_separation", "ready_for_shipping", "shipped", "out_for_delivery", "delivered"];
                      return orderKeys.indexOf(a.key) - orderKeys.indexOf(b.key);
                    })
                    .map((step, idx, arr) => {
                      const isCompleted = step.completed;
                      const isActive = step.active;
                      const icons: Record<string, any> = {
                        created: FileText,
                        waiting_payment: FileText,
                        paid: CreditCard,
                        in_separation: Box,
                        ready_for_shipping: CheckCircle2,
                        shipped: Truck,
                        out_for_delivery: MapPin,
                        delivered: Home
                      };
                      const StepIcon = icons[step.key] || Package;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                          <div
                            onClick={() => !isUpdating && setManualStep(step.key as AdminOrderStepKey)}
                            role="button"
                            className={cn(
                              "w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer",
                              isCompleted
                                ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-sm"
                                : isActive
                                ? "bg-amber-400 border-amber-300 text-zinc-950 ring-4 ring-amber-400/20 font-bold scale-105"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            {isUpdating && isActive ? (
                              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            ) : isCompleted ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <StepIcon className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[9px] font-semibold uppercase tracking-tight text-center max-w-[70px] leading-tight",
                              isActive ? "text-amber-400" : isCompleted ? "text-zinc-300" : "text-zinc-400"
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Endereço & Ações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Endereço */}
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" /> Endereço de Entrega
                  </h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="space-y-2 text-xs text-zinc-300">
                      <p>
                        <span className="text-zinc-400">Logradouro: </span>
                        {(selectedOrder.shippingAddress as any).street}, {(selectedOrder.shippingAddress as any).number}
                      </p>
                      <p>
                        <span className="text-zinc-400">Bairro: </span>
                        {(selectedOrder.shippingAddress as any).neighborhood}
                      </p>
                      <p>
                        <span className="text-zinc-400">Cidade/UF: </span>
                        {(selectedOrder.shippingAddress as any).city} - {(selectedOrder.shippingAddress as any).state}
                      </p>
                      <p>
                        <span className="text-zinc-400">CEP: </span>
                        <span className="font-mono">{maskCEP((selectedOrder.shippingAddress as any).zipCode)}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">Dados de endereço não disponíveis.</p>
                  )}
                </div>

                {/* Avançar status & Rastreio */}
                <div className="space-y-4">
                  <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-semibold">Status Atual</p>
                      <h4 className="text-base font-bold text-amber-400">{selectedOrder.statusLabel}</h4>
                    </div>
                    <Button
                      onClick={nextStep}
                      disabled={isUpdating || selectedOrder.currentStep === "delivered"}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{selectedOrder.currentStep === "delivered" ? "Pedido Concluído" : "Avançar para Próxima Etapa"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">Código de Rastreio</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: BR123456789BR"
                        value={trackingCodeInput}
                        onChange={(e) => setTrackingCodeInput(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 uppercase font-mono text-xs h-9"
                      />
                      <Button
                        onClick={saveTrackingCode}
                        disabled={isUpdating || trackingCodeInput === (selectedOrder.trackingCode || "")}
                        size="sm"
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs h-9 shrink-0"
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Produtos do Pedido */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Itens Comprados</h3>
                  <span className="text-xs font-semibold text-zinc-200">
                    {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.productName}-${index}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{item.productName}</p>
                          <p className="text-[11px] text-zinc-400">Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-amber-400">
                          {item.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-[10px] text-zinc-400">unidade</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo Financeiro */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>{(selectedOrder.subtotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Frete</span>
                    <span>{(selectedOrder.shippingCost || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  {selectedOrder.discountValue ? (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Desconto ({selectedOrder.couponCode || "Cupom"})</span>
                      <span>-{(selectedOrder.discountValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm font-bold text-zinc-100 pt-2 border-t border-zinc-800/80">
                    <span>Total do Pedido</span>
                    <span className="text-amber-400">{selectedOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <DialogFooter className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200 text-xs h-9"
              onClick={() => setModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400 text-xs">Carregando pedidos...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
