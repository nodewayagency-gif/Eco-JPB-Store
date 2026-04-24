import type {
  AdminLead,
  AdminMetric,
  AdminOrderDetail,
  AdminOrderSummary,
  AdminProductPurchaseHistory
} from "@premium/contracts";

export const mockAdminMetrics: AdminMetric[] = [
  { title: "Vendas Totais", value: "R$ 373.200", change: "+12.5%", trend: "up" },
  { title: "Pedidos", value: "184", change: "+8.2%", trend: "up" },
  { title: "Leads Captados", value: "47", change: "+23.1%", trend: "up" },
  { title: "Ticket Médio", value: "R$ 2.028", change: "+4.7%", trend: "up" }
];

export const mockRecentOrders: AdminOrderSummary[] = [
  { id: "#JPB-1042", customerName: "Carlos Silva", productName: "JPB Studio Pro", total: 1899.9, status: "Entregue" },
  { id: "#JPB-1041", customerName: "Ana Oliveira", productName: "JPB Air Elite", total: 999.9, status: "Enviado" },
  { id: "#JPB-1040", customerName: "Pedro Santos", productName: "JPB Chrono Ultra", total: 2499.9, status: "Processando" },
  { id: "#JPB-1039", customerName: "Maria Costa", productName: "JPB Studio Lite", total: 1199.9, status: "Entregue" }
];

export const mockLeads: AdminLead[] = [
  { email: "joao@email.com", product: "JPB SoundCore X", date: "12/03/2026", notified: false },
  { email: "camila@email.com", product: "JPB SoundCore X", date: "11/03/2026", notified: false },
  { email: "roberto@email.com", product: "JPB SoundCore X", date: "10/03/2026", notified: true },
  { email: "fernanda@email.com", product: "JPB SoundCore X", date: "09/03/2026", notified: true }
];

export const mockProductPurchaseHistory: AdminProductPurchaseHistory[] = [
  {
    id: "h1",
    productId: "1",
    orderCode: "#JPB-1042",
    customerName: "Carlos Silva",
    date: "2026-03-08",
    quantity: 1,
    unitPrice: 1899.9,
    total: 1899.9,
    paymentStatus: "Aprovado",
    paymentGateway: "Mercado Pago",
    shippingCarrier: "Correios",
    shippingQuoteId: "ME-89432"
  },
  {
    id: "h2",
    productId: "2",
    orderCode: "#JPB-1041",
    customerName: "Ana Oliveira",
    date: "2026-03-07",
    quantity: 1,
    unitPrice: 999.9,
    total: 999.9,
    paymentStatus: "Aprovado",
    paymentGateway: "Stripe",
    shippingCarrier: "Jadlog",
    shippingQuoteId: "ME-88211"
  },
  {
    id: "h3",
    productId: "1",
    orderCode: "#JPB-1033",
    customerName: "Lucas Ferraz",
    date: "2026-02-21",
    quantity: 2,
    unitPrice: 1799.9,
    total: 3599.8,
    paymentStatus: "Aprovado",
    paymentGateway: "Pagar.me",
    shippingCarrier: "Melhor Envio - Azul Cargo",
    shippingQuoteId: "ME-77003"
  }
];

export const mockOrders: AdminOrderDetail[] = [
  {
    id: "#JPB-1042",
    customerName: "Carlos Silva",
    total: 1899.9,
    currentStep: "out_for_delivery",
    statusLabel: "Saiu para entrega",
    createdAt: "2026-03-08",
    channel: "Loja",
    paymentGateway: "Mercado Pago",
    shippingProvider: "Melhor Envio",
    trackingCode: "ME123BR",
    shippingQuoteId: "ME-89432",
    items: [{ productName: "JPB Studio Pro", quantity: 1, unitPrice: 1899.9 }],
    steps: [
      { key: "created", label: "Pedido criado", completed: true, active: false, updatedAt: "2026-03-08 10:10", source: "system" },
      { key: "payment_confirmed", label: "Pagamento confirmado", completed: true, active: false, updatedAt: "2026-03-08 10:12", source: "webhook" },
      { key: "in_separation", label: "Em separação", completed: true, active: false, updatedAt: "2026-03-08 11:00", source: "manual" },
      { key: "ready_to_ship", label: "Pronto para envio", completed: true, active: false, updatedAt: "2026-03-09 08:40", source: "manual" },
      { key: "shipped", label: "Enviado", completed: true, active: false, updatedAt: "2026-03-09 10:15", source: "webhook" },
      { key: "out_for_delivery", label: "Saiu para entrega", completed: false, active: true, updatedAt: "2026-03-11 08:30", source: "webhook" },
      { key: "delivered", label: "Entregue", completed: false, active: false, updatedAt: "", source: "system" }
    ]
  },
  {
    id: "#JPB-2001",
    customerName: "Loja Parceira Centro",
    total: 2599.8,
    currentStep: "in_separation",
    statusLabel: "Separação",
    createdAt: "2026-03-12",
    channel: "Venda externa",
    paymentGateway: "Outro",
    shippingProvider: "Manual",
    items: [{ productName: "JPB Air Elite", quantity: 2, unitPrice: 1299.9 }],
    steps: [
      { key: "created", label: "Pedido criado", completed: true, active: false, updatedAt: "2026-03-12 09:00", source: "manual" },
      { key: "payment_confirmed", label: "Pagamento confirmado", completed: true, active: false, updatedAt: "2026-03-12 09:30", source: "manual" },
      { key: "in_separation", label: "Em separação", completed: false, active: true, updatedAt: "2026-03-12 10:00", source: "manual" },
      { key: "ready_to_ship", label: "Pronto para envio", completed: false, active: false, updatedAt: "", source: "system" },
      { key: "shipped", label: "Enviado", completed: false, active: false, updatedAt: "", source: "system" },
      { key: "out_for_delivery", label: "Saiu para entrega", completed: false, active: false, updatedAt: "", source: "system" },
      { key: "delivered", label: "Entregue", completed: false, active: false, updatedAt: "", source: "system" }
    ]
  }
];
