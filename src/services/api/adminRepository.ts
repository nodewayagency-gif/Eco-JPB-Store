import type {
  AdminOrderDetail,
  AdminOrderRow,
  AdminOrderStepKey,
  AdminProductInput,
  AdminProductPurchaseHistory,
  AdminProductRow,
  AdminCategory, 
  AdminCategoryInput,
  AdminCoupon,
  AdminCouponInput,
  AdminProductVariant,
  AdminUserRow,
  AdminUserInput,
  SupportTicketView,
  TicketStatus,
  SendTicketMessageInput
} from "@premium/contracts";
import { products } from "@/data/products";

const makeDefaultProductRow = (product: (typeof products)[number], index: number): AdminProductRow => {
  const sku = product.commercial?.sku ?? `JPB-${product.id.padStart(4, "0")}`;

  return {
    id: product.id,
    sku,
    name: product.name,
    category: product.category,
    price: product.price,
    costPrice: product.commercial?.costPrice ?? Number((product.price * 0.62).toFixed(2)),
    rating: product.rating,
    reviews: product.reviews,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity ?? (product.inStock ? 30 - index * 2 : 0),
    minStockAlert: product.minStockAlert ?? 5,
    active: product.active ?? true,
    badge: product.badge,
    weightKg: product.shipping?.weightKg ?? 0.8,
    lengthCm: product.shipping?.dimensions.lengthCm ?? 22,
    widthCm: product.shipping?.dimensions.widthCm ?? 16,
    heightCm: product.shipping?.dimensions.heightCm ?? 10,
    originZipCode: product.shipping?.originZipCode ?? "01001-000",
    fragile: product.shipping?.fragile ?? true,
    freeShipping: product.shipping?.freeShipping ?? false,
    ncm: product.commercial?.ncm,
    ean: product.commercial?.ean,
    taxPercent: product.commercial?.taxPercent,
    gatewayProductId: product.commercial?.gatewayProductId,
    melhorEnvioCategory: product.shipping?.melhorEnvioCategory,
    image: product.image,
    images: product.images
  };
};

const stepOrder: AdminOrderStepKey[] = [
  "created",
  "payment_confirmed",
  "in_separation",
  "ready_to_ship",
  "shipped",
  "out_for_delivery",
  "delivered"
];

const statusByStep: Record<AdminOrderStepKey, AdminOrderRow["statusLabel"]> = {
  created: "Criado",
  payment_confirmed: "Pagamento confirmado",
  in_separation: "Separação",
  ready_to_ship: "Pronto para envio",
  shipped: "Enviado",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue"
};

const makeRowsFromOrders = (orders: AdminOrderDetail[]): AdminOrderRow[] =>
  orders.map((order) => ({
    id: order.id,
    customerName: order.customerName,
    total: order.total,
    currentStep: order.currentStep,
    statusLabel: order.statusLabel,
    createdAt: order.createdAt,
    channel: order.channel,
    paymentGateway: order.paymentGateway,
    shippingProvider: order.shippingProvider
  }));


const toInput = (product: AdminProductRow): AdminProductInput => ({
  sku: product.sku || "",
  name: product.name || "",
  description: product.description || "",
  categoryId: (product as any).categoryId || "",
  price: product.price || 0,
  costPrice: product.costPrice || 0,
  inStock: product.inStock,
  stockQuantity: product.stockQuantity || 0,
  minStockAlert: product.minStockAlert || 0,
  active: product.active,
  badge: product.badge || "",
  weightKg: product.weightKg || 0,
  lengthCm: product.lengthCm || 0,
  widthCm: product.widthCm || 0,
  heightCm: product.heightCm || 0,
  originZipCode: product.originZipCode || "",
  fragile: product.fragile,
  freeShipping: product.freeShipping,
  ncm: product.ncm || "",
  ean: product.ean || "",
  taxPercent: product.taxPercent || 0,
  gatewayProductId: product.id,
  melhorEnvioCategory: product.melhorEnvioCategory || "",
  image: product.image || "",
  images: product.images || [],
  variants: product.variants || []
});

let usersStore: AdminUserRow[] = [
  { id: "u1", name: "Admin Geral", email: "admin@nodeway.com", role: "ADMIN", status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "u2", name: "Operador de Estoque", email: "estoque@nodeway.com", role: "OPERATOR", status: "ACTIVE", createdAt: new Date().toISOString() }
];

