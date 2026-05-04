'use client';

import { useEffect, useState } from "react";
import { Plus, Search, Tag, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
      if (editingId) {
        await adminRepository.updateCategory(editingId, form);
        toast.success("Categoria atualizada com sucesso");
      } else {
        await adminRepository.createCategory(form);
        toast.success("Categoria criada com sucesso");
      }
      setModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    }
  };

  const handleDelete = async (id: string) => {
     const result = await Swal.fire({
       title: 'Tem certeza?',
       text: "Categorias vinculadas a produtos não poderão ser excluídas!",
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
            await adminRepository.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            Swal.fire({
              title: 'Excluída!',
              text: 'A categoria foi removida com sucesso.',
              icon: 'success',
              background: '#18181b',
              color: '#fff'
            });
        } catch (error) {
            toast.error("Erro ao excluir categoria. Verifique se existem produtos vinculados.");
        }
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Categorias</h1>
          <p className="text-sm text-muted-foreground">Organize seus produtos em categorias para facilitar a navegação.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              className="pl-9 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 bg-primary hover:bg-primary/90 shrink-0">
            <Plus className="w-4 h-4" /> Nova Categoria
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Categorias
            </CardTitle>
            <Badge variant="outline" className="border-border text-xs font-normal">
                {filteredCategories.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 w-[300px]">Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Produtos</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6 w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Carregando categorias...
                     </TableCell>
                   </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Nenhuma categoria encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((category) => (
                    <TableRow key={category.id} className="border-border hover:bg-muted/30">
                      <TableCell className="pl-6 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Tag className="w-4 h-4 text-primary" />
                           </div>
                           {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {category.productCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            category.active
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {category.active ? "Ativa" : "Inativa"}
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
                              onClick={() => handleOpenEdit(category)}
                            >
                              <Edit className="w-4 h-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="gap-2 text-destructive cursor-pointer hover:bg-destructive/10"
                                onClick={() => handleDelete(category.id)}
                            >
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
                      className={cn("cursor-pointer", page === 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={cn("cursor-pointer", page === totalPages && "pointer-events-none opacity-50")}
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
            <DialogTitle>{editingId ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              Defina o nome e o status da categoria. O slug será gerado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                placeholder="Ex: Headphones"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: slugify(name) });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                readOnly
                className="bg-muted text-muted-foreground"
                value={form.slug}
              />
              <p className="text-[11px] text-muted-foreground">Gerado automaticamente para SEO.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div className="space-y-0.5">
                <Label>Categoria Ativa</Label>
                <p className="text-xs text-muted-foreground">Exibir nas opções de cadastro</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground font-bold">
              Salvar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
