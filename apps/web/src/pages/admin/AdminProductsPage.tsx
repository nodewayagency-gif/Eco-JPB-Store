import { useEffect, useMemo, useState } from "react";
import { History, Package, PlusCircle, Save } from "lucide-react";
import type {
  AdminProductInput,
  AdminProductPurchaseHistory,
  AdminProductRow,
  AdminCategory,
  AdminProductVariant
} from "@premium/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
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
import { adminProductMapper, adminRepository } from "@/services/api/adminRepository";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";

const emptyForm: AdminProductInput = {
  sku: "",
  name: "",
  category: "",
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
  variants: []
};

const stockColor = (inStock: boolean) =>
  inStock
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : "bg-destructive/20 text-destructive border-destructive/30";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const AdminProductsPage = () => {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<AdminProductPurchaseHistory[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductInput>(emptyForm);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [defaultOriginZipCode, setDefaultOriginZipCode] = useState("01001-000");

  const loadProducts = async () => {
    const rows = await adminRepository.listProducts();
    setProducts(rows);
    if (!selectedProductId && rows[0]) {
      setSelectedProductId(rows[0].id);
    }
  };

  const loadHistory = async (productId: string) => {
    setPurchaseHistory(await adminRepository.listProductPurchaseHistory(productId));
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategories(await adminRepository.listCategories());
  };

  useEffect(() => {
    const loadCompanyDefaults = async () => {
      const company = await adminSettingsRepository.getCompanySettings();
      if (company.originZipCode) {
        setDefaultOriginZipCode(company.originZipCode);
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
      melhorEnvioCategory: form.melhorEnvioCategory || undefined
    };

    if (editingProductId) {
      await adminRepository.updateProduct(editingProductId, payload);
    } else {
      await adminRepository.createProduct(payload);
    }

    setProductModalOpen(false);
    setEditingProductId(null);
    await loadProducts();
  };

  const handleNumber = (field: keyof AdminProductInput) => (value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Gestão de Produtos
          </CardTitle>
          <Button onClick={startCreate} className="gap-2">
            <PlusCircle className="w-4 h-4" /> Novo produto
          </Button>
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
              {products.map((product) => (
                <TableRow key={product.id} className="border-border">
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      {product.badge ? (
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                          {product.badge}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-right font-medium">{money(product.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={stockColor(product.inStock)}>
                      {product.stockQuantity} un
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={product.active ? "text-primary border-primary/40" : "text-muted-foreground"}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                        Editar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => openHistory(product)} className="gap-1">
                        <History className="w-3.5 h-3.5" /> Histórico
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm((c) => ({ ...c, sku: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm((c) => ({ ...c, category: v }))}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Preço venda (R$)</Label><Input type="number" value={form.price} onChange={(e) => handleNumber("price")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Custo (R$)</Label><Input type="number" value={form.costPrice} onChange={(e) => handleNumber("costPrice")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Estoque</Label><Input type="number" value={form.stockQuantity} onChange={(e) => handleNumber("stockQuantity")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Alerta mínimo</Label><Input type="number" value={form.minStockAlert} onChange={(e) => handleNumber("minStockAlert")(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Peso (kg)</Label><Input type="number" step="0.01" value={form.weightKg} onChange={(e) => handleNumber("weightKg")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Comprimento (cm)</Label><Input type="number" step="0.1" value={form.lengthCm} onChange={(e) => handleNumber("lengthCm")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Largura (cm)</Label><Input type="number" step="0.1" value={form.widthCm} onChange={(e) => handleNumber("widthCm")(e.target.value)} /></div>
              <div className="space-y-2"><Label>Altura (cm)</Label><Input type="number" step="0.1" value={form.heightCm} onChange={(e) => handleNumber("heightCm")(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>CEP origem</Label>
                <Input value={form.originZipCode} onChange={(e) => setForm((c) => ({ ...c, originZipCode: e.target.value }))} />
                <p className="text-[11px] text-muted-foreground">Preenchido pelo cadastro da empresa e editável por produto.</p>
              </div>
              <div className="space-y-2"><Label>NCM</Label><Input value={form.ncm} onChange={(e) => setForm((c) => ({ ...c, ncm: e.target.value }))} /></div>
              <div className="space-y-2"><Label>EAN</Label><Input value={form.ean} onChange={(e) => setForm((c) => ({ ...c, ean: e.target.value }))} /></div>
              <div className="space-y-2"><Label>% imposto</Label><Input type="number" step="0.01" value={form.taxPercent} onChange={(e) => handleNumber("taxPercent")(e.target.value)} /></div>
              <div className="space-y-2 md:col-span-4"><Label>Categoria Melhor Envio</Label><Input value={form.melhorEnvioCategory} onChange={(e) => setForm((c) => ({ ...c, melhorEnvioCategory: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border border-border p-4">
              <div className="rounded-md border border-border px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Produto ativo</p>
                  <p className="text-[11px] text-muted-foreground">Exibir no catálogo</p>
                </div>
                <Switch checked={form.active} onCheckedChange={(v) => setForm((c) => ({ ...c, active: v }))} />
              </div>
              <div className="rounded-md border border-border px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Frete grátis</p>
                  <p className="text-[11px] text-muted-foreground">Ignora cotação</p>
                </div>
                <Switch checked={form.freeShipping} onCheckedChange={(v) => setForm((c) => ({ ...c, freeShipping: v }))} />
              </div>
              <div className="rounded-md border border-border px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Item frágil</p>
                  <p className="text-[11px] text-muted-foreground">Tratamento especial</p>
                </div>
                <Switch checked={form.fragile} onCheckedChange={(v) => setForm((c) => ({ ...c, fragile: v }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Volume cúbico</p><p className="text-lg font-semibold">{volumeM3.toFixed(4)} m³</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Peso cúbico</p><p className="text-lg font-semibold">{cubedWeightKg.toFixed(2)} kg</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Peso de cotação</p><p className="text-lg font-semibold">{Math.max(cubedWeightKg, form.weightKg).toFixed(2)} kg</p></CardContent></Card>
            </div>

            <Separator className="my-6 bg-border" />

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground">Variações do Produto</h3>
                    <p className="text-xs text-muted-foreground">Gerencie diferentes versões (ex: cor, tamanho).</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => {
                        const newVariant: AdminProductVariant = {
                            id: `v_${Date.now()}`,
                            sku: `${form.sku}-${(form.variants?.length || 0) + 1}`,
                            name: "",
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
                        <div key={variant.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg border border-border bg-muted/20 items-end">
                           <div className="md:col-span-4 space-y-1.5">
                              <Label className="text-xs">Nome (ex: Preto / G)</Label>
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
                           <div className="md:col-span-3 space-y-1.5">
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
                           <div className="md:col-span-2 space-y-1.5">
                              <Label className="text-xs">Preço (R$)</Label>
                              <Input 
                                type="number"
                                placeholder="Padrão"
                                value={variant.price || ""} 
                                className="h-8 text-sm"
                                onChange={(e) => {
                                    const newVariants = [...(form.variants || [])];
                                    newVariants[index] = { ...newVariants[index], price: e.target.value ? Number(e.target.value) : undefined };
                                    setForm(c => ({ ...c, variants: newVariants }));
                                }}
                              />
                           </div>
                           <div className="md:col-span-2 space-y-1.5">
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
                     <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-primary font-medium">
                           💡 Total em estoque (variantes): {form.variants.reduce((acc, v) => acc + v.stockQuantity, 0)} unidades
                        </p>
                     </div>
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
            <DialogDescription>Registros por produto para auditoria e rotinas futuras de conciliação.</DialogDescription>
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
                <TableHead>Status</TableHead>
                <TableHead>Gateway/Frete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.length === 0 ? (
                <TableRow className="border-border"><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Sem histórico para este produto.</TableCell></TableRow>
              ) : (
                purchaseHistory.map((row) => (
                  <TableRow key={row.id} className="border-border">
                    <TableCell className="font-mono text-xs">{row.orderCode}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-right">{row.quantity}</TableCell>
                    <TableCell className="text-right">{money(row.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{money(row.total)}</TableCell>
                    <TableCell><Badge variant="outline">{row.paymentStatus}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.paymentGateway ?? "-"} / {row.shippingCarrier ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductsPage;
