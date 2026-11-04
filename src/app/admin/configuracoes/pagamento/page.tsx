'use client';

import { CreditCard, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPaymentSettingsPage() {
  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Gateways de Pagamento</h1>
          <p className="text-xs text-zinc-400">Status das integrações com Mercado Pago (PIX, Cartão e Boleto).</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur overflow-hidden shadow-sm">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-md">
            <div className="flex justify-center mb-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-semibold">
                Protegido por Variáveis de Ambiente
              </Badge>
            </div>
            <h3 className="text-base font-bold text-zinc-100">Configuração Segura no Servidor</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              As chaves secretas do <strong>Mercado Pago</strong> (Access Token, Public Key e Webhook Secret) estão configuradas diretamente nas variáveis de ambiente seguras (<span className="font-mono text-zinc-300">.env</span>) do servidor, impedindo que tokens fiquem expostos a navegadores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
