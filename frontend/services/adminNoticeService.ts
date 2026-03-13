import { getApiBase } from '@/services/api';

export interface AdminNoticeDto {
  id: number;
  noticeType: string | null;
  title: string;
  content: string | null;
  authorId: number | null;
  viewCount: number;
  isPinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNoticeListResponse {
  content: AdminNoticeDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export async function fetchAdminNotices(
  page: number = 0,
  size: number = 10,
  search?: string
): Promise<AdminNoticeListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search != null && search.trim() !== '') params.set('search', search.trim());
  const res = await fetch(`${getApiBase()}/admin/notices?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('공지 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function fetchAdminNotice(id: number, incrementView: boolean = true): Promise<AdminNoticeDto> {
  const res = await fetch(
    `${getApiBase()}/admin/notices/${id}?incrementView=${incrementView}`,
    { credentials: 'include' }
  );
  if (!res.ok) throw new Error('공지를 불러올 수 없습니다.');
  return res.json();
}

export async function fetchAdminNoticePrev(id: number): Promise<AdminNoticeDto | null> {
  const res = await fetch(`${getApiBase()}/admin/notices/${id}/prev`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAdminNoticeNext(id: number): Promise<AdminNoticeDto | null> {
  const res = await fetch(`${getApiBase()}/admin/notices/${id}/next`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

export async function createAdminNotice(params: {
  noticeType?: string;
  title: string;
  content?: string;
  isPinned?: boolean;
}): Promise<AdminNoticeDto> {
  const res = await fetch(`${getApiBase()}/admin/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('공지 등록에 실패했습니다.');
  return res.json();
}

export async function updateAdminNotice(
  id: number,
  params: { noticeType?: string; title?: string; content?: string; isPinned?: boolean }
): Promise<AdminNoticeDto> {
  const res = await fetch(`${getApiBase()}/admin/notices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('공지 수정에 실패했습니다.');
  return res.json();
}

export async function toggleAdminNoticePin(id: number): Promise<AdminNoticeDto> {
  const res = await fetch(`${getApiBase()}/admin/notices/${id}/pin`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('고정 상태 변경에 실패했습니다.');
  return res.json();
}

export async function deleteAdminNotice(id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/admin/notices/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('공지 삭제에 실패했습니다.');
}

export async function deleteAdminNotices(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const res = await fetch(`${getApiBase()}/admin/notices/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error('선택 공지 삭제에 실패했습니다.');
}

/** 공지 본문용 이미지/첨부파일 업로드. FormData에 "file" 키로 파일 전달. 반환: { url, filename } */
export async function uploadNoticeFile(file: File): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${getApiBase()}/admin/notices/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || '파일 업로드에 실패했습니다.');
  }
  return res.json();
}
