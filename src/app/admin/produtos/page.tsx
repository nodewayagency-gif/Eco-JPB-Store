'use client';
import { cn, maskCEP } from "@/lib/utils";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  History,
  Package,
  PlusCircle,
  Save,
  Search,
  Filter,
  Trash2,
  Plus,
  Loader2,
  Check,
  Star,
  Shield,
  Zap,
  Award,
  Leaf,
  MoveUp,
  MoveDown,
  Sparkles,
  Percent,
  Tag,
  ArrowDownRight
} from "lucide-react";
import Swal from "sweetalert2";
import type {
  AdminProductInput,
  AdminProductPurchaseHistory,
  AdminProductRow,
  AdminCategory,
  AdminReviewView,
} from "@premium/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const TOPIC_ICONS: Record<string, any> = {
  Check,
  Star,
  Shield,
  Zap,
  Award,
  Leaf
};

const parseTopic = (t: string) => {
  try {
    const parsed = JSON.parse(t);
    if (parsed && typeof parsed === 'object' && parsed.text !== undefined) {
      return { text: parsed.text, icon: parsed.icon || "Check" };
    }
  } catch (e) { }
  return { text: t, icon: "Check" };
};

const stringifyTopic = (text: string, icon: string) => {
  return JSON.stringify({ text, icon });
};

