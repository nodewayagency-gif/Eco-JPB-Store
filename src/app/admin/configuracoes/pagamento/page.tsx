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
        <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 h-32">
          <CreditCard className="w-8 h-8 opacity-50" />
          <p>As configurações de pagamento agora são gerenciadas de forma segura e exclusiva através do arquivo <strong>.env</strong> do servidor.</p>
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
