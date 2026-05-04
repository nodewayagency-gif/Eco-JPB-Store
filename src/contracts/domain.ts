export type OrderStatus = "CREATED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ProductShippingProfile {
  weightKg: number;
  dimensions: ProductDimensions;
  fragile: boolean;
  freeShipping: boolean;
  originZipCode: string;
  insuranceValue?: number;
  melhorEnvioCategory?: string;
}

export interface ProductCommercialProfile {
  sku: string;
  costPrice: number;
  ncm?: string;
  ean?: string;
  taxPercent?: number;
  gatewayProductId?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  badge?: "Premium" | "Limited" | "Novo";
  inStock: boolean;
  stockQuantity?: number;
  minStockAlert?: number;
  active?: boolean;
  colors: { name: string; hex: string }[];
  specs: { label: string; value: string }[];
  description: string;
  rating: number;
  reviews: number;
  commercial?: ProductCommercialProfile;
  shipping?: ProductShippingProfile;
}
