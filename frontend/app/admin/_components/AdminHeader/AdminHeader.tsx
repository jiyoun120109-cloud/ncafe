'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { logoutApi } from '@/services/authService';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
    const { toggleSidebar, title } = useUIStore();
    const { user, clearUser } = useAuthStore();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutApi();
            clearUser();
            router.push('/login');
        } catch {
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
                <h1 className={styles.pageTitle}>{title}</h1>
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

                <Link href="/user" className={styles.profileLink} aria-label="마이페이지">
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
