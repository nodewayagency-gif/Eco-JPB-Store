import { useEffect, useState } from "react";
import { Save, Building2, Search, Instagram, Globe, Mail, Phone, MapPin } from "lucide-react";
import type { CompanySettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";
import { toast } from "sonner";
import axios from "axios";

// Helper masks
const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
};

const maskCEP = (value: string) => {
  return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

const AdminCompanySettingsPage = () => {
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingCNPJ, setSearchingCNPJ] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);

  useEffect(() => {
    adminSettingsRepository.getCompanySettings().then(setForm);
  }, []);

  if (!form) return null;

  const onSave = async () => {
    setLoading(true);
    try {
      await adminSettingsRepository.saveCompanySettings(form);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleCNPJSearch = async () => {
    const cleanCNPJ = form.document.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) {
      toast.error("CNPJ inválido para busca.");
      return;
    }

    setSearchingCNPJ(true);
    try {
      const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
      setForm({
        ...form,
        companyName: data.razao_social,
        tradeName: data.nome_fantasia || data.razao_social,
        originZipCode: maskCEP(data.cep),
        addressLine: `${data.logradouro}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ""}`,
        city: data.municipio,
        state: data.uf,
      });
      toast.success("Dados da empresa importados!");
    } catch (error) {
      toast.error("Erro ao buscar CNPJ.");
    } finally {
      setSearchingCNPJ(false);
    }
  };

  const handleCEPSearch = async () => {
    const cleanCEP = form.originZipCode.replace(/\D/g, "");
    if (cleanCEP.length !== 8) {
      toast.error("CEP inválido para busca.");
      return;
    }

    setSearchingCEP(true);
    try {
      const { data } = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
      setForm({
        ...form,
        city: data.city,
        state: data.state,
        addressLine: data.street,
      });
      toast.success("Endereço atualizado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setSearchingCEP(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações da Loja</h1>
          <p className="text-sm text-muted-foreground">Gerencie as informações públicas e fiscais da sua empresa.</p>
        </div>
      </div>

      <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
        <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
          <CardTitle className="text-lg">Dados Fiscais e Contato</CardTitle>
          <CardDescription>Essas informações serão exibidas no rodapé e notas fiscais.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <div className="flex gap-2">
                <Input 
                  value={form.document} 
                  onChange={(e) => setForm({ ...form, document: maskCNPJ(e.target.value) })}
                  placeholder="00.000.000/0001-00"
                  className="bg-zinc-950 border-zinc-800"
                />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={handleCNPJSearch} 
                  disabled={searchingCNPJ}
                  className="shrink-0 bg-zinc-800 hover:bg-zinc-700"
                >
                  <Search className={cn("w-4 h-4", searchingCNPJ && "animate-spin")} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input 
                value={form.companyName} 
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} 
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input 
                value={form.tradeName ?? ""} 
                onChange={(e) => setForm({ ...form, tradeName: e.target.value })} 
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label>E-mail de Contato</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="pl-10 bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} 
                  className="pl-10 bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instagram (Link)</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  value={form.instagramUrl ?? ""} 
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} 
                  placeholder="https://instagram.com/sualoja"
                  className="pl-10 bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
        <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
          <CardTitle className="text-lg">Endereço de Origem (Logística)</CardTitle>
          <CardDescription>Utilizado para cálculo de frete e devoluções.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>CEP</Label>
              <div className="flex gap-2">
                <Input 
                  value={form.originZipCode} 
                  onChange={(e) => setForm({ ...form, originZipCode: maskCEP(e.target.value) })} 
                  className="bg-zinc-950 border-zinc-800"
                />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={handleCEPSearch} 
                  disabled={searchingCEP}
                  className="shrink-0 bg-zinc-800 hover:bg-zinc-700"
                >
                  <Search className={cn("w-4 h-4", searchingCEP && "animate-spin")} />
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Logradouro / Número</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  value={form.addressLine} 
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })} 
                  className="pl-10 bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input 
                value={form.city} 
                onChange={(e) => setForm({ ...form, city: e.target.value })} 
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Input 
                value={form.state} 
                onChange={(e) => setForm({ ...form, state: e.target.value })} 
                className="bg-zinc-950 border-zinc-800"
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          className="gap-2 h-12 px-8 bg-primary text-black font-bold hover:bg-primary/90 shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)]" 
          onClick={onSave}
          disabled={loading}
        >
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

// Simple cn utility if not globally available
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default AdminCompanySettingsPage;

