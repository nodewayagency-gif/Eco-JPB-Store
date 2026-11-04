'use client';

import { useEffect, useState } from "react";
import { Plus, Search, Tag, MoreHorizontal, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import type { AdminCategory, AdminCategoryInput } from "@premium/contracts";
import { adminRepository } from "@/services/api/adminRepository";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyForm: AdminCategoryInput = {
  name: "",
  slug: "",
  active: true
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AdminCategoryInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminRepository.listCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const slugify = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (category: AdminCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      active: category.active
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("O nome da categoria é obrigatório");
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await adminRepository.updateCategory(editingId, form);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await adminRepository.createCategory(form);
        toast.success("Categoria criada com sucesso!");
      }
      setModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Excluir Categoria?",
      text: "Esta ação não pode ser desfeita caso existam produtos vinculados.",
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
        await adminRepository.deleteCategory(id);
        setCategories(categories.filter((c) => c.id !== id));
        Swal.fire({
          title: "Excluída!",
          text: "A categoria foi removida com sucesso.",
          icon: "success",
          background: "#090a0f",
          color: "#f4f4f5"
        });
      } catch (error) {
        toast.error("Erro ao excluir categoria. Verifique se existem produtos vinculados.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Categorias</h1>
            <p className="text-xs text-zinc-400">Organize os catálogos da loja e agrupe produtos para navegação.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar categoria..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 rounded-lg shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Categoria
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Todas as Categorias</span>
          </div>
          <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-normal">
            {filteredCategories.length} {filteredCategories.length === 1 ? "categoria" : "categorias"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800/80">
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableHead className="pl-6 w-[320px] text-[11px] uppercase font-bold text-zinc-400 py-3.5">Nome</TableHead>
                <TableHead className="text-[11px] uppercase font-bold text-zinc-400">Slug (URL)</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Produtos</TableHead>
                <TableHead className="text-center text-[11px] uppercase font-bold text-zinc-400">Status</TableHead>
                <TableHead className="text-right pr-6 w-[90px] text-[11px] uppercase font-bold text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando categorias...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-zinc-400 text-xs">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                    <TableCell className="pl-6 font-medium text-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400">
                          <Tag className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 font-mono text-xs">
                      /{category.slug}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                        {category.productCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                          category.active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        )}
                      >
                        {category.active ? "Ativa" : "Inativa"}
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
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-rose-400 cursor-pointer text-xs focus:bg-rose-500/10 focus:text-rose-400"
                            onClick={() => handleDelete(category.id)}
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

      {/* Modal Categoria */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-[#0c0d12] border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Defina o nome de exibição. O slug para URLs amigáveis é preenchido automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-zinc-300">Nome da Categoria</Label>
              <Input
                id="name"
                placeholder="Ex: Fones de Ouvido"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: slugify(name) });
                }}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs text-zinc-300">Slug da URL</Label>
              <Input
                id="slug"
                readOnly
                className="bg-zinc-900 border-zinc-800 text-zinc-400 font-mono text-xs h-9 rounded-lg"
                value={form.slug}
              />
              <p className="text-[11px] text-zinc-400">Identificador único utilizado nas rotas da loja.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-zinc-200">Categoria Ativa</Label>
                <p className="text-[11px] text-zinc-400">Disponível nos filtros e catálogo público</p>
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
              {isSaving ? "Salvando..." : "Salvar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
