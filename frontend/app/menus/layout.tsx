'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, ArrowLeft } from 'lucide-react';
import HeaderAuth from '@/components/HeaderAuth';
import styles from './layout.module.css';

export default function MenusLayout({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isDetail = pathname !== '/menus';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className={styles.root}>
            {/* ── 헤더 ── */}
            <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
                <div className={styles.headerInner}>
                    <Link href="/" className={`${styles.brand} ${scrolled ? styles.brandScrolled : ''}`}>
                        <span className={styles.brandMark}>N</span>
                        <span className={styles.brandText}>Cafe</span>
                    </Link>

                    <nav className={styles.navLinks}>
                        <Link href="/#features" className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`}>
                            About
                        </Link>
                        <Link href="/menus" className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''} ${!isDetail ? styles.navLinkActive : ''}`}>
                            Menu
                        </Link>
                        <Link href="/#about" className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`}>
                            Story
                        </Link>
                        <HeaderAuth
                            loginLinkClassName={`${styles.navCta} ${scrolled ? styles.navCtaScrolled : ''}`}
                            authClassName={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`}
                        />
                    </nav>
                </div>
            </header>

            {/* ── 페이지 히어로 배너 ── */}
            <div className={styles.heroBanner}>
                <div className={styles.heroBannerOverlay} />
                <div className={styles.heroBannerContent}>
                    {isDetail ? (
                        <Link href="/menus" className={styles.backLink}>
                            <ArrowLeft size={16} />
                            메뉴로 돌아가기
                        </Link>
                    ) : (
                        <>
                            <span className={styles.bannerLabel}>
                                <Coffee size={14} />
                                Our Menu
                            </span>
                            <h1 className={styles.bannerTitle}>
                                <span className={styles.bannerTitleSerif}>Crafted with</span>
                                <br />
                                <span className={styles.bannerTitleSans}>passion &amp; care</span>
                            </h1>
                            <p className={styles.bannerDesc}>
                                신선한 재료로 매일 정성껏 준비하는 NCafe의 메뉴를 만나보세요
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* ── 바디 (aside + main) ── */}
            <div className={styles.body}>
                {children}
            </div>

            {/* ── 푸터 ── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <span className={styles.footerBrandMark}>N</span>Cafe
                    </div>
                    <p className={styles.footerCopy}>© 2024 NCafe. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
