'use client';

import { useEffect, useState } from "react";
import { Plus, Search, Ticket, MoreHorizontal, Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { AdminCoupon, AdminCouponInput } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyForm: AdminCouponInput = {
  code: "",
  type: "percentage",
  value: 0,
  minPurchase: 0,
  maxDiscount: 0,
  usageLimit: 0,
  commissionPercent: 0,
  active: true,
  expiryDate: ""
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdminCouponInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [selectedCouponOrders, setSelectedCouponOrders] = useState<AdminCoupon | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminRepository.listCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((cp) =>
    cp.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon: AdminCoupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      commissionPercent: coupon.commissionPercent || 0,
      active: coupon.active,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : ""
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const cleanCode = form.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      toast.error("O código do cupom é obrigatório e deve conter apenas letras, números e traço.");
      return;
    }

    const numValue = Number(String(form.value).replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("Informe um valor de desconto válido maior que zero.");
      return;
    }

    if (form.type === "percentage" && numValue > 100) {
      toast.error("O desconto percentual não pode ser maior que 100%.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        code: cleanCode,
        value: numValue,
        minPurchase: form.minPurchase ? Math.max(0, Number(String(form.minPurchase).replace(',', '.')) || 0) : undefined,
        maxDiscount: form.maxDiscount ? Math.max(0, Number(String(form.maxDiscount).replace(',', '.')) || 0) : undefined,
        usageLimit: form.usageLimit ? Math.max(0, parseInt(String(form.usageLimit), 10) || 0) : undefined,
        commissionPercent: form.commissionPercent ? Math.min(100, Math.max(0, Number(String(form.commissionPercent).replace(',', '.')) || 0)) : undefined
      };

      if (editingId) {
        await adminRepository.updateCoupon(editingId, payload);
        toast.success("Cupom atualizado com sucesso!");
      } else {
        await adminRepository.createCoupon(payload);
        toast.success("Cupom criado com sucesso!");
      }
      setModalOpen(false);
      loadCoupons();
    } catch (error) {
      toast.error("Erro ao salvar cupom");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Excluir Cupom?",
      text: "Este cupom não poderá mais ser utilizado por nenhum cliente no checkout.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      background: "#090a0f",
      color: "#f4f4f5"
    });

    if (result.isConfirmed) {
      try {
        await adminRepository.deleteCoupon(id);
        loadCoupons();
        Swal.fire({
          title: "Excluído!",
          text: "O cupom foi removido com sucesso.",
          icon: "success",
          background: "#090a0f",
          color: "#f4f4f5"
        });
      } catch (error) {
        toast.error("Erro ao excluir cupom");
      }
    }
  };

  const formatValue = (coupon: AdminCoupon) => {
    if (coupon.type === "percentage") return `${coupon.value}%`;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(coupon.value);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Cupons de Desconto</h1>
            <p className="text-xs text-zinc-400">Crie campanhas promocionais, cupons de primeira compra e parcerias.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar código..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400 uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 rounded-lg shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Cupom
          </Button>
        </div>
      </div>

      {/* Tabela de Cupons */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Cupons Ativos & Inativos</span>
          </div>
          <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-normal">
            {filteredCoupons.length} {filteredCoupons.length === 1 ? "cupom" : "cupons"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/80">
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="pl-6 w-[200px] text-[11px] uppercase font-bold text-zinc-400 py-3.5">Código</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Desconto</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Usos</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Validade</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-right pr-6 w-[90px] text-[11px] uppercase font-bold text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando cupons...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-400 text-xs">
                    Nenhum cupom encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCoupons.map((coupon) => (
                  <TableRow key={coupon.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                    <TableCell className="pl-6 font-mono font-bold text-xs text-amber-400">
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-100">{formatValue(coupon)}</span>
                        <span className="text-[10px] block text-zinc-400">
                          {coupon.type === "percentage" ? "Percentual" : "Valor Fixo"}
                          {coupon.minPurchase ? ` • Mín: R$ ${coupon.minPurchase}` : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-zinc-300">
                          {coupon.usageCount} / {coupon.usageLimit || "∞"}
                        </span>
                        <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{
                              width: coupon.usageLimit
                                ? `${Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)}%`
                                : "0%"
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {coupon.expiryDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{new Date(coupon.expiryDate).toLocaleDateString("pt-BR")}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">Sem expiração</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                          coupon.active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        )}
                      >
                        {coupon.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(coupon)}
                            className="gap-2 cursor-pointer text-xs focus:bg-zinc-800 focus:text-amber-400"
                          >
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCouponOrders(coupon);
                              setOrdersModalOpen(true);
                            }}
                            className="gap-2 cursor-pointer text-xs focus:bg-zinc-800 focus:text-amber-400"
                          >
                            <Search className="w-3.5 h-3.5" /> Ver Pedidos
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(coupon.id)}
                            className="gap-2 text-rose-400 cursor-pointer text-xs focus:bg-rose-500/10 focus:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Modal Criar / Editar Cupom */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">
              {editingId ? "Editar Cupom" : "Novo Cupom Promocional"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure o percentual ou valor de desconto e limites de uso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Código do Cupom</Label>
              <Input
                placeholder="Ex: PRIMEIRACOMPRA"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 uppercase font-mono font-bold text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Tipo de Desconto</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Valor</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Compra Mínima (R$)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.minPurchase}
                  onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Limite de Usos</Label>
                <Input
                  type="number"
                  placeholder="Ilimitado"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Data de Expiração</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Comissão de Afiliado (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.commissionPercent}
                  onChange={(e) => setForm({ ...form, commissionPercent: Number(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-zinc-200">Cupom Ativo</Label>
                <p className="text-[11px] text-zinc-400">Permitir aplicação no carrinho e checkout</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              disabled={isSaving}
              className="text-zinc-400 hover:text-zinc-200 text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 gap-1.5 rounded-lg transition-colors"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isSaving ? "Salvando..." : "Salvar Cupom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pedidos com o Cupom */}
      <Dialog open={ordersModalOpen} onOpenChange={setOrdersModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">
              Pedidos com o Cupom <span className="font-mono text-amber-400">{selectedCouponOrders?.code}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Histórico de pedidos que utilizaram este código promocional.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto my-3">
            {selectedCouponOrders?.orders && selectedCouponOrders.orders.length > 0 ? (
              <Table>
                <TableHeader className="bg-zinc-950/60 border-b border-zinc-800/80">
                  <TableRow className="border-zinc-800/80">
                    <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Pedido</TableHead>
                    <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Cliente</TableHead>
                    <TableHead className="text-right text-[11px] uppercase font-bold text-zinc-400">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCouponOrders.orders.map((order) => (
                    <TableRow key={order.id} className="border-b border-zinc-800/40">
                      <TableCell className="font-mono text-xs text-zinc-300">{order.orderCode}</TableCell>
                      <TableCell className="text-xs text-zinc-200">{order.customerName}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-amber-400">
                        {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl">
                Nenhum pedido utilizou este cupom ainda.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200 text-xs h-9"
              onClick={() => setOrdersModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
