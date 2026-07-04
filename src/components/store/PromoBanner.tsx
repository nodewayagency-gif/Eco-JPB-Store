"use client";

import { Sparkles } from "lucide-react";

const PromoBanner = () => {
  // Bloco de conteúdo que será duplicado para criar o loop perfeito.
  // Usamos um array de 10 itens para garantir que a tela seja preenchida mesmo em monitores ultrawide.
  const content = [...Array(10)].map((_, i) => (
    <div key={i} className="flex items-center gap-8 shrink-0">
      <span className="text-white text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Cupom <span className="text-primary">PRIMEIRACOMPRA</span> 10% off
      </span>
      <span className="text-white/20 text-[10px] shrink-0">•</span>
    </div>
  ));

  return (
    <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-1.5 overflow-hidden flex items-center relative">
      {/* 
        O container animado translada exatos -50%. 
        Como ele tem duas cópias idênticas do conteúdo, o fim da translação (-50%) 
        vai bater perfeitamente no início visual da segunda cópia, tornando o corte invisível.
      */}
      <div className="flex whitespace-nowrap animate-marquee w-max gap-8">
        {/* Bloco 1 */}
        <div className="flex items-center gap-8 shrink-0">
          {content}
        </div>
        {/* Bloco 2 (cópia exata para o loop perfeito) */}
        <div className="flex items-center gap-8 shrink-0">
          {content}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
