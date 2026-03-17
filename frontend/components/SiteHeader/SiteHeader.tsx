'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, FileText, MessageCircle, User, ShoppingCart, Bell, MapPin, Clock, Package, Heart, Ticket } from 'lucide-react';
import HeaderAuth from '@/components/HeaderAuth';
import HeaderCart from '@/components/HeaderCart';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuthStore } from '@/stores/authStore';
import { getUnreadNotificationCount } from '@/services/notificationService';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { totalQuantity } = useCart();
  const { isAuthenticated, sessionChecked } = useAuthStore();
  const { siteName } = useSiteSettings();
  const brandMark = siteName?.charAt(0) || 'N';
  const brandText = siteName?.slice(1) || 'Cafe';
  const [unreadCount, setUnreadCount] = useState(0);
  const isMenus = pathname === '/menus' || pathname.startsWith('/menus/');

  useEffect(() => {
    if (!sessionChecked || !isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    getUnreadNotificationCount().then(setUnreadCount).catch(() => setUnreadCount(0));
  }, [sessionChecked, isAuthenticated, pathname]);
  /** 랜딩(/)이 아닌 페이지에서는 배경이 밝으므로 헤더를 항상 밝은 스타일로 표시 */
  const isLightPage = pathname !== '/';

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

  useEffect(() => {
    setMobileOpen(false);
    setInfoOpen(false);
    setMyPageOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobile && mobileOpen) setMyPageOpen(true);
    if (!mobileOpen) setMyPageOpen(false);
  }, [isMobile, mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const useLightStyle = scrolled || isLightPage;
  const linkClass = (active?: boolean) =>
    `${styles.navLink} ${useLightStyle ? styles.navLinkScrolled : ''} ${active ? styles.navLinkActive : ''}`;

  return (
    <>
      <header
        className={`${styles.header} ${useLightStyle ? styles.headerScrolled : ''} ${mobileOpen ? styles.headerMobileOpen : ''}`}
      >
        <div className={styles.headerInner}>
          <Link href="/" className={`${styles.brand} ${useLightStyle ? styles.brandScrolled : ''}`}>
            <span className={styles.brandMark}>{brandMark}</span>
            <span className={styles.brandText}>{brandText}</span>
          </Link>

          <div className={styles.headerRight}>
            {isMobile && (
            <Link
              href="/cart"
              className={`${styles.cartIconBtn} ${useLightStyle ? styles.cartIconBtnScrolled : ''}`}
                aria-label={`장바구니 ${totalQuantity > 0 ? totalQuantity : ''}`}
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
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className={styles.navLinks}>
            <Link href="/#about" className={linkClass()} onClick={closeMobile}>
              About
            </Link>

            <div
              className={`${styles.infoWrap} ${infoOpen ? styles.infoWrapOpen : ''}`}
              onMouseEnter={() => !mobileOpen && setInfoOpen(true)}
              onMouseLeave={() => setInfoOpen(false)}
            >
              <button
                type="button"
                className={linkClass()}
                onClick={() => setInfoOpen((o) => !o)}
                aria-expanded={infoOpen}
                aria-haspopup="true"
              >
                Info
                <ChevronDown size={14} className={styles.infoChevron} />
              </button>
              <div className={`${styles.infoDropdown} ${infoOpen ? styles.infoDropdownOpen : ''}`}>
                <Link href="/location" className={styles.infoItem} onClick={closeMobile}>
                  <MapPin size={16} />
                  매장 위치
                </Link>
                <Link href="/#visit" className={styles.infoItem} onClick={closeMobile}>
                  <Clock size={16} />
                  영업시간
                </Link>
                <Link href="/notices" className={styles.infoItem} onClick={closeMobile}>
                  <FileText size={16} />
                  공지사항
                </Link>
                <Link href="/inquiries" className={styles.infoItem} onClick={closeMobile}>
                  <MessageCircle size={16} />
                  1:1 문의
                </Link>
              </div>
            </div>

            <Link href="/menus" className={linkClass(isMenus)} onClick={closeMobile}>
              Menu
            </Link>

            <div
              className={`${styles.infoWrap} ${myPageOpen ? styles.infoWrapOpen : ''}`}
              onMouseEnter={() => !mobileOpen && setMyPageOpen(true)}
              onMouseLeave={() => setMyPageOpen(false)}
            >
              <Link
                href="/user"
                className={linkClass(pathname === '/user' || pathname.startsWith('/user'))}
                onClick={closeMobile}
              >
                <User size={18} />
                마이페이지
                <ChevronDown size={14} className={styles.infoChevron} />
              </Link>
              <div className={`${styles.infoDropdown} ${myPageOpen ? styles.infoDropdownOpen : ''}`}>
                <Link href="/user?tab=profile" className={styles.infoItem} onClick={closeMobile}>
                  <User size={16} />
                  프로필
                </Link>
                <Link href="/user?tab=orders" className={styles.infoItem} onClick={closeMobile}>
                  <Package size={16} />
                  주문내역
                </Link>
                <Link href="/user?tab=favorites" className={styles.infoItem} onClick={closeMobile}>
                  <Heart size={16} />
                  찜
                </Link>
                <Link href="/user?tab=coupons" className={styles.infoItem} onClick={closeMobile}>
                  <Ticket size={16} />
                  쿠폰
                </Link>
              </div>
            </div>

            {isAuthenticated && (
              <Link
                href="/user?tab=notifications"
                className={`${styles.notificationIconBtn} ${useLightStyle ? styles.notificationIconBtnScrolled : ''}`}
                onClick={closeMobile}
                aria-label={unreadCount > 0 ? `알림 ${unreadCount}건` : '알림'}
              >
                <Bell size={20} strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className={styles.notificationIconBadge} aria-hidden>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <HeaderCart
              className={linkClass()}
              scrolled={useLightStyle}
              textOnly={isMobile}
            />
            <span className={styles.navAuthWrap}>
              <HeaderAuth
                loginLinkClassName={`${styles.navCta} ${useLightStyle ? styles.navCtaScrolled : ''}`}
                authClassName={linkClass()}
              />
            </span>
          </nav>
        </div>
      </header>

      <div
        className={`${styles.navOverlay} ${mobileOpen ? styles.navOverlayOpen : ''}`}
        onClick={closeMobile}
        aria-hidden
      />
    </>
  );
}
