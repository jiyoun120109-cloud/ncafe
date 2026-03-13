'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { fetchPublicSettings, type SiteSettingsDto } from '@/services/siteSettingsService';

const defaultSettings: SiteSettingsDto = {
  siteName: 'NCafe',
  businessHours: '평일 09:00 - 21:00 / 주말 10:00 - 22:00',
  contactPhone: '',
  contactEmail: '',
  address: '',
  maintenanceMode: 'false',
};

type SiteSettingsContextValue = SiteSettingsDto & { loaded: boolean };

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  ...defaultSettings,
  loaded: false,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsDto>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo(
    () => ({
      ...settings,
      loaded,
    }),
    [settings, loaded]
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  const ctx = useContext(SiteSettingsContext);
  return ctx ?? { ...defaultSettings, loaded: false };
}
