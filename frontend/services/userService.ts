import { getApiBase } from '@/services/api';

export interface UserProfileDto {
  username: string;
  name: string | null;
  email: string | null;
  birthDate: string | null;
  phone: string | null;
  address: string | null;
  displayNickname: string | null;
  profileImageUrl: string | null;
  role: string;
}

export async function getUserProfile(): Promise<UserProfileDto> {
  const res = await fetch(`${getApiBase()}/user/profile`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('프로필을 불러올 수 없습니다.');
  return res.json();
}

export interface UpdateProfileParams {
  name?: string;
  email?: string;
  birthDate?: string | null;
  phone?: string;
  address?: string | null;
  displayNickname?: string;
}

export async function updateUserProfile(params: UpdateProfileParams): Promise<UserProfileDto> {
  const res = await fetch(`${getApiBase()}/user/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('프로필 수정에 실패했습니다.');
  return res.json();
}

export async function uploadProfileImage(file: File): Promise<{ profileImageUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${getApiBase()}/user/profile/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || '이미지 업로드에 실패했습니다.');
  }
  return res.json();
}

export interface StampsDto {
  stampCount: number;
  requiredForReward: number;
}

export async function getUserStamps(): Promise<StampsDto> {
  const res = await fetch(`${getApiBase()}/user/stamps`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('스탬프 정보를 불러올 수 없습니다.');
  return res.json();
}

export interface UserCouponDto {
  id: number;
  couponId: number;
  couponName?: string;
  couponCode?: string;
  menuId?: number;
  usedAt: string | null;
  issuedAt: string;
  validUntil?: string | null;
}

export async function getUserCoupons(): Promise<UserCouponDto[]> {
  const res = await fetch(`${getApiBase()}/user/coupons`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('쿠폰 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function redeemCouponCode(code: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/user/coupons/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code: code.trim() }),
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || '쿠폰 등록에 실패했어요.');
  }
}
