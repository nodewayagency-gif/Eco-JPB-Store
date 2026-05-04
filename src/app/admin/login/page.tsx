'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, LogIn, ArrowLeft, Mail, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth/AuthProvider";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { isAdminAuthenticated, loginAdmin, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAdminAuthenticated) {
      router.replace("/admin");
    }
  }, [isLoading, isAdminAuthenticated, router]);

  const redirectTo = searchParams.get("from") || "/admin";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin({ email, password });
      toast.success("Painel administrativo acessado!");
      router.replace(redirectTo);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha no login administrativo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Orbs with darker colors for Admin */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-amber-500/5 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-amber-500/10 rounded-full blur-[140px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/5">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1 uppercase tracking-widest">Admin Control</h1>
          <p className="text-muted-foreground text-sm font-medium">Eco-JPB Management Portal</p>
        </div>

        <div className="bg-[#111]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Usuário / E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@ecojpb.com"
                  className="pl-10 bg-black/40 border-white/5 focus:border-amber-500/40 h-11 text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="admin-password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Senha</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-black/40 border-white/5 focus:border-amber-500/40 h-11 text-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 text-red-400 py-2.5 px-4 text-xs">
                  <AlertDescription className="font-medium text-center">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button 
              className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-[0_8px_30px_-8px_rgba(217,119,6,0.3)] transition-all active:scale-[0.98] mt-2 group" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-500" />
                  ENTRAR NO SISTEMA
                </>
              )}
            </Button>
          </form>
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground/40 hover:text-primary transition-colors text-xs font-medium group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Voltar para Login de Cliente
          </Link>
        </div>
        
        <div className="mt-12 text-center opacity-20 flex flex-col items-center gap-2">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-white to-transparent" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Security Level 4</span>
        </div>
      </motion.div>
    </div>
  );
}
