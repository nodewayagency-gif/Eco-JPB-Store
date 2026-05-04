import { useEffect, useState } from "react";
import { Plus, Search, Ticket, MoreHorizontal, Edit, Trash2, Calendar, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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

const emptyForm: AdminCouponInput = {
  code: "",
  type: "percentage",
  value: 0,
  minPurchase: 0,
  maxDiscount: 0,
  usageLimit: 0,
  active: true,
  expiryDate: ""
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdminCouponInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
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
      active: coupon.active,
      expiryDate: coupon.expiryDate || ""
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error("O código do cupom é obrigatório");
      return;
    }

    try {
      const payload = {
          ...form,
          value: Number(form.value),
          minPurchase: Number(form.minPurchase) || undefined,
          maxDiscount: Number(form.maxDiscount) || undefined,
          usageLimit: Number(form.usageLimit) || undefined,
      };

      if (editingId) {
        await adminRepository.updateCoupon(editingId, payload);
        toast.success("Cupom atualizado com sucesso");
      } else {
        await adminRepository.createCoupon(payload);
        toast.success("Cupom criado com sucesso");
      }
      setModalOpen(false);
      loadCoupons();
    } catch (error) {
      toast.error("Erro ao salvar cupom");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cupom?")) {
      try {
        await adminRepository.deleteCoupon(id);
        loadCoupons();
        toast.success("Cupom excluído com sucesso");
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar código..."
              className="pl-9 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 bg-primary hover:bg-primary/90 shrink-0">
          <Plus className="w-4 h-4" /> Novo Cupom
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-6 pt-6 text-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Cupons de Desconto
            </CardTitle>
            <Badge variant="outline" className="border-border text-xs font-normal">
              {filteredCoupons.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent text-muted-foreground">
                  <TableHead className="pl-6">Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead className="text-center">Uso</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell></TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum cupom encontrado.</TableCell>
                  </TableRow>
                ) : (
                  paginatedCoupons.map((coupon) => (
                    <TableRow key={coupon.id} className="border-border hover:bg-muted/30">
                      <TableCell className="pl-6 font-mono font-bold text-primary">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatValue(coupon)}
                        <span className="text-[10px] block text-muted-foreground">
                          {coupon.type === "percentage" ? "Percentual" : "Valor Fixo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-medium">{coupon.usageCount} / {coupon.usageLimit || "∞"}</span>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-primary" 
                                style={{ width: coupon.usageLimit ? `${(coupon.usageCount / coupon.usageLimit) * 100}%` : "0%" }}
                             />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.expiryDate ? (
                          <div className="flex items-center gap-1.5">
                             <Calendar className="w-3 h-3" /> {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}
                          </div>
                        ) : "Sem expiração"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            coupon.active
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {coupon.active ? "Ativo" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => handleOpenEdit(coupon)} className="gap-2 cursor-pointer">
                              <Edit className="w-4 h-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(coupon.id)} className="gap-2 text-destructive cursor-pointer hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" /> Excluir
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
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
            <DialogDescription>Configure as regras e benefícios do cupom.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código do Cupom</Label>
              <Input
                placeholder="Ex: PROMO20"
                className="uppercase font-bold"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Compra Mínima (R$)</Label>
                    <Input
                        type="number"
                        value={form.minPurchase}
                        onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Limite de Uso</Label>
                    <Input
                        type="number"
                        placeholder="∞"
                        value={form.usageLimit}
                        onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <Input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div className="space-y-0.5">
                <Label>Cupom Ativo</Label>
                <p className="text-xs text-muted-foreground">Permitir uso no checkout</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Cupom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCouponsPage;
