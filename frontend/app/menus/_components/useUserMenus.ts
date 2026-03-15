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
    badgeTypes?: string[];
    likeCount?: number;
    viewCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserMenuListResponse {
    menus: UserMenuResponse[];
    total: number;
}

export interface UserMenuListRequest {
    categoryId: number | null;
    /** 여러 카테고리 이름으로 필터 (예: 음료 = 라떼,에이드,티,스무디) */
    categoryNames?: string[];
    searchQuery: string;
    /** 정렬: price_desc | price_asc | likes | name */
    sort?: string;
}

export function useUserMenus(request: UserMenuListRequest) {
    const [menus, setMenus] = useState<UserMenuResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = new URL(`${getApiBase()}/menus`);
        if (request.categoryId != null && !(request.categoryNames?.length)) {
            url.searchParams.set('categoryId', request.categoryId.toString());
        }
        if (request.searchQuery) {
            url.searchParams.set('searchQuery', request.searchQuery);
        }
        if (request.sort) {
            url.searchParams.set('sort', request.sort);
        }
        let cancelled = false;
        fetch(url.toString())
            .then((res) => {
                if (!res.ok) throw new Error('메뉴를 불러오는데 실패했습니다.');
                return res.json();
            })
            .then((data: UserMenuListResponse) => {
                if (cancelled) return;
                let list = data.menus ?? [];
                if (request.categoryNames?.length) {
                    const set = new Set(request.categoryNames);
                    list = list.filter((m) => set.has((m as UserMenuResponse).categoryName));
                }
                setMenus(list);
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
    }, [request.categoryId, request.categoryNames?.join(','), request.searchQuery, request.sort]);

    return { menus, loading };
}
