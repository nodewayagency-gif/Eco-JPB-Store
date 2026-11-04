'use client';

import { useEffect, useState } from "react";
import { Save, Building2, Search, Instagram, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import type { CompanySettings } from "@premium/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSettingsRepository } from "@/services/api/adminSettingsRepository";
import { toast } from "sonner";
import axios from "axios";
import { cn, maskDocument, maskCEP, maskPhone } from "@/lib/utils";

export default function AdminCompanySettingsPage() {
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingCNPJ, setSearchingCNPJ] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);

  useEffect(() => {
    adminSettingsRepository.getCompanySettings().then(setForm);
  }, []);

  const onSave = async () => {
    if (!form) return;
    const cleanCNPJ = form.document ? form.document.replace(/\D/g, "") : "";
    if (cleanCNPJ && cleanCNPJ.length !== 14) {
      toast.error("O CNPJ deve conter 14 dígitos válidos.");
      return;
    }
    const cleanCEP = form.originZipCode ? form.originZipCode.replace(/\D/g, "") : "";
    if (cleanCEP && cleanCEP.length !== 8) {
      toast.error("O CEP de origem deve conter 8 dígitos.");
      return;
    }

    setLoading(true);
    try {
      await adminSettingsRepository.saveCompanySettings({
        ...form,
        document: cleanCNPJ ? maskDocument(cleanCNPJ) : form.document,
        originZipCode: cleanCEP ? maskCEP(cleanCEP) : form.originZipCode,
        state: (form.state || "").toUpperCase().slice(0, 2)
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleCNPJSearch = async () => {
    if (!form) return;
    const cleanCNPJ = form.document.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) {
      toast.error("CNPJ inválido para busca (digite 14 números).");
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
        state: data.uf
      });
      toast.success("Dados da empresa importados!");
    } catch (error) {
      toast.error("Erro ao buscar dados do CNPJ.");
    } finally {
      setSearchingCNPJ(false);
    }
  };

  const handleCEPSearch = async () => {
    if (!form) return;
    const cleanCEP = form.originZipCode.replace(/\D/g, "");
    if (cleanCEP.length !== 8) {
      toast.error("CEP inválido para busca (digite 8 números).");
      return;
    }

    setSearchingCEP(true);
    try {
      const { data } = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
      setForm({
        ...form,
        city: data.city,
        state: data.state,
        addressLine: data.street
      });
      toast.success("Endereço preenchido!");
    } catch (error) {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setSearchingCEP(false);
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-amber-400" />
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Dados da Loja & Empresa</h1>
          <p className="text-xs text-zinc-400">Configure as informações cadastrais públicas exibidas nos rodapés e e-mails.</p>
        </div>
      </div>

      {/* Dados Fiscais */}
      <Card className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 bg-zinc-950/60">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Identificação & Contatos</h2>
          <p className="text-[11px] text-zinc-400">CNPJ, razão social e canais oficiais de comunicação.</p>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">CNPJ</Label>
              <div className="flex gap-2">
                <Input
                  value={form.document}
                  onChange={(e) => setForm({ ...form, document: maskDocument(e.target.value) })}
                  placeholder="00.000.000/0001-00"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400 font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCNPJSearch}
                  disabled={searchingCNPJ}
                  className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200 shrink-0 rounded-lg"
                  title="Consultar CNPJ na Receita"
                >
                  <Search className={cn("w-3.5 h-3.5", searchingCNPJ && "animate-spin")} />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Razão Social</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Nome Fantasia</Label>
              <Input
                value={form.tradeName ?? ""}
                onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">E-mail de Atendimento</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Telefone de Suporte / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Instagram Oficial</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  value={form.instagramUrl ?? ""}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/jpbstorex"
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Origem Logística */}
      <Card className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <div className="p-4 px-6 border-b border-zinc-800/80 bg-zinc-950/60">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Endereço de Origem (Despacho de Frete)</h2>
          <p className="text-[11px] text-zinc-400">Ponto de partida utilizado no cálculo do frete com Correios e Melhor Envio.</p>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">CEP de Origem</Label>
              <div className="flex gap-2">
                <Input
                  value={form.originZipCode}
                  onChange={(e) => setForm({ ...form, originZipCode: maskCEP(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400 font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCEPSearch}
                  disabled={searchingCEP}
                  className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200 shrink-0 rounded-lg"
                  title="Buscar CEP"
                >
                  <Search className={cn("w-3.5 h-3.5", searchingCEP && "animate-spin")} />
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs text-zinc-300">Logradouro e Número</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Estado (UF)</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9 rounded-lg focus:ring-1 focus:ring-amber-400 uppercase"
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-2">
        <Button
          className="gap-2 h-10 px-6 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl shadow-sm transition-colors"
          onClick={onSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
