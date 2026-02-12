'use client';

import { useState, useEffect } from 'react';

interface MenuDetail {
    id: number;
    korName: string;
    engName: string;
    categoryName: string;
    price: number;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    description: string;
}

export function useMenuDetail(id: number) {
    const [menu, setMenu] = useState<MenuDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenuDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v1/admin/menus/${id}`);

                if (!response.ok) {
                    throw new Error('메뉴를 불러오는데 실패했습니다.');
                }

                const data = await response.json();
                console.log('Menu Detail Data:', data);
                setMenu(data);
            } catch (err) {
                console.error('Fetch Error:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMenuDetail();
        }
    }, [id]);

    return { menu, loading, error };
}
