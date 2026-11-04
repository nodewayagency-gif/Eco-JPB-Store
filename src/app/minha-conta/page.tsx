'use client';

import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  User,
  ShoppingBag,
  ChevronDown,
  LogOut,
  MessageSquare,
  Plus,
  Image as ImageIcon,
  X,
  Paperclip,
  CreditCard,
  QrCode,
  FileText,
  Loader2,
  Lock,
  Check,
  Trash2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";
import { cn, maskCEP, maskDocument, maskPhone } from "@/lib/utils";
import type { CustomerOrderTrackingStep, CustomerOrderView, CustomerProfile, SupportTicketView } from "@premium/contracts";
import { useAuth } from "@/providers/auth/AuthProvider";
import { customerRepository } from "@/services/api/customerRepository";
import { resolveProductImage } from "@/lib/imageResolver";
import { supabase } from "@/lib/supabase";
import PaymentBrick from "@/components/store/PaymentBrick";
import { api } from "@/services/api";

const paymentMethods = [
  { id: "CREDIT_CARD", label: "Cartão de Crédito", icon: CreditCard, desc: "Parcele sua compra" },
  { id: "PIX", label: "Pix", icon: QrCode, desc: "Aprovação imediata" },
  { id: "TICKET", label: "Boleto", icon: FileText, desc: "Vencimento em 3 dias" },
];

const statusStyle: Record<string, string> = {
  "Aguardando Pagamento": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Confirmado": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Processando": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Separação": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Em Trânsito": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Saiu para entrega": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Entregue": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold",
  "Cancelado": "bg-rose-500/15 text-rose-400 border-rose-500/30"
};

const iconByStep = (title: string) => {
  if (title.includes("Trânsito") || title.includes("Enviado")) return Truck;
  if (title.includes("Entregue") || title.includes("Confirmado") || title.includes("Pago")) return CheckCircle2;
  if (title.includes("Entrega") || title.includes("Saiu")) return MapPin;
  return Package;
};

