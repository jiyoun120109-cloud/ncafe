'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, ArrowLeft, Menu, X, ShoppingCart } from 'lucide-react';
import HeaderAuth from '@/components/HeaderAuth';
import HeaderCart from '@/components/HeaderCart';
import { useCart } from '@/contexts/CartContext';
import styles from './layout.module.css';

export default function MenusLayout({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const isDetail = pathname !== '/menus';
    const { totalQuantity } = useCart();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className={styles.root}>
            {/* ── 헤더 ── */}
            <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''} ${mobileMenuOpen ? styles.headerMobileOpen : ''}`}>
                <div className={styles.headerInner}>
                    <Link href="/" className={`${styles.brand} ${scrolled ? styles.brandScrolled : ''}`}>
                        <span className={styles.brandMark}>N</span>
                        <span className={styles.brandText}>Cafe</span>
                    </Link>

                    <div className={styles.headerRight}>
                        {isMobile && (
                            <Link
                                href="/cart"
                                className={`${styles.cartIconBtn} ${scrolled ? styles.cartIconBtnScrolled : ''}`}
                                aria-label={`장바구니 ${totalQuantity > 0 ? `총 ${totalQuantity}개` : ''}`}
                            >
                                <ShoppingCart size={22} strokeWidth={1.8} />
                                {totalQuantity > 0 && (
                                    <span className={styles.cartIconBadge} aria-hidden>
                                        {totalQuantity > 99 ? '99+' : totalQuantity}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            type="button"
                            className={styles.navMobileTrigger}
                            onClick={() => setMobileMenuOpen((o) => !o)}
                            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    <nav className={styles.navLinks}>
                        <Link href="/#features" className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`} onClick={closeMobileMenu}>
                            About
                        </Link>
                        <Link href="/menus" className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''} ${!isDetail ? styles.navLinkActive : ''}`} onClick={closeMobileMenu}>
                            Menu
                        </Link>
                        <Link href="/#about" className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`} onClick={closeMobileMenu}>
                            Story
                        </Link>
                        <HeaderCart
                            className={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`}
                            scrolled={scrolled}
                            textOnly={isMobile}
                        />
                        <span className={styles.navAuthWrap}>
                            <HeaderAuth
                                loginLinkClassName={`${styles.navCta} ${scrolled ? styles.navCtaScrolled : ''}`}
                                authClassName={`${styles.navLink} ${scrolled ? styles.navLinkScrolled : ''}`}
                            />
                        </span>
                    </nav>
                </div>
            </header>

            {/* 모바일 슬라이딩 메뉴: 오버레이 (클릭 시 닫기) */}
            <div
                className={`${styles.navOverlay} ${mobileMenuOpen ? styles.navOverlayOpen : ''}`}
                onClick={closeMobileMenu}
                aria-hidden
            />

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
