import { mockCustomerProfiles, mockOrdersByUser } from "@/mocks/customer";
import type { CreateSupportTicketInput, SendTicketMessageInput, SupportTicketView } from "@premium/contracts";

export const mockTickets: SupportTicketView[] = [
  {
    id: "tkt_001",
    customerId: "usr_customer_001",
    customerName: "Carlos Silva",
    customerEmail: "carlos@example.com",
    subject: "Atraso na entrega do pedido",
    description: "Gostaria de saber o status atualizado da entrega, pois passou do prazo.",
    status: "IN_PROGRESS",
    orderId: "#JPB-1042",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      {
        id: "msg_1",
        senderId: "usr_customer_001",
        senderName: "Carlos Silva",
        senderRole: "CUSTOMER",
        content: "Gostaria de saber o status atualizado da entrega, pois passou do prazo.",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "msg_2",
        senderId: "admin_1",
        senderName: "Suporte JPB",
        senderRole: "ADMIN",
        content: "Olá Carlos! Verificamos com a transportadora e houve um pequeno atraso devido à chuva, mas já está em rota. Deve chegar amanhã.",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  }
];

export interface CustomerRepository {
  getProfile: (userId: string) => Promise<(typeof mockCustomerProfiles)[number] | null>;
  getOrders: (userId: string) => Promise<(typeof mockOrdersByUser)[string]>;
  getTickets: (userId: string) => Promise<SupportTicketView[]>;
  createTicket: (userId: string, input: CreateSupportTicketInput) => Promise<SupportTicketView>;
  replyTicket: (userId: string, ticketId: string, input: SendTicketMessageInput) => Promise<SupportTicketView | null>;
}

export const customerRepository: CustomerRepository = {
  async getProfile(userId) {
    return mockCustomerProfiles.find((profile) => profile.userId === userId) ?? null;
  },

  async getOrders(userId) {
    return mockOrdersByUser[userId] ?? [];
  },

  async getTickets(userId) {
    return mockTickets.filter(t => t.customerId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async createTicket(userId, input) {
    const profile = await this.getProfile(userId);
    const newTicket: SupportTicketView = {
      id: `tkt_${Math.random().toString(36).substring(7)}`,
      customerId: userId,
      customerName: profile?.name || "Cliente",
      customerEmail: "cliente@email.com",
      subject: input.subject,
      description: input.description,
      status: "OPEN",
      orderId: input.orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Math.random().toString(36).substring(7)}`,
          senderId: userId,
          senderName: profile?.name || "Cliente",
          senderRole: "CUSTOMER",
          content: input.description,
          createdAt: new Date().toISOString()
        }
      ]
    };
    mockTickets.push(newTicket);
    return newTicket;
  },

  async replyTicket(userId, ticketId, input) {
    const ticket = mockTickets.find(t => t.id === ticketId && t.customerId === userId);
    if (!ticket) return null;
    const profile = await this.getProfile(userId);
    
    ticket.messages.push({
      id: `msg_${Math.random().toString(36).substring(7)}`,
      senderId: userId,
      senderName: profile?.name || "Cliente",
      senderRole: "CUSTOMER",
      content: input.content,
      createdAt: new Date().toISOString()
    });
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }
};
