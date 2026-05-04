import { api } from "../api";

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  paymentMethod: string;
  shippingAddress: any;
}

export const orderRepository = {
  async create(input: CreateOrderInput) {
    const { data } = await api.post("/orders", input);
    return data;
  }
};
