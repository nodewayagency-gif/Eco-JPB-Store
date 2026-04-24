import { useEffect, useState } from "react";
import { Save, Truck } from "lucide-react";
import type { ShippingIntegrationSettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";

const AdminShippingSettingsPage = () => {
  const [form, setForm] = useState<ShippingIntegrationSettings | null>(null);

  useEffect(() => {
    adminSettingsRepository.getShippingSettings().then(setForm);
  }, []);

  if (!form) return null;

  const onSave = async () => {
    await adminSettingsRepository.saveShippingSettings(form);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />Mercado Livre</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Habilitado</Label><Switch checked={form.mercadoLivre.enabled} onCheckedChange={(checked) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, enabled: checked } })} /></div>
          <div className="space-y-2"><Label>App ID</Label><Input value={form.mercadoLivre.appId} onChange={(e) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, appId: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Client secret</Label><Input value={form.mercadoLivre.clientSecret} onChange={(e) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, clientSecret: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Access token</Label><Input value={form.mercadoLivre.accessToken} onChange={(e) => setForm({ ...form, mercadoLivre: { ...form.mercadoLivre, accessToken: e.target.value } })} /></div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />Melhor Envio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Habilitado</Label><Switch checked={form.melhorEnvio.enabled} onCheckedChange={(checked) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, enabled: checked } })} /></div>
          <div className="space-y-2"><Label>Client ID</Label><Input value={form.melhorEnvio.clientId} onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, clientId: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Client secret</Label><Input value={form.melhorEnvio.clientSecret} onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, clientSecret: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Access token</Label><Input value={form.melhorEnvio.accessToken} onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, accessToken: e.target.value } })} /></div>
          <div className="space-y-2"><Label>Token type</Label><Input value={form.melhorEnvio.tokenType ?? ""} onChange={(e) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, tokenType: e.target.value } })} /></div>
          <div className="flex items-center justify-between"><Label>Sandbox</Label><Switch checked={form.melhorEnvio.sandbox} onCheckedChange={(checked) => setForm({ ...form, melhorEnvio: { ...form.melhorEnvio, sandbox: checked } })} /></div>
        </CardContent>
      </Card>

      <Button className="gap-2" onClick={onSave}><Save className="w-4 h-4" />Salvar integrações de envio</Button>
    </div>
  );
};

export default AdminShippingSettingsPage;
