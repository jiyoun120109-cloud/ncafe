import { getApiBase } from '@/services/api';

export interface AdminSettingsDto {
  siteName?: string;
  businessHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  /** 사업자정보 */
  businessRegistrationNumber?: string;
  companyName?: string;
  representativeName?: string;
  businessType?: string;
  businessItem?: string;
  /** 도메인별 활성화 (true/false) */
  featureMenu?: string;
  featureOrder?: string;
  featureNotice?: string;
  featureInquiry?: string;
  featureMember?: string;
}

const SETTING_KEYS: (keyof AdminSettingsDto)[] = [
  'siteName', 'businessHours', 'contactPhone', 'contactEmail', 'address',
  'businessRegistrationNumber', 'companyName', 'representativeName', 'businessType', 'businessItem',
  'featureMenu', 'featureOrder', 'featureNotice', 'featureInquiry', 'featureMember',
];

function toDto(raw: Record<string, string>): AdminSettingsDto {
  const dto: AdminSettingsDto = {};
  for (const k of SETTING_KEYS) {
    const v = raw[k];
    dto[k] = v !== undefined && v !== null ? v : '';
  }
  return dto;
}

export async function fetchAdminSettings(): Promise<AdminSettingsDto> {
  const res = await fetch(`${getApiBase()}/admin/settings`, { credentials: 'include' });
  if (!res.ok) throw new Error('설정을 불러올 수 없습니다.');
  const raw = await res.json();
  return toDto(raw);
}

export async function updateAdminSettings(payload: AdminSettingsDto): Promise<AdminSettingsDto> {
  const body: Record<string, string> = {};
  for (const k of SETTING_KEYS) {
    const v = payload[k];
    if (v !== undefined) body[k] = v;
  }
  const res = await fetch(`${getApiBase()}/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('설정 저장에 실패했습니다.');
  const raw = await res.json();
  return toDto(raw);
}