const progressOrderStep = (order: AdminOrderDetail, targetStep?: AdminOrderStepKey) => {
  const currentIndex = stepOrder.indexOf(order.currentStep);
  const nextIndex = targetStep ? stepOrder.indexOf(targetStep) : Math.min(currentIndex + 1, stepOrder.length - 1);
  const finalIndex = Math.max(0, nextIndex);
  const newCurrent = stepOrder[finalIndex];
  const now = new Date().toISOString().replace("T", " ").slice(0, 16);

  const steps = order.steps.map((step) => {
    const index = stepOrder.indexOf(step.key);
    if (index < finalIndex) {
      return { ...step, completed: true, active: false, updatedAt: step.updatedAt || now };
    }

    if (index === finalIndex) {
      return { ...step, completed: false, active: true, updatedAt: now, source: "manual" as const };
    }

    return { ...step, completed: false, active: false };
  });

  return {
    ...order,
    currentStep: newCurrent,
    statusLabel: statusByStep[newCurrent],
    steps
  };
};

export interface AdminRepository {
  getMetrics: () => Promise<typeof mockAdminMetrics>;
  getRecentOrders: () => Promise<typeof mockRecentOrders>;
  listOrders: () => Promise<AdminOrderRow[]>;
  getOrder: (id: string) => Promise<AdminOrderDetail | null>;
  advanceOrderStep: (id: string) => Promise<AdminOrderDetail>;
  setOrderStep: (id: string, step: AdminOrderStepKey) => Promise<AdminOrderDetail>;
  listProducts: () => Promise<AdminProductRow[]>;
  getProduct: (id: string) => Promise<AdminProductRow | null>;
  createProduct: (payload: AdminProductInput) => Promise<AdminProductRow>;
  updateProduct: (id: string, changes: Partial<AdminProductInput>) => Promise<AdminProductRow>;
  deleteProduct: (id: string) => Promise<void>;
  listProductPurchaseHistory: (productId: string) => Promise<AdminProductPurchaseHistory[]>;
  listLeads: () => Promise<typeof mockLeads>;
  listCategories: () => Promise<AdminCategory[]>;
  createCategory: (payload: AdminCategoryInput) => Promise<AdminCategory>;
  updateCategory: (id: string, changes: Partial<AdminCategoryInput>) => Promise<AdminCategory>;
  deleteCategory: (id: string) => Promise<void>;
  listCoupons: () => Promise<AdminCoupon[]>;
  createCoupon: (payload: AdminCouponInput) => Promise<AdminCoupon>;
  updateCoupon: (id: string, changes: Partial<AdminCouponInput>) => Promise<AdminCoupon>;
  deleteCoupon: (id: string) => Promise<void>;
  listUsers: () => Promise<AdminUserRow[]>;
  createUser: (payload: AdminUserInput) => Promise<AdminUserRow>;
  updateUser: (id: string, changes: Partial<AdminUserInput>) => Promise<AdminUserRow>;
  deleteUser: (id: string) => Promise<void>;
  listTickets: () => Promise<SupportTicketView[]>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<SupportTicketView>;
  replyTicket: (id: string, input: SendTicketMessageInput) => Promise<SupportTicketView>;
}

import { api } from "../api.ts";

