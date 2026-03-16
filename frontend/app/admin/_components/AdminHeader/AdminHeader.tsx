'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { logoutApi } from '@/services/authService';
import { clearCartSessionId } from '@/services/cartService';
import { getApiBase } from '@/services/api';
import styles from './AdminHeader.module.css';

/** 사이드바 navSectionTitle과 동일한 구분만 표시 (헤더에는 navItem 제목 미표시) */
function getSectionTitleForPath(pathname: string): string {
    if (!pathname || pathname === '/admin') return '콘텐츠';
    if (pathname.startsWith('/admin/notices') || pathname.startsWith('/admin/inquiries')) return '고객지원';
    if (pathname.startsWith('/admin/rag') || pathname.startsWith('/admin/settings')) return '세팅';
    if (pathname.startsWith('/admin/menus') || pathname.startsWith('/admin/categories') || pathname.startsWith('/admin/members') || pathname.startsWith('/admin/orders')) return '콘텐츠';
    return '콘텐츠';
}

export default function AdminHeader() {
    const pathname = usePathname();
    const { toggleSidebar } = useUIStore();
    const displayTitle = useMemo(() => getSectionTitleForPath(pathname ?? ''), [pathname]);
    const { user, profileImageUrl, clearUser } = useAuthStore();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutApi();
            clearCartSessionId();
            clearUser();
            router.push('/login');
        } catch {
            clearCartSessionId();
            clearUser();
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={styles.menuButton}
                    onClick={toggleSidebar}
                >
                    <Menu size={24} />
                </motion.button>
                <h1 className={styles.pageTitle} aria-label="현재 섹션">{displayTitle}</h1>
            </div>

            <div className={styles.right}>
                <Link href="/" className={styles.profileLink} aria-label="메인으로 이동">
                    <div className={styles.profile}>
                        <div className={styles.profileAvatar}>
                            {profileImageUrl ? (
                                <img
                                    src={`${getApiBase()}/static/${profileImageUrl}`}
                                    alt=""
                                    className={styles.profileAvatarImg}
                                />
                            ) : (
                                <span>{user?.username?.[0]?.toUpperCase() ?? '?'}</span>
                            )}
                        </div>
                        <span className={styles.profileName}>
                            {user?.name ?? user?.username ?? '관리자'}
                            {user?.role === 'ADMIN' && <span className={styles.adminBadge}>관리자</span>}
                        </span>
                    </div>
                </Link>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.logoutButton}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <LogOut size={16} />
                    <span>{isLoggingOut ? '처리중...' : '로그아웃'}</span>
                </motion.button>
            </div>
        </header>
    );
}
