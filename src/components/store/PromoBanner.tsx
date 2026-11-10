"use client";

import { Flame } from "lucide-react";

const PromoBanner = () => {
  // Bloco de conteúdo que será duplicado para criar o loop contínuo
  const content = [...Array(8)].map((_, i) => (
    <div key={i} className="flex items-center gap-8 shrink-0">
      <span className="text-red-800 text-xs font-bold tracking-wider flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-red-700 fill-red-700 shrink-0" />
        <span>Black Friday JPB 30% OFF</span>
      </span>
      <span className="text-red-800/40 text-[10px] shrink-0">•</span>
    </div>
  ));

  return (
    <div className="w-full bg-white border-y border-red-100/60 py-1.5 overflow-hidden flex items-center relative">
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
