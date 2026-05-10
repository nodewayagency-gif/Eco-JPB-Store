'use client';

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const allProducts = products || [];

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map((product) => product.category)));
    return ["Todos", ...cats];
  }, [allProducts]);

  const filtered = useMemo(() => {
    return allProducts.filter((product) => {
      const byCategory = activeCategory === "Todos" || product.category === activeCategory;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const byName =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch);

      return byCategory && byName;
    });
  }, [allProducts, activeCategory, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground mt-4 text-xs font-black uppercase tracking-widest">Organizando catálogo...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[780px] h-[780px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <section className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-xs font-semibold tracking-widest uppercase gold-text">Catálogo</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mt-3">
              Nossos <span className="gold-text">Produtos</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">
              Navegue pelos eletrônicos premium da JPB e encontre o modelo ideal para seu estilo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-10 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-4 md:p-6 space-y-5"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome do produto..."
                className="pl-10 h-11 rounded-xl border-border/70 bg-background/80"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background/70 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-5 text-sm text-muted-foreground text-center"
          >
            {filtered.length} produto{filtered.length === 1 ? "" : "s"} encontrado{filtered.length === 1 ? "" : "s"}
          </motion.div>

          <section className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${searchTerm}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              >
                {filtered.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 ? (
              <div className="text-center py-14 rounded-2xl border border-border/70 bg-card/40 mt-2">
                <p className="text-foreground font-medium">Nenhum produto encontrado</p>
                <p className="text-sm text-muted-foreground mt-2">Tente outro nome ou remova os filtros.</p>
              </div>
            ) : null}
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
