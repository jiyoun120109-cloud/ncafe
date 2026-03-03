'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import styles from './page.module.css';

const stats = [
    { label: 'Orders Today',   value: '12',         sub: '+3 from yesterday' },
    { label: 'Revenue Today',  value: '₩154,000',   sub: '+12% from yesterday' },
    { label: 'Sold Out',       value: '2',          sub: 'Requires attention', alert: true },
    { label: 'Visitors',       value: '38',         sub: '+5 from yesterday' },
];

export default function AdminDashboardPage() {
    const { setTitle } = useUIStore();
    useEffect(() => { setTitle('Dashboard'); }, [setTitle]);

    return (
        <div className={styles.page}>
            {/* 페이지 헤더 */}
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Overview</p>
                <h2 className={styles.pageTitle}>Dashboard</h2>
            </div>

            {/* 통계 그리드 */}
            <div className={styles.statsGrid}>
                {stats.map((s) => (
                    <div key={s.label} className={`${styles.statCard} ${s.alert ? styles.statAlert : ''}`}>
                        <p className={styles.statLabel}>{s.label}</p>
                        <p className={styles.statValue}>{s.value}</p>
                        <p className={styles.statSub}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* 구분선 */}
            <div className={styles.divider} />

            {/* 빠른 링크 */}
            <div className={styles.quickLinks}>
                <p className={styles.pageLabel}>Quick Actions</p>
                <div className={styles.quickGrid}>
                    {[
                        { href: '/admin/menus/new', label: 'Add Menu Item' },
                        { href: '/admin/menus',     label: 'Manage Menus' },
                        { href: '/admin/orders',    label: 'View Orders' },
                    ].map((link) => (
                        <a key={link.href} href={link.href} className={styles.quickLink}>
                            <span>{link.label}</span>
                            <span className={styles.quickArrow}>→</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
