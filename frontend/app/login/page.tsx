'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Coffee, UtensilsCrossed } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import LoginForm from './_components/LoginForm/LoginForm';
import styles from './page.module.css';

function LoginPageContent() {
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered') === '1';
    const returnUrl = searchParams.get('returnUrl') || '';
    const { siteName } = useSiteSettings();
    const brandMark = siteName?.charAt(0) ?? 'N';
    const brandText = siteName?.slice(1) ?? 'Cafe';

    return (
        <div className={styles.root}>
            {/* ── 왼쪽: 배경 비주얼 패널 ── */}
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

            {/* ── 오른쪽: 로그인 폼 패널 ── */}
            <div className={styles.formPanel}>
                {/* 상단 링크 */}
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
                    {/* 헤더 */}
                    <div className={styles.formHeader}>
                        <div className={styles.formIconWrap}>
                            <Coffee size={28} />
                        </div>
                        <h1 className={styles.formTitle}>{siteName || 'NCafe'}</h1>
                        <p className={styles.formSubtitle}>로그인</p>
                    </div>

                    {/* 회원가입 완료 안내 */}
                    {registered && (
                        <div className={styles.successMessage}>
                            <CheckCircle className={styles.successIcon} />
                            <span>회원가입이 완료되었습니다. 로그인해주세요.</span>
                        </div>
                    )}
                    {/* 에러 메시지 */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle className={styles.errorIcon} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <LoginForm onError={setError} returnUrl={returnUrl} />
                </div>

                <p className={styles.copyright}>© {new Date().getFullYear()} {siteName || 'NCafe'}. All rights reserved.</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className={styles.root} aria-busy="true" />}>
            <LoginPageContent />
        </Suspense>
    );
}
