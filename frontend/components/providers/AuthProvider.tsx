'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getMeApi } from '@/services/authService';

/**
 * 앱 마운트 시 세션을 한 번 확인하고 스토어를 채웁니다.
 * 보호된 페이지는 sessionChecked가 true가 된 뒤에만 리다이렉트를 판단하므로
 * 새로고침 시 로그인 상태가 유지됩니다.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, clearUser } = useAuthStore();

    useEffect(() => {
        let cancelled = false;
        getMeApi().then((u) => {
            if (cancelled) return;
            if (u) setUser(u);
            else clearUser();
        }).catch(() => {
            if (!cancelled) clearUser();
        });
        return () => { cancelled = true; };
    }, [setUser, clearUser]);

    return <>{children}</>;
}
