import type {
  CompanySettings,
  PaymentGatewaySettings,
  ShippingIntegrationSettings
} from "@premium/contracts";

const COMPANY_KEY = "premium_admin_company_settings";
const PAYMENT_KEY = "premium_admin_payment_settings";
const SHIPPING_KEY = "premium_admin_shipping_settings";

const defaultCompanySettings: CompanySettings = {
  companyName: "JPB Store LTDA",
  tradeName: "JPB Store",
  document: "00.000.000/0001-00",
  email: "financeiro@jpb.com",
  phone: "+55 11 4002-8922",
  originZipCode: "01001-000",
  addressLine: "Rua Aurora, 450",
  city: "São Paulo",
  state: "SP"
};

const defaultPaymentSettings: PaymentGatewaySettings = {
  mercadoPago: {
    enabled: false,
    publicKey: "",
    accessToken: "",
    webhookSecret: ""
  },
  asaas: {
    enabled: false,
    apiKey: "",
    walletId: "",
    webhookSecret: ""
  }
};

const defaultShippingSettings: ShippingIntegrationSettings = {
  mercadoLivre: {
    enabled: false,
    appId: "",
    clientSecret: "",
    accessToken: ""
  },
  melhorEnvio: {
    enabled: false,
    clientId: "",
    clientSecret: "",
    accessToken: "",
    tokenType: "Bearer",
    sandbox: true
  }
};

const readJSON = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return { ...fallback, ...JSON.parse(value) } as T;
  } catch {
    return fallback;
  }
};

const writeJSON = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

import { api } from "../api";

export interface AdminSettingsRepository {
  getCompanySettings: () => Promise<CompanySettings>;
  saveCompanySettings: (payload: CompanySettings) => Promise<CompanySettings>;
  getPaymentSettings: () => Promise<PaymentGatewaySettings>;
  savePaymentSettings: (payload: PaymentGatewaySettings) => Promise<PaymentGatewaySettings>;
  getShippingSettings: () => Promise<ShippingIntegrationSettings>;
  saveShippingSettings: (payload: ShippingIntegrationSettings) => Promise<ShippingIntegrationSettings>;
}

export const adminSettingsRepository: AdminSettingsRepository = {
  async getCompanySettings() {
    try {
      const { data } = await api.get("/admin/settings/company");
      return data;
    } catch {
      return defaultCompanySettings;
    }
  },

  async saveCompanySettings(payload) {
    const { data } = await api.put("/admin/settings/company", payload);
    return data;
  },

  async getPaymentSettings() {
    try {
      const { data } = await api.get("/admin/settings/payment");
      return data;
    } catch {
      return defaultPaymentSettings;
    }
  },

  async savePaymentSettings(payload) {
    const { data } = await api.put("/admin/settings/payment", payload);
    return data;
  },

  async getShippingSettings() {
    try {
      const { data } = await api.get("/admin/settings/shipping");
      return data;
    } catch {
      return defaultShippingSettings;
    }
  },

  async saveShippingSettings(payload) {
    const { data } = await api.put("/admin/settings/shipping", payload);
    return data;
  }
};
