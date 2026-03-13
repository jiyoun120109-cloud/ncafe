import { getApiBase } from '@/services/api';

export interface AdminMemberDto {
  id: number;
  username: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface AdminMemberDetailDto extends AdminMemberDto {
  email: string | null;
  updatedAt: string;
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

export async function fetchAdminMembers(
  page: number = 0,
  size: number = 20,
  search?: string
): Promise<AdminMemberListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search != null && search.trim() !== '') params.set('search', search.trim());
  const res = await fetch(`${getApiBase()}/admin/members?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function fetchAdminMember(id: number): Promise<AdminMemberDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/members/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 정보를 불러올 수 없습니다.');
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
