import { useEffect, useState } from "react";
import { CreditCard, Save } from "lucide-react";
import type { PaymentGatewaySettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";

const AdminPaymentSettingsPage = () => {
  const [form, setForm] = useState<PaymentGatewaySettings | null>(null);

  useEffect(() => {
    adminSettingsRepository.getPaymentSettings().then(setForm);
  }, []);

  if (!form) return null;

  const onSave = async () => {
    await adminSettingsRepository.savePaymentSettings(form);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Mercado Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Habilitado</Label><Switch checked={form.mercadoPago.enabled} onCheckedChange={(checked) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, enabled: checked } })} /></div>
          <div className="space-y-2"><Label>Public key</Label><Input value={form.mercadoPago.publicKey} onChange={(e) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, publicKey: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Access token</Label><Input value={form.mercadoPago.accessToken} onChange={(e) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, accessToken: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Webhook secret</Label><Input value={form.mercadoPago.webhookSecret} onChange={(e) => setForm({ ...form, mercadoPago: { ...form.mercadoPago, webhookSecret: e.target.value } })} /></div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Asaas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Habilitado</Label><Switch checked={form.asaas.enabled} onCheckedChange={(checked) => setForm({ ...form, asaas: { ...form.asaas, enabled: checked } })} /></div>
          <div className="space-y-2"><Label>API key</Label><Input value={form.asaas.apiKey} onChange={(e) => setForm({ ...form, asaas: { ...form.asaas, apiKey: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Wallet ID</Label><Input value={form.asaas.walletId ?? ""} onChange={(e) => setForm({ ...form, asaas: { ...form.asaas, walletId: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Webhook secret</Label><Input value={form.asaas.webhookSecret} onChange={(e) => setForm({ ...form, asaas: { ...form.asaas, webhookSecret: e.target.value } })} /></div>
        </CardContent>
      </Card>

      <Button className="gap-2" onClick={onSave}><Save className="w-4 h-4" />Salvar integrações de pagamento</Button>
    </div>
  );
};

export default AdminPaymentSettingsPage;
