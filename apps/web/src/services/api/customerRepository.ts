import type { CreateSupportTicketInput, SendTicketMessageInput, SupportTicketView } from "@premium/contracts";
import { api } from "../api";

export interface CustomerRepository {
  getProfile: (userId?: string) => Promise<any>;
  getOrders: (userId: string) => Promise<any>;
  getTickets: (userId: string) => Promise<SupportTicketView[]>;
  createTicket: (userId: string, input: CreateSupportTicketInput) => Promise<SupportTicketView>;
  replyTicket: (userId: string, ticketId: string, input: SendTicketMessageInput) => Promise<SupportTicketView | null>;
  updateAddress: (data: any) => Promise<any>;
}

export const customerRepository: CustomerRepository = {
  async getProfile(userId?: string) {
    console.log("[CustomerRepository] Buscando /customers/me...");
    const { data } = await api.get("/customers/me");
    return data;
  },

  async getOrders(userId) {
    const { data } = await api.get("/orders/me");
    return data;
  },

  async getTickets(userId) {
    const { data } = await api.get("/support/tickets/me");
    return data;
  },

  async createTicket(userId, input) {
    const { data } = await api.post("/support/tickets", input);
    return data;
  },

  async replyTicket(userId, ticketId, input) {
    const { data } = await api.post(`/support/tickets/${ticketId}/messages`, input);
    return data;
  },

  async updateAddress(data: any) {
    const { data: response } = await api.put("/customers/address", data);
    return response;
  }
};
