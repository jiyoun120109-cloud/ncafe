import { getApiBase } from '@/services/api';

export interface SiteSettingsDto {
  siteName: string;
  businessHours: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  maintenanceMode: string;
}

const DEFAULTS: SiteSettingsDto = {
  siteName: 'NCafe',
  businessHours: '평일 09:00 - 21:00 / 주말 10:00 - 22:00',
  contactPhone: '',
  contactEmail: '',
  address: '',
  maintenanceMode: 'false',
};

export async function fetchPublicSettings(): Promise<SiteSettingsDto> {
  const res = await fetch(`${getApiBase()}/settings`, { credentials: 'include' });
  if (!res.ok) return DEFAULTS;
  const raw = await res.json();
  return {
    siteName: raw.siteName ?? DEFAULTS.siteName,
    businessHours: raw.businessHours ?? DEFAULTS.businessHours,
    contactPhone: raw.contactPhone ?? '',
    contactEmail: raw.contactEmail ?? '',
    address: raw.address ?? '',
    maintenanceMode: raw.maintenanceMode ?? 'false',
  };
}
