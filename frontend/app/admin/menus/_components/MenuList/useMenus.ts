'use client';

import { useState, useEffect } from 'react';

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

    useEffect(() => {
        const fetchMenus = async () => {
            const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const url = new URL(`${base}/api/admin/menus`);

            if (request.categoryId)
                url.searchParams.set('categoryId', request.categoryId.toString());
            if (request.searchQuery)
                url.searchParams.set('searchQuery', request.searchQuery);

            console.log('📍 Requesting URL:', url.toString());
            try {
                const res = await fetch(url.toString());
                if (!res.ok) throw new Error('메뉴 데이터를 불러오는데 실패했습니다.');
                const data = await res.json();

                setMenus(data.menus);

            } catch (err) {
                console.error('메뉴를 불러오는 중에 문제가 발생했습니다.', err);
            }
        };

        fetchMenus();
    }, [request.categoryId, request.searchQuery]);

    return { menus, setMenus };
};
