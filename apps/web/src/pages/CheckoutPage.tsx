import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartContext";
import { productImages } from "@/lib/productImages";
import { Link } from "react-router-dom";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

const paymentMethods = [
  { id: "pix", label: "PIX", icon: QrCode, desc: "Aprovação imediata" },
  { id: "card", label: "Cartão", icon: CreditCard, desc: "Até 12x sem juros" },
  { id: "boleto", label: "Boleto", icon: FileText, desc: "Vence em 3 dias" }
];

const checkoutSteps = ["Identificação", "Entrega", "Pagamento", "Confirmação"];

const trustHighlights = [
  { icon: Lock, label: "Criptografia de ponta a ponta" },
  { icon: ShieldCheck, label: "Dados protegidos e transação segura" },
  { icon: Truck, label: "Entrega com rastreio" }
];

const CheckoutPage = () => {
  const { items, totalPrice } = useCart();
  const [payment, setPayment] = useState("pix");
  const [processing, setProcessing] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setTimeout(() => setProcessing(false), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link to="/">
              <Button variant="outline" className="rounded-xl">
                Voltar à loja
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[680px] h-[680px] bg-primary/7 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="space-y-6 mb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Finalização segura da compra</h1>
            <div className="flex flex-wrap gap-2">
              {checkoutSteps.map((step, index) => (
                <div
                  key={step}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    index <= 2
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="lg:col-span-3 space-y-8"
            >
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-border/50">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Dados pessoais</h2>
                    <p className="text-xs text-muted-foreground mt-1">Preencha seus dados para concluir como visitante.</p>
                  </div>
                  <Link to="/login?redirect=/checkout" className="shrink-0">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto border-primary/30 text-foreground hover:bg-primary/10">
                      Já tenho conta
                    </Button>
                  </Link>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatingInput label="Nome completo" required />
                  <FloatingInput label="E-mail" type="email" required />
                  <FloatingInput label="CPF" required />
                  <FloatingInput label="Telefone" type="tel" required />
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-foreground">Endereço de entrega</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <FloatingInput label="CEP" required />
                  <div className="sm:col-span-2">
                    <FloatingInput label="Rua" required />
                  </div>
                  <FloatingInput label="Número" required />
                  <FloatingInput label="Complemento" />
                  <FloatingInput label="Cidade" required />
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-foreground">Pagamento</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPayment(method.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                        payment === method.id
                          ? "border-primary bg-primary/8"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <method.icon
                        className={`h-5 w-5 ${payment === method.id ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span className="text-xs font-semibold text-foreground">{method.label}</span>
                      <span className="text-[10px] text-muted-foreground">{method.desc}</span>
                      {payment === method.id ? (
                        <motion.div layoutId="payment-check" className="absolute top-2 right-2">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </motion.div>
                      ) : null}
                    </button>
                  ))}
                </div>

                {payment === "card" ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-2"
                  >
                    <FloatingInput label="Número do cartão" required />
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Validade (MM/AA)" required />
                      <FloatingInput label="CVV" required />
                    </div>
                    <FloatingInput label="Nome no cartão" required />
                  </motion.div>
                ) : null}
              </section>

              <div className="space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 shimmer-btn rounded-xl text-base font-semibold"
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                    </span>
                  ) : (
                    `Finalizar compra - ${formatPrice(totalPrice)}`
                  )}
                </Button>

                <div className="rounded-xl border border-border/70 bg-card/50 px-4 py-3 flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  Seu pagamento é criptografado e processado em ambiente seguro.
                </div>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="bg-secondary/90 rounded-2xl border border-border/70 p-6 lg:sticky lg:top-24 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Resumo do pedido</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="h-16 w-16 bg-background rounded-xl flex items-center justify-center flex-shrink-0 border border-border/60">
                        <img src={productImages[item.product.image]} alt="" className="h-12 w-12 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity} - {item.selectedColor}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-primary font-medium">Grátis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {trustHighlights.map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/70 bg-card/60 px-3 py-2 flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="text-xs text-foreground/90">{item.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  Ao finalizar, você concorda com os termos de compra e política de privacidade.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FloatingInput = ({
  label,
  type = "text",
  required = false
}: {
  label: string;
  type?: string;
  required?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full bg-background border border-border rounded-xl px-4 pt-6 pb-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        placeholder=" "
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          focused || value
            ? "top-2 text-[10px] text-primary font-medium"
            : "top-4 text-sm text-muted-foreground"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default CheckoutPage;
