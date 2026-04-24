import type {
  AdminOrderDetail,
  AdminOrderRow,
  AdminOrderStepKey,
  AdminProductInput,
  AdminProductPurchaseHistory,
  AdminProductRow
} from "@premium/contracts";
import { products } from "@/data/products";
import {
  mockAdminMetrics,
  mockLeads,
  mockOrders,
  mockProductPurchaseHistory,
  mockRecentOrders
} from "@/mocks/admin";
import { mockCategories } from "@/data/categories";
import { mockCoupons } from "@/data/coupons";
import type { 
  AdminCategory, 
  AdminCategoryInput,
  AdminCoupon,
  AdminCouponInput,
  AdminProductVariant 
} from "@premium/contracts";

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
    melhorEnvioCategory: product.shipping?.melhorEnvioCategory
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

let productRows: AdminProductRow[] = products.map(makeDefaultProductRow);
let productPurchaseHistory: AdminProductPurchaseHistory[] = [...mockProductPurchaseHistory];
let ordersStore: AdminOrderDetail[] = [...mockOrders];
let categoriesStore: AdminCategory[] = [...mockCategories];
let couponsStore: AdminCoupon[] = [...mockCoupons];

const toInput = (product: AdminProductRow): AdminProductInput => ({
  sku: product.sku,
  name: product.name,
  category: product.category,
  price: product.price,
  costPrice: product.costPrice,
  inStock: product.inStock,
  stockQuantity: product.stockQuantity,
  minStockAlert: product.minStockAlert,
  active: product.active,
  badge: product.badge,
  weightKg: product.weightKg,
  lengthCm: product.lengthCm,
  widthCm: product.widthCm,
  heightCm: product.heightCm,
  originZipCode: product.originZipCode,
  fragile: product.fragile,
  freeShipping: product.freeShipping,
  ncm: product.ncm,
  ean: product.ean,
  taxPercent: product.taxPercent,
  gatewayProductId: product.id,
  melhorEnvioCategory: product.melhorEnvioCategory,
  variants: product.variants
});

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
}

export const adminRepository: AdminRepository = {
  async getMetrics() {
    return mockAdminMetrics;
  },

  async getRecentOrders() {
    return mockRecentOrders;
  },

  async listOrders() {
    return makeRowsFromOrders(ordersStore);
  },

  async getOrder(id) {
    return ordersStore.find((order) => order.id === id) ?? null;
  },

  async advanceOrderStep(id) {
    const index = ordersStore.findIndex((order) => order.id === id);
    if (index === -1) {
      throw new Error("Pedido não encontrado.");
    }

    ordersStore[index] = progressOrderStep(ordersStore[index]);
    return ordersStore[index];
  },

  async setOrderStep(id, step) {
    const index = ordersStore.findIndex((order) => order.id === id);
    if (index === -1) {
      throw new Error("Pedido não encontrado.");
    }

    ordersStore[index] = progressOrderStep(ordersStore[index], step);
    return ordersStore[index];
  },

  async listProducts() {
    return [...productRows];
  },

  async getProduct(id) {
    return productRows.find((product) => product.id === id) ?? null;
  },

  async createProduct(payload) {
    const id = `${Date.now()}`;
    const created: AdminProductRow = {
      id,
      rating: 0,
      reviews: 0,
      ...payload,
      gatewayProductId: id
    };

    productRows = [created, ...productRows];
    return created;
  },

  async updateProduct(id, changes) {
    const index = productRows.findIndex((product) => product.id === id);

    if (index === -1) {
      throw new Error("Produto não encontrado.");
    }

    const current = productRows[index];
    productRows[index] = {
      ...current,
      ...changes,
      gatewayProductId: current.id,
      inStock: changes.stockQuantity !== undefined ? changes.stockQuantity > 0 : changes.inStock ?? current.inStock
    };

    return productRows[index];
  },

  async listProductPurchaseHistory(productId) {
    return productPurchaseHistory
      .filter((row) => row.productId === productId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  async listLeads() {
    return mockLeads;
  },

  async listCategories() {
    return [...categoriesStore];
  },

  async createCategory(payload) {
    const id = `cat_${Date.now()}`;
    const created: AdminCategory = {
      id,
      ...payload,
      productCount: 0
    };
    categoriesStore = [created, ...categoriesStore];
    return created;
  },

  async updateCategory(id, changes) {
    const index = categoriesStore.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Categoria não encontrada.");

    categoriesStore[index] = {
      ...categoriesStore[index],
      ...changes
    };
    return categoriesStore[index];
  },

  async deleteCategory(id) {
    categoriesStore = categoriesStore.filter((c) => c.id !== id);
  },

  async listCoupons() {
    return [...couponsStore];
  },

  async createCoupon(payload) {
    const id = `cp_${Date.now()}`;
    const created: AdminCoupon = {
      id,
      ...payload,
      usageCount: 0
    };
    couponsStore = [created, ...couponsStore];
    return created;
  },

  async updateCoupon(id, changes) {
    const index = couponsStore.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Cupom não encontrado.");

    couponsStore[index] = {
      ...couponsStore[index],
      ...changes
    };
    return couponsStore[index];
  },

  async deleteCoupon(id) {
    couponsStore = couponsStore.filter((c) => c.id !== id);
  }
};

export const adminProductMapper = {
  toInput
};
