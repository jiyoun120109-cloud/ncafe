'use client';

import { usePathname } from 'next/navigation';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import MenusHeroShowcase from './_components/MenusHeroShowcase/MenusHeroShowcase';
import styles from './layout.module.css';

export default function MenusLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { siteName } = useSiteSettings();
    const isDetail = pathname !== '/menus';
    const brandMark = siteName?.charAt(0) ?? 'N';
    const brandText = siteName?.slice(1) ?? 'Cafe';

    return (
        <div className={styles.root}>
            {/* ── 목록: 인기·추천·NEW 쇼케이스 / 디테일: 문구 ── */}
            {isDetail ? (
                <div className={styles.heroBanner}>
                    <div className={styles.heroBannerOverlay} />
                    <div className={styles.heroBannerContent}>
                        <span className={styles.bannerLabel}>Menu</span>
                        <h1 className={styles.bannerTitle}>
                            <span className={styles.bannerTitleSerif}>A moment of calm,</span>
                            <span className={styles.bannerTitleSans}>a taste to remember</span>
                        </h1>
                        <p className={styles.bannerDesc}>
                            Today&apos;s cup, made with care, is waiting for you.
                        </p>
                    </div>
                </div>
            ) : (
                <MenusHeroShowcase />
            )}

            {/* ── 바디 (aside + main) ── */}
            <div className={styles.body}>
                {children}
            </div>

            {/* ── 푸터 ── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <span className={styles.footerBrandMark}>{brandMark}</span>{brandText}
                    </div>
                    <p className={styles.footerCopy}>© {new Date().getFullYear()} {siteName || 'NCafe'}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
