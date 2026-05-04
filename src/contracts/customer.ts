export interface CustomerOrderTrackingStep {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  active?: boolean;
}

export interface CustomerOrderView {
  id: string;
  product: string;
  total: number;
  date: string;
  status: "Entregue" | "Em Trânsito" | "Processando";
  tracking: CustomerOrderTrackingStep[];
}

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  defaultAddress?: string;
}