const emptyForm: AdminProductInput = {
  sku: "",
  name: "",
  description: "",
  category: "",
  categoryId: "",
  price: 0,
  originalPrice: undefined,
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
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : "bg-rose-500/15 text-rose-400 border-rose-500/30";

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
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [reviews, setReviews] = useState<AdminReviewView[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({ authorName: "", rating: 5, comment: "" });
  const [activeTab, setActiveTab] = useState("info");
  const [customDiscountPct, setCustomDiscountPct] = useState("");

  const loadProducts = async () => {
    try {
      const data = await adminRepository.listProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar produtos");
    }
  };

  const loadCategories = async () => {
    try {
      const data = await adminRepository.listCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await adminSettingsRepository.getCompanySettings();
      if (settings?.originZipCode) {
        setDefaultOriginZipCode(settings.originZipCode);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadCategories(), loadSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openHistory = async (product: AdminProductRow) => {
    setSelectedProductId(product.id);
    setHistoryModalOpen(true);
    try {
      const data = await adminRepository.listProductPurchaseHistory(product.id);
      setPurchaseHistory(data);
    } catch (e) {
      toast.error("Erro ao buscar histórico do produto");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
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
    setForm({ ...emptyForm, originZipCode: maskCEP(defaultOriginZipCode) });
    setCustomDiscountPct("");
    setActiveTab("info");
    setProductModalOpen(true);
  };

  const startEdit = async (product: AdminProductRow) => {
    setEditingProductId(product.id);
    const cat = categories.find((c) => c.name === product.category);
    const input = adminProductMapper.toInput(product);
    setForm({
      ...input,
      originalPrice: product.originalPrice ? product.originalPrice : undefined,
      categoryId: cat ? cat.id : undefined,
    });
    setCustomDiscountPct("");
    setActiveTab("info");
    setProductModalOpen(true);

    setLoadingReviews(true);
    try {
      const revs = await adminRepository.listProductReviews(product.id);
      setReviews(revs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name || form.name.trim().length < 2) {
        toast.error("Informe um nome válido para o produto.");
        return;
      }

      const categoryItem = categories.find((c) => c.id === form.categoryId);
      const categoryName = categoryItem?.name || form.category || "";
      if (!categoryName.trim()) {
        toast.error("Selecione uma categoria para o produto.");
        return;
      }

      const parsedPrice = Number(String(form.price || 0).replace(',', '.'));
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.error("O preço final de venda deve ser maior que zero (ex: 199,90).");
        return;
      }

      let parsedOriginalPrice: number | undefined = undefined;
      if (form.originalPrice && String(form.originalPrice).trim() !== "") {
        const orig = Number(String(form.originalPrice).replace(',', '.'));
        if (!isNaN(orig) && orig > 0) {
          if (orig < parsedPrice) {
            toast.error("O preço original (De R$) não pode ser menor que o preço de venda (Por R$).");
            return;
          }
          parsedOriginalPrice = orig;
        }
      }

      setIsSaving(true);
      const payload: AdminProductInput = {
        ...form,
        name: form.name.trim(),
        category: categoryName,
        categoryId: form.categoryId || categoryItem?.id || "",
        inStock: Number(form.stockQuantity || 0) > 0,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        costPrice: 0,
        stockQuantity: Math.max(0, parseInt(String(form.stockQuantity || 0), 10) || 0),
        minStockAlert: Math.max(0, parseInt(String(form.minStockAlert || 5), 10) || 5),
        weightKg: Math.max(0, Number(String(form.weightKg || 0).replace(',', '.')) || 0),
        lengthCm: Math.max(0, Number(String(form.lengthCm || 0).replace(',', '.')) || 0),
        widthCm: Math.max(0, Number(String(form.widthCm || 0).replace(',', '.')) || 0),
        heightCm: Math.max(0, Number(String(form.heightCm || 0).replace(',', '.')) || 0),
        taxPercent: Math.max(0, Number(String(form.taxPercent || 0).replace(',', '.')) || 0),
        badge: form.badge || undefined,
        ncm: form.ncm?.trim() || undefined,
        ean: form.ean?.trim() || undefined,
        gatewayProductId: editingProductId ?? undefined,
        melhorEnvioCategory: form.melhorEnvioCategory || undefined,
        image: form.image || undefined,
        images: form.images || undefined,
        topics: (form.topics || []).filter((t) => t.trim().length > 0)
      };

      if (editingProductId) {
        await adminRepository.updateProduct(editingProductId, payload);
      } else {
        await adminRepository.createProduct(payload);
      }
      toast.success(editingProductId ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      setProductModalOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddReview = async () => {
    if (!editingProductId) return;
    if (!newReview.authorName || !newReview.rating) {
      toast.error("Nome e nota são obrigatórios");
      return;
    }
    try {
      const added = await adminRepository.createProductReview(editingProductId, newReview);
      setReviews([added, ...reviews]);
      setNewReview({ authorName: "", rating: 5, comment: "" });
      toast.success("Avaliação lançada com sucesso!");
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Erro ao adicionar avaliação");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!editingProductId) return;
    try {
      await adminRepository.deleteProductReview(editingProductId, reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast.success("Avaliação excluída!");
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir avaliação");
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
      background: '#131418',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await adminRepository.deleteProduct(id);
        Swal.fire({
          title: 'Excluído!',
          text: 'O produto foi removido com sucesso.',
          icon: 'success',
          background: '#131418',
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

      setProducts((current) =>
        current.map((p) => (p.id === product.id ? { ...p, active: newStatus } : p))
      );

      toast.success(`Produto ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao alterar status do produto");
    }
  };

  const handleNumber = (field: keyof AdminProductInput) => (value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, '');
    setForm((current) => ({ ...current, [field]: sanitized } as any));
  };

  // Cálculos dinâmicos de desconto no formulário
  const numCurrentPrice = Number(String(form.price || 0).replace(',', '.'));
  const numOriginalPrice = Number(String(form.originalPrice || 0).replace(',', '.'));
  const hasDiscount = numOriginalPrice > 0 && numOriginalPrice > numCurrentPrice;
  const currentDiscountPercent = hasDiscount
    ? Math.round(((numOriginalPrice - numCurrentPrice) / numOriginalPrice) * 100)
    : 0;

  const applyDiscountPercent = (pct: number) => {
    if (numOriginalPrice > 0 && pct > 0 && pct < 100) {
      const calculatedSalePrice = Number((numOriginalPrice * (1 - pct / 100)).toFixed(2));
      setForm((c) => ({ ...c, price: calculatedSalePrice }));
      setCustomDiscountPct(pct.toString());
    }
  };

  const removeDiscount = () => {
    setForm((c) => ({ ...c, originalPrice: undefined }));
    setCustomDiscountPct("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-9 rounded-xl">
              <Filter className="w-3.5 h-3.5 mr-2 text-zinc-400" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
              <SelectItem value="ALL">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-9 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs">
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="INACTIVE">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={startCreate}
          className="gap-2 shrink-0 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 rounded-xl shadow-sm shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" /> Cadastrar Produto
        </Button>
      </div>

      {/* Products Table Card */}
      <Card className="bg-zinc-900/70 border-zinc-800/80 overflow-hidden shadow-sm">
        <CardHeader className="bg-zinc-950/40 border-b border-zinc-800/60 p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Catálogo de Produtos ({filteredProducts.length})
            </CardTitle>
            <p className="text-xs text-zinc-500">Gestão de catálogo, ofertas e estoque</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/80 hover:bg-transparent bg-zinc-950/30">
                <TableHead className="text-zinc-400 text-xs font-semibold pl-6">Produto</TableHead>
                <TableHead className="text-zinc-400 text-xs font-semibold">SKU</TableHead>
                <TableHead className="text-zinc-400 text-xs font-semibold">Categoria</TableHead>
                <TableHead className="text-zinc-400 text-xs font-semibold text-right">Preço de Venda</TableHead>
                <TableHead className="text-zinc-400 text-xs font-semibold text-center">Estoque</TableHead>
                <TableHead className="text-zinc-400 text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="text-zinc-400 text-xs font-semibold text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-400 text-xs">Carregando catálogo...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center text-zinc-500 italic text-sm">
                    Nenhum produto cadastrado ou correspondente à busca.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const productHasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
                  const discountPct = productHasDiscount
                    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
                    : 0;

                  return (
                    <TableRow
                      key={product.id}
                      className="border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Product Name & Image */}
                      <TableCell className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <div className="w-11 h-11 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700/80">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-zinc-800/80 flex items-center justify-center flex-shrink-0 border border-zinc-700/60">
                              <Package className="w-5 h-5 text-zinc-500" />
                            </div>
                          )}
                          <div className="flex flex-col gap-1 min-w-0">
                            <p className="font-semibold text-xs text-zinc-100 truncate max-w-[220px]">{product.name}</p>
                            <div className="flex items-center gap-1.5">
                              {product.badge && (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 uppercase">
                                  {product.badge}
                                </span>
                              )}
                              {product.freeShipping && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                  Frete Grátis
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* SKU */}
                      <TableCell>
                        <span className="font-mono text-[11px] text-zinc-400 bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800">
                          {product.sku}
                        </span>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <span className="text-xs text-zinc-300 font-medium">
                          {product.category}
                        </span>
                      </TableCell>

                      {/* Price with Discount Indicator */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-xs text-zinc-100 tabular-nums">
                            {money(product.price)}
                          </span>
                          {productHasDiscount && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-zinc-500 line-through tabular-nums">
                                {money(product.originalPrice!)}
                              </span>
                              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1 py-0.2 rounded">
                                -{discountPct}%
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Stock */}
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[10px] font-bold border", stockColor(product.inStock))}>
                          {product.stockQuantity} un
                        </Badge>
                      </TableCell>

                      {/* Active Switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={product.active}
                            onCheckedChange={() => toggleActive(product)}
                            className="data-[state=checked]:bg-amber-400"
                          />
                          <span className={cn(
                            "text-[10px] font-bold uppercase w-8 text-left",
                            product.active ? "text-amber-400" : "text-zinc-500"
                          )}>
                            {product.active ? "Ativo" : "Off"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg px-2.5"
                            onClick={() => startEdit(product)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"
                            onClick={() => openHistory(product)}
                            title="Histórico de vendas"
                          >
                            <History className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            onClick={() => handleDelete(product.id)}
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-800/80 flex justify-center bg-zinc-950/20">
              <Pagination>
                <PaginationContent className="bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={cn("rounded-full h-8 w-8 p-0 cursor-pointer text-zinc-400", page === 1 && "pointer-events-none opacity-20")}
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
                              "h-8 w-8 rounded-full cursor-pointer text-xs font-medium",
                              page === p ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:bg-zinc-800"
                            )}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (p === 2 && page > 3) return <PaginationItem key="dots-1"><PaginationEllipsis className="w-4 h-4 text-zinc-600" /></PaginationItem>;
                    if (p === totalPages - 1 && page < totalPages - 2) return <PaginationItem key="dots-2"><PaginationEllipsis className="w-4 h-4 text-zinc-600" /></PaginationItem>;
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={cn("rounded-full h-8 w-8 p-0 cursor-pointer text-zinc-400", page === totalPages && "pointer-events-none opacity-20")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Creation / Edition Dialog */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl p-6">
          <DialogHeader className="pb-3 border-b border-zinc-800/80">
            <DialogTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              {editingProductId ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure preços, descontos, estoque, especificações de frete e imagens do produto.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <TabsTrigger value="info" className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 rounded-lg">
                Dados do Produto & Oferta
              </TabsTrigger>
              <TabsTrigger value="reviews" disabled={!editingProductId} className="text-xs font-semibold data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 rounded-lg disabled:opacity-40">
                Avaliações de Clientes {editingProductId && reviews.length > 0 && `(${reviews.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 pt-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-xs font-semibold text-zinc-300">SKU / Código</Label>
                  <Input
                    className="bg-zinc-900 border-zinc-800 font-mono text-xs text-zinc-200"
                    value={form.sku}
                    onChange={(e) => setForm((c) => ({ ...c, sku: e.target.value }))}
                    placeholder="JPB-HDP-001"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-300">Nome do Produto</Label>
                  <Input
                    className="bg-zinc-900 border-zinc-800 text-sm text-zinc-100 font-medium"
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Ex: Fone Bluetooth JPB Studio Pro Max"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-xs font-semibold text-zinc-300">Categoria</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm((c) => ({ ...c, categoryId: v }))}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <Label className="text-xs font-semibold text-zinc-300">Descrição Comercial</Label>
                  <textarea
                    className="flex min-h-[90px] w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    value={form.description}
                    onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                    placeholder="Descreva as características, diferenciais e tecnologia do produto..."
                  />
                </div>
              </div>

              {/* SEÇÃO PRINCIPAL DE PRECIFICAÇÃO E DESCONTOS */}
              <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/60 to-zinc-900/30 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Precificação & Desconto Promocional
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Defina o preço original e aplique um percentual de desconto para destacar o produto na loja.
                    </p>
                  </div>
                  {hasDiscount && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeDiscount}
                      className="h-7 text-[11px] text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                    >
                      Remover Desconto
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Preço Original (De R$) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-zinc-300">Preço Original (De R$)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 299,90"
                      value={form.originalPrice ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, '');
                        setForm((c) => ({ ...c, originalPrice: val as any }));
                      }}
                      className="bg-zinc-950 border-zinc-800 text-xs font-medium text-zinc-200"
                    />
                    <span className="text-[10px] text-zinc-500">Preço cheio de tabela (opcional)</span>
                  </div>

                  {/* Desconto Rápido % */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-zinc-300">Desconto (% OFF)</Label>
                      {currentDiscountPercent > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          {currentDiscountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="Ex: 20"
                        value={customDiscountPct || (currentDiscountPercent > 0 ? currentDiscountPercent : "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomDiscountPct(val);
                          applyDiscountPercent(Number(val));
                        }}
                        className="bg-zinc-950 border-zinc-800 text-xs font-bold text-emerald-400 pr-7"
                      />
                      <Percent className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[10, 15, 20, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => applyDiscountPercent(pct)}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preço de Venda Final (Por R$) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-amber-400">Preço de Venda (Por R$)*</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 239,90"
                      value={form.price}
                      onChange={(e) => handleNumber("price")(e.target.value)}
                      className="bg-zinc-950 border-amber-500/40 text-xs font-black text-amber-300 focus:border-amber-400"
                    />
                    <span className="text-[10px] text-zinc-500">Valor real cobrado no checkout</span>
                  </div>
                </div>

                {/* Prévia Interativa de Desconto */}
                {hasDiscount && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-zinc-300 font-medium text-xs">Exibição na loja:</span>
                      <span className="text-zinc-400 line-through text-xs font-medium">{money(numOriginalPrice)}</span>
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-black text-zinc-100 text-sm">{money(numCurrentPrice)}</span>
                      <Badge className="bg-emerald-500 text-zinc-950 font-black text-[10px] px-2 py-0.5">
                        -{currentDiscountPercent}% OFF
                      </Badge>
                    </div>
                    <span className="text-emerald-400 font-bold text-xs">
                      Economia de {money(numOriginalPrice - numCurrentPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Estoque e Dimensões de Frete */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Estoque Atual</Label>
                  <Input type="number" value={form.stockQuantity} onChange={(e) => handleNumber("stockQuantity")(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Peso (kg)</Label>
                  <Input type="text" inputMode="decimal" value={form.weightKg} onChange={(e) => handleNumber("weightKg")(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Comp. (cm)</Label>
                  <Input type="text" inputMode="decimal" value={form.lengthCm} onChange={(e) => handleNumber("lengthCm")(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Largura (cm)</Label>
                  <Input type="text" inputMode="decimal" value={form.widthCm} onChange={(e) => handleNumber("widthCm")(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Altura (cm)</Label>
                  <Input type="text" inputMode="decimal" value={form.heightCm} onChange={(e) => handleNumber("heightCm")(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100" />
                </div>
              </div>

              {/* Imagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Foto Principal do Produto</Label>
                  <ImageUploader
                    value={form.image}
                    onChange={(v) => setForm((c) => ({ ...c, image: v as string }))}
                    multiple={false}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-300">Galeria de Imagens</Label>
                  <ImageUploader
                    value={form.images}
                    onChange={(v) => setForm((c) => ({ ...c, images: v as string[] }))}
                    multiple={true}
                  />
                </div>
              </div>

              {/* Switches de Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-zinc-800 p-3 bg-zinc-900/50">
                <div className="rounded-lg border border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-3 bg-zinc-950/40">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Produto Ativo</p>
                    <p className="text-[10px] text-zinc-500">Visível no catálogo da loja</p>
                  </div>
                  <Switch checked={form.active} onCheckedChange={(v) => setForm((c) => ({ ...c, active: v }))} className="data-[state=checked]:bg-amber-400" />
                </div>
                <div className="rounded-lg border border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-3 bg-zinc-950/40">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Frete Grátis</p>
                    <p className="text-[10px] text-zinc-500">Destaque de envio gratuito</p>
                  </div>
                  <Switch checked={form.freeShipping} onCheckedChange={(v) => setForm((c) => ({ ...c, freeShipping: v }))} className="data-[state=checked]:bg-emerald-400" />
                </div>
              </div>

              {/* Tópicos de Destaque */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">Benefícios em Destaque</h4>
                    <p className="text-[11px] text-zinc-500">Pontos fortes listados na página do produto</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100"
                    onClick={() => {
                      setForm((c) => ({ ...c, topics: [...(c.topics || []), ""] }));
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Tópico
                  </Button>
                </div>

                {form.topics && form.topics.length > 0 ? (
                  <div className="space-y-2">
                    {form.topics.map((topic, index) => {
                      const parsed = parseTopic(topic);
                      const CurrentIcon = TOPIC_ICONS[parsed.icon] || Check;
                      return (
                        <div key={`topic-${index}`} className="flex items-center gap-2 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                          <Select
                            value={parsed.icon}
                            onValueChange={(val) => {
                              const newTopics = [...(form.topics || [])];
                              newTopics[index] = stringifyTopic(parsed.text, val);
                              setForm((c) => ({ ...c, topics: newTopics }));
                            }}
                          >
                            <SelectTrigger className="w-[70px] shrink-0 h-8 bg-zinc-950 border-zinc-800">
                              <SelectValue>
                                <div className="flex items-center justify-center">
                                  <CurrentIcon className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              {Object.keys(TOPIC_ICONS).map((iconName) => {
                                const IconComp = TOPIC_ICONS[iconName];
                                return (
                                  <SelectItem key={iconName} value={iconName}>
                                    <div className="flex items-center gap-2">
                                      <IconComp className="w-3.5 h-3.5 text-amber-400" />
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>

                          <Input
                            value={parsed.text}
                            placeholder="Ex: Cancelamento de ruído ativo inteligente"
                            onChange={(e) => {
                              const newTopics = [...(form.topics || [])];
                              newTopics[index] = stringifyTopic(e.target.value, parsed.icon);
                              setForm((c) => ({ ...c, topics: newTopics }));
                            }}
                            className="flex-1 h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-rose-400"
                            onClick={() => {
                              setForm((c) => ({ ...c, topics: c.topics?.filter((_, i) => i !== index) }));
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30 text-zinc-500 text-xs">
                    Nenhum tópico adicionado.
                  </div>
                )}
              </div>

              {/* Variações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">Variações de Cor & Tamanho</h4>
                    <p className="text-[11px] text-zinc-500">Opcional para fones, relógios ou roupas</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-zinc-100"
                    onClick={() => {
                      const newVariant: any = {
                        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        sku: `${form.sku || 'VAR'}-${(form.variants?.length || 0) + 1}`,
                        name: "",
                        colorHex: "#000000",
                        stockQuantity: 0
                      };
                      setForm((c) => ({ ...c, variants: [...(c.variants || []), newVariant] }));
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Variação
                  </Button>
                </div>

                {form.variants && form.variants.length > 0 ? (
                  <div className="space-y-2">
                    {form.variants.map((variant, index) => (
                      <div key={variant.id || `idx-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/50 items-center">
                        <div className="md:col-span-5 space-y-1">
                          <Label className="text-[10px] text-zinc-400">Nome da Variante</Label>
                          <Input
                            value={variant.name}
                            className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-200"
                            placeholder="Ex: Preto Espacial"
                            onChange={(e) => {
                              const newVariants = [...(form.variants || [])];
                              newVariants[index] = { ...newVariants[index], name: e.target.value };
                              setForm((c) => ({ ...c, variants: newVariants }));
                            }}
                          />
                        </div>
                        <div className="md:col-span-4 space-y-1">
                          <Label className="text-[10px] text-zinc-400">SKU</Label>
                          <Input
                            value={variant.sku}
                            className="h-8 text-xs font-mono bg-zinc-900 border-zinc-800 text-zinc-200"
                            onChange={(e) => {
                              const newVariants = [...(form.variants || [])];
                              newVariants[index] = { ...newVariants[index], sku: e.target.value };
                              setForm((c) => ({ ...c, variants: newVariants }));
                            }}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-[10px] text-zinc-400">Estoque</Label>
                          <Input
                            type="number"
                            value={variant.stockQuantity}
                            className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-200"
                            onChange={(e) => {
                              const newVariants = [...(form.variants || [])];
                              newVariants[index] = { ...newVariants[index], stockQuantity: Number(e.target.value) };
                              setForm((c) => ({ ...c, variants: newVariants }));
                            }}
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-rose-400"
                            onClick={() => {
                              setForm((c) => ({ ...c, variants: c.variants?.filter((_, i) => i !== index) }));
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30 text-zinc-500 text-xs">
                    Este produto não possui variações específicas de cor ou modelo.
                  </div>
                )}
              </div>
            </TabsContent>

            {editingProductId && (
              <TabsContent value="reviews" className="space-y-6 pt-4">
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardHeader className="py-3 bg-zinc-950/40 border-b border-zinc-800">
                    <CardTitle className="text-xs font-bold text-zinc-200">Inserir Nova Avaliação de Prova Social</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4 space-y-1.5">
                      <Label className="text-xs">Nome do Cliente</Label>
                      <Input
                        placeholder="Ex: Carlos Mendes"
                        className="bg-zinc-950 border-zinc-800 text-xs"
                        value={newReview.authorName}
                        onChange={(e) => setNewReview((c) => ({ ...c, authorName: e.target.value }))}
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label className="text-xs">Classificação</Label>
                      <Select
                        value={newReview.rating.toString()}
                        onValueChange={(v) => setNewReview((c) => ({ ...c, rating: Number(v) }))}
                      >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
                          <SelectItem value="5">★★★★★ 5 Estrelas</SelectItem>
                          <SelectItem value="4">★★★★☆ 4 Estrelas</SelectItem>
                          <SelectItem value="3">★★★☆☆ 3 Estrelas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-5 space-y-1.5">
                      <Label className="text-xs">Depoimento</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Produto sensacional, entrega super rápida!"
                          className="bg-zinc-950 border-zinc-800 text-xs flex-1"
                          value={newReview.comment}
                          onChange={(e) => setNewReview((c) => ({ ...c, comment: e.target.value }))}
                        />
                        <Button onClick={handleAddReview} size="sm" className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 shrink-0">
                          Lançar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avaliações Ativas ({reviews.length})</h4>
                  {loadingReviews ? (
                    <div className="text-xs text-zinc-500 py-6 text-center">Carregando avaliações...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-xs text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl p-6 text-center">
                      Nenhuma avaliação cadastrada para este produto.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {reviews.map((r) => (
                        <div key={r.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs text-zinc-100">{r.authorName}</span>
                              <div className="flex items-center text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3", i < r.rating ? "fill-current" : "text-zinc-700")} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-400 whitespace-pre-wrap">{r.comment || <span className="italic opacity-50">Sem comentário</span>}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-rose-400"
                            onClick={() => handleDeleteReview(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="border-t border-zinc-800/80 pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setProductModalOpen(false)}
              disabled={isSaving}
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-9 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs h-9 rounded-xl shadow-md shadow-amber-500/20"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Salvando..." : "Salvar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase History Dialog */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl p-6">
          <DialogHeader className="pb-3 border-b border-zinc-800">
            <DialogTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Histórico de Vendas do Produto
            </DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
                <TableHead className="text-zinc-400 text-xs">Pedido</TableHead>
                <TableHead className="text-zinc-400 text-xs">Cliente</TableHead>
                <TableHead className="text-zinc-400 text-xs">Data</TableHead>
                <TableHead className="text-zinc-400 text-xs text-right">Qtd</TableHead>
                <TableHead className="text-zinc-400 text-xs text-right">Unitário</TableHead>
                <TableHead className="text-zinc-400 text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-10 italic text-xs">
                    Nenhuma venda registrada para este produto até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                purchaseHistory.map((row) => (
                  <TableRow key={row.id} className="border-zinc-800/60 hover:bg-zinc-900/30">
                    <TableCell className="font-mono text-xs text-zinc-300">{row.orderCode}</TableCell>
                    <TableCell className="text-xs font-semibold text-zinc-200">{row.customerName}</TableCell>
                    <TableCell className="text-xs text-zinc-400">{row.date}</TableCell>
                    <TableCell className="text-right text-xs text-zinc-300 font-bold">{row.quantity}</TableCell>
                    <TableCell className="text-right text-xs text-zinc-300">{money(row.unitPrice)}</TableCell>
                    <TableCell className="text-right font-black text-xs text-zinc-100">{money(row.total)}</TableCell>
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
