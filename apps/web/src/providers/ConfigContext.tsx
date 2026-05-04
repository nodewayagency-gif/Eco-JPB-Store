import React, { createContext, useContext, useEffect, useState } from "react";
import type { CompanySettings } from "@premium/contracts";
import { settingsRepository } from "@/services/api/settingsRepository";

interface ConfigContextType {
  config: CompanySettings | null;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsRepository.getCompanySettings()
      .then(data => {
        setConfig(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
