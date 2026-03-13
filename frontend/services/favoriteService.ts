import { getApiBase } from '@/services/api';

export interface FavoriteDto {
  id: number;
  menuId: number;
  createdAt: string;
}

export async function getFavorites(): Promise<FavoriteDto[]> {
  const res = await fetch(`${getApiBase()}/favorites`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('찜 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function addFavorite(menuId: number): Promise<FavoriteDto> {
  const res = await fetch(`${getApiBase()}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ menuId }),
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('찜 추가에 실패했습니다.');
  return res.json();
}

export async function removeFavorite(menuId: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/favorites/${menuId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('찜 해제에 실패했습니다.');
}
