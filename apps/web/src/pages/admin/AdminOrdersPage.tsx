import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ListChecks, Search, Filter } from "lucide-react";
import type { AdminOrderDetail, AdminOrderRow, AdminOrderStepKey } from "@premium/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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

const stepLabels: Record<AdminOrderStepKey, string> = {
  created: "Pedido criado",
  payment_confirmed: "Pagamento confirmado",
  in_separation: "Em separação",
  ready_to_ship: "Pronto para envio",
  shipped: "Enviado",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue"
};

const statusColor: Record<AdminOrderRow["statusLabel"], string> = {
  Criado: "bg-muted text-muted-foreground border-border",
  "Pagamento confirmado": "bg-primary/15 text-primary border-primary/40",
  "Separação": "bg-amber-500/15 text-amber-500 border-amber-500/40",
  "Pronto para envio": "bg-blue-500/15 text-blue-500 border-blue-500/40",
  Enviado: "bg-cyan-500/15 text-cyan-500 border-cyan-500/40",
  "Saiu para entrega": "bg-violet-500/15 text-violet-500 border-violet-500/40",
  Entregue: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const loadOrders = async () => {
    setOrders(await adminRepository.listOrders());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrder = async (id: string) => {
    const order = await adminRepository.getOrder(id);
    if (!order) return;
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const refreshSelected = async () => {
    if (!selectedOrder) return;
    const updated = await adminRepository.getOrder(selectedOrder.id);
    if (updated) {
      setSelectedOrder(updated);
      await loadOrders();
    }
  };

  const nextStep = async () => {
    if (!selectedOrder) return;
    await adminRepository.advanceOrderStep(selectedOrder.id);
    await refreshSelected();
  };

  const setManualStep = async (step: AdminOrderStepKey) => {
    if (!selectedOrder) return;
    await adminRepository.setOrderStep(selectedOrder.id, step);
    await refreshSelected();
  };

  const isExternal = useMemo(() => selectedOrder?.channel === "Venda externa", [selectedOrder]);

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

  // Reset page when filters change
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
              placeholder="Buscar pedido ou cliente..." 
              className="pl-9 bg-card" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
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

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Gestão de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Envio</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>{order.paymentGateway ?? "-"}</TableCell>
                  <TableCell>{order.shippingProvider ?? "-"}</TableCell>
                  <TableCell className="text-right font-medium">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[order.statusLabel]}>{order.statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openOrder(order.id)}>
                      Abrir gestão
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Pedido {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {isExternal
                ? "Venda externa detectada: você pode avançar o pedido manualmente por etapa."
                : "Acompanhe o fluxo e ajuste etapas quando necessário."}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{selectedOrder.customerName}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Canal</p><p className="font-medium">{selectedOrder.channel}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="font-medium">{selectedOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Etapas do pedido</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {selectedOrder.steps.map((step) => (
                    <div key={step.key} className="rounded-md border border-border p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.updatedAt ? `Atualizado em ${step.updatedAt}` : "Sem atualização"} - origem: {step.source}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.completed ? <Badge variant="outline" className="text-emerald-500 border-emerald-500/40">Concluída</Badge> : null}
                        {step.active ? <Badge variant="outline" className="text-primary border-primary/40">Atual</Badge> : null}
                        <Button size="sm" variant="secondary" onClick={() => setManualStep(step.key)}>Definir etapa</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Itens</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <li key={`${item.productName}-${index}`} className="text-sm flex items-center justify-between border-b border-border pb-2">
                        <span>{item.productName} x{item.quantity}</span>
                        <span>{item.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Fechar</Button>
            <Button className="gap-2" onClick={nextStep}>
              <CheckCircle2 className="w-4 h-4" /> Avançar etapa
              <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;
