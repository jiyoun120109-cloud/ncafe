import { getApiBase } from '@/services/api';

export interface AdminMemberDto {
  id: number;
  username: string;
  name: string | null;
  email?: string | null;
  role: string;
  status?: string;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface AdminMemberDetailDto {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  displayNickname: string | null;
  role: string;
  status: string | null;
  lastLoginAt: string | null;
  lockedUntil: string | null;
  loginFailCount: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrderSummaryDto {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface InquirySummaryDto {
  id: number;
  title: string;
  createdAt: string;
}

export interface LoginLogEntryDto {
  success: boolean;
  ipAddress: string | null;
  createdAt: string;
}

export interface FavoriteSummaryDto {
  menuId: number;
  menuName: string | null;
  createdAt: string;
}

export interface AdminMemberDetailWithActivityDto {
  member: AdminMemberDetailDto;
  recentOrders: OrderSummaryDto[];
  recentInquiries: InquirySummaryDto[];
  recentLoginLogs: LoginLogEntryDto[];
  recentFavorites?: FavoriteSummaryDto[];
}

export interface AdminMemberListResponse {
  content: AdminMemberDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AdminMemberListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  role?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;
}

export async function fetchAdminMembers(
  page: number = 0,
  size: number = 20,
  search?: string,
  params?: { status?: string; role?: string; fromDate?: string; toDate?: string }
): Promise<AdminMemberListResponse> {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (search != null && search.trim() !== '') q.set('search', search.trim());
  if (params?.status) q.set('status', params.status);
  if (params?.role) q.set('role', params.role);
  if (params?.fromDate) q.set('fromDate', params.fromDate);
  if (params?.toDate) q.set('toDate', params.toDate);
  const res = await fetch(`${getApiBase()}/admin/members?${q}`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 목록을 불러올 수 없습니다.');
  return res.json();
}

/** 필터 조건과 동일하게 역할별 회원 수 집계 (필터 적용 시 사용) */
export async function fetchAdminMemberRoleCounts(params?: {
  search?: string;
  status?: string;
  role?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<Record<string, number>> {
  const q = new URLSearchParams();
  if (params?.search?.trim()) q.set('search', params.search.trim());
  if (params?.status) q.set('status', params.status);
  if (params?.role) q.set('role', params.role);
  if (params?.fromDate) q.set('fromDate', params.fromDate);
  if (params?.toDate) q.set('toDate', params.toDate);
  const queryString = q.toString();
  const res = await fetch(`${getApiBase()}/admin/members/stats/role-counts${queryString ? `?${queryString}` : ''}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('역할별 집계를 불러올 수 없습니다.');
  const data = await res.json();
  return typeof data === 'object' && data !== null ? data : {};
}

export async function fetchAdminMember(id: number): Promise<AdminMemberDetailWithActivityDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 정보를 불러올 수 없습니다.');
  return res.json();
}

export async function updateAdminMemberProfile(
  id: number,
  params: {
    displayNickname?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }
): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      displayNickname: params.displayNickname ?? undefined,
      name: params.name ?? undefined,
      phone: params.phone ?? undefined,
      email: params.email ?? undefined,
      address: params.address ?? undefined,
    }),
  });
  if (!res.ok) throw new Error('프로필 수정에 실패했습니다.');
  return res.json();
}

export async function resetAdminMemberPassword(id: number, newPassword: string): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) throw new Error('비밀번호 초기화에 실패했습니다.');
  return res.json();
}

export async function updateAdminMemberStatus(id: number, status: string): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
  return res.json();
}

export async function unlockAdminMember(id: number): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}/unlock`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('잠금 해제에 실패했습니다.');
  return res.json();
}

export async function updateAdminMemberRole(id: number, role: string): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('역할 변경에 실패했습니다.');
  return res.json();
}

export async function deleteAdminMember(id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 404) throw new Error('회원을 찾을 수 없습니다.');
  if (!res.ok) throw new Error('회원 삭제에 실패했습니다.');
}
