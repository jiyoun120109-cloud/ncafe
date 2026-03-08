'use client';

import { useState, useEffect } from 'react';
import { getApiBase } from '@/services/api';

export interface MenuResponse {
    id: number;
    korName: string;
    engName: string;
    description: string;
    price: number;
    categoryName: string;
    imageSrc: string;
    isAvailable: boolean;
    isSoldOut: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface MenuListResponse {
    menus: MenuResponse[],
    total: number,
}

export interface MenuListRequest {
    categoryId: number | null;
    searchQuery: string;
}

export const useMenus = (request: MenuListRequest) => {
    const [menus, setMenus] = useState<MenuResponse[]>([]);

    const fetchMenus = async () => {
        const url = new URL(`${getApiBase()}/admin/menus`);
        if (request.categoryId)
            url.searchParams.set('categoryId', request.categoryId.toString());
        if (request.searchQuery)
            url.searchParams.set('searchQuery', request.searchQuery);
        try {
            const res = await fetch(url.toString(), { credentials: 'include' });
            if (!res.ok) throw new Error('메뉴 데이터를 불러오는데 실패했습니다.');
            const data = await res.json();
            setMenus(data.menus ?? []);
        } catch (err) {
            console.error('메뉴를 불러오는 중에 문제가 발생했습니다.', err);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, [request.categoryId, request.searchQuery]);

    return { menus, setMenus, refetch: fetchMenus };
};
