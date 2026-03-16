'use client';

import { useState, useEffect } from 'react';
import { getApiBase } from '@/services/api';

export interface UserMenuDetail {
    id: number;
    korName: string;
    engName: string;
    categoryName: string;
    price: number;
    isAvailable: boolean;
    description: string;
    productInfoJson: string | null;
    optionsJson: string | null;
    createdAt: string;
    updatedAt: string;
}

export function useUserMenuDetail(id: string | null) {
    const [menu, setMenu] = useState<UserMenuDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        const numericId = Number.parseInt(id, 10);
        if (!Number.isFinite(numericId) || numericId <= 0) {
            setLoading(false);
            setError('잘못된 메뉴 ID입니다.');
            setMenu(null);
            return;
        }
        const finalId = String(numericId);
        let cancelled = false;
        fetch(`${getApiBase()}/menus/${finalId}`)
            .then((res) => {
                if (!res.ok) throw new Error('메뉴를 불러오는데 실패했습니다.');
                return res.json();
            })
            .then((data: UserMenuDetail) => {
                if (!cancelled) setMenu(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [id]);

    return { menu, loading, error };
}
