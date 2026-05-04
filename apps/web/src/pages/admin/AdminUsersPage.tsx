import { useEffect, useState } from "react";
import { Search, User, MoreHorizontal, Edit, Trash2, KeyRound } from "lucide-react";
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
import type { AdminUserRow, AdminUserInput } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";

const emptyForm: AdminUserInput = {
  name: "",
  email: "",
  role: "CUSTOMER",
  status: "ACTIVE"
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminUserInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenPasswordModal = (user: AdminUserRow) => {
    setSelectedUserId(user.id);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUserId || newPassword.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres");
      return;
    }

    try {
      await adminRepository.updateUserPassword(selectedUserId, newPassword);
      toast.success("Senha atualizada com sucesso!");
      setPasswordModalOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar senha");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminRepository.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

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
        toast.success("Usuário atualizado com sucesso");
      } else {
        await adminRepository.createUser(form);
        toast.success("Usuário criado com sucesso");
      }
      setModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await adminRepository.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
        toast.success("Usuário excluído com sucesso");
      } catch (error) {
        toast.error("Erro ao excluir usuário");
      }
    }
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    OPERATOR: "Operador",
    CUSTOMER: "Cliente"
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
    OPERATOR: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CUSTOMER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
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
              <User className="w-5 h-5 text-primary" /> Usuários
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
                  <TableHead className="text-center">Papel</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6 w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const displayName = user.customerProfile?.name || user.name || "Sem Nome";
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
                        <Badge variant="outline" className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
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
            <DialogTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              Defina as credenciais e nível de acesso do usuário.
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
              <Label htmlFor="role">Papel / Nível de Acesso</Label>
              <Select
                value={form.role}
                onValueChange={(value: "ADMIN" | "OPERATOR" | "CUSTOMER") =>
                  setForm({ ...form, role: value })
                }
              >
                <SelectTrigger id="role" className="bg-background border-border">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="CUSTOMER">Cliente</SelectItem>
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              Salvar Usuário
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
              Digite a nova senha para este usuário.
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
            <Button onClick={handleUpdatePassword} className="bg-primary text-primary-foreground">
              Confirmar Nova Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
