import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  ChevronUp,
  LogOut,
  MessageSquare,
  Plus,
  Image as ImageIcon,
  X,
  Paperclip
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { CustomerOrderTrackingStep, CustomerOrderView, CustomerProfile, SupportTicketView } from "@premium/contracts";
import { useAuth } from "@/providers/auth/AuthProvider";
import { customerRepository } from "@/services/api/customerRepository";
import { supabase } from "@/lib/supabase";

const statusStyle: Record<string, string> = {
  Entregue: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Em Trânsito": "bg-primary/20 text-primary border-primary/30",
  Processando: "bg-amber-500/20 text-amber-400 border-amber-500/30"
};

const iconByStep = (title: string) => {
  if (title.includes("Trânsito")) return Truck;
  if (title.includes("Entregue") || title.includes("Confirmado")) return CheckCircle2;
  if (title.includes("Entrega")) return MapPin;
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
              className={`absolute left-[-20px] top-8 w-px h-[calc(100%-8px)] ${
                step.completed ? "bg-primary/60" : "bg-border"
              }`}
            />
          ) : null}

          <div
            className={`absolute left-[-28px] top-1 w-[17px] h-[17px] rounded-full flex items-center justify-center ${
              step.active
                ? "bg-primary ring-4 ring-primary/20"
                : step.completed
                  ? "bg-primary/80"
                  : "bg-secondary border border-border"
            }`}
          >
            <Icon
              className={`w-2.5 h-2.5 ${
                step.completed || step.active ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            />
          </div>

          <div>
            <p className={`text-sm font-medium ${step.active ? "text-primary" : "text-foreground"}`}>
              {step.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">{step.date}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

const CustomerPage = () => {
  const { customerSession, logoutCustomer } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrderView[]>([]);
  const [tickets, setTickets] = useState<SupportTicketView[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "tickets">("orders");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketView | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "", orderId: "none" });
  const [selectedImages, setSelectedImages] = useState<{file: File, preview: string}[]>([]);
  const [replyImages, setReplyImages] = useState<{file: File, preview: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      if (isReply) {
        setReplyImages(prev => [...prev, ...newImages]);
      } else {
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    }
  };

  const removeImage = (index: number, isReply = false) => {
    if (isReply) {
      setReplyImages(prev => {
        const newImages = [...prev];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        return newImages;
      });
    } else {
      setSelectedImages(prev => {
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

      // Upload das imagens para o Supabase
      for (const item of selectedImages) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `tickets/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
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

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  
  const maskZipCode = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 9);
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
        title: address.title,
        zipCode: maskZipCode(address.zipCode),
        street: address.street,
        number: address.number,
        complement: address.complement || "",
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        isDefault: address.isDefault
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
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
    }
    setIsAddressDialogOpen(true);
  };

  const handleUpdateAddress = async () => {
    try {
      await customerRepository.updateAddress({
        addressId: editingAddress?.id,
        ...addressForm
      });
      toast.success(editingAddress ? "Endereço atualizado!" : "Endereço cadastrado!");
      setIsAddressDialogOpen(false);
      // Recarregar perfil para pegar dados novos
      const profileData = await customerRepository.getProfile();
      setProfile(profileData);
    } catch (error) {
      toast.error("Erro ao salvar endereço.");
    }
  };

  const loadTickets = async () => {
    const userId = customerSession?.user.id;
    if (!userId) return;
    try {
      const ticketsData = await customerRepository.getTickets(userId);
      setTickets(ticketsData);
      
      // Se houver um ticket selecionado, atualizar ele também
      if (selectedTicket) {
        const updated = ticketsData.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error("Erro ao carregar chamados:", error);
    }
  };

  // Busca de CEP automática
  useEffect(() => {
    const zip = addressForm.zipCode.replace(/\D/g, "");
    if (zip.length === 8) {
      const fetchAddress = async () => {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setAddressForm(prev => ({
              ...prev,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      };
      fetchAddress();
    }
  }, [addressForm.zipCode]);

  useEffect(() => {
    const userId = customerSession?.user.id;
    if (!userId) return;

    const load = async () => {
      const [profileData, orderData] = await Promise.all([
        customerRepository.getProfile(userId),
        customerRepository.getOrders(userId)
      ]);

      setProfile(profileData);
      setOrders(orderData);
      setExpandedOrder(orderData[0]?.id ?? null);
      await loadTickets();
    };

    load();

    // Polling a cada 5 segundos
    const interval = setInterval(() => {
      loadTickets();
    }, 5000);

    return () => clearInterval(interval);
  }, [customerSession?.user.id, selectedTicket?.id]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const onLogout = async () => {
    await logoutCustomer();
    navigate("/login", { replace: true });
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

      // Upload das imagens de resposta para o Supabase
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
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass-surface sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <div>
                <span className="text-lg font-bold gold-text">Minha Conta</span>
                <p className="text-xs text-muted-foreground">{profile?.name || customerSession?.user.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 border-border hover:border-primary/50">
                <ShoppingBag className="w-4 h-4" /> Loja
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Pedidos</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-foreground">
                {totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total gasto</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border col-span-2 sm:col-span-1">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-primary">
                {orders.filter((order) => order.status === "Em Trânsito").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Em trânsito</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-6 border-b border-border">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "orders" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Histórico de Pedidos
            {activeTab === "orders" && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "addresses" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Meus Endereços
            {activeTab === "addresses" && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab("tickets")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "tickets" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Atendimento
            {activeTab === "tickets" && <motion.div layoutId="tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary" />}
          </button>
        </div>

        {activeTab === "orders" ? (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Últimos Pedidos
            </h2>

          {orders.map((order) => {
            const open = expandedOrder === order.id;

            return (
              <motion.div key={order.id} layout>
                <Card className="bg-card border-border overflow-hidden">
                  <button
                    onClick={() => toggle(order.id)}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{order.product}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.id} - {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusStyle[order.status]}>
                        {order.status}
                      </Badge>
                      <span className="font-medium text-foreground text-sm">
                        {order.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        })}
                      </span>
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {open ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                      <Separator className="bg-border" />
                      <div className="p-5 pt-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Rastreio</p>
                        <OrderTimeline steps={order.tracking} />
                      </div>
                    </motion.div>
                  ) : null}
                </Card>
              </motion.div>
            );
          })}
        </div>
        ) : activeTab === "addresses" ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Endereços Cadastrados
              </h2>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => openAddressDialog()}>
                <Plus className="w-4 h-4" /> Novo Endereço
              </Button>
            </div>

            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
              <DialogContent className="sm:max-w-[500px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>{editingAddress ? "Editar Endereço" : "Cadastrar Novo Endereço"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Título (ex: Casa, Trabalho)</Label>
                    <Input value={addressForm.title} onChange={e => setAddressForm({...addressForm, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input 
                      value={addressForm.zipCode} 
                      onChange={e => setAddressForm({...addressForm, zipCode: maskZipCode(e.target.value)})} 
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Rua</Label>
                    <Input value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input value={addressForm.complement} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input value={addressForm.neighborhood} onChange={e => setAddressForm({...addressForm, neighborhood: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (UF)</Label>
                    <Input value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
                    <input 
                      type="checkbox" 
                      id="isDefault" 
                      className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    />
                    <Label htmlFor="isDefault" className="text-sm font-medium leading-none cursor-pointer">
                      Definir como endereço principal
                    </Label>
                  </div>
                  <Button className="col-span-2 mt-4 shimmer-btn" onClick={handleUpdateAddress}>
                    {editingAddress ? "Salvar Alterações" : "Cadastrar Endereço"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {profile?.addresses && profile.addresses.length > 0 ? (
                profile.addresses.map((addr: any) => (
                  <Card key={addr.id} className="bg-card border-border overflow-hidden relative">
                    {addr.isDefault && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-bold text-foreground">{addr.title}</span>
                        <div className="flex gap-3">
                          <button 
                            className="text-xs text-primary hover:underline"
                            onClick={() => openAddressDialog(addr)}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{addr.street}, {addr.number}</p>
                        {addr.complement && <p className="text-sm text-muted-foreground">{addr.complement}</p>}
                        <p className="text-sm text-muted-foreground">{addr.neighborhood}</p>
                        <p className="text-sm text-muted-foreground">{addr.city} - {addr.state}, {addr.zipCode}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : profile?.address ? (
                // Fallback para quando só tem um endereço legado (se houver)
                <Card className="bg-card border-border overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-bold text-foreground">Principal</span>
                      <div className="flex gap-3">
                        <button 
                          className="text-xs text-primary hover:underline"
                          onClick={() => openAddressDialog(profile.address)}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{profile.address.street}, {profile.address.number}</p>
                      {profile.address.complement && <p className="text-sm text-muted-foreground">{profile.address.complement}</p>}
                      <p className="text-sm text-muted-foreground">{profile.address.neighborhood}</p>
                      <p className="text-sm text-muted-foreground">{profile.address.city} - {profile.address.state}, {profile.address.zipCode}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-secondary/30 border-border border-dashed flex flex-col items-center justify-center p-6 text-muted-foreground col-span-2">
                  <p className="text-sm">Nenhum endereço cadastrado.</p>
                </Card>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Meus Chamados
              </h2>
              <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
                  <div className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Assunto</Label>
                      <Input 
                        value={newTicket.subject} 
                        onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
                        placeholder="Ex: Produto com defeito ou Atraso" 
                        className="bg-secondary/30 border-border/50 focus:border-primary/50 h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Pedido Relacionado (Opcional)</Label>
                      <Select value={newTicket.orderId} onValueChange={v => setNewTicket({...newTicket, orderId: v})}>
                        <SelectTrigger className="w-full bg-secondary/30 border-border/50 text-foreground h-11">
                          <SelectValue placeholder="Selecione um pedido" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          <SelectItem value="none">Nenhum</SelectItem>
                          {orders.map(o => (
                            <SelectItem key={o.id} value={o.id}>{o.id} - {o.product}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Descrição do Problema</Label>
                      <Textarea 
                        value={newTicket.description} 
                        onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
                        placeholder="Conte-nos o que aconteceu detalhadamente..." 
                        className="min-h-[120px] bg-secondary/30 border-border/50 focus:border-primary/50 resize-none" 
                      />
                    </div>

                    {/* Anexo de Fotos */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Anexar Fotos (Opcional)</Label>
                      <div className="flex flex-wrap gap-3">
                        {selectedImages.map((img, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-1">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground font-medium">Adicionar</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
                        </label>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                      onClick={handleCreateTicket} 
                      disabled={!newTicket.subject || !newTicket.description || isUploading}
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          <Paperclip className="w-4 h-4 mr-2" />
                          Enviar Solicitação
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {selectedTicket ? (
              <Card className="bg-card border-border overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTicket(null)}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <h3 className="font-semibold text-sm">{selectedTicket.subject}</h3>
                      <p className="text-xs text-muted-foreground">Chamado #{selectedTicket.id}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={selectedTicket.status === "CLOSED" ? "border-muted" : "border-primary text-primary"}>
                    {selectedTicket.status === "OPEN" ? "Aberto" : selectedTicket.status === "IN_PROGRESS" ? "Em Atendimento" : "Resolvido"}
                  </Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]/50">
                  {/* Mensagem Inicial (Abertura do Chamado) */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm bg-secondary text-foreground rounded-tl-none border border-border/50">
                      {selectedTicket.images && selectedTicket.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {selectedTicket.images.map((img, i) => (
                            <img key={i} src={img} alt="Anexo Inicial" className="rounded-lg w-full h-auto max-h-40 object-cover border border-white/10" />
                          ))}
                        </div>
                      )}
                      <p className="text-sm font-semibold mb-1 text-primary/80">Descrição Inicial:</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">{selectedTicket.customerName} • {new Date(selectedTicket.createdAt).toLocaleString("pt-BR")}</span>
                  </div>

                  {/* Mensagens da Conversa */}
                  {selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderRole === "CUSTOMER" ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.senderRole === "CUSTOMER" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none border border-border/50"}`}>
                        {msg.images && msg.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {msg.images.map((img, i) => (
                              <img key={i} src={img} alt="Anexo" className="rounded-lg w-full h-auto max-h-40 object-cover border border-white/10" />
                            ))}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.senderName} • {new Date(msg.createdAt).toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>
                
                {selectedTicket.status !== "CLOSED" && (
                  <div className="p-4 border-t border-border bg-card space-y-3">
                    {/* Preview de imagens na resposta */}
                    {replyImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pb-2">
                        {replyImages.map((img, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(index, true)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        className="h-11 px-6 bg-primary hover:bg-primary/90 font-bold"
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : "Enviar"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Nenhum chamado aberto.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-card border-border hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setSelectedTicket(ticket)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{ticket.subject}</span>
                            <Badge variant="outline" className={`text-[10px] h-5 ${ticket.status === "CLOSED" ? "border-muted" : "border-primary text-primary"}`}>
                              {ticket.status === "OPEN" ? "Aberto" : ticket.status === "IN_PROGRESS" ? "Em Atendimento" : "Fechado"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-2">Atualizado em {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CustomerPage;

