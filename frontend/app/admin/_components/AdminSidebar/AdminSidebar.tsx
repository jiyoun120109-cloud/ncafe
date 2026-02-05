'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    FolderOpen,
    Package,
    Settings,
    ShoppingCart,
    Megaphone,
    MessageCircle
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const mainNavItems = [
    { href: '/admin', label: '대시보드', icon: LayoutDashboard },
    { href: '/admin/menus', label: '메뉴 관리', icon: ClipboardList },
    { href: '/admin/categories', label: '카테고리', icon: FolderOpen },
    { href: '/admin/orders', label: '주문 관리', icon: Package, badge: 3 },
    { href: '/admin/settings', label: '설정', icon: Settings },
];

const platformNavItems = [
    { href: '#', label: '공동구매', icon: ShoppingCart, disabled: true },
    { href: '#', label: '마케팅', icon: Megaphone, disabled: true },
    { href: '#', label: '커뮤니티', icon: MessageCircle, disabled: true },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>☕</span>
                    <span className={styles.logoText}>CafeConnect</span>
                </div>

                {/* Cafe Info */}
                <div className={styles.cafeInfo}>
                    <div className={styles.cafeAvatar}>🏠</div>
                    <div className={styles.cafeDetails}>
                        <span className={styles.cafeName}>모먼트 카페</span>
                        <span className={styles.cafeStatus}>영업중</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <div className={styles.navSection}>
                        <p className={styles.navSectionTitle}>메뉴</p>
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                                onClick={onClose}
                            >
                                <item.icon className={styles.navIcon} size={20} />
                                <span>{item.label}</span>
                                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.navSection}>
                        <p className={styles.navSectionTitle}>플랫폼</p>
                        {platformNavItems.map((item) => (
                            <div
                                key={item.label}
                                className={`${styles.navItem} ${item.disabled ? styles.disabled : ''}`}
                            >
                                <item.icon className={styles.navIcon} size={20} />
                                <span>{item.label}</span>
                                {item.disabled && <span className={styles.comingSoon}>준비중</span>}
                            </div>
                        ))}
                    </div>
                </nav>
            </aside>

            {/* Mobile Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
            />
        </>
    );
}
