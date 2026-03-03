import { Menu } from '@/types/menu';
import { fetcher } from './api';

export const menuService = {
    getAll: () => fetcher('/api/menus'),
    getById: (id: string) => fetcher(`/api/menus/${id}`),
    create: (data: Partial<Menu>) => fetcher('/api/menus', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Menu>) => fetcher(`/api/menus/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id: string) => fetcher(`/api/menus/${id}`, {
        method: 'DELETE',
    }),
};
