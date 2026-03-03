'use client';

import { useState, useEffect } from 'react';
import { getApiBase } from '@/services/api';

export interface UserMenuResponse {
    id: number;
    korName: string;
    engName: string;
    description: string;
    price: number;
    categoryName: string;
    imageSrc: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserMenuListResponse {
    menus: UserMenuResponse[];
    total: number;
}

export interface UserMenuListRequest {
    categoryId: number | null;
    searchQuery: string;
}

export function useUserMenus(request: UserMenuListRequest) {
    const [menus, setMenus] = useState<UserMenuResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = new URL(`${getApiBase()}/menus`);
        if (request.categoryId != null) {
            url.searchParams.set('categoryId', request.categoryId.toString());
        }
        if (request.searchQuery) {
            url.searchParams.set('searchQuery', request.searchQuery);
        }
        let cancelled = false;
        fetch(url.toString())
            .then((res) => {
                if (!res.ok) throw new Error('메뉴를 불러오는데 실패했습니다.');
                return res.json();
            })
            .then((data: UserMenuListResponse) => {
                if (!cancelled) setMenus(data.menus ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error('메뉴 조회 오류:', err);
                    setMenus([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [request.categoryId, request.searchQuery]);

    return { menus, loading };
}
