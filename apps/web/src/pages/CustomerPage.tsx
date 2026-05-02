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
  Plus
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
import type { CustomerOrderTrackingStep, CustomerOrderView, CustomerProfile, SupportTicketView } from "@premium/contracts";
import { useAuth } from "@/providers/auth/AuthProvider";
import { customerRepository } from "@/services/api/customerRepository";

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

  useEffect(() => {
    const userId = customerSession?.user.id;
    if (!userId) return;

    const load = async () => {
      const [profileData, orderData, ticketsData] = await Promise.all([
        customerRepository.getProfile(userId),
        customerRepository.getOrders(userId),
        customerRepository.getTickets(userId)
      ]);

      setProfile(profileData);
      setOrders(orderData);
      setTickets(ticketsData);
      setExpandedOrder(orderData[0]?.id ?? null);
    };

    load();
  }, [customerSession?.user.id]);

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

  const handleCreateTicket = async () => {
    const userId = customerSession?.user.id;
    if (!userId || !newTicket.subject || !newTicket.description) return;
    
    const created = await customerRepository.createTicket(userId, {
      subject: newTicket.subject,
      description: newTicket.description,
      orderId: newTicket.orderId === "none" ? undefined : newTicket.orderId
    });
    
    setTickets([created, ...tickets]);
    setIsCreatingTicket(false);
    setNewTicket({ subject: "", description: "", orderId: "none" });
  };

  const handleReplyTicket = async () => {
    const userId = customerSession?.user.id;
    if (!userId || !selectedTicket || !replyContent) return;

    const updated = await customerRepository.replyTicket(userId, selectedTicket.id, { content: replyContent });
    if (updated) {
      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
      setSelectedTicket(updated);
      setReplyContent("");
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
                <p className="text-xs text-muted-foreground">{profile?.name ?? customerSession?.user.displayName}</p>
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
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-card border-border overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-foreground">Casa (Principal)</span>
                    <div className="flex gap-3">
                      <button className="text-xs text-primary hover:underline">Editar</button>
                      <button className="text-xs text-destructive hover:underline">Excluir</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Rua das Flores, 123</p>
                    <p className="text-sm text-muted-foreground">Apto 42 - Centro</p>
                    <p className="text-sm text-muted-foreground">São Paulo - SP, 01234-567</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/30 border-border border-dashed flex flex-col items-center justify-center p-6 text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors cursor-pointer group">
                 <MapPin className="h-6 w-6 mb-2 text-primary/50 group-hover:text-primary transition-colors" />
                 <span className="text-sm font-medium">Cadastrar novo endereço</span>
              </Card>
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
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Abrir Chamado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} placeholder="Ex: Produto com defeito" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pedido Relacionado (Opcional)</Label>
                      <Select value={newTicket.orderId} onValueChange={v => setNewTicket({...newTicket, orderId: v})}>
                        <SelectTrigger className="w-full bg-background border-border text-foreground">
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
                      <Label>Descrição</Label>
                      <Textarea value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} placeholder="Descreva o problema..." className="min-h-[100px]" />
                    </div>
                    <Button className="w-full" onClick={handleCreateTicket} disabled={!newTicket.subject || !newTicket.description}>
                      Enviar Chamado
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
                    {selectedTicket.status === "OPEN" ? "Aberto" : selectedTicket.status === "IN_PROGRESS" ? "Em Atendimento" : "Fechado"}
                  </Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderRole === "CUSTOMER" ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.senderRole === "CUSTOMER" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">{msg.senderName} • {new Date(msg.createdAt).toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== "CLOSED" && (
                  <div className="p-4 border-t border-border bg-card flex gap-2">
                    <Input 
                      value={replyContent} 
                      onChange={e => setReplyContent(e.target.value)} 
                      placeholder="Digite sua resposta..." 
                      className="flex-1"
                      onKeyDown={e => e.key === "Enter" && handleReplyTicket()}
                    />
                    <Button onClick={handleReplyTicket} disabled={!replyContent}>Enviar</Button>
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

