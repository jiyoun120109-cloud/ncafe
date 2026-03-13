import { getApiBase } from '@/services/api';

export interface NoticeDto {
  id: number;
  title: string;
  content: string;
  authorId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function getNotices(): Promise<NoticeDto[]> {
  const res = await fetch(`${getApiBase()}/notices`, { credentials: 'include' });
  if (!res.ok) throw new Error('공지 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function getNotice(id: number): Promise<NoticeDto> {
  const res = await fetch(`${getApiBase()}/notices/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('공지를 불러올 수 없습니다.');
  return res.json();
}
