'use client';

import { useEffect, useState } from "react";
import { CreditCard, Save } from "lucide-react";
import type { PaymentGatewaySettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";
import { toast } from "sonner";

export default function AdminPaymentSettingsPage() {
  const [form, setForm] = useState<PaymentGatewaySettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminSettingsRepository.getPaymentSettings().then(setForm);
  }, []);

  const onSave = async () => {
    if (!form) return;
    setLoading(true);
    try {
      await adminSettingsRepository.savePaymentSettings(form);
      toast.success("Integrações de pagamento salvas!");
    } catch (error) {
      toast.error("Erro ao salvar integrações.");
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Carregando configurações de pagamento...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gateways de Pagamento</h1>
        <p className="text-sm text-muted-foreground">Configure como você deseja receber os pagamentos dos seus clientes.</p>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Mercado Pago
              </CardTitle>
              <CardDescription>Receba via PIX, Cartão de Crédito e Boleto.</CardDescription>
            </div>
            <Switch 
              checked={form.mercadoPago.enabled} 
              onCheckedChange={(checked) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, enabled: checked } })} 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Public Key</Label>
              <Input 
                value={form.mercadoPago.publicKey} 
                onChange={(e) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, publicKey: e.target.value } })} 
                className="bg-background border-border"
                placeholder="APP_USR-..."
              />
            </div>
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input 
                type="password"
                value={form.mercadoPago.accessToken} 
                onChange={(e) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, accessToken: e.target.value } })} 
                className="bg-background border-border"
                placeholder="APP_USR-..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Webhook Secret</Label>
              <Input 
                value={form.mercadoPago.webhookSecret} 
                onChange={(e) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, webhookSecret: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Asaas
              </CardTitle>
              <CardDescription>Solução completa para cobranças e gestão financeira.</CardDescription>
            </div>
            <Switch 
              checked={form.asaas.enabled} 
              onCheckedChange={(checked) => setForm({ ...form, asaas: { ...form.asaas, enabled: checked } })} 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input 
                type="password"
                value={form.asaas.apiKey} 
                onChange={(e) => setForm({ ...form, asaas: { ...form.asaas, apiKey: e.target.value } })} 
                className="bg-background border-border"
                placeholder="$a..."
              />
            </div>
            <div className="space-y-2">
              <Label>Wallet ID</Label>
              <Input 
                value={form.asaas.walletId ?? ""} 
                onChange={(e) => setForm({ ...form, asaas: { ...form.asaas, walletId: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Webhook Secret</Label>
              <Input 
                value={form.asaas.webhookSecret} 
                onChange={(e) => setForm({ ...form, asaas: { ...form.asaas, webhookSecret: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          className="gap-2 h-12 px-8 bg-primary text-primary-foreground font-bold hover:bg-primary/90" 
          onClick={onSave}
          disabled={loading}
        >
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Integrações"}
        </Button>
      </div>
    </div>
  );
}
