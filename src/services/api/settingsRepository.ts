import { api } from "../api";
import type { CompanySettings } from "@premium/contracts";

export const settingsRepository = {
  async getCompanySettings(): Promise<CompanySettings> {
    const { data } = await api.get(`/settings/company?t=${Date.now()}`);
    return data;
  }
};
