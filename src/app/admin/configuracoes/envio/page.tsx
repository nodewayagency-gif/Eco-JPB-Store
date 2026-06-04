'use client';

import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminShippingSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrações de Envio</h1>
        <p className="text-sm text-muted-foreground">Conecte sua loja com os principais serviços de logística do Brasil.</p>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center gap-4 h-48">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
             <Truck className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-lg font-medium text-foreground">Configurado via Variáveis de Ambiente</p>
          <p className="max-w-md">As configurações, credenciais e tokens de integrações logísticas (como Melhor Envio) agora são configuradas de forma segura através do arquivo <strong>.env</strong> do servidor, evitando exposição no painel.</p>
        </CardContent>
      </Card>
    </div>
  );
}
