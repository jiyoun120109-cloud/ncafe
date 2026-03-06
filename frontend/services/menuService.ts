import { Menu } from '@/types/menu';
import { fetcher } from './api';

// fetcher 내부에서 getApiBase() + url 사용 → 이미 /api 접두어 있음. 경로만 전달.
export const menuService = {
    getAll: () => fetcher('/menus'),
    getById: (id: string) => fetcher(`/menus/${id}`),
    create: (data: Partial<Menu>) => fetcher('/menus', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Menu>) => fetcher(`/menus/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: string) => fetcher(`/menus/${id}`, {
        method: 'DELETE',
    }),
};
