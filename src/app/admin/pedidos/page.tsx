'use client';

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, ListChecks, Search, Filter, Package, User, CreditCard, Truck, ExternalLink, MapPin, FileText, Box, Home, Check, ChevronLeft } from "lucide-react";
import type { AdminOrderDetail, AdminOrderRow, AdminOrderStepKey } from "@premium/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { adminRepository } from "@/services/api/adminRepository";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const statusColor: Record<string, string> = {
  "Criado": "bg-zinc-800 text-zinc-400 border-zinc-700",
  "Pagamento confirmado": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Separação": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Pronto para envio": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Enviado": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "Saiu para entrega": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Entregue": "bg-emerald-500 text-white border-none"
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

  const loadOrders = async () => {
    try {
      const data = await adminRepository.listOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos.");
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
      const order = await adminRepository.getOrder(id);
      if (!order) return;
      setSelectedOrder(order);
      setModalOpen(true);
    } catch (error) {
      console.error("Erro ao abrir pedido:", error);
      toast.error("Erro ao abrir detalhes do pedido.");
    }
  };

  const refreshSelected = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await adminRepository.getOrder(selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
        await loadOrders();
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
    }
  };

  const nextStep = async () => {
    if (!selectedOrder) return;
    try {
      await adminRepository.advanceOrderStep(selectedOrder.id);
      toast.success("Status avançado com sucesso!");
      await refreshSelected();
    } catch (error) {
      console.error("Erro ao avançar status:", error);
      toast.error("Erro ao avançar status.");
    }
  };

  const setManualStep = async (step: AdminOrderStepKey) => {
    if (!selectedOrder) return;
    try {
      await adminRepository.setOrderStep(selectedOrder.id, step);
      toast.success("Status atualizado!");
      await refreshSelected();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) || 
                            order.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || order.statusLabel === statusFilter;
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
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ListChecks className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Pedidos</h1>
            <p className="text-sm text-muted-foreground">Gerencie o fluxo de entrega e status das vendas.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ID ou nome do cliente..." 
              className="pl-10 bg-secondary/50 border-border" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              {Object.keys(statusColor).map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="hidden lg:block bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[140px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Nenhum pedido encontrado.</TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="border-border hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background border-border font-normal">
                        {order.channel === "Loja" ? "🌐 Loja" : "🏷️ Externa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">{order.paymentGateway ?? "-"}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusColor[order.statusLabel])}>
                        {order.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="hover:bg-primary/20 hover:text-primary transition-all gap-2"
                        onClick={() => openOrder(order.id)}
                      >
                        Gerenciar <ChevronRight className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {paginatedOrders.map((order) => (
          <Card key={order.id} className="bg-card border-border active:scale-[0.98] transition-transform" onClick={() => openOrder(order.id)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</p>
                  <h3 className="font-bold text-lg">{order.customerName}</h3>
                </div>
                <Badge variant="outline" className={cn("text-[9px] uppercase font-bold", statusColor[order.statusLabel])}>
                  {order.statusLabel}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-xs truncate">{order.paymentGateway || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-xs">{order.channel}</span>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-primary font-bold">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80 text-xs gap-2">
                Abrir Gestão <ExternalLink className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent className="bg-card border border-border rounded-full px-2 py-1">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={cn("rounded-full h-8 w-8 p-0 cursor-pointer", page === 1 && "pointer-events-none opacity-20")}
                />
              </PaginationItem>
              <div className="px-4 text-xs font-medium text-muted-foreground">
                Página <span className="text-primary">{page}</span> de {totalPages}
              </div>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={cn("rounded-full h-8 w-8 p-0 cursor-pointer", page === totalPages && "pointer-events-none opacity-20")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] md:h-auto overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Pedido #{selectedOrder?.id.slice(-8).toUpperCase()}
              </Badge>
              {selectedOrder?.channel === "Venda externa" && (
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20">Venda Externa</Badge>
              )}
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold">Gestão do Pedido</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Gerencie as etapas e acompanhe os itens deste pedido.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <Tabs defaultValue="logistics" className="w-full">
              <div className="flex overflow-x-auto pb-1 mb-4 no-scrollbar">
                <TabsList className="bg-secondary border border-border w-full justify-start md:justify-center h-12 p-1 gap-1">
                  <TabsTrigger value="logistics" className="flex-1 md:flex-none gap-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-black font-bold transition-all">
                    <Truck className="w-4 h-4" /> Logística
                  </TabsTrigger>
                  <TabsTrigger value="customer" className="flex-1 md:flex-none gap-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-black font-bold transition-all">
                    <User className="w-4 h-4" /> Cliente
                  </TabsTrigger>
                  <TabsTrigger value="items" className="flex-1 md:flex-none gap-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-black font-bold transition-all">
                    <Package className="w-4 h-4" /> Itens
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="logistics" className="space-y-6 focus-visible:outline-none">
                <div className="bg-secondary/50 border border-border rounded-3xl p-6 md:p-8 overflow-x-auto no-scrollbar">
                  <div className="min-w-[700px] relative flex justify-between items-center px-4">
                    <div className="absolute top-[24px] left-0 w-full h-[2px] bg-border -translate-y-1/2 z-0 px-10" />
                    
                    {selectedOrder.steps
                      .sort((a, b) => {
                        const order = ["created", "paid", "in_separation", "ready_for_shipping", "shipped", "out_for_delivery", "delivered"];
                        return order.indexOf(a.key) - order.indexOf(b.key);
                      })
                      .map((step, idx, arr) => {
                        const isCompleted = step.completed;
                        const isActive = step.active;
                        const isNext = !step.completed && (idx === 0 || arr[idx - 1].completed);
                        
                        const icons: Record<string, any> = {
                          created: FileText,
                          paid: CreditCard,
                          in_separation: Box,
                          ready_for_shipping: CheckCircle2,
                          shipped: Truck,
                          out_for_delivery: MapPin,
                          delivered: Home
                        };
                        const StepIcon = icons[step.key] || Package;

                        const showLine = idx < arr.length - 1;
                        const lineCompleted = isCompleted && arr[idx + 1]?.completed;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-3">
                            {showLine && (
                              <div className={cn(
                                "absolute top-[24px] left-[50%] w-[100%] h-[2px] -translate-y-1/2 z-0",
                                lineCompleted || isCompleted && arr[idx + 1]?.active
                                  ? "bg-gradient-to-r from-primary to-orange-500" 
                                  : "bg-border"
                              )} style={{ width: `calc(100% * 1.5)` }} />
                            )}

                            <div 
                              className={cn(
                                "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative z-20",
                                isCompleted 
                                  ? "bg-gradient-to-br from-primary to-orange-500 border-none shadow-[0_0_20px_rgba(251,191,36,0.4)]" 
                                  : isActive
                                  ? "bg-background border-primary ring-4 ring-primary/20 scale-110"
                                  : isNext
                                  ? "bg-background border-blue-500 animate-pulse"
                                  : "bg-background border-border opacity-100"
                              )}
                              onClick={() => setManualStep(step.key as AdminOrderStepKey)}
                              role="button"
                            >
                              {isCompleted ? (
                                <Check className="w-6 h-6 text-black font-bold" />
                              ) : (
                                <StepIcon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                              )}
                            </div>

                            <div className="text-center h-12 flex flex-col items-center justify-start">
                              <p className={cn(
                                "text-[9px] font-black uppercase tracking-tighter w-20 leading-[1.1]",
                                isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {step.label}
                              </p>
                              {isActive && (
                                <div className="mt-1">
                                  <Badge className="bg-primary text-black text-[7px] h-3.5 px-1 font-black animate-bounce">ATUAL</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 border border-border rounded-3xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Endereço de Entrega
                    </h3>
                    {selectedOrder.shippingAddress ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Rua e Número</p>
                            <p className="text-sm font-medium">{(selectedOrder.shippingAddress as any).street}, {(selectedOrder.shippingAddress as any).number}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Bairro</p>
                            <p className="text-sm font-medium">{(selectedOrder.shippingAddress as any).neighborhood}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Cidade/Estado</p>
                            <p className="text-sm font-medium">{(selectedOrder.shippingAddress as any).city} - {(selectedOrder.shippingAddress as any).state}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">CEP</p>
                            <p className="text-sm font-medium">{(selectedOrder.shippingAddress as any).zipCode}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center border border-dashed border-border rounded-2xl">
                        <p className="text-sm text-muted-foreground">Dados de endereço não disponíveis.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-4 bg-secondary/30 border border-border rounded-3xl p-6">
                    <div className="text-center space-y-2 mb-4">
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Status Atual</p>
                       <h4 className="text-2xl font-black text-primary uppercase">{selectedOrder.statusLabel}</h4>
                    </div>
                    
                    <Button 
                      className="w-full gap-2 bg-gradient-to-r from-primary to-orange-500 text-black font-black hover:opacity-90 h-16 rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all active:scale-95 text-lg" 
                      onClick={nextStep}
                    >
                      {selectedOrder.currentStep === "delivered" ? "Pedido Concluído" : "Avançar para Próxima Etapa"} <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4 focus-visible:outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl"><User className="w-6 h-6 text-blue-500" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Cliente</p>
                      <p className="font-bold text-base">{selectedOrder.customerName}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 flex items-center gap-4 text-emerald-500">
                    <div className="p-3 bg-emerald-500/10 rounded-xl"><CreditCard className="w-6 h-6" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Pagamento</p>
                      <p className="font-bold text-base">{selectedOrder.paymentGateway || "Pendente"}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4 focus-visible:outline-none">
                <div className="bg-secondary/30 border border-border rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Produtos no Pedido</h3>
                    <Badge className="bg-emerald-500 text-black font-bold">
                      {selectedOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={`${item.productName}-${index}`} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-border transition-colors">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{item.productName}</span>
                            <span className="text-[11px] text-muted-foreground">Qtd: <span className="text-foreground font-bold">{item.quantity}</span></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-primary">
                            {item.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                          <p className="text-[10px] text-muted-foreground">unitário</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Carregando detalhes...</p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 pt-4 border-t border-border flex flex-row items-center justify-end gap-2">
            <Button variant="ghost" className="hover:bg-secondary text-muted-foreground" onClick={() => setModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando painel de pedidos...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
