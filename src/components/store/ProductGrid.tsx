import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const ProductGrid = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4 font-medium">Carregando curadoria...</p>
      </div>
    );
  }

  const displayProducts = products || [];
  const featuredProducts = displayProducts.slice(0, 6);
  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Curadoria exclusiva
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.1]">
            Seleção de
            <br />
            Performance
          </h2>
          <p className="text-muted-foreground mt-6 text-base md:text-lg leading-relaxed font-medium">
            Produtos testados e aprovados para entregar desempenho real e confiança na sua compra.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="flex justify-center pt-8"
        >
          <Link href="/produtos" className="w-full sm:w-auto">
            <Button className="w-full sm:w-[280px] h-12 rounded-xl gap-2 shimmer-btn">
              Ver catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;
