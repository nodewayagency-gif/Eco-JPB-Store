'use client';

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Truck,
  Percent,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/services/api";

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function AdminCheckoutRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "FREE_SHIPPING",
    active: true,
    minSubtotal: "",
    discountPercentage: "",
    discountFixed: "",
    paymentMethod: "ALL",
    targetStates: [] as string[],
    priority: "0"
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/checkout-rules");
      setRules(data);
    } catch (error) {
      toast.error("Erro ao carregar regras de checkout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openDialog = (rule?: any) => {
    if (rule) {
      setEditingRule(rule);
      setForm({
        name: rule.name || "",
        description: rule.description || "",
        type: rule.type || "FREE_SHIPPING",
        active: rule.active !== undefined ? rule.active : true,
        minSubtotal: rule.minSubtotal ? String(rule.minSubtotal) : "",
        discountPercentage: rule.discountPercentage ? String(rule.discountPercentage) : "",
        discountFixed: rule.discountFixed ? String(rule.discountFixed) : "",
        paymentMethod: rule.paymentMethod || "ALL",
        targetStates: rule.targetStates || [],
        priority: String(rule.priority || 0)
      });
    } else {
      setEditingRule(null);
      setForm({
        name: "",
        description: "",
        type: "FREE_SHIPPING",
        active: true,
        minSubtotal: "200",
        discountPercentage: "",
        discountFixed: "",
        paymentMethod: "ALL",
        targetStates: [],
        priority: "0"
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error("Informe o nome da regra");
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        active: form.active,
        minSubtotal: form.minSubtotal ? parseFloat(form.minSubtotal.replace(",", ".")) : null,
        discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage.replace(",", ".")) : null,
        discountFixed: form.discountFixed ? parseFloat(form.discountFixed.replace(",", ".")) : null,
        paymentMethod: form.paymentMethod === "ALL" ? null : form.paymentMethod,
        targetStates: form.targetStates,
        priority: parseInt(form.priority, 10) || 0
      };

      if (editingRule) {
        await api.put(`/admin/checkout-rules/${editingRule.id}`, payload);
        toast.success("Regra atualizada com sucesso!");
      } else {
        await api.post("/admin/checkout-rules", payload);
        toast.success("Regra criada com sucesso!");
      }

      setDialogOpen(false);
      fetchRules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar regra");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rule: any) => {
    try {
      await api.put(`/admin/checkout-rules/${rule.id}`, { active: !rule.active });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
      toast.success(rule.active ? "Regra desativada" : "Regra ativada");
    } catch (error) {
      toast.error("Erro ao alterar status da regra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta regra de checkout?")) return;
    try {
      await api.delete(`/admin/checkout-rules/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success("Regra removida com sucesso");
    } catch (error) {
      toast.error("Erro ao remover regra");
    }
  };

  const toggleState = (uf: string) => {
    setForm(prev => {
      const exists = prev.targetStates.includes(uf);
      return {
        ...prev,
        targetStates: exists
          ? prev.targetStates.filter(s => s !== uf)
          : [...prev.targetStates, uf]
      };
    });
  };

  const activeShippingRules = rules.filter(r => r.type === "FREE_SHIPPING" && r.active);
  const activeDiscounts = rules.filter(r => r.type === "PAYMENT_DISCOUNT" && r.active);

  return (
    <div className="space-y-6 max-w-6xl pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Regras de Checkout & Frete</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure regras de Frete Grátis dinâmico, descontos por Pix e pedidos mínimos que se aplicam em tempo real.
          </p>
        </div>

        <Button onClick={() => openDialog()} className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold gap-2 h-10 shadow-sm">
          <Plus className="w-4 h-4" /> Nova Regra
        </Button>
      </div>

      {/* Resumo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/40 border-zinc-800/80 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase text-zinc-400">Frete Grátis Ativo</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            {activeShippingRules.length > 0 ? (
              <span className="text-emerald-400">
                {activeShippingRules[0].minSubtotal ? `Acima de R$ ${Number(activeShippingRules[0].minSubtotal).toFixed(2)}` : "Ativo Geral"}
              </span>
            ) : (
              <span className="text-zinc-500 text-sm">Nenhuma regra ativa</span>
            )}
          </p>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/80 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Percent className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase text-zinc-400">Descontos no Pagamento</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            {activeDiscounts.length > 0 ? (
              <span className="text-amber-400">{activeDiscounts.length} regra(s) ativa(s)</span>
            ) : (
              <span className="text-zinc-500 text-sm">Sem descontos</span>
            )}
          </p>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/80 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase text-zinc-400">Total de Regras</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{rules.length}</p>
        </Card>
      </div>

      {/* Lista de Regras */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Carregando regras de checkout...</p>
        </div>
      ) : rules.length === 0 ? (
        <Card className="bg-zinc-900/30 border-dashed border-zinc-800 py-16 text-center rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 flex items-center justify-center text-zinc-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-200">Nenhuma regra de checkout configurada</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Crie sua primeira regra de Frete Grátis ou Desconto no Pix para atrair mais conversões no checkout.
              </p>
            </div>
            <Button onClick={() => openDialog()} className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold mt-2">
              <Plus className="w-4 h-4 mr-1.5" /> Criar Primeira Regra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rules.map((rule) => {
            const isShipping = rule.type === "FREE_SHIPPING";
            const isDiscount = rule.type === "PAYMENT_DISCOUNT";

            return (
              <Card key={rule.id} className="bg-zinc-900/50 border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border mt-0.5 ${
                      isShipping
                        ? "bg-amber-400/10 border-amber-400/20 text-amber-400"
                        : isDiscount
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                    }`}>
                      {isShipping ? <Truck className="w-5 h-5" /> : isDiscount ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-100">{rule.name}</h3>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${
                          rule.active 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-zinc-800 text-zinc-500 border-zinc-700"
                        }`}>
                          {rule.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      {rule.description && (
                        <p className="text-xs text-zinc-400">{rule.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
                        {rule.minSubtotal && (
                          <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60 font-medium">
                            Subtotal Mínimo: <strong>R$ {Number(rule.minSubtotal).toFixed(2)}</strong>
                          </span>
                        )}
                        {rule.discountPercentage && (
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
                            {rule.discountPercentage}% OFF
                          </span>
                        )}
                        {rule.paymentMethod && (
                          <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
                            Meio: <strong className="text-zinc-200">{rule.paymentMethod}</strong>
                          </span>
                        )}
                        <span className="bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
                          Abrangência: <strong className="text-zinc-200">
                            {rule.targetStates && rule.targetStates.length > 0 
                              ? rule.targetStates.join(", ") 
                              : "Brasil Todo"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-2 mr-2">
                      <Label htmlFor={`active-${rule.id}`} className="text-xs text-zinc-400 cursor-pointer">
                        {rule.active ? "Ligada" : "Desligada"}
                      </Label>
                      <Switch 
                        id={`active-${rule.id}`}
                        checked={rule.active} 
                        onCheckedChange={() => handleToggleActive(rule)} 
                      />
                    </div>

                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => openDialog(rule)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-rose-400" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[540px] bg-zinc-950 border-zinc-800 text-zinc-100 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              {editingRule ? "Editar Regra de Checkout" : "Nova Regra de Checkout"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-300">Nome da Regra</Label>
              <Input
                placeholder="Ex: Frete Grátis Acima de R$ 250"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-300">Tipo de Regra</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="FREE_SHIPPING">Frete Grátis</SelectItem>
                    <SelectItem value="PAYMENT_DISCOUNT">Desconto no Pagamento</SelectItem>
                    <SelectItem value="MIN_ORDER_VALUE">Pedido Mínimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-300">Valor Mínimo Subtotal (R$)</Label>
                <Input
                  type="text"
                  placeholder="Ex: 250,00"
                  value={form.minSubtotal}
                  onChange={e => setForm({ ...form, minSubtotal: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            {form.type === "PAYMENT_DISCOUNT" && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Meio de Pagamento</Label>
                  <Select value={form.paymentMethod} onValueChange={v => setForm({ ...form, paymentMethod: v })}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="PIX">Pix (Imediato)</SelectItem>
                      <SelectItem value="TICKET">Boleto</SelectItem>
                      <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                      <SelectItem value="ALL">Qualquer Meio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-300">Desconto (% OFF)</Label>
                  <Input
                    placeholder="Ex: 5"
                    value={form.discountPercentage}
                    onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>
            )}

            {form.type === "FREE_SHIPPING" && (
              <div className="space-y-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-zinc-300">Estados Elegíveis</Label>
                  <span className="text-[10px] text-zinc-400">
                    {form.targetStates.length === 0 ? "Válido para todo o Brasil" : `${form.targetStates.length} estado(s) selecionado(s)`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                  {BRAZIL_STATES.map((uf) => {
                    const isSelected = form.targetStates.includes(uf);
                    return (
                      <button
                        key={uf}
                        type="button"
                        onClick={() => toggleState(uf)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          isSelected
                            ? "bg-amber-400 text-zinc-950 font-black shadow-sm"
                            : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                        }`}
                      >
                        {uf}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <Switch 
                  id="rule-active-switch" 
                  checked={form.active} 
                  onCheckedChange={c => setForm({ ...form, active: c })} 
                />
                <Label htmlFor="rule-active-switch" className="text-xs text-zinc-300 cursor-pointer">
                  Ativar regra imediatamente
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="h-9 border-zinc-800 text-zinc-300" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="h-9 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Regra"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

