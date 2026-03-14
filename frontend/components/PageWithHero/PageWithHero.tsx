'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './PageWithHero.module.css';

interface PageWithHeroProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export default function PageWithHero({
  title,
  subtitle,
  backHref,
  backLabel = '목록',
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
      <main className={styles.main}>{children}</main>
    </div>
  );
}
