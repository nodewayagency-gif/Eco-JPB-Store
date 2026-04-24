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
    return readJSON(COMPANY_KEY, defaultCompanySettings);
  },

  async saveCompanySettings(payload) {
    writeJSON(COMPANY_KEY, payload);
    return payload;
  },

  async getPaymentSettings() {
    return readJSON(PAYMENT_KEY, defaultPaymentSettings);
  },

  async savePaymentSettings(payload) {
    writeJSON(PAYMENT_KEY, payload);
    return payload;
  },

  async getShippingSettings() {
    return readJSON(SHIPPING_KEY, defaultShippingSettings);
  },

  async saveShippingSettings(payload) {
    writeJSON(SHIPPING_KEY, payload);
    return payload;
  }
};
