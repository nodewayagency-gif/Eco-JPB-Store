import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ChevronDown, Mail, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { products } from "@/data/products";
import { productImages } from "@/lib/productImages";
import { useCart } from "@/providers/CartContext";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  // Mocking multiple images for the new gallery (until real DB connects)
  const productImagesArray = [product.image, product.image, product.image];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail) setWaitlistSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="group relative sticky top-24">
                <div className="absolute -inset-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.32)_0%,rgba(225,171,45,0)_68%)] blur-2xl" />
                </div>
                
                {/* Main Image */}
                <div className="relative bg-secondary rounded-2xl aspect-square flex items-center justify-center p-12 lg:p-20 transition-all duration-500 group-hover:border-primary/35 group-hover:shadow-[0_20px_80px_rgba(225,171,45,0.15)] border border-border/40 mb-4">
                  <motion.img
                    key={selectedColor + selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={productImages[productImagesArray[selectedImage]]}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {productImagesArray.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 snap-start bg-secondary rounded-xl border-2 flex items-center justify-center p-3 transition-all ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <img src={productImages[img]} alt={`Thumb ${idx}`} className="w-full h-full object-contain opacity-80 hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="space-y-8"
            >
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">{product.category}</p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground">{product.name}</h1>

                {/* Rating */}
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

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Color Selector */}
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
                      className={`group relative flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${
                        selectedColor === i 
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

              {/* CTA */}
              {product.inStock ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Button
                    size="lg"
                    className="w-full h-16 shimmer-btn rounded-2xl text-lg font-black gap-3 shadow-[0_10px_40px_-10px_rgba(225,171,45,0.3)] hover:shadow-[0_15px_50px_-5px_rgba(225,171,45,0.4)] transition-all duration-500"
                    onClick={() => addItem(product, product.colors[selectedColor].name)}
                    >
                    <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho — {formatPrice(product.price)}
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
                      <form onSubmit={handleWaitlist} className="flex gap-2">
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
                        <Button type="submit" className="rounded-xl px-6">
                          Avisar-me
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Specs Accordion */}
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
                      Garantia de 2 anos contra defeitos de fabricação. 
                      30 dias para devolução sem custo.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-32 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-foreground">Avaliações de Clientes</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">de 5 baseado em {product.reviews} avaliações</span>
                </div>
              </div>
              <Button variant="outline" className="hidden sm:flex border-white/10 hover:border-primary/50">Escrever Avaliação</Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mock Reviews List */}
              {[
                { name: "Carlos S.", rating: 5, date: "Há 2 dias", text: "Som incrivelmente nítido e os graves são potentes. Melhor compra do ano, a entrega foi super rápida e o material do produto é absurdamente premium!" },
                { name: "Mariana L.", rating: 5, date: "Há 1 semana", text: "Qualidade de construção impecável. Encaixa perfeitamente e a bateria dura exatamente o que prometem. Recomendo de olhos fechados." },
                { name: "Roberto F.", rating: 4, date: "Há 2 semanas", text: "Muito bom, só não dou 5 estrelas porque a caixa chegou um pouco amassada na ponta, mas o produto em si é sensacional e funciona maravilhosamente bem." },
                { name: "Amanda K.", rating: 5, date: "Há 1 mês", text: "Perfeito! Uso todos os dias para trabalhar e treinar, não cai e o cancelamento de ruído é surreal." },
              ].map((review, idx) => (
                <div key={idx} className="bg-secondary/40 p-6 rounded-2xl border border-border/50 hover:border-border transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-primary" /> Compra Verificada
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center sm:hidden">
               <Button variant="outline" className="w-full border-white/10">Escrever Avaliação</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
