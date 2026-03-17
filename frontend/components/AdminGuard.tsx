'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const ADMIN_ROLE = 'ADMIN';

interface AdminGuardProps {
    children: React.ReactNode;
}

/**
 * AdminGuard
 *
 * AuthProvider가 세션을 채운 뒤에만 판단합니다.
 * - sessionChecked 전 → 인증 확인 중 로딩
 * - 세션 없음 → /login 리다이렉트
 * - 로그인했지만 role이 ADMIN이 아님 → / 리다이렉트 (권한 없음)
 * - ADMIN만 자식 렌더링
 */
export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const { user, sessionChecked } = useAuthStore();

    useEffect(() => {
        if (!sessionChecked) return;
        if (!user) {
            router.replace('/login');
            return;
        }
        if (user.role !== ADMIN_ROLE) {
            router.replace('/?error=admin_required');
        }
    }, [sessionChecked, user, router]);

    if (!sessionChecked) {
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

    if (!user || user.role !== ADMIN_ROLE) {
        return null;
    }

    return <>{children}</>;
}
