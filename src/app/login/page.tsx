'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, User, ArrowLeft, ShieldCheck, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth/AuthProvider";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
  const { isCustomerAuthenticated, loginCustomer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isCustomerAuthenticated) {
      router.replace("/minha-conta");
    }
  }, [isCustomerAuthenticated, router]);

  const redirectTo = searchParams.get("from") || "/minha-conta";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginCustomer({ email, password });
      toast.success("Bem-vindo de volta!");
      router.replace(redirectTo);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha no login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCustomerAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all">
              <ArrowLeft className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Voltar para a loja</span>
          </Link>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Acesso ao Cliente</h1>
          <p className="text-muted-foreground text-sm">Bem-vindo à Eco-JPB Store. Faça login para continuar.</p>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 bg-secondary/30 border-border/50 focus:border-primary/50 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</Label>
                <button type="button" className="text-[11px] text-primary hover:underline">Esqueceu a senha?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-secondary/30 border-border/50 focus:border-primary/50 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2 px-3">
                  <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-[0_8px_20px_-8px_rgba(var(--primary),0.5)] transition-all hover:scale-[1.01] active:scale-[0.98] group" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Entrar na Conta
                  <LogIn className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Ainda não tem uma conta?
            </p>
            <Link href="/cadastro">
              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all h-11">
                Criar Nova Conta
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground/60">
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pagamento 100% Seguro</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5" />
            <span>Dados Protegidos (LGPD)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
