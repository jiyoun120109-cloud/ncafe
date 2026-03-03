'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/services/api';

export interface UserCategoryItem {
    id: number;
    name: string;
    icon: string;
    sortOrder: number;
    menuCount: number;
}

export function useUserCategories() {
    const [categories, setCategories] = useState<UserCategoryItem[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetcher('/categories'), fetcher('/menus')])
            .then(([catData, menusData]) => {
                if (cancelled) return;
                const menus = (menusData as { menus?: { categoryName?: string }[] }).menus ?? [];
                const counts: Record<string, number> = {};
                menus.forEach((menu: { categoryName?: string }) => {
                    const key = menu.categoryName ?? 'unknown';
                    counts[key] = (counts[key] ?? 0) + 1;
                });
                const catList = (catData as { categories?: unknown }).categories;
                const raw = Array.isArray(catList)
                    ? catList
                    : Array.isArray(catData)
                        ? catData
                        : [];
                const mapped: UserCategoryItem[] = raw.map((c: { id: number; name?: string; korName?: string; icon?: string; sortOrder?: number }) => {
                    const name = typeof c.name === 'string' ? c.name : c.korName ?? '';
                    return {
                        id: c.id,
                        name,
                        icon: c.icon ?? '',
                        sortOrder: c.sortOrder ?? 0,
                        menuCount: counts[name] ?? 0,
                    };
                });
                setCategories(mapped);
                setTotalCount((menusData as { total?: number }).total ?? menus.length);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error('카테고리 조회 오류:', err);
                    setCategories([]);
                    setTotalCount(0);
                }
            });
        return () => { cancelled = true; };
    }, []);

    return { categories, totalCount };
}
