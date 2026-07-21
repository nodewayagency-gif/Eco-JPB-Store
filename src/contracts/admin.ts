export interface AdminMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface AdminOrderSummary {
  id: string;
  customerName: string;
  productName: string;
  total: number;
  status: "Entregue" | "Enviado" | "Processando";
}

export interface AdminProductVariant {
  id: string;
  sku: string;
  name: string; // ex: "Preto / G"
  price?: number; // Preço opcional se houver override
  stockQuantity: number;
}

export type AdminOrderStepKey =
  | "created"
  | "waiting_payment"
  | "payment_confirmed"
  | "in_separation"
  | "ready_to_ship"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export interface AdminOrderWorkflowStep {
  key: AdminOrderStepKey;
  label: string;
  completed: boolean;
  active: boolean;
  updatedAt: string;
  source: "manual" | "webhook" | "system";
}

export interface AdminOrderRow {
  id: string;
  customerId?: string;
  customerName: string;
  total: number;
  currentStep: AdminOrderStepKey;
  statusLabel: "Criado" | "Pagamento confirmado" | "Separação" | "Pronto para envio" | "Enviado" | "Saiu para entrega" | "Entregue";
  createdAt: string;
  paidAt?: string;
  channel: "Loja" | "Venda externa";
  paymentGateway?: "Mercado Pago" | "Asaas" | "Outro";
  shippingProvider?: "Melhor Envio" | "Mercado Livre" | "Manual";
}

export interface AdminOrderDetail extends AdminOrderRow {
  items: Array<{
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
  }>;
  trackingCode?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerDocument?: string;
  paymentMethod?: string;
  installments?: number;
  shippingCost?: number;
  shippingQuoteId?: string;
  steps: AdminOrderWorkflowStep[];
  shippingAddress?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface AdminProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity: number;
  minStockAlert: number;
  active: boolean;
  badge?: "Premium" | "Limited" | "Novo" | "";
  description: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  originZipCode: string;
  fragile: boolean;
  freeShipping: boolean;
  ncm?: string;
  ean?: string;
  taxPercent?: number;
  gatewayProductId?: string;
  melhorEnvioCategory?: string;
  image?: string;
  images?: string[];
  topics?: string[];
  variants?: AdminProductVariant[];
}

export interface AdminProductInput {
  sku: string;
  name: string;
  description?: string;
  category: string;
  categoryId?: string;
  price: number;
  costPrice: number;
  inStock: boolean;
  stockQuantity: number;
  minStockAlert: number;
  active: boolean;
  badge?: "Premium" | "Limited" | "Novo" | "";
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  originZipCode: string;
  fragile: boolean;
  freeShipping: boolean;
  ncm?: string;
  ean?: string;
  taxPercent?: number;
  gatewayProductId?: string;
  melhorEnvioCategory?: string;
  image?: string;
  images?: string[];
  topics?: string[];
  variants?: AdminProductVariant[];
}

export interface AdminProductPurchaseHistory {
  id: string;
  productId: string;
  orderCode: string;
  customerName: string;
  date: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentStatus: "Aprovado" | "Pendente" | "Cancelado";
  paymentGateway?: "Stripe" | "Mercado Pago" | "Pagar.me";
  shippingCarrier?: string;
  shippingQuoteId?: string;
}

export interface CompanySettings {
  companyName: string;
  tradeName?: string;
  document: string;
  email: string;
  phone: string;
  originZipCode: string;
  addressLine: string;
  city: string;
  state: string;
  instagramUrl?: string;
}

export interface PaymentGatewaySettings {
  mercadoPago: {
    enabled: boolean;
    publicKey: string;
    accessToken: string;
    webhookSecret: string;
  };
  asaas: {
    enabled: boolean;
    apiKey: string;
    walletId?: string;
    webhookSecret: string;
  };
}

export interface ShippingIntegrationSettings {
  mercadoLivre: {
    enabled: boolean;
    appId: string;
    clientSecret: string;
    accessToken: string;
  };
  melhorEnvio: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    tokenType?: string;
    sandbox: boolean;
  };
}

export interface AdminLead {
  id: string;
  name: string;
  phone: string;
  product: string;
  date: string;
  notified: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  active: boolean;
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  active: boolean;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
}

export interface AdminCouponInput {
  code: string;
  type: "fixed" | "percentage";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  active: boolean;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  customerProfile?: {
    name: string;
    phone?: string;
  };
}

export interface AdminUserInput {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "OPERATOR" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
}

export interface AdminReviewView {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AdminReviewInput {
  authorName: string;
  rating: number;
  comment?: string;
}
