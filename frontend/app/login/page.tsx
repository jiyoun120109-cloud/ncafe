'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Coffee, UtensilsCrossed } from 'lucide-react';
import LoginForm from './_components/LoginForm/LoginForm';
import styles from './page.module.css';

export default function LoginPage() {
    const [error, setError] = useState('');

    return (
        <div className={styles.root}>
            {/* ── 왼쪽: 배경 비주얼 패널 ── */}
            <div className={styles.visual}>
                <div className={styles.visualOverlay} />
                <div className={styles.visualContent}>
                    <Link href="/" className={styles.brand}>
                        <span className={styles.brandMark}>N</span>
                        <span className={styles.brandText}>Cafe</span>
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
                        <h1 className={styles.formTitle}>NCafe</h1>
                        <p className={styles.formSubtitle}>관리자 로그인</p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle className={styles.errorIcon} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <LoginForm onError={setError} />
                </div>

                <p className={styles.copyright}>© 2024 NCafe. All rights reserved.</p>
            </div>
        </div>
    );
}
