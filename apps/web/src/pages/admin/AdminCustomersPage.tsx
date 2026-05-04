import { useEffect, useState, useMemo } from "react";
import { Search, User, MoreHorizontal, Edit, Trash2, KeyRound, Package, ChevronRight, X } from "lucide-react";
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

const AdminCustomersPage = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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
      const [usersData, ordersData] = await Promise.all([
        adminRepository.listUsers(),
        adminRepository.listOrders()
      ]);
      setAllUsersCount(Array.isArray(usersData) ? usersData.length : 0);
      setUsers(Array.isArray(usersData) ? usersData.filter(u => (u.role as string)?.toUpperCase() === "CUSTOMER") : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      toast.error("Erro ao carregar dados");
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

    try {
      await adminRepository.updateUserPassword(selectedUser.id, newPassword);
      toast.success("Senha atualizada com sucesso!");
      setPasswordModalOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar senha");
    }
  };

  const handleOpenOrdersModal = (user: AdminUserRow) => {
    setSelectedUser(user);
    setOrdersModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const displayName = user.customerProfile?.name || user.name || "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const customerOrders = useMemo(() => {
    if (!selectedUser) return [];
    // Filtra pedidos pelo ID do cliente para maior precisão
    return orders.filter(o => o.customerId === selectedUser.id);
  }, [selectedUser, orders]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleOpenEdit = (user: AdminUserRow) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
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
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await adminRepository.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
        toast.success("Cliente excluído com sucesso");
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
                      Nenhum cliente cadastrado no sistema. (Total de usuários: {allUsersCount})
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
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground font-bold">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Alteração de Senha */}
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
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePassword} className="bg-primary text-primary-foreground font-bold">
              Confirmar Nova Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Pedidos do Cliente */}
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
            {customerOrders.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500">Este cliente ainda não possui pedidos.</p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-primary/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">#{order.id.slice(-8).toUpperCase()}</span>
                        <Badge variant="outline" className="text-[9px] py-0 h-4 bg-zinc-900 border-zinc-700">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-zinc-200">{order.statusLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-xs text-zinc-500 hover:text-primary"
                        onClick={() => {
                          setOrdersModalOpen(false);
                          // Redirecionar ou abrir detalhes do pedido (precisaria de lógica extra aqui se quisermos abrir o modal de detalhes do pedido diretamente)
                          window.location.href = `/admin/pedidos?search=${order.id}`;
                        }}
                      >
                        Ver detalhes <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
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
};

export default AdminCustomersPage;
