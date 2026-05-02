export type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "CUSTOMER" | "ADMIN" | "OPERATOR";
  content: string;
  createdAt: string;
}

export interface SupportTicketView {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  orderId?: string;
  orderCode?: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
}

export interface CreateSupportTicketInput {
  subject: string;
  description: string;
  orderId?: string;
}

export interface SendTicketMessageInput {
  content: string;
}
