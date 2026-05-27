export interface CustomerOrderTrackingStep {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  active?: boolean;
}

export interface CustomerOrderView {
  id: string;
  orderCode?: string;
  product: string;
  total: number;
  date: string;
  status: string;
  tracking: CustomerOrderTrackingStep[];
}

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  documentType?: string;
  defaultAddress?: string;
  addresses?: any[];
  address?: any;
}