export const adminRepository: AdminRepository = {
  async getMetrics() {
    const { data } = await api.get("/admin/metrics");
    // Mapeia o objeto de métricas para o array que o dashboard espera
    return [
      {
        title: "Receita Total",
        value: data.revenue.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        change: `+${data.revenue.trend}%`,
        trend: data.revenue.trendDirection
      },
      {
        title: "Pedidos",
        value: data.orders.value.toString(),
        change: `+${data.orders.trend}%`,
        trend: data.orders.trendDirection
      },
      {
        title: "Clientes",
        value: data.customers.value.toString(),
        change: `+${data.customers.trend}%`,
        trend: data.customers.trendDirection
      },
      {
        title: "Taxa de Conversão",
        value: `${data.conversionRate.value}%`,
        change: `${data.conversionRate.trend}%`,
        trend: data.conversionRate.trendDirection
      }
    ];
  },

  async getRecentOrders() {
    const { data } = await api.get<any[]>("/admin/orders");
    return data.slice(0, 5).map((order) => ({
      id: order.id,
      customerName: order.guestName || order.customer?.customerProfile?.name || "Cliente",
      productName: order.items[0]?.product?.name || "Vários itens",
      total: Number(order.total),
      status: this.mapStatusToLabel(order.status, order.steps)
    }));
  },

  async listOrders() {
    const { data } = await api.get<any[]>("/admin/orders");
    return data.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      customerName: order.guestName || order.customer?.customerProfile?.name || order.customer?.name || "Cliente",
      total: Number(order.total),
      currentStep: order.steps.find((s: any) => s.active)?.key || "created",
      statusLabel: this.mapStatusToLabel(order.status, order.steps),
      createdAt: order.createdAt,
      channel: order.channel || "Loja Virtual",
      paymentGateway: order.paymentGateway,
      shippingProvider: order.shippingCarrier
    }));
  },

  async getOrder(id) {
    const { data } = await api.get<any>(`/admin/orders/${id}`);
    return {
      id: data.id,
      customerName: data.guestName || data.customer?.customerProfile?.name || "Cliente",
      customerEmail: data.guestEmail || data.customer?.email || "",
      total: Number(data.total),
      currentStep: data.steps.find((s: any) => s.active)?.key || "created",
      statusLabel: this.mapStatusToLabel(data.status, data.steps),
      createdAt: data.createdAt,
      channel: data.channel || "Loja Virtual",
      paymentGateway: data.paymentGateway,
      shippingProvider: data.shippingCarrier,
      items: (data.items || []).map((item: any) => ({
        productName: item.product?.name || "Produto Removido",
        productImage: item.product?.image || "",
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice || item.price || 0)
      })),
      steps: (data.steps || []).map((step: any) => ({
        key: step.key,
        label: step.label,
        completed: step.completed,
        active: step.active,
        source: step.source,
        updatedAt: new Date(step.updatedAt).toLocaleString("pt-BR")
      })),
      shippingAddress: data.shippingAddress ? {
        zipCode: data.shippingAddress.zipCode,
        street: data.shippingAddress.street,
        number: data.shippingAddress.number,
        complement: data.shippingAddress.complement,
        neighborhood: data.shippingAddress.neighborhood,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state
      } : undefined
    };
  },

  async advanceOrderStep(id) {
    // Busca o pedido atual para descobrir o próximo passo
    const order = await this.getOrder(id);
    const stepOrder = ["created", "paid", "in_separation", "ready_for_shipping", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = stepOrder.indexOf(order.currentStep);
    const nextStep = stepOrder[Math.min(currentIndex + 1, stepOrder.length - 1)];
    
    const { data } = await api.patch(`/admin/orders/${id}/step`, { stepKey: nextStep, source: 'manual' });
    return this.getOrder(id); // Recarrega com todos os detalhes
  },

  async setOrderStep(id, step) {
    const { data } = await api.patch(`/admin/orders/${id}/step`, { stepKey: step, source: 'manual' });
    return this.getOrder(id);
  },

  // Helper para mapear status do banco para label amigável
  mapStatusToLabel(status: string, steps: any[]): any {
    const activeStep = steps.find(s => s.active);
    if (activeStep) return activeStep.label.replace("Pedido ", "").replace("Em ", "");
    
    const labels: Record<string, string> = {
      CREATED: "Criado",
      PAID: "Pago",
      SHIPPED: "Enviado",
      DELIVERED: "Entregue",
      CANCELLED: "Cancelado"
    };
    return labels[status] || "Processando";
  },

  async listProducts() {
    const { data } = await api.get<any[]>("/products");
    return data.map((p) => ({
      id: p.id,
      sku: p.sku || `JPB-${p.id.slice(-4).toUpperCase()}`,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      category: p.category?.name || "Geral",
      price: Number(p.price),
      costPrice: Number(p.costPrice) || 0,
      rating: p.rating || 5,
      reviews: p.reviewCount || 0,
      inStock: p.stockQuantity > 0,
      stockQuantity: p.stockQuantity,
      minStockAlert: p.minStockAlert || 5,
      active: p.active,
      badge: p.badge,
      weightKg: p.weightKg || 0,
      lengthCm: p.lengthCm || 0,
      widthCm: p.widthCm || 0,
      heightCm: p.heightCm || 0,
      originZipCode: p.originZipCode || "",
      fragile: p.fragile || false,
      freeShipping: p.freeShipping || false,
      ncm: p.ncm,
      ean: p.ean,
      taxPercent: p.taxPercent,
      gatewayProductId: p.id,
      image: p.image,
      images: p.images || [],
      variants: p.variants || []
    }));
  },

  async getProduct(id) {
    const { data } = await api.get<any>(`/products/${id}`);
    return {
      ...data,
      price: Number(data.price),
      category: data.category?.name || "Geral",
    } as AdminProductRow;
  },

  async createProduct(payload) {
    const { data } = await api.post("/products", payload);
    return data as AdminProductRow;
  },

  async updateProduct(id, changes) {
    const { data } = await api.put(`/products/${id}`, changes);
    return data as AdminProductRow;
  },

  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
  },

  async listProductPurchaseHistory(productId) {
    const { data } = await api.get<AdminProductPurchaseHistory[]>(`/products/${productId}/history`);
    return data;
  },

  async listLeads() {
    const { data } = await api.get<any[]>("/leads");
    return data.map(lead => ({
      email: lead.email,
      product: lead.productName || "Geral",
      date: new Date(lead.createdAt).toLocaleDateString("pt-BR"),
      notified: lead.status === "NOTIFIED"
    }));
  },

  async listCategories() {
    const { data } = await api.get<any[]>("/categories");
    return data.map(c => ({
      ...c,
      productCount: c._count?.products || 0
    }));
  },

  async createCategory(payload) {
    const { data } = await api.post("/categories", payload);
    return data as AdminCategory;
  },

  async updateCategory(id, changes) {
    const { data } = await api.put(`/categories/${id}`, changes);
    return data as AdminCategory;
  },

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
  },

  async listCoupons() {
    const { data } = await api.get<any[]>("/coupons");
    return data.map(c => ({
      id: c.id,
      code: c.code,
      type: c.discountType.toLowerCase(),
      value: Number(c.discountValue),
      minPurchase: Number(c.minOrderValue) || 0,
      usageCount: c.usedCount || 0,
      usageLimit: c.maxUses || 0,
      active: c.active,
      expiryDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : undefined
    }));
  },

  async createCoupon(payload) {
    const { data } = await api.post("/coupons", {
      code: payload.code,
      discountType: payload.type.toUpperCase(),
      discountValue: Number(payload.value),
      minOrderValue: payload.minPurchase ? Number(payload.minPurchase) : null,
      maxUses: payload.usageLimit ? Number(payload.usageLimit) : null,
      endDate: payload.expiryDate ? new Date(payload.expiryDate).toISOString() : null,
      active: payload.active
    });
    return data;
  },

  async updateCoupon(id, changes) {
    const { data } = await api.put(`/coupons/${id}`, {
      code: changes.code,
      discountType: changes.type?.toUpperCase(),
      discountValue: changes.value !== undefined ? Number(changes.value) : undefined,
      minOrderValue: changes.minPurchase !== undefined ? (changes.minPurchase ? Number(changes.minPurchase) : null) : undefined,
      maxUses: changes.usageLimit !== undefined ? (changes.usageLimit ? Number(changes.usageLimit) : null) : undefined,
      endDate: changes.expiryDate !== undefined ? (changes.expiryDate ? new Date(changes.expiryDate).toISOString() : null) : undefined,
      active: changes.active
    });
    return data;
  },

  async deleteCoupon(id) {
    await api.delete(`/coupons/${id}`);
  },

  async listUsers() {
    const { data } = await api.get<AdminUserRow[]>("/admin/users");
    return data;
  },

  async createUser(payload) {
    const { data } = await api.post("/admin/users", payload);
    return data;
  },

  async updateUser(id, changes) {
    const { data } = await api.put(`/admin/users/${id}`, {
      name: changes.name,
      email: changes.email,
      role: changes.role,
      status: changes.status
    });
    return data;
  },

  async deleteUser(id) {
    // Para usuários reais no banco, você precisaria de uma rota DELETE /admin/users/:id
    await api.delete(`/admin/users/${id}`);
  },
  
  async updateUserPassword(id, password) {
    await api.patch(`/admin/users/${id}/password`, { password });
  },

  async listTickets() {
    const { data } = await api.get("/support/tickets");
    return data;
  },

  async updateTicketStatus(id, status) {
    const { data } = await api.patch(`/support/tickets/${id}/status`, { status });
    return data;
  },

  async replyTicket(id, input) {
    const { data } = await api.post(`/support/tickets/${id}/messages`, input);
    return data;
  }
};

export const adminProductMapper = {
  toInput
};
