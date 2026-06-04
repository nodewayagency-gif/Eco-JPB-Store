'use client';

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { History, Package, PlusCircle, Save, Search, Filter, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import type {
  AdminProductInput,
  AdminProductPurchaseHistory,
  AdminProductRow,
  AdminCategory,
} from "@premium/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { adminProductMapper, adminRepository } from "@/services/api/adminRepository";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const emptyForm: AdminProductInput = {
  sku: "",
  name: "",
  description: "",
  category: "",
  categoryId: "",
  price: 0,
  costPrice: 0,
  inStock: true,
  stockQuantity: 0,
  minStockAlert: 5,
  active: true,
  badge: undefined,
  weightKg: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  originZipCode: "",
  fragile: false,
  freeShipping: false,
  ncm: "",
  ean: "",
  taxPercent: 0,
  gatewayProductId: undefined,
  melhorEnvioCategory: "",
  image: "",
  images: [],
  topics: [],
  variants: []
};

const stockColor = (inStock: boolean) =>
  inStock
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : "bg-destructive/20 text-destructive border-destructive/30";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<AdminProductPurchaseHistory[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductInput>(emptyForm);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [defaultOriginZipCode, setDefaultOriginZipCode] = useState("01001-000");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const loadProducts = async () => {
    try {
      const data = await adminRepository.listProducts();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const loadHistory = async (productId: string) => {
    try {
      setPurchaseHistory(await adminRepository.listProductPurchaseHistory(productId));
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        adminRepository.listProducts(),
        adminRepository.listCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar produtos ou categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadCompanyDefaults = async () => {
      try {
        const company = await adminSettingsRepository.getCompanySettings();
        if (company.originZipCode) {
          setDefaultOriginZipCode(company.originZipCode);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações da empresa:", error);
      }
    };

    loadCompanyDefaults();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const volumeM3 = useMemo(() => {
    return (form.lengthCm * form.widthCm * form.heightCm) / 1000000;
  }, [form.lengthCm, form.widthCm, form.heightCm]);

  const cubedWeightKg = useMemo(() => {
    return (form.lengthCm * form.widthCm * form.heightCm) / 6000;
  }, [form.lengthCm, form.widthCm, form.heightCm]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                            product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || 
                            (statusFilter === "ACTIVE" && product.active) || 
                            (statusFilter === "INACTIVE" && !product.active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const startCreate = () => {
    setEditingProductId(null);
    setForm({ ...emptyForm, originZipCode: defaultOriginZipCode });
    setProductModalOpen(true);
  };

  const startEdit = (product: AdminProductRow) => {
    setEditingProductId(product.id);
    setForm(adminProductMapper.toInput(product));
    setProductModalOpen(true);
  };

  const openHistory = async (product: AdminProductRow) => {
    setSelectedProductId(product.id);
    await loadHistory(product.id);
    setHistoryModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: AdminProductInput = {
        ...form,
        inStock: form.stockQuantity > 0,
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        stockQuantity: Number(form.stockQuantity),
        minStockAlert: Number(form.minStockAlert),
        weightKg: Number(form.weightKg),
        lengthCm: Number(form.lengthCm),
        widthCm: Number(form.widthCm),
        heightCm: Number(form.heightCm),
        taxPercent: Number(form.taxPercent) || 0,
        badge: form.badge || undefined,
        ncm: form.ncm || undefined,
        ean: form.ean || undefined,
        gatewayProductId: editingProductId ?? undefined,
        melhorEnvioCategory: form.melhorEnvioCategory || undefined,
        image: form.image || undefined,
        images: form.images || undefined,
        topics: form.topics || []
      };

      if (editingProductId) {
        await adminRepository.updateProduct(editingProductId, payload);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await adminRepository.createProduct(payload);
        toast.success("Produto criado com sucesso!");
      }

      setProductModalOpen(false);
      setEditingProductId(null);
      await loadProducts();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter esta exclusão!",
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
        await adminRepository.deleteProduct(id);
        Swal.fire({
          title: 'Excluído!',
          text: 'O produto foi removido com sucesso.',
          icon: 'success',
          background: '#18181b',
          color: '#fff'
        });
        await loadProducts();
      } catch (error) {
        toast.error("Erro ao excluir produto");
      }
    }
  };

  const toggleActive = async (product: AdminProductRow) => {
    try {
      const newStatus = !product.active;
      await adminRepository.updateProduct(product.id, { active: newStatus });
      
      setProducts(current => 
        current.map(p => p.id === product.id ? { ...p, active: newStatus } : p)
      );
      
      toast.success(`Produto ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao alterar status do produto");
    }
  };

  const handleNumber = (field: keyof AdminProductInput) => (value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar produto ou SKU..." 
              className="pl-9 bg-card" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="INACTIVE">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={startCreate} className="gap-2 shrink-0">
          <PlusCircle className="w-4 h-4" /> Novo produto
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Gestão de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Estoque</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={7} className="h-40 text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-muted-foreground text-sm">Carregando produtos...</p>
                        </div>
                     </TableCell>
                   </TableRow>
                ) : paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground italic opacity-40">
                      Nenhum produto cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow 
                      key={product.id}
                      className="border-border/50 group hover:bg-secondary/10 transition-colors"
                    >
                      <TableCell className="py-4">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {product.sku}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden border border-border">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-sm text-foreground">{product.name}</p>
                            {product.badge ? (
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary h-4 px-1.5 uppercase font-bold">
                                {product.badge}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/20 border-border/40 font-medium text-[10px]">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-sm text-foreground">
                          {money(product.price)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold border", stockColor(product.inStock))}>
                          {product.stockQuantity} un
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch 
                            checked={product.active} 
                            onCheckedChange={() => toggleActive(product)}
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className={cn(
                            "text-[10px] font-bold uppercase w-10 text-left",
                            product.active ? "text-primary" : "text-muted-foreground"
                          )}>
                            {product.active ? "Ativo" : "Off"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-border/60 hover:border-primary hover:text-primary font-bold text-xs px-3"
                            onClick={() => startEdit(product)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-center">
              <Pagination>
                <PaginationContent className="bg-card border border-border rounded-full px-2 py-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={cn("rounded-full h-8 w-8 p-0 cursor-pointer", page === 1 && "pointer-events-none opacity-20")}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={page === p}
                            className={cn(
                              "h-8 w-8 rounded-full cursor-pointer text-xs",
                              page === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                            )}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (p === 2 && page > 3) return <PaginationItem key="dots-1"><PaginationEllipsis className="w-4 h-4" /></PaginationItem>;
                    if (p === totalPages - 1 && page < totalPages - 2) return <PaginationItem key="dots-2"><PaginationEllipsis className="w-4 h-4" /></PaginationItem>;
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={cn("rounded-full h-8 w-8 p-0 cursor-pointer", page === totalPages && "pointer-events-none opacity-20")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Edição de produto" : "Cadastro de produto"}</DialogTitle>
            <DialogDescription>
              Campos estruturados para integração com gateway de pagamento e cotações de frete.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input 
                  placeholder="Ex: JPB-WTC-001" 
                  value={form.sku} 
                  onChange={(e) => setForm((c) => ({ ...c, sku: e.target.value.toUpperCase() }))} 
                />
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-4">
                <Label>Descrição do Produto</Label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Descreva os detalhes premium do produto..."
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm((c) => ({ ...c, categoryId: v }))}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Preço venda (R$)</Label><Input type="number" value={form.price} onChange={(e) => handleNumber("price")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Custo (R$)</Label><Input type="number" value={form.costPrice} onChange={(e) => handleNumber("costPrice")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Estoque</Label><Input type="number" value={form.stockQuantity} onChange={(e) => handleNumber("stockQuantity")(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Peso (kg)</Label><Input type="number" step="0.01" value={form.weightKg} onChange={(e) => handleNumber("weightKg")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Comprimento (cm)</Label><Input type="number" step="0.1" value={form.lengthCm} onChange={(e) => handleNumber("lengthCm")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Largura (cm)</Label><Input type="number" step="0.1" value={form.widthCm} onChange={(e) => handleNumber("widthCm")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Altura (cm)</Label><Input type="number" step="0.1" value={form.heightCm} onChange={(e) => handleNumber("heightCm")(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-base">Imagem Principal</Label>
                <ImageUploader 
                  value={form.image} 
                  onChange={(v) => setForm((c) => ({ ...c, image: v as string }))} 
                  multiple={false} 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base">Galeria do Produto</Label>
                <ImageUploader 
                  value={form.images} 
                  onChange={(v) => setForm((c) => ({ ...c, images: v as string[] }))} 
                  multiple={true} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border border-border p-4">
              <div className="rounded-md border border-border px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Produto ativo</p>
                </div>
                <Switch checked={form.active} onCheckedChange={(v) => setForm((c) => ({ ...c, active: v }))} />
              </div>
              <div className="rounded-md border border-border px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Frete grátis</p>
                </div>
                <Switch checked={form.freeShipping} onCheckedChange={(v) => setForm((c) => ({ ...c, freeShipping: v }))} />
              </div>
            </div>

            <Separator className="my-6 bg-border" />
            
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Tópicos de Destaque</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                        setForm(c => ({ ...c, topics: [...(c.topics || []), ""] }));
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Tópico
                  </Button>
               </div>

               {form.topics && form.topics.length > 0 ? (
                  <div className="space-y-3">
                     {form.topics.map((topic, index) => (
                        <div key={`topic-${index}`} className="flex items-center gap-3">
                           <Input 
                             value={topic}
                             placeholder="Ex: Fabricado em couro legítimo de alta resistência"
                             onChange={(e) => {
                                 const newTopics = [...(form.topics || [])];
                                 newTopics[index] = e.target.value;
                                 setForm(c => ({ ...c, topics: newTopics }));
                             }}
                           />
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10"
                             onClick={() => {
                                 setForm(c => ({ ...c, topics: c.topics?.filter((_, i) => i !== index) }));
                             }}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/10 text-muted-foreground text-sm">
                     Nenhum tópico adicionado.
                  </div>
               )}
            </div>

            <Separator className="my-6 bg-border" />

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Variações do Produto</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                        const newVariant: any = {
                            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                            sku: `${form.sku}-${(form.variants?.length || 0) + 1}`,
                            name: "",
                            colorHex: "#000000",
                            stockQuantity: 0
                        };
                        setForm(c => ({ ...c, variants: [...(c.variants || []), newVariant] }));
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Variante
                  </Button>
               </div>

               {form.variants && form.variants.length > 0 ? (
                  <div className="space-y-3">
                     {form.variants.map((variant, index) => (
                        <div key={variant.id || `idx-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg border border-border bg-muted/20 items-end">
                            <div className="md:col-span-4 space-y-1.5">
                              <Label className="text-xs">Nome</Label>
                              <Input 
                                value={variant.name} 
                                className="h-8 text-sm"
                                onChange={(e) => {
                                    const newVariants = [...(form.variants || [])];
                                    newVariants[index] = { ...newVariants[index], name: e.target.value };
                                    setForm(c => ({ ...c, variants: newVariants }));
                                }}
                              />
                           </div>
                           <div className="md:col-span-4 space-y-1.5">
                              <Label className="text-xs">SKU</Label>
                              <Input 
                                value={variant.sku} 
                                className="h-8 text-sm font-mono"
                                onChange={(e) => {
                                    const newVariants = [...(form.variants || [])];
                                    newVariants[index] = { ...newVariants[index], sku: e.target.value };
                                    setForm(c => ({ ...c, variants: newVariants }));
                                }}
                              />
                           </div>
                           <div className="md:col-span-3 space-y-1.5">
                              <Label className="text-xs">Estoque</Label>
                              <Input 
                                type="number"
                                value={variant.stockQuantity} 
                                className="h-8 text-sm"
                                onChange={(e) => {
                                    const newVariants = [...(form.variants || [])];
                                    newVariants[index] = { ...newVariants[index], stockQuantity: Number(e.target.value) };
                                    setForm(c => ({ ...c, variants: newVariants }));
                                }}
                              />
                           </div>
                           <div className="md:col-span-1 flex justify-end pb-0.5">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    setForm(c => ({ ...c, variants: c.variants?.filter((_, i) => i !== index) }));
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/10 text-muted-foreground text-sm">
                     Este produto não possui variações específicas.
                  </div>
               )}
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>Cancelar</Button>
            <Button className="gap-2" onClick={handleSave}><Save className="w-4 h-4" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Histórico de compras {selectedProduct ? `- ${selectedProduct.name}` : ""}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.length === 0 ? (
                <TableRow className="border-border"><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sem histórico para este produto.</TableCell></TableRow>
              ) : (
                purchaseHistory.map((row) => (
                  <TableRow key={row.id} className="border-border">
                    <TableCell className="font-mono text-xs">{row.orderCode}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-right">{row.quantity}</TableCell>
                    <TableCell className="text-right">{money(row.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{money(row.total)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
