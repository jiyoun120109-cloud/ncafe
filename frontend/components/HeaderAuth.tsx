'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getMeApi, logoutApi } from '@/services/authService';
import styles from './HeaderAuth.module.css';

type HeaderAuthProps = {
    /** 비로그인 시 로그인 링크에 적용할 클래스 */
    loginLinkClassName?: string;
    /** 로그인 시 사용자명·로그아웃 버튼에 적용할 클래스 */
    authClassName?: string;
};

/**
 * 헤더용 로그인 상태 표시
 * - 마운트 시 세션 확인 후 로그인 시 사용자명 + 로그아웃, 비로그인 시 로그인 링크 표시
 */
export default function HeaderAuth({ loginLinkClassName = '', authClassName = '' }: HeaderAuthProps) {
    const router = useRouter();
    const { user, setUser, clearUser } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const u = await getMeApi();
            if (cancelled) return;
            if (u) setUser(u);
            setChecked(true);
        }
        load();
        return () => { cancelled = true; };
    }, [setUser]);

    const handleLogout = async () => {
        await logoutApi();
        clearUser();
        router.refresh();
    };

    if (!checked) {
        return (
            <span className={`${styles.placeholder} ${authClassName}`.trim()}>...</span>
        );
    }

    if (user) {
        return (
            <span className={styles.wrapper}>
                <span className={`${styles.userName} ${authClassName}`.trim()}>
                    {user.name || user.username}
                </span>
                <button
                    type="button"
                    onClick={handleLogout}
                    className={`${styles.logoutBtn} ${authClassName}`.trim()}
                >
                    로그아웃
                </button>
            </span>
        );
    }

    return (
        <Link href="/login" className={loginLinkClassName}>
            로그인
        </Link>
    );
}
