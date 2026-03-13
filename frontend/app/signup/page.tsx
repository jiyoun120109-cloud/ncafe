'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Coffee, UserPlus, UtensilsCrossed } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import SignupForm from './_components/SignupForm/SignupForm';
import styles from './page.module.css';

export default function SignupPage() {
    const [error, setError] = useState('');
    const { siteName } = useSiteSettings();
    const brandMark = siteName?.charAt(0) ?? 'N';
    const brandText = siteName?.slice(1) ?? 'Cafe';

    return (
        <div className={styles.root}>
            <div className={styles.visual}>
                <div className={styles.visualOverlay} />
                <div className={styles.visualContent}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandMark}>{brandMark}</span>
                        <span className={styles.brandText}>{brandText}</span>
                    </Link>
                    <p className={styles.brandTagline}>Specialty Coffee &amp; Brunch</p>
                    <blockquote className={styles.quote}>
                        &ldquo;Where every cup tells a story&rdquo;
                    </blockquote>
                    <div className={styles.visualStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>12+</span>
                            <span className={styles.statLabel}>원두 종류</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>3,000+</span>
                            <span className={styles.statLabel}>행복한 고객</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>4.9</span>
                            <span className={styles.statLabel}>★ 평점</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.formPanel}>
                <div className={styles.topLinks}>
                    <Link href="/" className={styles.backLink}>
                        ← 홈으로
                    </Link>
                    <Link href="/menus" className={styles.menuLink}>
                        <UtensilsCrossed size={14} />
                        메뉴 보기
                    </Link>
                </div>

                <div className={styles.formWrapper}>
                    <div className={styles.formHeader}>
                        <div className={styles.formIconWrap}>
                            <UserPlus size={28} />
                        </div>
                        <h1 className={styles.formTitle}>{siteName || 'NCafe'}</h1>
                        <p className={styles.formSubtitle}>회원가입</p>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle className={styles.errorIcon} />
                            <span>{error}</span>
                        </div>
                    )}

                    <SignupForm onError={setError} />
                </div>

                <p className={styles.copyright}>© {new Date().getFullYear()} {siteName || 'NCafe'}. All rights reserved.</p>
            </div>
        </div>
    );
}
