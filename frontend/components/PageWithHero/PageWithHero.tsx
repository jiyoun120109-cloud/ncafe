'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './PageWithHero.module.css';

interface PageWithHeroProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  /** 마이페이지 등 넓은 콘텐츠용 main max-width 오버라이드 */
  mainClassName?: string;
  /** true면 main을 화면 너비 2/3(66.666vw)로 넓게 사용 (공지·문의 등) */
  wideMain?: boolean;
  children: React.ReactNode;
}

export default function PageWithHero({
  title,
  subtitle,
  backHref,
  backLabel = '목록',
  mainClassName,
  wideMain,
  children,
}: PageWithHeroProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroInner}>
          {backHref && (
            <Link href={backHref} className={styles.backLink}>
              <ChevronLeft size={18} />
              {backLabel}
            </Link>
          )}
          <h1 className={styles.heroTitle}>{title}</h1>
          {subtitle && <p className={styles.heroSub}>{subtitle}</p>}
        </div>
      </div>
      <main className={[styles.main, wideMain && styles.mainWide, mainClassName].filter(Boolean).join(' ')}>{children}</main>
    </div>
  );
}
