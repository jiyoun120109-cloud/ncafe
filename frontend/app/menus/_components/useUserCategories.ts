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
        Promise.all([
            fetcher('/categories').catch(() => ({ categories: [] })),
            fetcher('/menus').catch(() => ({ menus: [], total: 0 })),
        ])
            .then(([catData, menusData]) => {
                if (cancelled) return;
                const menus = (menusData as { menus?: { categoryName?: string }[] }).menus ?? [];
                const counts: Record<string, number> = {};
                menus.forEach((menu: { categoryName?: string }) => {
                    const key = (menu.categoryName ?? 'unknown').trim();
                    if (key) counts[key] = (counts[key] ?? 0) + 1;
                });
                type RawCategory = { id?: number; name?: string; korName?: string; icon?: string; sortOrder?: number };
                const catList = (catData as { categories?: unknown[] }).categories;
                const raw: RawCategory[] = Array.isArray(catList) ? (catList as RawCategory[]) : [];
                let mapped: UserCategoryItem[] = raw.map((c) => {
                    const id = typeof c.id === 'number' ? c.id : Number(c.id) || 0;
                    const name = (typeof c.name === 'string' ? c.name : c.korName ?? '').trim();
                    return {
                        id,
                        name,
                        icon: (c.icon != null && c.icon !== '') ? String(c.icon) : '',
                        sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : 0,
                        menuCount: counts[name] ?? 0,
                    };
                });
                if (mapped.length === 0 && Object.keys(counts).length > 0) {
                    const names = Object.keys(counts).sort();
                    mapped = names.map((name, idx) => ({
                        id: idx + 1,
                        name,
                        icon: '',
                        sortOrder: idx,
                        menuCount: counts[name] ?? 0,
                    }));
                }
                mapped = mapped.filter((c) => c.name);
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
