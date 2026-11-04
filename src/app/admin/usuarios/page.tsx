'use client';

import { useEffect, useState } from "react";
import { Search, User, MoreHorizontal, Edit, Trash2, KeyRound, Loader2, ShieldCheck, Plus } from "lucide-react";
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
import type { AdminUserRow, AdminUserInput } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyForm: AdminUserInput = {
  name: "",
  email: "",
  password: "",
  role: "OPERATOR",
  status: "ACTIVE"
};

export default function AdminTeamPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
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

    setIsSavingPassword(true);
    try {
      await adminRepository.updateUserPassword(selectedUserId, newPassword);
      toast.success("Senha atualizada com sucesso!");
      setPasswordModalOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar senha");
    } finally {
      setIsSavingPassword(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminRepository.listUsers();
      setUsers(Array.isArray(data) ? data.filter((u) => u.role === "ADMIN" || u.role === "OPERATOR") : []);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
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
        toast.success("Membro da equipe atualizado com sucesso!");
      } else {
        await adminRepository.createUser(form);
        toast.success("Membro da equipe criado com sucesso!");
      }
      setModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Remover Acesso?",
      text: "O acesso deste usuário ao painel administrativo será revogado imediatamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, revogar",
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
          title: "Revogado!",
          text: "O usuário foi removido da equipe.",
          icon: "success",
          background: "#090a0f",
          color: "#f4f4f5"
        });
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
    ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    OPERATOR: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    CUSTOMER: "bg-zinc-800 text-zinc-400 border-zinc-700"
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Equipe & Acessos</h1>
            <p className="text-xs text-zinc-400">Gerencie operadores e administradores com acesso ao painel.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 rounded-lg shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Membro
          </Button>
        </div>
      </div>

      {/* Tabela de Membros */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Usuários Administrativos</span>
          </div>
          <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-normal">
            {filteredUsers.length} {filteredUsers.length === 1 ? "membro" : "membros"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/80">
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="pl-6 w-[320px] text-[11px] uppercase font-bold text-zinc-400 py-3.5">Nome</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Email</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Permissão</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-right pr-6 w-[100px] text-[11px] uppercase font-bold text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando equipe...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-zinc-400 text-xs">
                    Nenhum membro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const displayName = user.customerProfile?.name || user.name || "Sem Nome";
                  const initials = displayName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <TableRow key={user.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                      <TableCell className="pl-6 font-medium text-zinc-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <span className="text-xs font-semibold">{displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs font-mono">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-[10px] font-semibold px-2.5 py-0.5 rounded-full", roleColors[user.role])}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                              <MoreHorizontal className="w-4 h-4" />
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
                              <Trash2 className="w-3.5 h-3.5" /> Revogar Acesso
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

      {/* Modal Criar / Editar Usuário */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">
              {editingId ? "Editar Membro" : "Novo Membro da Equipe"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Defina as credenciais e o nível de acesso no painel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-zinc-300">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Carlos Oliveira"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-zinc-300">Email de Login</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@jpbstorex.com.br"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {!editingId && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-zinc-300">Senha Provisória</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password || ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs text-zinc-300">Nível de Acesso</Label>
              <Select
                value={form.role}
                onValueChange={(value: "ADMIN" | "OPERATOR" | "CUSTOMER") => setForm({ ...form, role: value })}
              >
                <SelectTrigger id="role" className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9 rounded-lg">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
                  <SelectItem value="OPERATOR">Operador (Atendimento e Pedidos)</SelectItem>
                  <SelectItem value="ADMIN">Administrador (Acesso Completo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs text-zinc-300">Status</Label>
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
              {isSaving ? "Salvando..." : "Salvar Membro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Alterar Senha */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">Redefinir Senha de Acesso</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Digite uma nova senha segura para o membro da equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs text-zinc-300">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
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
    </div>
  );
}
