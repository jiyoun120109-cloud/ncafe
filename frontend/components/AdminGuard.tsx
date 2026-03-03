'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getMeApi } from '@/services/authService';

const ADMIN_ROLE = 'ADMIN';

interface AdminGuardProps {
    children: React.ReactNode;
}

/**
 * AdminGuard
 *
 * 관리자 페이지 접근 시:
 * - 세션 없음 → /login 리다이렉트
 * - 로그인했지만 role이 ADMIN이 아님 → / 리다이렉트 (권한 없음)
 * - ADMIN만 자식 렌더링
 */
export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const { setUser, clearUser } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function verify() {
            const user = await getMeApi();

            if (cancelled) return;

            if (!user) {
                clearUser();
                router.replace('/login');
                return;
            }

            if (user.role !== ADMIN_ROLE) {
                setUser(user); // 일반 회원은 로그인 상태 유지, 홈으로만 이동
                router.replace('/?error=admin_required');
                return;
            }

            setUser(user);
            setChecked(true);
        }

        verify();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!checked) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#faf9f7',
                color: 'rgba(0,0,0,0.35)',
                fontSize: '0.875rem',
                letterSpacing: '0.06em',
            }}>
                인증 확인 중...
            </div>
        );
    }

    return <>{children}</>;
}
