'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import AdminSidebar from './_components/AdminSidebar/AdminSidebar';
import AdminHeader from './_components/AdminHeader/AdminHeader';
import { useUIStore } from '@/stores/uiStore';
import styles from './layout.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarOpen, setSidebarOpen } = useUIStore();
    const pathname = usePathname();

    return (
        <div className={styles.layout}>
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className={styles.main}>
                <AdminHeader />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={styles.content}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