const OrderTimeline = ({ steps }: { steps: CustomerOrderTrackingStep[] }) => (
  <div className="relative pl-8 space-y-0">
    {steps.map((step, index) => {
      const Icon = iconByStep(step.title);
      const isLast = index === steps.length - 1;

      return (
        <motion.div
          key={`${step.title}-${index}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
          className="relative pb-6 last:pb-0"
        >
          {!isLast ? (
            <div
              className={`absolute left-[-20px] top-8 w-px h-[calc(100%-8px)] ${step.completed ? "bg-primary/60" : "bg-border"
                }`}
            />
          ) : null}

          <div
            className={`absolute left-[-28px] top-1 w-[17px] h-[17px] rounded-full flex items-center justify-center ${step.active
              ? "bg-primary ring-4 ring-primary/20"
              : step.completed
                ? "bg-primary/80"
                : "bg-secondary border border-border"
              }`}
          >
            <Icon
              className={`w-2.5 h-2.5 ${step.completed || step.active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
            />
          </div>

          <div>
            <p className={`text-sm font-medium ${step.active ? "text-primary" : "text-foreground"}`}>
              {step.title}
            </p>
            {step.description && <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>}
            {step.date && <p className="text-[11px] text-muted-foreground/60 mt-1">{step.date}</p>}
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default function CustomerPage() {
  const { customerSession, isCustomerAuthenticated, isLoading: isAuthLoading, logoutCustomer } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrderView[]>([]);
  const [tickets, setTickets] = useState<SupportTicketView[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "tickets">("profile");
  const [profileForm, setProfileForm] = useState({ name: "", document: "", phone: "", email: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketView | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "", orderId: "none" });
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([]);
  const [replyImages, setReplyImages] = useState<{ file: File; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [repayOrder, setRepayOrder] = useState<CustomerOrderView | null>(null);
  const [repayPayment, setRepayPayment] = useState("CREDIT_CARD");
  const [repayProcessing, setRepayProcessing] = useState(false);
  const [repayPaymentInfo, setRepayPaymentInfo] = useState<any>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState<string | null>(null);

  const ordersPerPage = 5;
  const totalOrdersPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = useMemo(() => {
    return orders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);
  }, [orders, ordersPage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirecionamento caso não autenticado
  useEffect(() => {
    if (!isAuthLoading && !isCustomerAuthenticated) {
      router.replace("/login?from=/minha-conta");
    }
  }, [isAuthLoading, isCustomerAuthenticated, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedTicket) {
      scrollToBottom();
    }
  }, [selectedTicket?.messages, selectedTicket?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      if (isReply) {
        setReplyImages((prev) => [...prev, ...newImages]);
      } else {
        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    }
  };

  const removeImage = (index: number, isReply = false) => {
    if (isReply) {
      setReplyImages((prev) => {
        const newImages = [...prev];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        return newImages;
      });
    } else {
      setSelectedImages((prev) => {
        const newImages = [...prev];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        return newImages;
      });
    }
  };

  const handleCreateTicket = async () => {
    try {
      const userId = customerSession?.user.id;
      if (!userId) return;

      setIsUploading(true);
      const imageUrls: string[] = [];

      for (const item of selectedImages) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `tickets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('jpb_tickets')
          .upload(filePath, item.file);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('jpb_tickets')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      await customerRepository.createTicket(userId, {
        subject: newTicket.subject,
        description: newTicket.description,
        orderId: newTicket.orderId === "none" ? undefined : newTicket.orderId,
        images: imageUrls
      });

      toast.success("Chamado aberto com sucesso!");
      setIsCreatingTicket(false);
      setNewTicket({ subject: "", description: "", orderId: "none" });
      setSelectedImages([]);

      const ticketsData = await customerRepository.getTickets(userId);
      setTickets(ticketsData);
    } catch (error) {
      toast.error("Erro ao abrir chamado.");
    } finally {
      setIsUploading(false);
    }
  };

  const [addressForm, setAddressForm] = useState({
    title: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    isDefault: true
  });

  const openAddressDialog = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        title: address.title || "Casa",
        zipCode: maskCEP(address.zipCode || ""),
        street: address.street || "",
        number: address.number || "",
        complement: address.complement || "",
        neighborhood: address.neighborhood || "",
        city: address.city || "",
        state: address.state || "",
        isDefault: Boolean(address.isDefault)
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        title: "Casa",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        isDefault: !profile?.addresses || profile.addresses.length === 0
      });
    }
    setIsAddressDialogOpen(true);
  };

  const handleUpdateAddress = async () => {
    if (!addressForm.zipCode || !addressForm.street || !addressForm.number || !addressForm.city || !addressForm.state) {
      return toast.error("Preencha todos os campos obrigatórios do endereço.");
    }

    try {
      await customerRepository.updateAddress({
        addressId: editingAddress?.id,
        ...addressForm,
        zipCode: addressForm.zipCode.replace(/\D/g, "")
      });
      toast.success(editingAddress ? "Endereço atualizado com sucesso!" : "Endereço cadastrado com sucesso!");
      setIsAddressDialogOpen(false);
      const profileData = await customerRepository.getProfile();
      setProfile(profileData);
    } catch (error) {
      toast.error("Erro ao salvar endereço.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Tem certeza que deseja remover este endereço?")) return;
    try {
      setIsDeletingAddress(addressId);
      await customerRepository.deleteAddress(addressId);
      toast.success("Endereço removido com sucesso!");
      const profileData = await customerRepository.getProfile();
      setProfile(profileData);
    } catch (error) {
      toast.error("Erro ao excluir endereço.");
    } finally {
      setIsDeletingAddress(null);
    }
  };

  const loadTickets = async () => {
    const userId = customerSession?.user.id;
    if (!userId || !customerSession) return;
    try {
      const ticketsData = await customerRepository.getTickets(userId);
      setTickets(ticketsData);

      if (selectedTicket) {
        const updated = ticketsData.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error("Erro ao carregar chamados:", error);
    }
  };

  // CEP Auto-fill no modal de endereço
  useEffect(() => {
    const zip = addressForm.zipCode.replace(/\D/g, "");
    if (zip.length === 8) {
      const fetchAddress = async () => {
        setIsCepLoading(true);
        try {
          const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${zip}`);
          if (!response.ok) {
            // fallback para viacep
            const viaRes = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const viaData = await viaRes.json();
            if (!viaData.erro) {
              setAddressForm((prev) => ({
                ...prev,
                street: viaData.logradouro || prev.street,
                neighborhood: viaData.bairro || prev.neighborhood,
                city: viaData.localidade || prev.city,
                state: viaData.uf || prev.state
              }));
              return;
            }
          } else {
            const data = await response.json();
            setAddressForm((prev) => ({
              ...prev,
              street: data.street || prev.street,
              neighborhood: data.neighborhood || prev.neighborhood,
              city: data.city || prev.city,
              state: data.state || prev.state
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        } finally {
          setIsCepLoading(false);
        }
      };
      fetchAddress();
    }
  }, [addressForm.zipCode]);

  useEffect(() => {
    const userId = customerSession?.user.id;
    if (!userId) {
      if (!isAuthLoading) setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [profileData, orderData, ticketsData] = await Promise.all([
          customerRepository.getProfile(userId),
          customerRepository.getOrders(userId),
          customerRepository.getTickets(userId)
        ]);

        setProfile(profileData);
        if (profileData) {
          setProfileForm({
            name: profileData.name || "",
            document: profileData.document ? maskDocument(profileData.document) : "",
            phone: profileData.phone ? maskPhone(profileData.phone) : "",
            email: profileData.email || ""
          });
        }
        setOrders(orderData);
        setTickets(ticketsData);
        setExpandedOrder(orderData[0]?.id ?? null);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    load();

    const interval = setInterval(() => {
      loadTickets();
    }, 5000);

    return () => clearInterval(interval);
  }, [customerSession?.user.id, isAuthLoading]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const onLogout = async () => {
    await logoutCustomer();
    router.replace("/login");
  };

  const toggle = (id: string) => {
    setExpandedOrder((current) => (current === id ? null : id));
  };

  const handleReplyTicket = async () => {
    try {
      const userId = customerSession?.user.id;
      if (!userId || !selectedTicket || (!replyContent && replyImages.length === 0)) return;

      setIsUploading(true);
      const imageUrls: string[] = [];

      for (const item of replyImages) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `tickets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('jpb_tickets')
          .upload(filePath, item.file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('jpb_tickets')
            .getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      const updated = await customerRepository.replyTicket(userId, selectedTicket.id, {
        content: replyContent,
        images: imageUrls
      });

      if (updated) {
        setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
        setSelectedTicket(updated);
        setReplyContent("");
        setReplyImages([]);
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRepaySubmit = async (param: any) => {
    if (!repayOrder) return;
    try {
      const actualFormData = param.formData ? param.formData : param;

      const { data } = await api.post("/checkout/process", {
        formData: actualFormData,
        orderId: repayOrder.id
      });

      if (data.status === 'approved' || data.status === 'in_process' || data.status === 'pending') {
        toast.success(data.status === 'approved' ? "Pagamento aprovado!" : "Pagamento em processamento.");
        if (data.qr_code || data.ticket_url) {
          setRepayPaymentInfo({
            qr_code: data.qr_code,
            qr_code_base64: data.qr_code_base64,
            ticket_url: data.ticket_url,
            status: data.status
          });
        } else {
          setRepayOrder(null);
        }
        const userId = customerSession?.user.id;
        if (userId) {
          const orderData = await customerRepository.getOrders(userId);
          setOrders(orderData);
        }
      } else {
        toast.error(`Falha no pagamento: ${data.detail || 'Tente novamente'}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar pagamento.");
    }
  };

  const handleRepayAlternativeSubmit = async () => {
    if (!repayOrder) return;
    setRepayProcessing(true);
    try {
      const actualPaymentMethod = repayPayment === "PIX" ? "pix" : "bolbradesco";
      const email = customerSession?.user.email || profile?.email || 'cliente@eco.com';
      const name = customerSession?.user.displayName || profile?.name || 'Cliente';
      const document = profile?.document || '';

      const { data } = await api.post("/checkout/process", {
        formData: {
          payment_method_id: actualPaymentMethod,
          payer: {
            email: email,
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' '),
            identification: document ? {
              type: document.length > 14 ? 'CNPJ' : 'CPF',
              number: document.replace(/\D/g, '')
            } : undefined
          }
        },
        orderId: repayOrder.id
      });

      if (data.status === 'approved' || data.status === 'in_process' || data.status === 'pending') {
        toast.success("Pedido gerado com sucesso!");
        if (data.qr_code || data.ticket_url) {
          setRepayPaymentInfo({
            qr_code: data.qr_code,
            qr_code_base64: data.qr_code_base64,
            ticket_url: data.ticket_url,
            status: data.status
          });
        } else {
          setRepayOrder(null);
        }
        const userId = customerSession?.user.id;
        if (userId) {
          const orderData = await customerRepository.getOrders(userId);
          setOrders(orderData);
        }
      } else {
        toast.error(`Falha no pagamento: ${data.detail || 'Tente novamente'}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao processar pagamento.");
    } finally {
      setRepayProcessing(false);
    }
  };

  const navItems: {
    id: "profile" | "orders" | "addresses" | "tickets";
    label: string;
    icon: any;
    badge?: number;
  }[] = [
      { id: "profile", label: "Meus Dados", icon: User },
      { id: "orders", label: "Meus Pedidos", icon: Package, badge: orders.length > 0 ? orders.length : undefined },
      { id: "addresses", label: "Endereços", icon: MapPin },
      { id: "tickets", label: "Atendimento", icon: MessageSquare, badge: tickets.filter(t => t.status !== "CLOSED").length > 0 ? tickets.filter(t => t.status !== "CLOSED").length : undefined }
    ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight truncate max-w-[150px]">
                  {profile?.name?.split(' ')[0] || customerSession?.user.displayName?.split(' ')[0] || 'Cliente'}
                </span>
                <span className="text-[11px] text-muted-foreground">Área do Cliente</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sair" className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto no-scrollbar border-t border-border/30 bg-card/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-black",
                    isActive ? "bg-black/30 text-white" : "bg-primary/20 text-primary"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-border/40 bg-card/30 backdrop-blur-xl h-screen sticky top-0 p-6">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="font-black text-xl tracking-tight gold-text">Minha Conta</div>
        </div>

        <div className="flex items-center gap-3.5 mb-8 p-4 rounded-2xl bg-secondary/40 border border-border/40">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">{profile?.name || customerSession?.user.displayName || 'Cliente'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || customerSession?.user.email}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group overflow-hidden",
                  isActive
                    ? "text-primary-foreground bg-primary shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-black relative z-10",
                    isActive ? "bg-black/30 text-white" : "bg-primary/20 text-primary"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border/40">
          <Button variant="ghost" onClick={onLogout} className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            <span className="font-semibold">Sair da conta</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 md:py-10 space-y-8 pb-20 md:pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Carregando painel do cliente...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Resumo Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card/50 border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pedidos</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">{orders.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Gasto</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 shadow-sm relative overflow-hidden col-span-2 md:col-span-1 group hover:border-sky-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Entregas Ativas</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-foreground">
                      {orders.filter((order) => order.status === "Em Trânsito" || order.status === "Processando" || order.status === "Saiu para entrega").length}
                    </p>
                    <span className="text-xs font-medium text-sky-400">em andamento</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TAB: PERFIL / MEUS DADOS */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Meus Dados Cadastrais
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Gerencie suas informações pessoais e mantenha seus dados de entrega atualizados.</p>
                </div>

                <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Completo</Label>
                        <Input
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Seu nome completo"
                          className="h-11 bg-secondary/30 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                          E-mail (Login)
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground normal-case font-normal">
                            <Lock className="w-3 h-3" /> Fixo por segurança
                          </span>
                        </Label>
                        <Input
                          value={profileForm.email}
                          disabled
                          className="h-11 bg-secondary/30 text-muted-foreground cursor-not-allowed border-dashed opacity-75"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CPF / CNPJ</Label>
                        <Input
                          value={profileForm.document}
                          onChange={e => setProfileForm({ ...profileForm, document: maskDocument(e.target.value) })}
                          placeholder="000.000.000-00"
                          className="h-11 bg-secondary/30 border-border/50 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telefone / WhatsApp</Label>
                        <Input
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: maskPhone(e.target.value) })}
                          placeholder="(00) 00000-0000"
                          className="h-11 bg-secondary/30 border-border/50 focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Seus dados estão protegidos por criptografia de ponta a ponta.
                      </span>
                      <Button
                        className="shimmer-btn h-11 px-8 rounded-xl font-bold shadow-md shadow-primary/20"
                        disabled={isSavingProfile}
                        onClick={async () => {
                          if (!profileForm.name || !profileForm.document || !profileForm.phone) {
                            return toast.error("Preencha todos os campos obrigatórios.");
                          }
                          setIsSavingProfile(true);
                          try {
                            await customerRepository.updateProfile({
                              name: profileForm.name,
                              document: profileForm.document,
                              phone: profileForm.phone
                            });
                            toast.success("Perfil atualizado com sucesso!");
                            const updatedProfile = await customerRepository.getProfile(customerSession?.user.id);
                            setProfile(updatedProfile);
                          } catch (error) {
                            toast.error("Erro ao atualizar o perfil.");
                          } finally {
                            setIsSavingProfile(false);
                          }
                        }}
                      >
                        {isSavingProfile ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                          </span>
                        ) : "Salvar Alterações"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB: PEDIDOS */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Meus Pedidos
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Acompanhe o status e a entrega de cada compra realizada na loja.</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <Card className="bg-card/40 border-dashed border-border/60 py-16 text-center">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-8 h-8 opacity-60" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground">Nenhum pedido realizado ainda</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Aproveite nossa Black Friday e garanta produtos de alta qualidade com descontos exclusivos e frete rápido.
                        </p>
                      </div>
                      <Button asChild className="shimmer-btn mt-2">
                        <Link href="/">
                          Explorar Catálogo <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {paginatedOrders.map((order, idx) => {
                        const open = expandedOrder === order.id;

                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card className="bg-card border-border/60 overflow-hidden group hover:border-border transition-colors">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggle(order.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(order.id); }}
                                className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer hover:bg-secondary/20 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border/50 overflow-hidden shrink-0">
                                    {resolveProductImage((order as any).productImage) ? (
                                      <img
                                        src={resolveProductImage((order as any).productImage)!}
                                        alt={order.product}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-6 h-6 text-primary" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[11px] font-mono font-bold text-muted-foreground">#{order.orderCode || order.id.slice(-8)}</span>
                                      <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[10px] font-bold uppercase", statusStyle[order.status] || "bg-secondary text-foreground")}>
                                        {order.status}
                                      </Badge>
                                    </div>
                                    <h3 className="font-semibold text-sm text-foreground">
                                      {order.product}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Realizado em {order.date}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between sm:justify-end gap-3 sm:gap-6">
                                  {order.status === "Aguardando Pagamento" && (
                                    <Button
                                      size="sm"
                                      className="h-8 shimmer-btn text-xs px-4"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRepayOrder(order);
                                      }}
                                    >
                                      Pagar Agora
                                    </Button>
                                  )}
                                  <div className="text-right flex items-center gap-4">
                                    <div>
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                                      <p className="font-bold text-base text-primary">
                                        {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                                      <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <AnimatePresence>
                                {open && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                  >
                                    <Separator className="bg-border/30" />
                                    <div className="p-6 bg-secondary/15 space-y-6">
                                      {/* Itens do Pedido */}
                                      {(order as any).items && (order as any).items.length > 0 && (
                                        <div className="space-y-3">
                                          <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <ShoppingBag className="w-3.5 h-3.5 text-primary" /> Itens deste Pedido ({(order as any).items.length})
                                          </h4>
                                          <div className="grid gap-2">
                                            {(order as any).items.map((item: any, i: number) => (
                                              <div key={item.id || i} className="flex items-center justify-between bg-card/60 p-3 rounded-xl border border-border/40">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center overflow-hidden border border-border/30 shrink-0">
                                                    {item.image ? (
                                                      <img src={resolveProductImage(item.image) || item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                      <Package className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                  </div>
                                                  <div>
                                                    <p className="text-xs font-bold text-foreground leading-snug">{item.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">Quantidade: {item.quantity}</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-xs font-bold text-foreground">
                                                    {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Linha do Tempo / Rastreio */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-4">
                                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Truck className="w-3.5 h-3.5 text-primary" />
                                          </div>
                                          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-primary">Acompanhamento Logístico</h4>
                                        </div>
                                        <OrderTimeline steps={order.tracking} />
                                      </div>

                                      {order.trackingCode && (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                                              <Truck className="w-3.5 h-3.5" /> Código de Rastreio dos Correios / Transportadora
                                            </span>
                                            <span className="font-mono text-base font-bold select-all tracking-wider text-foreground">{order.trackingCode}</span>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="font-bold border-primary/30 hover:bg-primary hover:text-primary-foreground gap-2 w-full sm:w-auto"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigator.clipboard.writeText(order.trackingCode!);
                                              toast.success("Código de rastreio copiado!");
                                            }}
                                          >
                                            <Copy className="w-3.5 h-3.5" /> Copiar Código
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {totalOrdersPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination>
                          <PaginationContent className="bg-card border border-border rounded-full px-2 py-1">
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                className={cn("rounded-full h-8 w-8 p-0 cursor-pointer", ordersPage === 1 && "pointer-events-none opacity-20")}
                              />
                            </PaginationItem>

                            {Array.from({ length: totalOrdersPages }, (_, i) => i + 1).map((p) => {
                              if (p === 1 || p === totalOrdersPages || (p >= ordersPage - 1 && p <= ordersPage + 1)) {
                                return (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      onClick={() => setOrdersPage(p)}
                                      isActive={ordersPage === p}
                                      className={cn(
                                        "h-8 w-8 rounded-full cursor-pointer text-xs",
                                        ordersPage === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                                      )}
                                    >
                                      {p}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              if (p === 2 && ordersPage > 3) return <PaginationItem key="dots-1"><PaginationEllipsis className="w-4 h-4" /></PaginationItem>;
                              if (p === totalOrdersPages - 1 && ordersPage < totalOrdersPages - 2) return <PaginationItem key="dots-2"><PaginationEllipsis className="w-4 h-4" /></PaginationItem>;
                              return null;
                            })}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setOrdersPage(p => Math.min(totalOrdersPages, p + 1))}
                                className={cn("rounded-full h-8 w-8 p-0 cursor-pointer", ordersPage === totalOrdersPages && "pointer-events-none opacity-20")}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB: ENDEREÇOS */}
            {activeTab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" /> Meus Endereços
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Cadastre e gerencie seus endereços para agilizar as próximas entregas.</p>
                  </div>
                  <Button size="sm" className="shimmer-btn gap-2" onClick={() => openAddressDialog()}>
                    <Plus className="w-4 h-4" /> Novo Endereço
                  </Button>
                </div>

                {/* Dialog de Adicionar / Editar Endereço */}
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                  <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">
                        {editingAddress ? "Editar Endereço" : "Cadastrar Novo Endereço"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold">Identificação (ex: Casa, Trabalho)</Label>
                        <Input
                          value={addressForm.title}
                          onChange={e => setAddressForm({ ...addressForm, title: e.target.value })}
                          placeholder="Casa, Apartamento, Escritório..."
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          CEP
                          {isCepLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </Label>
                        <Input
                          value={addressForm.zipCode}
                          onChange={e => setAddressForm({ ...addressForm, zipCode: maskCEP(e.target.value) })}
                          placeholder="00000-000"
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold">Rua / Logradouro</Label>
                        <Input
                          value={addressForm.street}
                          onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Número</Label>
                        <Input
                          value={addressForm.number}
                          onChange={e => setAddressForm({ ...addressForm, number: e.target.value })}
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Complemento</Label>
                        <Input
                          value={addressForm.complement}
                          onChange={e => setAddressForm({ ...addressForm, complement: e.target.value })}
                          placeholder="Apto, Bloco..."
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Bairro</Label>
                        <Input
                          value={addressForm.neighborhood}
                          onChange={e => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Cidade</Label>
                        <Input
                          value={addressForm.city}
                          onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Estado (UF)</Label>
                        <Input
                          value={addressForm.state}
                          onChange={e => setAddressForm({ ...addressForm, state: e.target.value.toUpperCase() })}
                          maxLength={2}
                          className="bg-secondary/30 uppercase"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-border/50">
                        <input
                          type="checkbox"
                          id="isDefault"
                          className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary cursor-pointer"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        />
                        <Label htmlFor="isDefault" className="text-xs font-medium leading-none cursor-pointer">
                          Definir como endereço principal de entrega
                        </Label>
                      </div>
                      <Button className="col-span-2 mt-2 shimmer-btn h-11" onClick={handleUpdateAddress}>
                        {editingAddress ? "Salvar Alterações" : "Cadastrar Endereço"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="grid sm:grid-cols-2 gap-4">
                  {profile?.addresses && profile.addresses.length > 0 ? (
                    profile.addresses.map((addr: any) => (
                      <Card key={addr.id} className="bg-card border-border/60 overflow-hidden relative group hover:border-primary/40 transition-colors">
                        {addr.isDefault && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{addr.title || "Endereço"}</span>
                              {addr.isDefault && (
                                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                className="text-xs text-primary font-bold hover:underline"
                                onClick={() => openAddressDialog(addr)}
                              >
                                Editar
                              </button>
                              <button
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                disabled={isDeletingAddress === addr.id}
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                {isDeletingAddress === addr.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="text-foreground">{addr.street}, {addr.number}</p>
                            {addr.complement && <p>{addr.complement}</p>}
                            <p>{addr.neighborhood}</p>
                            <p className="text-xs font-mono">{addr.city} - {addr.state}, {maskCEP(addr.zipCode)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : profile?.address ? (
                    <Card className="bg-card border-border/60 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">Principal</span>
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                              Padrão
                            </Badge>
                          </div>
                          <button
                            className="text-xs text-primary font-bold hover:underline"
                            onClick={() => openAddressDialog(profile.address)}
                          >
                            Editar
                          </button>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="text-foreground">{profile.address.street}, {profile.address.number}</p>
                          {profile.address.complement && <p>{profile.address.complement}</p>}
                          <p>{profile.address.neighborhood}</p>
                          <p className="text-xs font-mono">{profile.address.city} - {profile.address.state}, {maskCEP(profile.address.zipCode)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-secondary/20 border-border/60 border-dashed flex flex-col items-center justify-center p-12 text-center col-span-2 space-y-3">
                      <MapPin className="w-10 h-10 text-muted-foreground/40" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Nenhum endereço cadastrado</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Cadastre seu primeiro endereço para receber suas compras com rapidez.</p>
                      </div>
                      <Button size="sm" onClick={() => openAddressDialog()} className="shimmer-btn mt-2">
                        <Plus className="w-4 h-4 mr-1.5" /> Cadastrar Endereço
                      </Button>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: ATENDIMENTO / SUPORTE */}
            {activeTab === "tickets" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" /> Atendimento & Chamados
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Converse diretamente com o suporte técnico e tire dúvidas sobre pedidos ou produtos.</p>
                  </div>
                  <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="shimmer-btn gap-2">
                        <Plus className="w-4 h-4" /> Novo Chamado
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                      <DialogHeader className="pt-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" /> Abrir Novo Chamado
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assunto</Label>
                          <Input
                            value={newTicket.subject}
                            onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                            placeholder="Ex: Dúvida sobre entrega ou produto com avaria"
                            className="bg-secondary/30 h-11"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pedido Relacionado (Opcional)</Label>
                          <Select value={newTicket.orderId} onValueChange={v => setNewTicket({ ...newTicket, orderId: v })}>
                            <SelectTrigger className="w-full bg-secondary/30 border-border/50 text-foreground h-11">
                              <SelectValue placeholder="Selecione um pedido" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                              <SelectItem value="none">Nenhum pedido relacionado</SelectItem>
                              {orders.map(o => (
                                <SelectItem key={o.id} value={o.id}>
                                  #{o.orderCode || o.id.slice(-6)} - {o.product}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição Detalhada</Label>
                          <Textarea
                            value={newTicket.description}
                            onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                            placeholder="Descreva o que aconteceu com o máximo de detalhes..."
                            className="min-h-[110px] bg-secondary/30 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Anexar Fotos / Comprovantes (Opcional)</Label>
                          <div className="flex flex-wrap gap-2.5">
                            {selectedImages.map((img, index) => (
                              <div key={index} className="relative w-18 h-18 rounded-xl overflow-hidden border border-border group">
                                <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <label className="w-18 h-18 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-1">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground font-medium">Anexar</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
                            </label>
                          </div>
                        </div>

                        <Button
                          className="w-full h-11 shimmer-btn font-bold mt-2"
                          onClick={handleCreateTicket}
                          disabled={!newTicket.subject || !newTicket.description || isUploading}
                        >
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Enviando chamado...
                            </span>
                          ) : (
                            <>
                              <Paperclip className="w-4 h-4 mr-2" /> Enviar Solicitação
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {selectedTicket ? (
                  <Card className="bg-card border-border overflow-hidden flex flex-col h-[560px]">
                    <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTicket(null)}>
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{selectedTicket.subject}</h3>
                          <p className="text-xs text-muted-foreground">Chamado #{selectedTicket.id.slice(-8)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={selectedTicket.status === "CLOSED" ? "border-muted" : "border-primary/40 bg-primary/10 text-primary"}>
                        {selectedTicket.status === "OPEN" ? "Aberto" : selectedTicket.status === "IN_PROGRESS" ? "Em Atendimento" : "Resolvido"}
                      </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/40">
                      <div className="flex flex-col items-start">
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm bg-secondary text-foreground rounded-tl-none border border-border/50">
                          {selectedTicket.images && selectedTicket.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {selectedTicket.images.map((img, i) => (
                                <img key={i} src={img} alt="Anexo Inicial" className="rounded-lg w-full h-auto max-h-40 object-cover border border-white/10" />
                              ))}
                            </div>
                          )}
                          <p className="text-xs font-bold mb-1 text-primary">Descrição do Chamado:</p>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">{selectedTicket.customerName} • {new Date(selectedTicket.createdAt).toLocaleString("pt-BR")}</span>
                      </div>

                      {selectedTicket.messages?.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.senderRole === "CUSTOMER" ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.senderRole === "CUSTOMER" ? "bg-primary text-primary-foreground rounded-tr-none font-medium" : "bg-secondary text-foreground rounded-tl-none border border-border/50"}`}>
                            {msg.images && msg.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {msg.images.map((img, i) => (
                                  <img key={i} src={img} alt="Anexo" className="rounded-lg w-full h-auto max-h-40 object-cover border border-white/10" />
                                ))}
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.senderRole === "ADMIN" || msg.senderRole === "OPERATOR" ? "Suporte JPB" : msg.senderName} • {new Date(msg.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {selectedTicket.status !== "CLOSED" ? (
                      <div className="p-4 border-t border-border bg-card space-y-3">
                        {replyImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 pb-2">
                            {replyImages.map((img, index) => (
                              <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                                <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removeImage(index, true)}
                                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 items-end">
                          <div className="flex-1 relative">
                            <Input
                              value={replyContent}
                              onChange={e => setReplyContent(e.target.value)}
                              placeholder="Digite sua resposta..."
                              className="pr-10 bg-secondary/30 border-border/50 h-11"
                              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReplyTicket()}
                              disabled={isUploading}
                            />
                            <label className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                              <ImageIcon className="w-5 h-5" />
                              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, true)} disabled={isUploading} />
                            </label>
                          </div>
                          <Button
                            onClick={handleReplyTicket}
                            disabled={(!replyContent && replyImages.length === 0) || isUploading}
                            className="h-11 px-6 shimmer-btn font-bold"
                          >
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : "Enviar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-t border-border bg-card text-center text-xs text-muted-foreground">
                        Este chamado foi finalizado pelo atendimento. Se ainda precisar de suporte, abra um novo chamado.
                      </div>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tickets.length === 0 ? (
                      <Card className="bg-card/40 border-dashed border-border/60 py-16 text-center">
                        <CardContent className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                            <MessageSquare className="w-7 h-7 opacity-60" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">Nenhum chamado aberto</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-0.5">
                              Precisa de ajuda com uma compra, garantia ou dúvidas de envio? Nossa equipe está pronta para te atender.
                            </p>
                          </div>
                          <Button size="sm" onClick={() => setIsCreatingTicket(true)} className="shimmer-btn mt-2">
                            <Plus className="w-4 h-4 mr-1.5" /> Abrir Meu Primeiro Chamado
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      tickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          className="bg-card border-border/60 hover:border-primary/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">{ticket.subject}</span>
                                <Badge variant="outline" className={`text-[10px] h-5 ${ticket.status === "CLOSED" ? "border-muted" : "border-primary/40 bg-primary/10 text-primary"}`}>
                                  {ticket.status === "OPEN" ? "Aberto" : ticket.status === "IN_PROGRESS" ? "Em Atendimento" : "Resolvido"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                              <p className="text-[10px] text-muted-foreground">Atualizado em {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 shrink-0 ml-3" />
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* DIALOG DE RE-PAGAMENTO */}
        <Dialog open={!!repayOrder} onOpenChange={(open) => {
          if (!open) {
            setRepayOrder(null);
            setRepayPaymentInfo(null);
            setRepayPayment("CREDIT_CARD");
          }
        }}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {repayPaymentInfo ? "Aguardando Pagamento" : "Finalizar Pagamento do Pedido"}
              </DialogTitle>
            </DialogHeader>
            {repayOrder && (
              <div className="pt-3">
                {!repayPaymentInfo ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Finalize o pagamento do pedido <strong className="text-foreground">#{repayOrder.orderCode || repayOrder.id.slice(-6)}</strong> no valor de <strong className="text-primary font-bold">{repayOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setRepayPayment(method.id)}
                          className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${repayPayment === method.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground/30"
                            }`}
                        >
                          <method.icon
                            className={`h-5 w-5 ${repayPayment === method.id ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span className="text-xs font-semibold text-foreground">{method.label}</span>
                          <span className="text-[10px] text-muted-foreground text-center">{method.desc}</span>
                          {repayPayment === method.id && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {repayPayment === "CREDIT_CARD" ? (
                      <div className="mt-2 min-h-[300px]">
                        <PaymentBrick
                          amount={repayOrder.total}
                          onSubmit={handleRepaySubmit}
                          payer={{
                            email: customerSession?.user.email || profile?.email || 'cliente@eco.com',
                            firstName: (customerSession?.user.displayName?.split(' ')[0] || profile?.name?.split(' ')[0]) || undefined,
                            lastName: (customerSession?.user.displayName?.split(' ').slice(1).join(' ') || profile?.name?.split(' ').slice(1).join(' ')) || undefined,
                            documents: profile?.document ? [{ type: profile.document.length > 14 ? 'CNPJ' : 'CPF', number: profile.document.replace(/\D/g, '') }] : undefined,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4 mt-4 border-t border-border/50">
                        <Button
                          type="button"
                          onClick={handleRepayAlternativeSubmit}
                          size="lg"
                          className="w-full h-12 shimmer-btn rounded-xl text-sm font-bold"
                          disabled={repayProcessing}
                        >
                          {repayProcessing ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                            </span>
                          ) : (
                            `Gerar ${repayPayment === "PIX" ? "Pix Copia e Cola" : "Boleto Bancário"}`
                          )}
                        </Button>

                        <div className="rounded-xl border border-border/70 bg-secondary/30 px-4 py-2.5 flex items-center gap-2 justify-center text-xs text-muted-foreground">
                          <Lock className="h-3.5 w-3.5 text-primary" />
                          Pagamento criptografado e 100% seguro.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {repayPaymentInfo?.qr_code_base64 && (
                      <div className="mb-2 flex flex-col items-center gap-3 bg-secondary/20 p-5 rounded-2xl border border-border w-full">
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                          Escaneie o QR Code para pagar via Pix
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        </h3>
                        <img src={`data:image/png;base64,${repayPaymentInfo.qr_code_base64}`} alt="QR Code Pix" className="w-52 h-52 border border-border rounded-xl p-2 bg-white" />
                        <div className="w-full flex items-center gap-2 mt-1">
                          <Input readOnly value={repayPaymentInfo.qr_code} className="font-mono text-[10px] text-muted-foreground bg-secondary/50 h-9" />
                          <Button type="button" size="sm" onClick={() => { navigator.clipboard.writeText(repayPaymentInfo.qr_code); toast.success("Código Copiado!"); }} variant="outline">
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}

                    {repayPaymentInfo?.ticket_url && (
                      <div className="mb-2 flex flex-col items-center gap-3 bg-secondary/20 p-5 rounded-2xl border border-border w-full">
                        <h3 className="font-bold text-sm text-foreground">Boleto Bancário Gerado</h3>
                        <p className="text-xs text-muted-foreground text-center">Clique no botão abaixo para visualizar ou imprimir seu boleto.</p>
                        <Button asChild className="w-full h-11 shimmer-btn">
                          <a href={repayPaymentInfo.ticket_url} target="_blank" rel="noreferrer">Visualizar Boleto</a>
                        </Button>
                      </div>
                    )}

                    <Button variant="outline" onClick={() => { setRepayOrder(null); setRepayPaymentInfo(null); setRepayPayment("CREDIT_CARD"); }} className="w-full">
                      Fechar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
