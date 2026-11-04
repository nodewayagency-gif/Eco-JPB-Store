'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Phone, MapPin, Building2, UserCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth/AuthProvider";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { api } from "@/services/api";
import { maskCEP, maskDocument, maskPhone } from "@/lib/utils";

function RegisterForm() {
  const { registerCustomer, isCustomerAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("from") || "/minha-conta";

  const [docType, setDocType] = useState<"CPF" | "CNPJ">("CPF");
  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (isCustomerAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isCustomerAuthenticated, router, redirectTo]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    document: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const handleDocumentChange = (v: string) => {
    setForm({ ...form, document: maskDocument(v) });
  };

  // CNPJ Auto-fill
  useEffect(() => {
    const fetchCNPJ = async () => {
      const cleanCNPJ = form.document.replace(/\D/g, "");
      if (docType === "CNPJ" && cleanCNPJ.length === 14) {
        setCnpjLoading(true);
        try {
          const { data } = await api.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
          setForm(prev => ({
            ...prev,
            name: data.razao_social || data.nome_fantasia || prev.name,
            zipCode: maskCEP(data.cep || ""),
            street: data.logradouro || prev.street,
            number: data.numero || prev.number,
            complement: data.complemento || prev.complement,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.municipio || prev.city,
            state: data.uf || prev.state
          }));
          toast.success("Dados da empresa importados!");
        } catch (error) {
          toast.error("CNPJ não encontrado ou erro na busca");
        } finally {
          setCnpjLoading(false);
        }
      }
    };
    fetchCNPJ();
  }, [form.document, docType]);

  // CEP Auto-fill
  useEffect(() => {
    const fetchCEP = async () => {
      const cleanCEP = form.zipCode.replace(/\D/g, "");
      if (cleanCEP.length === 8) {
        setCepLoading(true);
        try {
          const { data } = await api.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
          if (data.erro) throw new Error();
          setForm(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        } catch (error) {
          toast.error("CEP não encontrado");
        } finally {
          setCepLoading(false);
        }
      }
    };
    fetchCEP();
  }, [form.zipCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error("A senha deve ter pelo menos 6 caracteres");
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("As senhas não coincidem");
    }
    
    setLoading(true);
    try {
      await registerCustomer({
        ...form,
        documentType: docType,
        document: form.document.replace(/\D/g, ""),
        phone: form.phone.replace(/\D/g, ""),
        zipCode: form.zipCode.replace(/\D/g, "")
      });
      toast.success("Cadastro realizado com sucesso!");
      router.push(redirectTo);
    } catch (error: any) {
      const msg = error.response?.status === 404 
        ? "Sistema de cadastro temporariamente indisponível" 
        : (error.response?.data?.message || "Erro ao realizar cadastro. Verifique os dados e tente novamente.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-card border-border overflow-hidden shadow-2xl">
            <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60 w-full" />
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-primary" /> Crie sua conta
              </CardTitle>
              <CardDescription>Preencha os dados abaixo para uma experiência de compra premium.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex p-1 bg-secondary rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => { setDocType("CPF"); setForm({ ...form, document: "" }); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${docType === "CPF" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    PESSOA FÍSICA
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDocType("CNPJ"); setForm({ ...form, document: "" }); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${docType === "CNPJ" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    PESSOA JURÍDICA
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{docType === "CPF" ? "CPF" : "CNPJ"}</Label>
                      <div className="relative">
                        <Input
                          placeholder={docType === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                          value={form.document}
                          onChange={(e) => handleDocumentChange(e.target.value)}
                          required
                          className="bg-background"
                        />
                        {cnpjLoading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-primary" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone / WhatsApp</Label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{docType === "CPF" ? "Nome Completo" : "Razão Social"}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={docType === "CPF" ? "Como deseja ser chamado" : "Nome ou Razão Social"}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                          className="pl-10 bg-background"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Repita a senha"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          required
                          className="pl-10 bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 pb-2">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Endereço de Entrega Principal</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2 sm:col-span-1">
                        <Label>CEP</Label>
                        <div className="relative">
                          <Input
                            placeholder="00000-000"
                            value={form.zipCode}
                            onChange={(e) => setForm({ ...form, zipCode: maskCEP(e.target.value) })}
                            required
                            className="bg-background"
                          />
                          {cepLoading && <Loader2 className="absolute right-2 top-2.5 h-3 w-3 animate-spin text-primary" />}
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-3">
                        <Label>Rua / Logradouro</Label>
                        <Input
                          value={form.street}
                          onChange={(e) => setForm({ ...form, street: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input
                          value={form.number}
                          onChange={(e) => setForm({ ...form, number: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input
                          placeholder="Ex: Apto 123 / Bloco B"
                          value={form.complement}
                          onChange={(e) => setForm({ ...form, complement: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input
                          value={form.neighborhood}
                          onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado (UF)</Label>
                        <Input
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                          required
                          maxLength={2}
                          className="bg-background uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 shimmer-btn rounded-xl font-bold" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Criar minha conta <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-2">
                  Já tem uma conta? <Link href="/login" className="text-primary font-bold hover:underline">Faça login</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
