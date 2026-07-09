'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Truck,
  MapPin,
  ChevronRight,
  User as UserIcon,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartContext";
import { orderRepository } from "@/services/api/orderRepository";
import { useAuth } from "@/providers/auth/AuthProvider";
import { productImages } from "@/lib/productImages";
import { resolveProductImage } from "@/lib/imageResolver";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerRepository } from "@/services/api/customerRepository";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentBrick from "@/components/store/PaymentBrick";

const paymentMethods = [
  { id: "CREDIT_CARD", label: "Cartão de Crédito", icon: CreditCard, desc: "Parcele sua compra" },
  { id: "PIX", label: "Pix", icon: QrCode, desc: "Aprovação imediata" },
  { id: "TICKET", label: "Boleto", icon: FileText, desc: "Vencimento em 3 dias" },
];

const checkoutSteps = ["Identificação", "Entrega", "Pagamento", "Confirmação"];

const trustHighlights = [
  { icon: Lock, label: "Criptografia de ponta a ponta" },
  { icon: ShieldCheck, label: "Dados protegidos e transação segura" },
  { icon: Truck, label: "Entrega com rastreio" }
];

const FloatingInput = ({
  label,
  type = "text",
  required = false,
  value = "",
  onChange = () => { }
}: {
  label: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="peer w-full bg-background border border-border rounded-xl px-4 pt-6 pb-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        placeholder=" "
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${focused || value
          ? "top-2 text-[10px] text-primary font-medium"
          : "top-4 text-sm text-muted-foreground"
          }`}
      >
        {label}
      </label>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isCustomerAuthenticated, isLoading: authLoading, customerSession } = useAuth();
  const { items, totalPrice, clearCart, addItem, updateQuantity } = useCart();
  const [payment, setPayment] = useState("CREDIT_CARD");
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const currentOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentOrderIdRef.current = currentOrderId;
  }, [currentOrderId]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    document: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    if (!authLoading && !isCustomerAuthenticated) {
      router.replace("/login?from=/checkout");
    }
  }, [authLoading, isCustomerAuthenticated, router]);

  const nextStep = () => {
    if (currentStep === 0) {
      if (!form.name || !form.email || !form.document || !form.phone) {
        return toast.error("Por favor, preencha todos os campos obrigatórios");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        return toast.error("Por favor, insira um e-mail válido (ex: seuemail@dominio.com).");
      }
      const cleanDoc = form.document.replace(/\D/g, "");
      if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        return toast.error("Por favor, insira um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      }
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return toast.error("Por favor, insira um telefone válido com DDD.");
      }
    }
    if (currentStep === 1) {
      if (!form.zipCode || !form.street || !form.number || !form.city) {
        return toast.error("Por favor, preencha o endereço completo");
      }
      if (!selectedShipping) {
        return toast.error("Por favor, selecione uma opção de frete");
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAddress = (address: any) => {
    setForm(prev => ({
      ...prev,
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state
    }));
    toast.success("Endereço selecionado!");
  };

  const handleDocumentChange = (v: string) => {
    let value = v.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      value = value.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
      value = value.substring(0, 18);
    }
    setForm(prev => ({ ...prev, document: value }));
  };

  const handlePhoneChange = (v: string) => {
    let value = v.replace(/\D/g, "");
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      value = value.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
    setForm(prev => ({ ...prev, phone: value.substring(0, 15) }));
  };

  const handleZipCodeChange = async (v: string) => {
    let value = v.replace(/\D/g, "");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    setForm(prev => ({ ...prev, zipCode: value.substring(0, 9) }));
    
    const cleanZip = value.replace(/\D/g, "");
    if (cleanZip.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            zipCode: value.substring(0, 9),
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        }
      } catch (e) {
        console.error("Erro ao buscar CEP:", e);
      }
    }
  };

  useEffect(() => {
    if (customerSession?.user) {
      setForm(prev => ({
        ...prev,
        email: customerSession.user.email || prev.email,
        name: customerSession.user.displayName || prev.name
      }));
    }
  }, [customerSession]);

  useEffect(() => {
    const loadFullProfile = async () => {
      if (!isCustomerAuthenticated || profileLoading) return;

      setProfileLoading(true);

      try {
        const profile = await customerRepository.getProfile();
        if (profile) {
          setSavedAddresses(profile.addresses || []);

          setForm(prev => ({
            ...prev,
            name: profile.name || prev.name,
            document: profile.document || prev.document,
            phone: profile.phone || prev.phone,
            zipCode: profile.address?.zipCode || prev.zipCode,
            street: profile.address?.street || prev.street,
            number: profile.address?.number || prev.number,
            complement: profile.address?.complement || prev.complement,
            neighborhood: profile.address?.neighborhood || prev.neighborhood,
            city: profile.address?.city || prev.city,
            state: profile.address?.state || prev.state
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadFullProfile();
  }, [isCustomerAuthenticated]);

  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const productIdParam = searchParams.get('product_id');
    const quantityParam = searchParams.get('quantity');
    const couponParam = searchParams.get('coupon');

    if (productIdParam) {
      const handleDirectCheckout = async () => {
        try {
          const productIds = productIdParam.split(',');
          const quantities = quantityParam ? quantityParam.split(',') : [];

          for (let i = 0; i < productIds.length; i++) {
            const pid = productIds[i].trim();
            if (!pid) continue;
            
            const qty = quantities[i] ? Number(quantities[i].trim()) : 1;

            try {
              const { data } = await api.get(`/products/${pid}`);
              if (data) {
                const product = {
                  ...data,
                  category: data.category?.name || 'Geral',
                  price: Number(data.price),
                  originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
                  freeShipping: data.freeShipping || false,
                  colors: data.variants && data.variants.length > 0 
                    ? data.variants.map((v: any) => ({ name: v.name, hex: v.colorHex || "#1D1D1F" }))
                    : [{ name: "Padrão", hex: "#1D1D1F" }],
                  rating: data.rating || 5.0,
                  reviews: data.reviewCount || 0,
                  image: data.image || (data.images && data.images.length > 0 ? data.images[0] : ""),
                  specs: []
                };

                const existing = items.find((item: any) => item.product.id === pid);
                if (!existing) {
                  addItem(product, product.colors[0].name);
                }
                
                if (qty) {
                  setTimeout(() => {
                    updateQuantity(pid, qty);
                  }, 150); // slight delay to ensure addItem state has processed
                }
              }
            } catch (err) {
              console.error(`Falha ao buscar produto ${pid} para o checkout direto`, err);
            }
          }

          if (couponParam) {
             setCouponCode(couponParam);
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error("Direct checkout failed", e);
        }
      };
      handleDirectCheckout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const discount = appliedCoupon
    ? (appliedCoupon.discountType === "PERCENTAGE"
      ? (totalPrice * (Number(appliedCoupon.discountValue) / 100))
      : Number(appliedCoupon.discountValue))
    : 0;

  const shippingCost = selectedShipping?.price || 0;
  const finalTotal = Math.max(0, totalPrice - discount) + shippingCost;

  useEffect(() => {
    const fetchShipping = async () => {
      const zip = form.zipCode.replace(/\D/g, "");
      if (zip.length === 8 && items.length > 0) {
        setIsLoadingShipping(true);
        setShippingError("");
        try {
          const { data } = await api.post("/checkout/shipping", {
            destinationZip: zip,
            items: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
          });
          setShippingOptions(data);
          
          if (data && data.length > 0) {
            // Auto-selecionar se for a única opção (ex: Frete Grátis)
            if (data.length === 1 && data[0].id === "free-shipping") {
              setSelectedShipping(data[0]);
            } else if (!data.find((o: any) => o.id === selectedShipping?.id)) {
              setSelectedShipping(null);
            }
          } else {
            setSelectedShipping(null);
          }
        } catch (error: any) {
          console.error("Erro ao calcular frete", error);
          setShippingError("Não foi possível calcular o frete.");
          setShippingOptions([]);
          setSelectedShipping(null);
        } finally {
          setIsLoadingShipping(false);
        }
      } else {
        setShippingOptions([]);
        setSelectedShipping(null);
      }
    };
    fetchShipping();
  }, [form.zipCode, items]);

  useEffect(() => {
    if (!isSuccess || !currentOrderId || !paymentInfo || paymentInfo.status !== "pending") {
      return;
    }

    let intervalId: any;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const { data } = await api.get(`/orders/${currentOrderId}/status`);
        if (data.status === "PAID" || data.status === "approved") {
          if (isMounted) {
            setOrderStatus("PAID");
            toast.success("Pagamento Pix confirmado!");
            setPaymentInfo((prev: any) => prev ? { ...prev, status: "approved" } : null);
            clearInterval(intervalId);
            
            setTimeout(() => {
              if (isMounted) {
                router.push("/minha-conta");
              }
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isSuccess, currentOrderId, paymentInfo, router]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode,
        amount: totalPrice
      });
      setAppliedCoupon(data);
      toast.success("Cupom aplicado com sucesso!");
    } catch (error: any) {
      const msg = error.response?.status === 404
        ? "Cupom não encontrado"
        : (error.response?.data?.message || "Serviço de cupons indisponível");
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onPaymentSubmit = async (param: any) => {
    try {
      let orderId = currentOrderIdRef.current;

      if (!orderId) {
        const orderData = {
          items: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: Number(i.product.price)
          })),
          total: finalTotal,
          paymentMethod: payment,
          shippingAddress: {
            zipCode: form.zipCode,
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            shippingMethod: selectedShipping?.name,
            shippingCost: selectedShipping?.price
          },
          guestName: form.name,
          guestEmail: form.email,
          guestPhone: form.phone,
          guestDocument: form.document,
          couponCode: appliedCoupon?.code
        };

        const order = await orderRepository.create(orderData);
        setCreatedOrderCode(order.orderCode);
        setCurrentOrderId(order.id);
        orderId = order.id;
      }

      // O Brick do Mercado Pago envia um objeto com a propriedade formData dentro de param
      const actualFormData = param.formData ? param.formData : param;

      const { data } = await api.post("/checkout/process", {
        formData: actualFormData,
        orderId: orderId
      });

      if (data.status === 'approved') {
        setIsSuccess(true);
        clearCart();
        toast.success("Pagamento aprovado!");
      } else if (data.status === 'in_process' || data.status === 'pending') {
        setPaymentInfo({
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64,
          ticket_url: data.ticket_url,
          status: data.status
        });
        setIsSuccess(true);
        clearCart();
        toast.info(data.status === 'pending' ? "Aguardando pagamento!" : "Pagamento em processamento. Verifique seu e-mail.");
      } else {
        toast.error(`Pagamento ${data.status}: ${data.detail || 'Tente outro método'}`);
      }
    } catch (error: any) {
      console.error("Erro no processamento:", error);
      toast.error(error.response?.data?.error || "Erro ao processar pagamento");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) return toast.error("Seu carrinho está vazio");

    setProcessing(true);
    try {
      const orderData = {
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: Number(i.product.price)
        })),
        total: finalTotal,
        paymentMethod: payment,
        shippingAddress: {
          zipCode: form.zipCode,
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state
        },
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        guestDocument: form.document,
        couponCode: appliedCoupon?.code
      };

      const order = await orderRepository.create(orderData);

      setCreatedOrderCode(order.orderCode);
      setCurrentOrderId(order.id);

      if (payment === "PIX" || payment === "TICKET") {
        const actualPaymentMethod = payment === "PIX" ? "pix" : "bolbradesco";
        
        const { data } = await api.post("/checkout/process", {
          formData: {
            payment_method_id: actualPaymentMethod,
            payer: {
              email: form.email.trim(),
              first_name: form.name.split(' ')[0],
              last_name: form.name.split(' ').slice(1).join(' '),
              identification: {
                 type: form.document.length > 14 ? 'CNPJ' : 'CPF',
                 number: form.document.replace(/\D/g, '')
              }
            }
          },
          orderId: order.id
        });

        if (data.status === 'approved' || data.status === 'pending' || data.status === 'in_process') {
          setPaymentInfo({
            qr_code: data.qr_code,
            qr_code_base64: data.qr_code_base64,
            ticket_url: data.ticket_url,
            status: data.status
          });
          setIsSuccess(true);
          clearCart();
          toast.success("Pedido gerado com sucesso!");
        } else {
           toast.error(`Falha no pagamento: ${data.detail || 'Tente novamente'}`);
        }
      } else {
        setIsSuccess(true);
        clearCart();
        toast.success(`Pedido realizado com sucesso!`);
      }
    } catch (error: any) {
      console.error("Erro ao processar:", error);
      const detail = error.response?.data?.details || error.response?.data?.error || error.response?.data?.message || "Erro ao processar seu pedido.";
      let userMsg = detail;
      if (typeof detail === "string") {
        if (detail.includes("valid email")) userMsg = "O e-mail informado é inválido. Volte ao Passo 1 e corrija.";
        else if (detail.includes("identification number") || detail.includes("identification")) userMsg = "O CPF/CNPJ informado é inválido. Volte ao Passo 1 e corrija.";
      }
      toast.error(userMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || !isCustomerAuthenticated) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border p-10 rounded-[32px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-primary" />
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <BadgeCheck className="w-12 h-12" />
                </div>
              </div>

              <h1 className="text-3xl font-black mb-4 tracking-tight">Pedido Confirmado!</h1>
              <p className="text-muted-foreground mb-2">
                Parabéns por adquirir nossos produtos, em breve você receberá atualizações do pedido.
              </p>
              <div className="inline-block px-4 py-2 bg-secondary rounded-lg font-mono text-sm font-bold text-primary mb-8">
                PEDIDO: {createdOrderCode}
              </div>

              {paymentInfo?.qr_code_base64 && (
                paymentInfo.status === "approved" || orderStatus === "PAID" ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 flex flex-col items-center gap-4 bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-emerald-500"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-lg">Pagamento Aprovado!</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Confirmamos o seu pagamento via Pix. Você será redirecionado para a tela de seus pedidos em instantes...
                    </p>
                  </motion.div>
                ) : (
                  <div className="mb-8 flex flex-col items-center gap-4 bg-background p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      Escaneie o QR Code para pagar via Pix
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </h3>
                    <img src={`data:image/png;base64,${paymentInfo.qr_code_base64}`} alt="QR Code Pix" className="w-56 h-56 border border-border rounded-xl p-2 bg-white" />
                    <div className="w-full flex items-center gap-2 mt-2">
                      <Input readOnly value={paymentInfo.qr_code} className="font-mono text-[10px] text-muted-foreground bg-secondary/50" />
                      <Button type="button" onClick={() => { navigator.clipboard.writeText(paymentInfo.qr_code); toast.success("Código Copiado!"); }} variant="outline" className="flex-shrink-0">
                        Copiar
                      </Button>
                    </div>
                    <span className="text-[10px] text-muted-foreground animate-pulse">
                      Aguardando confirmação do pagamento...
                    </span>
                  </div>
                )
              )}

              {paymentInfo?.ticket_url && (
                <div className="mb-8 flex flex-col items-center gap-4 bg-background p-6 rounded-2xl border border-border">
                  <h3 className="font-bold text-lg text-foreground">Boleto Gerado</h3>
                  <p className="text-sm text-muted-foreground">Clique abaixo para visualizar e imprimir seu boleto.</p>
                  <Button asChild className="w-full h-12 rounded-xl">
                    <a href={paymentInfo.ticket_url} target="_blank" rel="noreferrer">Visualizar Boleto</a>
                  </Button>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl font-bold"
                  onClick={() => router.push("/")}
                >
                  Continuar navegando
                </Button>
                <Button
                  className="h-12 rounded-xl font-bold shimmer-btn"
                  onClick={() => router.push("/minha-conta")}
                >
                  Ver meus pedidos
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32">
          <div className="container mx-auto px-4 md:px-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link href="/">
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
      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[680px] h-[680px] bg-primary/7 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="space-y-6 mb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
              Finalização segura da compra
              {profileLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </h1>
            <div className="flex flex-wrap gap-2">
              {checkoutSteps.map((step, index) => (
                <div
                  key={step}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${index === currentStep
                    ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                    : index < currentStep
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-card text-muted-foreground border-border"
                    }`}
                >
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.section
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 md:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Identificação</h2>
                          <p className="text-xs text-muted-foreground">Seus dados básicos para o pedido.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingInput
                        label="Nome completo"
                        required
                        value={form.name}
                        onChange={(v) => setForm({ ...form, name: v })}
                      />
                      <FloatingInput
                        label="E-mail"
                        type="email"
                        required
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                      />
                      <FloatingInput
                        label="CPF/CNPJ"
                        required
                        value={form.document}
                        onChange={handleDocumentChange}
                      />
                      <FloatingInput
                        label="Telefone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>

                    <div className="pt-6">
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="w-full h-14 rounded-xl text-base font-bold shimmer-btn"
                      >
                        Continuar para entrega <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </motion.section>
                )}

                {currentStep === 1 && (
                  <motion.section
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 md:p-6"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Endereço de entrega</h2>
                          <p className="text-xs text-muted-foreground">Onde você deseja receber o pedido.</p>
                        </div>
                      </div>
                      {savedAddresses.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" type="button" className="text-xs h-8 gap-1.5 border-primary/30 hover:border-primary">
                              Selecionar salvo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[450px] bg-card border-border">
                            <DialogHeader>
                              <DialogTitle>Seus endereços salvos</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-3 pt-4">
                              {savedAddresses.map((addr) => (
                                <Card
                                  key={addr.id}
                                  className="cursor-pointer hover:border-primary transition-colors bg-secondary/10 border-border/50 group"
                                  onClick={() => handleSelectAddress(addr)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-bold text-xs text-foreground">{addr.title}</span>
                                      {addr.isDefault && <Badge variant="secondary" className="text-[9px] py-0 h-4">Padrão</Badge>}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      {addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}
                                      <br />
                                      {addr.neighborhood}, {addr.city} - {addr.state}
                                    </p>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="w-full mt-2 text-[10px] h-7 bg-primary/5 hover:bg-primary/10 text-primary">
                                        Usar este endereço
                                      </Button>
                                    </DialogTrigger>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <FloatingInput
                        label="CEP"
                        required
                        value={form.zipCode}
                        onChange={handleZipCodeChange}
                      />
                      <div className="sm:col-span-2">
                        <FloatingInput
                          label="Rua"
                          required
                          value={form.street}
                          onChange={(v) => setForm({ ...form, street: v })}
                        />
                      </div>
                      <FloatingInput
                        label="Número"
                        required
                        value={form.number}
                        onChange={(v) => setForm({ ...form, number: v })}
                      />
                      <FloatingInput
                        label="Complemento"
                        value={form.complement}
                        onChange={(v) => setForm({ ...form, complement: v })}
                      />
                      <FloatingInput
                        label="Bairro"
                        required
                        value={form.neighborhood}
                        onChange={(v) => setForm({ ...form, neighborhood: v })}
                      />
                      <FloatingInput
                        label="Cidade"
                        required
                        value={form.city}
                        onChange={(v) => setForm({ ...form, city: v })}
                      />
                      <FloatingInput
                        label="Estado"
                        required
                        value={form.state}
                        onChange={(v) => setForm({ ...form, state: v })}
                      />
                    </div>

                    <div className="pt-6">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                        <Truck className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Opções de Frete</h3>
                      </div>
                      
                      {isLoadingShipping ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-3">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <p className="text-xs text-muted-foreground">Calculando frete...</p>
                        </div>
                      ) : shippingError ? (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm">
                          {shippingError}
                        </div>
                      ) : shippingOptions.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {shippingOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedShipping(opt)}
                              className={`flex flex-col p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedShipping?.id === opt.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/30"
                                }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm">{opt.name}</span>
                                <span className="font-black text-primary">{formatPrice(opt.price)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">Entrega em até {opt.deliveryTime} dias úteis</span>
                            </button>
                          ))}
                        </div>
                      ) : form.zipCode.replace(/\D/g, "").length === 8 ? (
                        <div className="p-4 rounded-xl border border-border bg-secondary/30 text-muted-foreground text-sm text-center">
                          Nenhuma opção de frete encontrada para este CEP.
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-border bg-secondary/30 text-muted-foreground text-sm text-center">
                          Preencha o CEP para ver as opções de frete.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="h-14 rounded-xl text-base font-bold"
                      >
                        <ChevronLeft className="mr-2 w-5 h-5" /> Voltar
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="h-14 rounded-xl text-base font-bold shimmer-btn"
                      >
                        Pagamento <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </motion.section>
                )}

                {currentStep === 2 && (
                  <motion.section
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-5 md:p-6"
                  >
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Pagamento</h2>
                        <p className="text-xs text-muted-foreground">
                          {showPaymentForm ? "Finalize com segurança abaixo" : "Escolha como deseja pagar."}
                        </p>
                      </div>
                    </div>

                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPayment(method.id)}
                            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${payment === method.id
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

                      {payment === "CREDIT_CARD" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-4 pt-4 mt-4 border-t border-border/50"
                        >
                          <PaymentBrick
                            amount={finalTotal}
                            onSubmit={onPaymentSubmit}
                            payer={{
                              email: form.email,
                              firstName: form.name?.split(' ')[0] || undefined,
                              lastName: form.name?.split(' ').slice(1).join(' ') || undefined,
                              documents: form.document ? [{ type: form.document.length > 14 ? 'CNPJ' : 'CPF', number: form.document.replace(/\D/g, '') }] : undefined,
                              address: {
                                zipCode: form.zipCode?.replace(/\D/g, '') || '',
                                streetName: form.street || '',
                                streetNumber: form.number || '',
                                neighborhood: form.neighborhood || '',
                                city: form.city || '',
                                federalUnit: form.state || '',
                                complement: form.complement || '',
                              }
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="space-y-4 pt-6 mt-4 border-t border-border/50">
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={prevStep}
                              className="h-14 rounded-xl text-base font-bold"
                            >
                              <ChevronLeft className="mr-2 w-5 h-5" /> Voltar
                            </Button>
                            <Button
                              type="button"
                              onClick={handleSubmit}
                              size="lg"
                              className="h-14 shimmer-btn rounded-xl text-base font-bold"
                              disabled={processing}
                            >
                              {processing ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                                </span>
                              ) : (
                                `Finalizar Compra`
                              )}
                            </Button>
                          </div>

                          <div className="rounded-xl border border-border/70 bg-card/50 px-4 py-3 flex items-center gap-2 justify-center text-xs text-muted-foreground">
                            <Lock className="h-4 w-4 text-primary" />
                            Pagamento criptografado e 100% seguro.
                          </div>
                        </div>
                      )}
                    </>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

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
                      <div className="h-16 w-16 bg-background rounded-xl flex items-center justify-center flex-shrink-0 border border-border/60 overflow-hidden">
                        {resolveProductImage(item.product.image, item.product.images) ? (
                          <img
                            src={resolveProductImage(item.product.image, item.product.images)!}
                            alt={item.product.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <ShoppingBag className="h-6 w-6 text-muted-foreground/20" />
                        )}
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
                  {!selectedShipping ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-primary font-medium">A calcular</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-muted-foreground">Frete ({selectedShipping.name})</span>
                      <span className="text-foreground">
                        {selectedShipping.price === 0 ? (
                          <span className="text-primary font-medium">Grátis</span>
                        ) : (
                          formatPrice(selectedShipping.price)
                        )}
                      </span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-500 font-medium">
                      <span>Desconto ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cupom de desconto"
                      className="bg-background h-10 text-xs uppercase"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    <Button
                      type="button"
                      variant={appliedCoupon ? "outline" : "default"}
                      size="sm"
                      className="h-10 px-4"
                      onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(""); } : handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (appliedCoupon ? "Remover" : "Aplicar")}
                    </Button>
                  </div>
                  {couponError && <p className="text-[10px] text-destructive mt-1 ml-1">{couponError}</p>}
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
}
