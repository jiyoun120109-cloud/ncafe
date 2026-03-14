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

export interface AdminMemberDetailWithActivityDto {
  member: AdminMemberDetailDto;
  recentOrders: OrderSummaryDto[];
  recentInquiries: InquirySummaryDto[];
  recentLoginLogs: LoginLogEntryDto[];
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
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;
}

export async function fetchAdminMembers(
  page: number = 0,
  size: number = 20,
  search?: string,
  params?: { status?: string; fromDate?: string; toDate?: string }
): Promise<AdminMemberListResponse> {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  if (search != null && search.trim() !== '') q.set('search', search.trim());
  if (params?.status) q.set('status', params.status);
  if (params?.fromDate) q.set('fromDate', params.fromDate);
  if (params?.toDate) q.set('toDate', params.toDate);
  const res = await fetch(`${getApiBase()}/admin/members?${q}`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function fetchAdminMember(id: number): Promise<AdminMemberDetailWithActivityDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 정보를 불러올 수 없습니다.');
  return res.json();
}

export async function updateAdminMemberProfile(
  id: number,
  email: string | null,
  phone: string | null
): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: email ?? undefined, phone: phone ?? undefined }),
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
