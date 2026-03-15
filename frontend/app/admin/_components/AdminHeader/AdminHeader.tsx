'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { logoutApi } from '@/services/authService';
import { clearCartSessionId } from '@/services/cartService';
import styles from './AdminHeader.module.css';

function getSectionForPath(pathname: string): string {
    if (!pathname || pathname === '/admin') return 'Content';
    if (pathname.startsWith('/admin/notices') || pathname.startsWith('/admin/inquiries')) return 'Customer Service';
    if (pathname.startsWith('/admin/rag') || pathname.startsWith('/admin/settings')) return 'Settings';
    if (pathname.startsWith('/admin/menus') || pathname.startsWith('/admin/categories') || pathname.startsWith('/admin/members') || pathname.startsWith('/admin/orders')) return 'Content';
    return 'Content';
}

export default function AdminHeader() {
    const pathname = usePathname();
    const { toggleSidebar, title } = useUIStore();
    const section = useMemo(() => getSectionForPath(pathname ?? ''), [pathname]);
    const displayTitle = title ? `${section} · ${title}` : section;
    const { user, clearUser } = useAuthStore();
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
                <h1 className={styles.pageTitle}>{displayTitle}</h1>
            </div>

            <div className={styles.right}>
                <Link href="/user?tab=notifications" className={styles.iconButtonLink} aria-label="알림">
                    <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={styles.iconButton}>
                        <Bell size={20} />
                        <span className={styles.notificationBadge} />
                    </motion.span>
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

                <Link href="/" className={styles.profileLink} aria-label="메인으로 이동">
                    <div className={styles.profile}>
                        <div className={styles.profileAvatar}>
                            {user?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className={styles.profileName}>
                            {user?.name ?? user?.username ?? '관리자'}
                        </span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
