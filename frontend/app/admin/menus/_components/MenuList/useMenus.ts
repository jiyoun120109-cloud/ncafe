'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiBase } from '@/services/api';

export interface MenuResponse {
    id: number;
    korName: string;
    engName: string;
    description: string;
    price: number;
    categoryId?: number | null;
    categoryName: string;
    imageSrc: string;
    isAvailable: boolean;
    isSoldOut: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    badgeTypes?: string[];
}

export interface MenuListResponse {
    menus: MenuResponse[];
    total: number;
}

export type MenuSortBy =
    | 'views_desc'
    | 'likes_desc'
    | 'price_desc'
    | 'price_asc'
    | 'name_asc'
    | 'name_eng_asc';

export interface MenuListRequest {
    categoryId: number | null;
    searchQuery: string;
    sortBy?: MenuSortBy | null;
    isAvailable?: boolean | null;
}

export const useMenus = (request: MenuListRequest) => {
    const [menus, setMenus] = useState<MenuResponse[]>([]);

    const fetchMenus = useCallback(async () => {
        const url = new URL(`${getApiBase()}/admin/menus`);
        if (request.categoryId != null)
            url.searchParams.set('categoryId', request.categoryId.toString());
        if (request.searchQuery)
            url.searchParams.set('searchQuery', request.searchQuery);
        if (request.sortBy)
            url.searchParams.set('sortBy', request.sortBy);
        if (request.isAvailable !== undefined && request.isAvailable !== null)
            url.searchParams.set('isAvailable', String(request.isAvailable));
        try {
            const res = await fetch(url.toString(), { credentials: 'include' });
            if (!res.ok) throw new Error('메뉴 데이터를 불러오는데 실패했습니다.');
            const data = await res.json();
            setMenus(data.menus ?? []);
        } catch (err) {
            console.error('메뉴를 불러오는 중에 문제가 발생했습니다.', err);
        }
    }, [request.categoryId, request.searchQuery, request.sortBy, request.isAvailable]);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    return { menus, setMenus, refetch: fetchMenus };
};
