import { useEffect, useState } from "react";
import { Save, Building2 } from "lucide-react";
import type { CompanySettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";

const AdminCompanySettingsPage = () => {
  const [form, setForm] = useState<CompanySettings | null>(null);

  useEffect(() => {
    adminSettingsRepository.getCompanySettings().then(setForm);
  }, []);

  if (!form) return null;

  const onSave = async () => {
    await adminSettingsRepository.saveCompanySettings(form);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Informações da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Razão social</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
          <div className="space-y-2"><Label>Nome fantasia</Label><Input value={form.tradeName ?? ""} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} /></div>
          <div className="space-y-2"><Label>CNPJ</Label><Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
          <div className="space-y-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>CEP origem padrão</Label><Input value={form.originZipCode} onChange={(e) => setForm({ ...form, originZipCode: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Endereço</Label><Input value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} /></div>
          <div className="space-y-2"><Label>Cidade</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div className="space-y-2"><Label>UF</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
        </div>
        <Button className="gap-2" onClick={onSave}><Save className="w-4 h-4" />Salvar</Button>
      </CardContent>
    </Card>
  );
};

export default AdminCompanySettingsPage;
