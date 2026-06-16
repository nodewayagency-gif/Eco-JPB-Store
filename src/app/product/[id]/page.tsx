'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ChevronDown, Mail, Check, ShoppingCart, Shield, Zap, Award, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { productImages } from "@/lib/productImages";
import { resolveProductImage } from "@/lib/imageResolver";
import { useCart } from "@/providers/CartContext";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";

export const TOPIC_ICONS: Record<string, any> = {
  Check,
  Star,
  Shield,
  Zap,
  Award,
  Leaf
};

export const parseTopic = (t: string) => {
  try {
    const parsed = JSON.parse(t);
    if (parsed && typeof parsed === 'object' && parsed.text !== undefined) {
      return { text: parsed.text, icon: parsed.icon || "Check" };
    }
  } catch (e) { }
  return { text: t, icon: "Check" };
};

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground mt-4 text-xs font-black uppercase tracking-widest">Sincronizando detalhes...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  const productImagesArray = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: waitlistEmail,
          productId: product.id,
          productName: product.name
        })
      });

      if (response.ok) {
        setWaitlistSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center lg:justify-start"
            >
              <div className="group relative sticky top-24 w-full max-w-md xl:max-w-lg mx-auto lg:mx-0">
                <div className="absolute -inset-2 md:-inset-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.32)_0%,rgba(225,171,45,0)_68%)] blur-2xl" />
                </div>
                <div className="relative z-10 premium-card rounded-2xl overflow-hidden mb-4">
                  <div className="aspect-square flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <motion.img
                      key={selectedColor + selectedImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      src={resolveProductImage(productImagesArray[selectedImage]) || ""}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:-rotate-2 drop-shadow-md group-hover:drop-shadow-[0_20px_30px_rgba(225,171,45,0.15)]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {productImagesArray.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 snap-start premium-card rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all ${selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-white/20'
                        }`}
                    >
                      <img src={resolveProductImage(img) || ""} alt={`Thumb ${idx}`} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="space-y-8"
            >
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">{product.category}</p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground break-words">{product.name}</h1>

                <div className="flex items-center gap-2 mt-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews.toLocaleString("pt-BR")} avaliações)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {product.freeShipping && (
                  <span className="text-xs font-black uppercase tracking-tighter text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                    Frete Grátis
                  </span>
                )}
              </div>


              {product.topics && product.topics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="py-2"
                >
                  <ul className="grid grid-cols-1 gap-3">
                    {product.topics.map((topic, index) => {
                      const parsed = parseTopic(topic);
                      const CurrentIcon = TOPIC_ICONS[parsed.icon] || Check;
                      return (
                        <li key={index} className="flex items-start gap-3 bg-secondary/30 p-3 rounded-xl border border-border/30">
                          <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <CurrentIcon className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-foreground/90 leading-relaxed font-medium">{parsed.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-sm font-bold tracking-tight text-foreground mb-4">
                  Escolha sua cor
                </p>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(i)}
                      className={`group relative flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${selectedColor === i
                        ? "bg-white/[0.03] border-primary shadow-[0_0_20px_rgba(225,171,45,0.1)]"
                        : "bg-transparent border-white/10 hover:border-white/20"
                        }`}
                    >
                      <span
                        className="block h-5 w-5 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className={`text-xs font-bold transition-colors ${selectedColor === i ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {c.name}
                      </span>
                      {selectedColor === i && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 rounded-2xl border border-primary pointer-events-none"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>

              {product.inStock ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Button
                    size="lg"
                    className="w-full h-auto min-h-[4rem] py-3 shimmer-btn rounded-2xl text-base sm:text-lg font-black gap-2 sm:gap-3 shadow-[0_10px_40px_-10px_rgba(225,171,45,0.3)] hover:shadow-[0_15px_50px_-5px_rgba(225,171,45,0.4)] transition-all duration-500 flex-wrap justify-center"
                    onClick={() => addItem(product, product.colors[selectedColor].name)}
                  >
                    <ShoppingCart className="h-5 w-5 shrink-0" />
                    <span className="text-center">Comprar — {formatPrice(product.price)}</span>
                  </Button>
                </motion.div>
              ) : (
                <div className="bg-secondary rounded-2xl p-6 space-y-4">
                  {waitlistSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 justify-center py-4"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Inscrição confirmada!</p>
                        <p className="text-xs text-muted-foreground">Avisaremos quando estiver disponível.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Produto esgotado</p>
                        <p className="text-xs text-muted-foreground">Cadastre-se para ser avisado quando voltar ao estoque.</p>
                      </div>
                      <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            required
                            placeholder="seu@email.com"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <Button type="submit" className="rounded-xl px-6 h-12 sm:h-auto">
                          Avisar-me
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="specs" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                    Especificações Técnicas
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {product.specs.map((spec) => (
                        <div key={spec.label}>
                          <p className="text-xs text-muted-foreground">{spec.label}</p>
                          <p className="text-sm font-medium text-foreground">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                    Frete e Entregas
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Frete grátis para todo o Brasil em compras acima de R$ 500,00.
                      Entrega em até 7 dias úteis.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="warranty" className="border-border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                    Garantia
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Garantia de 6 meses contra defeitos de fabricação.
                      30 dias para devolução sem custo.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>

          {/* Related Products Section */}
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function RelatedProducts({ currentProductId, category }: { currentProductId: string, category: string }) {
  const { data: products, isLoading } = useProducts();

  if (isLoading) return null;

  const allProducts = products || [];

  // Tenta filtrar pela mesma categoria (case-insensitive)
  let related = allProducts.filter(p =>
    p.category.toLowerCase() === category.toLowerCase() &&
    p.id !== currentProductId
  );

  // Se não houver nada na mesma categoria, pega produtos aleatórios/recentes como fallback
  if (related.length === 0) {
    related = allProducts
      .filter(p => p.id !== currentProductId)
      .sort(() => 0.5 - Math.random()); // Shuffle simples
  }

  const finalRelated = related.slice(0, 4);

  if (finalRelated.length === 0) return null;

  return (
    <div className="mt-32">
      <div className="flex flex-col mb-12">
        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">Você também pode gostar</span>
        <h2 className="text-3xl md:text-4xl font-black text-foreground">Produtos <span className="gold-text">{related.length > 0 && finalRelated[0].category.toLowerCase() === category.toLowerCase() ? "Relacionados" : "em Destaque"}</span></h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {finalRelated.map((p, idx) => (
          <ProductCard key={p.id} product={p} index={idx} />
        ))}
      </div>
    </div>
  );
}
