'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    Settings,
    ShoppingCart,
    Megaphone,
    MessageCircle,
    BookOpen,
    Users,
} from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const contentNavItemsBase: NavItem[] = [
    { href: '/admin',         label: '대시보드',   icon: LayoutDashboard },
    { href: '/admin/menus',   label: '메뉴 관리',   icon: ClipboardList },
    { href: '/admin/members', label: '회원 관리',   icon: Users },
    { href: '/admin/orders',  label: '주문 관리',   icon: Package },
];
const supportNavItems: NavItem[] = [
    { href: '/admin/notices',   label: '공지사항', icon: Megaphone },
    { href: '/admin/inquiries', label: '1:1 문의', icon: MessageCircle },
];
const settingsNavItems: NavItem[] = [
    { href: '/admin/rag',      label: 'RAG 관리', icon: BookOpen },
    { href: '/admin/settings', label: '설정',     icon: Settings },
];

const platformNavItems = [
    { href: '#', label: '공동구매', icon: ShoppingCart, disabled: true },
    { href: '#', label: '마케팅',   icon: Megaphone,    disabled: true },
    { href: '#', label: '커뮤니티', icon: MessageCircle, disabled: true },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { siteName } = useSiteSettings();
    const logoMark = siteName?.charAt(0) ?? 'N';
    const logoText = siteName?.slice(1) ?? 'Cafe';

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <>
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                {/* 브랜드 로고 */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoMark}>{logoMark}</span>
                    <span className={styles.logoText}>{logoText}</span>
                </Link>
                <p className={styles.logoSub}>Admin Console</p>

                {/* 네비게이션 */}
                <nav className={styles.nav}>
                    <div className={styles.navSection}>
                        <p className={styles.navSectionTitle}>콘텐츠</p>
                        {contentNavItemsBase.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                                onClick={onClose}
                            >
                                <item.icon className={styles.navIcon} size={16} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className={styles.navSection}>
                        <p className={styles.navSectionTitle}>고객지원</p>
                        {supportNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                                onClick={onClose}
                            >
                                <item.icon className={styles.navIcon} size={16} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className={styles.navSection}>
                        <p className={styles.navSectionTitle}>세팅</p>
                        {settingsNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                                onClick={onClose}
                            >
                                <item.icon className={styles.navIcon} size={16} />
                                <span>{item.label}</span>
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
                                <item.icon className={styles.navIcon} size={16} />
                                <span>{item.label}</span>
                                {item.disabled && (
                                    <span className={styles.comingSoon}>준비중</span>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>© {new Date().getFullYear()} {siteName || 'NCafe'}</div>
            </aside>

            {/* 모바일 오버레이 */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={onClose}
            />
        </>
    );
}
