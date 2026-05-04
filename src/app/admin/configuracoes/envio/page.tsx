'use client';

import { useEffect, useState } from "react";
import { Save, Truck } from "lucide-react";
import type { ShippingIntegrationSettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";
import { toast } from "sonner";

export default function AdminShippingSettingsPage() {
  const [form, setForm] = useState<ShippingIntegrationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminSettingsRepository.getShippingSettings().then(setForm);
  }, []);

  const onSave = async () => {
    if (!form) return;
    setLoading(true);
    try {
      await adminSettingsRepository.saveShippingSettings(form);
      toast.success("Integrações de envio salvas!");
    } catch (error) {
      toast.error("Erro ao salvar integrações.");
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Carregando configurações de envio...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrações de Envio</h1>
        <p className="text-sm text-muted-foreground">Conecte sua loja com os principais serviços de logística do Brasil.</p>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Mercado Livre (Mercado Envios)
              </CardTitle>
              <CardDescription>Envie seus produtos utilizando a logística do Mercado Livre.</CardDescription>
            </div>
            <Switch 
              checked={form.mercadoLivre.enabled} 
              onCheckedChange={(checked) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, enabled: checked } })} 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>App ID</Label>
              <Input 
                value={form.mercadoLivre.appId} 
                onChange={(e) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, appId: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input 
                type="password"
                value={form.mercadoLivre.clientSecret} 
                onChange={(e) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, clientSecret: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Access Token</Label>
              <Input 
                type="password"
                value={form.mercadoLivre.accessToken} 
                onChange={(e) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, accessToken: e.target.value } })} 
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
                <Truck className="w-5 h-5 text-primary" /> Melhor Envio
              </CardTitle>
              <CardDescription>Cotação e gestão de fretes com diversas transportadoras.</CardDescription>
            </div>
            <Switch 
              checked={form.melhorEnvio.enabled} 
              onCheckedChange={(checked) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, enabled: checked } })} 
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input 
                value={form.melhorEnvio.clientId} 
                onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, clientId: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input 
                type="password"
                value={form.melhorEnvio.clientSecret} 
                onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, clientSecret: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Access Token</Label>
              <Input 
                type="password"
                value={form.melhorEnvio.accessToken} 
                onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, accessToken: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Token Type</Label>
              <Input 
                value={form.melhorEnvio.tokenType ?? "Bearer"} 
                onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, tokenType: e.target.value } })} 
                className="bg-background border-border"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ambiente Sandbox</Label>
                <p className="text-[10px] text-muted-foreground">Ative para realizar testes sem gerar etiquetas reais.</p>
              </div>
              <Switch 
                checked={form.melhorEnvio.sandbox} 
                onCheckedChange={(checked) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, sandbox: checked } })} 
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
