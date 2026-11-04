'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  KeyRound,
  Package,
  ChevronRight,
  Loader2,
  MessageCircle,
  Users
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { AdminUserRow, AdminUserInput, AdminOrderRow } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyForm: AdminUserInput = {
  name: "",
  email: "",
  role: "CUSTOMER",
  status: "ACTIVE"
};

export default function AdminCustomersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [customerOrders, setCustomerOrders] = useState<AdminOrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState<AdminUserInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const usersData = await adminRepository.listUsers();
      setUsers(Array.isArray(usersData) ? usersData.filter((u) => (u.role as string)?.toUpperCase() === "CUSTOMER") : []);
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordModal = (user: AdminUserRow) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || newPassword.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres");
      return;
    }

    setIsSavingPassword(true);
    try {
      await adminRepository.updateUserPassword(selectedUser.id, newPassword);
      toast.success("Senha atualizada com sucesso!");
      setPasswordModalOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar senha");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleOpenOrdersModal = async (user: AdminUserRow) => {
    setSelectedUser(user);
    setOrdersModalOpen(true);
    setLoadingOrders(true);
    try {
      const allOrders = await adminRepository.listOrders();
      setCustomerOrders(allOrders.filter((o) => o.customerId === user.id));
    } catch (error) {
      toast.error("Erro ao carregar pedidos do cliente");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleWhatsApp = async (user: AdminUserRow) => {
    const phone = user.customerProfile?.phone;
    if (!phone) {
      toast.error("Cliente não possui telefone cadastrado.");
      return;
    }

    try {
      const allOrders = await adminRepository.listOrders();
      const userOrders = allOrders.filter((o) => o.customerId === user.id);

      let message = "";
      if (userOrders.length === 0) {
        message = "Olá! Vimos que você se cadastrou em jpbstorex.com.br, mas ainda não realizou nenhuma compra. Tem algo em que possamos ajudar?";
      } else {
        const latestOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const days = Math.floor((new Date().getTime() - new Date(latestOrder.createdAt).getTime()) / (1000 * 3600 * 24));
        message = `Olá! Notamos que faz ${days} dias desde a sua última compra na jpbstorex.com.br. Que tal conferir nossas novidades?`;
      }

      let phoneOnlyNumbers = phone.replace(/\D/g, '');
      if (phoneOnlyNumbers.length <= 11) {
        phoneOnlyNumbers = `55${phoneOnlyNumbers}`;
      }
      const url = `https://wa.me/${phoneOnlyNumbers}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Erro ao gerar link de WhatsApp");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const displayName = user.customerProfile?.name || user.name || "";
      return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredUsers, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleOpenEdit = (user: AdminUserRow) => {
    setEditingId(user.id);
    setForm({
      name: user.customerProfile?.name || user.name || "",
      email: user.email || "",
      role: user.role,
      status: user.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await adminRepository.updateUser(editingId, form);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await adminRepository.createUser(form);
        toast.success("Cliente criado com sucesso!");
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Desativar Cliente?",
      text: "O acesso do cliente será desativado, mantendo o histórico de pedidos seguro.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, desativar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      background: "#090a0f",
      color: "#f4f4f5"
    });

    if (result.isConfirmed) {
      try {
        await adminRepository.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
        Swal.fire({
          title: "Removido!",
          text: "O cliente foi removido com sucesso.",
          icon: "success",
          background: "#090a0f",
          color: "#f4f4f5"
        });
      } catch (error) {
        toast.error("Erro ao remover cliente");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Clientes</h1>
            <p className="text-xs text-zinc-400">Consulte o cadastro, histórico de compras e canais de contato dos clientes.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Base de Clientes</span>
          </div>
          <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-normal">
            {filteredUsers.length} {filteredUsers.length === 1 ? "cliente" : "clientes"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/80">
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="pl-6 w-[320px] text-[11px] uppercase font-bold text-zinc-400 py-3.5">Cliente</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Email</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-right pr-6 w-[220px] text-[11px] uppercase font-bold text-zinc-400">Ações Rápidas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando clientes...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-zinc-400 text-xs">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const displayName = user.customerProfile?.name || user.name || "Cliente";
                  const initials = displayName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <TableRow key={user.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                      <TableCell className="pl-6 font-medium text-zinc-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">{displayName}</p>
                            {user.customerProfile?.phone && (
                              <p className="text-[11px] text-zinc-400">{user.customerProfile.phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs font-mono">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                            user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          )}
                        >
                          {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg"
                            onClick={() => handleWhatsApp(user)}
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2.5 gap-1.5 text-[11px] text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg"
                            onClick={() => handleOpenOrdersModal(user)}
                          >
                            <Package className="w-3.5 h-3.5" /> Pedidos
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-xs focus:bg-zinc-800 focus:text-amber-400"
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Edit className="w-3.5 h-3.5" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-xs focus:bg-zinc-800 focus:text-amber-400"
                                onClick={() => handleOpenPasswordModal(user)}
                              >
                                <KeyRound className="w-3.5 h-3.5" /> Alterar Senha
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-rose-400 cursor-pointer text-xs focus:bg-rose-500/10 focus:text-rose-400"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* Modal Editar Cliente */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">
              {editingId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Atualize as informações do perfil do comprador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-zinc-300">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Ex: João da Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-zinc-300">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs text-zinc-300">Status da Conta</Label>
              <Select
                value={form.status}
                onValueChange={(value: "ACTIVE" | "INACTIVE") => setForm({ ...form, status: value })}
              >
                <SelectTrigger id="status" className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9 rounded-lg">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Senha */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">Redefinir Senha</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Digite uma nova senha para <strong>{selectedUser?.customerProfile?.name || selectedUser?.name || "Cliente"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs text-zinc-300">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setPasswordModalOpen(false)}
              disabled={isSavingPassword}
              className="text-zinc-400 hover:text-zinc-200 text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePassword}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 gap-1.5 rounded-lg transition-colors"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isSavingPassword ? "Salvando..." : "Confirmar Nova Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pedidos do Cliente */}
      <Dialog open={ordersModalOpen} onOpenChange={setOrdersModalOpen}>
        <DialogContent className="max-w-2xl bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-zinc-100">
              <Package className="w-4 h-4 text-amber-400" />
              Compras de {selectedUser?.customerProfile?.name || selectedUser?.name || "Cliente"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Histórico de todos os pedidos realizados por este usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-zinc-400 text-xs">Carregando pedidos...</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-400 text-xs">Este cliente ainda não realizou compras registradas.</p>
              </div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-400/40 transition-colors cursor-pointer group"
                    onClick={() => {
                      setOrdersModalOpen(false);
                      router.push(`/admin/pedidos?id=${order.id}`);
                    }}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400">#{order.id.slice(-8).toUpperCase()}</span>
                        <Badge variant="outline" className="text-[9px] py-0 h-4 bg-zinc-950 border-zinc-800 text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                        {order.statusLabel}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2.5">
                      <p className="text-xs font-bold text-amber-400">
                        {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                ))}
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
