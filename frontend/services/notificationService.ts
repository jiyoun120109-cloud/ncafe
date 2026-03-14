import { getApiBase } from '@/services/api';

export interface NotificationDto {
  id: number;
  type: string;
  refId: number | null;
  title: string | null;
  message: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function getMyNotifications(): Promise<NotificationDto[]> {
  const res = await fetch(`${getApiBase()}/notifications`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('알림 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await fetch(`${getApiBase()}/notifications/unread-count`, { credentials: 'include' });
  if (res.status === 401) return 0;
  if (!res.ok) return 0;
  const data = await res.json();
  return Number(data?.count ?? 0);
}

export async function markNotificationRead(id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/notifications/${id}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('읽음 처리에 실패했습니다.');
}

export async function deleteNotification(id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('알림 삭제에 실패했습니다.');
}
