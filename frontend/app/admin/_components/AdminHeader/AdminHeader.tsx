'use client';

import { motion } from 'framer-motion';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
    const { toggleSidebar, title } = useUIStore();
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
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={styles.iconButton}
                >
                    <Bell size={20} />
                    <span className={styles.notificationBadge} />
                </motion.button>

                <motion.div
                    whileHover={{ backgroundColor: 'var(--color-gray-50)' }}
                    className={styles.profile}
                >
                    <div className={styles.profileAvatar}>👤</div>
                    <span className={styles.profileName}>사장님</span>
                    <ChevronDown size={16} />
                </motion.div>
            </div>
        </header>
    );
}
