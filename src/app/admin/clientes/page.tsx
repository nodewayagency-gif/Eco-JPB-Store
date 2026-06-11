'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, User, MoreHorizontal, Edit, Trash2, KeyRound, Package, ChevronRight, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [allUsersCount, setAllUsersCount] = useState(0);
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
      setAllUsersCount(Array.isArray(usersData) ? usersData.length : 0);
      setUsers(Array.isArray(usersData) ? usersData.filter(u => (u.role as string)?.toUpperCase() === "CUSTOMER") : []);
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
      // Aqui poderíamos ter uma rota filtrada, mas por enquanto usamos o listOrders
      // e filtramos no cliente, mas agora apenas quando necessário.
      const allOrders = await adminRepository.listOrders();
      setCustomerOrders(allOrders.filter(o => o.customerId === user.id));
    } catch (error) {
      toast.error("Erro ao carregar pedidos do cliente");
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const displayName = user.customerProfile?.name || user.name || "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);



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
        toast.success("Cliente atualizado com sucesso");
      } else {
        await adminRepository.createUser(form);
        toast.success("Cliente criado com sucesso");
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
      title: 'Tem certeza?',
      text: "Todos os dados vinculados a este cliente serão mantidos, mas o acesso dele será removido!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fbbf24',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: '#18181b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await adminRepository.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
        Swal.fire({
          title: 'Excluído!',
          text: 'O cliente foi removido com sucesso.',
          icon: 'success',
          background: '#18181b',
          color: '#fff'
        });
      } catch (error) {
        toast.error("Erro ao excluir cliente");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-sm text-muted-foreground">Visualize e gerencie os clientes da sua loja.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-9 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Clientes
            </CardTitle>
            <Badge variant="outline" className="border-border text-xs font-normal">
              {filteredUsers.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 w-[300px]">Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6 w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Nenhum cliente cadastrado no sistema.
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Nenhum cliente encontrado para esta busca.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const displayName = user.customerProfile?.name || user.name || "Cliente";
                    return (
                      <TableRow key={user.id} className="border-border hover:bg-muted/30">
                        <TableCell className="pl-6 font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            {displayName}
                          </div>
                        </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleOpenOrdersModal(user)}
                          >
                            <Package className="w-3.5 h-3.5" /> Pedidos
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Edit className="w-4 h-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={() => handleOpenPasswordModal(user)}
                              >
                                <KeyRound className="w-4 h-4" /> Alterar Senha
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive cursor-pointer hover:bg-destructive/10"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="w-4 h-4" /> Excluir
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
            <DialogTitle>{editingId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              Atualize as informações do perfil do cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@nodeway.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status da Conta</Label>
              <Select
                value={form.status}
                onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                  setForm({ ...form, status: value })
                }
              >
                <SelectTrigger id="status" className="bg-background border-border">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground font-bold gap-2" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha para o cliente <strong>{selectedUser?.customerProfile?.name || selectedUser?.name || "Cliente"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)} disabled={isSavingPassword}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePassword} className="bg-primary text-primary-foreground font-bold gap-2" disabled={isSavingPassword}>
              {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSavingPassword ? "Salvando..." : "Confirmar Nova Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ordersModalOpen} onOpenChange={setOrdersModalOpen}>
        <DialogContent className="max-w-3xl bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Pedidos de {selectedUser?.customerProfile?.name || selectedUser?.name || "Cliente"}
            </DialogTitle>
            <DialogDescription>
              Histórico de compras realizadas por este cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingOrders ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Carregando histórico...</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500">Este cliente ainda não possui pedidos.</p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {customerOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-primary/30 transition-colors cursor-pointer group"
                    onClick={() => {
                      setOrdersModalOpen(false);
                      router.push(`/admin/pedidos?id=${order.id}`);
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">#{order.id.slice(-8).toUpperCase()}</span>
                        <Badge variant="outline" className="text-[9px] py-0 h-4 bg-zinc-900 border-zinc-700">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-primary transition-colors">{order.statusLabel}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-sm font-bold text-primary">
                        {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrdersModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
