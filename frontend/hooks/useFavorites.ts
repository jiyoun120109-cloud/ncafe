'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getFavorites, addFavorite, removeFavorite } from '@/services/favoriteService';

/**
 * 찜(즐겨찾기) — 회원 전용, 백엔드 API 연동.
 * 비회원 시 목록은 비어 있고, 클릭 시 로그인 유도는 컴포넌트에서 처리.
 */
export function useFavorites() {
    const { isAuthenticated, sessionChecked } = useAuthStore();
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const effectiveAuth = !!sessionChecked && !!isAuthenticated;

    const refresh = useCallback(async () => {
        if (!sessionChecked || !isAuthenticated) {
            setFavoriteIds([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const list = await getFavorites();
            setFavoriteIds(list.map((f) => f.menuId));
        } catch {
            setFavoriteIds([]);
        } finally {
            setLoading(false);
        }
    }, [sessionChecked, isAuthenticated]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const isFavorite = useCallback((menuId: number) => favoriteIds.includes(menuId), [favoriteIds]);

    const toggleFavorite = useCallback(
        async (menuId: number) => {
            if (!effectiveAuth) return;
            const currently = favoriteIds.includes(menuId);
            try {
                if (currently) {
                    await removeFavorite(menuId);
                } else {
                    await addFavorite(menuId);
                }
                await refresh();
            } catch {
                // 실패 시 상태만 유지
            }
        },
        [effectiveAuth, favoriteIds, refresh]
    );

    return {
        favoriteIds,
        isFavorite,
        toggleFavorite,
        isAuthenticated: effectiveAuth,
        loading,
        refresh,
    };
}
