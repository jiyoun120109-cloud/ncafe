import { getApiBase } from '@/services/api';

export interface AdminSettingsDto {
  siteName?: string;
  businessHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  maintenanceMode?: string;
}

export async function fetchAdminSettings(): Promise<AdminSettingsDto> {
  const res = await fetch(`${getApiBase()}/admin/settings`, { credentials: 'include' });
  if (!res.ok) throw new Error('설정을 불러올 수 없습니다.');
  const raw = await res.json();
  return {
    siteName: raw.siteName ?? '',
    businessHours: raw.businessHours ?? '',
    contactPhone: raw.contactPhone ?? '',
    contactEmail: raw.contactEmail ?? '',
    address: raw.address ?? '',
    maintenanceMode: raw.maintenanceMode ?? 'false',
  };
}

export async function updateAdminSettings(payload: AdminSettingsDto): Promise<AdminSettingsDto> {
  const body: Record<string, string> = {};
  if (payload.siteName !== undefined) body.siteName = payload.siteName;
  if (payload.businessHours !== undefined) body.businessHours = payload.businessHours;
  if (payload.contactPhone !== undefined) body.contactPhone = payload.contactPhone;
  if (payload.contactEmail !== undefined) body.contactEmail = payload.contactEmail;
  if (payload.address !== undefined) body.address = payload.address;
  if (payload.maintenanceMode !== undefined) body.maintenanceMode = payload.maintenanceMode;

  const res = await fetch(`${getApiBase()}/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('설정 저장에 실패했습니다.');
  const raw = await res.json();
  return {
    siteName: raw.siteName ?? '',
    businessHours: raw.businessHours ?? '',
    contactPhone: raw.contactPhone ?? '',
    contactEmail: raw.contactEmail ?? '',
    address: raw.address ?? '',
    maintenanceMode: raw.maintenanceMode ?? 'false',
  };
}
