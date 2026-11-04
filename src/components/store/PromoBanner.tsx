"use client";

import { Flame } from "lucide-react";

const PromoBanner = () => {
  // Bloco de conteúdo que será duplicado para criar o loop contínuo
  const content = [...Array(8)].map((_, i) => (
    <div key={i} className="flex items-center gap-8 shrink-0">
      <span className="text-white text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
        <span>
          <span className="text-amber-400 font-black">Black Friday:</span> Produtos com até{" "}
          <span className="text-amber-400 font-black">30% de desconto</span> em todo o catálogo por tempo limitado!
        </span>
      </span>
      <span className="text-white/20 text-[10px] shrink-0">•</span>
    </div>
  ));

  return (
    <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-1.5 overflow-hidden flex items-center relative">
      <div className="flex whitespace-nowrap animate-marquee w-max gap-8">
        <div className="flex items-center gap-8 shrink-0">
          {content}
        </div>
        <div className="flex items-center gap-8 shrink-0">
          {content}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
