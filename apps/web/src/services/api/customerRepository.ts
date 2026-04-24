import { mockCustomerProfiles, mockOrdersByUser } from "@/mocks/customer";

export interface CustomerRepository {
  getProfile: (userId: string) => Promise<(typeof mockCustomerProfiles)[number] | null>;
  getOrders: (userId: string) => Promise<(typeof mockOrdersByUser)[string]>;
}

export const customerRepository: CustomerRepository = {
  async getProfile(userId) {
    return mockCustomerProfiles.find((profile) => profile.userId === userId) ?? null;
  },

  async getOrders(userId) {
    return mockOrdersByUser[userId] ?? [];
  }
};
