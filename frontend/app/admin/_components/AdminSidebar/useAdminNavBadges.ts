'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiBase } from '@/services/api';
import { fetchAdminOrderStats } from '@/services/adminOrderService';

export interface AdminNavBadges {
    menuCount: number | null;
    pendingOrderCount: number | null;
}

export function useAdminNavBadges(): AdminNavBadges {
    const [menuCount, setMenuCount] = useState<number | null>(null);
    const [pendingOrderCount, setPendingOrderCount] = useState<number | null>(null);

    const fetchBadges = useCallback(async () => {
        try {
            const [statsRes, menusRes] = await Promise.all([
                fetchAdminOrderStats().catch(() => null),
                fetch(`${getApiBase()}/admin/menus`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
            ]);
            if (statsRes != null) {
                setPendingOrderCount(statsRes.pendingCount ?? 0);
            }
            if (menusRes != null && Array.isArray(menusRes.menus)) {
                setMenuCount(menusRes.total ?? menusRes.menus?.length ?? 0);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    return { menuCount, pendingOrderCount };
}
